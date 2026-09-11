import styles from "../../admin.module.css";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { courses, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function ManageCourses() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'ADMIN';
  const userId = session.user.id!;

  // If Admin, fetch all courses with instructor info. Else only their own.
  const allCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      isPublished: courses.isPublished,
      createdAt: courses.createdAt,
      instructorId: courses.instructorId,
      instructorName: users.fullName,
    })
    .from(courses)
    .leftJoin(users, eq(courses.instructorId, users.id))
    .where(isAdmin ? undefined : eq(courses.instructorId, userId))
    .orderBy(desc(courses.createdAt));

  const deleteCourse = async (formData: FormData) => {
    "use server";
    const courseId = formData.get('courseId') as string;
    const { db: dbInner } = await import("@/db");
    const { courses: coursesTable } = await import("@/db/schema");
    const { eq: eqInner } = await import("drizzle-orm");
    await dbInner.delete(coursesTable).where(eqInner(coursesTable.id, courseId));
    const { redirect: redirectInner } = await import("next/navigation");
    redirectInner('/dashboard/courses');
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isAdmin ? 'All Platform Courses' : 'My Courses'}</h1>
          {isAdmin && <p style={{ color: 'var(--text-secondary)' }}>You have Admin privileges to manage all courses.</p>}
        </div>
        <Link href="/dashboard/courses/new" className={styles.primaryAction}>
          + Create Course
        </Link>
      </div>

      {(!allCourses || allCourses.length === 0) ? (
        <div className={styles.emptyState}>
          <h3>No courses found</h3>
          <p>Structure your YouTube videos into a complete learning experience.</p>
          <Link href="/dashboard/courses/new" className={styles.primaryAction}>
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className={styles.statsGrid}>
          {allCourses.map((course) => (
            <div key={course.id} className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              
              <div style={{ fontWeight: '600', fontSize: '1.25rem', paddingRight: '2rem' }}>{course.title}</div>
              
              {/* Delete Form */}
              <form action={deleteCourse} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <input type="hidden" name="courseId" value={course.id} />
                <button 
                  type="submit" 
                  title="Delete Course"
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </form>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Status: {course.isPublished ? (
                  <span style={{ color: '#10b981' }}>Published</span>
                ) : (
                  <span style={{ color: '#f59e0b' }}>Draft</span>
                )}
                {isAdmin && course.instructorName && (
                  <div style={{ marginTop: '0.25rem' }}>Instructor: {course.instructorName}</div>
                )}
              </div>
              <Link 
                href={`/dashboard/courses/${course.id}/builder`}
                className={styles.primaryAction} 
                style={{ textAlign: 'center', marginTop: 'auto', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                Edit Curriculum
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
