'use client'
import { apiUrl } from '@/lib/api-config';;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useI18n } from '@/contexts/I18nContext';

interface UnavailabilityRequest {
  _id: string;
  operator: { _id: string; name: string; email: string };
  dates: string[];
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: { _id: string; name: string };
  reviewedAt?: string;
  createdAt: string;
}

export default function UnavailabilityRequestsPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<UnavailabilityRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, filter]);

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'));
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

  const fetchRequests = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/unavailability-requests'
        : `/api/unavailability-requests?status=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    }
  };

  const handleReview = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(apiUrl(`/api/unavailability-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'}`);
        await fetchRequests();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update request');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unavailability Requests</h1>
        <p className="text-gray-600">Review and manage operator unavailability requests</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                request.status === 'approved'
                  ? 'border-green-200'
                  : request.status === 'rejected'
                  ? 'border-red-200'
                  : 'border-yellow-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.operator.name}
                  </h3>
                  <p className="text-sm text-gray-600">{request.operator.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Requested Dates ({request.dates.length} day{request.dates.length !== 1 ? 's' : ''}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {request.dates.map((dateStr, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      {format(new Date(dateStr), 'dd/MM/yyyy')}
                    </span>
                  ))}
                </div>
              </div>

              {request.reason && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                  <p className="text-sm text-gray-600">{request.reason}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Submitted: {format(new Date(request.createdAt), 'dd/MM/yyyy, h:mm a')}
                  {request.reviewedBy && (
                    <>
                      <br />
                      Reviewed by {request.reviewedBy.name} on{' '}
                      {format(new Date(request.reviewedAt!), 'dd/MM/yyyy, h:mm a')}
                    </>
                  )}
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(request._id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(request._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


