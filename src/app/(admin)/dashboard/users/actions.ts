"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function updateRoleAction(userId: string, newRole: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  await db.update(users).set({ role: newRole as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' }).where(eq(users.id, userId));
}

export async function deleteUserAction(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized");
  }

  await db.delete(users).where(eq(users.id, userId));
}
