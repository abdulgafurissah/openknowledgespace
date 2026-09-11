"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../../admin.module.css";
import formStyles from "../../new/form.module.css";

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
  isPublished: boolean;
}

export default function CourseBuilder({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: courseId } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [newModuleName, setNewModuleName] = useState("");
  const [loading, setLoading] = useState(true);

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
    return () => {
      active = false;
    };
  }, [courseId]);

  const addModule = async () => {
    if (!newModuleName) return;
    const newOrderIndex = modules.length;

    const res = await fetch(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newModuleName, orderIndex: newOrderIndex }),
    });

    if (res.ok) {
      const data = await res.json();
      setModules([...modules, { ...data, lessons: [] }]);
      setNewModuleName("");
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module and all its lessons?")) return;

    const res = await fetch(`/api/courses/${courseId}/modules?moduleId=${moduleId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonUrl, setNewLessonUrl] = useState("");

  const handleAddLessonSubmit = async (moduleId: string) => {
    if (!newLessonTitle || !newLessonUrl) return;

    // Extract YouTube video ID from URL
    let youtubeId = newLessonUrl;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = newLessonUrl.match(regex);
    if (match && match[1]) {
      youtubeId = match[1];
    }

    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;

    const res = await fetch(`/api/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId,
        title: newLessonTitle,
        videoUrl: youtubeId,
        orderIndex: mod.lessons.length,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: [...m.lessons, data] };
        }
        return m;
      }));
      setAddingLessonToModule(null);
      setNewLessonTitle("");
      setNewLessonUrl("");
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const res = await fetch(`/api/courses/${courseId}/lessons?lessonId=${lessonId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      }));
    }
  };

  const publishCourse = async () => {
    const res = await fetch(`/api/courses/${courseId}/lessons`, {
      method: 'PATCH',
    });

    if (res.ok) {
      alert("Course published successfully!");
      router.push("/dashboard/courses");
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading course data...</div>;
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Curriculum: {course?.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Structure your course by adding modules and YouTube lessons. Changes are saved automatically.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={formStyles.secondaryButton} onClick={() => router.push("/dashboard/courses")}>
            Back to Courses
          </button>
          {!course?.isPublished && (
            <button className={styles.primaryAction} onClick={publishCourse}>
              Publish Course
            </button>
          )}
        </div>
      </div>

      <div className={formStyles.builderSection}>
        {modules.map((mod, index) => (
          <div key={mod.id} className={formStyles.moduleCard}>
            <div className={formStyles.moduleHeader}>
              <div className={formStyles.moduleTitle}>
                Module {index + 1}: {mod.title}
              </div>
              <button 
                className={formStyles.secondaryButton} 
                style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => deleteModule(mod.id)}
                title="Delete Module"
              >
                Delete
              </button>
            </div>
            
            <div className={formStyles.lessonList}>
              {mod.lessons.map((lesson, lIndex) => (
                <div key={lesson.id} className={formStyles.lessonItem}>
                  <div style={{ flex: 1 }}>
                    <div>
                      <strong>Lesson {lIndex + 1}:</strong> {lesson.title}
                    </div>
                    <div className={formStyles.youtubeLink}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      {lesson.videoUrl}
                    </div>
                  </div>
                  <button 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                    onClick={() => deleteLesson(mod.id, lesson.id)}
                    title="Delete Lesson"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {addingLessonToModule === mod.id ? (
              <div className={formStyles.formGroup} style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <input 
                  type="text" 
                  placeholder="Lesson Title" 
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input 
                  type="text" 
                  placeholder="YouTube URL" 
                  value={newLessonUrl}
                  onChange={(e) => setNewLessonUrl(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    className={styles.primaryAction} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    onClick={() => handleAddLessonSubmit(mod.id)}
                  >
                    Save Lesson
                  </button>
                  <button 
                    className={formStyles.secondaryButton} 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    onClick={() => setAddingLessonToModule(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className={formStyles.addLessonBtn}
                onClick={() => {
                  setAddingLessonToModule(mod.id);
                  setNewLessonTitle("");
                  setNewLessonUrl("");
                }}
              >
                + Add Video Lesson
              </button>
            )}
          </div>
        ))}

        <div className={formStyles.moduleCard} style={{ background: 'transparent', borderStyle: 'dashed' }}>
          <div className={formStyles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="New Module Name..." 
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button 
              className={styles.primaryAction} 
              onClick={addModule}
              disabled={!newModuleName}
            >
              Add Module
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
