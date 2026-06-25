import type { Request, Response, NextFunction } from 'express';
import { sql } from '../config/db.js';
import type { Store } from '@reviews/types';

export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = req.headers['x-api-key'];

  if (!key || typeof key !== 'string') {
    res.status(401).json({ error: 'Missing x-api-key header' });
    return;
  }

  try {
    const [store] = await sql<Store[]>`
      SELECT * FROM stores WHERE api_key = ${key} LIMIT 1
    `;

    if (!store) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }

    req.store = store;
    next();
  } catch (err) {
    console.error('apiKeyAuth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}