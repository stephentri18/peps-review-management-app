import 'dotenv/config';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function seed() {
  const email    = 'admin@reviewsapp.com';
  const password = 'changeme123';   // change immediately after first login
  const name     = 'Super Admin';

  const hash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admin_users (email, password_hash, name, role)
    VALUES (${email}, ${hash}, ${name}, 'superadmin')
    ON CONFLICT (email) DO NOTHING
  `;

  console.log(`Admin seeded → ${email} / ${password}`);
  await sql.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});