'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PhotoUpload from '@/components/PhotoUpload';
import { useI18n } from '@/contexts/I18nContext';
import { translateText } from '@/lib/translate';

interface Shift {
  _id: string;
  apartment: { name: string; address: string; _id: string };
  cleaner: { name: string; email: string; _id: string };
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  notes?: string;
  createdBy?: { _id: string; name: string } | string;
  confirmedSeen?: {
    confirmed: boolean;
    confirmedAt?: string;
  };
  timeChangeRequest?: any;
  problems?: Array<{
    _id: string;
    reportedBy: { name: string };
    reportedAt: string;
    description: string;
    type: string;
    resolved: boolean;
    photos?: Array<{
      url: string;
      uploadedAt: string;
    }>;
  }>;
  instructionPhotos?: Array<{
    _id?: string;
    uploadedBy: { name: string };
    uploadedAt: string;
    url: string;
    description?: string;
  }>;
}

export default function ShiftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimeChangeModal, setShowTimeChangeModal] = useState(false);
  const [timeChangeForm, setTimeChangeForm] = useState({
    newStartTime: '',
    newEndTime: '',
    reason: '',
  });
  const [guestCount, setGuestCount] = useState<number | null>(null);

  // Helper function to safely format dates
  const safeFormatDate = (dateValue: string | Date | undefined | null, formatString: string): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, formatString);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDeleteShift = async () => {
    if (!confirm('Are you sure you want to delete this shift? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/shifts/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Shift deleted successfully');
        router.push('/dashboard/shifts');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete shift');
      }
    } catch (error: any) {
      toast.error('An error occurred while deleting shift');
      console.error('Delete shift error:', error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && params.id) {
      fetchShift();
    }
  }, [user, params.id]);

  // Update current time every 10 seconds for real-time validation
  useEffect(() => {
    // Set initial time immediately
    setCurrentTime(new Date());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds for better responsiveness
    return () => clearInterval(interval);
  }, []);

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

  const fetchShift = async () => {
    try {
      const response = await fetch(`/api/shifts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setShift(data.shift);
        
        // Fetch guest count from cleaning schedule
        if (data.shift && data.shift.apartment && data.shift.scheduledDate) {
          const shiftDate = new Date(data.shift.scheduledDate);
          const year = shiftDate.getFullYear();
          const month = shiftDate.getMonth() + 1;
          const day = shiftDate.getDate();
          
          try {
            const apartmentId = typeof data.shift.apartment === 'object' 
              ? data.shift.apartment._id 
              : data.shift.apartment;
            
            const scheduleResponse = await fetch(
              `/api/cleaning-schedule?apartmentId=${apartmentId}&year=${year}&month=${month}`
            );
            if (scheduleResponse.ok) {
              const scheduleData = await scheduleResponse.json();
              
              // Find the schedule that matches the apartment, year, and month
              // The API should already filter by year and month, but we'll be safe and check
              const schedule = scheduleData.schedules?.find((s: any) => {
                const sYear = s.year;
                const sMonth = s.month;
                const sApartmentId = typeof s.apartment === 'object' ? s.apartment._id?.toString() : s.apartment?.toString();
                const matchApartment = sApartmentId === apartmentId.toString();
                const matchYear = sYear === year;
                const matchMonth = sMonth === month;
                return matchApartment && matchYear && matchMonth;
              }) || scheduleData.schedules?.[0]; // Fallback to first if not found
              
              if (schedule) {
                if (schedule.scheduledDays && Array.isArray(schedule.scheduledDays)) {
                  const scheduledDay = schedule.scheduledDays.find((sd: any) => Number(sd.day) === Number(day));
                  if (scheduledDay && scheduledDay.guestCount !== undefined && scheduledDay.guestCount !== null) {
                    setGuestCount(Number(scheduledDay.guestCount));
                  }
                } else if (schedule.days && Array.isArray(schedule.days) && schedule.days.includes(day)) {
                  // Fallback to old format (default to 1 guest)
                  setGuestCount(1);
                }
              }
            }
          } catch (scheduleError) {
            // Silently fail - guest count is optional
            console.log('Could not fetch guest count:', scheduleError);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(errorData.error || 'Shift not found');
        console.error('Shift fetch error:', errorData, 'Status:', response.status);
        router.push('/dashboard/shifts');
      }
    } catch (error: any) {
      toast.error('Failed to load shift');
      console.error('Shift fetch exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCleaning = async () => {
    if (!shift) return;
    
    // Client-side validation: Check if current time is before scheduled time
    const now = new Date(); // Use actual current time for the API call
    const scheduledDate = new Date(shift.scheduledDate);
    const scheduledStartTime = new Date(shift.scheduledStartTime);
    const scheduledDateTime = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
      scheduledStartTime.getHours(),
      scheduledStartTime.getMinutes(),
      scheduledStartTime.getSeconds(),
      0
    );
    
    if (now < scheduledDateTime) {
      toast.error('Cannot start shift before the scheduled time');
      return;
    }
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/shifts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualStartTime: now.toISOString(),
          status: 'in_progress',
        }),
      });

      if (response.ok) {
        toast.success('Cleaning started');
        // Force a refresh of the shift data
        await fetchShift();
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to start cleaning' }));
        toast.error(data.error || 'Failed to start cleaning');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handleEndCleaning = async () => {
    if (!shift || !shift.actualStartTime) {
      toast.error('Cannot complete shift without starting it first');
      return;
    }
    
    // Client-side validation: Check if at least 1 hour has passed
    const now = new Date();
    const startTime = new Date(shift.actualStartTime);
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
    const timeDifference = now.getTime() - startTime.getTime();
    
    if (timeDifference < oneHourInMs) {
      const remainingMinutes = Math.ceil((oneHourInMs - timeDifference) / (60 * 1000));
      toast.error(`Cannot mark shift as completed in less than 1 hour. Please wait ${remainingMinutes} more minute(s).`);
      return;
    }
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/shifts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualEndTime: now.toISOString(),
          status: 'completed',
        }),
      });

      if (response.ok) {
        toast.success('Cleaning completed');
        fetchShift();
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to complete cleaning' }));
        toast.error(data.error || 'Failed to complete cleaning');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestTimeChange = async () => {
    const newStartTime = prompt('Enter new start time (YYYY-MM-DDTHH:mm):');
    if (!newStartTime) return;

    const reason = prompt('Enter reason for time change:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/shifts/${params.id}/time-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStartTime,
          reason,
        }),
      });

      if (response.ok) {
        toast.success('Time change requested');
        fetchShift();
      } else {
        toast.error('Failed to request time change');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [problemType, setProblemType] = useState<'issue' | 'forgotten_item'>('issue');
  const [problemPhotos, setProblemPhotos] = useState<string[]>([]);
  const [showInstructionPhotoModal, setShowInstructionPhotoModal] = useState(false);
  const [instructionPhotoUrl, setInstructionPhotoUrl] = useState('');
  const [instructionPhotoDescription, setInstructionPhotoDescription] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const handleReportProblem = async () => {
    if (!problemDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      const response = await fetch(`/api/shifts/${params.id}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: problemDescription,
          type: problemType,
          photos: problemPhotos,
        }),
      });

      if (response.ok) {
        toast.success('Problem reported');
        setShowProblemModal(false);
        setProblemDescription('');
        setProblemPhotos([]);
        fetchShift();
      } else {
        toast.error('Failed to report problem');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleAddInstructionPhoto = async () => {
    if (!instructionPhotoUrl.trim()) {
      toast.error('Please add a photo');
      return;
    }

    try {
      const response = await fetch(`/api/shifts/${params.id}/instruction-photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: instructionPhotoUrl,
          description: instructionPhotoDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Instruction photo added');
        setShowInstructionPhotoModal(false);
        setInstructionPhotoUrl('');
        setInstructionPhotoDescription('');
        // Refresh the shift data to show the new photo
        await fetchShift();
      } else {
        // Even if there's an error, try to refresh in case the photo was saved
        // (notification might have failed but photo was saved)
        await fetchShift();
        toast.error(data.error || 'Failed to add instruction photo');
        console.error('Error response:', data);
      }
    } catch (error: any) {
      toast.error('An error occurred');
      console.error('Error:', error);
    }
  };

  const handleConfirmShift = async () => {
    try {
      const response = await fetch(`/api/shifts/${params.id}/confirm`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Shift confirmed!');
        fetchShift();
      } else {
        toast.error('Failed to confirm shift');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!shift) {
    return <div className="text-center py-8">Shift not found</div>;
  }

  const isOperator = user?.role === 'operator';
  const canApproveTimeChange = user?.role === 'owner'; // Only owners can approve/reject operator requests
  const canRequestTimeChange = user?.role === 'admin'; // Only admins can request time changes

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
          <span className="text-gray-400 flex items-center">/</span>
          <Link
            href="/dashboard/shifts"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            {t.nav.shifts}
          </Link>
          <span className="text-gray-400 flex items-center">/</span>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">{t.shifts.shiftDetails}</h1>
        </div>
      </div>

      <div className={`bg-white rounded-lg shadow-md p-6 space-y-6 ${
        !isOperator && !shift.confirmedSeen?.confirmed 
          ? 'border-l-4 border-orange-500' 
          : !isOperator && shift.confirmedSeen?.confirmed
          ? 'border-l-4 border-green-500'
          : ''
      }`}>
        {!isOperator && (
          <div className={`p-3 rounded-lg mb-4 ${
            shift.confirmedSeen?.confirmed 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-center gap-2">
              {shift.confirmedSeen?.confirmed ? (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 font-medium">{t.shifts.shiftConfirmedByOperator}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className={`text-orange-700 font-medium ${isOperator ? 'text-lg' : ''}`}>{t.shifts.waitingForOperatorConfirmation}</span>
                </>
              )}
            </div>
          </div>
        )}
        <div>
          <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 mb-4`}>{t.shifts.apartmentInformation}</h2>
          <div className="space-y-2" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
            <p className={isOperator ? 'text-lg' : ''} style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1, visibility: 'visible' }}>
              <span className="font-medium" style={{ color: '#111827', WebkitTextFillColor: '#111827', fontWeight: 600 }}>{t.dashboard.apartment}:</span>{' '}
              <span style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>{shift.apartment.name}</span>
            </p>
            <p className={isOperator ? 'text-lg' : ''} style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1, visibility: 'visible' }}>
              <span className="font-medium" style={{ color: '#111827', WebkitTextFillColor: '#111827', fontWeight: 600 }}>{t.dashboard.address}:</span>{' '}
              <span style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>{shift.apartment.address}</span>
            </p>
            {guestCount !== null && !isOperator && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-semibold">
                  👥 {t.shifts.prepareApartment} <span className="text-lg">{guestCount}</span> {guestCount === 1 ? t.shifts.guest : t.shifts.guests}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {t.shifts.guestsExpected}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* For operators: Show guest count in LARGE format */}
        {isOperator && guestCount !== null && (
          <div>
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-600 rounded-xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider transform rotate-12 translate-x-1 -translate-y-1">
                ⚠️ IMPORTANT
              </div>
              <div className="flex items-start gap-3 mb-3">
                <svg className="w-8 h-8 text-purple-800 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex-1">
                  <div className="text-base font-black text-purple-900 uppercase tracking-widest mb-2">👥 {t.shifts.prepareApartment} - VERY IMPORTANT</div>
                  <div className="font-black text-purple-900 mb-2 leading-none" style={{ fontSize: '56px' }}>
                    {guestCount}
                  </div>
                  <div className="font-black text-purple-800 bg-purple-50 px-3 py-1 rounded-lg inline-block mb-1" style={{ fontSize: '22px' }}>
                    {guestCount === 1 ? t.shifts.guest : t.shifts.guests}
                  </div>
                  <div className="text-base font-bold text-purple-700">
                    {t.shifts.guestsExpected}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 mb-4`}>{t.shifts.shiftInformation}</h2>
        </div>

        <div>
          <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 mb-4`}>{t.shifts.schedule}</h2>
          {/* For operators, show date and time in LARGE, easy-to-read format */}
          {isOperator ? (
            <div className="space-y-3">
              {/* IMPORTANT: DATE - Very prominent */}
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-600 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider transform rotate-12 translate-x-1 -translate-y-1">
                  ⚠️ IMPORTANT
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-blue-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-base font-black text-blue-900 uppercase tracking-widest mb-2">📅 {t.dashboard.date} - VERY IMPORTANT</div>
                    <div className="font-black text-blue-900 mb-1 leading-tight" style={{ fontSize: '28px' }}>{safeFormatDate(shift.scheduledDate, 'EEEE')}</div>
                    <div className="font-black text-blue-900 mb-1" style={{ fontSize: '40px' }}>{safeFormatDate(shift.scheduledDate, 'dd MMMM yyyy')}</div>
                    <div className="font-black text-blue-800 bg-blue-50 px-2 py-1 rounded-lg inline-block" style={{ fontSize: '24px' }}>{safeFormatDate(shift.scheduledDate, 'dd/MM/yyyy')}</div>
                  </div>
                </div>
              </div>
              {/* IMPORTANT: START TIME - Very prominent */}
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-600 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider transform rotate-12 translate-x-1 -translate-y-1">
                  ⚠️ IMPORTANT
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-base font-black text-green-900 uppercase tracking-widest mb-2">⏰ {t.dashboard.scheduledTime} - START TIME - VERY IMPORTANT</div>
                    <div className="font-black text-green-900 mb-1 leading-none" style={{ fontSize: '60px' }}>
                      {safeFormatDate(shift.scheduledStartTime, 'HH:mm')}
                    </div>
                    <div className="font-black text-green-800 bg-green-50 px-2 py-1 rounded-lg inline-block mb-1" style={{ fontSize: '28px' }}>
                      {safeFormatDate(shift.scheduledStartTime, 'h:mm a')}
                    </div>
                    {shift.scheduledEndTime && (
                      <div className="mt-2 pt-2 border-t-2 border-green-400">
                        <div className="text-base font-bold text-green-700 mb-1">Until (End Time):</div>
                        <div className="text-2xl font-black text-green-900 mb-1 leading-none">
                          {safeFormatDate(shift.scheduledEndTime, 'HH:mm')}
                        </div>
                        <div className="text-base font-bold text-green-700">
                          {safeFormatDate(shift.scheduledEndTime, 'h:mm a')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2" style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
              <p style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1, visibility: 'visible' }}>
                <span className="font-medium" style={{ color: '#111827', WebkitTextFillColor: '#111827', fontWeight: 600 }}>{t.dashboard.date}:</span>{' '}
                <span style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>{safeFormatDate(shift.scheduledDate, 'dd/MM/yyyy')}</span>
              </p>
              <p style={{ color: '#111827', WebkitTextFillColor: '#111827', opacity: 1, visibility: 'visible' }}>
                <span className="font-medium" style={{ color: '#111827', WebkitTextFillColor: '#111827', fontWeight: 600 }}>{t.dashboard.scheduledTime}:</span>{' '}
                <span style={{ color: '#111827', WebkitTextFillColor: '#111827' }}>
                  {safeFormatDate(shift.scheduledStartTime, 'h:mm a')}
                  {shift.scheduledEndTime && ` - ${safeFormatDate(shift.scheduledEndTime, 'h:mm a')}`}
                </span>
              </p>
            </div>
          )}
          {shift.actualStartTime && (
            <p className={`text-green-600 ${isOperator ? 'text-lg' : ''}`} style={{ color: '#059669', WebkitTextFillColor: '#059669', opacity: 1, visibility: 'visible' }}>
              <span className="font-medium" style={{ color: '#059669', WebkitTextFillColor: '#059669', fontWeight: 600 }}>{t.shifts.started}:</span>{' '}
              <span style={{ color: '#059669', WebkitTextFillColor: '#059669' }}>
                {safeFormatDate(shift.actualStartTime, 'h:mm a')}
              </span>
            </p>
          )}
          {shift.actualEndTime && (
            <p className={`text-green-600 ${isOperator ? 'text-lg' : ''}`} style={{ color: '#059669', WebkitTextFillColor: '#059669', opacity: 1, visibility: 'visible' }}>
              <span className="font-medium" style={{ color: '#059669', WebkitTextFillColor: '#059669', fontWeight: 600 }}>{t.status.completed}:</span>{' '}
              <span style={{ color: '#059669', WebkitTextFillColor: '#059669' }}>
                {safeFormatDate(shift.actualEndTime, 'h:mm a')}
              </span>
            </p>
          )}
        </div>

        {!isOperator && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.dashboard.operator}</h2>
            <p>{shift.cleaner.name} ({shift.cleaner.email})</p>
          </div>
        )}
      </div>

        <div>
          <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 mb-4`}>{t.status.scheduled}</h2>
          <div className="flex items-center gap-4">
            <span
              className={`inline-block px-4 py-2 rounded-full ${isOperator ? 'text-base' : 'text-sm'} font-medium ${
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
            {isOperator && shift.confirmedSeen?.confirmed && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-lg font-medium">
                <svg className={`${isOperator ? 'w-6 h-6' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.status.confirmed}
                {shift.confirmedSeen.confirmedAt && (
                  <span className={isOperator ? 'text-base' : 'text-sm'}>
                    ({safeFormatDate(shift.confirmedSeen.confirmedAt, 'dd/MM/yyyy, h:mm a')})
                  </span>
                )}
              </span>
            )}
            {!isOperator && (
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                shift.confirmedSeen?.confirmed
                  ? 'bg-green-50 text-green-700'
                  : 'bg-orange-50 text-orange-700'
              }`}>
                {shift.confirmedSeen?.confirmed ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Operator Confirmed
                    {shift.confirmedSeen.confirmedAt && (
                      <span className="text-xs">
                        ({safeFormatDate(shift.confirmedSeen.confirmedAt, 'dd/MM/yyyy, h:mm a')})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {t.shifts.awaitingConfirmation}
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {shift.notes && (
          <div>
            <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 mb-4`}>{t.dashboard.notes}</h2>
            <p className={`text-gray-700 ${isOperator ? 'text-lg' : ''}`}>{shift.notes}</p>
          </div>
        )}

        {/* Time Change Request Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900`}>{t.shifts.timeChangeRequests}</h2>
            {canRequestTimeChange && !shift.timeChangeRequest && (() => {
              // Check if request can be sent (until 1 hour before shift)
              const scheduledDate = new Date(shift.scheduledDate);
              const scheduledStartTime = new Date(shift.scheduledStartTime);
              const scheduledDateTime = new Date(
                scheduledDate.getFullYear(),
                scheduledDate.getMonth(),
                scheduledDate.getDate(),
                scheduledStartTime.getHours(),
                scheduledStartTime.getMinutes(),
                scheduledStartTime.getSeconds(),
                0
              );
              const oneHourBeforeShift = new Date(scheduledDateTime.getTime() - 60 * 60 * 1000);
              const canSendRequest = currentTime < oneHourBeforeShift;

              return (
                <button
                  onClick={() => {
                    if (!canSendRequest) {
                      toast.error('Time change requests can only be sent until 1 hour before the shift starts');
                      return;
                    }
                    setShowTimeChangeModal(true);
                  }}
                  disabled={!canSendRequest}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Request Time Change
                </button>
              );
            })()}
          </div>
          {shift.timeChangeRequest ? (
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <h3 className={`font-semibold text-yellow-900 mb-2 ${isOperator ? 'text-2xl' : 'text-xl'}`}>Active Time Change Request</h3>
            <p className={`${isOperator ? 'text-lg' : 'text-sm'} text-yellow-800`}>
              <span className="font-medium">{t.shifts.currentTime}:</span> {safeFormatDate(shift.scheduledStartTime, 'h:mm a')}
            </p>
            <p className={`${isOperator ? 'text-lg' : 'text-sm'} text-yellow-800`}>
              <span className="font-medium">{t.shifts.newTime}:</span> {safeFormatDate(shift.timeChangeRequest.newStartTime, 'h:mm a')}
            </p>
            {shift.timeChangeRequest.newEndTime && (
              <p className={`${isOperator ? 'text-lg' : 'text-sm'} text-yellow-800`}>
                <span className="font-medium">New end time:</span> {safeFormatDate(shift.timeChangeRequest.newEndTime, 'h:mm a')}
              </p>
            )}
            {shift.timeChangeRequest.reason && (
              <p className={`${isOperator ? 'text-lg' : 'text-sm'} text-yellow-800 mt-1`}><span className="font-medium">Reason:</span> {shift.timeChangeRequest.reason}</p>
            )}
            <p className={`${isOperator ? 'text-lg' : 'text-sm'} text-yellow-800 mt-1`}>
              <span className="font-medium">Status:</span> {shift.timeChangeRequest.status?.replace('_', ' ') || 'Unknown'}
            </p>
            {shift.timeChangeRequest.operatorConfirmed && (
              <p className={`${isOperator ? 'text-lg' : 'text-sm'} text-green-700 mt-1`}>
                ✓ Confirmed by operator
                {shift.timeChangeRequest.operatorConfirmedAt && 
                  ` on ${safeFormatDate(shift.timeChangeRequest.operatorConfirmedAt, 'dd/MM/yyyy, h:mm a')}`
                }
              </p>
            )}
            {canApproveTimeChange && shift.timeChangeRequest.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={async () => {
                    const response = await fetch(`/api/shifts/${params.id}/time-change`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'approved' }),
                    });
                    if (response.ok) {
                      toast.success('Time change approved');
                      fetchShift();
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={async () => {
                    const response = await fetch(`/api/shifts/${params.id}/time-change`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'rejected' }),
                    });
                    if (response.ok) {
                      toast.success('Time change rejected');
                      fetchShift();
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
            {isOperator && 
             shift.timeChangeRequest.status === 'pending' && 
             !shift.timeChangeRequest.operatorConfirmed && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={async () => {
                    const response = await fetch(`/api/shifts/${params.id}/time-change/confirm`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ confirmed: true }),
                    });
                    if (response.ok) {
                      toast.success('Time change confirmed!');
                      fetchShift();
                    } else {
                      const data = await response.json();
                      toast.error(data.error || 'Failed to confirm time change');
                    }
                  }}
                  className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 ${isOperator ? 'text-lg' : ''} font-medium`}
                >
                  <svg className={`${isOperator ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm Time Change
                </button>
                <button
                  onClick={async () => {
                    const response = await fetch(`/api/shifts/${params.id}/time-change/confirm`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ confirmed: false }),
                    });
                    if (response.ok) {
                      toast.success('Time change rejected');
                      fetchShift();
                    } else {
                      const data = await response.json();
                      toast.error(data.error || 'Failed to reject time change');
                    }
                  }}
                  className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 ${isOperator ? 'text-lg' : ''} font-medium`}
                >
                  <svg className={`${isOperator ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject Time Change
                </button>
              </div>
            )}
          </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-gray-600 mb-2">No time change request has been sent for this shift.</p>
              {canRequestTimeChange && (() => {
                const scheduledDate = new Date(shift.scheduledDate);
                const scheduledStartTime = new Date(shift.scheduledStartTime);
                const scheduledDateTime = new Date(
                  scheduledDate.getFullYear(),
                  scheduledDate.getMonth(),
                  scheduledDate.getDate(),
                  scheduledStartTime.getHours(),
                  scheduledStartTime.getMinutes(),
                  scheduledStartTime.getSeconds(),
                  0
                );
                const oneHourBeforeShift = new Date(scheduledDateTime.getTime() - 60 * 60 * 1000);
                const canSendRequest = currentTime < oneHourBeforeShift;
                const timeUntilDeadline = oneHourBeforeShift.getTime() - currentTime.getTime();
                const minutesUntilDeadline = Math.max(0, Math.ceil(timeUntilDeadline / (60 * 1000)));

                if (canSendRequest) {
                  return (
                    <p className="text-sm text-gray-500">
                      You can send a time change request until 1 hour before the shift starts.
                    </p>
                  );
                } else {
                  return (
                    <p className="text-sm text-orange-600">
                      Time change requests can no longer be sent (deadline was 1 hour before shift start).
                    </p>
                  );
                }
              })()}
            </div>
          )}
        </div>

        {shift.instructionPhotos && shift.instructionPhotos.length > 0 && (
          <div>
            <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 mb-4`}>Instruction Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {shift.instructionPhotos.map((photo, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-2">
                  <img
                    src={photo.url}
                    alt={photo.description || `Instruction ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setViewingPhoto(photo.url)}
                  />
                  {photo.description && (
                    <p className="text-sm text-gray-600 mt-2">{photo.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    By {photo.uploadedBy.name} on {safeFormatDate(photo.uploadedAt, 'dd/MM/yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {shift.problems && shift.problems.length > 0 && (
          <div>
            <h2 className={`${isOperator ? 'text-2xl' : 'text-xl'} font-semibold text-gray-900 mb-4`}>Problems Reported</h2>
            <div className="space-y-3">
              {shift.problems.map((problem) => (
                <div
                  key={problem._id}
                  className={`border rounded-lg p-4 ${
                    problem.resolved ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{problem.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-700 mt-1">{problem.description}</p>
                      {problem.photos && problem.photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {problem.photos.map((photo, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={photo.url}
                                alt={`Problem photo ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setViewingPhoto(photo.url)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Reported by {problem.reportedBy.name} on{' '}
                        {safeFormatDate(problem.reportedAt, 'dd/MM/yyyy, h:mm a')}
                      </p>
                    </div>
                    {problem.resolved && (
                      <span className={`${isOperator ? 'text-sm' : 'text-xs'} text-green-600 font-medium ml-4`}>Resolved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          {isOperator && !shift.confirmedSeen?.confirmed && (
            <button
              onClick={handleConfirmShift}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium text-xl shadow-md"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              I Saw and Accept This Shift
            </button>
          )}
          {isOperator && shift.status === 'scheduled' && (() => {
            const scheduledDate = new Date(shift.scheduledDate);
            const scheduledStartTime = new Date(shift.scheduledStartTime);
            const scheduledDateTime = new Date(
              scheduledDate.getFullYear(),
              scheduledDate.getMonth(),
              scheduledDate.getDate(),
              scheduledStartTime.getHours(),
              scheduledStartTime.getMinutes(),
              scheduledStartTime.getSeconds(),
              0
            );
            const canStart = currentTime >= scheduledDateTime;
            const timeUntilStart = scheduledDateTime.getTime() - currentTime.getTime();
            const minutesUntilStart = timeUntilStart > 0 ? Math.ceil(timeUntilStart / (60 * 1000)) : 0;
            
            return (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStartCleaning}
                  disabled={updating || !canStart}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-medium"
                >
                  Start Cleaning
                </button>
                {!canStart && minutesUntilStart > 0 && (
                  <p className="text-base text-orange-600">
                    Please wait {minutesUntilStart} minute(s) until the scheduled start time
                  </p>
                )}
                {canStart && (
                  <p className="text-base text-green-600">
                    You can start the cleaning now
                  </p>
                )}
              </div>
            );
          })()}
          {isOperator && shift.status === 'in_progress' && shift.actualStartTime && (() => {
            const startTime = new Date(shift.actualStartTime);
            const now = new Date(); // Use actual current time, not the state
            const oneHourInMs = 60 * 60 * 1000;
            const timeDifference = now.getTime() - startTime.getTime();
            const canComplete = timeDifference >= oneHourInMs;
            const remainingMs = Math.max(0, oneHourInMs - timeDifference);
            const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
            
            return (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleEndCleaning}
                  disabled={updating || !canComplete}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-medium"
                >
                  Complete Cleaning
                </button>
                {!canComplete && remainingMinutes > 0 && (
                  <p className="text-base text-orange-600">
                    Minimum 1 hour required. Please wait {remainingMinutes} more minute(s)
                  </p>
                )}
              </div>
            );
          })()}
          {isOperator && (
            <button
              onClick={() => setShowProblemModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 text-xl font-medium"
            >
              {t.shifts.reportProblem}
            </button>
          )}
          {!isOperator && (user?.role === 'admin' || user?.role === 'owner') && (
            <button
              onClick={() => setShowInstructionPhotoModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Add Instruction Photo
            </button>
          )}
          {canRequestTimeChange && !shift.timeChangeRequest && (() => {
            // Check if request can be sent (until 1 hour before shift)
            const scheduledDate = new Date(shift.scheduledDate);
            const scheduledStartTime = new Date(shift.scheduledStartTime);
            const scheduledDateTime = new Date(
              scheduledDate.getFullYear(),
              scheduledDate.getMonth(),
              scheduledDate.getDate(),
              scheduledStartTime.getHours(),
              scheduledStartTime.getMinutes(),
              scheduledStartTime.getSeconds(),
              0
            );
            const oneHourBeforeShift = new Date(scheduledDateTime.getTime() - 60 * 60 * 1000);
            const canSendRequest = currentTime < oneHourBeforeShift;
            const timeUntilDeadline = oneHourBeforeShift.getTime() - currentTime.getTime();
            const minutesUntilDeadline = Math.ceil(timeUntilDeadline / (60 * 1000));

            return (
                <button
                  onClick={() => {
                    if (!canSendRequest) {
                      toast.error('Time change requests can only be sent until 1 hour before the shift starts');
                      return;
                    }
                    setShowTimeChangeModal(true);
                  }}
                  disabled={!canSendRequest}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Request Time Change
                </button>
            );
          })()}
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <>
              <button
                onClick={() => router.push(`/dashboard/shifts/${params.id}/edit`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {user?.role === 'admin' ? 'Edit Shift' : 'Request Shift Edit'}
              </button>
              {(user?.role === 'admin' || (user?.role === 'owner' && shift?.createdBy && user?._id && (() => {
                try {
                  const createdByObj = shift.createdBy;
                  const createdById = createdByObj && typeof createdByObj === 'object' && (createdByObj as any)._id
                    ? (createdByObj as any)._id.toString()
                    : (createdByObj ? String(createdByObj) : null);
                  const userId = user._id.toString();
                  return createdById && createdById === userId;
                } catch (e) {
                  return false;
                }
              })())) && (
                <button
                  onClick={handleDeleteShift}
                  disabled={deleting}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? 'Deleting...' : 'Delete Shift'}
                </button>
              )}
            </>
          )}
        </div>

      {/* Time Change Request Modal */}
      {showTimeChangeModal && shift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Time Change</h2>
            <p className="text-sm text-gray-600 mb-4">
              Current scheduled time: {safeFormatDate(shift.scheduledStartTime, 'h:mm a')} on {safeFormatDate(shift.scheduledDate, 'dd/MM/yyyy')}
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="newStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                  New Start Time *
                </label>
                <input
                  id="newStartTime"
                  type="time"
                  value={timeChangeForm.newStartTime}
                  onChange={(e) => setTimeChangeForm({ ...timeChangeForm, newStartTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="newEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                  New End Time (optional)
                </label>
                <input
                  id="newEndTime"
                  type="time"
                  value={timeChangeForm.newEndTime}
                  onChange={(e) => setTimeChangeForm({ ...timeChangeForm, newEndTime: e.target.value })}
                  min={timeChangeForm.newStartTime || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason * (e.g., guests leaving later)
                </label>
                <textarea
                  id="reason"
                  value={timeChangeForm.reason}
                  onChange={(e) => setTimeChangeForm({ ...timeChangeForm, reason: e.target.value })}
                  required
                  rows={3}
                  placeholder="Please explain why you need to change the time..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRequestTimeChange}
                disabled={updating || !timeChangeForm.newStartTime || !timeChangeForm.reason}
                className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => {
                  setShowTimeChangeModal(false);
                  setTimeChangeForm({ newStartTime: '', newEndTime: '', reason: '' });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Report Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Problem</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  rows={4}
                  placeholder="Describe the problem..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={problemType}
                  onChange={(e) => setProblemType(e.target.value as 'issue' | 'forgotten_item')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                >
                  <option value="issue">Issue</option>
                  <option value="forgotten_item">Forgotten Item</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Optional)
                </label>
                <PhotoUpload
                  onPhotosSelected={setProblemPhotos}
                  maxPhotos={5}
                  label="Add Photos"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReportProblem}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                {t.problems.reportProblem}
              </button>
              <button
                onClick={() => {
                  setShowProblemModal(false);
                  setProblemDescription('');
                  setProblemPhotos([]);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instruction Photo Modal */}
      {showInstructionPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Instruction Photo</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo *
                </label>
                <PhotoUpload
                  onPhotosSelected={(photos) => {
                    if (photos.length > 0) {
                      setInstructionPhotoUrl(photos[0]);
                    } else {
                      setInstructionPhotoUrl('');
                    }
                  }}
                  maxPhotos={1}
                  label="Add Photo"
                />
                {instructionPhotoUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={instructionPhotoUrl}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={instructionPhotoDescription}
                  onChange={(e) => setInstructionPhotoDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  rows={3}
                  placeholder="Describe what should be cleaned..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddInstructionPhoto}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Add Photo
              </button>
              <button
                onClick={() => {
                  setShowInstructionPhotoModal(false);
                  setInstructionPhotoUrl('');
                  setInstructionPhotoDescription('');
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <img
              src={viewingPhoto}
              alt="Full size photo"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

