"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../../admin.module.css";
import formStyles from "../../new/form.module.css";
import builderStyles from "./builder.module.css";
import LessonEditorPanel, { LessonData } from "./LessonEditorPanel";

interface Module {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonData[];
}

interface Course {
  id: string;
  title: string;
  isPublished: boolean;
}

type PanelState =
  | { type: "none" }
  | { type: "add"; moduleId: string }
  | { type: "edit"; moduleId: string; lesson: LessonData };

export default function CourseBuilder({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: courseId } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [newModuleName, setNewModuleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<PanelState>({ type: "none" });

  useEffect(() => {
    let active = true;
    async function loadData() {
      const res = await fetch(`/api/courses/${courseId}/builder`);
      if (res.ok && active) {
        const data = await res.json();
        setCourse(data.course);
        setModules(data.modules);
        setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [courseId]);

  // ── Module actions ──────────────────────────────────────────────────────────
  const addModule = async () => {
    if (!newModuleName.trim()) return;
    const res = await fetch(`/api/courses/${courseId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleName.trim(), orderIndex: modules.length }),
    });
    if (res.ok) {
      const data = await res.json();
      setModules([...modules, { ...data, lessons: [] }]);
      setNewModuleName("");
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    const res = await fetch(`/api/courses/${courseId}/modules?moduleId=${moduleId}`, { method: "DELETE" });
    if (res.ok) setModules(modules.filter((m) => m.id !== moduleId));
  };

  // ── Lesson actions ──────────────────────────────────────────────────────────
  const handleLessonSaved = (moduleId: string, lesson: LessonData) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const existing = m.lessons.find((l) => l.id === lesson.id);
        if (existing) {
          return { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? lesson : l)) };
        }
        return { ...m, lessons: [...m.lessons, lesson] };
      })
    );
    setPanel({ type: "none" });
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    const res = await fetch(`/api/courses/${courseId}/lessons?lessonId=${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
        )
      );
    }
  };

  const publishCourse = async () => {
    const res = await fetch(`/api/courses/${courseId}/lessons`, { method: "PATCH" });
    if (res.ok) {
      alert("Course published successfully!");
      router.push("/dashboard/courses");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading course…
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Curriculum: {course?.title}</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Add modules and lessons. Each lesson supports YouTube, cloud video, transcript and file attachments.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className={formStyles.secondaryButton} onClick={() => router.push("/dashboard/courses")}>
            ← Back
          </button>
          {!course?.isPublished && (
            <button className={styles.primaryAction} onClick={publishCourse}>
              Publish Course
            </button>
          )}
        </div>
      </div>

      <div className={formStyles.builderSection}>
        {/* ── Module List ── */}
        {modules.map((mod, mIdx) => (
          <div key={mod.id} className={formStyles.moduleCard}>
            {/* Module Header */}
            <div className={formStyles.moduleHeader}>
              <div className={formStyles.moduleTitle}>
                Module {mIdx + 1}: {mod.title}
              </div>
              <button
                className={formStyles.secondaryButton}
                style={{ padding: "0.25rem 0.6rem", color: "#ef4444", borderColor: "#ef4444", fontSize: "0.8rem" }}
                onClick={() => deleteModule(mod.id)}
              >
                Delete Module
              </button>
            </div>

            {/* Lesson List */}
            <div className={formStyles.lessonList}>
              {mod.lessons.map((lesson, lIdx) => {
                const hasYoutube = !!lesson.videoUrl;
                const hasGumlet = !!lesson.gumletAssetId;
                const hasContent = !!lesson.content;
                const hasFile = !!lesson.driveFileName;

                return (
                  <div key={lesson.id} className={builderStyles.lessonRow}>
                    <div className={builderStyles.lessonInfo}>
                      <span className={builderStyles.lessonNum}>
                        {mIdx + 1}.{lIdx + 1}
                      </span>
                      <div>
                        <div className={builderStyles.lessonTitle}>{lesson.title}</div>
                        <div className={builderStyles.lessonBadges}>
                          {hasYoutube && (
                            <span className={`${builderStyles.badge} ${builderStyles.badgeYt}`}>
                              🎬 YouTube
                            </span>
                          )}
                          {hasGumlet && (
                            <span className={`${builderStyles.badge} ${builderStyles.badgeCloud}`}>
                              ☁️ Cloud Video
                            </span>
                          )}
                          {!hasYoutube && !hasGumlet && (
                            <span className={`${builderStyles.badge} ${builderStyles.badgeEmpty}`}>
                              No video
                            </span>
                          )}
                          {hasContent && (
                            <span className={`${builderStyles.badge} ${builderStyles.badgeContent}`}>
                              ✍️ Transcript
                            </span>
                          )}
                          {hasFile && (
                            <span className={`${builderStyles.badge} ${builderStyles.badgeFile}`}>
                              📎 {lesson.driveFileName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={builderStyles.lessonActions}>
                      <button
                        className={builderStyles.editBtn}
                        onClick={() => {
                          setPanel({ type: "edit", moduleId: mod.id, lesson });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={builderStyles.deleteBtn}
                        onClick={() => deleteLesson(mod.id, lesson.id!)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add / Edit Lesson Panel */}
            {panel.type !== "none" && (
              (panel.type === "add" && panel.moduleId === mod.id) ||
              (panel.type === "edit" && panel.moduleId === mod.id)
            ) ? (
              <LessonEditorPanel
                courseId={courseId}
                moduleId={mod.id}
                orderIndex={mod.lessons.length}
                existingLesson={panel.type === "edit" ? panel.lesson : undefined}
                onSave={(lesson) => handleLessonSaved(mod.id, lesson)}
                onCancel={() => setPanel({ type: "none" })}
              />
            ) : (
              <button
                className={formStyles.addLessonBtn}
                onClick={() => setPanel({ type: "add", moduleId: mod.id })}
                disabled={panel.type !== "none"}
              >
                + Add Lesson
              </button>
            )}
          </div>
        ))}

        {/* ── Add Module ── */}
        <div className={formStyles.moduleCard} style={{ background: "transparent", borderStyle: "dashed" }}>
          <div
            className={formStyles.formGroup}
            style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}
          >
            <input
              type="text"
              placeholder="New Module Name…"
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addModule(); }}
              style={{ flex: 1 }}
            />
            <button
              className={styles.primaryAction}
              onClick={addModule}
              disabled={!newModuleName.trim()}
            >
              Add Module
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
