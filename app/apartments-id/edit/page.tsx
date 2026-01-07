'use client'
import { apiUrl } from '@/lib/api-config';;

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function EditApartmentPage() {
  const router = useRouter();
  const params = useParams();
  const apartmentId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Italy',
    latitude: '',
    longitude: '',
    description: '',
    owner: '',
    bathrooms: '',
    salon: {
      hasSofaBed: false,
      sofaBedCapacity: 1 as 1 | 2,
    },
    bedrooms: [] as Array<{ beds: Array<{ type: 'queen' | 'single' | 'sofa_bed_1' | 'sofa_bed_2' }> }>,
    cleaningTime: null as number | null,
  });
  const [calculatedMaxCapacity, setCalculatedMaxCapacity] = useState<number>(0);
  const cityAutocompleteRef = useRef<HTMLInputElement>(null);
  const addressAutocompleteRef = useRef<HTMLInputElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [citySelected, setCitySelected] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkAuth();
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const hasKey = Boolean(apiKey && apiKey.trim() !== '');
    setHasApiKey(hasKey);
    if (hasKey) {
      loadGoogleMaps();
    }
  }, []);

  useEffect(() => {
    if (apartmentId) {
      fetchApartment();
    }
  }, [apartmentId]);

  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        // Owner doesn't need to select owner
      } else {
        fetchOwners();
      }
    }
  }, [user]);

  const loadGoogleMaps = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Autocomplete will not work.');
      return;
    }

    if (window.google?.maps?.places) {
      setGoogleLoaded(true);
      setTimeout(() => initializeCityAutocomplete(), 100);
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkInterval);
          setGoogleLoaded(true);
          setTimeout(() => initializeCityAutocomplete(), 100);
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogle);
          setGoogleLoaded(true);
          setTimeout(() => initializeCityAutocomplete(), 100);
        }
      }, 50);
      setTimeout(() => clearInterval(checkGoogle), 5000);
    };
    
    document.head.appendChild(script);
  };

  const initializeCityAutocomplete = () => {
    if (!cityAutocompleteRef.current || !googleLoaded) return;

    if (!window.google?.maps?.places) {
      return;
    }

    if ((cityAutocompleteRef.current as any).autocomplete) {
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        cityAutocompleteRef.current,
        {
          types: ['(cities)'],
          fields: ['address_components', 'formatted_address', 'name', 'geometry'],
          componentRestrictions: { country: 'it' },
        } as any
      );

      (cityAutocompleteRef.current as any).autocomplete = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        let city = '';
        
        if ((place as any).name) {
          city = (place as any).name;
        }
        
        if (!city && place.address_components) {
          place.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes('locality') || types.includes('administrative_area_level_3')) {
              city = component.long_name;
            }
          });
        }
        
        if (!city && place.formatted_address) {
          city = place.formatted_address.split(',')[0].trim();
        }

        if (city) {
          setFormData((prev) => ({
            ...prev,
            city: city,
            country: 'Italy',
          }));
          setCitySelected(true);
          setTimeout(() => {
            initializeAddressAutocomplete();
          }, 100);
        }
      });
    } catch (error) {
      console.error('Error initializing city autocomplete:', error);
    }
  };

  const initializeAddressAutocomplete = () => {
    if (!addressAutocompleteRef.current || !formData.city) return;

    if (!window.google?.maps?.places) {
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressAutocompleteRef.current,
        {
          types: ['address'],
          fields: ['address_components', 'formatted_address', 'geometry'],
          componentRestrictions: { country: 'it' },
        } as any
      );

      (addressAutocompleteRef.current as any).autocomplete = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          toast.error('No details available for this address');
          return;
        }

        let address = '';
        let postalCode = '';

        place.address_components?.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number') || types.includes('route')) {
            address = address ? `${component.long_name} ${address}` : component.long_name;
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name;
          }
        });

        const fullAddress = place.formatted_address || address;

        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
          postalCode: postalCode || prev.postalCode,
          country: 'Italy',
          latitude: place.geometry?.location?.lat()?.toString() || prev.latitude,
          longitude: place.geometry?.location?.lng()?.toString() || prev.longitude,
        }));
      });
    } catch (error) {
      console.error('Error initializing address autocomplete:', error);
    }
  };

  useEffect(() => {
    if (googleLoaded) {
      initializeCityAutocomplete();
    }
  }, [googleLoaded]);

  useEffect(() => {
    if (googleLoaded && citySelected && formData.city && addressAutocompleteRef.current) {
      initializeAddressAutocomplete();
    }
  }, [googleLoaded, citySelected, formData.city]);

  // Calculate max capacity when bedrooms or salon changes
  useEffect(() => {
    let capacity = 0;
    
    // Count capacity from bedrooms
    if (formData.bedrooms && Array.isArray(formData.bedrooms)) {
      formData.bedrooms.forEach((bedroom) => {
        if (bedroom.beds && Array.isArray(bedroom.beds)) {
          bedroom.beds.forEach((bed) => {
            switch (bed.type) {
              case 'queen':
                capacity += 2;
                break;
              case 'single':
                capacity += 1;
                break;
              case 'sofa_bed_1':
                capacity += 1;
                break;
              case 'sofa_bed_2':
                capacity += 2;
                break;
            }
          });
        }
      });
    }
    
    // Add salon sofa bed capacity if exists
    if (formData.salon?.hasSofaBed && formData.salon.sofaBedCapacity) {
      capacity += formData.salon.sofaBedCapacity;
    }
    
    setCalculatedMaxCapacity(capacity);
  }, [formData.bedrooms, formData.salon]);

  const checkAuth = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (data.user.role === 'operator' || data.user.role === 'viewer') {
          router.push('/dashboard/apartments');
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

  const fetchOwners = async () => {
    try {
      const response = await fetch(apiUrl('/api/users?role=owner'), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setOwners(data.users);
      }
    } catch (error) {
      toast.error('Failed to load owners');
    }
  };

  const fetchApartment = async () => {
    try {
      const response = await fetch(apiUrl(`/api/apartments/${apartmentId}`), {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const apt = data.apartment;
        
        // Calculate max capacity
        let capacity = 0;
        if (apt.bedrooms && Array.isArray(apt.bedrooms)) {
          apt.bedrooms.forEach((bedroom: any) => {
            if (bedroom.beds && Array.isArray(bedroom.beds)) {
              bedroom.beds.forEach((bed: any) => {
                switch (bed.type) {
                  case 'queen': capacity += 2; break;
                  case 'single': capacity += 1; break;
                  case 'sofa_bed_1': capacity += 1; break;
                  case 'sofa_bed_2': capacity += 2; break;
                }
              });
            }
          });
        }
        if (apt.salon?.hasSofaBed && apt.salon.sofaBedCapacity) {
          capacity += apt.salon.sofaBedCapacity;
        }
        setCalculatedMaxCapacity(capacity);

        const ownerId = typeof apt.owner === 'object' && apt.owner?._id 
          ? apt.owner._id.toString() 
          : apt.owner?.toString() || '';

        setFormData({
          name: apt.name || '',
          address: apt.address || '',
          city: apt.city || '',
          postalCode: apt.postalCode || '',
          country: apt.country || 'Italy',
          latitude: apt.latitude?.toString() || '',
          longitude: apt.longitude?.toString() || '',
          description: apt.description || '',
          owner: ownerId,
          bathrooms: apt.bathrooms?.toString() || '',
          salon: apt.salon || {
            hasSofaBed: false,
            sofaBedCapacity: 1,
          },
          bedrooms: apt.bedrooms || [],
          cleaningTime: apt.cleaningTime !== undefined && apt.cleaningTime !== null ? apt.cleaningTime : null,
        });

        if (apt.city) {
          setCitySelected(true);
        }
      } else {
        toast.error('Failed to load apartment');
        router.push('/dashboard/apartments');
      }
    } catch (error) {
      toast.error('Failed to load apartment');
      router.push('/dashboard/apartments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.city || !formData.address) {
      toast.error('Please select a city and address');
      return;
    }

    setSubmitting(true);

    try {
      const submitData: any = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        description: formData.description,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        salon: formData.salon.hasSofaBed ? formData.salon : undefined,
        bedrooms: formData.bedrooms.length > 0 ? formData.bedrooms : undefined,
        cleaningTime: formData.cleaningTime !== null ? formData.cleaningTime : undefined,
      };

      if (calculatedMaxCapacity > 0) {
        submitData.maxCapacity = calculatedMaxCapacity;
      }

      if (user?.role !== 'owner') {
        submitData.owner = formData.owner;
      }

      const response = await fetch(apiUrl(`/api/apartments/${apartmentId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success('Apartment updated successfully');
        router.push('/dashboard/apartments');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update apartment');
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
            href="/dashboard/apartments"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            Apartments
          </Link>
          <span className="text-gray-400 flex items-center">/</span>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">Edit Apartment</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City (Italy) *
          </label>
          <input
            ref={cityAutocompleteRef}
            id="city"
            type="text"
            placeholder="Start typing a city name in Italy..."
            value={formData.city}
            onChange={(e) => {
              const cityValue = e.target.value;
              setFormData({ ...formData, city: cityValue });
              if (!cityValue) {
                setCitySelected(false);
                setFormData((prev) => ({ ...prev, address: '', postalCode: '' }));
              } else {
                if (cityValue.length >= 2) {
                  setCitySelected(true);
                  if (googleLoaded && cityAutocompleteRef.current) {
                    setTimeout(() => initializeCityAutocomplete(), 50);
                  }
                }
              }
            }}
            onFocus={() => {
              if (googleLoaded && cityAutocompleteRef.current) {
                setTimeout(() => initializeCityAutocomplete(), 50);
              }
            }}
            required
            autoComplete="off"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            ref={addressAutocompleteRef}
            id="address"
            type="text"
            placeholder={citySelected ? "Start typing an address in " + formData.city + ", Italy..." : "Please enter a city name first"}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            disabled={!citySelected}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              !citySelected ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code (CAP)
          </label>
          <input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            placeholder="Will be auto-filled when you select an address"
          />
        </div>

        {formData.latitude && formData.longitude && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Location verified:</span> {formData.city}, Italy
            </p>
            <p className="text-xs text-blue-700 mt-1">
              <span className="font-medium">CAP:</span> {formData.postalCode || 'Not available'}
            </p>
            <a
              href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
            >
              View on Google Maps →
            </a>
          </div>
        )}

        {user?.role !== 'owner' && (
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
              Owner *
            </label>
            <select
              id="owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select owner</option>
              {owners.map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Apartment Specifications */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Apartment Specifications</h2>
          
          {/* Bathrooms */}
          <div className="mb-4">
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Bathrooms
          </label>
          <input
              id="bathrooms"
              type="number"
              min="0"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              placeholder="e.g., 2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Salon */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salon (Living Room)
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.salon.hasSofaBed}
                  onChange={(e) => setFormData({
                    ...formData,
                    salon: { ...formData.salon, hasSofaBed: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Has Sofa Bed</span>
              </label>
              {formData.salon.hasSofaBed && (
                <div className="ml-6">
                  <label className="block text-sm text-gray-600 mb-1">Sofa Bed Capacity</label>
                  <select
                    value={formData.salon.sofaBedCapacity}
                    onChange={(e) => setFormData({
                      ...formData,
                      salon: { ...formData.salon, sofaBedCapacity: parseInt(e.target.value) as 1 | 2 }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="1">1 person</option>
                    <option value="2">2 persons</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  bedrooms: [...formData.bedrooms, { beds: [] }]
                })}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Bedroom
              </button>
            </div>
            {formData.bedrooms.map((bedroom, bedroomIndex) => (
              <div key={bedroomIndex} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Bedroom {bedroomIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newBedrooms = [...formData.bedrooms];
                      newBedrooms.splice(bedroomIndex, 1);
                      setFormData({ ...formData, bedrooms: newBedrooms });
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  {bedroom.beds.map((bed, bedIndex) => (
                    <div key={bedIndex} className="flex items-center gap-2">
                      <select
                        value={bed.type}
                        onChange={(e) => {
                          const newBedrooms = [...formData.bedrooms];
                          newBedrooms[bedroomIndex].beds[bedIndex].type = e.target.value as any;
                          setFormData({ ...formData, bedrooms: newBedrooms });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="queen">Queen Bed (2 persons)</option>
                        <option value="single">Single Bed (1 person)</option>
                        <option value="sofa_bed_1">Sofa Bed (1 person)</option>
                        <option value="sofa_bed_2">Sofa Bed (2 persons)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const newBedrooms = [...formData.bedrooms];
                          newBedrooms[bedroomIndex].beds.splice(bedIndex, 1);
                          setFormData({ ...formData, bedrooms: newBedrooms });
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newBedrooms = [...formData.bedrooms];
                      newBedrooms[bedroomIndex].beds.push({ type: 'single' });
                      setFormData({ ...formData, bedrooms: newBedrooms });
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add Bed
                  </button>
                </div>
              </div>
            ))}
            {formData.bedrooms.length === 0 && (
              <p className="text-sm text-gray-500 italic">No bedrooms added yet. Click "Add Bedroom" to start.</p>
            )}
          </div>

          {/* Calculated Max Capacity */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Capacity
            </label>
            <div className="text-2xl font-bold text-blue-700">
              {calculatedMaxCapacity > 0 ? calculatedMaxCapacity : 'Not calculated'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              This is automatically calculated based on the beds you've specified above.
            </p>
          </div>

          {/* Cleaning Time - Admin Only */}
          {user?.role === 'admin' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Cleaning Time (Admin Only)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">
                    {formData.cleaningTime !== null
                      ? `${Math.floor(formData.cleaningTime / 60)}h ${formData.cleaningTime % 60}m`
                      : 'Not set'}
                  </div>
                  <input
            type="number"
                    min="0"
                    step="30"
                    value={formData.cleaningTime || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      cleaningTime: e.target.value ? parseInt(e.target.value) : null
                    })}
                    placeholder="Minutes (e.g., 210 for 3h 30m)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    cleaningTime: (formData.cleaningTime || 0) + 30
                  })}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  title="Add 30 minutes"
                >
                  +30 min
                </button>
                {formData.cleaningTime !== null && formData.cleaningTime >= 30 && (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      cleaningTime: Math.max(0, formData.cleaningTime! - 30)
                    })}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    title="Remove 30 minutes"
                  >
                    -30 min
                  </button>
                )}
                {formData.cleaningTime !== null && (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      cleaningTime: null
                    })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    title="Clear"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                When creating a shift for this apartment, the end time will be automatically calculated from the start time.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Updating...' : 'Update Apartment'}
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
