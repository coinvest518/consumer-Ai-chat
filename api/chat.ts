import { userMetricsCollection, chatHistoryCollection } from './_db';
import { callLangflowAPI } from '../server/src/langflow';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { message, sessionId, userId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  // Get current metrics
  const currentMetrics = (await userMetricsCollection.findOne({ userId })) || {
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
  const aiResponse = await callLangflowAPI(message, sessionId);
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
  res.json({
    text: aiResponse.text,
    chatsUsed: updatedMetrics.chatsUsed,
    dailyLimit: updatedMetrics.dailyLimit,
    remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
  });
}
