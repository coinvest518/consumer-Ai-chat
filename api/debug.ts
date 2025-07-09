import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({
    status: 'Serverless API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    vercelInfo: {
      isVercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION,
      environment: process.env.VERCEL_ENV
    }
  });
}
