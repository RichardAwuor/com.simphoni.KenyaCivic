import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, inArray, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerReportRoutes(app: App) {
  /**
   * GET /api/reports/candidate-tallies
   * Get aggregated votes by candidate across all forms
   */
  app.fastify.get('/api/reports/candidate-tallies', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    app.logger.info({}, 'Fetching candidate tallies');

    try {
      const allCandidates = await app.db.query.candidateResults.findMany();

      // Group by candidate and sum votes
      const tallyMap = new Map<string, any>();

      for (const candidate of allCandidates) {
        const key = `${candidate.candidateFirstName}|${candidate.candidateLastName}|${candidate.partyName}`;
        if (!tallyMap.has(key)) {
          tallyMap.set(key, {
            firstName: candidate.candidateFirstName,
            lastName: candidate.candidateLastName,
            partyName: candidate.partyName,
            totalVotes: 0,
          });
        }
        const entry = tallyMap.get(key)!;
        entry.totalVotes += candidate.votes;
      }

      const tallies = Array.from(tallyMap.values()).sort((a, b) => b.totalVotes - a.totalVotes);

      app.logger.info({ candidateCount: tallies.length }, 'Candidate tallies fetched successfully');

      return { tallies };
    } catch (error) {
      app.logger.error({ err: error }, 'Failed to fetch candidate tallies');
      return reply.status(500).send({ error: 'Failed to fetch candidate tallies' });
    }
  });

  /**
   * GET /api/reports/candidate-tallies-by-county
   * Get candidate tallies filtered by county
   */
  app.fastify.get('/api/reports/candidate-tallies-by-county', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { countyCode } = request.query as any;

    if (!countyCode) {
      app.logger.warn({}, 'Missing countyCode parameter');
      return reply.status(400).send({ error: 'Missing countyCode parameter' });
    }

    app.logger.info({ countyCode }, 'Fetching candidate tallies by county');

    try {
      // Get forms for the county
      const forms = await app.db.query.form34aSubmissions.findMany({
        where: eq(schema.form34aSubmissions.countyCode, countyCode),
      });

      const formIds = forms.map(f => f.id);

      if (formIds.length === 0) {
        app.logger.info({ countyCode }, 'No forms found for county');
        return { tallies: [] };
      }

      // Get candidate results for those forms
      const candidates = await app.db.query.candidateResults.findMany({
        where: inArray(schema.candidateResults.form34aId, formIds),
      });

      // Group by candidate and sum votes
      const tallyMap = new Map<string, any>();

      for (const candidate of candidates) {
        const key = `${candidate.candidateFirstName}|${candidate.candidateLastName}|${candidate.partyName}`;
        if (!tallyMap.has(key)) {
          tallyMap.set(key, {
            firstName: candidate.candidateFirstName,
            lastName: candidate.candidateLastName,
            partyName: candidate.partyName,
            totalVotes: 0,
          });
        }
        const entry = tallyMap.get(key)!;
        entry.totalVotes += candidate.votes;
      }

      const tallies = Array.from(tallyMap.values()).sort((a, b) => b.totalVotes - a.totalVotes);

      app.logger.info({
        countyCode,
        candidateCount: tallies.length,
        formCount: formIds.length,
      }, 'County candidate tallies fetched successfully');

      return { tallies, countyCode, formCount: formIds.length };
    } catch (error) {
      app.logger.error({ err: error, countyCode }, 'Failed to fetch county candidate tallies');
      return reply.status(500).send({ error: 'Failed to fetch candidate tallies' });
    }
  });

  /**
   * GET /api/reports/serial-discrepancies
   * Get serial number discrepancies with optional filters
   */
  app.fastify.get('/api/reports/serial-discrepancies', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { countyCode, constituencyCode, wardCode } = request.query as any;

    app.logger.info({
      countyCode,
      constituencyCode,
      wardCode,
    }, 'Fetching serial discrepancies');

    try {
      let discrepancies = await app.db.query.serialNumberDiscrepancies.findMany();

      // Apply filters
      if (countyCode) {
        discrepancies = discrepancies.filter(d => d.countyCode === countyCode);
      }
      if (constituencyCode) {
        discrepancies = discrepancies.filter(d => d.constituencyCode === constituencyCode);
      }
      if (wardCode) {
        discrepancies = discrepancies.filter(d => d.wardCode === wardCode);
      }

      app.logger.info({
        count: discrepancies.length,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Serial discrepancies fetched successfully');

      return {
        discrepancies: discrepancies.map(d => ({
          id: d.id,
          serialNumber: d.serialNumber,
          countyCode: d.countyCode,
          constituencyCode: d.constituencyCode,
          wardCode: d.wardCode,
          discrepancyType: d.discrepancyType,
          relatedFormCount: Array.isArray(d.relatedFormIds) ? d.relatedFormIds.length : 0,
          detectedAt: d.detectedAt,
        })),
        count: discrepancies.length,
      };
    } catch (error) {
      app.logger.error({
        err: error,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Failed to fetch serial discrepancies');
      return reply.status(500).send({ error: 'Failed to fetch serial discrepancies' });
    }
  });

  /**
   * GET /api/reports/missing-submissions
   * Get polling stations with no Form 34A submissions
   */
  app.fastify.get('/api/reports/missing-submissions', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { countyCode, constituencyCode, wardCode } = request.query as any;

    app.logger.info({
      countyCode,
      constituencyCode,
      wardCode,
    }, 'Fetching missing submissions');

    try {
      // Get all polling stations
      let pollingStations = await app.db.query.pollingStations.findMany();

      // Apply filters to stations
      if (countyCode) {
        pollingStations = pollingStations.filter(p => p.countyCode === countyCode);
      }
      if (constituencyCode) {
        pollingStations = pollingStations.filter(p => p.constituencyCode === constituencyCode);
      }
      if (wardCode) {
        pollingStations = pollingStations.filter(p => p.wardCode === wardCode);
      }

      // Get all submitted forms
      const submittedForms = await app.db.query.form34aSubmissions.findMany();
      const submittedStationCodes = new Set(submittedForms.map(f => f.pollingStationCode).filter(Boolean));

      // Find missing submissions
      const missing = pollingStations.filter(ps => !submittedStationCodes.has(ps.pollingStationCode));

      app.logger.info({
        totalStations: pollingStations.length,
        missingCount: missing.length,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Missing submissions fetched successfully');

      return {
        missingStations: missing.map(s => ({
          id: s.id,
          pollingStationCode: s.pollingStationCode,
          pollingStationName: s.pollingStationName,
          countyCode: s.countyCode,
          countyName: s.countyName,
          constituencyCode: s.constituencyCode,
          constituencyName: s.constituencyName,
          wardCode: s.wardCode,
          wardName: s.wardName,
          registeredVoters: s.registeredVoters,
        })),
        count: missing.length,
        totalStations: pollingStations.length,
      };
    } catch (error) {
      app.logger.error({
        err: error,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Failed to fetch missing submissions');
      return reply.status(500).send({ error: 'Failed to fetch missing submissions' });
    }
  });

  /**
   * GET /api/reports/extra-submissions
   * Get agent codes not matched with valid polling stations
   */
  app.fastify.get('/api/reports/extra-submissions', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { countyCode, constituencyCode, wardCode } = request.query as any;

    app.logger.info({
      countyCode,
      constituencyCode,
      wardCode,
    }, 'Fetching extra submissions');

    try {
      // Get all forms
      let forms = await app.db.query.form34aSubmissions.findMany();

      // Apply filters
      if (countyCode) {
        forms = forms.filter(f => f.countyCode === countyCode);
      }
      if (constituencyCode) {
        forms = forms.filter(f => f.constituencyCode === constituencyCode);
      }
      if (wardCode) {
        forms = forms.filter(f => f.wardCode === wardCode);
      }

      // Get all polling stations
      let stations = await app.db.query.pollingStations.findMany();

      if (countyCode) {
        stations = stations.filter(s => s.countyCode === countyCode);
      }
      if (constituencyCode) {
        stations = stations.filter(s => s.constituencyCode === constituencyCode);
      }
      if (wardCode) {
        stations = stations.filter(s => s.wardCode === wardCode);
      }

      const stationCodes = new Set(stations.map(s => s.pollingStationCode));

      // Find extra submissions (forms without matching stations)
      const extra = forms.filter(f =>
        f.pollingStationCode && !stationCodes.has(f.pollingStationCode)
      );

      app.logger.info({
        extraCount: extra.length,
        totalForms: forms.length,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Extra submissions fetched successfully');

      return {
        extraSubmissions: extra.map(f => ({
          formId: f.id,
          agentCode: f.agentCode,
          serialNumber: f.serialNumber,
          pollingStationCode: f.pollingStationCode,
          pollingStationName: f.pollingStationName,
          countyCode: f.countyCode,
          constituencyCode: f.constituencyCode,
          wardCode: f.wardCode,
          submittedAt: f.submittedAt,
        })),
        count: extra.length,
      };
    } catch (error) {
      app.logger.error({
        err: error,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Failed to fetch extra submissions');
      return reply.status(500).send({ error: 'Failed to fetch extra submissions' });
    }
  });

  /**
   * GET /api/reports/duplicate-submissions
   * Get duplicate submissions (same polling station or serial number)
   */
  app.fastify.get('/api/reports/duplicate-submissions', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { countyCode, constituencyCode, wardCode } = request.query as any;

    app.logger.info({
      countyCode,
      constituencyCode,
      wardCode,
    }, 'Fetching duplicate submissions');

    try {
      // Get all forms
      let forms = await app.db.query.form34aSubmissions.findMany();

      // Apply filters
      if (countyCode) {
        forms = forms.filter(f => f.countyCode === countyCode);
      }
      if (constituencyCode) {
        forms = forms.filter(f => f.constituencyCode === constituencyCode);
      }
      if (wardCode) {
        forms = forms.filter(f => f.wardCode === wardCode);
      }

      const duplicates: any[] = [];
      const seen = new Map<string | null, typeof forms>();

      // Group by polling station code
      for (const form of forms) {
        const stationCode = form.pollingStationCode as string | null;
        if (stationCode) {
          if (!seen.has(stationCode)) {
            seen.set(stationCode, []);
          }
          const stationForms = seen.get(stationCode)!;
          stationForms.push(form);
        }
      }

      // Find duplicates
      for (const [stationCode, stationForms] of seen) {
        if (stationCode && stationForms.length > 1) {
          duplicates.push({
            pollingStationCode: stationCode,
            count: stationForms.length,
            formIds: stationForms.map(f => f.id),
            agentCodes: stationForms.map(f => f.agentCode),
          });
        }
      }

      // Also check for duplicate serial numbers
      const serialMap = new Map<string, typeof forms>();
      for (const form of forms) {
        const serialNum = form.serialNumber as string;
        if (!serialMap.has(serialNum)) {
          serialMap.set(serialNum, []);
        }
        const serialForms = serialMap.get(serialNum)!;
        serialForms.push(form);
      }

      const serialDuplicates: any[] = [];
      for (const [serialNumber, serialForms] of serialMap) {
        if (serialForms.length > 1) {
          serialDuplicates.push({
            serialNumber,
            count: serialForms.length,
            formIds: serialForms.map(f => f.id),
            agentCodes: serialForms.map(f => f.agentCode),
          });
        }
      }

      app.logger.info({
        stationDuplicates: duplicates.length,
        serialDuplicates: serialDuplicates.length,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Duplicate submissions fetched successfully');

      return {
        stationDuplicates: duplicates,
        serialDuplicates,
        totalDuplicates: duplicates.length + serialDuplicates.length,
      };
    } catch (error) {
      app.logger.error({
        err: error,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Failed to fetch duplicate submissions');
      return reply.status(500).send({ error: 'Failed to fetch duplicate submissions' });
    }
  });
}
