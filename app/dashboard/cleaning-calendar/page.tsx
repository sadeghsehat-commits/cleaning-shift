'use client'
import { apiUrl, apiFetch } from '@/lib/api-config';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth, addMonths, subMonths, isWithinInterval, isSameDay, startOfDay, endOfDay, parseISO } from 'date-fns';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  maxCapacity?: number;
}

interface Booking {
  _id?: string;
  checkIn: string | Date;
  checkOut: string | Date;
  guestCount: number;
}

interface CleaningSchedule {
  _id: string;
  apartment: { _id: string; name: string; address: string };
  year: number;
  month: number;
  bookings?: Booking[];
}

export default function CleaningCalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextMonth, setNextMonth] = useState(addMonths(new Date(), 1));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedApartmentData, setSelectedApartmentData] = useState<Apartment | null>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && ['owner', 'admin'].includes(user.role)) {
      fetchApartments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedApartment) {
      fetchBookings(selectedApartment);
    }
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
    };
  }, [selectedApartment, currentMonth, nextMonth]);

  const checkAuth = async () => {
    try {
      const response = await apiFetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (!['owner', 'admin'].includes(data.user.role)) {
          router.push('/dashboard');
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

  const fetchApartments = async () => {
    try {
      const response = await apiFetch('/api/apartments', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setApartments(data.apartments || []);
        if (data.apartments && data.apartments.length > 0) {
          const firstApartment = data.apartments[0];
          setSelectedApartment(firstApartment._id);
          setSelectedApartmentData(firstApartment);
        }
      }
    } catch (error) {
      toast.error('Failed to load apartments');
    }
  };

  const fetchBookings = async (apartmentId?: string) => {
    const aptId = apartmentId || selectedApartment;
    if (!aptId) {
      setBookings([]);
      setLoadingSchedules(false);
      return;
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setLoadingSchedules(true);
    try {
      setBookings([]);

      // Fetch all bookings for this apartment (not filtered by month)
      const response = await fetch(
        `/api/cleaning-schedule?apartmentId=${aptId}`,
        { signal: controller.signal }
      );

      if (controller.signal.aborted) {
        return;
      }

      const currentSelectedId = apartmentId || selectedApartment;
      if (currentSelectedId !== aptId) {
        return;
      }

      const data = response.ok ? await response.json() : { schedules: [] };
      
      // Collect all bookings from all schedules and deduplicate
      const allBookings: Booking[] = [];
      const bookingMap = new Map<string, Booking>();
      
      data.schedules.forEach((schedule: CleaningSchedule) => {
        if (schedule.bookings && Array.isArray(schedule.bookings)) {
          schedule.bookings.forEach((booking: Booking) => {
            // Create a unique key based on checkIn, checkOut, and guestCount to deduplicate
            const checkIn = typeof booking.checkIn === 'string' ? booking.checkIn : booking.checkIn.toISOString();
            const checkOut = typeof booking.checkOut === 'string' ? booking.checkOut : booking.checkOut.toISOString();
            const key = `${checkIn}_${checkOut}_${booking.guestCount}`;
            
            if (!bookingMap.has(key)) {
              bookingMap.set(key, {
                _id: booking._id,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guestCount: booking.guestCount,
              });
            }
          });
        }
      });

      const uniqueBookings = Array.from(bookingMap.values());
      const lastSelectedId = apartmentId || selectedApartment;
      if (lastSelectedId === aptId) {
        setBookings(uniqueBookings);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error fetching bookings:', error);
      const currentSelectedId = apartmentId || selectedApartment;
      if (currentSelectedId === aptId) {
        setBookings([]);
      }
    } finally {
      setLoadingSchedules(false);
      if (fetchControllerRef.current === controller) {
        fetchControllerRef.current = null;
      }
    }
  };

  const toggleDay = (year: number, month: number, day: number) => {
    if (!selectedApartment || saving) return;

    const clickedDate = new Date(year, month - 1, day);
    const clickedDateStart = startOfDay(clickedDate);

    // Check if this day is part of any existing booking
    // Note: Check-out day is NOT considered part of the booking, so it can be used as check-in for next booking
    const existingBooking = bookings.find(booking => {
      const checkIn = typeof booking.checkIn === 'string' ? parseISO(booking.checkIn) : new Date(booking.checkIn);
      const checkOut = typeof booking.checkOut === 'string' ? parseISO(booking.checkOut) : new Date(booking.checkOut);
      const checkInStart = startOfDay(checkIn);
      const checkOutStart = startOfDay(checkOut);
      // Include check-in day but exclude check-out day (check-out day is available for next booking)
      return clickedDateStart >= checkInStart && clickedDateStart < checkOutStart;
    });

    if (existingBooking) {
      // Edit existing booking
      const checkIn = typeof existingBooking.checkIn === 'string' ? parseISO(existingBooking.checkIn) : new Date(existingBooking.checkIn);
      const checkOut = typeof existingBooking.checkOut === 'string' ? parseISO(existingBooking.checkOut) : new Date(existingBooking.checkOut);
      setEditingBooking(existingBooking);
      setCheckInDate(format(checkIn, 'yyyy-MM-dd'));
      setCheckOutDate(format(checkOut, 'yyyy-MM-dd'));
      setGuestCount(existingBooking.guestCount);
      setShowBookingModal(true);
    } else {
      // Open modal immediately for new booking with clicked date as default check-in
      // Ensure we don't use past dates
      const today = startOfDay(new Date());
      const defaultCheckIn = clickedDateStart < today ? today : clickedDateStart;
      const nextDay = new Date(defaultCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setEditingBooking(null);
      setCheckInDate(format(defaultCheckIn, 'yyyy-MM-dd'));
      setCheckOutDate(format(nextDay, 'yyyy-MM-dd'));
      setGuestCount(selectedApartmentData?.maxCapacity || 1);
      setSelectedDateRange({ start: defaultCheckIn, end: null });
      setShowBookingModal(true);
    }
  };

  const saveBooking = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = startOfDay(new Date());

    // Check if check-in date is in the past
    if (startOfDay(checkIn) < today) {
      toast.error('Cannot create bookings for past dates');
      return;
    }

    // Check if check-out date is in the past
    if (startOfDay(checkOut) < today) {
      toast.error('Cannot create bookings with check-out in the past');
      return;
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    if (selectedApartmentData?.maxCapacity && guestCount > selectedApartmentData.maxCapacity) {
      toast.error(`Guest count cannot exceed maximum capacity of ${selectedApartmentData.maxCapacity}`);
      return;
    }

    const newBooking: Booking = {
      _id: editingBooking?._id,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guestCount: guestCount,
    };

    if (editingBooking) {
      // Update existing booking
      const updatedBookings = bookings.map(b => 
        b._id === editingBooking._id ? newBooking : b
      );
      setBookings(updatedBookings);
    } else {
      // Add new booking
      setBookings([...bookings, newBooking]);
    }

    setShowBookingModal(false);
    setSelectedDateRange({ start: null, end: null });
    setEditingBooking(null);
    setCheckInDate('');
    setCheckOutDate('');
  };

  const removeBooking = (bookingToRemove: Booking) => {
    setBookings(bookings.filter(b => b._id !== bookingToRemove._id));
    setShowBookingModal(false);
    setSelectedDateRange({ start: null, end: null });
    setEditingBooking(null);
    setCheckInDate('');
    setCheckOutDate('');
  };

  const saveAndNotifyAdmin = async () => {
    if (!selectedApartment || saving) return;

    setSaving(true);
    try {
      // Group bookings by month to save them properly
      const bookingsByMonth = new Map<string, Booking[]>();
      
      bookings.forEach(booking => {
        const checkIn = typeof booking.checkIn === 'string' ? parseISO(booking.checkIn) : new Date(booking.checkIn);
        const checkOut = typeof booking.checkOut === 'string' ? parseISO(booking.checkOut) : new Date(booking.checkOut);
        
        // Add booking to all months it spans
        const current = new Date(checkIn);
        while (current <= checkOut) {
          const year = current.getFullYear();
          const month = current.getMonth() + 1;
          const key = `${year}-${month}`;
          
          if (!bookingsByMonth.has(key)) {
            bookingsByMonth.set(key, []);
          }
          
          // Only add if not already in this month's array
          const monthBookings = bookingsByMonth.get(key)!;
          if (!monthBookings.find(b => b._id === booking._id)) {
            monthBookings.push(booking);
          }
          
          current.setMonth(current.getMonth() + 1);
          current.setDate(1);
        }
      });

      const promises = [];
      bookingsByMonth.forEach((monthBookings, key) => {
        const [year, month] = key.split('-').map(Number);
        promises.push(
          apiFetch('/api/cleaning-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              apartmentId: selectedApartment,
              year: year,
              month: month,
              bookings: monthBookings,
              notifyAdmin: monthBookings.length > 0,
            }),
          })
        );
      });

      // Also clear months that had bookings but now don't
      const currentYear = currentMonth.getFullYear();
      const currentMonthNum = currentMonth.getMonth() + 1;
      const nextYear = nextMonth.getFullYear();
      const nextMonthNum = nextMonth.getMonth() + 1;
      
      const currentKey = `${currentYear}-${currentMonthNum}`;
      const nextKey = `${nextYear}-${nextMonthNum}`;
      
      if (!bookingsByMonth.has(currentKey)) {
        promises.push(
          apiFetch('/api/cleaning-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              apartmentId: selectedApartment,
              year: currentYear,
              month: currentMonthNum,
              bookings: [],
              notifyAdmin: false,
            }),
          })
        );
      }
      
      if (!bookingsByMonth.has(nextKey)) {
        promises.push(
          apiFetch('/api/cleaning-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              apartmentId: selectedApartment,
              year: nextYear,
              month: nextMonthNum,
              bookings: [],
              notifyAdmin: false,
            }),
          })
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        toast.success('Calendar saved and admins notified!');
        await fetchBookings(selectedApartment);
      }
    } catch (error) {
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const isDayOccupied = (date: Date): { occupied: boolean; booking?: Booking; isCheckIn?: boolean; isCheckOut?: boolean } => {
    const dateStart = startOfDay(date);
    
    for (const booking of bookings) {
      const checkIn = typeof booking.checkIn === 'string' ? parseISO(booking.checkIn) : new Date(booking.checkIn);
      const checkOut = typeof booking.checkOut === 'string' ? parseISO(booking.checkOut) : new Date(booking.checkOut);
      const checkInStart = startOfDay(checkIn);
      const checkOutEnd = endOfDay(checkOut);
      
      if (isWithinInterval(dateStart, { start: checkInStart, end: checkOutEnd })) {
        const isCheckIn = isSameDay(dateStart, checkInStart);
        const isCheckOut = isSameDay(dateStart, checkOutEnd);
        return { occupied: true, booking, isCheckIn, isCheckOut };
      }
    }
    
    return { occupied: false };
  };

  const renderCalendar = (month: Date, year: number, monthNum: number) => {
    const firstDay = startOfMonth(month);
    const lastDay = endOfMonth(month);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    const firstDayOfWeek = firstDay.getDay();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {format(month, 'MMMM yyyy')}
        </h3>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {/* Days of the month */}
          {days.map(day => {
            const dayNum = day.getDate();
            const dayInfo = isDayOccupied(day);
            const isSelected = selectedDateRange.start && isSameDay(day, selectedDateRange.start);
            const isInSelectionRange = selectedDateRange.start && selectedDateRange.end && 
              isWithinInterval(day, { start: selectedDateRange.start, end: selectedDateRange.end });
            
            let bgColor = 'bg-gray-50';
            let borderColor = 'border-gray-200';
            let textColor = 'text-gray-700';
            
            if (dayInfo.occupied) {
              bgColor = 'bg-blue-200';
              borderColor = 'border-blue-400';
              textColor = 'text-gray-900';
            }
            
            if (isSelected || isInSelectionRange) {
              bgColor = 'bg-blue-300';
              borderColor = 'border-blue-500';
            }
            
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => toggleDay(year, monthNum, dayNum)}
                disabled={saving}
                className={`aspect-square rounded-lg border-2 transition-all relative ${bgColor} ${borderColor} ${textColor} hover:opacity-80 ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={dayInfo.occupied && dayInfo.booking ? 
                  `${dayInfo.isCheckIn ? 'Check-in' : dayInfo.isCheckOut ? 'Check-out' : 'Occupied'}: ${dayInfo.booking.guestCount} ${dayInfo.booking.guestCount === 1 ? 'guest' : 'guests'}` : 
                  'Click to select check-in/check-out'}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="font-semibold">{dayNum}</span>
                  {dayInfo.occupied && dayInfo.booking && (
                    <div className="flex flex-col items-center mt-0.5">
                      <span className="text-xs">{dayInfo.booking.guestCount}👥</span>
                      {dayInfo.isCheckIn && <span className="text-[8px] opacity-75">IN</span>}
                      {dayInfo.isCheckOut && <span className="text-[8px] opacity-75">OUT</span>}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
            <span className="text-gray-700">Occupied (check-in to check-out)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded"></div>
            <span className="text-gray-700">Available</span>
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">Cleaning Calendar</h1>
        </div>
        <p className="text-gray-600">Select check-in and check-out dates for your apartments</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Apartment
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.map(apt => {
              const isSelected = selectedApartment === apt._id;
              return (
                <button
                  key={apt._id}
                  type="button"
                  onClick={() => {
                    if (selectedApartment !== apt._id) {
                      setBookings([]);
                      setLoadingSchedules(true);
                      setSelectedApartment(apt._id);
                      setSelectedApartmentData(apt);
                      setSelectedDateRange({ start: null, end: null });
                      setShowBookingModal(false);
                      setTimeout(() => {
                        fetchBookings(apt._id);
                      }, 10);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                        {apt.name}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>
                        {apt.address}
                      </p>
                    </div>
                    {isSelected && (
                      <svg
                        className="w-6 h-6 text-primary-600 flex-shrink-0 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedApartment && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Click on any day to add a new booking (check-in and check-out). Click on an occupied day (highlighted in blue) to edit the booking. Days from check-in to check-out are shown in light blue to easily see available days.
                {selectedApartmentData?.maxCapacity && (
                  <span className="block mt-1 font-semibold">
                    Maximum Capacity: {selectedApartmentData.maxCapacity} guests
                  </span>
                )}
              </p>
            </div>

            {loadingSchedules ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-600">Loading calendar data...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" key={`calendar-${selectedApartment}-${currentMonth.getTime()}-${nextMonth.getTime()}`}>
                {renderCalendar(currentMonth, currentMonth.getFullYear(), currentMonth.getMonth() + 1)}
                {renderCalendar(nextMonth, nextMonth.getFullYear(), nextMonth.getMonth() + 1)}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={saveAndNotifyAdmin}
                disabled={saving}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Save & Notify Admin
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {apartments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No apartments found. Please create an apartment first.</p>
            <Link
              href="/dashboard/apartments/new"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Create Apartment →
            </Link>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingBooking ? 'Edit Booking' : 'New Booking'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  id="checkInDate"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    if (e.target.value && checkOutDate && new Date(e.target.value) >= new Date(checkOutDate)) {
                      // Auto-adjust check-out if invalid
                      const newCheckOut = new Date(e.target.value);
                      newCheckOut.setDate(newCheckOut.getDate() + 1);
                      setCheckOutDate(format(newCheckOut, 'yyyy-MM-dd'));
                    }
                  }}
                  min={format(startOfDay(new Date()), 'yyyy-MM-dd')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date
                </label>
                <input
                  id="checkOutDate"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => {
                    setCheckOutDate(e.target.value);
                    if (e.target.value && checkInDate && new Date(e.target.value) <= new Date(checkInDate)) {
                      toast.error('Check-out date must be after check-in date');
                    }
                  }}
                  min={checkInDate || format(startOfDay(new Date()), 'yyyy-MM-dd')}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                  {selectedApartmentData?.maxCapacity && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (Max: {selectedApartmentData.maxCapacity})
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    disabled={guestCount <= 1}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                  >
                    -
                  </button>
                  <input
                    id="guestCount"
                    type="number"
                    min="1"
                    max={selectedApartmentData?.maxCapacity || undefined}
                    value={guestCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const max = selectedApartmentData?.maxCapacity;
                      const clampedValue = max 
                        ? Math.min(max, Math.max(1, value))
                        : Math.max(1, value);
                      setGuestCount(clampedValue);
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-center text-lg font-semibold"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const max = selectedApartmentData?.maxCapacity;
                      if (max) {
                        setGuestCount(Math.min(max, guestCount + 1));
                      } else {
                        setGuestCount(guestCount + 1);
                      }
                    }}
                    disabled={selectedApartmentData?.maxCapacity ? guestCount >= selectedApartmentData.maxCapacity : false}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedApartmentData?.maxCapacity 
                    ? `This apartment can accommodate up to ${selectedApartmentData.maxCapacity} guests.`
                    : 'Number of guests for this booking.'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              {editingBooking && (
                <button
                  type="button"
                  onClick={() => {
                    removeBooking(editingBooking);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedDateRange({ start: null, end: null });
                  setEditingBooking(null);
                  setCheckInDate('');
                  setCheckOutDate('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveBooking}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
