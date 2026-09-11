import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { modules } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/courses/[id]/modules — add a module
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: courseId } = await params;
  const { title, orderIndex } = await req.json();

  const [mod] = await db
    .insert(modules)
    .values({ courseId, title, orderIndex })
    .returning();

  return NextResponse.json(mod);
}

// DELETE /api/courses/[id]/modules?moduleId=xxx
export async function DELETE(
  req: NextRequest
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  }

  await db.delete(modules).where(eq(modules.id, moduleId));
  return NextResponse.json({ success: true });
}
