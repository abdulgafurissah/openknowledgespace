import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { lessons, courses } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/courses/[id]/lessons — create a new lesson
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    moduleId,
    title,
    videoUrl,        // YouTube video ID or URL
    gumletAssetId,  // Gumlet cloud video asset ID
    content,         // Lesson text / transcript
    driveFileId,     // Google Drive file ID
    driveFileName,   // Original file name
    driveFileUrl,    // Shareable Drive URL
    orderIndex,
  } = await req.json();

  if (!moduleId || !title) {
    return NextResponse.json({ error: "moduleId and title are required" }, { status: 400 });
  }

  const [lesson] = await db
    .insert(lessons)
    .values({
      moduleId,
      title,
      videoUrl: videoUrl || null,
      gumletAssetId: gumletAssetId || null,
      content: content || null,
      driveFileId: driveFileId || null,
      driveFileName: driveFileName || null,
      driveFileUrl: driveFileUrl || null,
      orderIndex: orderIndex ?? 0,
    })
    .returning();

  return NextResponse.json(lesson);
}

// PUT /api/courses/[id]/lessons — update an existing lesson
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    lessonId,
    title,
    videoUrl,
    gumletAssetId,
    content,
    driveFileId,
    driveFileName,
    driveFileUrl,
  } = await req.json();

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(lessons)
    .set({
      ...(title !== undefined && { title }),
      ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
      ...(gumletAssetId !== undefined && { gumletAssetId: gumletAssetId || null }),
      ...(content !== undefined && { content: content || null }),
      ...(driveFileId !== undefined && { driveFileId: driveFileId || null }),
      ...(driveFileName !== undefined && { driveFileName: driveFileName || null }),
      ...(driveFileUrl !== undefined && { driveFileUrl: driveFileUrl || null }),
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, lessonId))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/courses/[id]/lessons?lessonId=xxx
export async function DELETE(req: NextRequest) {
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
