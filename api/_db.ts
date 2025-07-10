// Shared DB connection for Vercel serverless functions
import { DataAPIClient } from '@datastax/astra-db-ts';

if (!process.env.ASTRA_DB_APPLICATION_TOKEN || !process.env.ASTRA_DB_ENDPOINT) {
  throw new Error('Missing Astra DB environment variables');
}

// Initialize the client
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_ENDPOINT);

// Export collections
export const userMetricsCollection = db.collection('user_metrics');
export const chatHistoryCollection = db.collection('chat_history');
export const emailCollection = db.collection('emails');
export const scheduledEmailCollection = db.collection('scheduled_emails');
export const templateUsageCollection = db.collection('template_usage');

// Test connection on startup
(async () => {
  try {
    const colls = await db.listCollections();
    console.log('Connected to AstraDB:', colls);
  } catch (error) {
    console.error('Failed to connect to AstraDB:', error);
  }
})();
