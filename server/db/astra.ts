import { DataAPIClient, Collection } from "@datastax/astra-db-ts";
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, UserMetrics } from '../types';

// AstraDB configuration
const ASTRA_TOKEN = process.env.ASTRA_TOKEN!;
const ASTRA_ENDPOINT = process.env.ASTRA_ENDPOINT!;
const FLOW_ID = process.env.FLOW_ID!;

// Collection names
const CHAT_HISTORY_COLLECTION = 'chat_history';
const USER_METRICS_COLLECTION = 'user_metrics';

// Initialize the client
const client = new DataAPIClient(ASTRA_TOKEN);
export const astraDb = client.db(ASTRA_ENDPOINT);
export const flowId = FLOW_ID;

// Initialize and check connection
export const initAstra = async () => {
  try {
    const collections = await astraDb.listCollections();
    console.log('Connected to AstraDB:', collections);
    
    // Get collection names as strings
    const collectionNames = collections.map(c => typeof c === 'string' ? c : c.name);
    
    // Make sure our collections exist
    if (!collectionNames.includes(CHAT_HISTORY_COLLECTION)) {
      try {
        await astraDb.createCollection(CHAT_HISTORY_COLLECTION);
        console.log(`Created ${CHAT_HISTORY_COLLECTION} collection`);
      } catch (err) {
        console.error(`Error creating ${CHAT_HISTORY_COLLECTION} collection:`, err);
      }
    }
    
    if (!collectionNames.includes(USER_METRICS_COLLECTION)) {
      try {
        await astraDb.createCollection(USER_METRICS_COLLECTION);
        console.log(`Created ${USER_METRICS_COLLECTION} collection`);
      } catch (err) {
        console.error(`Error creating ${USER_METRICS_COLLECTION} collection:`, err);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to AstraDB:', error);
    return false;
  }
};

// Get chat history collection
export const getChatHistoryCollection = async (): Promise<Collection> => {
  try {
    return astraDb.collection(CHAT_HISTORY_COLLECTION);
  } catch (error) {
    console.error('Error getting chat history collection:', error);
    throw error;
  }
};

// Get user metrics collection
export const getUserMetricsCollection = async (): Promise<Collection> => {
  try {
    return astraDb.collection(USER_METRICS_COLLECTION);
  } catch (error) {
    console.error('Error getting user metrics collection:', error);
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

/**
 * Get chat history for a user
 * @param userId User ID to retrieve chat history for
 * @returns Array of chat message documents from AstraDB
 */
export const getUserChatHistory = async (userId: string): Promise<any[]> => {
  try {
    const collection = await getChatHistoryCollection();
    const query = { userId };
    
    // Collect all documents from cursor
    const result = await collection.find(query);
    const messages = [];
    for await (const doc of result) {
      messages.push(doc);
    }
    
    // Sort by timestamp descending (newest first)
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
export const getChatSessionMessages = async (sessionId: string): Promise<any[]> => {
  try {
    const collection = await getChatHistoryCollection();
    const query = { sessionId };
    
    // Collect all documents from cursor
    const result = await collection.find(query);
    const messages = [];
    for await (const doc of result) {
      messages.push(doc);
    }
    
    // Sort by timestamp ascending (oldest first) for proper chat flow
    return messages.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error getting chat session messages:', error);
    throw error;
  }
};

// Update user metrics
export const updateUserMetrics = async (userId: string, metrics: Partial<UserMetrics>) => {
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
      // Create a new metrics document with defaults
      const newMetrics: UserMetrics = {
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