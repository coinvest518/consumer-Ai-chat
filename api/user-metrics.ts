import { userMetricsCollection } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET: fetch user metrics (limits)
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'userId is required' });
    const metrics = await userMetricsCollection.findOne({ userId });
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
    if (!userId) return res.status(400).json({ error: 'userId is required' });
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
    await userMetricsCollection.updateOne(
      { userId },
      { $set: metricsToUpdate },
      { upsert: true }
    );
    return res.json({ ...metricsToUpdate, userId });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
