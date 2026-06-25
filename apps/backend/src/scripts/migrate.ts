import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function migrate() {
  const migrationPath = resolve(__dirname, '../../migrations/001_initial.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('Running migration...');
  await sql.unsafe(migrationSQL);
  console.log('Migration complete.');

  await sql.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});