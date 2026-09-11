'use client';

import { useState } from 'react';

interface GumletPlayerProps {
  /** Gumlet asset ID — used to build the embed URL */
  assetId?: string | null;
  /** Full Gumlet embed URL (alternative to assetId) */
  embedUrl?: string | null;
  /** Fallback: legacy YouTube video ID */
  youtubeId?: string | null;
  /** Player title for accessibility */
  title?: string;
}

/**
 * GumletPlayer — renders a Gumlet-hosted video player.
 * Falls back to YouTube embed if no Gumlet asset is available.
 */
export default function GumletPlayer({
  assetId,
  embedUrl,
  youtubeId,
  title = 'Lesson Video',
}: GumletPlayerProps) {
  const [playerError, setPlayerError] = useState(false);

  // Build the embed URL
  const resolvedEmbedUrl = embedUrl
    ? embedUrl
    : assetId
    ? `https://play.gumlet.io/embed/${assetId}?preload=false&autoplay=false&loop=false&disable_player_controls=false`
    : null;

  const youtubeSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?rel=0`
    : null;

  // Nothing to show
  if (!resolvedEmbedUrl && !youtubeSrc) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
        </svg>
        <span style={{ fontSize: '0.9rem' }}>No video available for this lesson yet.</span>
      </div>
    );
  }

  // Gumlet player
  if (resolvedEmbedUrl && !playerError) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
        }}
      >
        {/* Gumlet branding badge */}
        <div
          style={{
            position: 'absolute',
            top: '0.6rem',
            right: '0.7rem',
            zIndex: 10,
            background: 'rgba(0,0,0,0.55)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.2rem 0.5rem',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.7)',
            pointerEvents: 'none',
            letterSpacing: '0.04em',
          }}
        >
          Powered by Gumlet
        </div>
        <iframe
          src={resolvedEmbedUrl}
          title={title}
          width="100%"
          height="100%"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          style={{ border: 'none', display: 'block' }}
          onError={() => setPlayerError(true)}
        />
      </div>
    );
  }

  // YouTube fallback
  if (youtubeSrc) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <iframe
          src={youtubeSrc}
          title={title}
          width="100%"
          height="100%"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none', display: 'block' }}
        />
      </div>
    );
  }

  return null;
}
