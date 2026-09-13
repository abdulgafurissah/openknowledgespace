// ─── Gumlet Video API Utility ────────────────────────────────────────────────
// Wraps Gumlet's REST API for video uploads, status checks, and deletions.
// Docs: https://docs.gumlet.com/reference/video-api

const GUMLET_API_BASE = 'https://api.gumlet.com/v1';

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.GUMLET_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GumletUploadResult {
  assetId: string;
  collectionId: string;
  status: string;
  playbackUrl: string;
  embedUrl: string;
}

export interface GumletVideoStatus {
  assetId: string;
  title: string;
  status: 'queued' | 'processing' | 'ready' | 'error';
  duration: number | null;
  playbackUrl: string;
  embedUrl: string;
  thumbnailUrl: string | null;
}

// ─── Upload by URL ────────────────────────────────────────────────────────────

/**
 * Create a Gumlet video asset by providing a source URL.
 * Gumlet will fetch and process the video from the given URL.
 */
export async function uploadVideoToGumlet(
  sourceUrl: string,
  title: string
): Promise<GumletUploadResult> {
  const workspaceId = process.env.GUMLET_WORKSPACE_ID;
  if (!workspaceId) throw new Error('GUMLET_WORKSPACE_ID is not set');

  const response = await fetch(`${GUMLET_API_BASE}/video/assets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      workspace_id: workspaceId,
      source_url: sourceUrl,
      title,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gumlet upload failed: ${error}`);
  }

  const data = await response.json();

  return {
    assetId: data.asset_id,
    collectionId: data.workspace_id,
    status: data.status,
    playbackUrl: buildPlaybackUrl(data.asset_id),
    embedUrl: buildEmbedUrl(data.asset_id),
  };
}

// ─── Get Upload URL (direct upload) ──────────────────────────────────────────

/**
 * Create a Gumlet asset and get a signed upload URL for direct file upload.
 * Use this when you want to upload a file directly from the browser.
 */
export async function createGumletUploadUrl(title: string): Promise<{
  assetId: string;
  uploadUrl: string;
  embedUrl: string;
  playbackUrl: string;
}> {
  const workspaceId = process.env.GUMLET_WORKSPACE_ID;
  if (!workspaceId) throw new Error('GUMLET_WORKSPACE_ID is not set');

  const response = await fetch(`${GUMLET_API_BASE}/video/assets/upload`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      workspace_id: workspaceId,
      title,
      format: 'mp4',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gumlet create upload URL failed: ${error}`);
  }

  const data = await response.json();

  return {
    assetId: data.asset_id,
    uploadUrl: data.upload_url,
    embedUrl: buildEmbedUrl(data.asset_id),
    playbackUrl: buildPlaybackUrl(data.asset_id),
  };
}

// ─── Get Status ───────────────────────────────────────────────────────────────

/**
 * Retrieve the current status and metadata of a Gumlet video asset.
 */
export async function getGumletVideoStatus(assetId: string): Promise<GumletVideoStatus> {
  const response = await fetch(`${GUMLET_API_BASE}/video/assets/${assetId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gumlet status check failed: ${error}`);
  }

  const data = await response.json();

  return {
    assetId: data.asset_id,
    title: data.title ?? '',
    status: data.status,
    duration: data.duration ?? null,
    playbackUrl: buildPlaybackUrl(data.asset_id),
    embedUrl: buildEmbedUrl(data.asset_id),
    thumbnailUrl: data.thumbnail ?? null,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a Gumlet video asset by its asset ID.
 */
export async function deleteGumletVideo(assetId: string): Promise<void> {
  const response = await fetch(`${GUMLET_API_BASE}/video/assets/${assetId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gumlet delete failed: ${error}`);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPlaybackUrl(assetId: string): string {
  const subdomain = process.env.NEXT_PUBLIC_GUMLET_SUBDOMAIN ?? 'play.gumlet.io';
  return `https://${subdomain}/${assetId}`;
}

function buildEmbedUrl(assetId: string): string {
  return `https://play.gumlet.io/embed/${assetId}`;
}
