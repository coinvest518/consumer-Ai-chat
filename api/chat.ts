import { userMetricsCollection, chatHistoryCollection } from './_db';
import { callLangflowAPI } from '../server/src/langflow';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const cursor = await chatHistoryCollection.find({ userId });
    const chatHistory = await cursor.toArray();
    return res.json(chatHistory || []);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { message, sessionId, userId } = body;
      if (!message) return res.status(400).json({ error: 'Message is required' });
      if (!userId) return res.status(400).json({ error: 'User ID is required' });

      // Get current metrics
      const currentMetrics =
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
      const aiResponse = await callLangflowAPI(message, sessionId ?? '');
      // Save chat history
      await chatHistoryCollection.insertOne({
        userId,
        message,
        response: aiResponse.text,
        timestamp: new Date().toISOString(),
        sessionId: sessionId ?? ''
      });
      const updatedMetrics = {
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
      return res.json({
        text: aiResponse.text,
        chatsUsed: updatedMetrics.chatsUsed,
        dailyLimit: updatedMetrics.dailyLimit,
        remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
      });
    } catch (err: any) {
      console.error('Unhandled error in /api/chat:', err);
      return res.status(500).json({ error: 'Internal server error', details: err?.message || String(err) });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
