import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

interface ConstituencyItem {
  code: string;
  name: string;
}

interface WardItem {
  code: string;
  name: string;
}

interface ConstituenciesResponse {
  constituencies: ConstituencyItem[];
}

interface WardsResponse {
  wards: WardItem[];
}

export function registerLocationRoutes(app: App) {
  /**
   * GET /api/locations/constituencies
   * Get unique constituencies for a given county
   */
  app.fastify.get('/api/locations/constituencies', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<ConstituenciesResponse> => {
    const { countyCode } = request.query as any;

    app.logger.info({
      countyCode,
    }, 'Fetching constituencies');

    try {
      // Validate countyCode
      if (!countyCode || typeof countyCode !== 'string') {
        app.logger.warn({}, 'Missing or invalid countyCode');
        return reply.status(400).send({
          error: 'Missing or invalid countyCode query parameter',
        });
      }

      // Fetch all polling stations for the county
      const pollingStations = await app.db.query.pollingStations.findMany({
        where: eq(schema.pollingStations.countyCode, countyCode),
      });

      if (pollingStations.length === 0) {
        app.logger.info({ countyCode }, 'No polling stations found for county');
        return {
          constituencies: [],
        };
      }

      // Extract unique constituencies using Map to preserve order and avoid duplicates
      const constituenciesMap = new Map<string, ConstituencyItem>();
      pollingStations.forEach((station) => {
        if (station.constituencyCode && station.constituencyName) {
          if (!constituenciesMap.has(station.constituencyCode)) {
            constituenciesMap.set(station.constituencyCode, {
              code: station.constituencyCode,
              name: station.constituencyName,
            });
          }
        }
      });

      const constituencies = Array.from(constituenciesMap.values());

      app.logger.info({
        countyCode,
        constituencyCount: constituencies.length,
      }, 'Constituencies fetched successfully');

      return {
        constituencies,
      };
    } catch (error) {
      app.logger.error({
        err: error,
        countyCode,
      }, 'Failed to fetch constituencies');
      return reply.status(500).send({
        error: 'Failed to fetch constituencies',
      });
    }
  });

  /**
   * GET /api/locations/wards
   * Get unique wards for a given county and constituency
   */
  app.fastify.get('/api/locations/wards', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<WardsResponse> => {
    const { countyCode, constituencyCode } = request.query as any;

    app.logger.info({
      countyCode,
      constituencyCode,
    }, 'Fetching wards');

    try {
      // Validate required parameters
      if (!countyCode || typeof countyCode !== 'string') {
        app.logger.warn({}, 'Missing or invalid countyCode');
        return reply.status(400).send({
          error: 'Missing or invalid countyCode query parameter',
        });
      }

      if (!constituencyCode || typeof constituencyCode !== 'string') {
        app.logger.warn({}, 'Missing or invalid constituencyCode');
        return reply.status(400).send({
          error: 'Missing or invalid constituencyCode query parameter',
        });
      }

      // Fetch all polling stations for the county and constituency
      const pollingStations = await app.db.query.pollingStations.findMany({
        where: eq(schema.pollingStations.countyCode, countyCode),
      });

      // Filter by constituency code
      const filteredStations = pollingStations.filter(
        (station) => station.constituencyCode === constituencyCode
      );

      if (filteredStations.length === 0) {
        app.logger.info({
          countyCode,
          constituencyCode,
        }, 'No polling stations found for county and constituency');
        return {
          wards: [],
        };
      }

      // Extract unique wards using Map to preserve order and avoid duplicates
      const wardsMap = new Map<string, WardItem>();
      filteredStations.forEach((station) => {
        if (station.wardCode && station.wardName) {
          if (!wardsMap.has(station.wardCode)) {
            wardsMap.set(station.wardCode, {
              code: station.wardCode,
              name: station.wardName,
            });
          }
        }
      });

      const wards = Array.from(wardsMap.values());

      app.logger.info({
        countyCode,
        constituencyCode,
        wardCount: wards.length,
      }, 'Wards fetched successfully');

      return {
        wards,
      };
    } catch (error) {
      app.logger.error({
        err: error,
        countyCode,
        constituencyCode,
      }, 'Failed to fetch wards');
      return reply.status(500).send({
        error: 'Failed to fetch wards',
      });
    }
  });
}
