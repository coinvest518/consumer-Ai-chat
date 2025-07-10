import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatHistoryCollection, userMetricsCollection, ChatMessage } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const {
    query: { userId },
    method,
  } = req;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // First, ensure user exists in metrics
    const userMetrics = await userMetricsCollection.findOne({ userId });
    if (!userMetrics) {
      // Initialize new user
      await userMetricsCollection.insertOne({
        userId,
        dailyLimit: 5,
        chatsUsed: 0,
        isPro: false,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }

    // Get chat history with proper sorting
    const cursor = chatHistoryCollection.find<ChatMessage>(
      { userId },
      { sort: { timestamp: -1 } }
    );

    const chatHistory = await cursor.toArray();

    // If no chat history, return empty array but with initial system message
    if (chatHistory.length === 0) {
      return res.json([
        {
          userId,
          sessionId: 'initial',
          message: 'Welcome to ConsumerAI!',
          response:
            "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ]);
    }

    return res.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({
      error: 'Failed to fetch chat history',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
