'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Shift {
  _id: string;
  apartment: { name: string; address: string };
  cleaner: { name: string };
  actualStartTime?: string;
  actualEndTime?: string;
  scheduledDate: string;
  scheduledStartTime?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        // Sort by date and time (most recent first, then by scheduled time)
        const sortedShifts = data.shifts.sort((a: Shift, b: Shift) => {
          // First sort by scheduled date
          const dateA = new Date(a.scheduledDate).getTime();
          const dateB = new Date(b.scheduledDate).getTime();
          if (dateA !== dateB) {
            return dateB - dateA; // Most recent first
          }
          // If same date, sort by start time (most recent first)
          const timeA = a.scheduledStartTime ? new Date(a.scheduledStartTime).getTime() : 0;
          const timeB = b.scheduledStartTime ? new Date(b.scheduledStartTime).getTime() : 0;
          return timeB - timeA;
        });
        setShifts(sortedShifts);
      } else {
        toast.error('Failed to load history');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Cleaning History</h1>
        </div>
        <p className="text-gray-600">View completed cleaning operations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        {shifts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No completed cleanings found</p>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div
                key={shift._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{shift.apartment.name}</h3>
                    <p className="text-sm text-gray-600">{shift.apartment.address}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Date:</span>{' '}
                        {format(new Date(shift.scheduledDate), 'dd/MM/yyyy')}
                      </p>
                      {shift.actualStartTime && (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Started:</span>{' '}
                          {format(new Date(shift.actualStartTime), 'dd/MM/yyyy, h:mm a')}
                        </p>
                      )}
                      {shift.actualEndTime && (
                        <p className="text-sm text-green-600">
                          <span className="font-medium">Completed:</span>{' '}
                          {format(new Date(shift.actualEndTime), 'dd/MM/yyyy, h:mm a')}
                        </p>
                      )}
                      {shift.actualStartTime && shift.actualEndTime && (
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Duration:</span>{' '}
                          {Math.round(
                            (new Date(shift.actualEndTime).getTime() -
                              new Date(shift.actualStartTime).getTime()) /
                              60000
                          )}{' '}
                          minutes
                        </p>
                      )}
                    </div>
                    {user?.role !== 'operator' && (
                      <p className="text-sm text-gray-500 mt-2">Operator: {shift.cleaner.name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/shifts/${shift._id}`)}
                  className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

