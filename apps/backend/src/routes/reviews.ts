import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { submitLimiter } from '../middleware/rateLimiter.js';
import { reviewService } from '../services/reviewService.js';
import type { ReviewStatus } from '@reviews/types';
import express from 'express';

const router: express.Router = Router();

// ── Submit (widget) ─────────────────────────────────────────────────
const submitSchema = z.object({
  product_id:     z.string().min(1),
  product_handle: z.string().optional(),
  product_title:  z.string().optional(),
  reviewer_name:  z.string().min(1).max(100),
  reviewer_email: z.string().email(),
  rating:         z.number().int().min(1).max(5),
  title:          z.string().max(200).optional(),
  body:           z.string().min(10).max(5000),
  media: z.array(z.object({
    cloudinary_public_id: z.string(),
    url:                  z.string().url(),
    thumbnail_url:        z.string().url().optional(),
    type:                 z.enum(['image', 'video']),
    width:                z.number().optional(),
    height:               z.number().optional(),
    bytes:                z.number().optional(),
  })).max(5).optional(),
});

router.post('/', apiKeyAuth, submitLimiter, async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const review = await reviewService.create({
    storeId:   req.store!.id,
    data:      parsed.data,
    ipAddress: req.ip ?? null,
  });
  res.status(201).json({ review });
});

// ── List (admin) ────────────────────────────────────────────────────
const listSchema = z.object({
  page:     z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  status:   z.enum(['pending', 'published', 'rejected']).optional(),
  store_id: z.string().uuid().optional(),
  rating:   z.coerce.number().int().min(1).max(5).optional(),
  search:   z.string().optional(),
  sort:     z.enum(['created_at', 'rating', 'helpful_count']).default('created_at'),
  order:    z.enum(['asc', 'desc']).default('desc'),
});

router.get('/', jwtAuth, async (req: Request, res: Response) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const result = await reviewService.list(parsed.data);
  res.json(result);
});

// ── Get single (admin) ──────────────────────────────────────────────
router.get('/:id', jwtAuth, async (req: Request, res: Response) => {
  const review = await reviewService.getById(req.params.id!);
  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }
  res.json({ review });
});

// ── Update status (admin) ───────────────────────────────────────────
const statusSchema = z.object({
  status: z.enum(['pending', 'published', 'rejected']),
});

router.patch('/:id/status', jwtAuth, async (req: Request, res: Response) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const review = await reviewService.updateStatus(
    req.params.id!,
    parsed.data.status as ReviewStatus
  );
  res.json({ review });
});

// ── Reply (admin) ───────────────────────────────────────────────────
const replySchema = z.object({ body: z.string().min(1).max(2000) });

router.post('/:id/reply', jwtAuth, async (req: Request, res: Response) => {
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const reply = await reviewService.upsertReply(
    req.params.id!,
    parsed.data.body
  );
  res.json({ reply });
});

router.delete('/:id/reply', jwtAuth, async (req: Request, res: Response) => {
  await reviewService.deleteReply(req.params.id!);
  res.status(204).send();
});

// ── Delete (admin) ──────────────────────────────────────────────────
router.delete('/:id', jwtAuth, async (req: Request, res: Response) => {
  await reviewService.delete(req.params.id!);
  res.status(204).send();
});

export { router as reviewsRouter };