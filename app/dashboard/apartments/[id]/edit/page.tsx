'use client';

// Required for static export
export async function generateStaticParams() {
  return []; // Empty array - pages will be generated client-side
}

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  maxCapacity?: number;
  bathrooms?: number;
  salon?: {
    hasSofaBed: boolean;
    sofaBedCapacity: 1 | 2;
  };
  bedrooms?: Array<{
    beds: Array<{ type: 'queen' | 'single' | 'sofa_bed_1' | 'sofa_bed_2' }>;
  }>;
  calculatedMaxCapacity?: number;
  owner: { _id: string; name: string; email: string };
}

export default function EditApartmentPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Italy', // Always Italy
    latitude: '',
    longitude: '',
    description: '',
    bathrooms: '',
    salon: {
      hasSofaBed: false,
      sofaBedCapacity: 1 as 1 | 2,
    },
    bedrooms: [] as Array<{ beds: Array<{ type: 'queen' | 'single' | 'sofa_bed_1' | 'sofa_bed_2' }> }>,
  });
  const [calculatedMaxCapacity, setCalculatedMaxCapacity] = useState<number>(0);
  const cityAutocompleteRef = useRef<HTMLInputElement>(null);
  const addressAutocompleteRef = useRef<HTMLInputElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [citySelected, setCitySelected] = useState(false);

  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkAuth();
    // Check if API key is available (at runtime)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const hasKey = Boolean(apiKey && apiKey.trim() !== '');
    setHasApiKey(hasKey);
    if (hasKey) {
      loadGoogleMaps();
    } else {
      console.warn('Google Maps API key not found in environment variables');
    }
  }, []);

  const loadGoogleMaps = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Autocomplete will not work.');
      toast.error('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local');
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setGoogleLoaded(true);
      setTimeout(() => initializeCityAutocomplete(), 100);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkInterval);
          setGoogleLoaded(true);
          setTimeout(() => initializeCityAutocomplete(), 100);
        }
      }, 100);
      // Timeout after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait a bit for Google Maps to fully initialize
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogle);
          setGoogleLoaded(true);
          setTimeout(() => initializeCityAutocomplete(), 100);
        }
      }, 50);
      
      // Timeout after 5 seconds
      setTimeout(() => clearInterval(checkGoogle), 5000);
    };
    
    script.onerror = () => {
      toast.error('Failed to load Google Maps. Please check your API key and ensure Places API is enabled.');
      console.error('Google Maps script failed to load. Check API key and Places API enablement.');
    };
    
    document.head.appendChild(script);
  };

  const initializeCityAutocomplete = () => {
    if (!cityAutocompleteRef.current || !window.google?.maps?.places) {
      return;
    }

    // Don't re-initialize if already initialized
    if ((cityAutocompleteRef.current as any).autocomplete) {
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        cityAutocompleteRef.current,
        {
          types: ['(cities)'],
          fields: ['address_components', 'formatted_address', 'name'],
          componentRestrictions: { country: 'it' },
        } as any
      );

      // Store reference
      (cityAutocompleteRef.current as any).autocomplete = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        // Get city name from the place
        let city = '';
        
        // Try to get city from name (formatted address)
        if ((place as any).name) {
          city = (place as any).name;
        }
        
        // Also try to get from address components
        if (!city && place.address_components) {
          place.address_components.forEach((component) => {
            const types = component.types;
            if (types.includes('locality') || types.includes('administrative_area_level_3')) {
              city = component.long_name;
            }
          });
        }
        // Fallback: use formatted address
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
          // Initialize address autocomplete after city is selected
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

    // If Google Maps is not available, allow manual entry
    if (!window.google?.maps?.places) {
      console.warn('Google Maps Places API not available. Manual address entry will be used.');
      return;
    }

    // Clear previous autocomplete if exists
    if ((addressAutocompleteRef.current as any).autocomplete) {
      // Remove previous listener
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

      // Store reference for cleanup
      (addressAutocompleteRef.current as any).autocomplete = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          toast.error('No details available for this address');
          return;
        }

        // Extract address components
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

        // Use formatted address if available, otherwise construct from components
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
    if (googleLoaded && cityAutocompleteRef.current) {
      initializeCityAutocomplete();
    }
  }, [googleLoaded]);

  useEffect(() => {
    if (googleLoaded && citySelected && formData.city && addressAutocompleteRef.current) {
      initializeAddressAutocomplete();
    }
  }, [googleLoaded, citySelected, formData.city]);

  // Calculate max capacity based on beds
  useEffect(() => {
    let total = 0;
    
    // Count from bedrooms
    formData.bedrooms.forEach((bedroom) => {
      bedroom.beds.forEach((bed) => {
        switch (bed.type) {
          case 'queen':
            total += 2;
            break;
          case 'single':
            total += 1;
            break;
          case 'sofa_bed_1':
            total += 1;
            break;
          case 'sofa_bed_2':
            total += 2;
            break;
        }
      });
    });
    
    // Add salon sofa bed if exists
    if (formData.salon.hasSofaBed) {
      total += formData.salon.sofaBedCapacity;
    }
    
    setCalculatedMaxCapacity(total);
  }, [formData.bedrooms, formData.salon]);

  useEffect(() => {
    if (user && params.id) {
      fetchApartment();
    }
  }, [user, params.id]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Operators and viewers cannot edit apartments
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

  const fetchApartment = async () => {
    try {
      const response = await fetch(`/api/apartments/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setApartment(data.apartment);
        const apartmentData = data.apartment;
        setFormData({
          name: apartmentData.name,
          address: apartmentData.address || '',
          city: apartmentData.city || '',
          postalCode: apartmentData.postalCode || '',
          country: apartmentData.country || 'Italy',
          latitude: apartmentData.latitude?.toString() || '',
          longitude: apartmentData.longitude?.toString() || '',
          description: apartmentData.description || '',
          bathrooms: apartmentData.bathrooms?.toString() || '',
          salon: apartmentData.salon || { hasSofaBed: false, sofaBedCapacity: 1 },
          bedrooms: apartmentData.bedrooms || [],
        });
        // Set calculated capacity if available
        if (apartmentData.calculatedMaxCapacity) {
          setCalculatedMaxCapacity(apartmentData.calculatedMaxCapacity);
        } else if (apartmentData.bedrooms || apartmentData.salon?.hasSofaBed) {
          // Calculate on the fly if not stored
          let calculated = 0;
          if (apartmentData.bedrooms && Array.isArray(apartmentData.bedrooms)) {
            apartmentData.bedrooms.forEach((bedroom: any) => {
              if (bedroom.beds && Array.isArray(bedroom.beds)) {
                bedroom.beds.forEach((bed: any) => {
                  switch (bed.type) {
                    case 'queen':
                      calculated += 2;
                      break;
                    case 'single':
                      calculated += 1;
                      break;
                    case 'sofa_bed_1':
                      calculated += 1;
                      break;
                    case 'sofa_bed_2':
                      calculated += 2;
                      break;
                  }
                });
              }
            });
          }
          if (apartmentData.salon?.hasSofaBed && apartmentData.salon.sofaBedCapacity) {
            calculated += apartmentData.salon.sofaBedCapacity;
          }
          setCalculatedMaxCapacity(calculated);
        }
        // Set city as selected if it exists
        if (apartmentData.city) {
          setCitySelected(true);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 403) {
          toast.error('You do not have permission to view this apartment');
        } else if (response.status === 404) {
          toast.error('Apartment not found');
        } else {
          toast.error(errorData.error || 'Failed to load apartment');
        }
        router.push('/dashboard/apartments');
      }
    } catch (error) {
      toast.error('Failed to load apartment');
      router.push('/dashboard/apartments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare data for submission
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
      };

      // Use calculated capacity (will be calculated on the server if not provided)
      if (calculatedMaxCapacity > 0) {
        submitData.maxCapacity = calculatedMaxCapacity;
      }

      const response = await fetch(`/api/apartments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

  if (!apartment) {
    return <div className="text-center py-8">Apartment not found</div>;
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
            placeholder="Start typing a city name in Italy (e.g., Roma, Milano, Napoli)..."
            value={formData.city}
            onChange={(e) => {
              const cityValue = e.target.value;
              setFormData({ ...formData, city: cityValue });
              if (!cityValue) {
                setCitySelected(false);
                setFormData((prev) => ({ ...prev, address: '', postalCode: '' }));
              } else {
                // Enable address field if city has at least 2 characters
                if (cityValue.length >= 2) {
                  setCitySelected(true);
                  // Re-initialize autocomplete if Google Maps is loaded
                  if (googleLoaded && cityAutocompleteRef.current) {
                    setTimeout(() => initializeCityAutocomplete(), 50);
                  }
                }
              }
            }}
            onFocus={() => {
              // Re-initialize autocomplete when field is focused
              if (googleLoaded && cityAutocompleteRef.current) {
                setTimeout(() => initializeCityAutocomplete(), 50);
              }
            }}
            required
            autoComplete="off"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 
              ? 'Start typing to see city suggestions (e.g., type "R" for Roma, "M" for Milano), or type the city name manually'
              : '⚠️ Google Maps API key not configured. You can still type the city name manually, but autocomplete will not work. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local and restart the server. See GOOGLE_MAPS_SETUP.md for instructions.'
            }
          </p>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            ref={addressAutocompleteRef}
            id="address"
            type="text"
            placeholder={citySelected ? "Start typing an address in " + formData.city + ", Italy..." : "Please enter a city name first (at least 2 characters)"}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            disabled={!citySelected}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              !citySelected ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">
            {citySelected 
              ? (hasApiKey 
                  ? "Start typing to get address suggestions from Google Maps (Italy only)"
                  : "Address field will be enabled after entering a city name (at least 2 characters)")
              : "Address field will be enabled after entering a city name (at least 2 characters)"
            }
          </p>
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
          <p className="text-xs text-gray-500 mt-1">Automatically filled when you select an address</p>
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

