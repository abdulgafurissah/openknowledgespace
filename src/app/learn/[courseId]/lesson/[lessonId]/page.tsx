import { db } from "@/db";
import { courses, modules, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import LessonClient from "./LessonClient";

export default async function LearningRoom({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch course
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { id: true, title: true }
  });

  if (!course) {
    notFound();
  }

  // Fetch modules and lessons
  const courseModules = await db.query.modules.findMany({
    where: eq(modules.courseId, courseId),
    orderBy: (modules, { asc }) => [asc(modules.orderIndex)],
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.orderIndex)],
      }
    }
  });

  const activeLesson = courseModules.flatMap(m => m.lessons).find(l => l.id === lessonId);

  if (!activeLesson) {
    notFound();
  }

  // Fetch user progress
  const progressData = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, userId),
    columns: { lessonId: true }
  });

  const completedLessons = progressData.map(p => p.lessonId);

  return (
    <LessonClient 
      course={course}
      modules={courseModules as Parameters<typeof LessonClient>[0]['modules']}
      currentLesson={activeLesson as Parameters<typeof LessonClient>[0]['currentLesson']}
      initialCompletedLessons={completedLessons}
    />
  );
}
