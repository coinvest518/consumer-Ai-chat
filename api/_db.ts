// Shared DB connection for Vercel serverless functions
import { DataAPIClient } from '@datastax/astra-db-ts';

const client = new DataAPIClient();
export const db = client.db(process.env.ASTRA_DB_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!
});

export const userMetricsCollection = db.collection('user_metrics');
export const chatHistoryCollection = db.collection('chat_history');
export const emailCollection = db.collection('emails');
export const scheduledEmailCollection = db.collection('scheduled_emails');
export const templateUsageCollection = db.collection('template_usage');
