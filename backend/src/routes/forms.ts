import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const FormExtractionSchema = z.object({
  serialNumber: z.string().describe('The serial number from Form 34A'),
  candidates: z.array(z.object({
    firstName: z.string().describe('Candidate first name'),
    lastName: z.string().describe('Candidate last name'),
    partyName: z.string().describe('Political party name'),
    votes: z.number().describe('Number of votes received'),
  })).describe('List of candidates and their vote counts'),
});

export function registerFormRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * POST /api/forms/upload-34a
   * Upload Form 34A image and extract data using GPT vision
   */
  app.fastify.post('/api/forms/upload-34a', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Starting Form 34A upload');

    try {
      const data = await request.file({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit
      if (!data) {
        app.logger.warn({}, 'No form image provided');
        return reply.status(400).send({ error: 'No form image provided' });
      }

      const { agentId } = request.body as any;

      // Validate required fields
      if (!agentId) {
        app.logger.warn({}, 'Missing agentId');
        return reply.status(400).send({ error: 'Missing agentId' });
      }

      // Verify agent ownership
      const agent = await app.db.query.agents.findFirst({
        where: eq(schema.agents.id, agentId),
      });

      if (!agent) {
        app.logger.warn({ agentId }, 'Agent not found');
        return reply.status(404).send({ error: 'Agent not found' });
      }

      if (agent.userId !== session.user.id) {
        app.logger.warn({ agentId, userId: session.user.id }, 'Unauthorized agent access');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      // Check if agent already submitted a form
      const existingForm = await app.db.query.form34aSubmissions.findFirst({
        where: eq(schema.form34aSubmissions.agentId, agentId),
      });

      if (existingForm) {
        app.logger.warn({ agentId }, 'Agent already submitted Form 34A');
        return reply.status(409).send({ error: 'Agent has already submitted Form 34A' });
      }

      // Upload image to storage
      const buffer = await data.toBuffer();
      const storageKey = `forms/34a/${agentId}/${Date.now()}-${data.filename}`;
      await app.storage.upload(storageKey, buffer);
      const { url: formImageUrl } = await app.storage.getSignedUrl(storageKey);

      app.logger.info({ agentId, storageKey }, 'Form image uploaded to storage');

      // Extract data using GPT-4 Vision
      app.logger.info({ agentId }, 'Extracting form data with GPT vision');

      const imageBase64 = buffer.toString('base64');

      let extractedData;
      try {
        const result = await generateObject({
          model: openai('gpt-4o'),
          schema: FormExtractionSchema,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  image: `data:image/${getImageType(data.filename)};base64,${imageBase64}`,
                },
                {
                  type: 'text',
                  text: 'Extract the serial number and all candidate names (first and last name), party names, and vote counts from this Form 34A image. Be precise with the data.',
                },
              ],
            },
          ],
        });

        extractedData = result.object;
        app.logger.info({
          agentId,
          serialNumber: extractedData.serialNumber,
          candidateCount: extractedData.candidates.length,
        }, 'Form data extracted successfully');
      } catch (ocrError) {
        app.logger.error({
          err: ocrError,
          agentId,
        }, 'Failed to extract form data with GPT vision');
        return reply.status(422).send({ error: 'Failed to extract form data. Please ensure the image is clear.' });
      }

      // Validate serial number format
      if (!extractedData.serialNumber || extractedData.serialNumber.trim() === '') {
        app.logger.warn({ agentId }, 'Serial number not extracted from form');
        return reply.status(422).send({ error: 'Could not extract serial number from form' });
      }

      // Check for serial number discrepancies
      const duplicateSerialNumber = await app.db.query.form34aSubmissions.findFirst({
        where: eq(schema.form34aSubmissions.serialNumber, extractedData.serialNumber),
      });

      let discrepancies: any[] = [];

      if (duplicateSerialNumber) {
        app.logger.warn({
          agentId,
          serialNumber: extractedData.serialNumber,
          duplicateFormId: duplicateSerialNumber.id,
        }, 'Duplicate serial number detected');

        // Create discrepancy record
        const discrepancyRecord = await app.db.insert(schema.serialNumberDiscrepancies).values({
          serialNumber: extractedData.serialNumber,
          countyCode: agent.countyCode,
          constituencyCode: agent.constituencyCode,
          wardCode: agent.wardCode,
          discrepancyType: 'duplicate',
          relatedFormIds: [duplicateSerialNumber.id],
        }).returning();

        discrepancies.push({
          type: 'duplicate_serial_number',
          message: 'This serial number has already been submitted',
          relatedFormId: duplicateSerialNumber.id,
        });
      }

      // Create form submission record
      const newForm = await app.db.insert(schema.form34aSubmissions).values({
        agentId,
        agentCode: agent.agentCode,
        formImageUrl,
        serialNumber: extractedData.serialNumber,
        countyCode: agent.countyCode,
        constituencyCode: agent.constituencyCode,
        wardCode: agent.wardCode,
        ocrProcessed: true,
      }).returning();

      app.logger.info({
        formId: newForm[0].id,
        agentId,
        serialNumber: extractedData.serialNumber,
      }, 'Form 34A submitted successfully');

      // Create candidate results records
      const candidateRecords = await Promise.all(
        extractedData.candidates.map(candidate =>
          app.db.insert(schema.candidateResults).values({
            form34aId: newForm[0].id,
            candidateFirstName: candidate.firstName,
            candidateLastName: candidate.lastName,
            partyName: candidate.partyName,
            votes: candidate.votes,
          }).returning()
        )
      );

      app.logger.info({
        formId: newForm[0].id,
        candidateCount: candidateRecords.length,
      }, 'Candidate results recorded');

      return {
        formId: newForm[0].id,
        serialNumber: extractedData.serialNumber,
        candidates: extractedData.candidates,
        discrepancies,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to upload Form 34A');
      return reply.status(500).send({ error: 'Failed to upload Form 34A' });
    }
  });

  /**
   * GET /api/forms/agent-form/:agentId
   * Get Form 34A submission for specific agent
   */
  app.fastify.get('/api/forms/agent-form/:agentId', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { agentId } = request.params as any;

    app.logger.info({ agentId, userId: session.user.id }, 'Fetching agent Form 34A');

    try {
      // Verify agent ownership
      const agent = await app.db.query.agents.findFirst({
        where: eq(schema.agents.id, agentId),
      });

      if (!agent) {
        app.logger.warn({ agentId }, 'Agent not found');
        return reply.status(404).send({ error: 'Agent not found' });
      }

      if (agent.userId !== session.user.id) {
        app.logger.warn({ agentId, userId: session.user.id }, 'Unauthorized agent access');
        return reply.status(403).send({ error: 'Unauthorized' });
      }

      const form = await app.db.query.form34aSubmissions.findFirst({
        where: eq(schema.form34aSubmissions.agentId, agentId),
      });

      if (!form) {
        app.logger.info({ agentId }, 'Form 34A not found for agent');
        return reply.status(404).send({ error: 'Form 34A not found' });
      }

      // Get candidate results for this form
      const candidates = await app.db.query.candidateResults.findMany({
        where: eq(schema.candidateResults.form34aId, form.id),
      });

      app.logger.info({
        formId: form.id,
        candidateCount: candidates.length,
      }, 'Agent Form 34A fetched successfully');

      return {
        id: form.id,
        agentCode: form.agentCode,
        serialNumber: form.serialNumber,
        countyCode: form.countyCode,
        constituencyCode: form.constituencyCode,
        wardCode: form.wardCode,
        pollingStationCode: form.pollingStationCode,
        pollingStationName: form.pollingStationName,
        candidates: candidates.map(c => ({
          firstName: c.candidateFirstName,
          lastName: c.candidateLastName,
          partyName: c.partyName,
          votes: c.votes,
        })),
        submittedAt: form.submittedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, agentId }, 'Failed to fetch agent Form 34A');
      return reply.status(500).send({ error: 'Failed to fetch agent Form 34A' });
    }
  });

  /**
   * GET /api/forms/by-agent-code/:agentCode
   * Get form by agent code
   */
  app.fastify.get('/api/forms/by-agent-code/:agentCode', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { agentCode } = request.params as any;

    app.logger.info({ agentCode }, 'Fetching form by agent code');

    try {
      const form = await app.db.query.form34aSubmissions.findFirst({
        where: eq(schema.form34aSubmissions.agentCode, agentCode),
      });

      if (!form) {
        app.logger.info({ agentCode }, 'Form not found for agent code');
        return reply.status(404).send({ error: 'Form not found' });
      }

      // Get candidate results
      const candidates = await app.db.query.candidateResults.findMany({
        where: eq(schema.candidateResults.form34aId, form.id),
      });

      app.logger.info({
        formId: form.id,
        agentCode,
      }, 'Form by agent code fetched successfully');

      return {
        id: form.id,
        agentCode: form.agentCode,
        serialNumber: form.serialNumber,
        countyCode: form.countyCode,
        constituencyCode: form.constituencyCode,
        wardCode: form.wardCode,
        pollingStationCode: form.pollingStationCode,
        pollingStationName: form.pollingStationName,
        candidates: candidates.map(c => ({
          firstName: c.candidateFirstName,
          lastName: c.candidateLastName,
          partyName: c.partyName,
          votes: c.votes,
        })),
        submittedAt: form.submittedAt,
      };
    } catch (error) {
      app.logger.error({ err: error, agentCode }, 'Failed to fetch form by agent code');
      return reply.status(500).send({ error: 'Failed to fetch form' });
    }
  });
}

/**
 * Helper function to get image type from filename
 */
function getImageType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    jpg: 'jpeg',
    jpeg: 'jpeg',
    png: 'png',
    gif: 'gif',
    webp: 'webp',
  };
  return typeMap[extension || 'jpeg'] || 'jpeg';
}
