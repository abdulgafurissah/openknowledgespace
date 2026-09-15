"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DriveUploader, { DriveUploadResult } from "@/components/DriveUploader";
import styles from "../../../admin.module.css";
import formStyles from "./form.module.css";

export default function CreateCourse() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbResult, setThumbResult] = useState<DriveUploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!thumbResult) {
        setError("Please upload a thumbnail image.");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description,
          thumbnailUrl: thumbResult.viewUrl,
          thumbnailDriveId: thumbResult.fileId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create course.');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/courses/${data.id}/builder`);
    } catch {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Create New Course</h1>
      </div>

      <div className={formStyles.formContainer}>
        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <div className={formStyles.formGroup}>
            <label htmlFor="title">Course Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master React in 30 Days"
              required
            />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="description">Course Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn?"
              rows={5}
            />
          </div>

          <div className={formStyles.formGroup}>
            <label>Course Thumbnail *</label>
            <DriveUploader
              accept="image/*"
              label="Upload a thumbnail for the course catalog"
              onUploadComplete={result => setThumbResult(result)}
              maxSizeMB={5}
            />
          </div>

          <div className={formStyles.formActions}>
            <button 
              type="button" 
              className={formStyles.secondaryButton}
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.primaryAction}
              disabled={loading || !title || !thumbResult}
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
