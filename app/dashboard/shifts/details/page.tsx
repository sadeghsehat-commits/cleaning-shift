'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PhotoUpload from '@/components/PhotoUpload';
import { useI18n } from '@/contexts/I18nContext';
import { translateText } from '@/lib/translate';
import { apiUrl } from '@/lib/api-config';

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
  guestCount?: number;
  notes?: string;
  comments?: Array<{
    text: string;
    postedBy: { _id: string; name: string } | string;
    postedAt: string;
  }>;
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

function ShiftDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shiftId = searchParams.get('id');
  const { t, language } = useI18n();
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
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const [problemType, setProblemType] = useState<'issue' | 'forgotten_item'>('issue');
  const [problemPhotos, setProblemPhotos] = useState<string[]>([]);
  const [showInstructionPhotoModal, setShowInstructionPhotoModal] = useState(false);
  const [instructionPhotoUrl, setInstructionPhotoUrl] = useState('');
  const [instructionPhotoDescription, setInstructionPhotoDescription] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const [translatedDescriptions, setTranslatedDescriptions] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesText, setNotesText] = useState('');

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
      const response = await fetch(apiUrl(`/api/shifts/${shiftId}`), {
        method: 'DELETE',
        credentials: 'include',
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
    if (user && shiftId) {
      fetchShift();
    }
  }, [user, shiftId]);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!shift || !language) return;

    const translateAll = async () => {
      setTranslating(true);
      const translations: Record<string, string> = {};

      try {
        if (shift.comments && Array.isArray(shift.comments)) {
          for (let idx = 0; idx < shift.comments.length; idx++) {
            const comment = shift.comments[idx];
            if (comment.text && comment.text.trim()) {
              const translated = await translateText(comment.text, language, 'auto');
              translations[`comment_${idx}`] = translated;
            }
          }
        }

        if (shift.instructionPhotos && Array.isArray(shift.instructionPhotos)) {
          for (const photo of shift.instructionPhotos) {
            if (photo.description && photo.description.trim()) {
              const key = `instruction_${photo._id || photo.uploadedAt}`;
              const translated = await translateText(photo.description, language, 'auto');
              translations[key] = translated;
            }
          }
        }

        if (shift.problems && Array.isArray(shift.problems)) {
          for (const problem of shift.problems) {
            if (problem.description && problem.description.trim()) {
              const key = `problem_${problem._id}`;
              const translated = await translateText(problem.description, language, 'auto');
              translations[key] = translated;
            }
          }
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setTranslatedDescriptions(translations);
        setTranslating(false);
      }
    };

    translateAll();
  }, [shift, language]);

  const checkAuth = async () => {
    try {
      console.log('🔐 Checking auth...');
      const response = await fetch(apiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth successful:', data.user.name);
        setUser(data.user);
      } else {
        console.log('❌ Auth failed, redirecting to login');
        setLoading(false);
        router.push('/');
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      setLoading(false);
      router.push('/');
    }
  };

  const fetchShift = async () => {
    console.log(`🔍 Fetching shift: ${shiftId}`);
    try {
      const url = apiUrl(`/api/shifts/${shiftId}`);
      console.log('📡 Fetching from:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      console.log('📥 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Shift loaded:', data.shift?.apartment?.name);
        setShift(data.shift);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to load shift:', errorData);
        toast.error('Failed to load shift: ' + (errorData.error || 'Unknown error'));
        setTimeout(() => router.push('/dashboard/shifts'), 2000);
      }
    } catch (error) {
      console.error('❌ Error fetching shift:', error);
      toast.error('Network error: ' + String(error));
      setTimeout(() => router.push('/dashboard/shifts'), 2000);
    } finally {
      console.log('✅ Setting loading to false');
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    try {
      const response = await fetch(apiUrl(`/api/shifts/${shiftId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          actualStartTime: new Date().toISOString(),
          status: 'in_progress',
        }),
      });

      if (response.ok) {
        toast.success('Shift started!');
        fetchShift();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to start shift');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleCompleteShift = async () => {
    try {
      const response = await fetch(apiUrl(`/api/shifts/${shiftId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          actualEndTime: new Date().toISOString(),
          status: 'completed',
        }),
      });

      if (response.ok) {
        toast.success('Shift completed!');
        fetchShift();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to complete shift');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleConfirmShift = async () => {
    try {
      const response = await fetch(apiUrl(`/api/shifts/${shiftId}/confirm`), {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Shift confirmed!');
        fetchShift();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to confirm shift');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!shift) {
    return <div className="flex items-center justify-center min-h-screen">Shift not found</div>;
  }

  const isOperator = user?.role === 'operator';
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const canStartShift = isOperator && shift.status === 'scheduled';
  const canCompleteShift = isOperator && shift.status === 'in_progress';
  const canConfirm = isOperator && !shift.confirmedSeen?.confirmed;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/dashboard/shifts"
          className="text-primary-600 hover:text-primary-700 flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Shifts
        </Link>
      </div>

      {/* Status Badge */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Shift Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            shift.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            shift.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
            shift.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {shift.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Apartment Info */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Apartment</label>
            <p className="text-lg font-semibold text-gray-900">{shift.apartment?.name || 'N/A'}</p>
            <p className="text-sm text-gray-600">{shift.apartment?.address || ''}</p>
          </div>

          {/* Operator Info */}
          <div>
            <label className="text-sm font-medium text-gray-600">Operator</label>
            <p className="text-lg text-gray-900">{shift.cleaner?.name || 'Not assigned'}</p>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Date</label>
              <p className="text-lg text-gray-900">
                {format(new Date(shift.scheduledDate), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Time</label>
              <p className="text-lg text-gray-900">
                {format(new Date(shift.scheduledStartTime), 'HH:mm')}
                {shift.scheduledEndTime && ` - ${format(new Date(shift.scheduledEndTime), 'HH:mm')}`}
              </p>
            </div>
          </div>

          {/* Guest Count */}
          {shift.guestCount !== undefined && (
            <div>
              <label className="text-sm font-medium text-gray-600">Guests</label>
              <p className="text-lg text-gray-900">{shift.guestCount}</p>
            </div>
          )}

          {/* Notes */}
          {shift.notes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Notes</label>
              <p className="text-gray-900">{shift.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {canConfirm && (
            <button
              onClick={handleConfirmShift}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Confirm Shift
            </button>
          )}
          
          {canStartShift && (
            <button
              onClick={handleStartShift}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Start Shift
            </button>
          )}
          
          {canCompleteShift && (
            <button
              onClick={handleCompleteShift}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Complete Shift
            </button>
          )}

          {/* Edit button disabled for mobile - edit page not available in static build */}
          {/* (isAdmin || isOwner) && (
            <Link
              href={`/dashboard/shifts/${shiftId}/edit`}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Edit Shift
            </Link>
          ) */}
        </div>

        {/* Confirmation Status */}
        {shift.confirmedSeen?.confirmed && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Shift confirmed {shift.confirmedSeen.confirmedAt && `on ${format(new Date(shift.confirmedSeen.confirmedAt), 'MMM dd, yyyy HH:mm')}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShiftDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ShiftDetailsContent />
    </Suspense>
  );
}

