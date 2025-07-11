import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setupResponse } from '../express-adapter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set up standardized response headers
  setupResponse(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.user_id as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Return simple default metrics
    return res.status(200).json({
      id: `metrics-${userId}`,
      user_id: userId,
      daily_limit: 5,
      chats_used: 0,
      is_pro: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in metrics-simple:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
