import { userMetricsCollection } from './_db';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { userId, amount, reason } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ error: 'userId and amount are required' });
  }
  const currentMetrics = await userMetricsCollection.findOne({ userId });
  const defaultMetrics = {
    dailyLimit: 5,
    chatsUsed: 0,
    isPro: false,
    lastUpdated: new Date().toISOString()
  };
  const userMetrics = currentMetrics ? {
    dailyLimit: currentMetrics.dailyLimit || 5,
    chatsUsed: currentMetrics.chatsUsed || 0,
    isPro: currentMetrics.isPro || false,
    lastUpdated: currentMetrics.lastUpdated || new Date().toISOString()
  } : defaultMetrics;
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
  res.json({
    success: true,
    creditsDeducted: amount,
    creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed,
    reason: reason || 'General usage'
  });
}
