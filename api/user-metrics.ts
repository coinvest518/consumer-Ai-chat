import { supabase } from './_supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('user-metrics API called:', {
    method: req.method,
    query: req.query,
    body: req.body
  });

  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'userId is required' });
      }

      console.log('Fetching metrics for user:', userId);

      const { data: metrics, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching metrics:', error);
        return res.status(500).json({ error: 'Failed to fetch user metrics' });
      }

      console.log('Fetched metrics:', metrics);

      // Return default metrics if none exist
      return res.json(metrics || {
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const { userId, amount, reason, action } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      console.log('Processing POST request:', { userId, amount, reason, action });

      // Get current metrics
      const { data: currentMetrics, error: fetchError } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching metrics:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch user metrics' });
      }

      const metrics = currentMetrics || {
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString()
      };

      // Handle credit deduction
      if (action === 'deduct') {
        if (!amount || amount <= 0) {
          return res.status(400).json({ error: 'Invalid deduction amount' });
        }

        const remaining = metrics.daily_limit - metrics.chats_used;
        if (remaining < amount) {
          return res.status(403).json({
            error: 'Insufficient credits',
            required: amount,
            available: remaining
          });
        }

        metrics.chats_used += amount;
      }

      // Update metrics
      const { error: updateError } = await supabase
        .from('user_metrics')
        .upsert({
          ...metrics,
          last_updated: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating metrics:', updateError);
        return res.status(500).json({ error: 'Failed to update user metrics' });
      }

      // Log template usage if applicable
      if (action === 'deduct' && reason === 'template') {
        const { error: usageError } = await supabase
          .from('template_usage')
          .insert([{
            user_id: userId,
            template_id: req.body.templateId || 'unknown',
            credit_cost: amount,
            credits_remaining: metrics.daily_limit - metrics.chats_used,
            metadata: { reason }
          }]);

        if (usageError) {
          console.error('Error logging template usage:', usageError);
        }
      }

      return res.json({
        success: true,
        metrics,
        remaining: metrics.daily_limit - metrics.chats_used
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in user-metrics API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || String(error)
    });
  }
}
