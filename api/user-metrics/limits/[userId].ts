import type { VercelRequest, VercelResponse } from '@vercel/node';
import { userMetricsCollection } from '../../_db';

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
    const metrics = await userMetricsCollection.findOne({ userId });
    return res.json(
      metrics || {
        dailyLimit: 5,
        chatsUsed: 0,
        isPro: false,
        userId,
      }
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user metrics' });
  }
}
