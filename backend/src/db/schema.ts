import { pgTable, uuid, text, timestamp, decimal, integer, boolean, date, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Electoral Reporting System Schema
 */

/**
 * Agents table - Electoral field agents registered to report from specific polling stations
 */
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(), // Foreign key to Better Auth users table
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  countyCode: text('county_code').notNull(), // 3 digits
  countyName: text('county_name').notNull(),
  constituencyCode: text('constituency_code').notNull(), // 3 digits
  constituencyName: text('constituency_name').notNull(),
  wardCode: text('ward_code').notNull(), // 4 digits
  wardName: text('ward_name').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  nationalIdHash: text('national_id_hash').notNull(), // Encrypted/hashed national ID
  agentCode: text('agent_code').notNull().unique(), // Format: COUNTYNAME-CONSTCODE-WARDCODE-SEQUENCE
  biometricEnabled: boolean('biometric_enabled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: uniqueIndex('agents_user_id_idx').on(table.userId),
  agentCodeIdx: uniqueIndex('agents_agent_code_idx').on(table.agentCode),
  emailIdx: uniqueIndex('agents_email_idx').on(table.email),
}));

/**
 * Incident Videos table - Videos submitted by agents as evidence
 */
export const incidentVideos = pgTable('incident_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  agentCode: text('agent_code').notNull(),
  videoUrl: text('video_url').notNull(), // Signed storage URL
  videoSequence: text('video_sequence').notNull(), // A, B, or C
  videoName: text('video_name').notNull(), // Format: AGENTCODE-SEQUENCE (e.g., MOMBASA-001-0001-01-A)
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  location: text('location'),
  duration: integer('duration'), // in seconds, max 60
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  agentIdIdx: uniqueIndex('incident_videos_agent_id_idx').on(table.agentId),
  agentCodeIdx: uniqueIndex('incident_videos_agent_code_idx').on(table.agentCode),
}));

/**
 * Form 34A Submissions table - Electoral form submissions
 */
export const form34aSubmissions = pgTable('form_34a_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  agentCode: text('agent_code').notNull(),
  formImageUrl: text('form_image_url').notNull(), // Signed storage URL
  serialNumber: text('serial_number').notNull(),
  countyCode: text('county_code').notNull(),
  constituencyCode: text('constituency_code').notNull(),
  wardCode: text('ward_code').notNull(),
  pollingStationCode: text('polling_station_code'),
  pollingStationName: text('polling_station_name'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  ocrProcessed: boolean('ocr_processed').notNull().default(false),
}, (table) => ({
  agentIdIdx: uniqueIndex('form_34a_submissions_agent_id_idx').on(table.agentId),
  serialNumberIdx: uniqueIndex('form_34a_submissions_serial_number_idx').on(table.serialNumber),
  agentCodeIdx: uniqueIndex('form_34a_submissions_agent_code_idx').on(table.agentCode),
}));

/**
 * Candidate Results table - Extracted candidate votes from Form 34A
 */
export const candidateResults = pgTable('candidate_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  form34aId: uuid('form_34a_id').notNull().references(() => form34aSubmissions.id, { onDelete: 'cascade' }),
  candidateFirstName: text('candidate_first_name').notNull(),
  candidateLastName: text('candidate_last_name').notNull(),
  partyName: text('party_name').notNull(),
  votes: integer('votes').notNull(),
  extractedAt: timestamp('extracted_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  form34aIdIdx: uniqueIndex('candidate_results_form_34a_id_idx').on(table.form34aId),
}));

/**
 * Serial Number Discrepancies table - Tracks duplicates and mismatches
 */
export const serialNumberDiscrepancies = pgTable('serial_number_discrepancies', {
  id: uuid('id').primaryKey().defaultRandom(),
  serialNumber: text('serial_number').notNull(),
  countyCode: text('county_code').notNull(),
  constituencyCode: text('constituency_code').notNull(),
  wardCode: text('ward_code').notNull(),
  discrepancyType: text('discrepancy_type').notNull(), // "duplicate", "invalid", "mismatch"
  relatedFormIds: text('related_form_ids').array(), // Array of form IDs with same serial
  detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  serialNumberIdx: uniqueIndex('serial_number_discrepancies_serial_number_idx').on(table.serialNumber),
}));

/**
 * Polling Stations table - Reference data for all polling stations
 */
export const pollingStations = pgTable('polling_stations', {
  id: uuid('id').primaryKey().defaultRandom(),
  countyCode: text('county_code').notNull(),
  countyName: text('county_name').notNull(),
  constituencyCode: text('constituency_code').notNull(),
  constituencyName: text('constituency_name').notNull(),
  wardCode: text('ward_code').notNull(),
  wardName: text('ward_name').notNull(),
  pollingStationCode: text('polling_station_code').notNull().unique(),
  pollingStationName: text('polling_station_name').notNull(),
  registeredVoters: integer('registered_voters').notNull(),
}, (table) => ({
  pollingStationCodeIdx: uniqueIndex('polling_stations_polling_station_code_idx').on(table.pollingStationCode),
  countyCodeIdx: uniqueIndex('polling_stations_county_code_idx').on(table.countyCode),
  constituencyCodeIdx: uniqueIndex('polling_stations_constituency_code_idx').on(table.constituencyCode),
  wardCodeIdx: uniqueIndex('polling_stations_ward_code_idx').on(table.wardCode),
}));
