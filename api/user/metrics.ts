import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ffvvesrqtdktayjwurwm.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdnZlc3JxdGRrdGF5and1cndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODAxMDksImV4cCI6MjA2MDk1NjEwOX0._zC7055iriJSN3-HUTj71Bn_-auGn1WfrWDwqLPPUU4';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

    // Try to get metrics from Supabase first (handle no rows gracefully)
    let supabaseMetrics: {
      id: any;
      user_id: any;
      daily_limit: any;
      chats_used: any;
      is_pro: any;
      last_updated: any;
      created_at: any;
    } | null = null;
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
        supabaseMetrics = {
          id: rawMetrics.id,
          user_id: rawMetrics.user_id,
          daily_limit: rawMetrics.daily_limit || 5,
          chats_used: rawMetrics.chats_used || 0,
          is_pro: rawMetrics.is_pro || false,
          last_updated: rawMetrics.last_updated || rawMetrics.updated_at,
          created_at: rawMetrics.created_at
        };
      }
    } catch (error) {
      console.error('Supabase metrics fetch error:', error);
    }

    // If no metrics found in Supabase, try to create them
    if (!supabaseMetrics) {
      try {
        const { data, error } = await supabase
          .from('user_metrics')
          .insert([defaultMetrics])
          .select()
          .single();

        if (!error && data) {
          supabaseMetrics = data;
        }
      } catch (error) {
        console.error('Supabase metrics creation error:', error);
      }
    }

    // Use Supabase metrics if available, otherwise use defaults
    const metrics = supabaseMetrics || defaultMetrics;

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ error: 'Failed to fetch user metrics' });
  }
}
