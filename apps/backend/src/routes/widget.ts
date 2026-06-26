import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { readLimiter } from '../middleware/rateLimiter.js';
import { reviewService } from '../services/reviewService.js';
import { storeService } from '../services/storeService.js';
import { sql } from '../config/db.js';
import express from 'express';

const router: express.Router = Router();

router.use(apiKeyAuth, readLimiter);

// Public widget settings for the authenticated store (drives widget appearance/behaviour)
router.get('/settings', async (req: Request, res: Response) => {
  const settings = await storeService.getWidgetSettings(req.store!.id);
  res.json({ settings });
});

// Published reviews for a product
const querySchema = z.object({
  product_id: z.string().min(1),
  page:       z.coerce.number().int().positive().default(1),
  per_page:   z.coerce.number().int().min(1).max(50).default(5),
  sort:       z.enum(['created_at', 'rating', 'helpful_count']).default('created_at'),
  order:      z.enum(['asc', 'desc']).default('desc'),
});

router.get('/reviews', async (req: Request, res: Response) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = await reviewService.list({
    ...parsed.data,
    status:   'published',
    store_id: req.store!.id,
  });

  res.json(result);
});

// Store-wide featured reviews (highest-rated, across all products) — for the carousel
const featuredSchema = z.object({
  limit: z.coerce.number().int().min(1).max(30).default(12),
});

router.get('/featured', async (req: Request, res: Response) => {
  const parsed = featuredSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const result = await reviewService.list({
    status:   'published',
    store_id: req.store!.id,
    sort:     'rating',
    order:    'desc',
    page:     1,
    per_page: parsed.data.limit,
  });

  res.json(result);
});

// Aggregate rating for a product
router.get('/aggregate', async (req: Request, res: Response) => {
  const productId = req.query['product_id'];
  if (!productId || typeof productId !== 'string') {
    res.status(400).json({ error: 'product_id is required' });
    return;
  }

  const aggregate = await reviewService.getAggregate(req.store!.id, productId);
  res.json(aggregate);
});

// Vote helpful / not helpful
const voteSchema = z.object({
  vote: z.enum(['helpful', 'not_helpful']),
});

router.post('/reviews/:id/vote', async (req: Request, res: Response) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const ipAddress = req.ip ?? '0.0.0.0';

  await sql`
    INSERT INTO review_votes (review_id, ip_address, vote)
    VALUES (${req.params.id!}, ${ipAddress}::inet, ${parsed.data.vote})
    ON CONFLICT (review_id, ip_address) DO UPDATE SET vote = ${parsed.data.vote}
  `;

  // Update helpful_count on the review
  await sql`
    UPDATE reviews SET
      helpful_count = (
        SELECT COUNT(*) FROM review_votes
        WHERE review_id = ${req.params.id!} AND vote = 'helpful'
      ),
      updated_at = NOW()
    WHERE id = ${req.params.id!}
  `;

  res.json({ success: true });
});

export { router as widgetRouter };