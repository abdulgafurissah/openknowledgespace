/**
 * Admin Seed Script
 * Creates an admin user or promotes an existing user to ADMIN role.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Edit the credentials below before running.
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// ─── Edit these before running ────────────────────────────────────────────────
const ADMIN_EMAIL    = 'sysadmin@openknowledgespace.com';
const ADMIN_PASSWORD = 'v9xP#mK2$Lz7!qWc'; // Highly secure generated password
const ADMIN_NAME     = 'System Administrator';
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db  = drizzle(sql);
  
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Check if user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL));

  if (existing.length > 0) {
    // Promote to ADMIN and update password if already registered
    await db
      .update(users)
      .set({ role: 'ADMIN', passwordHash, fullName: ADMIN_NAME })
      .where(eq(users.email, ADMIN_EMAIL));

    console.log(`✅ Existing user "${ADMIN_EMAIL}" promoted to ADMIN and password updated.`);
  } else {
    // Create a brand-new admin account
    await db.insert(users).values({
      email:        ADMIN_EMAIL,
      passwordHash,
      fullName:     ADMIN_NAME,
      role:         'ADMIN',
    });

    console.log(`✅ Admin account created:`);
  }
  
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`\n⚠️  Store these credentials securely!`);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
