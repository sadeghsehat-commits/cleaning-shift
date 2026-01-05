'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  owner?: string | { _id: string };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Shift {
  _id: string;
  apartment: { _id: string; name: string; address: string };
  cleaner: { _id: string; name: string; email: string };
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  notes?: string;
  status: string;
}

export default function EditShiftPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [allApartments, setAllApartments] = useState<Apartment[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apartmentsWithShifts, setApartmentsWithShifts] = useState<Set<string>>(new Set());
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    owner: '',
    apartment: '',
    cleaner: '',
    scheduledDate: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    reason: '',
    guestCount: 1,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && params.id) {
      // Only fetch apartments and operators for admins
      if (user.role === 'admin') {
        fetchData();
      }
      fetchShift();
    }
  }, [user, params.id]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Only admins and owners can edit shifts
        if (!['admin', 'owner'].includes(data.user.role)) {
          router.push('/dashboard/shifts');
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

  const fetchShift = async () => {
    try {
      const response = await fetch(`/api/shifts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setShift(data.shift);
        
        // Pre-fill form with shift data
        const shiftData = data.shift;
        const scheduledDate = new Date(shiftData.scheduledDate).toISOString().split('T')[0];
        const startTime = new Date(shiftData.scheduledStartTime).toISOString().slice(11, 16);
        const endTime = shiftData.scheduledEndTime 
          ? new Date(shiftData.scheduledEndTime).toISOString().slice(11, 16)
          : '';

        // Handle cleaner ID (could be object or string)
        const cleanerId = shiftData.cleaner && typeof shiftData.cleaner === 'object'
          ? shiftData.cleaner._id
          : shiftData.cleaner;

        // Handle apartment ID (could be object or string)
        const apartmentId = shiftData.apartment && typeof shiftData.apartment === 'object'
          ? shiftData.apartment._id
          : shiftData.apartment;

        // Get owner ID from apartment
        const apartment = shiftData.apartment;
        const ownerId = apartment && typeof apartment === 'object' && apartment.owner
          ? (typeof apartment.owner === 'object' ? apartment.owner._id : apartment.owner)
          : '';

        // Fetch guest count from cleaning schedule
        let currentGuestCount = 1;
        if (apartmentId && scheduledDate) {
          try {
            const shiftDate = new Date(scheduledDate);
            const year = shiftDate.getFullYear();
            const month = shiftDate.getMonth() + 1;
            const day = shiftDate.getDate();
            
            const scheduleResponse = await fetch(
              `/api/cleaning-schedule?apartmentId=${apartmentId}&year=${year}&month=${month}`
            );
            if (scheduleResponse.ok) {
              const scheduleData = await scheduleResponse.json();
              const schedule = scheduleData.schedules?.[0];
              if (schedule && schedule.scheduledDays) {
                const scheduledDay = schedule.scheduledDays.find((sd: any) => sd.day === day);
                if (scheduledDay) {
                  currentGuestCount = scheduledDay.guestCount;
                  setGuestCount(scheduledDay.guestCount);
                } else if (schedule && schedule.days && schedule.days.includes(day)) {
                  currentGuestCount = 1;
                  setGuestCount(1);
                }
              }
            }
          } catch (scheduleError) {
            console.log('Could not fetch guest count:', scheduleError);
          }
        }

        setFormData({
          owner: ownerId,
          apartment: apartmentId,
          cleaner: cleanerId,
          scheduledDate,
          scheduledStartTime: startTime,
          scheduledEndTime: endTime,
          reason: shiftData.notes || '',
          guestCount: currentGuestCount,
        });
      } else {
        toast.error('Failed to load shift');
        router.push('/dashboard/shifts');
      }
    } catch (error) {
      toast.error('An error occurred');
      router.push('/dashboard/shifts');
    }
  };

  const fetchData = async () => {
    try {
      const [apartmentsRes, ownersRes, operatorsRes] = await Promise.all([
        fetch('/api/apartments'),
        fetch('/api/users?role=owner'),
        fetch('/api/users?role=operator'),
      ]);

      if (apartmentsRes.ok) {
        const aptData = await apartmentsRes.json();
        setAllApartments(aptData.apartments);
      }

      if (ownersRes.ok) {
        const ownersData = await ownersRes.json();
        setOwners(ownersData.users);
      }

      if (operatorsRes.ok) {
        const operatorData = await operatorsRes.json();
        setOperators(operatorData.users);
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const fetchShiftsForDate = useCallback(async (date: string) => {
    try {
      // Create date range for the selected day
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      // Format month for API call (YYYY-MM)
      const monthStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      
      const response = await fetch(`/api/shifts?month=${monthStr}`);
      if (response.ok) {
        const data = await response.json();
        // Filter shifts for the exact selected date (excluding cancelled shifts and current shift)
        const shiftsForDate = data.shifts.filter((s: any) => {
          const shiftDate = new Date(s.scheduledDate);
          const shiftDateOnly = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate());
          return shiftDateOnly.getTime() === startOfDay.getTime() 
            && s.status !== 'cancelled' 
            && s._id !== params.id; // Exclude current shift
        });

        // Extract apartment IDs that already have shifts on this date
        const apartmentIds = new Set<string>(shiftsForDate.map((s: any) => s.apartment._id as string));
        setApartmentsWithShifts(apartmentIds);

        // Clear selected apartment if it's no longer available (unless it's the current shift's apartment)
        setFormData(prev => {
          if (prev.apartment && apartmentIds.has(prev.apartment) && prev.apartment !== shift?.apartment?._id) {
            toast.error('The selected apartment already has a shift on this date. Please choose another apartment.');
            return { ...prev, apartment: '' };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching shifts for date:', error);
    }
  }, [params.id, shift]);

  // Clear apartment when owner changes
  useEffect(() => {
    if (formData.owner) {
      setFormData(prev => ({ ...prev, apartment: '' }));
    }
  }, [formData.owner]);

  // Fetch shifts for the selected date to filter out apartments that already have shifts
  useEffect(() => {
    if (formData.scheduledDate && allApartments.length > 0 && user?.role === 'admin') {
      fetchShiftsForDate(formData.scheduledDate);
    }
  }, [formData.scheduledDate, allApartments.length, fetchShiftsForDate, user?.role]);

  // Get apartments for the selected owner
  const getOwnerApartments = () => {
    if (!formData.owner) {
      return [];
    }
    return allApartments.filter(apt => {
      const ownerId = typeof apt.owner === 'object' && apt.owner ? apt.owner._id : apt.owner;
      return ownerId === formData.owner || (typeof ownerId === 'string' && ownerId === formData.owner);
    });
  };

  // Get available apartments (filtered by owner and excluding those with shifts on selected date, except current shift)
  const getAvailableApartments = () => {
    const ownerApts = getOwnerApartments();
    return ownerApts.filter(apt => {
      // Include current shift's apartment even if it has a shift (since we're editing it)
      if (shift && apt._id === (typeof shift.apartment === 'object' ? shift.apartment._id : shift.apartment)) {
        return true;
      }
      return !apartmentsWithShifts.has(apt._id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const isOwner = user?.role === 'owner';
      const isAdmin = user?.role === 'admin';
      
      if (!shift) {
        toast.error('Shift data not loaded');
        setSubmitting(false);
        return;
      }

      // Calculate time until shift starts
      const currentScheduledDateTime = new Date(shift.scheduledDate);
      const currentScheduledStartTime = new Date(shift.scheduledStartTime);
      const currentScheduledFullDateTime = new Date(
        currentScheduledDateTime.getFullYear(),
        currentScheduledDateTime.getMonth(),
        currentScheduledDateTime.getDate(),
        currentScheduledStartTime.getHours(),
        currentScheduledStartTime.getMinutes(),
        0,
        0
      );
      const now = new Date();
      const hoursUntilShift = (currentScheduledFullDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Handle guest count changes (always allowed for owner and admin)
      const currentGuestCount = guestCount || 1;
      const guestCountChanged = formData.guestCount !== currentGuestCount;
      
      if (guestCountChanged && (isOwner || isAdmin)) {
        try {
          const shiftDate = new Date(shift.scheduledDate);
          const year = shiftDate.getFullYear();
          const month = shiftDate.getMonth() + 1;
          const day = shiftDate.getDate();
          const apartmentId = typeof shift.apartment === 'object' ? shift.apartment._id : shift.apartment;

          // Fetch current schedule
          const scheduleResponse = await fetch(
            `/api/cleaning-schedule?apartmentId=${apartmentId}&year=${year}&month=${month}`
          );
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            const schedule = scheduleData.schedules?.[0];
            
            if (schedule) {
              // Update guest count for the specific day
              const updatedScheduledDays = schedule.scheduledDays ? [...schedule.scheduledDays] : [];
              const dayIndex = updatedScheduledDays.findIndex((sd: any) => sd.day === day);
              
              if (dayIndex >= 0) {
                updatedScheduledDays[dayIndex] = { day, guestCount: formData.guestCount };
              } else {
                // Day doesn't exist in schedule, add it
                updatedScheduledDays.push({ day, guestCount: formData.guestCount });
                updatedScheduledDays.sort((a: any, b: any) => a.day - b.day);
              }

              // Update the schedule
              const updateResponse = await fetch('/api/cleaning-schedule/update-guest-count', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  apartmentId,
                  year,
                  month,
                  scheduledDays: updatedScheduledDays,
                }),
              });

              if (!updateResponse.ok) {
                console.error('Failed to update guest count');
              }
            }
          }
        } catch (guestCountError) {
          console.error('Error updating guest count:', guestCountError);
        }
      }
      
      if (isOwner) {
        // Owners can only edit guest count until the shift starts
        if (hoursUntilShift <= 0) {
          toast.error('Cannot edit shift. The shift has already started.');
          setSubmitting(false);
          return;
        }

        // Only allow guest count changes for owners
        if (guestCountChanged) {
          // Update guest count via API
          const response = await fetch(`/api/shifts/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestCount: formData.guestCount,
            }),
          });

          if (response.ok) {
            toast.success('Guest count updated successfully.');
            router.push(`/dashboard/shifts/${params.id}`);
          } else {
            const data = await response.json();
            toast.error(data.error || 'Failed to update guest count');
            setSubmitting(false);
          }
        } else {
          toast.error('No changes detected. You can only edit the guest count.');
          setSubmitting(false);
        }
        return;
      } else if (isAdmin) {
        // Check what has changed
        const currentApartmentId = typeof shift.apartment === 'object' ? shift.apartment._id : shift.apartment;
        const currentCleanerId = typeof shift.cleaner === 'object' ? shift.cleaner._id : shift.cleaner;
        const currentDate = new Date(shift.scheduledDate).toISOString().split('T')[0];
        const currentStartTime = new Date(shift.scheduledStartTime).toISOString().slice(11, 16);
        const currentEndTime = shift.scheduledEndTime ? new Date(shift.scheduledEndTime).toISOString().slice(11, 16) : '';

        const operatorChanged = formData.cleaner !== currentCleanerId;
        const dateTimeChanged = 
          formData.apartment !== currentApartmentId ||
          formData.scheduledDate !== currentDate ||
          formData.scheduledStartTime !== currentStartTime ||
          (formData.scheduledEndTime || '') !== currentEndTime;

        // Check time restrictions
        const canEditDateTimeDirectly = hoursUntilShift >= 18; // 18 hours before shift
        const canEditOperatorDirectly = hoursUntilShift >= 10; // 10 hours before shift

        // Handle operator changes
        if (operatorChanged && !dateTimeChanged) {
          if (canEditOperatorDirectly) {
            // Direct edit allowed (more than 10 hours before)
            const response = await fetch(`/api/shifts/${params.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cleaner: formData.cleaner,
              }),
            });

            if (response.ok) {
              toast.success(guestCountChanged ? 'Guest count and operator updated successfully.' : 'Operator changed successfully. Notifications sent to both operators.');
              router.push(`/dashboard/shifts/${params.id}`);
            } else {
              const data = await response.json();
              toast.error(data.error || 'Failed to change operator');
            }
          } else {
            // Must use request system (less than 10 hours before)
            toast.error('Cannot change operator directly. Less than 10 hours remaining before shift starts. Please use the request system.');
            setSubmitting(false);
            return;
          }
          setSubmitting(false);
          return;
        }

        // Handle date/time changes
        if (dateTimeChanged) {
          if (canEditDateTimeDirectly) {
            // Direct edit allowed (more than 18 hours before)
            const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledStartTime}`);
            const scheduledEndDateTime = formData.scheduledEndTime
              ? new Date(`${formData.scheduledDate}T${formData.scheduledEndTime}`)
              : undefined;

            const updateBody: any = {
              scheduledDate: new Date(formData.scheduledDate).toISOString(),
              scheduledStartTime: scheduledDateTime.toISOString(),
            };
            if (scheduledEndDateTime) {
              updateBody.scheduledEndTime = scheduledEndDateTime.toISOString();
            }
            if (formData.apartment !== currentApartmentId) {
              updateBody.apartment = formData.apartment;
            }
            if (operatorChanged) {
              updateBody.cleaner = formData.cleaner;
            }

            const response = await fetch(`/api/shifts/${params.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateBody),
            });

            if (response.ok) {
              toast.success(guestCountChanged ? 'Guest count and shift updated successfully.' : 'Shift updated successfully.');
              router.push(`/dashboard/shifts/${params.id}`);
            } else {
              const data = await response.json();
              toast.error(data.error || 'Failed to update shift');
            }
          } else {
            // Must use request system (less than 18 hours before)
            const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledStartTime}`);
            const scheduledEndDateTime = formData.scheduledEndTime
              ? new Date(`${formData.scheduledDate}T${formData.scheduledEndTime}`)
              : undefined;

            const response = await fetch(`/api/shifts/${params.id}/time-change`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                newStartTime: scheduledDateTime.toISOString(),
                newEndTime: scheduledEndDateTime?.toISOString(),
                newApartment: formData.apartment !== currentApartmentId ? formData.apartment : undefined,
                newCleaner: operatorChanged ? formData.cleaner : undefined,
                newScheduledDate: formData.scheduledDate !== currentDate 
                  ? new Date(formData.scheduledDate).toISOString() 
                  : undefined,
                reason: formData.reason || 'Admin requested shift changes',
              }),
            });

            if (response.ok) {
              toast.success(guestCountChanged ? 'Guest count updated. Shift edit request sent to operator.' : 'Shift edit request sent to operator. Waiting for confirmation.');
              router.push(`/dashboard/shifts/${params.id}`);
            } else {
              const data = await response.json();
              toast.error(data.error || 'Failed to send shift edit request');
            }
          }
        } else if (!operatorChanged && !dateTimeChanged) {
          // Only guest count changed (already handled above)
          if (guestCountChanged) {
            toast.success('Guest count updated successfully.');
            router.push(`/dashboard/shifts/${params.id}`);
          } else {
            toast.error('No changes detected');
          }
        }
      } else {
        // This shouldn't happen due to auth check, but just in case
        toast.error('Unauthorized');
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
            Shifts
          </Link>
          <span className="text-gray-400 flex items-center">/</span>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {user?.role === 'owner' ? 'Edit Shift' : 'Request Shift Edit'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {user?.role === 'owner' && shift && (() => {
          const currentScheduledDateTime = new Date(shift.scheduledDate);
          const currentScheduledStartTime = new Date(shift.scheduledStartTime);
          const currentScheduledFullDateTime = new Date(
            currentScheduledDateTime.getFullYear(),
            currentScheduledDateTime.getMonth(),
            currentScheduledDateTime.getDate(),
            currentScheduledStartTime.getHours(),
            currentScheduledStartTime.getMinutes(),
            0,
            0
          );
          const now = new Date();
          const hoursUntilShift = (currentScheduledFullDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
          const canEdit = hoursUntilShift >= 24;

          return (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2 mb-4">
              <p className="text-xs text-blue-700 font-medium mb-2">
                ℹ️ You can only edit the <strong>guest count</strong> for this shift {canEdit ? '(more than 24 hours before shift)' : '(less than 24 hours - editing is no longer allowed)'}. Date, time, and operator cannot be changed.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Apartment:</span>
                  <span className="ml-2 text-gray-900">{shift.apartment.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Operator:</span>
                  <span className="ml-2 text-gray-900">{shift.cleaner.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="ml-2 text-gray-900">{new Date(shift.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Time:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(shift.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {shift.scheduledEndTime && ` - ${new Date(shift.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

        {user?.role === 'admin' && shift && (() => {
          const currentScheduledDateTime = new Date(shift.scheduledDate);
          const currentScheduledStartTime = new Date(shift.scheduledStartTime);
          const currentScheduledFullDateTime = new Date(
            currentScheduledDateTime.getFullYear(),
            currentScheduledDateTime.getMonth(),
            currentScheduledDateTime.getDate(),
            currentScheduledStartTime.getHours(),
            currentScheduledStartTime.getMinutes(),
            0,
            0
          );
          const now = new Date();
          const hoursUntilShift = (currentScheduledFullDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
          const canEditDateTimeDirectly = hoursUntilShift >= 18;
          const canEditOperatorDirectly = hoursUntilShift >= 10;

          return (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2 mb-4">
              <p className="text-xs text-blue-700 font-medium mb-2">
                ℹ️ <strong>Guest count</strong> can always be edited. <strong>Date/Time changes</strong> can be edited directly {canEditDateTimeDirectly ? '(more than 18 hours before shift)' : '(less than 18 hours - requires request)'}. <strong>Operator changes</strong> can be edited directly {canEditOperatorDirectly ? '(more than 10 hours before shift)' : '(less than 10 hours - requires request)'}.
              </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Current Apartment:</span>
                <span className="ml-2 text-gray-900">{shift.apartment.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Operator:</span>
                <span className="ml-2 text-gray-900">{shift.cleaner.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Date:</span>
                <span className="ml-2 text-gray-900">{new Date(shift.scheduledDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Time:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(shift.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {shift.scheduledEndTime && ` - ${new Date(shift.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </div>
            </div>
          </div>
          );
        })()}

        {user?.role === 'admin' && (
          <>
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value, owner: '', apartment: '' })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                style={{ WebkitAppearance: 'none', fontSize: '16px' }}
              />
            </div>

            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                Owner *
              </label>
              <select
                id="owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value, apartment: '' })}
                required
                disabled={!formData.scheduledDate}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white ${
                  !formData.scheduledDate ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="">
                  {!formData.scheduledDate 
                    ? 'Please select a date first' 
                    : 'Select owner'}
                </option>
                {owners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                Apartment *
              </label>
              <select
                id="apartment"
                value={formData.apartment}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                required
                disabled={!formData.owner || !formData.scheduledDate}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white ${
                  !formData.owner || !formData.scheduledDate ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="">
                  {!formData.scheduledDate 
                    ? 'Please select a date first' 
                    : !formData.owner
                    ? 'Please select an owner first'
                    : getAvailableApartments().length === 0
                    ? 'No available apartments for this owner on this date'
                    : 'Select apartment'}
                </option>
                {getAvailableApartments().map((apt) => (
                  <option key={apt._id} value={apt._id}>
                    {apt.name} - {apt.address}
                  </option>
                ))}
              </select>
              {formData.scheduledDate && formData.owner && getAvailableApartments().length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  All apartments for this owner already have shifts scheduled on this date.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cleaner" className="block text-sm font-medium text-gray-700 mb-1">
                Operator *
              </label>
              <select
                id="cleaner"
                value={formData.cleaner}
                onChange={(e) => setFormData({ ...formData, cleaner: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="">Select operator</option>
                {operators.map((operator) => (
                  <option key={operator._id} value={operator._id}>
                    {operator.name} ({operator.email})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Guest Count field - only for owner and admin */}
        {(user?.role === 'owner' || user?.role === 'admin') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests *
            </label>
            {user?.role === 'owner' ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (formData.guestCount > 1) {
                      setFormData({ ...formData, guestCount: formData.guestCount - 1 });
                    }
                  }}
                  disabled={formData.guestCount <= 1}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-gray-900">{formData.guestCount}</div>
                  <div className="text-xs text-gray-500 mt-1">guests</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, guestCount: formData.guestCount + 1 });
                  }}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            ) : (
              <input
                id="guestCount"
                type="number"
                min="1"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              {user?.role === 'owner' 
                ? 'You can edit this until the shift starts'
                : 'This can be edited without restrictions'}
            </p>
          </div>
        )}

        {/* Date/Time fields - only for admin */}
        {user?.role === 'admin' && (
          <>
            <div>
              <label htmlFor="scheduledStartTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                id="scheduledStartTime"
                type="time"
                value={formData.scheduledStartTime}
                onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="scheduledEndTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time (optional)
              </label>
              <input
                id="scheduledEndTime"
                type="time"
                value={formData.scheduledEndTime}
                onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Reason field - only for admin */}
        {user?.role === 'admin' && (
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Changes (optional)
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              placeholder="Explain why you need to change this shift..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting 
              ? 'Saving...' 
              : user?.role === 'owner' 
                ? 'Save Changes' 
                : 'Request Shift Edit'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

