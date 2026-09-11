import { google } from 'googleapis';
import { Readable } from 'stream';

// ─── Auth ────────────────────────────────────────────────────────────────────

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  mimeType: string;
  viewUrl: string;
  downloadUrl: string;
  size: string;
}

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  webViewLink: string;
  webContentLink: string;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Google Drive.
 * Returns public view/download URLs after making the file publicly accessible.
 */
export async function uploadFileToDrive(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  folderId?: string
): Promise<DriveUploadResult> {
  const drive = getDriveClient();

  const targetFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Upload the file
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: targetFolder ? [targetFolder] : undefined,
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
  });

  const file = response.data;
  if (!file.id) throw new Error('Upload failed: no file ID returned');

  // Make file publicly readable (anyone with link)
  await drive.permissions.create({
    fileId: file.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Refresh to get updated links
  const meta = await drive.files.get({
    fileId: file.id,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
  });

  return {
    fileId: file.id,
    fileName: meta.data.name ?? fileName,
    mimeType: meta.data.mimeType ?? mimeType,
    size: meta.data.size ?? '0',
    viewUrl: meta.data.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`,
    downloadUrl:
      meta.data.webContentLink ??
      `https://drive.google.com/uc?export=download&id=${file.id}`,
  };
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Permanently delete a file from Google Drive by its file ID.
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

// ─── Create Folder ───────────────────────────────────────────────────────────

/**
 * Create a folder in Google Drive, optionally under a parent folder.
 * Returns the new folder's ID.
 */
export async function createDriveFolder(
  name: string,
  parentId?: string
): Promise<string> {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id',
  });

  if (!response.data.id) throw new Error('Failed to create folder');
  return response.data.id;
}

// ─── Get Metadata ────────────────────────────────────────────────────────────

/**
 * Retrieve metadata for a Drive file by its ID.
 */
export async function getFileMetadata(fileId: string): Promise<DriveFileMetadata> {
  const drive = getDriveClient();

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime, webViewLink, webContentLink',
  });

  const f = response.data;
  return {
    id: f.id ?? fileId,
    name: f.name ?? '',
    mimeType: f.mimeType ?? '',
    size: f.size ?? '0',
    createdTime: f.createdTime ?? '',
    webViewLink: f.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
    webContentLink:
      f.webContentLink ?? `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}
