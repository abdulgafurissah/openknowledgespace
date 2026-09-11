"use server";

import { db } from "@/db";
import { userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export async function toggleCompletionAction(lessonId: string, currentlyCompleted: boolean) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  if (currentlyCompleted) {
    await db.delete(userProgress).where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.lessonId, lessonId)
      )
    );
  } else {
    await db.insert(userProgress).values({
      userId,
      lessonId,
    });
  }
}
