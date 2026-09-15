import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { courses as coursesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import HomeHeroSlider, { SlideData } from "@/components/HomeHeroSlider";

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

  // Fetch latest event
  const latestEvents = await db.query.events.findMany({
    where: eq(db._.fullSchema.events.isPublished, true),
    orderBy: [desc(db._.fullSchema.events.eventDate)],
    limit: 1,
  });

  const latestEvent = latestEvents[0];
  const latestCourse = courses[0];

  const slides: SlideData[] = [
    {
      type: 'default',
      title: 'Seek Knowledge &\nIlluminate Your Heart',
      description: 'A structured Islamic learning platform offering courses in Quran, Arabic, Fiqh, Aqeedah, and more — completely free for every seeker of knowledge.',
      ctaText: 'Explore Courses',
      ctaLink: '/courses',
    }
  ];

  if (latestCourse) {
    slides.push({
      type: 'course',
      badge: '✨ New Course',
      title: latestCourse.title,
      description: latestCourse.description || 'Join our latest course to expand your knowledge.',
      ctaText: 'Begin Learning',
      ctaLink: `/courses/${latestCourse.id}`,
      imageUrl: latestCourse.thumbnailUrl,
    });
  }

  if (latestEvent) {
    slides.push({
      type: 'event',
      badge: '📅 Upcoming Event',
      title: latestEvent.title,
      description: latestEvent.description || 'Don\'t miss our upcoming event. Register now!',
      ctaText: 'Register Now',
      ctaLink: `/events/${latestEvent.id}`,
      imageUrl: latestEvent.bannerUrl,
    });
  }

  return (
    <div className={styles.container}>
      {/* ── Navbar ── */}
      <Navbar />

      <main className={styles.main}>
        {/* ── Hero Slider Section ── */}
        <HomeHeroSlider slides={slides} />

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
