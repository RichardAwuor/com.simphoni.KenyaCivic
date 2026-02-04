import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

// Import route registration functions
import { registerAgentRoutes } from './routes/agents.js';
import { registerIncidentRoutes } from './routes/incidents.js';
import { registerFormRoutes } from './routes/forms.js';
import { registerReportRoutes } from './routes/reports.js';
import { registerPollingStationRoutes } from './routes/polling-stations.js';
import { registerOnedriveImportRoutes } from './routes/onedrive-import.js';
import { registerLocationRoutes } from './routes/locations.js';

// Combine schemas for full database type support
const schema = { ...appSchema, ...authSchema };

// Create application with schema
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable authentication and storage
app.withAuth();
app.withStorage();

// Register routes - use registration functions to avoid circular dependencies
registerAgentRoutes(app);
registerIncidentRoutes(app);
registerFormRoutes(app);
registerReportRoutes(app);
registerPollingStationRoutes(app);
registerOnedriveImportRoutes(app);
registerLocationRoutes(app);

await app.run();
app.logger.info('Electoral reporting system running');
