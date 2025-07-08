import { userMetricsCollection, templateUsageCollection } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const usage = await templateUsageCollection.find({ userId }).sort({ timestamp: -1 }).limit(50).toArray();
    return res.json(usage);
  }

  if (req.method === 'POST') {
    const { userId, templateId, creditCost } = req.body;
    if (!userId || !templateId || !creditCost) {
      return res.status(400).json({ error: 'userId, templateId, and creditCost are required' });
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
    if (remainingCredits < creditCost) {
      return res.status(400).json({ error: 'Insufficient credits', required: creditCost, available: remainingCredits });
    }
    const updatedMetrics = {
      ...userMetrics,
      chatsUsed: userMetrics.chatsUsed + creditCost,
      lastUpdated: new Date().toISOString()
    };
    await userMetricsCollection.updateOne(
      { userId },
      { $set: updatedMetrics },
      { upsert: true }
    );
    const templateUsage = {
      userId,
      templateId,
      creditCost,
      timestamp: new Date().toISOString(),
      creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
    };
    await templateUsageCollection.insertOne(templateUsage);
    return res.json({
      success: true,
      creditsDeducted: creditCost,
      creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed,
      templateUsage
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
