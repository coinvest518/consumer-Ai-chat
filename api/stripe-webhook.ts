
import Stripe from 'stripe';
import { userMetricsCollection, chatHistoryCollection } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        const currentMetrics = await userMetricsCollection.findOne({ userId }) || {
          dailyLimit: 5,
          chatsUsed: 0,
          isPro: false,
          lastUpdated: new Date().toISOString()
        };
        await userMetricsCollection.updateOne(
          { userId },
          { $set: {
            dailyLimit: currentMetrics.dailyLimit + 50,
            lastPurchase: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          } },
          { upsert: true }
        );
        await chatHistoryCollection.insertOne({
          userId,
          type: 'purchase',
          credits: 50,
          amount: 9.99,
          timestamp: new Date().toISOString()
        });
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(
      `Webhook Error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
