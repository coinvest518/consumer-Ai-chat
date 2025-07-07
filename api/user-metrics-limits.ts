import { userMetricsCollection } from './_db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const metrics = await userMetricsCollection.findOne({ userId });
  res.json(metrics || {
    dailyLimit: 5,
    chatsUsed: 0,
    isPro: false,
    userId
  });
}
