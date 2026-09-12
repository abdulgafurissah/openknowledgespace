import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const diagnostics: Record<string, any> = {
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'missing',
      authTrustHost: process.env.AUTH_TRUST_HOST || 'missing',
      nodeEnv: process.env.NODE_ENV,
    },
    databaseConnection: null,
    dbError: null,
  };

  try {
    // Attempt a simple query to ensure the Neon connection is alive
    const result = await db.execute(sql`SELECT 1 as test`);
    diagnostics.databaseConnection = "SUCCESS";
  } catch (error: any) {
    diagnostics.databaseConnection = "FAILED";
    diagnostics.dbError = error.message || String(error);
  }

  return NextResponse.json(diagnostics);
}
