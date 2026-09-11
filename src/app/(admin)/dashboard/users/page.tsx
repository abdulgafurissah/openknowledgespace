import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import UsersTable from "./UsersTable";
import styles from "../../admin.module.css";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UserManagementPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Manage platform users and assign Instructor or Admin privileges.
          </p>
        </div>
      </div>
      <UsersTable initialUsers={allUsers} />
    </>
  );
}
