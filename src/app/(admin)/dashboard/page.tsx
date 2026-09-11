import styles from "../admin.module.css";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { courses, userProgress } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role || 'STUDENT';
  const isInstructor = role === 'INSTRUCTOR' || role === 'ADMIN';

  if (isInstructor) {
    return <InstructorDashboard userId={session.user.id!} />;
  } else {
    return <StudentDashboard userId={session.user.id!} />;
  }
}

async function InstructorDashboard({ userId }: { userId: string }) {
  // Fetch courses with module/lesson counts
  const instructorCourses = await db.query.courses.findMany({
    where: eq(courses.instructorId, userId),
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
  });

  const activeCourses = instructorCourses.filter(c => c.isPublished).length;

  let totalLessons = 0;
  instructorCourses.forEach(course => {
    course.modules?.forEach((mod) => {
      totalLessons += mod.lessons?.length || 0;
    });
  });

  // Count unique students who completed any lesson in instructor's courses
  const courseIds = instructorCourses.map(c => c.id);
  let uniqueStudents = 0;
  if (courseIds.length > 0) {
    const lessonIds = instructorCourses
      .flatMap(c => c.modules || [])
      .flatMap((m) => m.lessons || [])
      .map((l) => l.id);

    if (lessonIds.length > 0) {
      const progressRows = await db
        .selectDistinct({ userId: userProgress.userId })
        .from(userProgress)
        .where(inArray(userProgress.lessonId, lessonIds));
      uniqueStudents = progressRows.length;
    }
  }

  const recentCourses = [...instructorCourses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome to the instructor dashboard. Manage your courses and students.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/" className={styles.secondaryAction}>
            &larr; Go to Home Page
          </Link>
          <Link href="/dashboard/courses/new" className={styles.primaryAction}>
            + Create Course
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Students</div>
          <div className={styles.statValue}>{uniqueStudents}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Courses</div>
          <div className={styles.statValue}>{activeCourses}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Lessons</div>
          <div className={styles.statValue}>{totalLessons}</div>
        </div>
      </div>

      <h2>Recent Activity</h2>
      {(!recentCourses || recentCourses.length === 0) ? (
        <div className={styles.emptyState} style={{ marginTop: '1.5rem' }}>
          <h3>No activity yet</h3>
          <p>Start by creating your first course and adding lessons.</p>
          <Link href="/dashboard/courses/new" className={styles.primaryAction}>
            Create Course
          </Link>
        </div>
      ) : (
        <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
          {recentCourses.map(course => (
             <div key={course.id} className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{course.title}</div>
               <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                 {course.isPublished ? 'Published' : 'Draft'}
               </div>
               <Link 
                 href={`/dashboard/courses/${course.id}/builder`}
                 className={styles.primaryAction} 
                 style={{ textAlign: 'center', marginTop: 'auto', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
               >
                 View Curriculum
               </Link>
             </div>
          ))}
        </div>
      )}
    </>
  );
}

async function StudentDashboard({ userId }: { userId: string }) {
  // Get all user progress lesson IDs
  const progressRows = await db
    .select({ lessonId: userProgress.lessonId })
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  const completedLessonIds = progressRows.map(p => p.lessonId);

  // Get all published courses with modules and lessons
  const allCourses = await db.query.courses.findMany({
    where: eq(courses.isPublished, true),
    with: {
      modules: {
        with: {
          lessons: true,
        },
      },
    },
  });

  const enrolledCourses = allCourses
    .filter(course => {
      const courseLessonIds = (course.modules || [])
        .flatMap((m) => (m.lessons || []).map((l) => l.id));
      return courseLessonIds.some((id: string) => completedLessonIds.includes(id));
    })
    .map(course => {
      const courseLessonIds = (course.modules || [])
        .flatMap((m) => (m.lessons || []).map((l) => l.id));
      const completedCount = courseLessonIds.filter((id: string) => completedLessonIds.includes(id)).length;
      const progressPercent = courseLessonIds.length > 0
        ? Math.round((completedCount / courseLessonIds.length) * 100)
        : 0;
      return { ...course, progressPercent, completedCount, totalLessons: courseLessonIds.length };
    });

  // Find the next lesson to continue
  let continueLink = null;
  let continueCourseTitle = "";

  const inProgressCourse = enrolledCourses.find(c => c.progressPercent > 0 && c.progressPercent < 100);
  if (inProgressCourse) {
    const allLessons = (inProgressCourse.modules || [])
      .flatMap((m) => (m.lessons || []).map((l) => l.id));
    const nextLessonId = allLessons.find((id: string) => !completedLessonIds.includes(id));
    if (nextLessonId) {
      continueLink = `/learn/${inProgressCourse.id}/lesson/${nextLessonId}`;
      continueCourseTitle = inProgressCourse.title;
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Learning</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back! Continue learning where you left off.
          </p>
        </div>
        <Link href="/" className={styles.secondaryAction}>
          &larr; Go to Home Page
        </Link>
      </div>

      {continueLink && (
        <div style={{ 
          background: 'linear-gradient(135deg, var(--bg-tertiary), rgba(30, 158, 110, 0.1))',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Continue Learning</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Pick up where you left off in <strong>{continueCourseTitle}</strong>.</p>
          </div>
          <Link href={continueLink} className={styles.primaryAction} style={{ padding: '0.75rem 2rem' }}>
            Jump Back In &rarr;
          </Link>
        </div>
      )}

      {enrolledCourses.length === 0 ? (
        <div className={styles.emptyState} style={{ marginTop: '1.5rem' }}>
          <h3>No enrolled courses</h3>
          <p>You haven&apos;t started any courses yet.</p>
          <Link href="/courses" className={styles.primaryAction}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
          {enrolledCourses.map(course => (
             <div key={course.id} className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{course.title}</div>
               
               <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                   <span>{course.progressPercent}% Complete</span>
                   <span>{course.completedCount}/{course.totalLessons}</span>
                 </div>
                 <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                   <div style={{ width: `${course.progressPercent}%`, height: '100%', background: 'var(--accent-primary)' }}></div>
                 </div>
               </div>

               {course.progressPercent === 100 ? (
                 <Link 
                   href={`/certificate/${course.id}`}
                   className={styles.primaryAction} 
                   style={{ textAlign: 'center', marginTop: 'auto', background: 'var(--gold-border)', color: 'var(--bg-primary)' }}
                 >
                   View Certificate 🏆
                 </Link>
               ) : (
                 <Link 
                   href={`/courses/${course.id}`}
                   className={styles.primaryAction} 
                   style={{ textAlign: 'center', marginTop: 'auto', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                 >
                   Resume Course
                 </Link>
               )}
             </div>
          ))}
        </div>
      )}
    </>
  );
}
