import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { courses as coursesTable, modules, lessons } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";

type Lesson = typeof lessons.$inferSelect;

// GET /api/courses/[id]/builder — fetch course data for builder
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: courseId } = await params;

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const modulesData = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(asc(modules.orderIndex));

  const moduleIds = modulesData.map((m) => m.id);
  let lessonsData: Lesson[] = [];
  if (moduleIds.length > 0) {
    lessonsData = await db
      .select()
      .from(lessons)
      .where(inArray(lessons.moduleId, moduleIds))
      .orderBy(asc(lessons.orderIndex));
  }

  const modulesWithLessons = modulesData.map((mod) => ({
    ...mod,
    lessons: lessonsData.filter((l) => l.moduleId === mod.id),
  }));

  return NextResponse.json({ course, modules: modulesWithLessons });
}
