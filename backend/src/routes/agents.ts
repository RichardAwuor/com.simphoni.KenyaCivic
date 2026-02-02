import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { hashNationalId, isValidNationalId, isValidEmail } from '../lib/encryption.js';

export function registerAgentRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * POST /api/agents/register
   * Register a new agent with their details
   */
  app.fastify.post('/api/agents/register', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const {
      email,
      confirmEmail,
      firstName,
      lastName,
      countyCode,
      countyName,
      constituencyCode,
      constituencyName,
      wardCode,
      wardName,
      dateOfBirth,
      nationalId,
    } = request.body as any;

    app.logger.info({
      email,
      countyCode,
      constituencyCode,
      wardCode,
    }, 'Registering new agent');

    // Validation
    if (!email || !confirmEmail || email !== confirmEmail) {
      app.logger.warn({ email }, 'Email confirmation mismatch');
      return reply.status(400).send({ error: 'Email confirmation mismatch' });
    }

    if (!isValidEmail(email)) {
      app.logger.warn({ email }, 'Invalid email format');
      return reply.status(400).send({ error: 'Invalid email format' });
    }

    if (!firstName || !lastName || !countyCode || !countyName || !constituencyCode || !constituencyName || !wardCode || !wardName || !dateOfBirth || !nationalId) {
      app.logger.warn({ body: request.body }, 'Missing required fields');
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    if (!isValidNationalId(nationalId)) {
      app.logger.warn({ nationalId }, 'Invalid national ID format');
      return reply.status(400).send({ error: 'Invalid national ID format' });
    }

    try {
      // Check if agent already exists
      const existingAgent = await app.db.query.agents.findFirst({
        where: eq(schema.agents.userId, session.user.id),
      });

      if (existingAgent) {
        app.logger.warn({ userId: session.user.id }, 'Agent already registered for this user');
        return reply.status(409).send({ error: 'Agent already registered for this user' });
      }

      // Check if email is already used
      const emailExists = await app.db.query.agents.findFirst({
        where: eq(schema.agents.email, email),
      });

      if (emailExists) {
        app.logger.warn({ email }, 'Email already registered');
        return reply.status(409).send({ error: 'Email already registered' });
      }

      // Generate unique agent code: COUNTYNAME-CONSTCODE-WARDCODE-SEQUENCE
      // Count existing agents in this ward to generate sequence
      const existingAgentsInWard = await app.db.query.agents.findMany({
        where: eq(schema.agents.wardCode, wardCode),
      });

      const sequence = String(existingAgentsInWard.length + 1).padStart(2, '0');
      const agentCode = `${countyName.toUpperCase()}-${constituencyCode}-${wardCode}-${sequence}`;

      // Hash national ID
      const nationalIdHash = hashNationalId(nationalId);

      // Create agent record
      const newAgent = await app.db.insert(schema.agents).values({
        userId: session.user.id,
        email,
        firstName,
        lastName,
        countyCode,
        countyName,
        constituencyCode,
        constituencyName,
        wardCode,
        wardName,
        dateOfBirth: dateOfBirth,
        nationalIdHash,
        agentCode,
        biometricEnabled: false,
      }).returning();

      app.logger.info({
        agentId: newAgent[0].id,
        agentCode: newAgent[0].agentCode,
        userId: session.user.id,
      }, 'Agent registered successfully');

      return {
        agent: {
          id: newAgent[0].id,
          email: newAgent[0].email,
          firstName: newAgent[0].firstName,
          lastName: newAgent[0].lastName,
          countyName: newAgent[0].countyName,
          constituencyName: newAgent[0].constituencyName,
          wardName: newAgent[0].wardName,
          biometricEnabled: newAgent[0].biometricEnabled,
        },
        agentCode: newAgent[0].agentCode,
      };
    } catch (error) {
      app.logger.error({ err: error, email }, 'Failed to register agent');
      return reply.status(500).send({ error: 'Failed to register agent' });
    }
  });

  /**
   * POST /api/agents/enable-biometric
   * Enable biometric authentication for an agent
   */
  app.fastify.post('/api/agents/enable-biometric', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { agentId } = request.body as any;

    app.logger.info({ agentId, userId: session.user.id }, 'Enabling biometric for agent');

    try {
      // Verify ownership
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

      // Update biometric status
      await app.db.update(schema.agents)
        .set({ biometricEnabled: true })
        .where(eq(schema.agents.id, agentId));

      app.logger.info({ agentId }, 'Biometric enabled successfully');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, agentId }, 'Failed to enable biometric');
      return reply.status(500).send({ error: 'Failed to enable biometric' });
    }
  });

  /**
   * GET /api/agents/profile
   * Get agent profile for authenticated user
   */
  app.fastify.get('/api/agents/profile', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Fetching agent profile');

    try {
      const agent = await app.db.query.agents.findFirst({
        where: eq(schema.agents.userId, session.user.id),
      });

      if (!agent) {
        app.logger.warn({ userId: session.user.id }, 'Agent profile not found');
        return reply.status(404).send({ error: 'Agent profile not found' });
      }

      app.logger.info({ agentId: agent.id }, 'Agent profile fetched successfully');

      return {
        id: agent.id,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        countyCode: agent.countyCode,
        countyName: agent.countyName,
        constituencyCode: agent.constituencyCode,
        constituencyName: agent.constituencyName,
        wardCode: agent.wardCode,
        wardName: agent.wardName,
        dateOfBirth: agent.dateOfBirth,
        agentCode: agent.agentCode,
        biometricEnabled: agent.biometricEnabled,
        createdAt: agent.createdAt,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to fetch agent profile');
      return reply.status(500).send({ error: 'Failed to fetch agent profile' });
    }
  });
}
