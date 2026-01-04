'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { enUS, ar, uk, it } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useI18n } from '@/contexts/I18nContext';

interface Shift {
  _id: string;
  apartment: {
    _id: string;
    name: string;
    owner?: { _id: string; name: string; email: string } | string;
  };
  cleaner: {
    _id: string;
    name: string;
  };
  scheduledDate: string;
  scheduledStartTime: string;
  status: string;
}

interface Apartment {
  _id: string;
  name: string;
  owner?: { _id: string; name: string; email: string } | string;
}

export default function SchedulePage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [operators, setOperators] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedOwners, setSelectedOwners] = useState<Set<string>>(new Set()); // For filtering by owners
  const [apartmentSearch, setApartmentSearch] = useState<string>(''); // For searching apartments
  const [allApartmentGroups, setAllApartmentGroups] = useState<Array<{ owner: any; apartments: Apartment[] }>>([]);
  const [bookingsByApartment, setBookingsByApartment] = useState<Record<string, Array<{checkIn: string | Date, checkOut: string | Date, guestCount: number}>>>({}); // Store bookings by apartment ID

  // Get locale for date-fns
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
      fetchData();
      if (user.role === 'admin') {
        fetchOperators();
      }
    }
  }, [user, selectedWeek, selectedOperator, selectedOwners, apartmentSearch]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Allow admin, operator, and owner to access this page
        if (!['admin', 'operator', 'owner'].includes(data.user.role)) {
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

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        const ops = data.users.filter((u: any) => u.role === 'operator');
        setOperators(ops);
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Calculate week range first (needed for shifts fetch)
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 }); // Sunday
      const nextWeekStart = addWeeks(weekStart, 1);
      const nextWeekEnd = addWeeks(weekEnd, 1);
      const allStartDate = weekStart < nextWeekStart ? weekStart : nextWeekStart;
      const allEndDate = weekEnd > nextWeekEnd ? weekEnd : nextWeekEnd;

      // Fetch shifts first (needed for operators to get their apartments)
      const shiftsResponse = await fetch(`/api/shifts?startDate=${allStartDate.toISOString()}&endDate=${allEndDate.toISOString()}`);
      if (!shiftsResponse.ok) throw new Error('Failed to fetch shifts');
      const shiftsData = await shiftsResponse.json();
      let allShifts = shiftsData.shifts || [];

      // Filter by operator if selected (for admin) - operators are already filtered by API
      if (user?.role === 'admin' && selectedOperator !== 'all') {
        allShifts = allShifts.filter((shift: Shift) => 
          shift.cleaner._id === selectedOperator || shift.cleaner._id?.toString() === selectedOperator
        );
      }

      setShifts(allShifts);

      // For operators, get apartments from their shifts only
      let apartmentsToShow: Apartment[] = [];
      if (user?.role === 'operator') {
        // Extract unique apartments from shifts
        const apartmentMap = new Map<string, Apartment>();
        allShifts.forEach((shift: Shift) => {
          if (shift.apartment && !apartmentMap.has(shift.apartment._id)) {
            apartmentMap.set(shift.apartment._id, shift.apartment as any);
          }
        });
        apartmentsToShow = Array.from(apartmentMap.values());
      } else {
        // For admin and owner, fetch all apartments (or filtered)
        // Note: API already filters apartments for owners, so no need to filter again
        const aptResponse = await fetch('/api/apartments');
        if (!aptResponse.ok) {
          const errorData = await aptResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch apartments');
        }
        const aptData = await aptResponse.json();
        apartmentsToShow = aptData.apartments || [];
      }
      
      // Sort apartments: group by owner, sort owners by apartment count (descending), then by name
      const apartmentsByOwner = new Map<string, { owner: any; apartments: Apartment[] }>();
      apartmentsToShow.forEach((apt: Apartment) => {
        const ownerId = apt.owner && typeof apt.owner === 'object' 
          ? apt.owner._id.toString() 
          : (apt.owner ? apt.owner.toString() : 'no-owner');
        
        if (!apartmentsByOwner.has(ownerId)) {
          apartmentsByOwner.set(ownerId, { 
            owner: apt.owner, 
            apartments: [] 
          });
        }
        apartmentsByOwner.get(ownerId)!.apartments.push(apt);
      });

      // Sort apartments within each owner group by name
      apartmentsByOwner.forEach((group) => {
        group.apartments.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Sort owners by apartment count (descending), then by owner name
      const sortedOwners = Array.from(apartmentsByOwner.values()).sort((a, b) => {
        if (b.apartments.length !== a.apartments.length) {
          return b.apartments.length - a.apartments.length;
        }
        const aOwnerName = typeof a.owner === 'object' ? a.owner.name : '';
        const bOwnerName = typeof b.owner === 'object' ? b.owner.name : '';
        return aOwnerName.localeCompare(bOwnerName);
      });

      // Store all apartments and owner groups for filtering
      setAllApartmentGroups(sortedOwners);
      
      // Apply filters
      let filteredApartments = sortedOwners.flatMap(group => group.apartments);
      
      // Filter by selected owners (only for admin)
      if (user?.role === 'admin' && selectedOwners.size > 0) {
        const ownerIdsArray = Array.from(selectedOwners);
        filteredApartments = sortedOwners
          .filter(group => {
            const ownerId = group.owner && typeof group.owner === 'object'
              ? group.owner._id.toString()
              : (group.owner ? group.owner.toString() : 'no-owner');
            return ownerIdsArray.includes(ownerId);
          })
          .flatMap(group => group.apartments);
      }
      
      // Filter by apartment search
      if (apartmentSearch.trim()) {
        const searchLower = apartmentSearch.toLowerCase();
        filteredApartments = filteredApartments.filter(apt => 
          apt.name.toLowerCase().includes(searchLower)
        );
      }
      
      setApartments(filteredApartments);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        user: user?.role,
      });
      toast.error(`Failed to load schedule: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  const getNextWeekDays = () => {
    const weekStart = addWeeks(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 1);
    const weekEnd = addWeeks(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 1);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  const getShiftForApartmentAndDate = (apartmentId: string, date: Date): Shift | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return shifts.find(shift => {
      const shiftDate = format(new Date(shift.scheduledDate), 'yyyy-MM-dd');
      return shiftDate === dateStr && shift.apartment._id === apartmentId;
    }) || null;
  };

  const getGuestCountForDate = (apartmentId: string, date: Date): number | null => {
    const bookings = bookingsByApartment[apartmentId] || [];
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    
    for (const booking of bookings) {
      const checkOut = typeof booking.checkOut === 'string' ? parseISO(booking.checkOut) : new Date(booking.checkOut);
      const checkOutStr = format(startOfDay(checkOut), 'yyyy-MM-dd');
      
      if (checkOutStr === dateStr) {
        return booking.guestCount;
      }
    }
    
    return null;
  };

  // Generate colors for owners
  const getOwnerColor = (owner: any, index: number): string => {
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-yellow-50 border-yellow-200',
      'bg-purple-50 border-purple-200',
      'bg-pink-50 border-pink-200',
      'bg-indigo-50 border-indigo-200',
      'bg-red-50 border-red-200',
      'bg-teal-50 border-teal-200',
      'bg-orange-50 border-orange-200',
      'bg-cyan-50 border-cyan-200',
    ];
    return colors[index % colors.length];
  };

  // Group apartments by owner for color assignment
  const getOwnerIndex = (apartment: Apartment): number => {
    const ownerId = apartment.owner && typeof apartment.owner === 'object'
      ? apartment.owner._id.toString()
      : (apartment.owner ? apartment.owner.toString() : 'no-owner');
    
    const uniqueOwners = new Set<string>();
    apartments.forEach(apt => {
      const id = apt.owner && typeof apt.owner === 'object'
        ? apt.owner._id.toString()
        : (apt.owner ? apt.owner.toString() : 'no-owner');
      uniqueOwners.add(id);
    });
    
    const ownersArray = Array.from(uniqueOwners);
    return ownersArray.indexOf(ownerId);
  };

  const exportToCSV = () => {
    const weekDays = [...getWeekDays(), ...getNextWeekDays()];
    const headers = ['Date', 'Day', 'Apartment', 'Owner', 'Operator', 'Status'];
    const rows = [headers.join(',')];

    shifts.forEach(shift => {
      const date = new Date(shift.scheduledDate);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayStr = format(date, 'EEEE', { locale: getLocale() });
      const apartmentName = shift.apartment.name;
      const ownerName = shift.apartment.owner && typeof shift.apartment.owner === 'object'
        ? shift.apartment.owner.name
        : 'Unknown';
      const operatorName = shift.cleaner.name;
      const status = shift.status;

      rows.push([dateStr, dayStr, apartmentName, ownerName, operatorName, status].join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shifts_${format(selectedWeek, 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t.common.loading}</div>;
  }

  const weekDays = getWeekDays();
  const nextWeekDays = getNextWeekDays();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.dashboard.weeklySchedule || 'Weekly Schedule'}</h1>
          <p className="text-gray-600">
            {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: getLocale() })} - {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: getLocale() })}
            {' / '}
            {format(addWeeks(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 1), 'dd MMM yyyy', { locale: getLocale() })} - {format(addWeeks(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 1), 'dd MMM yyyy', { locale: getLocale() })}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Apartment Search */}
          {user?.role !== 'operator' && (
            <input
            type="text"
            placeholder="Search apartments..."
            value={apartmentSearch}
            onChange={(e) => setApartmentSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          )}
          
          {/* Owner Filter - Only for admin */}
          {user?.role === 'admin' && allApartmentGroups.length > 0 && (
            <select
              value={selectedOwners.size === 0 ? 'all' : Array.from(selectedOwners)[0]}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setSelectedOwners(new Set());
                } else {
                  setSelectedOwners(new Set([e.target.value]));
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Owners ({apartments.length} apartments)</option>
              {allApartmentGroups.map((group, index) => {
                const ownerId = group.owner && typeof group.owner === 'object'
                  ? group.owner._id.toString()
                  : (group.owner ? group.owner.toString() : 'no-owner');
                const ownerName = group.owner && typeof group.owner === 'object'
                  ? group.owner.name
                  : 'Unknown';
                return (
                  <option key={ownerId} value={ownerId}>
                    {ownerName} ({group.apartments.length} apartments)
                  </option>
                );
              })}
            </select>
          )}
          
          {/* Operator Filter - Only for admin */}
          {user?.role === 'admin' && (
            <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Operators</option>
            {operators.map(op => (
              <option key={op._id} value={op._id}>{op.name}</option>
            ))}
          </select>
          )}
          
          <button
            onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← {t.common.previous}
          </button>
          <button
            onClick={() => setSelectedWeek(new Date())}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Today
          </button>
          <button
            onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            {t.common.next} →
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto" style={{ maxHeight: '80vh' }}>
        <div className="sticky top-0 bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b z-20">
          Showing {apartments.length} apartment{apartments.length !== 1 ? 's' : ''} 
          {allApartmentGroups.length > 0 && apartments.length !== allApartmentGroups.reduce((sum, g) => sum + g.apartments.length, 0) && ` (${allApartmentGroups.reduce((sum, g) => sum + g.apartments.length, 0)} total)`}
        </div>
        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: `${Math.max(300, (weekDays.length + nextWeekDays.length) * 120 + 200)}px` }}>
          <thead className="bg-gray-50 sticky top-12 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-200" style={{ minWidth: '200px' }}>
                Apartment / Date
              </th>
              {/* Current Week Header */}
              {weekDays.map((date) => (
                <th
                  key={date.toISOString()}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 bg-blue-50"
                  style={{ minWidth: '100px' }}
                >
                  <div className="font-semibold">{format(date, 'dd/MM', { locale: getLocale() })}</div>
                  <div className="text-xs text-gray-600 font-normal">{format(date, 'EEE', { locale: getLocale() })}</div>
                </th>
              ))}
              {/* Next Week Header */}
              {nextWeekDays.map((date) => (
                <th
                  key={date.toISOString()}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 bg-green-50"
                  style={{ minWidth: '100px' }}
                >
                  <div className="font-semibold">{format(date, 'dd/MM', { locale: getLocale() })}</div>
                  <div className="text-xs text-gray-600 font-normal">{format(date, 'EEE', { locale: getLocale() })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Group apartments by owner */}
            {allApartmentGroups
              .filter(group => {
                // Filter groups based on selectedOwners
                if (selectedOwners.size > 0) {
                  const ownerId = group.owner && typeof group.owner === 'object'
                    ? group.owner._id.toString()
                    : (group.owner ? group.owner.toString() : 'no-owner');
                  return selectedOwners.has(ownerId);
                }
                return true;
              })
              .map((group, groupIndex) => {
                const ownerName = group.owner && typeof group.owner === 'object'
                  ? group.owner.name
                  : 'Unknown Owner';
                const ownerId = group.owner && typeof group.owner === 'object'
                  ? group.owner._id.toString()
                  : (group.owner ? group.owner.toString() : 'no-owner');
                const ownerColorIndex = allApartmentGroups.findIndex(g => {
                  const gOwnerId = g.owner && typeof g.owner === 'object'
                    ? g.owner._id.toString()
                    : (g.owner ? g.owner.toString() : 'no-owner');
                  return gOwnerId === ownerId;
                });
                
                // Filter apartments by search
                let filteredGroupApartments = group.apartments;
                if (apartmentSearch.trim()) {
                  const searchLower = apartmentSearch.toLowerCase();
                  filteredGroupApartments = group.apartments.filter(apt => 
                    apt.name.toLowerCase().includes(searchLower)
                  );
                }
                
                if (filteredGroupApartments.length === 0) return null;
                
                return (
                  <Fragment key={ownerId}>
                    {/* Owner Header Row */}
                    <tr className={`${getOwnerColor(group.owner, ownerColorIndex)} border-t-2 border-gray-300`}>
                      <td
                        colSpan={weekDays.length + nextWeekDays.length + 1}
                        className="px-4 py-2 font-bold text-sm text-gray-900 sticky left-0 z-10"
                        style={{ backgroundColor: 'inherit' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{ownerName}</span>
                          <span className="text-xs font-normal text-gray-600">
                            ({filteredGroupApartments.length} apartment{filteredGroupApartments.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Apartment Rows */}
                    {filteredGroupApartments.map((apartment) => (
                      <tr key={apartment._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                          <div className="font-semibold">{apartment.name}</div>
                          {apartment.owner && typeof apartment.owner === 'object' && (
                            <div className="text-xs text-gray-500">{apartment.owner.email}</div>
                          )}
                        </td>
                        {/* Current Week Cells */}
                        {weekDays.map((date) => {
                          const shift = getShiftForApartmentAndDate(apartment._id, date);
                          return (
                            <td
                              key={date.toISOString()}
                              className={`px-3 py-3 text-sm text-center border-r border-gray-200 ${getOwnerColor(apartment.owner, ownerColorIndex)}`}
                            >
                              {shift ? (
                                <div className="font-medium text-gray-900">{shift.cleaner.name}</div>
                              ) : (
                                <div className="text-gray-400">-</div>
                              )}
                            </td>
                          );
                        })}
                        {/* Next Week Cells */}
                        {nextWeekDays.map((date) => {
                          const shift = getShiftForApartmentAndDate(apartment._id, date);
                          return (
                            <td
                              key={date.toISOString()}
                              className={`px-3 py-3 text-sm text-center border-r border-gray-200 ${getOwnerColor(apartment.owner, ownerColorIndex)}`}
                            >
                              {shift ? (
                                <div className="font-medium text-gray-900">{shift.cleaner.name}</div>
                              ) : (
                                <div className="text-gray-400">-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

