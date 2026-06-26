import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authRouter }      from './routes/auth.js';
import { storesRouter }    from './routes/stores.js';
import { uploadRouter }    from './routes/upload.js';
import { reviewsRouter }   from './routes/reviews.js';
import { widgetRouter }    from './routes/widget.js';
import { analyticsRouter } from './routes/analytics.js';

const app = express();

// ── Security ────────────────────────────────────────────────────────
app.use(helmet());
app.set('trust proxy', 1);

// ── CORS: strict for admin routes ────────────────────────────────────
const adminOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

const strictCors = cors({
  origin: (origin, cb) => {
    if (!origin || adminOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: ${origin} not allowed`));
    }
  },
  credentials: true,
});

// ── CORS: open for widget routes (secured by API key instead) ────────
const widgetCors = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
});

// ── Body parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Health ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

// ── Widget routes — open CORS, API key secured ───────────────────────
app.use('/api/reviews', widgetCors, reviewsRouter);
app.use('/api/widget',  widgetCors, widgetRouter);
app.use('/api/upload',  widgetCors, uploadRouter);

// ── Admin routes — strict CORS, JWT secured ──────────────────────────
app.use('/api/auth',      strictCors, authRouter);
app.use('/api/stores',    strictCors, storesRouter);
app.use('/api/analytics', strictCors, analyticsRouter);

// ── 404 ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────
app.use((
  err: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
});

// ── Start ────────────────────────────────────────────────────────────
app.listen(Number(env.PORT), () => {
  console.log(`Backend running → http://localhost:${env.PORT}`);
});