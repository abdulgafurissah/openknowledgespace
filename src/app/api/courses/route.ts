import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { courses } from "@/db/schema";

// POST /api/courses — create a new course
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, thumbnailUrl, thumbnailDriveId } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const [course] = await db
    .insert(courses)
    .values({
      title,
      description: description || null,
      thumbnailUrl: thumbnailUrl || null,
      thumbnailDriveId: thumbnailDriveId || null,
      instructorId: session.user.id,
    })
    .returning();

  return NextResponse.json(course);
}
