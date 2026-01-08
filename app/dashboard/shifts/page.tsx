'use client'
import { apiUrl, getShiftDetailsUrl } from '@/lib/api-config';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addMonths, subMonths, parse } from 'date-fns';
import { enUS, ar, uk, it } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';

interface Shift {
  _id: string;
  apartment: { 
    name: string; 
    address: string;
    owner?: { _id: string; name: string; email: string } | string;
  } | null;
  cleaner: { name: string; email: string } | null;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  notes?: string;
  confirmedSeen?: {
    confirmed: boolean;
    confirmedAt?: string;
  };
}

export default function ShiftsPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Default to all to show all shifts
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM')); // Default to current month
  const [deletingAll, setDeletingAll] = useState(false);

  // Get locale for date formatting
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
      fetchShifts();
    }
  }, [user, filter, selectedMonth]);

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
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
      // Fetch shifts for the selected month
      let url = `/api/shifts?month=${selectedMonth}`;
      
      // Add cache-busting timestamp to ensure fresh data
      url += `&_t=${Date.now()}`;
      
      const response = await fetch(apiUrl(url), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        let filteredShifts = data.shifts || [];
        
        // Filter by status if not "all"
        if (filter === 'scheduled') {
          filteredShifts = filteredShifts.filter((s: Shift) => s.status === 'scheduled');
        } else if (filter === 'in_progress') {
          filteredShifts = filteredShifts.filter((s: Shift) => s.status === 'in_progress');
        } else if (filter === 'completed') {
          filteredShifts = filteredShifts.filter((s: Shift) => s.status === 'completed');
        }
        // "all" shows all shifts in the selected month (no status filtering)
        
        // Exclude cancelled shifts from all filters
        filteredShifts = filteredShifts.filter((s: Shift) => s.status !== 'cancelled');
        
        // For admin users, group by owner first, then sort by date (for all filters)
        if (user?.role === 'admin') {
          // Group shifts by owner
          const shiftsByOwner: Record<string, Shift[]> = {};
          
          filteredShifts.forEach((shift: Shift) => {
            let ownerId = 'unknown';
            
            if (shift.apartment?.owner) {
              if (typeof shift.apartment.owner === 'object' && shift.apartment.owner._id) {
                ownerId = shift.apartment.owner._id;
              } else if (typeof shift.apartment.owner === 'string') {
                ownerId = shift.apartment.owner;
              }
            }
            
            if (!shiftsByOwner[ownerId]) {
              shiftsByOwner[ownerId] = [];
            }
            shiftsByOwner[ownerId].push(shift);
          });
          
          // Sort shifts within each owner group by date and time
          Object.keys(shiftsByOwner).forEach((ownerId) => {
            shiftsByOwner[ownerId].sort((a: Shift, b: Shift) => {
              const dateA = new Date(a.scheduledDate).getTime();
              const dateB = new Date(b.scheduledDate).getTime();
              if (dateA !== dateB) {
                return dateA - dateB;
              }
              const timeA = new Date(a.scheduledStartTime).getTime();
              const timeB = new Date(b.scheduledStartTime).getTime();
              return timeA - timeB;
            });
          });
          
          // Flatten back to array, maintaining owner grouping
          const groupedShifts: Shift[] = [];
          Object.keys(shiftsByOwner).forEach((ownerId) => {
            groupedShifts.push(...shiftsByOwner[ownerId]);
          });
          
          setShifts(groupedShifts);
        } else {
          // Sort by date and time of beginning (oldest first)
          filteredShifts.sort((a: Shift, b: Shift) => {
            // Sort by scheduled date first
            const dateA = new Date(a.scheduledDate).getTime();
            const dateB = new Date(b.scheduledDate).getTime();
            if (dateA !== dateB) {
              return dateA - dateB;
            }
            
            // If same date, sort by scheduled start time
            const timeA = new Date(a.scheduledStartTime).getTime();
            const timeB = new Date(b.scheduledStartTime).getTime();
            return timeA - timeB;
          });
          
          setShifts(filteredShifts);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch shifts:', errorData);
        toast.error(errorData.error || 'Failed to load shifts');
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error('Failed to load shifts');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t.common.loading}</div>;
  }

  const canCreateShift = user?.role === 'admin'; // Viewer cannot create shifts

  const handleDeleteAllShifts = async () => {
    const confirmed = confirm(
      '⚠️ WARNING: This will permanently delete ALL shifts from the database!\n\n' +
      'This action cannot be undone. Are you absolutely sure?'
    );
    
    if (!confirmed) return;

    const doubleConfirm = confirm(
      'Are you REALLY sure? This will delete EVERY shift in the database permanently!'
    );
    
    if (!doubleConfirm) return;

    setDeletingAll(true);
    try {
      const response = await fetch(apiUrl('/api/shifts/delete-all'), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'All shifts deleted successfully');
        fetchShifts(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete shifts' }));
        toast.error(errorData.error || 'Failed to delete all shifts');
      }
    } catch (error) {
      console.error('Error deleting all shifts:', error);
      toast.error('An error occurred while deleting shifts');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1 sm:gap-2 font-medium text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t.nav.home}
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{t.shifts.title}</h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">{t.shifts.manageAll}</p>
        
        {/* Action Buttons */}
        {canCreateShift && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/dashboard/shifts/new"
              className="bg-primary-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors font-medium text-sm min-h-[40px] flex items-center justify-center touch-manipulation"
            >
              <span className="block sm:hidden">+ New</span>
              <span className="hidden sm:block">+ {t.shifts.newShift}</span>
            </Link>
            <button
              onClick={handleDeleteAllShifts}
              disabled={deletingAll}
              className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm min-h-[40px] touch-manipulation whitespace-nowrap"
            >
              <span className="block sm:hidden">{deletingAll ? 'Deleting...' : 'Delete All'}</span>
              <span className="hidden sm:block">{deletingAll ? t.shifts.deleting : t.shifts.deleteAll}</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        {/* Month Navigation */}
        <div className="mb-4 flex items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={() => {
              const currentMonthDate = parse(selectedMonth, 'yyyy-MM', new Date());
              const previousMonth = subMonths(currentMonthDate, 1);
              setSelectedMonth(format(previousMonth, 'yyyy-MM'));
            }}
            className="px-3 py-2.5 sm:px-5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium flex items-center justify-center min-w-[48px] sm:min-w-[60px] min-h-[40px] sm:min-h-[48px] touch-manipulation"
            aria-label={t.common.previous}
          >
            <span className="text-xl sm:text-2xl font-bold">←</span>
          </button>
          
          <div className="flex-1 text-center px-1 sm:px-2">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
              {format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: getLocale() })}
            </h2>
          </div>
          
          <button
            onClick={() => {
              const currentMonthDate = parse(selectedMonth, 'yyyy-MM', new Date());
              const nextMonth = addMonths(currentMonthDate, 1);
              setSelectedMonth(format(nextMonth, 'yyyy-MM'));
            }}
            className="px-3 py-2.5 sm:px-5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium flex items-center justify-center min-w-[48px] sm:min-w-[60px] min-h-[40px] sm:min-h-[48px] touch-manipulation"
            aria-label={t.common.next}
          >
            <span className="text-xl sm:text-2xl font-bold">→</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {['scheduled', 'in_progress', 'completed', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap min-h-[40px] flex items-center justify-center touch-manipulation transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white active:bg-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {status === 'in_progress' 
                ? t.status.inProgress
                : status === 'scheduled'
                ? t.status.scheduled
                : status === 'completed'
                ? t.status.completed
                : status === 'all'
                ? t.shifts.all
                : status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {shifts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t.shifts.noShiftsFound}</p>
        ) : (
          <div className="space-y-3">
            {(() => {
              // For admin users, group by owner (for all filters)
              if (user?.role === 'admin') {
                const shiftsByOwner: Record<string, { ownerName: string; shifts: Shift[] }> = {};
                
                shifts.forEach((shift: Shift) => {
                  let ownerId = 'unknown';
                  let ownerName = t.shifts.unknownOwner;
                  
                  if (shift.apartment?.owner) {
                    if (typeof shift.apartment.owner === 'object' && shift.apartment.owner._id) {
                      ownerId = shift.apartment.owner._id;
                      ownerName = shift.apartment.owner.name || t.shifts.unknownOwner;
                    } else if (typeof shift.apartment.owner === 'string') {
                      ownerId = shift.apartment.owner;
                      ownerName = t.shifts.unknownOwner;
                    }
                  }
                  
                  if (!shiftsByOwner[ownerId]) {
                    shiftsByOwner[ownerId] = { ownerName, shifts: [] };
                  }
                  shiftsByOwner[ownerId].shifts.push(shift);
                });
                
                // Render grouped by owner
                return Object.keys(shiftsByOwner).map((ownerId) => {
                  const { ownerName, shifts: ownerShifts } = shiftsByOwner[ownerId];
                  return (
                    <div key={ownerId} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b-2 border-primary-200">
                        {ownerName}
                      </h3>
                      <div className="space-y-3">
                        {ownerShifts.map((shift) => {
                          const isConfirmed = shift.confirmedSeen?.confirmed === true;
                          const showConfirmationStatus = ['admin', 'owner'].includes(user?.role);
                          const borderColor = showConfirmationStatus 
                            ? (isConfirmed ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50')
                            : 'border-gray-200';
                          
                          return (
                            <Link
                              key={shift._id}
                              href={getShiftDetailsUrl(shift._id)}
                              className={`block border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">
                                      {shift.apartment?.name || t.shifts.unknownApartment}
                                    </h3>
                                    {user?.role === 'operator' && shift.confirmedSeen?.confirmed && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {t.status.confirmed}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {shift.apartment?.address || t.shifts.addressNotAvailable}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-500">
                                      <span className="font-medium">{t.dashboard.date}:</span>{' '}
                                      {format(new Date(shift.scheduledDate), 'dd/MM/yyyy')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      <span className="font-medium">{t.dashboard.scheduledTime}:</span>{' '}
                                      {format(new Date(shift.scheduledStartTime), 'h:mm a')}
                                      {shift.scheduledEndTime &&
                                        ` - ${format(new Date(shift.scheduledEndTime), 'h:mm a')}`}
                                    </p>
                                    {user?.role !== 'operator' && (
                                      <p className="text-sm text-gray-500">
                                        <span className="font-medium">{t.dashboard.operator}:</span> {shift.cleaner?.name || t.shifts.notAssigned}
                                      </p>
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
                                              {t.status.confirmed}
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                              </svg>
                                              {t.status.pending}
                                            </>
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {shift.actualStartTime && (
                                      <p className="text-sm text-green-600">
                                        {t.shifts.started}: {format(new Date(shift.actualStartTime), 'h:mm a')}
                                      </p>
                                    )}
                                    {shift.actualEndTime && (
                                      <p className="text-sm text-green-600">
                                        {t.status.completed}: {format(new Date(shift.actualEndTime), 'h:mm a')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    shift.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : shift.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : shift.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {shift.status === 'scheduled' ? t.status.scheduled :
                                   shift.status === 'in_progress' ? t.status.inProgress :
                                   shift.status === 'completed' ? t.status.completed :
                                   shift.status === 'cancelled' ? t.status.cancelled :
                                   shift.status.replace('_', ' ')}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              } else {
                // Render normally for other filters or non-admin users
                return shifts.map((shift) => {
                  const isConfirmed = shift.confirmedSeen?.confirmed === true;
                  const showConfirmationStatus = ['admin', 'owner'].includes(user?.role);
                  const borderColor = showConfirmationStatus 
                    ? (isConfirmed ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50')
                    : 'border-gray-200';
                  
                  return (
                    <Link
                      key={shift._id}
                      href={getShiftDetailsUrl(shift._id)}
                      className={`block border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {shift.apartment?.name || t.shifts.unknownApartment}
                            </h3>
                            {user?.role === 'operator' && shift.confirmedSeen?.confirmed && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {t.status.confirmed}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {shift.apartment?.address || t.shifts.addressNotAvailable}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">{t.dashboard.date}:</span>{' '}
                              {format(new Date(shift.scheduledDate), 'dd/MM/yyyy')}
                            </p>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">{t.dashboard.scheduledTime}:</span>{' '}
                              {format(new Date(shift.scheduledStartTime), 'h:mm a')}
                              {shift.scheduledEndTime &&
                                ` - ${format(new Date(shift.scheduledEndTime), 'h:mm a')}`}
                            </p>
                            {user?.role !== 'operator' && (
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">{t.dashboard.operator}:</span> {shift.cleaner?.name || t.shifts.notAssigned}
                              </p>
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
                                      {t.status.confirmed}
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      {t.status.pending}
                                    </>
                                  )}
                                </span>
                              </div>
                            )}
                            {shift.actualStartTime && (
                              <p className="text-sm text-green-600">
                                {t.shifts.started}: {format(new Date(shift.actualStartTime), 'h:mm a')}
                              </p>
                            )}
                            {shift.actualEndTime && (
                              <p className="text-sm text-green-600">
                                {t.status.completed}: {format(new Date(shift.actualEndTime), 'h:mm a')}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            shift.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : shift.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : shift.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {shift.status === 'scheduled' ? t.status.scheduled :
                           shift.status === 'in_progress' ? t.status.inProgress :
                           shift.status === 'completed' ? t.status.completed :
                           shift.status === 'cancelled' ? t.status.cancelled :
                           shift.status.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  );
                });
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

