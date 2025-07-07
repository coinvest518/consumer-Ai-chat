import { chatHistoryCollection, userMetricsCollection, emailCollection } from './_db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const chatHistoryResult = await chatHistoryCollection.deleteMany({ userId });
  const metricsResult = await userMetricsCollection.deleteMany({ userId });
  const emailResult = await emailCollection.deleteMany({ userId });
  res.json({
    success: true,
    message: `Cleared all data for user ${userId}`,
    deletedCounts: {
      chatHistory: chatHistoryResult.deletedCount,
      metrics: metricsResult.deletedCount,
      emails: emailResult.deletedCount
    }
  });
}
