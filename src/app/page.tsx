import Link from "next/link";
import Image from "next/image";
import { db } from "@/db";
import { courses as coursesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import HomeHeroSlider, { SlideData } from "@/components/HomeHeroSlider";
import { getSubstackPosts } from "@/lib/substack";

export const revalidate = 60;

export default async function Home() {
  // Fetch a few featured courses for the homepage
  const courses = await db
    .select({
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

  // Fetch latest Substack articles
  const substackPosts = await getSubstackPosts();
  const latestCourse = courses[0];
  const latestEvent = latestEvents[0];
  const latestArticle = substackPosts[0];
  const recentArticles = substackPosts.slice(0, 3);

  const slides: SlideData[] = [
    {
      type: "default",
      title: "Seek Knowledge &\nIlluminate Your Heart",
      description:
        "A structured Islamic learning platform offering courses in Quran, Arabic, Fiqh, Aqeedah, and more — completely free for every seeker of knowledge.",
      ctaText: "Explore Courses",
      ctaLink: "/courses",
    },
  ];

  if (latestCourse) {
    slides.push({
      type: "course",
      badge: "✨ New Course",
      title: latestCourse.title,
      description: latestCourse.description || "Join our latest course to expand your knowledge.",
      ctaText: "Begin Learning",
      ctaLink: `/courses/${latestCourse.id}`,
      imageUrl: latestCourse.thumbnailUrl,
    });
  }

  if (latestEvent) {
    slides.push({
      type: "event",
      badge: "📅 Upcoming Event",
      title: latestEvent.title,
      description: latestEvent.description || "Don't miss our upcoming event. Register now!",
      ctaText: "Register Now",
      ctaLink: `/events/${latestEvent.id}`,
      imageUrl: latestEvent.bannerUrl,
    });
  }

  if (latestArticle) {
    const slug = latestArticle.link
      ? latestArticle.link.split("?")[0].split("/").filter(Boolean).pop() ?? latestArticle.guid
      : latestArticle.guid;

    slides.push({
      type: "course",
      badge: "📝 Latest Substack Publication",
      title: latestArticle.title,
      description: latestArticle.description || "Read our latest article on religion, faith, and knowledge.",
      ctaText: "Read Article",
      ctaLink: `/blog/${slug}`,
      imageUrl: latestArticle.thumbnail ?? undefined,
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

        {/* ── Latest Articles & Insights (From Substack) ── */}
        {recentArticles && recentArticles.length > 0 && (
          <section
            className={styles.featuredSection}
            style={{
              backgroundColor: "var(--bg-secondary, #ece6dc)",
              borderTop: "1px solid var(--border-color)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div className={styles.sectionHeader}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono, sans-serif)",
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--accent-primary, #d4a843)",
                  marginBottom: "0.5rem",
                }}
              >
                ✦ From Our Newsletter
              </span>
              <h2>Articles &amp; Insights</h2>
              <div className={styles.ornamentDivider} aria-hidden="true">
                <span className={styles.ornamentLine} />
                <span className={styles.ornamentStar}>✦</span>
                <span className={styles.ornamentLine} />
              </div>
              <p className={styles.sectionSubtitle}>
                Reflections on religion, faith, and mental health — delivered fresh from our Substack
              </p>
            </div>

            <div className={styles.featuredGrid}>
              {recentArticles.map((post) => {
                const slug = post.link
                  ? post.link.split("?")[0].split("/").filter(Boolean).pop() ?? post.guid
                  : post.guid;
                const date = new Date(post.pubDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <Link key={post.guid} href={`/blog/${slug}`} className={styles.featuredCard}>
                    <div className={styles.featuredThumbnail}>
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span className={styles.thumbnailIcon}>📝</span>
                      )}
                    </div>
                    <div className={styles.featuredContent}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontFamily: "var(--font-mono, sans-serif)",
                          color: "var(--accent-primary, #d4a843)",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {date}
                      </span>
                      <h3 style={{ marginTop: "0.35rem" }}>{post.title}</h3>
                      <p>{post.description}</p>
                      <span className={styles.viewCourse}>Read Article →</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className={styles.viewAllWrap}>
              <Link href="/blog" className={styles.viewAllBtn}>
                Explore All Articles
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
              <Link href="/courses" className={styles.primaryCta} style={{ marginTop: "1.5rem" }}>
                <span>Begin Your Journey</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "var(--gold)",
                    color: "var(--bg-dark)",
                    fontSize: "0.8rem",
                    fontWeight: 900,
                  }}
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand} style={{ display: "flex", justifyContent: "center" }}>
            <Image src="/logo.png" alt="Open Knowledge Space Logo" width={160} height={60} style={{ objectFit: "contain" }} />
          </div>
          <p className={styles.footerTagline}>
            &ldquo;And say: My Lord, increase me in knowledge.&rdquo; &mdash; Surah Ta-Ha 20:114
          </p>
          <div className={styles.footerLinks}>
            <Link href="/courses">Courses</Link>
            <Link href="/events">Events</Link>
            <Link href="/suq">Open Suq</Link>
            <Link href="/blog">Blog</Link>
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
