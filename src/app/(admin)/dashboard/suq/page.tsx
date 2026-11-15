import type { Metadata } from 'next';
import AdminSuqClient from './AdminSuqClient';

export const metadata: Metadata = {
  title: 'Open Suq Control Center — Open Knowledge Space Admin',
};

export default function AdminSuqDashboardPage() {
  return <AdminSuqClient />;
}
