import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Metrics API route hit:', req.method, req.url);
  console.log('Query params:', req.query);
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.user_id as string;
    console.log('User ID from query:', userId);
    
    if (!userId) {
      console.log('Missing user ID');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Default metrics
    const defaultMetrics = {
      id: `metrics-${userId}`,
      user_id: userId,
      daily_limit: 5,
      chats_used: 0,
      is_pro: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // If Supabase is available, try to fetch/create metrics
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      try {
        const { data, error } = await supabase
          .from('user_metrics')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error('Supabase metrics query error:', error);
        } else if (data && data.length > 0) {
          const rawMetrics = data[0];
          
          // Map Supabase fields to expected format
          const supabaseMetrics = {
            id: rawMetrics.id,
            user_id: rawMetrics.user_id,
            daily_limit: rawMetrics.daily_limit || 5,
            chats_used: rawMetrics.chats_used || 0,
            is_pro: rawMetrics.is_pro || false,
            last_updated: rawMetrics.last_updated || rawMetrics.updated_at,
            created_at: rawMetrics.created_at
          };
          
          console.log('Returning Supabase metrics:', supabaseMetrics);
          return res.status(200).json(supabaseMetrics);
        }
      } catch (error) {
        console.error('Supabase metrics fetch error:', error);
      }
    }

    console.log('Returning default metrics:', defaultMetrics);
    res.status(200).json(defaultMetrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
