import { Express } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Utility function to handle CORS and JSON responses
export function setupResponse(req: VercelRequest, res: VercelResponse) {
  const allowedOrigins = [
    'https://consumerai.info',
    'https://www.consumerai.info',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');
}

export function expressAdapter(app: Express) {
  return async (req: VercelRequest, res: VercelResponse) => {
    app(req, res);
  };
}
