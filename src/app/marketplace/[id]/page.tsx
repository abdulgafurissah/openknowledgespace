import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  fileType: 'ebook' | 'apk' | 'document' | 'other' | 'merch' | 'garment';
  price: string;
  isFree: boolean;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  fileMimeType: string | null;
  fileSize: string | null;
  downloadCount: number;
  sellerName: string | null;
  createdAt: string;
}

async function getItem(id: string): Promise<MarketplaceItem | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/marketplace/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return {
    title: item ? `${item.title} — Marketplace` : 'Item Not Found',
    description: item?.description ?? undefined,
  };
}

const FILE_TYPE_LABELS: Record<string, string> = {
  ebook: '📖 eBook',
  apk: '📱 Android App',
  document: '📄 Document',
  other: '📦 Resource',
  merch: '👕 Merchandise',
  garment: '👗 Islamic Garment',
};

function formatSize(bytes: string | null): string {
  if (!bytes) return '';
  const n = parseInt(bytes, 10);
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

import { redirect } from 'next/navigation';

export default function MarketplaceItemRedirect() {
  redirect('/suq');
}
