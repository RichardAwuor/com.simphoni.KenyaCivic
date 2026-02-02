import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerPollingStationRoutes(app: App) {
  /**
   * GET /api/polling-stations
   * Get list of polling stations with optional filters
   */
  app.fastify.get('/api/polling-stations', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { countyCode, constituencyCode, wardCode } = request.query as any;

    app.logger.info({
      countyCode,
      constituencyCode,
      wardCode,
    }, 'Fetching polling stations');

    try {
      let stations = await app.db.query.pollingStations.findMany();

      // Apply filters
      if (countyCode) {
        stations = stations.filter(s => s.countyCode === countyCode);
      }
      if (constituencyCode) {
        stations = stations.filter(s => s.constituencyCode === constituencyCode);
      }
      if (wardCode) {
        stations = stations.filter(s => s.wardCode === wardCode);
      }

      app.logger.info({
        count: stations.length,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Polling stations fetched successfully');

      return {
        stations: stations.map(s => ({
          id: s.id,
          countyCode: s.countyCode,
          countyName: s.countyName,
          constituencyCode: s.constituencyCode,
          constituencyName: s.constituencyName,
          wardCode: s.wardCode,
          wardName: s.wardName,
          pollingStationCode: s.pollingStationCode,
          pollingStationName: s.pollingStationName,
          registeredVoters: s.registeredVoters,
        })),
        count: stations.length,
      };
    } catch (error) {
      app.logger.error({
        err: error,
        countyCode,
        constituencyCode,
        wardCode,
      }, 'Failed to fetch polling stations');
      return reply.status(500).send({ error: 'Failed to fetch polling stations' });
    }
  });

  /**
   * POST /api/polling-stations/bulk-import
   * Bulk import polling station data
   */
  app.fastify.post('/api/polling-stations/bulk-import', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { stations } = request.body as any;

    app.logger.info({
      stationCount: stations?.length || 0,
    }, 'Starting bulk import of polling stations');

    try {
      if (!Array.isArray(stations) || stations.length === 0) {
        app.logger.warn({}, 'Invalid or empty stations array');
        return reply.status(400).send({ error: 'Invalid or empty stations array' });
      }

      // Validate each station
      const validationErrors: string[] = [];
      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        if (!station.countyCode || !station.countyName || !station.constituencyCode ||
          !station.constituencyName || !station.wardCode || !station.wardName ||
          !station.pollingStationCode || !station.pollingStationName ||
          station.registeredVoters === undefined) {
          validationErrors.push(`Row ${i + 1}: Missing required fields`);
        }
      }

      if (validationErrors.length > 0) {
        app.logger.warn({ errors: validationErrors }, 'Validation errors in bulk import');
        return reply.status(400).send({
          error: 'Validation failed',
          details: validationErrors,
        });
      }

      // Insert stations
      const insertedStations: any[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const station of stations) {
        try {
          // Check if station already exists
          const existing = await app.db.query.pollingStations.findFirst({
            where: eq(schema.pollingStations.pollingStationCode, station.pollingStationCode),
          });

          if (existing) {
            // Update existing station
            await app.db.update(schema.pollingStations)
              .set({
                countyCode: station.countyCode,
                countyName: station.countyName,
                constituencyCode: station.constituencyCode,
                constituencyName: station.constituencyName,
                wardCode: station.wardCode,
                wardName: station.wardName,
                pollingStationName: station.pollingStationName,
                registeredVoters: station.registeredVoters,
              })
              .where(eq(schema.pollingStations.pollingStationCode, station.pollingStationCode));
            successCount++;
          } else {
            // Insert new station
            const newStation = await app.db.insert(schema.pollingStations).values({
              countyCode: station.countyCode,
              countyName: station.countyName,
              constituencyCode: station.constituencyCode,
              constituencyName: station.constituencyName,
              wardCode: station.wardCode,
              wardName: station.wardName,
              pollingStationCode: station.pollingStationCode,
              pollingStationName: station.pollingStationName,
              registeredVoters: station.registeredVoters,
            }).returning();

            insertedStations.push(newStation[0]);
            successCount++;
          }
        } catch (error) {
          app.logger.warn({
            err: error,
            stationCode: station.pollingStationCode,
          }, 'Failed to import polling station');
          errorCount++;
        }
      }

      app.logger.info({
        successCount,
        errorCount,
        totalProcessed: stations.length,
      }, 'Bulk import completed');

      return {
        success: errorCount === 0,
        summary: {
          processed: stations.length,
          successful: successCount,
          failed: errorCount,
        },
        insertedStations: insertedStations.length,
      };
    } catch (error) {
      app.logger.error({ err: error }, 'Bulk import failed');
      return reply.status(500).send({ error: 'Bulk import failed' });
    }
  });
}
