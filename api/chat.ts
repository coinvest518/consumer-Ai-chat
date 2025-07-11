import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
process.env.ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN || process.env.VITE_ASTRA_DB_APPLICATION_TOKEN;
process.env.ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT || process.env.VITE_ASTRA_DB_ENDPOINT;
process.env.FLOW_ID = process.env.FLOW_ID || process.env.VITE_FLOW_ID;
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

import { callAgentAPI } from '../server/src/dispute-ai';

interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, userId } = req.body as ChatRequest;
    
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
}
