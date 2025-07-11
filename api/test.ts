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

  console.log('Test API route hit:', req.method, req.url);
  
  res.status(200).json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    query: req.query
  });
}
