import { userMetricsCollection } from './_db';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
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
  res.json({ ...metricsToUpdate, userId });
}
