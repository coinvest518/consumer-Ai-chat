import type { VercelRequest, VercelResponse } from '@vercel/node';

// Load environment variables
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
process.env.ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN || process.env.VITE_ASTRA_DB_APPLICATION_TOKEN;
process.env.ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT || process.env.VITE_ASTRA_DB_ENDPOINT;
process.env.FLOW_ID = process.env.FLOW_ID || process.env.VITE_FLOW_ID;
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

import { callAgentAPI } from './_dispute-ai';

interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Robust CORS: always set headers, log incoming origin for debugging
  const allowedOrigins = [
    'https://consumerai.info',
    'https://www.consumerai.info',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  console.log('Incoming CORS origin:', origin);
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For debugging, always set to '*' if not matched (remove for production)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
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

    // Add request logging
    console.log('Chat request received:', {
      userId,
      sessionId,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    });

    const response = await callAgentAPI(message, sessionId, userId);

    // Add response logging
    console.log('Chat response sent:', {
      userId,
      sessionId,
      responseLength: response?.text?.length,
      timestamp: new Date().toISOString()
    });

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
