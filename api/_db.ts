// Shared DB connection for Vercel serverless functions
import { DataAPIClient } from '@datastax/astra-db-ts';

// Type definitions for our collections
export interface UserMetrics {
  userId: string;
  dailyLimit: number;
  chatsUsed: number;
  isPro: boolean;
  lastUpdated: string;
  createdAt?: string;
  lastPurchase?: string;
}

export interface ChatMessage {
  userId: string;
  sessionId: string;
  message: string;
  response: string;
  timestamp: string;
  type?: 'user' | 'bot' | 'system' | 'purchase';
  metadata?: {
    credits?: number;
    amount?: number;
    context?: any;
  };
}

export interface EmailDoc {
  userId: string;
  email: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
}

if (!process.env.ASTRA_DB_APPLICATION_TOKEN || !process.env.ASTRA_DB_ENDPOINT) {
  throw new Error('Missing Astra DB environment variables');
}

// Initialize the client
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_ENDPOINT);

// Export collections with type definitions
export const userMetricsCollection = db.collection<UserMetrics>('user_metrics');
export const chatHistoryCollection = db.collection<ChatMessage>('chat_history');
export const emailCollection = db.collection<EmailDoc>('emails');
export const scheduledEmailCollection = db.collection<EmailDoc>('scheduled_emails');
export const templateUsageCollection = db.collection('template_usage');

// Test connection and verify collections
(async () => {
  try {
    const colls = await db.listCollections();
    console.log('Connected to AstraDB:', colls);
    
    // Verify we can query each collection
    const testQueries = await Promise.all([
      userMetricsCollection.find({}).limit(1).toArray(),
      chatHistoryCollection.find({}).limit(1).toArray(),
      emailCollection.find({}).limit(1).toArray(),
      scheduledEmailCollection.find({}).limit(1).toArray(),
      templateUsageCollection.find({}).limit(1).toArray()
    ]);
    
    console.log('All collections are accessible');
  } catch (error) {
    console.error('Failed to connect to AstraDB:', error);
  }
})();
