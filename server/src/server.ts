import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { callAgentAPI, clearChatSessionMemory, clearAllChatSessionMemories, type AIResponse } from './dispute-ai.js';
import { getUserMetricsCollection, updateUserMetrics } from '../db/astra.js';
import { supabase } from '../db/supabase.js';

interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
}

// Load environment variables from server root directory
config();

// Ensure we have access to environment variables with both naming conventions
// For server-side code, use non-VITE variables if available, otherwise fall back to VITE ones
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
process.env.ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN || process.env.VITE_ASTRA_DB_APPLICATION_TOKEN;
process.env.ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT || process.env.VITE_ASTRA_DB_ENDPOINT;
process.env.FLOW_ID = process.env.FLOW_ID || process.env.VITE_FLOW_ID;
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://consumerai.info',
  'https://www.consumerai.info'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint
app.post('/api/chat', async (req: Request<any, any, ChatRequest>, res: Response) => {
  try {
    const { message, sessionId, userId } = req.body;
    if (!message || !sessionId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const response = await callAgentAPI(message, sessionId, userId);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Clear session endpoint
app.delete('/api/chat/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const success = clearChatSessionMemory(sessionId);
  res.json({ success });
});

// Clear all sessions endpoint
app.delete('/api/chat/sessions', (_: Request, res: Response) => {
  clearAllChatSessionMemories();
  res.json({ success: true });
});

// User metrics endpoint
app.get('/api/user/metrics', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Default metrics - using frontend expected field names
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
    let supabaseMetrics = null;
    try {
      const { data, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase metrics query error:', error);
      } else if (data && data.length > 0) {
        supabaseMetrics = data[0];
      }
    } catch (error) {
      console.error('Supabase metrics fetch error:', error);
    }

    // Get or create metrics in Astra as backup
    let astraMetrics = null;
    try {
      const astraCollection = await getUserMetricsCollection();
      astraMetrics = await astraCollection.findOne({ userId });

      // If no metrics in Astra, create them with legacy format
      if (!astraMetrics) {
        const legacyMetrics = {
          userId,
          questionsAsked: 0,
          questionsRemaining: 5,
          isPro: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await updateUserMetrics(userId, legacyMetrics as any); // Legacy format for Astra
        astraMetrics = legacyMetrics;
      }
    } catch (error) {
      console.error('Astra metrics error:', error);
    }

    // Use Supabase metrics if available, otherwise use Astra, otherwise use defaults
    let finalMetrics = defaultMetrics;

    if (supabaseMetrics) {
      // Transform Supabase data to expected format
      finalMetrics = {
        id: supabaseMetrics.id || `metrics-${userId}`,
        user_id: supabaseMetrics.user_id || userId,
        daily_limit: supabaseMetrics.daily_limit || 5,
        chats_used: supabaseMetrics.chats_used || 0,
        is_pro: supabaseMetrics.is_pro || false,
        last_updated: supabaseMetrics.last_updated || new Date().toISOString(),
        created_at: supabaseMetrics.created_at || new Date().toISOString()
      };
    } else if (astraMetrics) {
      // Transform legacy Astra data to expected format
      finalMetrics = {
        id: astraMetrics._id || `metrics-${userId}`,
        user_id: astraMetrics.userId || userId,
        daily_limit: astraMetrics.questionsRemaining || 5,
        chats_used: astraMetrics.questionsAsked || 0,
        is_pro: astraMetrics.isPro || false,
        last_updated: astraMetrics.updatedAt || new Date().toISOString(),
        created_at: astraMetrics.createdAt || new Date().toISOString()
      };
    }

    res.json(finalMetrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ error: 'Failed to fetch user metrics' });
  }
});

// Simple user metrics endpoint
app.get('/api/user/metrics-simple', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Return simple default metrics
    return res.status(200).json({
      id: `metrics-${userId}`,
      user_id: userId,
      daily_limit: 5,
      chats_used: 0,
      is_pro: false,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in metrics-simple:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server if not running in Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;