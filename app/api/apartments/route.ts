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
    if (user.role === 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const query = user.role === 'owner' ? { owner: user._id } : {};
    let apartments = await Apartment.find(query)
      .populate('owner', 'name email phone')
      .lean()
      .sort({ name: 1 });

    if (user.role === 'admin' && apartments.length > 0) {
      const byOwner = new Map<string, any[]>();
      (apartments as any[]).forEach((apt: any) => {
        const ownerId = apt.owner
          ? (typeof apt.owner === 'object' && apt.owner._id ? apt.owner._id.toString() : String(apt.owner))
          : 'no-owner';
        if (!byOwner.has(ownerId)) byOwner.set(ownerId, []);
        byOwner.get(ownerId)!.push(apt);
      });
      byOwner.forEach((apts) => apts.sort((a, b) => a.name.localeCompare(b.name)));
      const groups = Array.from(byOwner.entries()).map(([ownerId, apts]) => ({
        ownerId,
        apartments: apts,
        count: apts.length,
        ownerName: apts[0]?.owner && typeof apts[0].owner === 'object' ? apts[0].owner.name || '' : '',
      }));
      groups.sort((a, b) => (b.count !== a.count ? b.count - a.count : a.ownerName.localeCompare(b.ownerName)));
      apartments = groups.flatMap((g) => g.apartments);
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
    if (!['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, address, street, city, postalCode, country, latitude, longitude, description, maxCapacity, owner, bathrooms, salon, bedrooms } = await request.json();
    if (!name || !address) {
      return NextResponse.json({ error: 'Name and address are required' }, { status: 400 });
    }

    const ownerId = user.role === 'owner' ? user._id : owner || user._id;
    let finalMaxCapacity = maxCapacity ? parseInt(String(maxCapacity)) : undefined;
    if (!finalMaxCapacity && (bedrooms || salon?.hasSofaBed)) {
      let calculated = 0;
      if (Array.isArray(bedrooms)) {
        bedrooms.forEach((br: any) => {
          if (Array.isArray(br?.beds)) {
            br.beds.forEach((bed: any) => {
              if (bed.type === 'queen') calculated += 2;
              else if (bed.type === 'single' || bed.type === 'sofa_bed_1') calculated += 1;
              else if (bed.type === 'sofa_bed_2') calculated += 2;
            });
          }
        });
      }
      if (salon?.hasSofaBed && salon.sofaBedCapacity) calculated += salon.sofaBedCapacity;
      if (calculated > 0) finalMaxCapacity = calculated;
    }

    const apartment = new Apartment({
      name,
      address,
      street,
      city,
      postalCode,
      country: country || 'Italy',
      latitude: latitude != null ? parseFloat(String(latitude)) : undefined,
      longitude: longitude != null ? parseFloat(String(longitude)) : undefined,
      owner: ownerId,
      description,
      maxCapacity: finalMaxCapacity,
      bathrooms: bathrooms != null ? parseInt(String(bathrooms)) : undefined,
      salon: salon?.hasSofaBed ? salon : undefined,
      bedrooms: Array.isArray(bedrooms) && bedrooms.length > 0 ? bedrooms : undefined,
    });
    await apartment.save();

    const populated = await Apartment.findById(apartment._id).populate('owner', 'name email phone');
    return NextResponse.json({ apartment: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create apartment' }, { status: 500 });
  }
}
