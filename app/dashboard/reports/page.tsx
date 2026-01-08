'use client'
import { apiUrl } from '@/lib/api-config';;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, parse } from 'date-fns';
import { enUS, ar, uk, it } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useI18n } from '@/contexts/I18nContext';

interface ApartmentReport {
  id: string;
  name: string;
  address: string;
  shiftCount: number;
  shifts: Array<{
    date: string;
    dateFormatted: string;
    startTime: string;
    endTime: string;
  }>;
}

interface OperatorReport {
  operatorId: string;
  operatorName: string;
  operatorEmail: string;
  totalShifts: number;
  daysWorked: string[];
  daysWorkedCount: number;
  apartments: ApartmentReport[];
}

interface ReportData {
  month: string;
  monthFormatted: string;
  startDate: string;
  endDate: string;
  operators: OperatorReport[];
}

export default function ReportsPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [loadingReport, setLoadingReport] = useState(false);

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
    if (user && user.role === 'admin') {
      fetchReport();
    }
  }, [user, selectedMonth]);

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user.role !== 'admin') {
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

  const fetchReport = async () => {
    setLoadingReport(true);
    setReportData(null); // Clear previous data while loading
    try {
      const response = await fetch(apiUrl(`/api/reports/operators?month=${selectedMonth}`), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Verify the returned month matches the selected month
        if (data.month === selectedMonth) {
          setReportData(data);
        } else {
          console.error('Month mismatch:', data.month, 'expected:', selectedMonth);
          toast.error('Failed to load report');
          setReportData(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(errorData.error || 'Failed to load report');
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('An error occurred');
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;

    // Create CSV content
    let csv = 'Operator Monthly Report\n';
    csv += `Month: ${reportData.monthFormatted}\n`;
    csv += `Period: ${format(new Date(reportData.startDate), 'dd/MM/yyyy')} - ${format(new Date(reportData.endDate), 'dd/MM/yyyy')}\n\n`;

    reportData.operators.forEach((operator) => {
      csv += `\nOperator: ${operator.operatorName}\n`;
      csv += `Total Shifts: ${operator.totalShifts}\n`;
      csv += `Days Worked: ${operator.daysWorkedCount}\n`;
      csv += `Days: ${operator.daysWorked.map((d) => format(new Date(d), 'dd/MM/yyyy')).join(', ')}\n\n`;

      csv += 'Apartment,Address,Shift Count,Shifts Details\n';
      operator.apartments.forEach((apartment) => {
        const shiftsDetails = apartment.shifts
          .map(
            (s) =>
              `${s.dateFormatted} ${s.startTime}${s.endTime ? '-' + s.endTime : ''}`
          )
          .join('; ');
        csv += `"${apartment.name}","${apartment.address}",${apartment.shiftCount},"${shiftsDetails}"\n`;
      });
      csv += '\n';
    });

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `operator-report-${reportData.month}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Report downloaded successfully');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-gray-900">Operator Reports</h1>
        </div>
        <p className="text-gray-600">Monthly activity report for operators</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 flex-1">
            <button
              onClick={() => {
                const currentMonthDate = parse(selectedMonth, 'yyyy-MM', new Date());
                const previousMonth = subMonths(currentMonthDate, 1);
                setSelectedMonth(format(previousMonth, 'yyyy-MM'));
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium flex items-center justify-center min-w-[56px] min-h-[48px] touch-manipulation shadow-sm"
              aria-label={t.common.previous}
              style={{
                minWidth: '56px',
                minHeight: '48px',
                fontSize: '24px'
              }}
            >
              <span className="text-2xl sm:text-3xl font-bold">←</span>
            </button>
            
            <div className="flex-1 text-center px-2 sm:px-3">
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
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium flex items-center justify-center min-w-[56px] min-h-[48px] touch-manipulation shadow-sm"
              aria-label={t.common.next}
              style={{
                minWidth: '56px',
                minHeight: '48px',
                fontSize: '24px'
              }}
            >
              <span className="text-2xl sm:text-3xl font-bold">→</span>
            </button>
          </div>
          
          {reportData && (
            <button
              onClick={downloadCSV}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center gap-2 text-sm sm:text-base font-medium min-h-[40px] sm:min-h-[44px] touch-manipulation"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden xs:inline">Download CSV</span>
              <span className="xs:hidden">CSV</span>
            </button>
          )}
        </div>

        {loadingReport ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading report...</div>
          </div>
        ) : reportData && reportData.operators.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Report: {reportData.monthFormatted}
              </h2>
              <p className="text-sm text-blue-700">
                Period: {format(new Date(reportData.startDate), 'dd/MM/yyyy')} -{' '}
                {format(new Date(reportData.endDate), 'dd/MM/yyyy')}
              </p>
            </div>

            {reportData.operators.map((operator) => (
              <div
                key={operator.operatorId}
                className="border border-gray-200 rounded-lg p-4 lg:p-6"
              >
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {operator.operatorName}
                  </h3>
                  <p className="text-sm text-gray-600">{operator.operatorEmail}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-700">
                      <span className="font-medium">Total Shifts:</span> {operator.totalShifts}
                    </span>
                    <span className="text-gray-700">
                      <span className="font-medium">Days Worked:</span> {operator.daysWorkedCount}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Days: </span>
                    <span className="text-sm text-gray-600">
                      {operator.daysWorked
                        .map((d) => format(new Date(d), 'dd/MM/yyyy'))
                        .join(', ')}
                    </span>
                  </div>
                </div>

                {operator.apartments.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Apartments:</h4>
                    {operator.apartments.map((apartment) => (
                      <div
                        key={apartment.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">{apartment.name}</h5>
                            <p className="text-sm text-gray-600">{apartment.address}</p>
                          </div>
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                            {apartment.shiftCount} shift{apartment.shiftCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Shift Dates:</p>
                          <div className="flex flex-wrap gap-2">
                            {apartment.shifts.map((shift, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700"
                              >
                                {shift.dateFormatted} {shift.startTime}
                                {shift.endTime && ` - ${shift.endTime}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No shifts completed this month</p>
                )}
              </div>
            ))}
          </div>
        ) : reportData ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No completed shifts found for this month</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

