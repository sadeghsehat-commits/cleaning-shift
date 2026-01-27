'use client'
import { apiUrl } from '@/lib/api-config';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  owner: { _id: string; name: string; email: string } | string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  assignedApartments?: string[];
}

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ operator: User; selected: string[] } | null>(null);
  const [assignSaving, setAssignSaving] = useState(false);
  const [addOperatorOpen, setAddOperatorOpen] = useState(false);
  const [addOperatorSaving, setAddOperatorSaving] = useState(false);
  const [addOperatorForm, setAddOperatorForm] = useState({ name: '', email: '', password: '', phone: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchApartments();
    }
  }, [user]);

  const fetchApartments = async () => {
    try {
      const res = await fetch(apiUrl('/api/apartments'), { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setApartments(data.apartments || []);
      }
    } catch {
      // ignore
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        credentials: 'include',
      });
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
      const response = await fetch(apiUrl('/api/users'), {
        credentials: 'include',
      });
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
      const response = await fetch(apiUrl(`/api/users/${userId}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('An error occurred while deleting user');
    }
  };

  const openAssignModal = (operator: User) => {
    const raw = operator.assignedApartments ?? [];
    const selected = raw.map((a: any) => (typeof a === 'string' ? a : a?.toString?.() ?? String(a))).filter(Boolean);
    setAssignModal({ operator, selected: [...selected] });
  };

  const toggleAssignApartment = (apartmentId: string) => {
    if (!assignModal) return;
    const set = new Set(assignModal.selected);
    if (set.has(apartmentId)) set.delete(apartmentId);
    else set.add(apartmentId);
    setAssignModal({ ...assignModal, selected: Array.from(set) });
  };

  const saveAssignedApartments = async () => {
    if (!assignModal) return;
    setAssignSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/users/${assignModal.operator._id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignedApartments: assignModal.selected }),
      });
      if (res.ok) {
        toast.success('Apartments updated');
        setAssignModal(null);
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setAssignSaving(false);
    }
  };

  const assignedSummary = (u: User) => {
    const raw = u.assignedApartments ?? [];
    const arr = raw.map((a: any) => (typeof a === 'string' ? a : a?.toString?.() ?? String(a))).filter(Boolean);
    if (arr.length === 0) return 'All apartments';
    return `${arr.length} apartment${arr.length !== 1 ? 's' : ''}`;
  };

  const createOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addOperatorForm.name.trim() || !addOperatorForm.email.trim() || !addOperatorForm.password.trim()) {
      toast.error('Name, email, and password are required');
      return;
    }
    setAddOperatorSaving(true);
    try {
      const res = await fetch(apiUrl('/api/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: addOperatorForm.name.trim(),
          email: addOperatorForm.email.trim(),
          password: addOperatorForm.password,
          role: 'operator',
          phone: addOperatorForm.phone.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast.success('Operator created');
        setAddOperatorOpen(false);
        setAddOperatorForm({ name: '', email: '', password: '', phone: '' });
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to create operator');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setAddOperatorSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const operators = users.filter((u) => u.role === 'operator');
  const owners = users.filter((u) => u.role === 'owner');
  const admins = users.filter((u) => u.role === 'admin');

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
          <span className="text-xs font-medium text-white bg-primary-600 px-2 py-0.5 rounded">Admin</span>
        </div>
        <p className="text-gray-600 mb-1">Manage system users. Add operators, assign apartments, then create shifts.</p>
        <p className="text-sm text-gray-500">Admin only — Operators section: <strong>Add operator</strong> → <strong>Assign apartments</strong> → pick apartments → <strong>Save</strong>.</p>
      </div>

      {/* Operators first – Assign apartments */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Operators ({operators.length})</h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign which apartments each operator can work at. When you create a shift, only operators assigned to that apartment are shown.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOperatorOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add operator
          </button>
        </div>
        <div className="mt-4">
        {operators.length === 0 ? (
          <p className="text-gray-500">No operators yet. Click <strong>Add operator</strong> above to create one, then use <strong>Assign apartments</strong> to choose which apartments they can work at.</p>
        ) : (
          <div className="space-y-3">
            {operators.map((u) => (
              <div
                key={u._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-wrap gap-3 justify-between items-start"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{u.name || 'No name'}</h3>
                  <p className="text-sm text-gray-600">{u.email || 'No email'}</p>
                  {u.phone && <p className="text-sm text-gray-500 mt-1">{u.phone}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Works at: {assignedSummary(u)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openAssignModal(u)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    title="Assign apartments"
                  >
                    Assign apartments
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u._id, u.name || u.email)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                    title="Delete user"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Owners */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Owners ({owners.length})</h2>
        {owners.length === 0 ? (
          <p className="text-gray-500">No owners found</p>
        ) : (
          <div className="space-y-3">
            {owners.map((u) => (
              <div
                key={u._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{u.name || 'No name'}</h3>
                  <p className="text-sm text-gray-600">{u.email || 'No email'}</p>
                  {u.phone && <p className="text-sm text-gray-500 mt-1">{u.phone}</p>}
                </div>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admins */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Admins ({admins.length})</h2>
        {admins.length === 0 ? (
          <p className="text-gray-500">No admins found</p>
        ) : (
          <div className="space-y-3">
            {admins.map((u) => (
              <div
                key={u._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{u.name || 'No name'}</h3>
                  <p className="text-sm text-gray-600">{u.email || 'No email'}</p>
                  {u.phone && <p className="text-sm text-gray-500 mt-1">{u.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assign apartments</h3>
              <p className="text-sm text-gray-600 mt-1">
                {assignModal.operator.name} – choose which apartments this operator can work at. Empty = all apartments.
              </p>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {apartments.length === 0 ? (
                <p className="text-gray-500">No apartments found.</p>
              ) : (
                apartments.map((apt) => {
                  const ownerName = typeof apt.owner === 'object' && apt.owner && 'name' in apt.owner
                    ? (apt.owner as { name: string }).name
                    : '';
                  return (
                    <label
                      key={apt._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={assignModal.selected.includes(apt._id)}
                        onChange={() => toggleAssignApartment(apt._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-900">{apt.name}</span>
                      {ownerName && (
                        <span className="text-xs text-gray-500">({ownerName})</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignedApartments}
                disabled={assignSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg"
              >
                {assignSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addOperatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={createOperator} className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Add operator</h3>
              <p className="text-sm text-gray-600">Create a new operator. After saving, use <strong>Assign apartments</strong> to choose which apartments they can work at.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={addOperatorForm.name}
                  onChange={(e) => setAddOperatorForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. Mario Rossi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={addOperatorForm.email}
                  onChange={(e) => setAddOperatorForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="operator@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={addOperatorForm.password}
                  onChange={(e) => setAddOperatorForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="text"
                  value={addOperatorForm.phone}
                  onChange={(e) => setAddOperatorForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="+39 ..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setAddOperatorOpen(false); setAddOperatorForm({ name: '', email: '', password: '', phone: '' }); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addOperatorSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg"
                >
                  {addOperatorSaving ? 'Creating…' : 'Create operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

