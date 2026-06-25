import postgres from 'postgres';
import { env } from './env.js';

export const sql = postgres(env.DATABASE_URL, {
  ssl: env.NODE_ENV === 'production' ? 'require' : 'prefer',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},   // suppress notices in console
});