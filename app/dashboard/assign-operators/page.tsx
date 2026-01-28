'use client';
/** Assign operators to apartments – Admin only. New route to verify deploy. */
import { apiUrl, apiFetch } from '@/lib/api-config';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  owner?: { name: string } | string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  assignedApartments?: string[];
}

export default function AssignOperatorsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ operator: User; selected: string[] } | null>(null);
  const [assignSaving, setAssignSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '' });

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch('/api/auth/me', { credentials: 'include' });
        if (!r.ok) {
          router.push('/');
          return;
        }
        const d = await r.json();
        setUser(d.user);
        if (d.user?.role !== 'admin') {
          router.push('/dashboard');
        }
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    (async () => {
      try {
        const [uRes, aRes] = await Promise.all([
          apiFetch('/api/users', { credentials: 'include' }),
          apiFetch('/api/apartments', { credentials: 'include' }),
        ]);
        if (uRes.ok) {
          const u = await uRes.json();
          setUsers(u.users || []);
        }
        if (aRes.ok) {
          const a = await aRes.json();
          setApartments(a.apartments || []);
        }
      } catch {}
    })();
  }, [user]);

  const operators = users.filter((u) => u.role === 'operator');

  const openAssign = (op: User) => {
    const raw = op.assignedApartments ?? [];
    const selected = raw.map((x: any) => (typeof x === 'string' ? x : String(x ?? ''))).filter(Boolean);
    setAssignModal({ operator: op, selected: [...selected] });
  };

  const toggleApartment = (id: string) => {
    if (!assignModal) return;
    const s = new Set(assignModal.selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setAssignModal({ ...assignModal, selected: Array.from(s) });
  };

  const saveAssign = async () => {
    if (!assignModal) return;
    setAssignSaving(true);
    try {
      const r = await apiFetch(`/api/users/${assignModal.operator._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignedApartments: assignModal.selected }),
      });
      if (r.ok) {
        toast.success('Apartments updated');
        setAssignModal(null);
        const uRes = await apiFetch('/api/users', { credentials: 'include' });
        if (uRes.ok) {
          const u = await uRes.json();
          setUsers(u.users || []);
        }
      } else {
        const e = await r.json().catch(() => ({}));
        toast.error(e.error || 'Failed to update');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setAssignSaving(false);
    }
  };

  const summary = (u: User) => {
    const arr = (u.assignedApartments ?? []).map((x: any) => (typeof x === 'string' ? x : String(x ?? ''))).filter(Boolean);
    return arr.length === 0 ? 'All apartments' : `${arr.length} apartment${arr.length !== 1 ? 's' : ''}`;
  };

  const createOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      toast.error('Name, email, and password required');
      return;
    }
    setAddSaving(true);
    try {
      const r = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: addForm.name.trim(),
          email: addForm.email.trim(),
          password: addForm.password,
          role: 'operator',
          phone: addForm.phone.trim() || undefined,
        }),
      });
      if (r.ok) {
        toast.success('Operator created');
        setAddOpen(false);
        setAddForm({ name: '', email: '', password: '', phone: '' });
        const uRes = await apiFetch('/api/users', { credentials: 'include' });
        if (uRes.ok) {
          const u = await uRes.json();
          setUsers(u.users || []);
        }
      } else {
        const e = await r.json().catch(() => ({}));
        toast.error(e.error || 'Failed to create');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setAddSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]">Loading…</div>;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-primary-600 hover:underline font-medium">Home</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-xl font-bold text-gray-900">Assign operators to apartments</h1>
        <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded">Admin</span>
      </div>
      <p className="text-gray-600">
        Choose which apartments each operator can work at. When you create a shift, only operators assigned to that apartment appear.
      </p>

      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Operators ({operators.length})</h2>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
          >
            <span>+</span> Add operator
          </button>
        </div>
        {operators.length === 0 ? (
          <p className="text-gray-500 py-4">No operators. Click <strong>Add operator</strong> to create one.</p>
        ) : (
          <div className="space-y-3">
            {operators.map((op) => (
              <div
                key={op._id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{op.name || 'No name'}</p>
                  <p className="text-sm text-gray-500">{op.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Works at: {summary(op)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openAssign(op)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"
                >
                  Assign apartments
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        <Link href="/dashboard/users" className="text-primary-600 hover:underline">Users</Link> – full user management.
      </p>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Assign apartments</h3>
              <p className="text-sm text-gray-500 mt-1">{assignModal.operator.name} – select apartments. Empty = all.</p>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {apartments.length === 0 ? (
                <p className="text-gray-500">No apartments.</p>
              ) : (
                apartments.map((apt) => (
                  <label key={apt._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignModal.selected.includes(apt._id)}
                      onChange={() => toggleApartment(apt._id)}
                      className="rounded border-gray-300 text-primary-600"
                    />
                    <span className="text-sm font-medium">{apt.name}</span>
                  </label>
                ))
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAssign}
                disabled={assignSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {assignSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Add operator</h3>
            <form onSubmit={createOperator} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setAddOpen(false); setAddForm({ name: '', email: '', password: '', phone: '' }); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSaving}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {addSaving ? 'Creating…' : 'Create operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
