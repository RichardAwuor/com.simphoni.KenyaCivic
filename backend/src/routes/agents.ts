import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import * as authSchema from '../db/auth-schema.js';
import { hashNationalId, isValidNationalId, isValidEmail } from '../lib/encryption.js';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

export function registerAgentRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * POST /api/agents/register
   * PUBLIC - Register a new agent with email/password and create user account
   * Accepts: { email, confirmEmail, firstName, lastName, countyCode, countyName, constituencyCode, constituencyName, wardCode, wardName, dateOfBirth, nationalId, password }
   */
  app.fastify.post('/api/agents/register', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
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
      password,
    } = request.body as any;

    app.logger.info({
      email,
      countyCode,
      constituencyCode,
      wardCode,
    }, 'Registering new agent with account creation');

    // Validation
    if (!email || !confirmEmail || email !== confirmEmail) {
      app.logger.warn({ email }, 'Email confirmation mismatch');
      return reply.status(400).send({ error: 'Email confirmation mismatch' });
    }

    if (!isValidEmail(email)) {
      app.logger.warn({ email }, 'Invalid email format');
      return reply.status(400).send({ error: 'Invalid email format' });
    }

    if (!firstName || !lastName || !countyCode || !countyName || !constituencyCode || !constituencyName || !wardCode || !wardName || !dateOfBirth || !nationalId || !password) {
      app.logger.warn({ body: request.body }, 'Missing required fields');
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    if (!isValidNationalId(nationalId)) {
      app.logger.warn({ nationalId }, 'Invalid national ID format');
      return reply.status(400).send({ error: 'Invalid national ID format' });
    }

    if (!password || password.length < 8) {
      app.logger.warn({}, 'Password must be at least 8 characters');
      return reply.status(400).send({ error: 'Password must be at least 8 characters' });
    }

    try {
      // Check if email is already used in agents table
      const emailExistsInAgents = await app.db.query.agents.findFirst({
        where: eq(schema.agents.email, email),
      });

      if (emailExistsInAgents) {
        app.logger.warn({ email }, 'Email already registered as agent');
        return reply.status(409).send({ error: 'Email already registered' });
      }

      // Check if user already exists with this email
      const existingUser = await app.db.query.user.findFirst({
        where: eq(authSchema.user.email, email),
      });

      if (existingUser) {
        app.logger.warn({ email }, 'Email already registered as user');
        return reply.status(409).send({ error: 'Email already registered' });
      }

      // Create user account using Better Auth via direct database insert
      // Note: In production, use Better Auth API endpoints for user creation with proper password hashing
      const userId = randomUUID();
      const newUser = await app.db.insert(authSchema.user).values({
        id: userId,
        name: `${firstName} ${lastName}`,
        email,
        emailVerified: false,
      }).returning();

      if (!newUser || newUser.length === 0) {
        app.logger.error({ email }, 'Failed to create user account');
        return reply.status(500).send({ error: 'Failed to create user account' });
      }

      // Create account record with hashed password
      const accountId = randomUUID();
      const passwordHash = await bcrypt.hash(password, 10);

      await app.db.insert(authSchema.account).values({
        id: accountId,
        userId: newUser[0].id,
        accountId: email, // Use email as account identifier
        providerId: 'credential', // Email/password provider
        password: passwordHash,
      });

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
        userId: newUser[0].id,
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
        userId: newUser[0].id,
      }, 'Agent and user account created successfully');

      return {
        agentCode: newAgent[0].agentCode,
        userId: newUser[0].id,
        email: newAgent[0].email,
        firstName: newAgent[0].firstName,
        lastName: newAgent[0].lastName,
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
   * POST /api/agents/biometric-login
   * PUBLIC - Login with email and biometric verification
   * Accepts: { email }
   * Returns session token and user info if biometric is enabled
   */
  app.fastify.post('/api/agents/biometric-login', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { email } = request.body as any;

    app.logger.info({ email }, 'Attempting biometric login');

    try {
      if (!email || !isValidEmail(email)) {
        app.logger.warn({ email }, 'Invalid email for biometric login');
        return reply.status(400).send({ error: 'Invalid email address' });
      }

      // Find agent by email
      const agent = await app.db.query.agents.findFirst({
        where: eq(schema.agents.email, email),
      });

      if (!agent) {
        app.logger.warn({ email }, 'Agent not found for biometric login');
        return reply.status(404).send({ error: 'Agent not found' });
      }

      // Check if biometric is enabled
      if (!agent.biometricEnabled) {
        app.logger.warn({ email, agentId: agent.id }, 'Biometric not enabled for agent');
        return reply.status(403).send({ error: 'Biometric authentication not enabled for this agent' });
      }

      // Get user for session creation
      const user = await app.db.query.user.findFirst({
        where: eq(authSchema.user.id, agent.userId),
      });

      if (!user) {
        app.logger.error({ email, userId: agent.userId }, 'User not found for biometric login');
        return reply.status(500).send({ error: 'User account not found' });
      }

      // Create session token
      // In a production setup, this would use Better Auth's session API
      const sessionToken = randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const newSession = await app.db.insert(authSchema.session).values({
        id: randomUUID(),
        token: sessionToken,
        userId: user.id,
        expiresAt,
      }).returning();

      app.logger.info({
        email,
        agentId: agent.id,
        userId: user.id,
      }, 'Biometric login successful');

      return {
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        agent: {
          agentCode: agent.agentCode,
          biometricEnabled: agent.biometricEnabled,
        },
      };
    } catch (error) {
      app.logger.error({ err: error, email }, 'Failed to process biometric login');
      return reply.status(500).send({ error: 'Failed to process biometric login' });
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
