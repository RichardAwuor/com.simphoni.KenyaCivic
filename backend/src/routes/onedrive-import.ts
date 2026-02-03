import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import axios from 'axios';
import * as XLSX from 'xlsx';

interface ExcelRow {
  'County Code'?: string;
  'County Name'?: string;
  'Const Code'?: string;
  'Const. Name'?: string;
  'CAW Code'?: string;
  'CAW Name'?: string;
  'Polling Station Code'?: string;
  'Polling Station Name'?: string;
  'Registered Voters'?: number | string;
}

interface ImportRequest {
  fileUrl: string;
  accessToken: string;
}

interface ImportResponse {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export function registerOnedriveImportRoutes(app: App) {
  /**
   * POST /api/onedrive/import-excel
   * Import polling stations from OneDrive Excel file
   */
  app.fastify.post('/api/onedrive/import-excel', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<ImportResponse> => {
    const { fileUrl, accessToken } = request.body as ImportRequest;

    app.logger.info({
      fileUrl,
      hasAccessToken: !!accessToken,
    }, 'Starting OneDrive Excel import');

    const errors: string[] = [];
    let imported = 0;
    let failed = 0;

    try {
      // Validate inputs
      if (!fileUrl || typeof fileUrl !== 'string') {
        app.logger.warn({}, 'Missing or invalid fileUrl');
        return reply.status(400).send({
          success: false,
          imported: 0,
          failed: 0,
          errors: ['Missing or invalid fileUrl'],
        });
      }

      if (!accessToken || typeof accessToken !== 'string') {
        app.logger.warn({}, 'Missing or invalid accessToken');
        return reply.status(400).send({
          success: false,
          imported: 0,
          failed: 0,
          errors: ['Missing or invalid accessToken'],
        });
      }

      // Download file from OneDrive
      app.logger.info({}, 'Downloading file from OneDrive');
      let fileBuffer: Buffer;

      try {
        const response = await axios.get(fileUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
          responseType: 'arraybuffer',
        });
        fileBuffer = Buffer.from(response.data);
        app.logger.info({ fileSize: fileBuffer.length }, 'File downloaded successfully');
      } catch (error: any) {
        const errorMsg = `Failed to download file from OneDrive: ${error?.message || 'Unknown error'}`;
        app.logger.error({ err: error, fileUrl }, errorMsg);
        errors.push(errorMsg);
        return reply.status(400).send({
          success: false,
          imported: 0,
          failed: 0,
          errors,
        });
      }

      // Parse Excel file
      app.logger.info({}, 'Parsing Excel file');
      let workbook: XLSX.WorkBook;
      let rows: ExcelRow[] = [];

      try {
        workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          throw new Error('No sheets found in workbook');
        }

        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        if (rows.length === 0) {
          throw new Error('No data rows found in Excel file');
        }

        app.logger.info({ rowCount: rows.length }, 'Excel file parsed successfully');
      } catch (error: any) {
        const errorMsg = `Failed to parse Excel file: ${error?.message || 'Unknown error'}`;
        app.logger.error({ err: error }, errorMsg);
        errors.push(errorMsg);
        return reply.status(400).send({
          success: false,
          imported: 0,
          failed: 0,
          errors,
        });
      }

      // Validate and import rows
      app.logger.info({ totalRows: rows.length }, 'Starting row processing');

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because Excel starts at 1 and has header

        try {
          // Validate required fields
          const countyCode = row['County Code']?.toString().trim();
          const countyName = row['County Name']?.toString().trim();
          const constituencyCode = row['Const Code']?.toString().trim();
          const constituencyName = row['Const. Name']?.toString().trim();
          const wardCode = row['CAW Code']?.toString().trim();
          const wardName = row['CAW Name']?.toString().trim();
          const pollingStationCode = row['Polling Station Code']?.toString().trim();
          const pollingStationName = row['Polling Station Name']?.toString().trim();
          const registeredVotersRaw = row['Registered Voters'];

          // Validate all required fields are present
          if (
            !countyCode ||
            !countyName ||
            !constituencyCode ||
            !constituencyName ||
            !wardCode ||
            !wardName ||
            !pollingStationCode ||
            !pollingStationName ||
            registeredVotersRaw === undefined ||
            registeredVotersRaw === ''
          ) {
            failed++;
            errors.push(`Row ${rowNumber}: Missing required fields`);
            continue;
          }

          // Parse registered voters as number
          const registeredVoters = parseInt(registeredVotersRaw.toString(), 10);
          if (isNaN(registeredVoters)) {
            failed++;
            errors.push(`Row ${rowNumber}: Invalid 'Registered Voters' value (must be a number)`);
            continue;
          }

          // Check if polling station already exists
          const existing = await app.db.query.pollingStations.findFirst({
            where: eq(schema.pollingStations.pollingStationCode, pollingStationCode),
          });

          if (existing) {
            // Update existing station
            await app.db.update(schema.pollingStations)
              .set({
                countyCode,
                countyName,
                constituencyCode,
                constituencyName,
                wardCode,
                wardName,
                pollingStationName,
                registeredVoters,
              })
              .where(eq(schema.pollingStations.pollingStationCode, pollingStationCode));
          } else {
            // Insert new station
            await app.db.insert(schema.pollingStations).values({
              countyCode,
              countyName,
              constituencyCode,
              constituencyName,
              wardCode,
              wardName,
              pollingStationCode,
              pollingStationName,
              registeredVoters,
            });
          }

          imported++;
          app.logger.debug({ rowNumber, pollingStationCode }, 'Row processed successfully');
        } catch (error: any) {
          failed++;
          const errorMsg = `Row ${rowNumber}: ${error?.message || 'Unknown error'}`;
          app.logger.warn({ err: error, rowNumber }, errorMsg);
          errors.push(errorMsg);
        }
      }

      app.logger.info({
        imported,
        failed,
        total: rows.length,
        errorCount: errors.length,
      }, 'OneDrive Excel import completed');

      return {
        success: failed === 0,
        imported,
        failed,
        errors,
      };
    } catch (error: any) {
      const errorMsg = `Unexpected error during import: ${error?.message || 'Unknown error'}`;
      app.logger.error({ err: error }, errorMsg);
      errors.push(errorMsg);

      return reply.status(500).send({
        success: false,
        imported,
        failed: failed + 1,
        errors,
      });
    }
  });
}
