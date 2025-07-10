import { supabase } from './_supabase';
import { callLangflowAPI } from '../server/src/langflow';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const { data: chatHistory, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }

    return res.json(chatHistory || []);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { message, sessionId, userId } = body;

      if (!message) return res.status(400).json({ error: 'Message is required' });
      if (!userId) return res.status(400).json({ error: 'userId is required' });

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

      if (!metrics.is_pro && metrics.chats_used >= metrics.daily_limit) {
        return res.status(403).json({
          error: 'Daily limit reached',
          chatsUsed: metrics.chats_used,
          dailyLimit: metrics.daily_limit
        });
      }

      // Call Langflow
      const aiResponse = await callLangflowAPI(message, sessionId ?? '');

      // Save chat history
      const { error: chatError } = await supabase
        .from('chat_history')
        .insert([{
          user_id: userId,
          session_id: sessionId || undefined,
          message,
          response: aiResponse.text,
          message_type: 'chat',
          metadata: { timestamp: new Date().toISOString() }
        }]);

      if (chatError) {
        console.error('Error saving chat:', chatError);
        return res.status(500).json({ error: 'Failed to save chat history' });
      }

      // Update metrics
      const { error: updateError } = await supabase
        .from('user_metrics')
        .upsert({
          user_id: userId,
          daily_limit: metrics.daily_limit,
          chats_used: metrics.chats_used + 1,
          is_pro: metrics.is_pro,
          last_updated: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating metrics:', updateError);
        return res.status(500).json({ error: 'Failed to update user metrics' });
      }

      return res.json({
        text: aiResponse.text,
        chatsUsed: metrics.chats_used + 1,
        dailyLimit: metrics.daily_limit,
        remaining: metrics.daily_limit - (metrics.chats_used + 1)
      });
    } catch (err: any) {
      console.error('Unhandled error in /api/chat:', err);
      return res.status(500).json({ 
        error: 'Internal server error', 
        details: err?.message || String(err) 
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
