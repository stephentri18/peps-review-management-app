import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { storeService } from '../services/storeService.js';
import express from 'express';
import type { JsonObject } from '@reviews/types';

const router: express.Router = Router();

router.use(jwtAuth);  // all store routes require admin auth

// List all stores
router.get('/', async (_req: Request, res: Response) => {
  const stores = await storeService.list();
  res.json({ stores });
});

// Get single store + widget settings
router.get('/:id', async (req: Request, res: Response) => {
  const store = await storeService.getById(req.params.id!);
  if (!store) {
    res.status(404).json({ error: 'Store not found' });
    return;
  }
  const settings = await storeService.getWidgetSettings(store.id);
  res.json({ store, settings });
});

// Register new store
const createSchema = z.object({
  shop_domain: z.string().min(1),
  name:        z.string().min(1),
  plan:        z.enum(['free', 'pro', 'enterprise']).optional(),
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const store = await storeService.create(parsed.data);
  res.status(201).json({ store });
});

// Update store
const updateSchema = z.object({
  name:     z.string().optional(),
  plan:     z.enum(['free', 'pro', 'enterprise']).optional(),
  settings: z.record(z.unknown()).transform((val) => val as JsonObject).optional(),
});

router.patch('/:id', async (req: Request, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const store = await storeService.update(req.params.id!, parsed.data);
  res.json({ store });
});

// Rotate API key
router.post('/:id/rotate-key', async (req: Request, res: Response) => {
  const store = await storeService.rotateApiKey(req.params.id!);
  res.json({ api_key: store.api_key });
});

// Get widget settings
router.get('/:id/settings', async (req: Request, res: Response) => {
  const settings = await storeService.getWidgetSettings(req.params.id!);
  if (!settings) {
    res.status(404).json({ error: 'Widget settings not found' });
    return;
  }
  res.json({ settings });
});

// Update widget settings
const settingsSchema = z.object({
  theme_color:          z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  auto_approve:         z.boolean().optional(),
  require_email:        z.boolean().optional(),
  show_verified_badge:  z.boolean().optional(),
  max_media_per_review: z.number().int().min(0).max(10).optional(),
  reviews_per_page:     z.number().int().min(1).max(50).optional(),
  allow_video:          z.boolean().optional(),
});

router.put('/:id/settings', async (req: Request, res: Response) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const settings = await storeService.updateWidgetSettings(req.params.id!, parsed.data);
  res.json({ settings });
});

export { router as storesRouter };