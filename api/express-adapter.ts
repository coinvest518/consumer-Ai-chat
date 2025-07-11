import { Express } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

export function expressAdapter(app: Express) {
  return async (req: VercelRequest, res: VercelResponse) => {
    app(req, res);
  };
}
