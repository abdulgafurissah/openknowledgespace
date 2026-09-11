import Link from "next/link";
import { db } from "@/db";
import { courses as coursesTable } from "@/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";
import styles from "./courses.module.css";
import CourseFilters from "./CourseFilters";
import Navbar from "@/components/Navbar";

export const revalidate = 60;

// Update the type signature for searchParams in Next.js 15
export default async function CoursesCatalog({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const params = await searchParams;
  const query = params.q;

  let whereClause = eq(coursesTable.isPublished, true);
  if (query) {
    whereClause = and(whereClause, ilike(coursesTable.title, `%${query}%`))!;
  }

  const courses = await db.query.courses.findMany({
    where: whereClause,
    orderBy: [desc(coursesTable.createdAt)],
    with: {
      instructor: {
        columns: {
          fullName: true,
          avatarUrl: true,
        }
      }
    }
  });

  return (
    <>
      {/* ── Navbar ── */}
      <Navbar />

      <div className={styles.catalogContainer}>
        <div className={styles.catalogHeader}>
          <p className={styles.catalogBismillah} lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <h1 className={`${styles.catalogTitle} gradient-text`}>Explore Courses</h1>
          <div className={styles.ornamentDivider}>
            <span className={styles.ornamentLine} />
            <span className={styles.ornamentStar}>✦</span>
            <span className={styles.ornamentLine} />
          </div>
          <p className={styles.catalogSubtitle}>
            Structured courses in Quran, Arabic, Fiqh, and Islamic sciences — free for every seeker.
          </p>
        </div>

        <CourseFilters />

        <div className={styles.courseGrid}>
          {(!courses || courses.length === 0) && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📖</span>
              <p>{query ? `No courses found for "${query}"` : 'No published courses yet. Check back soon, in sha Allah.'}</p>
            </div>
          )}

          {courses &&
            courses.map((course) => (
              <Link
                href={`/courses/${course.id}`}
                key={course.id}
                className={styles.courseCard}
              >
                <div className={styles.thumbnailPlaceholder}>
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className={styles.thumbnailImg}
                    />
                  ) : (
                    <span className={styles.thumbnailIcon}>📖</span>
                  )}
                  <div className={styles.thumbnailOverlay} />
                </div>
                <div className={styles.courseContent}>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseDescription}>{course.description}</p>
                  <div className={styles.courseFooter}>
                    <div className={styles.instructorInfo}>
                      <div className={styles.instructorAvatar}>
                        {course.instructor?.avatarUrl && (
                          <img
                            src={course.instructor.avatarUrl}
                            alt={course.instructor.fullName}
                          />
                        )}
                      </div>
                      <span className={styles.instructorName}>
                        {course.instructor?.fullName || "Instructor"}
                      </span>
                    </div>
                    <span className={styles.viewLabel}>Begin →</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p lang="ar" className={styles.footerArabic}>
          وَقُل رَّبِّ زِدْنِي عِلْمًا
        </p>
        <p className={styles.footerTranslation}>
          &ldquo;And say: My Lord, increase me in knowledge.&rdquo; &mdash; Surah Ta-Ha 20:114
        </p>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} Open Knowledge Space
        </p>
      </footer>
    </>
  );
}
