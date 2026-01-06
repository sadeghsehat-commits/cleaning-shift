'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { enUS, ar, uk, it } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useI18n } from '@/contexts/I18nContext';

interface OperatorReport {
  operator: {
    _id: string;
    name: string;
    email: string;
  };
  workDaysCount: number;
  unavailableDaysByReason: {
    Malattia: number;
    Ferie: number;
    Permesso: number;
  };
  totalUnavailableDays: number;
  totalDaysInPeriod: number;
  availableDays: number;
  shiftsCount: number;
}

export default function OperatorWorkDaysReportPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState<{
    period: string;
    startDate: string;
    endDate: string;
    report: OperatorReport[];
  } | null>(null);

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
      fetchReport();
    }
  }, [user, period, selectedDate]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
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

  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/reports/operator-work-days?period=${period}&date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load report');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrevious = () => {
    if (period === 'week') {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  const handleNext = () => {
    if (period === 'week') {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const startDate = report ? new Date(report.startDate) : null;
  const endDate = report ? new Date(report.endDate) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Operator Work Days Report</h1>
        <p className="text-gray-600">View how many days each operator worked in a period</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium ${
                period === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium ${
                period === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              ← Previous
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Next →
            </button>
          </div>

          {startDate && endDate && (
            <div className="text-lg font-semibold text-gray-900">
              {format(startDate, 'dd MMM yyyy', { locale: getLocale() })} - {format(endDate, 'dd MMM yyyy', { locale: getLocale() })}
            </div>
          )}
        </div>

        {reportLoading ? (
          <div className="text-center py-8">Loading report...</div>
        ) : report && report.report.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Days
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shifts Count
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Malattia
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ferie
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permesso
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Unavailable
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Days
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.report.map((item) => (
                  <tr key={item.operator._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.operator.name}</div>
                      <div className="text-sm text-gray-500">{item.operator.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                      {item.workDaysCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                      {item.shiftsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">
                      {item.unavailableDaysByReason.Malattia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600">
                      {item.unavailableDaysByReason.Ferie}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm text-yellow-600">
                      {item.unavailableDaysByReason.Permesso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-700">
                      {item.totalUnavailableDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600">
                      {item.availableDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
}


