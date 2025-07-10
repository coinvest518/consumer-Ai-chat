import { Stripe } from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_supabase';

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
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (userId) {
        // Get current metrics
        const { data: metrics, error: metricsError } = await supabase
          .from('user_metrics')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (metricsError && metricsError.code !== 'PGRST116') {
          throw metricsError;
        }

        const currentMetrics = metrics || {
          user_id: userId,
          daily_limit: 5,
          chats_used: 0,
          is_pro: false,
          last_updated: new Date().toISOString()
        };

        // Update metrics with additional credits
        await supabase
          .from('user_metrics')
          .upsert({
            ...currentMetrics,
            daily_limit: currentMetrics.daily_limit + 50,
            last_purchase: new Date().toISOString(),
            last_updated: new Date().toISOString()
          });

        // Record the purchase
        await supabase
          .from('purchases')
          .insert([{
            user_id: userId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            credits: 50,
            stripe_session_id: session.id,
            status: 'completed',
            metadata: {
              payment_status: session.payment_status,
              customer_email: session.customer_details?.email
            }
          }]);
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(
      `Webhook Error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
