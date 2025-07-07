import { userMetricsCollection } from './_db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
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
  res.json({
    success: true,
    message: `Initialized fresh data for user ${userId}`,
    metrics: newMetrics
  });
}
