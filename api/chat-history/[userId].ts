import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatHistoryCollection } from '../_db';

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
    const cursor = await chatHistoryCollection.find({ userId });
    const chatHistory = await cursor.toArray();
    return res.json(chatHistory || []);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
}
