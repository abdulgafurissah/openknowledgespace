import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role || 'STUDENT';

  return (
    <AdminLayoutClient role={role}>
      {children}
    </AdminLayoutClient>
  );
}
