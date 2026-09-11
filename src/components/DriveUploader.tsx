'use client';

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  mimeType: string;
  viewUrl: string;
  downloadUrl: string;
  size: string;
}

interface DriveUploaderProps {
  /** Comma-separated accepted MIME types or file extensions, e.g. ".pdf,.epub,.apk" */
  accept?: string;
  /** Label shown inside the drop zone */
  label?: string;
  /** Called when upload completes successfully */
  onUploadComplete?: (result: DriveUploadResult) => void;
  /** Optional folder ID to upload into */
  folderId?: string;
  /** Max file size in MB (default: 100) */
  maxSizeMB?: number;
}

export default function DriveUploader({
  accept = '*',
  label = 'Drag & drop a file here, or click to browse',
  onUploadComplete,
  folderId,
  maxSizeMB = 100,
}: DriveUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DriveUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setResult(null);

      // Client-side size check
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMB} MB.`);
        return;
      }

      setUploading(true);
      setProgress(10);

      try {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folderId', folderId);

        // Fake progress animation while uploading
        const ticker = setInterval(() => {
          setProgress(p => Math.min(p + 8, 88));
        }, 400);

        const res = await fetch('/api/upload/drive', {
          method: 'POST',
          body: formData,
        });

        clearInterval(ticker);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Upload failed');
        }

        const data: DriveUploadResult = await res.json();
        setProgress(100);
        setResult(data);
        onUploadComplete?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [folderId, maxSizeMB, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const formatSize = (bytes: string) => {
    const n = parseInt(bytes, 10);
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-primary)' : error ? '#ef4444' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: isDragging ? 'var(--accent-muted)' : 'var(--bg-secondary)',
          transition: 'all var(--transition-normal)',
          userSelect: 'none',
        }}
      >
        {/* Upload Icon */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragging ? 'var(--accent-primary)' : 'var(--text-muted)'}
            strokeWidth="1.5"
            style={{ margin: '0 auto', transition: 'stroke var(--transition-normal)' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.4rem' }}>
          {uploading ? 'Uploading...' : label}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Max {maxSizeMB} MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
          id="drive-file-input"
        />
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              height: '6px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-tertiary)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-hover))',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div
            style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', textAlign: 'center' }}
          >
            {progress < 100 ? `Uploading to Google Drive... ${progress}%` : 'Finalizing...'}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.875rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: 'rgba(29,132,152,0.1)',
            border: '1px solid rgba(29,132,152,0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
              }}
            >
              {result.fileName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {formatSize(result.size)} · Uploaded to Google Drive
            </div>
          </div>
          <a
            href={result.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.78rem',
              color: 'var(--accent-primary)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            View ↗
          </a>
        </div>
      )}
    </div>
  );
}
