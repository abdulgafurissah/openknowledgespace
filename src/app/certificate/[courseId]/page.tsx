import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CertificateDownloader from "@/components/CertificateDownloader";
import { db } from "@/db";
import { users, courses, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  // 1. Get authenticated user
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // 2. Get user's full name from DB
  const [userRecord] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, userId));

  const studentName = userRecord?.fullName || "Student";

  // 3. Get Course with modules and lessons
  const courseData = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      modules: {
        with: {
          lessons: {
            columns: { id: true },
          },
        },
      },
    },
  });

  if (!courseData) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Course not found.</div>;
  }

  // Get instructor name
  const [instructorRecord] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, courseData.instructorId));

  // 4. Verify 100% Completion
  const allLessonIds = (courseData.modules || []).flatMap((m: { lessons: { id: string }[] }) =>
    (m.lessons || []).map((l: { id: string }) => l.id)
  );

  if (allLessonIds.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>This course has no lessons.</div>;
  }

  const progressData = await db
    .select({ lessonId: userProgress.lessonId, completedAt: userProgress.completedAt })
    .from(userProgress)
    .where(
      eq(userProgress.userId, userId)
    )
    .then(rows => rows.filter(r => allLessonIds.includes(r.lessonId)));

  const completedLessonIds = progressData.map(p => p.lessonId);
  const completedCount = allLessonIds.filter((id: string) => completedLessonIds.includes(id)).length;

  if (completedCount < allLessonIds.length) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Course Not Completed</h2>
        <p>You must complete all lessons before viewing your certificate.</p>
        <p>Progress: {completedCount} / {allLessonIds.length}</p>
      </div>
    );
  }

  // Find the latest completion date
  const completionDates = progressData.map(p => new Date(p.completedAt).getTime());
  const completedAt = completionDates.length > 0 ? new Date(Math.max(...completionDates)) : new Date();

  const instructorName = instructorRecord?.fullName || "Authorized Instructor";


  return (
    <div style={{ minHeight: '100vh', background: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      
      {/* Import custom fonts for the certificate */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        
        .cert-container {
          width: 1056px;
          height: 816px;
          background-color: #ffffff;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2h2v2h20v2H22v2.5h-2zm0 1.5h-2V26H0v2h18v12h2V28h20v-2H20v-4zM0 10h18V0h2v10h20v2H20v2.5h-2V12H0v-2z' fill='%23d4af37' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 90px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .cert-border-outer {
          position: absolute;
          top: 24px; left: 24px; right: 24px; bottom: 24px;
          border: 4px solid #d4af37;
          pointer-events: none;
        }

        .cert-border-inner {
          position: absolute;
          top: 36px; left: 36px; right: 36px; bottom: 36px;
          border: 1px solid #d4af37;
          pointer-events: none;
        }
        
        .cert-border-inner-2 {
          position: absolute;
          top: 40px; left: 40px; right: 40px; bottom: 40px;
          border: 1px solid #d4af37;
          pointer-events: none;
        }

        .corner-ornament {
          position: absolute;
          width: 90px;
          height: 90px;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L100,0 L100,10 L10,10 L10,100 L0,100 Z' fill='%23d4af37'/%3E%3Cpath d='M20,20 L80,20 L20,80 Z' fill='%23d4af37'/%3E%3C/svg%3E");
          background-size: contain;
        }
        .top-left { top: 24px; left: 24px; }
        .top-right { top: 24px; right: 24px; transform: rotate(90deg); }
        .bottom-right { bottom: 24px; right: 24px; transform: rotate(180deg); }
        .bottom-left { bottom: 24px; left: 24px; transform: rotate(270deg); }

        .bismillah {
          font-family: 'Amiri', serif;
          font-size: 2.5rem;
          color: #d4af37;
          margin-bottom: 0.5rem;
          margin-top: 10px;
          line-height: 1;
        }

        .brand-name {
          font-family: 'Cinzel', serif;
          font-size: 3rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: 10px;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .title {
          font-family: 'Cinzel', serif;
          font-size: 3rem;
          font-weight: 700;
          color: #d4af37;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
        }

        .subtitle {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1.25rem;
          color: #475569;
          margin-bottom: 1rem;
        }

        .student-name {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
          border-bottom: 2px solid #d4af37;
          padding-bottom: 0.5rem;
          display: inline-block;
          min-width: 60%;
        }

        .description {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: #475569;
          max-width: 650px;
          line-height: 1.6;
          margin: 1rem auto 2rem;
        }

        .course-title {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2rem;
        }

        .footer-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          width: 85%;
          margin-top: auto;
          margin-bottom: 10px;
        }

        .signature-block {
          text-align: center;
          width: 280px;
        }

        .signature-line {
          border-top: 1px solid #0f172a;
          margin-bottom: 0.5rem;
        }

        .signature-name {
          font-family: 'Cinzel', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .signature-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1rem;
          color: #64748b;
        }

        .seal {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px double #d4af37;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px -1px rgba(212, 175, 55, 0.2);
        }
        
        .seal-inner {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #d4af37;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-family: 'Amiri', serif;
          font-size: 2.5rem;
        }
      `}} />

      <CertificateDownloader courseTitle={courseData.title} studentName={studentName} />

      <div id="certificate-node" className="cert-container">
        <div className="cert-border-outer"></div>
        <div className="cert-border-inner"></div>
        <div className="cert-border-inner-2"></div>
        
        <div className="corner-ornament top-left"></div>
        <div className="corner-ornament top-right"></div>
        <div className="corner-ornament bottom-left"></div>
        <div className="corner-ornament bottom-right"></div>

        <div className="bismillah" lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        
        <div className="brand-name">Open Knowledge Space</div>
        
        <h1 className="title">Certificate of Completion</h1>

        <div className="subtitle">This proudly certifies that</div>

        <div className="student-name">{studentName}</div>

        <div className="description">
          has demonstrated exceptional dedication and successfully completed the comprehensive requirements for the structured course in
        </div>

        <div className="course-title">{courseData.title}</div>

        <div className="footer-grid">
          <div className="signature-block">
            <div className="signature-line"></div>
            <div className="signature-name">{instructorName}</div>
            <div className="signature-title">Course Instructor</div>
          </div>

          <div className="seal">
            <div className="seal-inner">إرشاد</div>
          </div>

          <div className="signature-block">
            <div className="signature-line"></div>
            <div className="signature-name">
              {completedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="signature-title">Date of Completion</div>
          </div>
        </div>

      </div>
    </div>
  );
}
