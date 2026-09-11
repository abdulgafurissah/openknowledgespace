import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { lessons, courses } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/courses/[id]/lessons — add a lesson to a module
export async function POST(
  req: NextRequest
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { moduleId, title, videoUrl, orderIndex } = await req.json();

  const [lesson] = await db
    .insert(lessons)
    .values({ moduleId, title, videoUrl: videoUrl || null, orderIndex })
    .returning();

  return NextResponse.json(lesson);
}

// DELETE /api/courses/[id]/lessons?lessonId=xxx
export async function DELETE(
  req: NextRequest
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  }

  await db.delete(lessons).where(eq(lessons.id, lessonId));
  return NextResponse.json({ success: true });
}

// PATCH /api/courses/[id]/lessons — publish course
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: courseId } = await params;
  await db.update(courses).set({ isPublished: true }).where(eq(courses.id, courseId));
  return NextResponse.json({ success: true });
}
