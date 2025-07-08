import { templateUsageCollection } from './_db';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const usage = await templateUsageCollection.find({ userId }).sort({ timestamp: -1 }).limit(50).toArray();
    res.json(usage);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
