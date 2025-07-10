import Stripe from 'stripe';
import { supabase } from './_supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { userId, email, sessionId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      // Get current metrics
      const { data: currentMetrics, error: metricsError } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (metricsError && metricsError.code !== 'PGRST116') {
        console.error('Error fetching metrics:', metricsError);
        return res.status(500).json({ error: 'Failed to fetch user metrics' });
      }

      const metrics = currentMetrics || {
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false
      };

      // Add credits
      const { error: updateError } = await supabase
        .from('user_metrics')
        .upsert({
          user_id: userId,
          daily_limit: metrics.daily_limit + 50,
          chats_used: metrics.chats_used,
          is_pro: metrics.is_pro,
          last_purchase: new Date().toISOString(),
          last_updated: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating metrics:', updateError);
        return res.status(500).json({ error: 'Failed to update user metrics' });
      }

      // Record the purchase
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          user_id: userId,
          amount: 9.99,
          credits: 50,
          stripe_session_id: sessionId,
          status: 'completed',
          metadata: { email }
        }]);

      if (purchaseError) {
        console.error('Error recording purchase:', purchaseError);
        // Don't fail the request, just log the error
      }

      // Record in chat history
      const { error: chatError } = await supabase
        .from('chat_history')
        .insert([{
          user_id: userId,
          message: 'Credits purchased',
          response: 'Added 50 credits to your account',
          message_type: 'purchase',
          metadata: {
            credits: 50,
            amount: 9.99,
            email
          }
        }]);

      if (chatError) {
        console.error('Error recording chat history:', chatError);
        // Don't fail the request, just log the error
      }

      return res.json({
        success: true,
        userId,
        customerEmail: email,
        creditsAdded: 50,
        newLimit: metrics.daily_limit + 50
      });
    } catch (error: any) {
      console.error('Error in payment verification:', error);
      return res.status(500).json({
        error: 'Failed to process payment verification',
        details: error.message
      });
    }
  }

  if (req.method === 'GET') {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        Array.isArray(sessionId) ? sessionId[0] : sessionId
      );

      // Check if we already processed this session
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single();

      return res.json({
        paid: session.payment_status === 'paid',
        customerEmail: session.customer_details?.email,
        sessionId: session.id,
        processed: !!existingPurchase
      });
    } catch (error: any) {
      console.error('Error checking session:', error);
      return res.status(500).json({
        error: 'Failed to verify payment status',
        details: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
