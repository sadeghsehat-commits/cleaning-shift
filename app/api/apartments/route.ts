import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Apartment from '@/models/Apartment';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Operators cannot access apartments
    if (user.role === 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let query: any = {};

    // Owners can only see their own apartments
    if (user.role === 'owner') {
      query.owner = user._id;
    }
    // Admins should see all apartments (no query filter)

    let apartments = await Apartment.find(query)
      .populate('owner', 'name email phone')
      .lean()
      .sort({ name: 1 });

    // For admins, sort by owner (owners with more apartments first) then by name within each owner group
    if (user.role === 'admin' && apartments.length > 0) {
      // Group apartments by owner
      const apartmentsByOwner = new Map<string, any[]>();
      
      apartments.forEach((apt: any) => {
        const ownerId = apt.owner 
          ? (typeof apt.owner === 'object' && apt.owner._id ? apt.owner._id.toString() : apt.owner.toString())
          : 'no-owner';
        
        if (!apartmentsByOwner.has(ownerId)) {
          apartmentsByOwner.set(ownerId, []);
        }
        apartmentsByOwner.get(ownerId)!.push(apt);
      });

      // Sort apartments within each owner group by name
      apartmentsByOwner.forEach((apts) => {
        apts.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Convert Map to Array and sort by number of apartments (descending), then by owner name
      const ownerGroups = Array.from(apartmentsByOwner.entries())
        .map(([ownerId, apts]) => ({
          ownerId,
          apartments: apts,
          count: apts.length,
          ownerName: apts[0].owner && typeof apts[0].owner === 'object' 
            ? apts[0].owner.name || ''
            : '',
        }))
        .sort((a, b) => {
          // First sort by count (descending - more apartments first)
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          // If same count, sort by owner name
          return a.ownerName.localeCompare(b.ownerName);
        });

      // Flatten back to single array
      apartments = ownerGroups.flatMap(group => group.apartments);
    }

    return NextResponse.json({ apartments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch apartments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Operators cannot create apartments
    if (!['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only admin can set cleaningTime
    if (cleaningTime !== undefined && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can set cleaning time' }, { status: 403 });
    }

    const { name, address, street, city, postalCode, country, latitude, longitude, description, maxCapacity, owner, bathrooms, salon, bedrooms, cleaningTime } = await request.json();

    if (!name || !address) {
      return NextResponse.json({ error: 'Name and address are required' }, { status: 400 });
    }

    // Owners can only create apartments for themselves
    const ownerId = user.role === 'owner' ? user._id : owner || user._id;

    // Calculate max capacity from beds if not provided
    let finalMaxCapacity = maxCapacity ? parseInt(maxCapacity) : undefined;
    if (!finalMaxCapacity && (bedrooms || salon?.hasSofaBed)) {
      let calculated = 0;
      if (bedrooms && Array.isArray(bedrooms)) {
        bedrooms.forEach((bedroom: any) => {
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
      if (salon?.hasSofaBed && salon.sofaBedCapacity) {
        calculated += salon.sofaBedCapacity;
      }
      if (calculated > 0) {
        finalMaxCapacity = calculated;
      }
    }

    const apartment = new Apartment({
      name,
      address,
      street,
      city,
      postalCode,
      country: country || 'Italy',
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      owner: ownerId,
      description,
      maxCapacity: finalMaxCapacity,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      salon: salon?.hasSofaBed ? salon : undefined,
      bedrooms: bedrooms && Array.isArray(bedrooms) && bedrooms.length > 0 ? bedrooms : undefined,
      cleaningTime: cleaningTime !== undefined ? (cleaningTime === null ? null : parseInt(cleaningTime)) : null,
    });
    
    await apartment.save();

    const populatedApartment = await Apartment.findById(apartment._id)
      .populate('owner', 'name email phone');

    return NextResponse.json({ apartment: populatedApartment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create apartment' }, { status: 500 });
  }
}

