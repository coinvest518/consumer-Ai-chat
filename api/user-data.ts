import { chatHistoryCollection, userMetricsCollection, emailCollection } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // Initialize user metrics
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const newMetrics = {
      userId,
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await userMetricsCollection.updateOne(
      { userId },
      { $set: newMetrics },
      { upsert: true }
    );
    return res.json({
      success: true,
      message: `Initialized fresh data for user ${userId}`,
      metrics: newMetrics
    });
  }

  if (req.method === 'DELETE') {
    // Clear all user data
    const query = typeof req.query === 'string' ? JSON.parse(req.query) : req.query;
    const { userId } = query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const chatHistoryResult = await chatHistoryCollection.deleteMany({ userId });
    const metricsResult = await userMetricsCollection.deleteMany({ userId });
    const emailResult = await emailCollection.deleteMany({ userId });
    return res.json({
      success: true,
      message: `Cleared all data for user ${userId}`,
      deletedCounts: {
        chatHistory: chatHistoryResult.deletedCount,
        metrics: metricsResult.deletedCount,
        emails: emailResult.deletedCount
      }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
