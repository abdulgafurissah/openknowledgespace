"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../../../learn.module.css";
import { toggleCompletionAction } from "./actions";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string | null;
  orderIndex: number;
}

interface Module {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
}

export default function LessonClient({
  course,
  modules,
  currentLesson,
  initialCompletedLessons,
}: {
  course: Course;
  modules: Module[];
  currentLesson: Lesson;
  initialCompletedLessons: string[];
}) {
  const [completedLessons, setCompletedLessons] = useState<string[]>(initialCompletedLessons);
  const [savingProgress, setSavingProgress] = useState(false);

  const isCompleted = completedLessons.includes(currentLesson.id);

  const toggleCompletion = async () => {
    if (savingProgress) return;
    setSavingProgress(true);

    try {
      await toggleCompletionAction(currentLesson.id, isCompleted);
      if (isCompleted) {
        setCompletedLessons(completedLessons.filter(id => id !== currentLesson.id));
      } else {
        setCompletedLessons([...completedLessons, currentLesson.id]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save progress");
    }
    
    setSavingProgress(false);
  };

  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100);

  const allLessons = modules.flatMap(mod => mod.lessons);
  const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  return (
    <div className={styles.learnLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.courseTitle}>
            <Link href={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              &larr; {course.title}
            </Link>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressText}>{progressPercent}% Complete</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className={styles.curriculumList}>
          {modules.map(mod => (
            <div key={mod.id} className={styles.moduleSection}>
              <div className={styles.moduleHeader}>{mod.title}</div>
              {mod.lessons.map(lesson => {
                const isActive = lesson.id === currentLesson.id;
                const isLessonCompleted = completedLessons.includes(lesson.id);
                return (
                  <Link 
                    href={`/learn/${course.id}/lesson/${lesson.id}`} 
                    key={lesson.id}
                    className={`${styles.lessonLink} ${isActive ? styles.active : ''}`}
                  >
                    <div className={`${styles.checkIcon} ${isLessonCompleted ? styles.completed : ''}`}>
                      {isLessonCompleted && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    {lesson.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.videoHeader}>
          <h1 className={styles.lessonTitle}>{currentLesson.title}</h1>
          <button 
            className={`${styles.markCompleteBtn} ${isCompleted ? styles.completed : ''}`}
            onClick={toggleCompletion}
            disabled={savingProgress}
          >
            {savingProgress ? "Saving..." : isCompleted ? "✓ Completed" : "Mark as Complete"}
          </button>
        </div>

        <div className={styles.videoContainer}>
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${currentLesson.videoUrl}?rel=0`} 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            style={{ border: 'none' }}
          ></iframe>
        </div>

        <div className={styles.lessonContent}>
          <h2>About this lesson</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: '1.8' }}>
            In this lesson, we will cover the core concepts behind {currentLesson.title}. 
            Make sure to follow along with the video and take notes. If you have any questions, 
            refer to the downloadable resources below.
          </p>

          <div className={styles.resourcesSection}>
            <h3>Downloadable Resources</h3>
            <div className={styles.resourceCard}>
              <div className={styles.resourceIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <strong>Lesson Notes (PDF)</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Coming soon...</div>
              </div>
            </div>
          </div>

          <div className={styles.navigationSection}>
            {prevLesson ? (
              <Link href={`/learn/${course.id}/lesson/${prevLesson.id}`} className={styles.navButton}>
                &larr; Previous: {prevLesson.title}
              </Link>
            ) : <div />}
            
            {nextLesson ? (
              <Link href={`/learn/${course.id}/lesson/${nextLesson.id}`} className={styles.navButtonPrimary}>
                Next: {nextLesson.title} &rarr;
              </Link>
            ) : (
              <Link href={`/dashboard`} className={styles.navButton}>
                Finish Course
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
