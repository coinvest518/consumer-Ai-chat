import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { setupResponse } from '../express-adapter';

// Create Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Log environment status
console.log('Supabase config status:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  supabaseUrlPrefix: supabaseUrl?.substring(0, 30) + '...',
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: !!process.env.VERCEL
});

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set up standardized response headers
  setupResponse(req, res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.user_id as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({
        error: 'Database configuration error',
        id: `metrics-${userId}`,
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Database error',
        id: `metrics-${userId}`,
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    if (!data) {
      // Return default metrics for new users
      return res.status(200).json({
        id: `metrics-${userId}`,
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in metrics endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
