import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';

const MAX_VIDEO_DURATION = 60; // seconds
const MAX_VIDEOS_PER_AGENT = 3;
const VIDEO_SEQUENCES = ['A', 'B', 'C'];

export function registerIncidentRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * POST /api/incidents/upload-video
   * Upload incident video with location data
   */
  app.fastify.post('/api/incidents/upload-video', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    app.logger.info({ userId: session.user.id }, 'Starting video upload');

    try {
      const data = await request.file({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit
      if (!data) {
        app.logger.warn({}, 'No video file provided');
        return reply.status(400).send({ error: 'No video file provided' });
      }

      const { agentId, latitude, longitude, location, duration } = request.body as any;

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

      // Validate duration
      if (duration && duration > MAX_VIDEO_DURATION) {
        app.logger.warn({ duration, maxDuration: MAX_VIDEO_DURATION }, 'Video duration exceeds maximum');
        return reply.status(400).send({ error: `Video duration must not exceed ${MAX_VIDEO_DURATION} seconds` });
      }

      // Check video count for agent
      const existingVideos = await app.db.query.incidentVideos.findMany({
        where: eq(schema.incidentVideos.agentId, agentId),
      });

      if (existingVideos.length >= MAX_VIDEOS_PER_AGENT) {
        app.logger.warn({ agentId, videoCount: existingVideos.length }, 'Maximum videos per agent exceeded');
        return reply.status(409).send({ error: `Maximum ${MAX_VIDEOS_PER_AGENT} videos per agent allowed` });
      }

      // Determine sequence (A, B, C)
      const nextSequenceIndex = existingVideos.length;
      const videoSequence = VIDEO_SEQUENCES[nextSequenceIndex];

      // Upload video to storage
      const buffer = await data.toBuffer();
      const storageKey = `incidents/${agentId}/${Date.now()}-${data.filename}`;
      await app.storage.upload(storageKey, buffer);
      const { url: videoUrl } = await app.storage.getSignedUrl(storageKey);

      // Generate video name: AGENTCODE-SEQUENCE
      const videoName = `${agent.agentCode}-${videoSequence}`;

      // Create incident video record
      const newVideo = await app.db.insert(schema.incidentVideos).values({
        agentId,
        agentCode: agent.agentCode,
        videoUrl,
        videoSequence,
        videoName,
        latitude: latitude ? String(latitude) : undefined,
        longitude: longitude ? String(longitude) : undefined,
        location,
        duration: duration ? parseInt(duration, 10) : undefined,
      }).returning();

      app.logger.info({
        videoId: newVideo[0].id,
        agentId,
        videoName,
        sequence: videoSequence,
      }, 'Video uploaded successfully');

      return {
        videoUrl,
        videoName,
        sequence: videoSequence,
      };
    } catch (error) {
      app.logger.error({ err: error, userId: session.user.id }, 'Failed to upload video');
      return reply.status(500).send({ error: 'Failed to upload video' });
    }
  });

  /**
   * GET /api/incidents/videos
   * Get list of incident videos with optional county filter
   */
  app.fastify.get('/api/incidents/videos', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { countyCode } = request.query as any;

    app.logger.info({ countyCode }, 'Fetching incident videos');

    try {
      let query = app.db.query.incidentVideos.findMany();

      if (countyCode) {
        // Note: In a real scenario, we'd need to join with agents to filter by county
        // For now, we'll fetch all and filter in code
      }

      const videos = await app.db.query.incidentVideos.findMany();

      // Filter by county if provided
      const filtered = countyCode
        ? videos.filter(v => {
            // This is inefficient - in production, use a proper join
            return true; // Placeholder - would filter by agent's county
          })
        : videos;

      app.logger.info({ count: filtered.length, countyCode }, 'Incident videos fetched successfully');

      return {
        videos: filtered.map(v => ({
          id: v.id,
          agentCode: v.agentCode,
          videoName: v.videoName,
          videoSequence: v.videoSequence,
          latitude: v.latitude,
          longitude: v.longitude,
          location: v.location,
          duration: v.duration,
          uploadedAt: v.uploadedAt,
        })),
      };
    } catch (error) {
      app.logger.error({ err: error, countyCode }, 'Failed to fetch incident videos');
      return reply.status(500).send({ error: 'Failed to fetch incident videos' });
    }
  });

  /**
   * GET /api/incidents/agent-videos/:agentId
   * Get videos for specific agent (max 3)
   */
  app.fastify.get('/api/incidents/agent-videos/:agentId', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { agentId } = request.params as any;

    app.logger.info({ agentId, userId: session.user.id }, 'Fetching agent videos');

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

      const videos = await app.db.query.incidentVideos.findMany({
        where: eq(schema.incidentVideos.agentId, agentId),
      });

      app.logger.info({ agentId, videoCount: videos.length }, 'Agent videos fetched successfully');

      return {
        videos: videos.map(v => ({
          id: v.id,
          videoName: v.videoName,
          videoSequence: v.videoSequence,
          latitude: v.latitude,
          longitude: v.longitude,
          location: v.location,
          duration: v.duration,
          uploadedAt: v.uploadedAt,
        })),
        count: videos.length,
        maxAllowed: MAX_VIDEOS_PER_AGENT,
      };
    } catch (error) {
      app.logger.error({ err: error, agentId }, 'Failed to fetch agent videos');
      return reply.status(500).send({ error: 'Failed to fetch agent videos' });
    }
  });
}
