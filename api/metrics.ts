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

    // Default metrics (no longer trying to write to DB, just returning defaults)
    const defaultMetrics = {
      id: `metrics-${userId}`,
      user_id: userId,
      daily_limit: 5,
      chats_used: 0,
      is_pro: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // If Supabase is available, try to fetch from the existing table structure
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      try {
        // Only query the columns that exist in the current table
        const { data, error } = await supabase
          .from('user_metrics')
          .select('id, user_id, created_at')
          .eq('user_id', userId)
          .maybeSingle(); // Use maybeSingle to handle no rows gracefully

        if (error) {
          console.error('Supabase metrics query error:', error);
          console.log('Returning default metrics due to query error');
          return res.status(200).json(defaultMetrics);
        }

        if (data) {
          // Merge with defaults for fields that don't exist in the table
          const supabaseMetrics = {
            id: data.id,
            user_id: data.user_id,
            created_at: data.created_at,
            // Provide default values for fields that don't exist in the table
            daily_limit: 5,
            chats_used: 0,
            is_pro: false,
            last_updated: new Date().toISOString()
          };
          
          console.log('Returning merged metrics from Supabase:', supabaseMetrics);
          return res.status(200).json(supabaseMetrics);
        } else {
          // No record found, try to create a basic one (only with the columns that exist)
          try {
            const { data: newData, error: insertError } = await supabase
              .from('user_metrics')
              .insert([{ user_id: userId }])
              .select('id, user_id, created_at')
              .single();

            if (!insertError && newData) {
              const metrics = {
                id: newData.id,
                user_id: newData.user_id,
                created_at: newData.created_at,
                daily_limit: 5,
                chats_used: 0,
                is_pro: false,
                last_updated: new Date().toISOString()
              };
              
              console.log('Created new metrics record and returning:', metrics);
              return res.status(200).json(metrics);
            } else {
              console.error('Failed to create metrics record:', insertError);
              console.log('Returning default metrics due to insert error');
              return res.status(200).json(defaultMetrics);
            }
          } catch (insertError) {
            console.error('Error creating metrics record:', insertError);
            console.log('Returning default metrics due to insert exception');
            return res.status(200).json(defaultMetrics);
          }
        }
      } catch (error) {
        console.error('Supabase metrics fetch error:', error);
        console.log('Returning default metrics due to fetch exception');
        return res.status(200).json(defaultMetrics);
      }
    } else {
      console.log('No Supabase credentials, returning default metrics');
      return res.status(200).json(defaultMetrics);
    }
  } catch (error) {
    console.error('Error in metrics handler:', error);
    // Always return some metrics, never fail
    const fallbackMetrics = {
      id: `fallback-${req.query.user_id}`,
      user_id: req.query.user_id as string,
      daily_limit: 5,
      chats_used: 0,
      is_pro: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    res.status(200).json(fallbackMetrics);
  }
}
