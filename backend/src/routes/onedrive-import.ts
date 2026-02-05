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

/**
 * Convert OneDrive sharing link to direct download URL
 * Example: https://1drv.ms/x/s!AHashToken to direct Graph API URL
 */
function convertSharingLinkToDownloadUrl(sharingUrl: string): string {
  // Match OneDrive sharing link pattern
  const match = sharingUrl.match(/https:\/\/(1drv\.ms|onedrive\.live\.com)\/([a-z])\/(.*)/i);
  if (!match) {
    throw new Error(`Invalid OneDrive sharing link format. Expected format: https://1drv.ms/x/s!...`);
  }

  const shareToken = match[3];
  if (!shareToken) {
    throw new Error('Invalid OneDrive sharing link: missing share token');
  }

  // Create base64-encoded share token with "u!" prefix for unauthenticated access
  const encodedToken = Buffer.from(`u!${shareToken}`).toString('base64').replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');

  return `https://graph.microsoft.com/v1.0/shares/${encodedToken}/driveItem/content`;
}

/**
 * Determine if URL is a OneDrive sharing link or direct download URL
 */
function isOneDriveSharingLink(url: string): boolean {
  return /https:\/\/(1drv\.ms|onedrive\.live\.com)\//i.test(url);
}

/**
 * Get detailed error message based on HTTP status code and error response
 */
function getDetailedErrorMessage(error: any, context: string): string {
  const status = error?.response?.status;
  const statusText = error?.response?.statusText;
  const data = error?.response?.data;

  if (status === 401) {
    return `${context}: Unauthorized - Access token is invalid, expired, or does not have permission to access this file`;
  }
  if (status === 403) {
    return `${context}: Access Denied - You do not have permission to access this file`;
  }
  if (status === 404) {
    return `${context}: File Not Found - The file does not exist or has been deleted`;
  }
  if (status === 400) {
    return `${context}: Invalid Request - The file URL or sharing link format is invalid`;
  }
  if (status >= 500) {
    return `${context}: OneDrive service error (${status}) - Please try again later`;
  }

  return `${context}: ${error?.message || 'Unknown error occurred'}`;
}

export function registerOnedriveImportRoutes(app: App) {
  /**
   * POST /api/onedrive/import-excel
   * Import polling stations from OneDrive Excel file
   * Supports both direct download URLs and OneDrive sharing links (1drv.ms)
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
          errors: ['Missing or invalid fileUrl - must be a valid URL string'],
        });
      }

      if (!accessToken || typeof accessToken !== 'string') {
        app.logger.warn({}, 'Missing or invalid accessToken');
        return reply.status(400).send({
          success: false,
          imported: 0,
          failed: 0,
          errors: ['Missing or invalid accessToken - required to download file from OneDrive'],
        });
      }

      // Convert sharing link to direct download URL if needed
      let downloadUrl = fileUrl;
      app.logger.info({ isSharingLink: isOneDriveSharingLink(fileUrl) }, 'Checking URL format');

      if (isOneDriveSharingLink(fileUrl)) {
        try {
          app.logger.info({}, 'Converting OneDrive sharing link to direct download URL');
          downloadUrl = convertSharingLinkToDownloadUrl(fileUrl);
          app.logger.info({}, 'Sharing link converted successfully');
        } catch (error: any) {
          const errorMsg = error.message || 'Failed to convert sharing link';
          app.logger.warn({ err: error, originalUrl: fileUrl }, errorMsg);
          return reply.status(400).send({
            success: false,
            imported: 0,
            failed: 0,
            errors: [errorMsg],
          });
        }
      }

      // Download file from OneDrive
      app.logger.info({}, 'Downloading file from OneDrive');
      let fileBuffer: Buffer;

      try {
        const response = await axios.get(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
          responseType: 'arraybuffer',
        });
        fileBuffer = Buffer.from(response.data);
        app.logger.info({ fileSize: fileBuffer.length }, 'File downloaded successfully');
      } catch (error: any) {
        const errorMsg = getDetailedErrorMessage(error, 'Failed to download file from OneDrive');
        app.logger.error({ err: error, downloadUrl }, errorMsg);
        errors.push(errorMsg);
        return reply.status(error?.response?.status || 400).send({
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
          throw new Error('No sheets found in workbook - file appears to be empty or corrupted');
        }

        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        if (rows.length === 0) {
          throw new Error('No data rows found in Excel file - ensure the spreadsheet contains data rows below the header');
        }

        app.logger.info({ rowCount: rows.length, sheetName }, 'Excel file parsed successfully');
      } catch (error: any) {
        const errorMsg = `Failed to parse Excel file: ${error?.message || 'The file may not be a valid Excel (.xlsx) file or is corrupted'}`;
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
