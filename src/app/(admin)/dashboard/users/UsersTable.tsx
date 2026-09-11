"use client";

import { useState } from "react";
import { updateRoleAction, deleteUserAction } from "./actions";

interface UserRow {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

export default function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      await updateRoleAction(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: unknown) {
      alert("Failed to update role: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setUpdating(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this user?")) {
      return;
    }

    setUpdating(userId);
    try {
      await deleteUserAction(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error: unknown) {
      alert("Failed to delete user: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setUpdating(null);
  };

  return (
    <div style={{ 
      background: 'var(--bg-secondary)', 
      borderRadius: 'var(--radius-lg)', 
      border: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
          <tr>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Joined</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Role</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: '500' }}>{user.fullName || 'Unnamed User'}</td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '1rem' }}>
                <select 
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updating === user.id}
                  style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    opacity: updating === user.id ? 0.5 : 1
                  }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td style={{ padding: '1rem' }}>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={updating === user.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontWeight: '500',
                    opacity: updating === user.id ? 0.5 : 1
                  }}
                >
                  Delete User
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
