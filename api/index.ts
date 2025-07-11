import express from 'express';
import cors from 'cors';
import { expressAdapter } from './express-adapter';
import { callAgentAPI, clearChatSessionMemory, clearAllChatSessionMemories } from './_dispute-ai';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://consumerai.info', 'https://www.consumerai.info', 'https://consumer-ai.vercel.app', 'https://consumer-ai-chat.vercel.app', 'https://consumer-ai-chat-git-main.vercel.app', 'https://consumerai.com'] 
    : ['http://localhost:5173'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User metrics endpoint
app.get('/api/user/metrics', async (req, res) => {
  try {
    const userId = req.query.user_id as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the auth token from the request header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('No authorization header provided');
      return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Set auth context for this request
    const { error: authError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    if (authError) {
      console.error('Auth error:', authError);
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Attempt to get user metrics
    const { data, error } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      // If record not found, return default metrics
      if (error.code === 'PGRST116') {
        const defaultMetrics = {
          id: crypto.randomUUID(),
          user_id: userId,
          daily_limit: 5,
          chats_used: 0,
          is_pro: false,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        // Create default metrics in database
        const { error: insertError } = await supabase
          .from('user_metrics')
          .insert([defaultMetrics]);

        if (insertError) {
          console.error('Failed to create default metrics:', insertError);
          return res.status(500).json({ error: 'Failed to create default metrics' });
        }

        return res.json(defaultMetrics);
      }

      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;
    
    if (!message || !sessionId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: message, sessionId, and userId are required' 
      });
    }

    const response = await callAgentAPI(message, sessionId, userId);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear chat session
app.post('/api/chat/clear', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const cleared = clearChatSessionMemory(sessionId);
  res.json({ cleared });
});

// Clear all chat sessions
app.post('/api/chat/clear-all', (req, res) => {
  clearAllChatSessionMemories();
  res.json({ cleared: true });
});

// Export the handler for Vercel
export default expressAdapter(app);
