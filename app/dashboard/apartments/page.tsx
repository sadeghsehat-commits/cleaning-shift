'use client'
import { apiUrl } from '@/lib/api-config';;

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  description?: string;
  maxCapacity?: number;
  owner: { _id: string; name: string; email: string } | string;
}

export default function ApartmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchApartments();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'));
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Operators cannot access apartments page
        if (data.user.role === 'operator') {
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
      const response = await fetch(apiUrl('/api/apartments'));
      if (response.ok) {
        const data = await response.json();
        setApartments(data.apartments);
      } else {
        toast.error('Failed to load apartments');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const canCreate = ['admin', 'owner'].includes(user?.role); // Viewer cannot create

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
            <h1 className="text-2xl font-bold text-gray-900">Apartments</h1>
          </div>
          <p className="text-gray-600">Manage apartment listings</p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/apartments/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + New Apartment
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        {apartments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No apartments found</p>
        ) : user?.role === 'admin' ? (
          // For admins: Group apartments by owner
          (() => {
            // Group apartments by owner
            const apartmentsByOwner = new Map<string, { owner: any; apartments: Apartment[] }>();
            
            apartments.forEach((apartment) => {
              const ownerId = typeof apartment.owner === 'object' && apartment.owner._id
                ? apartment.owner._id
                : apartment.owner;
              const ownerKey = typeof ownerId === 'string' ? ownerId : ownerId.toString();
              
              if (!apartmentsByOwner.has(ownerKey)) {
                apartmentsByOwner.set(ownerKey, {
                  owner: typeof apartment.owner === 'object' ? apartment.owner : null,
                  apartments: [],
                });
              }
              apartmentsByOwner.get(ownerKey)!.apartments.push(apartment);
            });

            // Convert to array and sort by number of apartments (descending)
            const ownerGroups = Array.from(apartmentsByOwner.entries())
              .map(([ownerId, data]) => ({
                ownerId,
                owner: data.owner,
                apartments: data.apartments,
                count: data.apartments.length,
              }))
              .sort((a, b) => {
                // Sort by count (descending)
                if (b.count !== a.count) {
                  return b.count - a.count;
                }
                // If same count, sort by owner name
                const aName = a.owner && typeof a.owner === 'object' ? a.owner.name || '' : '';
                const bName = b.owner && typeof b.owner === 'object' ? b.owner.name || '' : '';
                return aName.localeCompare(bName);
              });

            return (
              <div className="space-y-8">
                {ownerGroups.map((group) => (
                  <div key={group.ownerId} className="space-y-4">
                    {/* Owner Header */}
                    <div className="border-b-2 border-primary-300 pb-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {group.owner && typeof group.owner === 'object' 
                          ? `${group.owner.name} (${group.owner.email})`
                          : 'Unknown Owner'}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {group.count} {group.count === 1 ? 'apartment' : 'apartments'}
                      </p>
                    </div>

                    {/* Owner's Apartments */}
                    <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                      {group.apartments.map((apartment) => {
                        const ownerId = typeof apartment.owner === 'object' ? apartment.owner._id : apartment.owner;
                        const canEdit = user?.role === 'admin' || 
                          (user?.role === 'owner' && ownerId === user?.id);
                        const canDelete = canEdit;

                        return (
                          <div
                            key={apartment._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg">{apartment.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{apartment.address}</p>
                                {apartment.maxCapacity && (
                                  <p className="text-sm text-gray-700 mt-2 font-medium">
                                    👥 Maximum Capacity: {apartment.maxCapacity} {apartment.maxCapacity === 1 ? 'guest' : 'guests'}
                                  </p>
                                )}
                                {apartment.description && (
                                  <p className="text-sm text-gray-500 mt-2">{apartment.description}</p>
                                )}
                              </div>
                              {canEdit && (
                                <div className="flex gap-2 ml-4">
                                  <Link
                                    href={`/dashboard/apartments/${apartment._id}/edit`}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    Edit
                                  </Link>
                                  {canDelete && (
                                    <button
                                      onClick={async () => {
                                        if (confirm('Are you sure you want to delete this apartment?')) {
                                          try {
                                            const response = await fetch(apiUrl(`/api/apartments/${apartment._id}`, {
                                              method: 'DELETE',
                                            });
                                            if (response.ok) {
                                              toast.success('Apartment deleted');
                                              fetchApartments();
                                            } else {
                                              toast.error('Failed to delete apartment');
                                            }
                                          } catch (error) {
                                            toast.error('An error occurred');
                                          }
                                        }
                                      }}
                                      className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()
        ) : (
          // For owners and other roles: Simple list (no grouping)
          <div className="space-y-4">
            {apartments.map((apartment) => {
              const ownerId = typeof apartment.owner === 'object' ? apartment.owner._id : apartment.owner;
              const canEdit = user?.role === 'admin' || 
                (user?.role === 'owner' && ownerId === user?.id);
              const canDelete = canEdit;

              return (
                <div
                  key={apartment._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{apartment.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{apartment.address}</p>
                      {apartment.maxCapacity && (
                        <p className="text-sm text-gray-700 mt-2 font-medium">
                          👥 Maximum Capacity: {apartment.maxCapacity} {apartment.maxCapacity === 1 ? 'guest' : 'guests'}
                        </p>
                      )}
                      {apartment.description && (
                        <p className="text-sm text-gray-500 mt-2">{apartment.description}</p>
                      )}
                      {user?.role !== 'owner' && typeof apartment.owner === 'object' && (
                        <p className="text-sm text-gray-500 mt-2">
                          Owner: {apartment.owner.name} ({apartment.owner.email})
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/dashboard/apartments/${apartment._id}/edit`}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </Link>
                        {canDelete && (
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this apartment?')) {
                                try {
                                  const response = await fetch(apiUrl(`/api/apartments/${apartment._id}`, {
                                    method: 'DELETE',
                                  });
                                  if (response.ok) {
                                    toast.success('Apartment deleted');
                                    fetchApartments();
                                  } else {
                                    toast.error('Failed to delete apartment');
                                  }
                                } catch (error) {
                                  toast.error('An error occurred');
                                }
                              }
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

