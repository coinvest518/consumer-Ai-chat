import { userMetricsCollection, chatHistoryCollection } from './_db';
import { callLangflowAPI } from '../server/src/langflow';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ChatRequestBody {
  message: string;
  sessionId?: string;
  userId: string;
}

interface UserMetrics {
  userId: string;
  dailyLimit: number;
  chatsUsed: number;
  isPro: boolean;
  lastUpdated?: string;
}

interface AIResponse {
  text: string;
  [key: string]: any;
}


export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { message, sessionId, userId } = body as ChatRequestBody;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  // Get current metrics
  const currentMetrics: UserMetrics =
    (await userMetricsCollection.findOne({ userId })) || {
      userId,
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false
    };
  if (!currentMetrics.isPro && currentMetrics.chatsUsed >= currentMetrics.dailyLimit) {
    return res.status(429).json({
      error: 'Daily limit reached',
      chatsUsed: currentMetrics.chatsUsed,
      dailyLimit: currentMetrics.dailyLimit
    });
  }
  // Call Langflow
  const aiResponse: AIResponse = await callLangflowAPI(message, sessionId ?? '');
  // Save chat history
  await chatHistoryCollection.insertOne({
    userId,
    message,
    response: aiResponse.text,
    timestamp: new Date().toISOString(),
    sessionId: sessionId ?? ''
  });
  const updatedMetrics: UserMetrics = {
    userId,
    dailyLimit: currentMetrics.dailyLimit,
    chatsUsed: currentMetrics.chatsUsed + 1,
    isPro: currentMetrics.isPro,
    lastUpdated: new Date().toISOString()
  };
  await userMetricsCollection.updateOne(
    { userId },
    { $set: updatedMetrics },
    { upsert: true }
  );
  res.json({
    text: aiResponse.text,
    chatsUsed: updatedMetrics.chatsUsed,
    dailyLimit: updatedMetrics.dailyLimit,
    remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
  });
}
