import { userMetricsCollection } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('user-metrics API called:', {
    method: req.method,
    query: req.query,
    body: req.body,
    hasCollection: !!userMetricsCollection,
    hasAstraToken: !!process.env.ASTRA_DB_APPLICATION_TOKEN,
    hasAstraEndpoint: !!process.env.ASTRA_DB_ENDPOINT
  });

  try {
    // GET: fetch user metrics (limits)
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        console.error('userId is required');
        return res.status(400).json({ error: 'userId is required' });
      }

      console.log('Fetching metrics for user:', userId);
      const metrics = await userMetricsCollection.findOne({ userId });
      console.log('Fetched metrics:', metrics);

      return res.json(metrics || {
        dailyLimit: 5,
        chatsUsed: 0,
        isPro: false,
        userId
      });
    }

    // POST: update user metrics or deduct credits
    if (req.method === 'POST') {
      const { userId, amount, reason, action } = req.body;
      if (!userId) {
        console.error('userId is required');
        return res.status(400).json({ error: 'userId is required' });
      }

      console.log('Processing POST request:', { userId, amount, reason, action });
      const currentMetrics = await userMetricsCollection.findOne({ userId }) || {
        dailyLimit: 5,
        chatsUsed: 0,
        isPro: false,
        lastUpdated: new Date().toISOString()
      };

      // Deduct credits
      if (action === 'deduct') {
        if (!amount) return res.status(400).json({ error: 'amount is required' });
        const userMetrics = {
          dailyLimit: currentMetrics.dailyLimit || 5,
          chatsUsed: currentMetrics.chatsUsed || 0,
          isPro: currentMetrics.isPro || false,
          lastUpdated: currentMetrics.lastUpdated || new Date().toISOString()
        };
        const remainingCredits = userMetrics.dailyLimit - userMetrics.chatsUsed;
        if (remainingCredits < amount) {
          return res.status(400).json({ error: 'Insufficient credits', required: amount, available: remainingCredits });
        }
        const updatedMetrics = {
          ...userMetrics,
          chatsUsed: userMetrics.chatsUsed + amount,
          lastUpdated: new Date().toISOString()
        };
        await userMetricsCollection.updateOne(
          { userId },
          { $set: updatedMetrics },
          { upsert: true }
        );
        return res.json({
          success: true,
          creditsDeducted: amount,
          creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed,
          reason: reason || 'General usage'
        });
      }
      // Default: update metrics (reset lastUpdated)
      const metricsToUpdate = {
        dailyLimit: currentMetrics.dailyLimit,
        chatsUsed: currentMetrics.chatsUsed,
        isPro: currentMetrics.isPro,
        lastUpdated: new Date().toISOString()
      };

      console.log('Updating metrics:', metricsToUpdate);
      await userMetricsCollection.updateOne(
        { userId },
        { $set: metricsToUpdate },
        { upsert: true }
      );

      return res.json({ ...metricsToUpdate, userId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in user-metrics API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
