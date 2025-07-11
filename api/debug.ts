import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Debug info
  const debugInfo = {
    method: req.method,
    url: req.url,
    query: req.query,
    headers: {
      host: req.headers.host,
      'user-agent': req.headers['user-agent'],
      origin: req.headers.origin,
    },
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_KEY,
      hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasViteSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    }
  };

  console.log('Debug endpoint called:', debugInfo);
  res.status(200).json(debugInfo);
}
