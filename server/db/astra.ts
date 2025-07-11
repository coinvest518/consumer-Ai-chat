import { DataAPIClient } from "@datastax/astra-db-ts";
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, LegacyUserMetrics, EmailMessage, ScheduledEmail } from '../types';

// Initialize the client with your token
const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
const ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT;

// Add debug logging
console.log('Environment variables loaded:', {
  hasToken: !!ASTRA_DB_APPLICATION_TOKEN,
  hasEndpoint: !!ASTRA_DB_ENDPOINT,
  endpoint: ASTRA_DB_ENDPOINT
});

if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_ENDPOINT) {
  throw new Error("Missing required Astra DB environment variables");
}

// Initialize the client
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
export const astraDb = client.db(ASTRA_DB_ENDPOINT);

// AstraDB configuration
const FLOW_ID = process.env.FLOW_ID!;

// Collection names
const CHAT_HISTORY_COLLECTION = 'chat_history';
const USER_METRICS_COLLECTION = 'user_metrics';
const EMAIL_COLLECTION = 'emails';
const SCHEDULED_EMAIL_COLLECTION = 'scheduled_emails';

export const flowId = FLOW_ID;

// Initialize and check connection
export const initAstra = async () => {
  try {
    const collections = await astraDb.listCollections();
    console.log('Connected to AstraDB:', collections);
    
    // Get collection names as strings
    const collectionNames = collections.map((c: any) => c.name || c);
    
    // Make sure our collections exist
    if (!collectionNames.includes(CHAT_HISTORY_COLLECTION)) {
      await astraDb.createCollection(CHAT_HISTORY_COLLECTION);
      console.log(`Created ${CHAT_HISTORY_COLLECTION} collection`);
    }
    
    if (!collectionNames.includes(USER_METRICS_COLLECTION)) {
      await astraDb.createCollection(USER_METRICS_COLLECTION);
      console.log(`Created ${USER_METRICS_COLLECTION} collection`);
    }
    
    if (!collectionNames.includes(EMAIL_COLLECTION)) {
      await astraDb.createCollection(EMAIL_COLLECTION);
      console.log(`Created ${EMAIL_COLLECTION} collection`);
    }
    
    if (!collectionNames.includes(SCHEDULED_EMAIL_COLLECTION)) {
      await astraDb.createCollection(SCHEDULED_EMAIL_COLLECTION);
      console.log(`Created ${SCHEDULED_EMAIL_COLLECTION} collection`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to AstraDB:', error);
    return false;
  }
};

// Basic test function
export const testConnection = async () => {
  try {
    const collections = await astraDb.listCollections();
    console.log('Test connection successful. Available collections:', collections);
    return true;
  } catch (error) {
    console.error('Test connection failed:', error);
    return false;
  }
};

// Get chat history collection
export const getChatHistoryCollection = async (): Promise<any> => {
  try {
    return astraDb.collection(CHAT_HISTORY_COLLECTION);
  } catch (error) {
    console.error('Error getting chat history collection:', error);
    throw error;
  }
};

// Get user metrics collection
export const getUserMetricsCollection = async (): Promise<any> => {
  try {
    return astraDb.collection(USER_METRICS_COLLECTION);
  } catch (error) {
    console.error('Error getting user metrics collection:', error);
    throw error;
  }
};

// Get email collection
export const getEmailCollection = async () => {
  try {
    return astraDb.collection(EMAIL_COLLECTION);
  } catch (error) {
    console.error('Error getting email collection:', error);
    throw error;
  }
};

// Get scheduled email collection
export const getScheduledEmailCollection = async () => {
  try {
    return astraDb.collection(SCHEDULED_EMAIL_COLLECTION);
  } catch (error) {
    console.error('Error getting scheduled email collection:', error);
    throw error;
  }
};

// Store a chat message
export const storeChatMessage = async (userId: string, sessionId: string, message: ChatMessage) => {
  try {
    const collection = await getChatHistoryCollection();
    const messageId = uuidv4();
    
    // Create complete document for AstraDB
    const chatMessageDoc = {
      _id: messageId,
      userId,
      sessionId,
      timestamp: message.timestamp || new Date().toISOString(),
      type: message.type,
      text: message.text,
      citation: message.citation,
      actions: message.actions,
      title: message.title
    };
    
    await collection.insertOne(chatMessageDoc);
    return messageId;
  } catch (error) {
    console.error('Error storing chat message:', error);
    throw error;
  }
};

interface ChatMessageDoc {
  _id: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  type: string;
  text: string;
  citation?: string;
  actions?: any[];
  title?: string;
}

/**
 * Get chat history for a user
 * @param userId User ID to retrieve chat history for
 * @returns Array of chat message documents from AstraDB
 */
export const getUserChatHistory = async (userId: string): Promise<ChatMessageDoc[]> => {
  try {
    const collection = await getChatHistoryCollection();
    const query = { userId };
    
    const result = await collection.find(query);
    const messages: ChatMessageDoc[] = [];
    for await (const doc of result) {
      messages.push(doc as ChatMessageDoc);
    }
    
    return messages.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error getting user chat history:', error);
    throw error;
  }
};

/**
 * Get messages for a specific chat session
 * @param sessionId Session ID to retrieve messages for
 * @returns Array of chat message documents from AstraDB
 */
export const getChatSessionMessages = async (sessionId: string): Promise<ChatMessageDoc[]> => {
  try {
    const collection = await getChatHistoryCollection();
    const query = { sessionId };
    
    const result = await collection.find(query);
    const messages: ChatMessageDoc[] = [];
    for await (const doc of result) {
      messages.push(doc as ChatMessageDoc);
    }
    
    return messages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error getting chat session messages:', error);
    throw error;
  }
};

// Update user metrics (using legacy format for Astra)
export const updateUserMetrics = async (userId: string, metrics: Partial<LegacyUserMetrics>) => {
  try {
    const collection = await getUserMetricsCollection();
    const existingMetrics = await collection.findOne({ userId });
    
    const now = new Date().toISOString();
    
    if (existingMetrics) {
      // Update existing metrics document
      await collection.updateOne(
        { userId },
        { $set: { ...metrics, updatedAt: now } }
      );
      return true;
    } else {
      // Create a new metrics document with defaults (legacy format)
      const newMetrics: LegacyUserMetrics = {
        userId,
        questionsAsked: metrics.questionsAsked || 0,
        questionsRemaining: metrics.questionsRemaining || 5,
        isPro: metrics.isPro || false,
        createdAt: now,
        updatedAt: now,
        ...metrics
      };
      
      await collection.insertOne({
        _id: userId,
        ...newMetrics
      });
      return true;
    }
  } catch (error) {
    console.error('Error updating user metrics:', error);
    throw error;
  }
};

// Store a new email
export const storeEmail = async (email: EmailMessage) => {
  try {
    const collection = await getEmailCollection();
    const emailId = email._id || uuidv4();
    
    const emailDoc = {
      _id: emailId,
      userId: email.userId,
      sender: email.sender,
      recipients: email.recipients,
      subject: email.subject,
      body: email.body,
      timestamp: email.timestamp || new Date().toISOString(),
      isRead: email.isRead || false,
      labels: email.labels || [],
      metadata: email.metadata || {}
    };
    
    await collection.insertOne(emailDoc);
    return emailId;
  } catch (error) {
    console.error('Error storing email:', error);
    throw error;
  }
};

// Get emails for a user
export const getUserEmails = async (userId: string) => {
  try {
    const collection = await getEmailCollection();
    const query = { userId };
    
    const result = await collection.find(query);
    const emails: EmailMessage[] = [];
    
    for await (const doc of result) {
      emails.push(doc as EmailMessage);
    }
    
    return emails.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error getting user emails:', error);
    throw error;
  }
};

// Schedule an email for future sending
export const scheduleEmail = async (email: ScheduledEmail) => {
  try {
    const collection = await getScheduledEmailCollection();
    const emailId = email._id || uuidv4();
    
    const emailDoc = {
      _id: emailId,
      userId: email.userId,
      recipients: email.recipients,
      subject: email.subject,
      body: email.body,
      scheduledTime: email.scheduledTime,
      status: 'scheduled',
      createdAt: email.createdAt || new Date().toISOString(),
      updatedAt: email.updatedAt || new Date().toISOString()
    };
    
    await collection.insertOne(emailDoc);
    return emailId;
  } catch (error) {
    console.error('Error scheduling email:', error);
    throw error;
  }
};