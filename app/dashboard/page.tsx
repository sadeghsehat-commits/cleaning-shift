'use client'
import { apiUrl, apiFetch, getShiftDetailsUrl } from '@/lib/api-config';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useI18n } from '@/contexts/I18nContext';

interface Shift {
  _id: string;
  apartment: { 
    name: string; 
    address: string;
    owner?: { _id: string; name: string; email: string } | string;
  };
  cleaner: { name: string };
  createdBy?: { _id: string; name: string; role: string } | string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  status: string;
  confirmedSeen?: {
    confirmed: boolean;
    confirmedAt?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchShifts();
    }
  }, [user, selectedDate]);

  const checkAuth = async () => {
    try {
      const response = await apiFetch('/api/auth/me', {
        credentials: 'include',
      });
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

  const fetchShifts = async () => {
    try {
      const month = format(selectedDate, 'yyyy-MM');
      const response = await apiFetch(`/api/shifts?month=${month}&_t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        // Sort by status priority (scheduled first), then date and time (oldest first)
        const sortedShifts = data.shifts.sort((a: Shift, b: Shift) => {
          // Status priority: scheduled > in_progress > cancelled > completed
          const statusPriority: { [key: string]: number } = {
            'scheduled': 1,
            'in_progress': 2,
            'cancelled': 3,
            'completed': 4
          };
          const priorityA = statusPriority[a.status] || 99;
          const priorityB = statusPriority[b.status] || 99;
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // If same status, sort by date and time (oldest first)
          const dateA = new Date(a.scheduledDate).getTime();
          const dateB = new Date(b.scheduledDate).getTime();
          if (dateA !== dateB) {
            return dateA - dateB;
          }
          const timeA = new Date(a.scheduledStartTime).getTime();
          const timeB = new Date(b.scheduledStartTime).getTime();
          return timeA - timeB;
        });
        setShifts(sortedShifts);
      }
    } catch (error) {
      toast.error('Failed to load shifts');
    }
  };

  const getShiftsForDate = (date: Date) => {
    const dayShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.scheduledDate);
      return (
        shiftDate.getDate() === date.getDate() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getFullYear() === date.getFullYear()
      );
    });
    // Sort by start time within the day
    return dayShifts.sort((a, b) => {
      const timeA = new Date(a.scheduledStartTime).getTime();
      const timeB = new Date(b.scheduledStartTime).getTime();
      return timeA - timeB;
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t.common.loading}</div>;
  }

  const dayShifts = getShiftsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.dashboard.title}</h1>
        <p className="text-gray-600">{t.dashboard.calendar}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 overflow-x-auto">
        <div className="min-w-full">
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                setSelectedDate(value);
              } else if (Array.isArray(value) && value[0] instanceof Date) {
                setSelectedDate(value[0]);
              }
            }}
            value={selectedDate}
            className="w-full react-calendar-mobile"
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const dayShifts = getShiftsForDate(date);
                if (dayShifts.length > 0) {
                  // Check shift statuses for this day
                  const hasScheduled = dayShifts.some(s => s.status === 'scheduled');
                  const hasInProgress = dayShifts.some(s => s.status === 'in_progress');
                  const hasCompleted = dayShifts.some(s => s.status === 'completed');
                  
                  // Priority: in_progress > scheduled > completed
                  if (hasInProgress) {
                    return '!bg-blue-500 !text-white !font-bold !border-2 !border-blue-700';
                  } else if (hasScheduled) {
                    return '!bg-yellow-400 !text-gray-900 !font-semibold !border-2 !border-yellow-600';
                  } else if (hasCompleted) {
                    return '!bg-green-400 !text-white !font-semibold !border-2 !border-green-600';
                  }
                }
              }
              return null;
            }}
            tileContent={({ date }) => {
              const dayShifts = getShiftsForDate(date);
              if (dayShifts.length > 0) {
                return (
                  <div className="flex justify-center mt-1">
                    <div className="text-xs font-bold">
                      {dayShifts.length}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {t.dashboard.shiftsFor} {format(selectedDate, 'dd/MM/yyyy')}
          </h2>
          {user?.role === 'operator' && (
            <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-blue-500 border-2 border-blue-700 rounded"></span>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-yellow-400 border-2 border-yellow-600 rounded"></span>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-green-400 border-2 border-green-600 rounded"></span>
                <span>Completed</span>
              </div>
            </div>
          )}
        </div>
        {dayShifts.length === 0 ? (
          <p className="text-gray-500">{t.dashboard.noShifts}</p>
        ) : (
          <div className="space-y-3">
            {dayShifts.map((shift) => {
              const isConfirmed = shift.confirmedSeen?.confirmed === true;
              const showConfirmationStatus = ['admin', 'owner'].includes(user?.role);
              const borderColor = showConfirmationStatus 
                ? (isConfirmed ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50')
                : 'border-gray-200';
              
              return (
                <div
                  key={shift._id}
                  className={`border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
                >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{shift.apartment.name}</h3>
                      {user?.role === 'operator' && shift.confirmedSeen?.confirmed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Confirmed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{shift.apartment.address}</p>
                    {user?.role === 'admin' && shift.apartment.owner && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{t.dashboard.apartmentOwner}:</span>{' '}
                        {typeof shift.apartment.owner === 'object' 
                          ? shift.apartment.owner.name 
                          : t.common.unknown}
                      </p>
                    )}
                    {user?.role === 'admin' && shift.createdBy && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">{t.dashboard.createdBy}:</span>{' '}
                        {typeof shift.createdBy === 'object' 
                          ? (shift.createdBy.role === 'admin' 
                              ? `${t.roles.admin} ${shift.createdBy.name}` 
                              : shift.createdBy.role === 'owner' 
                              ? `${t.roles.owner} ${shift.createdBy.name}` 
                              : `${shift.createdBy.role.charAt(0).toUpperCase() + shift.createdBy.role.slice(1)} ${shift.createdBy.name}`)
                          : t.common.unknown}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">{t.dashboard.scheduledTime}:</span>{' '}
                      {format(new Date(shift.scheduledStartTime), 'h:mm a')}
                      {shift.scheduledEndTime &&
                        ` - ${format(new Date(shift.scheduledEndTime), 'h:mm a')}`}
                    </p>
                    {user?.role !== 'operator' && (
                      <p className="text-sm text-gray-500 mt-1">{t.dashboard.operator}: {shift.cleaner.name}</p>
                    )}
                    {['admin', 'owner'].includes(user?.role) && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          shift.confirmedSeen?.confirmed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {shift.confirmedSeen?.confirmed ? (
                            <>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Confirmed
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shift.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : shift.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {shift.status.replace('_', ' ')}
                  </span>
                </div>
                  <button
                  onClick={() => router.push(getShiftDetailsUrl(shift._id))}
                  className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {t.dashboard.viewDetails} →
                </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

