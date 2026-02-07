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
   * PUBLIC - Bulk import polling station data with flexible format
   * Accepts: { pollingStations: [{ countyCode, countyName, constituencyCode, constituencyName, wardCode, wardName, pollingStationCode?, pollingStationName?, registeredVoters? }] }
   * - For records WITHOUT pollingStationCode, creates placeholder stations
   * - For records WITH pollingStationCode, uses the provided data
   * - Skips duplicates (pollingStationCode already exists)
   */
  app.fastify.post('/api/polling-stations/bulk-import', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> => {
    const { pollingStations } = request.body as any;

    app.logger.info({
      stationCount: pollingStations?.length || 0,
    }, 'Starting bulk import of polling stations');

    try {
      if (!Array.isArray(pollingStations) || pollingStations.length === 0) {
        app.logger.warn({}, 'Invalid or empty pollingStations array');
        return reply.status(400).send({
          success: false,
          imported: 0,
          skipped: 0,
          message: 'Invalid or empty pollingStations array',
        });
      }

      // Validate and prepare stations
      const stationsToImport: any[] = [];
      const validationErrors: string[] = [];

      for (let i = 0; i < pollingStations.length; i++) {
        const record = pollingStations[i];
        const rowNumber = i + 1;

        // Validate required location fields
        if (!record.countyCode || !record.countyName || !record.constituencyCode ||
          !record.constituencyName || !record.wardCode || !record.wardName) {
          validationErrors.push(`Row ${rowNumber}: Missing required location fields (countyCode, countyName, constituencyCode, constituencyName, wardCode, wardName)`);
          continue;
        }

        // If pollingStationCode is provided, use the complete record
        if (record.pollingStationCode && record.pollingStationName) {
          stationsToImport.push({
            countyCode: record.countyCode,
            countyName: record.countyName,
            constituencyCode: record.constituencyCode,
            constituencyName: record.constituencyName,
            wardCode: record.wardCode,
            wardName: record.wardName,
            pollingStationCode: record.pollingStationCode,
            pollingStationName: record.pollingStationName,
            registeredVoters: record.registeredVoters || 0,
          });
        } else {
          // Create placeholder polling station for location-only records
          const placeholderCode = `${record.countyCode}${record.constituencyCode}${record.wardCode}001`;
          const placeholderName = `${record.wardName} - Default Station`;

          stationsToImport.push({
            countyCode: record.countyCode,
            countyName: record.countyName,
            constituencyCode: record.constituencyCode,
            constituencyName: record.constituencyName,
            wardCode: record.wardCode,
            wardName: record.wardName,
            pollingStationCode: placeholderCode,
            pollingStationName: placeholderName,
            registeredVoters: 0,
          });
        }
      }

      if (validationErrors.length > 0) {
        app.logger.warn({
          errorCount: validationErrors.length,
          errors: validationErrors.slice(0, 10), // Log first 10 errors
        }, 'Validation errors in bulk import');
        return reply.status(400).send({
          success: false,
          imported: 0,
          skipped: 0,
          message: `Validation failed: ${validationErrors.length} record(s) with errors`,
          errors: validationErrors,
        });
      }

      // Import stations
      let importedCount = 0;
      let skippedCount = 0;
      const importErrors: string[] = [];

      for (const station of stationsToImport) {
        try {
          // Check if station already exists
          const existing = await app.db.query.pollingStations.findFirst({
            where: eq(schema.pollingStations.pollingStationCode, station.pollingStationCode),
          });

          if (existing) {
            // Skip duplicate
            skippedCount++;
            app.logger.debug(
              { pollingStationCode: station.pollingStationCode },
              'Skipping duplicate polling station'
            );
          } else {
            // Insert new station
            await app.db.insert(schema.pollingStations).values({
              countyCode: station.countyCode,
              countyName: station.countyName,
              constituencyCode: station.constituencyCode,
              constituencyName: station.constituencyName,
              wardCode: station.wardCode,
              wardName: station.wardName,
              pollingStationCode: station.pollingStationCode,
              pollingStationName: station.pollingStationName,
              registeredVoters: station.registeredVoters,
            });

            importedCount++;
            app.logger.debug(
              { pollingStationCode: station.pollingStationCode },
              'Polling station imported'
            );
          }
        } catch (error: any) {
          skippedCount++;
          const errorMsg = `Station ${station.pollingStationCode}: ${error?.message || 'Unknown error'}`;
          app.logger.warn({ err: error, pollingStationCode: station.pollingStationCode }, errorMsg);
          importErrors.push(errorMsg);
        }
      }

      app.logger.info({
        imported: importedCount,
        skipped: skippedCount,
        total: stationsToImport.length,
        errorCount: importErrors.length,
      }, 'Bulk import completed');

      return {
        success: importErrors.length === 0,
        imported: importedCount,
        skipped: skippedCount,
        message: `Successfully imported ${importedCount} polling stations (${skippedCount} skipped)`,
        errors: importErrors.length > 0 ? importErrors : undefined,
      };
    } catch (error: any) {
      app.logger.error({ err: error }, 'Bulk import failed');
      return reply.status(500).send({
        success: false,
        imported: 0,
        skipped: 0,
        message: `Bulk import failed: ${error?.message || 'Unknown error'}`,
      });
    }
  });
}
