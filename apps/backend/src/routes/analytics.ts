import express, { Router, type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import { z } from 'zod';
import { jwtAuth } from '../middleware/jwtAuth.js';
import { analyticsService, type VolumeInterval } from '../services/analyticsService.js';

const router: express.Router = Router();

router.use(jwtAuth);

/**
 * Wraps an async route handler so rejected promises are forwarded to Express's
 * error handler instead of becoming an unhandled rejection (which, in Express 4,
 * leaves the request hanging and can crash the process).
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

// ── Overview stats ──────────────────────────────────────────────────
// GET /api/analytics/overview?store_id=uuid (store_id optional)
router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.query['store_id'] as string | undefined;
  const stats = await analyticsService.getOverview(storeId);
  res.json(stats);
}));

// ── Volume over time ────────────────────────────────────────────────
// GET /api/analytics/volume?interval=day&days=30&store_id=uuid
const volumeSchema = z.object({
  interval: z.enum(['day', 'week', 'month']).default('day'),
  days:     z.coerce.number().int().min(1).max(365).default(30),
  store_id: z.string().uuid().optional(),
});

router.get('/volume', asyncHandler(async (req: Request, res: Response) => {
  const parsed = volumeSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { interval, days, store_id } = parsed.data;
  const data = await analyticsService.getVolume(
    interval as VolumeInterval,
    days,
    store_id
  );

  res.json({ interval, days, data });
}));

// ── Per-store breakdown ─────────────────────────────────────────────
// GET /api/analytics/stores
router.get('/stores', asyncHandler(async (_req: Request, res: Response) => {
  const stores = await analyticsService.getStoreBreakdown();
  res.json({ stores });
}));

// ── Rating distribution ─────────────────────────────────────────────
// GET /api/analytics/ratings?store_id=uuid (store_id optional)
router.get('/ratings', asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.query['store_id'] as string | undefined;
  const distribution = await analyticsService.getRatingDistribution(storeId);
  res.json({ distribution });
}));

export { router as analyticsRouter };