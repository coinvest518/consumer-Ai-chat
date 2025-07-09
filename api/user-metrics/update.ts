import type { VercelRequest, VercelResponse } from '@vercel/node';
import { userMetricsCollection } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const currentMetrics = await userMetricsCollection.findOne({ userId }) || {
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      lastUpdated: new Date().toISOString()
    };
    const metricsToUpdate = {
      dailyLimit: currentMetrics.dailyLimit,
      chatsUsed: currentMetrics.chatsUsed,
      isPro: currentMetrics.isPro,
      lastUpdated: new Date().toISOString()
    };
    await userMetricsCollection.updateOne(
      { userId },
      { $set: metricsToUpdate },
      { upsert: true }
    );
    return res.json({ ...metricsToUpdate, userId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user metrics' });
  }
}
