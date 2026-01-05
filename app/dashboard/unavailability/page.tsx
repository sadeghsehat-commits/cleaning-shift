'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay, startOfDay } from 'date-fns';
import { enUS, ar, uk, it } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useI18n } from '@/contexts/I18nContext';

export default function UnavailabilityPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState<'Malattia' | 'Ferie' | 'Permesso' | ''>('');
  const [requests, setRequests] = useState<any[]>([]);

  const getLocale = () => {
    switch (language) {
      case 'ar': return ar;
      case 'uk': return uk;
      case 'it': return it;
      default: return enUS;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'operator') {
          router.push('/dashboard');
          return;
        }
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

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/unavailability-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        
        // Extract approved dates
        const approvedDates: Date[] = [];
        data.requests.forEach((req: any) => {
          if (req.status === 'approved' && req.dates) {
            req.dates.forEach((dateStr: string) => {
              const date = new Date(dateStr);
              date.setHours(0, 0, 0, 0);
              approvedDates.push(date);
            });
          }
        });
        setSelectedDates(approvedDates);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDayOfWeek = getDay(monthStart);
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const emptyDays = Array(adjustedFirstDay).fill(null);
    
    return [...emptyDays, ...days];
  };

  const toggleDate = (date: Date) => {
    const today = startOfDay(new Date());
    const dateToCheck = startOfDay(date);
    
    if (dateToCheck < today) {
      toast.error('Cannot select past dates');
      return;
    }

    setSelectedDates(prev => {
      const dateStr = dateToCheck.toISOString();
      const exists = prev.some(d => startOfDay(d).toISOString() === dateStr);
      
      if (exists) {
        return prev.filter(d => startOfDay(d).toISOString() !== dateStr);
      } else {
        return [...prev, dateToCheck];
      }
    });
  };

  const isDateSelected = (date: Date) => {
    const dateStr = startOfDay(date).toISOString();
    return selectedDates.some(d => startOfDay(d).toISOString() === dateStr);
  };

  const isDatePending = (date: Date) => {
    const dateStr = startOfDay(date).toISOString();
    return requests.some((req: any) => 
      req.status === 'pending' && 
      req.dates.some((d: string) => startOfDay(new Date(d)).toISOString() === dateStr)
    );
  };

  const isDateApproved = (date: Date) => {
    const dateStr = startOfDay(date).toISOString();
    return requests.some((req: any) => 
      req.status === 'approved' && 
      req.dates.some((d: string) => startOfDay(new Date(d)).toISOString() === dateStr)
    );
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }

    setSubmitting(true);
    try {
      const dates = selectedDates.map(d => format(d, 'yyyy-MM-dd'));
      const response = await fetch('/api/unavailability-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, reason }),
      });

      if (response.ok) {
        toast.success('Unavailability request submitted successfully');
        setReason('');
        await fetchRequests();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const monthDays = getMonthDays();
  const today = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Unavailable Days</h1>
        <p className="text-gray-600">Select days when you are not available. Your request will be sent to admin for approval.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            ← Previous
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: getLocale() })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Next →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="aspect-square" />;
            }

            const isToday = isSameDay(day, today);
            const isSelected = isDateSelected(day);
            const isPending = isDatePending(day);
            const isApproved = isDateApproved(day);
            const isPast = day < today;

            return (
              <button
                key={idx}
                onClick={() => !isPast && toggleDate(day)}
                disabled={isPast}
                className={`aspect-square rounded-lg border-2 transition-colors ${
                  isPast
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isApproved
                    ? 'bg-green-100 border-green-500 text-green-800 font-semibold'
                    : isPending
                    ? 'bg-yellow-100 border-yellow-500 text-yellow-800 font-semibold'
                    : isSelected
                    ? 'bg-blue-100 border-blue-500 text-blue-800 font-semibold'
                    : isToday
                    ? 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                title={
                  isPast
                    ? 'Past date'
                    : isApproved
                    ? 'Approved - Unavailable'
                    : isPending
                    ? 'Pending approval'
                    : isSelected
                    ? 'Selected'
                    : 'Click to select'
                }
              >
                <div className="text-sm">{format(day, 'd')}</div>
                {isPending && <div className="text-xs">⏳</div>}
                {isApproved && <div className="text-xs">✓</div>}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as 'Malattia' | 'Ferie' | 'Permesso' | '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a reason</option>
              <option value="Malattia">Malattia</option>
              <option value="Ferie">Ferie</option>
              <option value="Permesso">Permesso</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedDates.length === 0}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : `Submit Request (${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''})`}
            </button>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                <span>Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Requests</h2>
          <div className="space-y-3">
            {requests.map((req: any) => (
              <div
                key={req._id}
                className={`p-4 rounded-lg border-2 ${
                  req.status === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : req.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {req.dates.length} day{req.dates.length !== 1 ? 's' : ''} - {req.status}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {req.dates.map((d: string) => format(new Date(d), 'dd/MM/yyyy')).join(', ')}
                    </p>
                    {req.reason && (
                      <p className="text-sm text-gray-700 mt-2">Reason: {req.reason}</p>
                    )}
                    {req.reviewedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed by {typeof req.reviewedBy === 'object' ? req.reviewedBy.name : 'Admin'} on{' '}
                        {format(new Date(req.reviewedAt), 'dd/MM/yyyy, h:mm a')}
                      </p>
                    )}
                  </div>
                  {req.status === 'pending' && (
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this request?')) return;
                        try {
                          const response = await fetch(`/api/unavailability-requests/${req._id}`, {
                            method: 'DELETE',
                          });
                          if (response.ok) {
                            toast.success('Request deleted');
                            await fetchRequests();
                          } else {
                            toast.error('Failed to delete request');
                          }
                        } catch (error) {
                          toast.error('An error occurred');
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

