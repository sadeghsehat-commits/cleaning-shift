'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PhotoUpload from '@/components/PhotoUpload';
import { useI18n } from '@/contexts/I18nContext';
import { translateText } from '@/lib/translate';
import { apiUrl, apiFetch } from '@/lib/api-config';

interface Shift {
  _id: string;
  apartment: { 
    name: string; 
    address: string; 
    _id: string;
    owner?: { _id: string; name: string; email?: string } | string;
    howToEnterDescription?: string;
    howToEnterPhotos?: Array<{ url: string; description?: string; uploadedAt?: string }>;
  };
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

function ShiftDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Hooks first (no early returns) — avoids React #310
  const { t, language } = useI18n();
  const shiftId = searchParams.get('id');
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
    if (!shiftId) {
      toast.error('No shift ID available');
      return;
    }
    if (!confirm('Are you sure you want to delete this shift? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await apiFetch(`/api/shifts/${shiftId}`, {
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
      const response = await apiFetch('/api/auth/me', {
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
    if (!shiftId) {
      console.error('❌ Cannot fetch shift: shiftId is null');
      setLoading(false);
      return;
    }
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
        
        if (data.shift && data.shift.guestCount !== undefined && data.shift.guestCount !== null) {
          setGuestCount(data.shift.guestCount);
        } else {
          setGuestCount(null);
        }
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
    if (!shiftId) {
      toast.error('No shift ID available');
      return;
    }
    try {
      const response = await apiFetch(`/api/shifts/${shiftId}`, {
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
    if (!shiftId) {
      toast.error('No shift ID available');
      return;
    }
    try {
      const response = await apiFetch(`/api/shifts/${shiftId}`, {
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
    if (!shiftId) {
      toast.error('No shift ID available');
      return;
    }
    try {
      const response = await apiFetch(`/api/shifts/${shiftId}/confirm`, {
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

  const handleSaveNotes = async () => {
    if (!shiftId) {
      toast.error('No shift ID available');
      return;
    }
    if (!notesText.trim()) {
      toast.error('Comment text is required');
      return;
    }

    try {
      const response = await apiFetch(`/api/shifts/${shiftId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: notesText.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Comment added successfully');
        setShowNotesModal(false);
        setNotesText('');
        await fetchShift();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to add comment');
      }
    } catch (error: any) {
      toast.error('An error occurred');
      console.error('Error:', error);
    }
  };

  const handleAddInstructionPhoto = async () => {
    if (!shiftId) {
      toast.error('No shift ID available');
      return;
    }
    if (!instructionPhotoUrl.trim()) {
      toast.error('Please add a photo');
      return;
    }

    try {
      const response = await apiFetch(`/api/shifts/${shiftId}/instruction-photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        await fetchShift();
      } else {
        await fetchShift();
        toast.error(data.error || 'Failed to add instruction photo');
        console.error('Error response:', data);
      }
    } catch (error: any) {
      toast.error('An error occurred');
      console.error('Error:', error);
    }
  };

  const handleReportProblem = async () => {
    if (!shiftId) {
      toast.error('No shift ID available');
      return;
    }
    if (!problemDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      const response = await apiFetch(`/api/shifts/${shiftId}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        const data = await response.json();
        toast.error(data.error || 'Failed to report problem');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  // Calculate derived values
  const isOperator = user?.role === 'operator';
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';
  const canStartShift = isOperator && shift?.status === 'scheduled';
  const canCompleteShift = isOperator && shift?.status === 'in_progress';
  const canConfirm = isOperator && !shift?.confirmedSeen?.confirmed;

  // NO EARLY RETURNS - handle all states in JSX to prevent hooks violation
  // React Error #310 happens when component renders with different hook counts
  // By always rendering the same structure, we ensure consistent hook calls
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Handle loading and error states in JSX, not with early returns */}
      {!shiftId ? (
        <div className="flex items-center justify-center min-h-screen">
          <div>No shift ID provided</div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      ) : !shift ? (
        <div className="flex items-center justify-center min-h-screen">
          <div>Shift not found</div>
        </div>
      ) : (
        <>
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

      {/* Main Shift Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Shift Details</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <a href="#how-to-enter" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap">
              🔑 How to enter
            </a>
            <a
              href={`/dashboard/shifts/how-to-enter?id=${shiftId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-600 hover:text-amber-800 whitespace-nowrap"
            >
              Open in new window
            </a>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              shift.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              shift.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              shift.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {shift.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* How to enter — first so all roles see it (operators, owners, admins) */}
        <div id="how-to-enter" className="rounded-lg bg-amber-50 border border-amber-200 p-4 scroll-mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">🔑 How to enter {shift.apartment?.name || 'the apartment'}</h2>
            <a
              href={`/dashboard/shifts/how-to-enter?id=${shiftId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap"
            >
              Open in new window ↗
            </a>
          </div>
          {shift.apartment?.howToEnterDescription || (shift.apartment?.howToEnterPhotos && shift.apartment.howToEnterPhotos.length > 0) ? (
            <>
              {shift.apartment?.howToEnterDescription && (
                <p className="text-gray-900 whitespace-pre-wrap mb-4">{shift.apartment.howToEnterDescription}</p>
              )}
              {shift.apartment?.howToEnterPhotos && shift.apartment.howToEnterPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {shift.apartment.howToEnterPhotos.map((p, idx) => (
                    <div key={idx} className="border border-amber-200 rounded-lg p-2 bg-white">
                      <img
                        src={p.url}
                        alt={p.description || `How to enter ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setViewingPhoto(p.url)}
                      />
                      {p.description && <p className="text-sm text-gray-600 mt-2">{p.description}</p>}
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-gray-500 italic">No instructions added for this apartment yet.</p>
          )}
        </div>

        {/* Apartment Information */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📍 Apartment Information</h2>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Apartment Name</label>
              <p className="text-lg font-semibold text-gray-900">{shift.apartment?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Address</label>
              <p className="text-base text-gray-700">{shift.apartment?.address || 'No address provided'}</p>
            </div>
            {isOperator && shift.apartment?.owner && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Owner</label>
                <p className="text-base text-gray-700">
                  {typeof shift.apartment.owner === 'object' && shift.apartment.owner.name
                    ? shift.apartment.owner.name
                    : 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Operator Information */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">👤 Operator</h2>
          <p className="text-lg text-gray-900">{shift.cleaner?.name || 'Not assigned'}</p>
          {shift.cleaner?.email && (
            <p className="text-sm text-gray-600 mt-1">{shift.cleaner.email}</p>
          )}
        </div>

        {/* Schedule Information */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">📅 Schedule</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Date</label>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(shift.scheduledDate), 'EEEE, MMMM dd, yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(shift.scheduledDate), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Start Time</label>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(shift.scheduledStartTime), 'HH:mm')}
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(shift.scheduledStartTime), 'h:mm a')}
              </p>
            </div>
            {shift.scheduledEndTime && (
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">End Time</label>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(shift.scheduledEndTime), 'HH:mm')}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(shift.scheduledEndTime), 'h:mm a')}
                </p>
              </div>
            )}
            {shift.actualStartTime && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <label className="text-sm font-medium text-green-600 block mb-1">Started At</label>
                <p className="text-base text-green-700">
                  {format(new Date(shift.actualStartTime), 'h:mm a')}
                </p>
              </div>
            )}
            {shift.actualEndTime && (
              <div className="mt-2">
                <label className="text-sm font-medium text-green-600 block mb-1">Completed At</label>
                <p className="text-base text-green-700">
                  {format(new Date(shift.actualEndTime), 'h:mm a')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Guest Count */}
        {(guestCount !== null || shift.guestCount !== undefined) && (
          <div className={`p-3 rounded-lg ${isOperator ? 'bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-600 shadow-md' : 'bg-blue-50 border border-blue-200'}`}>
            <label className={`text-sm font-medium ${isOperator ? 'text-purple-900 font-black uppercase tracking-wide' : 'text-gray-600'}`}>
              👥 Number of Guests
            </label>
            <p className={`${isOperator ? 'text-4xl font-black text-purple-900 my-2' : 'text-2xl font-bold text-blue-900 my-1'}`}>
              {guestCount !== null ? guestCount : shift.guestCount}
            </p>
            <p className={`text-xs ${isOperator ? 'text-purple-700 font-semibold' : 'text-gray-600'}`}>
              {guestCount !== null ? guestCount : shift.guestCount} {((guestCount !== null ? guestCount : shift.guestCount) === 1) ? 'guest' : 'guests'} expected for this shift
            </p>
          </div>
        )}

        {/* Notes */}
        {shift.notes && (
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">📝 Notes</h2>
            <p className="text-gray-900">{shift.notes}</p>
          </div>
        )}

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
              ✅ Shift confirmed {shift.confirmedSeen.confirmedAt ? `on ${format(new Date(shift.confirmedSeen.confirmedAt), 'MMM dd, yyyy HH:mm')}` : ''}
            </p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          <button
            onClick={() => {
              setShowNotesModal(true);
              setNotesText('');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Add Comment
          </button>
        </div>
        {shift.comments && shift.comments.length > 0 ? (
          <div className="space-y-3">
            {[...shift.comments].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()).map((comment, idx) => {
              const commentId = (comment as any)._id?.toString() || idx.toString();
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50 relative">
                  {user?.role === 'admin' && (
                    <button
                      onClick={async () => {
                        if (!shiftId) {
                          toast.error('No shift ID available');
                          return;
                        }
                        if (!confirm('Are you sure you want to delete this comment?')) return;
                        try {
                          const response = await apiFetch(`/api/shifts/${shiftId}/comments/${commentId}`, {
                            method: 'DELETE',
                            credentials: 'include',
                          });
                          if (response.ok) {
                            toast.success('Comment deleted successfully');
                            await fetchShift();
                          } else {
                            const data = await response.json();
                            toast.error(data.error || 'Failed to delete comment');
                          }
                        } catch (error: any) {
                          toast.error('An error occurred while deleting comment');
                          console.error('Delete comment error:', error);
                        }
                      }}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete comment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  <p className={`text-gray-700 whitespace-pre-wrap ${user?.role === 'admin' ? 'pr-8' : ''}`}>
                    {translatedDescriptions[`comment_${idx}`] || comment.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    By {typeof comment.postedBy === 'object' ? comment.postedBy.name : 'Unknown'} on {safeFormatDate(comment.postedAt, 'dd/MM/yyyy, h:mm a')}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 italic">No comments yet. Click "Add Comment" to add one.</p>
        )}
      </div>

      {/* Instruction Photos Section */}
      {shift.instructionPhotos && shift.instructionPhotos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Instruction Photos</h2>
            {!isOperator && (isAdmin || isOwner) && (
              <button
                onClick={() => setShowInstructionPhotoModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Add Photo
              </button>
            )}
          </div>
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
                  <p className="text-sm text-gray-600 mt-2">
                    {translatedDescriptions[`instruction_${photo._id || photo.uploadedAt}`] || photo.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  By {photo.uploadedBy.name} on {safeFormatDate(photo.uploadedAt, 'dd/MM/yyyy')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Instruction Photo Button (if no photos yet) */}
      {(!shift.instructionPhotos || shift.instructionPhotos.length === 0) && !isOperator && (isAdmin || isOwner) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Instruction Photos</h2>
          <button
            onClick={() => setShowInstructionPhotoModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Add Instruction Photo
          </button>
        </div>
      )}

      {/* Problems Section */}
      {shift.problems && shift.problems.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Problems Reported</h2>
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
                    <p className="text-sm text-gray-700 mt-1">
                      {translatedDescriptions[`problem_${problem._id}`] || problem.description}
                    </p>
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
                    <span className="text-xs text-green-600 font-medium ml-4">Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Change Request Section */}
      {shift.timeChangeRequest && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Time Change Request</h2>
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Active Time Change Request</h3>
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Current Time:</span> {safeFormatDate(shift.scheduledStartTime, 'h:mm a')}
            </p>
            <p className="text-sm text-yellow-800">
              <span className="font-medium">New Time:</span> {safeFormatDate(shift.timeChangeRequest.newStartTime, 'h:mm a')}
            </p>
            {shift.timeChangeRequest.newEndTime && (
              <p className="text-sm text-yellow-800">
                <span className="font-medium">New End Time:</span> {safeFormatDate(shift.timeChangeRequest.newEndTime, 'h:mm a')}
              </p>
            )}
            {shift.timeChangeRequest.reason && (
              <p className="text-sm text-yellow-800 mt-1"><span className="font-medium">Reason:</span> {shift.timeChangeRequest.reason}</p>
            )}
            <p className="text-sm text-yellow-800 mt-1">
              <span className="font-medium">Status:</span> {shift.timeChangeRequest.status?.replace('_', ' ') || 'Unknown'}
            </p>
            {shift.timeChangeRequest.operatorConfirmed && (
              <p className="text-sm text-green-700 mt-1">
                ✓ Confirmed by operator
                {shift.timeChangeRequest.operatorConfirmedAt && 
                  ` on ${safeFormatDate(shift.timeChangeRequest.operatorConfirmedAt, 'dd/MM/yyyy, h:mm a')}`
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Additional buttons for operators and admins */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-3">
          {isOperator && (
            <button
              onClick={() => setShowProblemModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Report Problem
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Comment Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Comment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  rows={6}
                  placeholder="Write a comment for this shift..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveNotes}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Comment
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNotesText('');
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
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

      {/* Problem Report Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Problem</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  rows={4}
                  placeholder="Describe the problem..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
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
                Report Problem
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
        </>
      )}
    </div>
  );
}

export default function ShiftDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ShiftDetailPageContent />
    </Suspense>
  );
}

