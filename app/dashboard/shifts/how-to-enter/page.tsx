'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-config';

interface Shift {
  _id: string;
  apartment: {
    name: string;
    address: string;
    _id: string;
    howToEnterDescription?: string;
    howToEnterPhotos?: Array<{ url: string; description?: string; uploadedAt?: string }>;
  };
}

function HowToEnterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shiftId = searchParams.get('id');
  const [user, setUser] = useState<any>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && shiftId) fetchShift();
  }, [user, shiftId]);

  const checkAuth = async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/');
      }
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchShift = async () => {
    if (!shiftId) return;
    try {
      const res = await apiFetch(`/api/shifts/${shiftId}`);
      if (res.ok) {
        const data = await res.json();
        setShift(data.shift);
      } else {
        setShift(null);
      }
    } catch {
      setShift(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const detailsUrl = `/dashboard/shifts/details?id=${shiftId}`;
  const hasContent = shift?.apartment?.howToEnterDescription ||
    (shift?.apartment?.howToEnterPhotos && shift.apartment.howToEnterPhotos.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={detailsUrl}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to shift details
          </Link>
          <a
            href={detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Open details in new tab
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900">
              🔑 How to enter {shift?.apartment?.name || 'the apartment'}
            </h1>
            {shift?.apartment?.address && (
              <p className="text-sm text-gray-600 mt-1">{shift.apartment.address}</p>
            )}
          </div>

          <div className="p-4 md:p-6 space-y-4">
            {!shift ? (
              <p className="text-gray-500">Shift not found.</p>
            ) : hasContent ? (
              <>
                {shift.apartment?.howToEnterDescription && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Instructions</h2>
                    <p className="text-gray-900 whitespace-pre-wrap">{shift.apartment.howToEnterDescription}</p>
                  </div>
                )}
                {shift.apartment?.howToEnterPhotos && shift.apartment.howToEnterPhotos.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Photos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {shift.apartment.howToEnterPhotos.map((p, idx) => (
                        <div key={idx} className="border border-amber-200 rounded-lg p-2 bg-amber-50/50">
                          <img
                            src={p.url}
                            alt={p.description || `How to enter ${idx + 1}`}
                            className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setViewingPhoto(p.url)}
                          />
                          {p.description && (
                            <p className="text-sm text-gray-600 mt-2">{p.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 italic">No instructions added for this apartment yet.</p>
            )}
          </div>
        </div>
      </div>

      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <img
            src={viewingPhoto}
            alt="How to enter"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setViewingPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center font-bold hover:bg-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default function HowToEnterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HowToEnterContent />
    </Suspense>
  );
}
