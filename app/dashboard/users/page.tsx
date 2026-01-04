'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user.role !== 'admin') {
          router.push('/dashboard');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('An error occurred while deleting user');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const usersByRole = {
    owner: users.filter((u) => u.role === 'owner'),
    operator: users.filter((u) => u.role === 'operator'),
    admin: users.filter((u) => u.role === 'admin'),
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        </div>
        <p className="text-gray-600">Manage system users</p>
      </div>

      {Object.entries(usersByRole).map(([role, roleUsers]) => (
        <div key={role} className="bg-white rounded-lg shadow-md p-4 lg:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">{role}s ({roleUsers.length})</h2>
          {roleUsers.length === 0 ? (
            <p className="text-gray-500">No {role}s found</p>
          ) : (
            <div className="space-y-3">
              {roleUsers.map((u) => (
                <div
                  key={u._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{u.name || 'No name'}</h3>
                    <p className="text-sm text-gray-600">{u.email || 'No email'}</p>
                    {u.phone && <p className="text-sm text-gray-500 mt-1">{u.phone}</p>}
                  </div>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u._id, u.name || u.email)}
                      className="ml-4 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                      title="Delete user"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

