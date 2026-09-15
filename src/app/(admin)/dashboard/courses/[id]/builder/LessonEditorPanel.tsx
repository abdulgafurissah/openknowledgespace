"use client";

import { useState, useRef } from "react";
import styles from "./LessonEditorPanel.module.css";

export interface LessonData {
  id?: string;
  title: string;
  videoUrl: string | null;
  gumletAssetId: string | null;
  content: string | null;
  driveFileId: string | null;
  driveFileName: string | null;
  driveFileUrl: string | null;
  orderIndex: number;
}

interface LessonEditorPanelProps {
  courseId: string;
  moduleId: string;
  orderIndex: number;
  existingLesson?: LessonData;
  onSave: (lesson: LessonData) => void;
  onCancel: () => void;
}

type VideoTab = "youtube" | "gumlet";

export default function LessonEditorPanel({
  courseId,
  moduleId,
  orderIndex,
  existingLesson,
  onSave,
  onCancel,
}: LessonEditorPanelProps) {
  const isEditing = !!existingLesson?.id;

  // Determine initial video tab
  const initialTab: VideoTab = existingLesson?.gumletAssetId ? "gumlet" : "youtube";

  const [title, setTitle] = useState(existingLesson?.title ?? "");
  const [videoTab, setVideoTab] = useState<VideoTab>(initialTab);
  const [youtubeUrl, setYoutubeUrl] = useState(existingLesson?.videoUrl ?? "");
  const [gumletAssetId, setGumletAssetId] = useState(existingLesson?.gumletAssetId ?? "");
  const [content, setContent] = useState(existingLesson?.content ?? "");
  const [driveFileId, setDriveFileId] = useState(existingLesson?.driveFileId ?? "");
  const [driveFileName, setDriveFileName] = useState(existingLesson?.driveFileName ?? "");
  const [driveFileUrl, setDriveFileUrl] = useState(existingLesson?.driveFileUrl ?? "");

  // Gumlet upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Drive upload state
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── YouTube ID extractor ────────────────────────────────────────────────────
  function extractYoutubeId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  }

  // ── Gumlet upload flow ──────────────────────────────────────────────────────
  async function handleGumletUpload(file: File) {
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Step 1: Get signed upload URL from our API
      const initRes = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || file.name }),
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.error || "Failed to get upload URL");
      }

      const { assetId, uploadUrl } = await initRes.json();

      // Step 2: Upload file directly to Gumlet's signed S3 URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
      });

      setGumletAssetId(assetId);
      setUploadStatus("done");
      setUploadProgress(100);
    } catch (err: any) {
      setUploadStatus("error");
      setError(err.message || "Upload failed");
    }
  }

  // ── Drive file upload ───────────────────────────────────────────────────────
  async function handleDriveUpload(file: File) {
    setFileUploading(true);
    setFileUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/drive", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setDriveFileId(data.fileId);
      setDriveFileName(data.fileName);
      setDriveFileUrl(data.fileUrl);
    } catch (err: any) {
      setFileUploadError(err.message || "File upload failed");
    } finally {
      setFileUploading(false);
    }
  }

  // ── Save lesson ─────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!title.trim()) {
      setError("Lesson title is required");
      return;
    }
    if (videoTab === "gumlet" && uploadStatus === "uploading") {
      setError("Please wait for the video to finish uploading");
      return;
    }

    setSaving(true);
    setError("");

    const finalVideoUrl = videoTab === "youtube" ? extractYoutubeId(youtubeUrl) : null;
    const finalGumletId = videoTab === "gumlet" ? gumletAssetId : null;

    const payload = {
      title: title.trim(),
      videoUrl: finalVideoUrl || null,
      gumletAssetId: finalGumletId || null,
      content: content.trim() || null,
      driveFileId: driveFileId || null,
      driveFileName: driveFileName || null,
      driveFileUrl: driveFileUrl || null,
      orderIndex,
    };

    try {
      let res: Response;

      if (isEditing && existingLesson?.id) {
        res = await fetch(`/api/courses/${courseId}/lessons`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: existingLesson.id, ...payload }),
        });
      } else {
        res = await fetch(`/api/courses/${courseId}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId, ...payload }),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save lesson");
      }

      const saved = await res.json();
      onSave({ ...saved });
    } catch (err: any) {
      setError(err.message || "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>{isEditing ? "Edit Lesson" : "Add New Lesson"}</h3>

      {/* ── Lesson Title ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Lesson Title *</label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Introduction to Surah Al-Fatiha"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* ── Video Source ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Video Source</label>
        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tab} ${videoTab === "youtube" ? styles.tabActive : ""}`}
            onClick={() => setVideoTab("youtube")}
          >
            <span>🎬</span> YouTube
          </button>
          <button
            type="button"
            className={`${styles.tab} ${videoTab === "gumlet" ? styles.tabActive : ""}`}
            onClick={() => setVideoTab("gumlet")}
          >
            <span>☁️</span> Cloud Upload
          </button>
        </div>

        {videoTab === "youtube" ? (
          <div className={styles.videoInputArea}>
            <input
              type="text"
              className={styles.input}
              placeholder="Paste YouTube URL (e.g. https://youtu.be/abc123)"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            {youtubeUrl && (
              <p className={styles.hint}>
                Video ID: <code>{extractYoutubeId(youtubeUrl)}</code>
              </p>
            )}
          </div>
        ) : (
          <div className={styles.videoInputArea}>
            {uploadStatus === "idle" && (
              <>
                <div
                  className={styles.dropZone}
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) { setVideoFile(file); handleGumletUpload(file); }
                  }}
                >
                  <span className={styles.dropIcon}>📹</span>
                  <p>Drop video file here or click to browse</p>
                  <span className={styles.hint}>MP4, MOV, AVI, WebM — max 2GB</span>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setVideoFile(file); handleGumletUpload(file); }
                  }}
                />
              </>
            )}

            {uploadStatus === "uploading" && (
              <div className={styles.uploadProgress}>
                <div className={styles.progressLabel}>
                  Uploading {videoFile?.name}... {uploadProgress}%
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {uploadStatus === "done" && (
              <div className={styles.uploadDone}>
                ✅ Video uploaded successfully!
                <code className={styles.assetId}>Asset ID: {gumletAssetId}</code>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => { setUploadStatus("idle"); setGumletAssetId(""); setVideoFile(null); }}
                >
                  Replace video
                </button>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className={styles.uploadError}>
                ❌ Upload failed. <button type="button" className={styles.resetBtn} onClick={() => setUploadStatus("idle")}>Try again</button>
              </div>
            )}

            {/* Allow manually entering an existing Gumlet asset ID */}
            {uploadStatus === "idle" && (
              <div style={{ marginTop: "0.75rem" }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Or paste existing Gumlet Asset ID"
                  value={gumletAssetId}
                  onChange={(e) => setGumletAssetId(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Lesson Content / Transcript ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Lesson Content / Transcript</label>
        <textarea
          className={styles.textarea}
          rows={6}
          placeholder="Write the lesson description, transcript, or key takeaways here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* ── Attachment ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Reading Attachment (PDF, DOCX, etc.)</label>
        {driveFileName ? (
          <div className={styles.fileAttached}>
            <span>📎</span>
            <span className={styles.fileName}>{driveFileName}</span>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => { setDriveFileId(""); setDriveFileName(""); setDriveFileUrl(""); }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div
            className={`${styles.dropZone} ${styles.dropZoneSm}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {fileUploading ? (
              <span>Uploading to Google Drive...</span>
            ) : (
              <>
                <span>📁</span>
                <p>Click to attach a file (PDF, DOCX, PPT…)</p>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.epub"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleDriveUpload(file);
          }}
        />
        {fileUploadError && <p className={styles.errorText}>{fileUploadError}</p>}
      </div>

      {/* ── Error ── */}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* ── Actions ── */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving || fileUploading}
        >
          {saving ? "Saving…" : isEditing ? "Update Lesson" : "Save Lesson"}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
