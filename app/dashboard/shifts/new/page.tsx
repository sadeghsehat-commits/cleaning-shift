'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { enUS, ar, uk, it } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useI18n } from '@/contexts/I18nContext';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  owner: string | { _id: string; name: string; email: string };
}

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function NewShiftPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [allApartments, setAllApartments] = useState<Apartment[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date())); // Track the currently displayed month
  const [apartmentsWithShifts, setApartmentsWithShifts] = useState<string[]>([]);
  const [shiftsByDate, setShiftsByDate] = useState<Record<string, string[]>>({}); // Record of date (YYYY-MM-DD) -> apartment IDs
  const [bookings, setBookings] = useState<Array<{checkIn: string | Date, checkOut: string | Date, guestCount: number}>>([]); // Array of bookings
  const [unavailableOperators, setUnavailableOperators] = useState<string[]>([]); // IDs of unavailable operators

  // Get locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'ar': return ar;
      case 'uk': return uk;
      case 'it': return it;
      default: return enUS;
    }
  };

  const [formData, setFormData] = useState({
    owner: '',
    apartment: '',
    cleaner: '',
    scheduledDate: '',
    scheduledStartTime: '10:00', // Default to 10:00 AM
    scheduledEndTime: '',
    notes: '',
  });

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Convert Date to YYYY-MM-DD format for form submission
  const formatDateForForm = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter available operators
  const filterAvailableOperators = async (allOperators: User[], date: string) => {
    if (!date || user?.role !== 'admin') {
      setOperators(allOperators);
      return;
    }

    try {
      const response = await fetch(`/api/unavailability-requests/check?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        const unavailableIds = data.unavailableOperatorIds || [];
        const available = allOperators.filter(op => !unavailableIds.includes(op._id));
        setOperators(available);
        setUnavailableOperators(unavailableIds);
      } else {
        setOperators(allOperators);
      }
    } catch (error) {
      console.error('Error filtering operators:', error);
      setOperators(allOperators);
    }
  };

  // Update scheduledDate when selectedDate changes
  useEffect(() => {
    const dateStr = formatDateForForm(selectedDate);
    setFormData(prev => ({ ...prev, scheduledDate: dateStr }));
    // Fetch shifts for the selected date
    fetchShiftsForDate(dateStr);
    // Check unavailable operators for this date
    if (user?.role === 'admin' && operators.length > 0) {
      filterAvailableOperators(operators, dateStr);
    }
  }, [selectedDate, user]);

  // Get days of the current month
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the first day of the week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = getDay(monthStart);
    // Adjust for Monday as first day (0 = Monday, 6 = Sunday)
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Add empty cells for days before the first day of the month
    const emptyDays = Array(adjustedFirstDay).fill(null);
    
    return [...emptyDays, ...days];
  };

  // Fetch shifts for an entire month and store them by date
  const fetchShiftsForMonth = useCallback(async (date: Date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      
      const response = await fetch(`/api/shifts?month=${monthStr}`);
      if (response.ok) {
        const data = await response.json();
        
        // Process all shifts for the month and group by date
        const shiftsByDateMap: Record<string, string[]> = {};
        
        data.shifts.forEach((shift: any) => {
          if (shift.status === 'cancelled') return;
          
          const shiftDate = new Date(shift.scheduledDate);
          const dateStr = formatDateForForm(shiftDate);
          const apartmentId = shift.apartment?._id || shift.apartment;
          
          if (apartmentId && shiftDate.getFullYear() === year && shiftDate.getMonth() + 1 === month) {
            if (!shiftsByDateMap[dateStr]) {
              shiftsByDateMap[dateStr] = [];
            }
            if (!shiftsByDateMap[dateStr].includes(apartmentId)) {
              shiftsByDateMap[dateStr].push(apartmentId);
            }
          }
        });
        
        // Update shiftsByDate with all dates for this month
        setShiftsByDate((prev) => ({
          ...prev,
          ...shiftsByDateMap,
        }));
      }
    } catch (error) {
      console.error('Error fetching shifts for month:', error);
    }
  }, []);

  // Update scheduledDate when selectedDate changes
  useEffect(() => {
    const dateStr = formatDateForForm(selectedDate);
    setFormData(prev => ({ ...prev, scheduledDate: dateStr }));
    // Fetch shifts for the selected date
    fetchShiftsForDate(dateStr);
  }, [selectedDate]);

  // Update current month when selectedDate changes
  useEffect(() => {
    const monthStart = startOfMonth(selectedDate);
    if (!isSameMonth(monthStart, currentMonth)) {
      setCurrentMonth(monthStart);
    }
  }, [selectedDate, currentMonth]);

  // Fetch shifts when currentMonth changes
  useEffect(() => {
    if (currentMonth) {
      fetchShiftsForMonth(currentMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const fetchShiftsForDate = useCallback(async (date: string) => {
    try {
      // Fetch shifts for the entire month that contains this date
      const selectedDate = new Date(date);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      
      const response = await fetch(`/api/shifts?month=${monthStr}`);
      if (response.ok) {
        const data = await response.json();
        
        // Process all shifts for the month and group by date
        const shiftsByDateMap: Record<string, string[]> = {};
        
        data.shifts.forEach((shift: any) => {
          if (shift.status === 'cancelled') return;
          
          const shiftDate = new Date(shift.scheduledDate);
          const dateStr = formatDateForForm(shiftDate);
          const apartmentId = shift.apartment?._id || shift.apartment;
          
          if (apartmentId && shiftDate.getFullYear() === year && shiftDate.getMonth() + 1 === month) {
            if (!shiftsByDateMap[dateStr]) {
              shiftsByDateMap[dateStr] = [];
            }
            if (!shiftsByDateMap[dateStr].includes(apartmentId)) {
              shiftsByDateMap[dateStr].push(apartmentId);
            }
          }
        });
        
        // Update shiftsByDate with all dates for this month
        setShiftsByDate((prev) => ({
          ...prev,
          ...shiftsByDateMap,
        }));

        // Update apartmentsWithShifts for the specific selected date
        const dateStr = formatDateForForm(selectedDate);
        const apartmentIds = shiftsByDateMap[dateStr] || [];
        setApartmentsWithShifts(apartmentIds);

        // Clear selected apartment if it's no longer available
        setFormData((prevForm) => {
          if (prevForm.apartment && apartmentIds.indexOf(prevForm.apartment) !== -1) {
            toast.error('The selected apartment already has a shift on this date. Please choose another apartment.');
            return { ...prevForm, apartment: '' };
          }
          return prevForm;
        });
      }
    } catch (error) {
      console.error('Error fetching shifts for date:', error);
    }
  }, []);

  // Clear apartment when owner changes
  useEffect(() => {
    if (formData.owner) {
      setFormData(prev => ({ ...prev, apartment: '' }));
    }
  }, [formData.owner]);

  // Fetch scheduled cleaning days for selected apartment
  useEffect(() => {
    if (formData.apartment) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [formData.apartment]);

  const fetchBookings = async () => {
    if (!formData.apartment) return;

    try {
      // Fetch all cleaning schedules for this apartment (not filtered by month)
      const response = await fetch(`/api/cleaning-schedule?apartmentId=${formData.apartment}`);
      const data = response.ok ? await response.json() : { schedules: [] };
      
      // Collect all bookings from all schedules
      const allBookings: Array<{checkIn: string | Date, checkOut: string | Date, guestCount: number}> = [];
      const bookingMap = new Map<string, {checkIn: string | Date, checkOut: string | Date, guestCount: number}>();
      
      data.schedules.forEach((schedule: any) => {
        if (schedule.bookings && Array.isArray(schedule.bookings)) {
          schedule.bookings.forEach((booking: any) => {
            // Create a unique key based on checkIn, checkOut, and guestCount to deduplicate
            const checkIn = typeof booking.checkIn === 'string' ? booking.checkIn : booking.checkIn.toISOString();
            const checkOut = typeof booking.checkOut === 'string' ? booking.checkOut : booking.checkOut.toISOString();
            const key = `${checkIn}_${checkOut}_${booking.guestCount}`;
            
            if (!bookingMap.has(key)) {
              bookingMap.set(key, {
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guestCount: booking.guestCount,
              });
            }
          });
        }
      });

      setBookings(Array.from(bookingMap.values()));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch shifts for the selected date to filter out apartments that already have shifts
  useEffect(() => {
    if (formData.scheduledDate && allApartments.length > 0) {
      fetchShiftsForDate(formData.scheduledDate);
    }
  }, [formData.scheduledDate, allApartments.length, fetchShiftsForDate]);

  // Get apartments for the selected owner
  const getOwnerApartments = () => {
    if (!formData.owner) {
      return [];
    }
    const selectedOwnerId = formData.owner.toString();
    return allApartments.filter(apt => {
      let ownerId: string;
      if (typeof apt.owner === 'object' && apt.owner && apt.owner._id) {
        ownerId = apt.owner._id.toString();
      } else if (apt.owner) {
        ownerId = apt.owner.toString();
      } else {
        return false;
      }
      return ownerId === selectedOwnerId;
    });
  };

  // Get available apartments (filtered by owner and excluding those with shifts on selected date)
  const getAvailableApartments = () => {
    const ownerApts = getOwnerApartments();
    return ownerApts.filter(apt => !apartmentsWithShifts.includes(apt._id));
  };

  // Get minimum time (current time + 1 hour) in HH:MM format
  const getMinTime = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
    const hours = String(oneHourLater.getHours()).padStart(2, '0');
    const minutes = String(oneHourLater.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Check if selected date is today
  const isToday = (date: string) => {
    return date === getTodayDate();
  };

  // Get minimum time for the selected date
  const getMinTimeForDate = (date: string) => {
    if (isToday(date)) {
      return getMinTime();
    }
    return '00:00'; // For future dates, any time is allowed
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Only admins can create shifts
        if (data.user.role !== 'admin') {
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
        // Filter operators based on selected date and unavailability
        await filterAvailableOperators(operatorData.users, formData.scheduledDate);
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate date and time
      const today = getTodayDate();
      const selectedDate = formData.scheduledDate;
      
      // Check if date is in the past
      if (selectedDate < today) {
        toast.error('Cannot create shifts for past dates');
        setSubmitting(false);
        return;
      }

      // Check if date is today and time is at least 1 hour in the future
      if (selectedDate === today) {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledStartTime}`);
        
        if (scheduledDateTime < oneHourLater) {
          toast.error('Start time must be at least 1 hour from now');
          setSubmitting(false);
          return;
        }
      }

      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledStartTime}`);
      const scheduledEndDateTime = formData.scheduledEndTime
        ? new Date(`${formData.scheduledDate}T${formData.scheduledEndTime}`)
        : undefined;

      // Validate end time is after start time
      if (scheduledEndDateTime && scheduledEndDateTime <= scheduledDateTime) {
        toast.error('End time must be after start time');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartment: formData.apartment,
          cleaner: formData.cleaner,
          scheduledDate: formData.scheduledDate,
          scheduledStartTime: scheduledDateTime.toISOString(),
          scheduledEndTime: scheduledEndDateTime?.toISOString(),
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success('Shift created successfully');
        router.push('/dashboard/shifts');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create shift');
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">Create New Shift</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          {!formData.owner || !formData.apartment ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800">
                {!formData.owner 
                  ? 'Please select an Owner first to see check-out days'
                  : 'Please select an Apartment to see check-out days'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Month Navigation */}
              <div className="mb-4 flex items-center justify-between gap-4 w-full max-w-md">
                <button
                  onClick={() => {
                    const previousMonth = subMonths(currentMonth, 1);
                    setCurrentMonth(previousMonth);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 min-w-[100px] justify-center"
                  aria-label={t.common.previous}
                >
                  <span className="text-xl">←</span>
                  <span className="hidden sm:inline">{t.common.previous}</span>
                </button>
                
                <div className="flex-1 text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy', { locale: getLocale() })}
                  </h2>
                </div>
                
                <button
                  onClick={() => {
                    const nextMonth = addMonths(currentMonth, 1);
                    setCurrentMonth(nextMonth);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 min-w-[100px] justify-center"
                  aria-label={t.common.next}
                >
                  <span className="hidden sm:inline">{t.common.next}</span>
                  <span className="text-xl">→</span>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="w-full max-w-md">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {getMonthDays().map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="aspect-square"></div>;
                    }

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const dayDate = new Date(day);
                    dayDate.setHours(0, 0, 0, 0);
                    const isPast = dayDate < today;
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    // Check if this day is a check-out day or is occupied (from bookings)
                    const dayStart = startOfDay(day);
                    let isCheckOut = false;
                    let isOccupied = false;
                    let checkoutGuestCount = 0;
                    
                    bookings.forEach((booking) => {
                      const checkIn = typeof booking.checkIn === 'string' ? parseISO(booking.checkIn) : new Date(booking.checkIn);
                      const checkOut = typeof booking.checkOut === 'string' ? parseISO(booking.checkOut) : new Date(booking.checkOut);
                      const checkInStart = startOfDay(checkIn);
                      const checkOutEnd = endOfDay(checkOut);
                      
                      if (isSameDay(dayStart, checkOutEnd)) {
                        isCheckOut = true;
                        checkoutGuestCount = booking.guestCount;
                      } else if (isWithinInterval(dayStart, { start: checkInStart, end: checkOutEnd })) {
                        isOccupied = true;
                      }
                    });

                    // Check if this apartment already has a shift on this day
                    const dateStr = formatDateForForm(day);
                    const apartmentsWithShiftsOnThisDate = shiftsByDate[dateStr] || [];
                    const hasShift = formData.apartment && apartmentsWithShiftsOnThisDate.includes(formData.apartment);

                    // Determine styling
                    let className = 'aspect-square flex items-center justify-center text-sm font-medium rounded-lg border-2 transition-colors cursor-pointer ';
                    
                    if (isPast) {
                      className += 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';
                    } else if (hasShift) {
                      className += 'bg-red-300 text-red-900 font-semibold line-through border-red-500';
                    } else if (isCheckOut && !hasShift) {
                      className += 'bg-blue-600 text-white font-bold border-blue-800 shadow-md hover:bg-blue-700';
                    } else if (isOccupied && !hasShift) {
                      className += 'bg-blue-200 text-gray-900 border-blue-400';
                    } else if (isSelected) {
                      className += 'bg-primary-600 text-white font-bold border-primary-700';
                    } else if (formData.apartment && bookings.length > 0) {
                      className += 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
                    } else {
                      className += 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
                    }

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDate(day);
                          }
                        }}
                        disabled={isPast}
                        className={className}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Selected: {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
              {isToday(formData.scheduledDate) && (
                <p className="mt-1 text-sm text-gray-500">
                  Minimum start time: {getMinTime()} (1 hour from now)
                </p>
              )}
              {formData.apartment && bookings.length > 0 && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Check-out Days (from owner's calendar):</p>
                  <div className="space-y-1">
                    <div className="text-xs text-blue-800">
                      {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-gray-600">
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-blue-600 border-2 border-blue-800 mr-1"></span>
                        Check-out day (from owner)
                      </span>
                      <span className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-white border-2 border-gray-300 mr-1"></span>
                        Extra cleaning day
                      </span>
                      <span className="flex items-center">
                        <span className="inline-block w-3 h-3 bg-red-300 border-2 border-red-500 mr-1"></span>
                        Already has shift
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={!formData.scheduledDate}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={!formData.scheduledDate || !formData.owner}
          >
            <option value="">
              {!formData.scheduledDate 
                ? 'Please select a date first' 
                : !formData.owner
                  ? 'Please select an owner first'
                  : getAvailableApartments().length === 0 
                    ? 'No available apartments for this date' 
                    : 'Select apartment'}
            </option>
            {getAvailableApartments().map((apt) => (
              <option key={apt._id} value={apt._id}>
                {apt.name} - {apt.address}
              </option>
            ))}
          </select>
          {formData.scheduledDate && formData.owner && apartmentsWithShifts.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {apartmentsWithShifts.length} apartment{apartmentsWithShifts.length !== 1 ? 's' : ''} already have shifts on this date
            </p>
          )}
          {formData.apartment && bookings.length > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                📅 Bookings (from owner's calendar):
              </p>
              <div className="text-sm text-blue-800">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found for this apartment
              </div>
            </div>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select operator</option>
            {operators.map((operator) => (
              <option key={operator._id} value={operator._id}>
                {operator.name} ({operator.email})
              </option>
            ))}
            {unavailableOperators.length > 0 && operators.length === 0 && formData.scheduledDate && (
              <option value="" disabled>
                No available operators for this date
              </option>
            )}
          </select>
          {unavailableOperators.length > 0 && formData.scheduledDate && (
            <p className="text-xs text-gray-500 mt-1">
              {unavailableOperators.length} operator{unavailableOperators.length !== 1 ? 's' : ''} unavailable for this date
            </p>
          )}
        </div>

        <div>
          <label htmlFor="scheduledStartTime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <input
            id="scheduledStartTime"
            type="time"
            value={formData.scheduledStartTime}
            onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
            min={formData.scheduledDate ? getMinTimeForDate(formData.scheduledDate) : undefined}
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
            min={formData.scheduledStartTime || undefined}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg shadow-md"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Shift
              </span>
            )}
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

