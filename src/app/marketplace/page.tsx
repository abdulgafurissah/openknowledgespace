import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Marketplace — Open Knowledge Space',
  description: 'Browse and download eBooks, mobile apps, and digital resources from the Open Knowledge Space marketplace.',
};

interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  fileType: 'ebook' | 'apk' | 'document' | 'other';
  price: string;
  isFree: boolean;
  thumbnailUrl: string | null;
  downloadCount: number;
  sellerName: string | null;
  createdAt: string;
}

async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/marketplace`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const FILE_TYPE_LABELS: Record<string, string> = {
  ebook: '📖 eBook',
  apk: '📱 Android App',
  document: '📄 Document',
  other: '📦 Resource',
  merch: '👕 Merchandise',
  garment: '👗 Islamic Garment',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  ebook: '#1d8498',
  apk: '#7c3aed',
  document: '#d97706',
  other: '#6b7280',
};

import { redirect } from 'next/navigation';

export default function MarketplacePage() {
  redirect('/suq');
}
