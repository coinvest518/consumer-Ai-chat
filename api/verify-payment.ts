import Stripe from 'stripe';
import { userMetricsCollection, chatHistoryCollection } from './_db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, email } = req.body;
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
    res.json({ success: true, userId, customerEmail: email, creditsAdded: 50, newLimit: currentMetrics.dailyLimit + 50 });
  } else if (req.method === 'GET') {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      res.json({ paid: true, customerEmail: session.customer_details?.email, sessionId });
    } else {
      res.json({ paid: false, sessionId });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
