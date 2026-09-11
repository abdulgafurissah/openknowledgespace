import Link from "next/link";
import { db } from "@/db";
import { courses as coursesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import styles from "../courses.module.css";
import Navbar from "@/components/Navbar";

export default async function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const course = await db.query.courses.findFirst({
    where: eq(coursesTable.id, id),
    with: {
      instructor: {
        columns: { fullName: true }
      },
      modules: {
        with: {
          lessons: true
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Sort modules and lessons by orderIndex
  const modules = [...(course.modules || [])].sort((a, b) => a.orderIndex - b.orderIndex).map(mod => ({
    ...mod,
    lessons: [...(mod.lessons || [])].sort((a, b) => a.orderIndex - b.orderIndex)
  }));

  // Find first lesson ID for the enroll button
  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;

  return (
    <>
      <Navbar />

      <div className={styles.catalogContainer}>
        <div className={styles.courseHeader}>
          <Link href="/courses" className={styles.backButton}>
            &larr; Back to Catalog
          </Link>
          <h1 className={styles.catalogTitle} style={{ marginTop: '1rem' }}>{course.title}</h1>
          <p className={styles.courseInstructor}>Instructor: {course.instructor?.fullName || "Instructor"}</p>
          <p className={styles.courseDescription} style={{ maxWidth: '800px', margin: '1rem 0 2rem' }}>
            {course.description}
          </p>

          {firstLessonId ? (
            <Link href={`/learn/${course.id}/lesson/${firstLessonId}`} className={styles.enrollButton}>
              Start Learning Now
            </Link>
          ) : (
            <div style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
              This course doesn&apos;t have any lessons yet.
            </div>
          )}
        </div>

        <div className={styles.curriculumSection}>
          <h2 className={styles.curriculumTitle}>Course Curriculum</h2>
          
          {modules.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No curriculum available.</p>
          ) : (
            modules.map((mod, i) => (
              <div key={mod.id} className={styles.moduleItem}>
                <div className={styles.moduleTitle}>
                  <span style={{ color: 'var(--accent-primary)' }}>Module {i + 1}:</span> {mod.title}
                </div>
                <ul className={styles.lessonList}>
                  {mod.lessons.map(lesson => (
                    <li key={lesson.id} className={styles.lessonItem}>
                      {lesson.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
