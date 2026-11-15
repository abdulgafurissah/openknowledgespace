import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set in .env.local');
  }

  const sql = neon(dbUrl);
  console.log('Connecting to Neon Postgres to apply Open Suq migrations...');

  const migrationFile = path.join(__dirname, '../src/db/migrations/0000_rare_blackheart.sql');
  const content = fs.readFileSync(migrationFile, 'utf8');

  // Split by statement breakpoint
  const statements = content
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} migration statements to apply.`);

  let applied = 0;
  let skipped = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const firstLine = statement.split('\n')[0].slice(0, 60);
    try {
      await (sql as any).query(statement);
      console.log(`[${i + 1}/${statements.length}] SUCCESS: ${firstLine}`);
      applied++;
    } catch (err: any) {
      if (
        err.message?.includes('already exists') ||
        err.code === '42P07' ||
        err.code === '42710'
      ) {
        console.log(`[${i + 1}/${statements.length}] EXISTS: ${firstLine}`);
        skipped++;
      } else {
        console.error(`[${i + 1}/${statements.length}] ERROR: ${firstLine} -> ${err.message}`);
      }
    }
  }

  console.log(`✅ Open Suq migration complete! Applied: ${applied}, Existing/Skipped: ${skipped}`);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
