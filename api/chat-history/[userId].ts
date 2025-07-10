import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const {
    query: { userId },
    method,
  } = req;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    console.log('Fetching chat history for user:', userId);
    
    // First, ensure user metrics exist
    const { data: userMetrics, error: metricsError } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking user metrics:', metricsError);
      throw metricsError;
    }

    // Initialize metrics if they don't exist
    if (!userMetrics) {
      console.log('Creating new user metrics for:', userId);
      const { error: insertError } = await supabase
        .from('user_metrics')
        .insert({
          user_id: userId,
          daily_limit: 5,
          chats_used: 0,
          is_pro: false,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating user metrics:', insertError);
        throw insertError;
      }
    }

    // Get chat history
    const { data: chatHistory, error: chatError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (chatError) {
      console.error('Error fetching chat history:', chatError);
      throw chatError;
    }
    
    console.log('Found chat history:', chatHistory.length, 'messages');
    return res.status(200).json(chatHistory || []);
  } catch (error: any) {
    console.error('Error in chat history API:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch chat history',
      details: error.message 
    });
  }
}
