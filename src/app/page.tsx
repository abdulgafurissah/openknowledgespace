import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { courses as coursesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";

export default async function Home() {
  // Fetch a few featured courses for the homepage
  const courses = await db.select({
    id: coursesTable.id,
    title: coursesTable.title,
    description: coursesTable.description,
    thumbnailUrl: coursesTable.thumbnailUrl,
  })
  .from(coursesTable)
  .where(eq(coursesTable.isPublished, true))
  .orderBy(desc(coursesTable.createdAt))
  .limit(3);

  return (
    <div className={styles.container}>
      {/* ── Navbar ── */}
      <Navbar />

      <main className={styles.main}>
        {/* ── Hero Section ── */}
        <section className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true">
            <div className={styles.heroBgOrb1} />
            <div className={styles.heroBgOrb2} />
          </div>

          <div className={styles.heroContent}>
            {/* Arabic Bismillah */}
            <p className={styles.bismillah} lang="ar">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>

            <div className={styles.ornamentDivider} aria-hidden="true">
              <span className={styles.ornamentLine} />
              <span className={styles.ornamentStar}>✦</span>
              <span className={styles.ornamentLine} />
            </div>

            <h1 className={`${styles.heroTitle} gradient-text`}>
              Seek Knowledge &<br />Illuminate Your Heart
            </h1>
            <p className={styles.heroSubtitle}>
              A structured Islamic learning platform offering courses in Quran, Arabic,
              Fiqh, Aqeedah, and more — completely free for every seeker of knowledge.
            </p>

            <div className={styles.hadithQuote}>
              <span className={styles.quoteIcon}>❝</span>
              <p>
                <em>
                  &ldquo;Seeking knowledge is an obligation upon every Muslim.&rdquo;
                </em>
              </p>
              <span className={styles.hadithSource}>— Sunan Ibn Mājah</span>
            </div>

            <div className={styles.ctaGroup}>
              <Link href="/courses" className={styles.primaryCta}>
                Explore Courses
              </Link>
              <Link href="#subjects" className={styles.secondaryCta}>
                View Subjects ↓
              </Link>
            </div>
          </div>

          {/* Decorative geometric card */}
          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.geometricFrame}>
              <div className={styles.starOuter}>
                <svg viewBox="0 0 200 200" className={styles.starSvg}>
                  <polygon
                    points="100,10 118,65 175,65 129,100 147,155 100,120 53,155 71,100 25,65 82,65"
                    fill="none"
                    stroke="rgba(201,168,76,0.4)"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="100,30 113,72 157,72 122,97 135,139 100,115 65,139 78,97 43,72 87,72"
                    fill="none"
                    stroke="rgba(201,168,76,0.2)"
                    strokeWidth="1"
                  />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1" />
                  <circle cx="100" cy="100" r="6" fill="rgba(201,168,76,0.6)" />
                </svg>
              </div>
              <div className={styles.statsCards}>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>∞</span>
                  <span className={styles.statLabel}>Free Access</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>📖</span>
                  <span className={styles.statLabel}>Quran & Sunnah</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNumber}>🌙</span>
                  <span className={styles.statLabel}>Daily Lessons</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Subjects Section ── */}
        <section className={styles.subjects} id="subjects">
          <div className={styles.sectionHeader}>
            <h2>Disciplines of Knowledge</h2>
            <div className={styles.ornamentDivider} aria-hidden="true">
              <span className={styles.ornamentLine} />
              <span className={styles.ornamentStar}>✦</span>
              <span className={styles.ornamentLine} />
            </div>
            <p className={styles.sectionSubtitle}>
              Explore the rich tradition of Islamic scholarship across multiple disciplines
            </p>
          </div>

          <div className={styles.subjectGrid}>
            {[
              { icon: "📖", title: "Quran Studies", desc: "Tajweed, Tafsir, memorization techniques and recitation" },
              { icon: "🌙", title: "Aqeedah", desc: "Islamic creed, theology and foundations of belief" },
              { icon: "⚖️", title: "Fiqh", desc: "Islamic jurisprudence covering worship and daily life" },
              { icon: "🖋️", title: "Arabic Language", desc: "Quranic Arabic, grammar (Nahw & Sarf), and comprehension" },
              { icon: "📜", title: "Hadith Sciences", desc: "Mustalah al-Hadith, chain analysis, and major collections" },
              { icon: "🕌", title: "Islamic History", desc: "Seerah of the Prophet ﷺ and history of the Ummah" },
            ].map((subject) => (
              <div key={subject.title} className={styles.subjectCard}>
                <span className={styles.subjectIcon}>{subject.icon}</span>
                <h3 className={styles.subjectTitle}>{subject.title}</h3>
                <p className={styles.subjectDesc}>{subject.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured Courses ── */}
        {courses && courses.length > 0 && (
          <section className={styles.featuredSection}>
            <div className={styles.sectionHeader}>
              <h2>Featured Courses</h2>
              <div className={styles.ornamentDivider} aria-hidden="true">
                <span className={styles.ornamentLine} />
                <span className={styles.ornamentStar}>✦</span>
                <span className={styles.ornamentLine} />
              </div>
            </div>
            <div className={styles.featuredGrid}>
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className={styles.featuredCard}>
                  <div className={styles.featuredThumbnail}>
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} />
                    ) : (
                      <span className={styles.thumbnailIcon}>📖</span>
                    )}
                  </div>
                  <div className={styles.featuredContent}>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <span className={styles.viewCourse}>Begin Learning →</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className={styles.viewAllWrap}>
              <Link href="/courses" className={styles.viewAllBtn}>
                View All Courses
              </Link>
            </div>
          </section>
        )}

        {/* ── Why Section ── */}
        <section className={styles.whySection}>
          <div className={styles.whyCard}>
            <div className={styles.whyInner}>
              <span className={styles.whyIcon}>🕌</span>
              <h2>Knowledge is Sadaqah Jariyah</h2>
              <div className={styles.ornamentDivider} aria-hidden="true">
                <span className={styles.ornamentLine} />
                <span className={styles.ornamentStar}>✦</span>
                <span className={styles.ornamentLine} />
              </div>
              <p>
                This platform is built on the Islamic principle that knowledge shared is a
                continuous charity. All courses are free, no registration required. Simply
                visit, learn, and act upon what you learn.
              </p>
              <Link href="/courses" className={styles.primaryCta} style={{ display: "inline-block", marginTop: "1.5rem" }}>
                Begin Your Journey
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand} style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/logo.png" alt="Open Knowledge Space Logo" width={160} height={60} style={{ objectFit: "contain" }} />
          </div>
          <p className={styles.footerTagline}>
            &ldquo;And say: My Lord, increase me in knowledge.&rdquo; &mdash; Surah Ta-Ha 20:114
          </p>
          <div className={styles.footerLinks}>
            <Link href="/courses">Courses</Link>
          </div>
          <div className={styles.footerDivider} />
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} Open Knowledge Space. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
