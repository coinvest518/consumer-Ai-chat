import { chatHistoryCollection, userMetricsCollection, emailCollection } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ClearUserDataRequestQuery {
  userId?: string;
}

interface DeletedCounts {
  chatHistory: number;
  metrics: number;
  emails: number;
}

interface ClearUserDataResponse {
  success: boolean;
  message: string;
  deletedCounts: DeletedCounts;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const query = typeof req.query === 'string' ? JSON.parse(req.query) : req.query;
  const { userId } = query as ClearUserDataRequestQuery;
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
