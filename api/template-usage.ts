import { supabase } from './_supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { TemplateUsage, UserMetrics } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Get recent template usage
      const { data: usage, error } = await supabase
        .from('template_usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching template usage:', error);
        return res.status(500).json({ error: 'Failed to fetch template usage' });
      }

      return res.json(usage || []);
    }

    if (req.method === 'POST') {
      const { userId, templateId, creditCost } = req.body;

      if (!userId || !templateId || !creditCost) {
        return res.status(400).json({ error: 'userId, templateId, and creditCost are required' });
      }

      // Get current metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (metricsError && metricsError.code !== 'PGRST116') {
        console.error('Error fetching metrics:', metricsError);
        return res.status(500).json({ error: 'Failed to fetch user metrics' });
      }

      const userMetrics: UserMetrics = metrics || {
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString()
      };

      const remainingCredits = userMetrics.daily_limit - userMetrics.chats_used;
      
      if (remainingCredits < creditCost) {
        return res.status(400).json({
          error: 'Insufficient credits',
          required: creditCost,
          available: remainingCredits
        });
      }

      // Begin transaction using RPC for atomicity
      const { data: templateUsage, error: usageError } = await supabase
        .rpc('use_template', {
          p_user_id: userId,
          p_template_id: templateId,
          p_credit_cost: creditCost
        });

      if (usageError) {
        console.error('Error using template:', usageError);
        return res.status(500).json({ error: 'Failed to use template' });
      }

      // Get updated metrics
      const { data: updatedMetrics } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      return res.json({
        success: true,
        creditsDeducted: creditCost,
        creditsRemaining: updatedMetrics?.daily_limit - updatedMetrics?.chats_used,
        templateUsage
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in template-usage API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || String(error)
    });
  }
}
