import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Apartment from '@/models/Apartment';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const apartment = await Apartment.findById(id).populate('owner', 'name email phone');

    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
    }

    // Owners can only see their own apartments
    if (user.role === 'owner') {
      let ownerId: string;
      if (apartment.owner && typeof apartment.owner === 'object' && '_id' in apartment.owner) {
        ownerId = (apartment.owner as any)._id.toString();
      } else if (apartment.owner) {
        ownerId = typeof apartment.owner === 'string' 
          ? apartment.owner 
          : (apartment.owner as any).toString();
      } else {
        return NextResponse.json({ error: 'Apartment has no owner' }, { status: 400 });
      }
      
      const userId = user._id.toString();
      if (ownerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only view your own apartments' }, { status: 403 });
      }
    }

    return NextResponse.json({ apartment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch apartment' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
    }

    // Owners can only edit their own apartments
    if (user.role === 'owner') {
      const ownerId = (apartment.owner as any).toString();
      const userId = user._id.toString();
      if (ownerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only edit your own apartments' }, { status: 403 });
      }
    }

    // Only admin and owners can edit
    if (!['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, address, street, city, postalCode, country, latitude, longitude, description, maxCapacity, bathrooms, salon, bedrooms } = await request.json();

    if (name) apartment.name = name;
    if (address) apartment.address = address;
    if (street !== undefined) apartment.street = street;
    if (city !== undefined) apartment.city = city;
    if (postalCode !== undefined) apartment.postalCode = postalCode;
    if (country !== undefined) apartment.country = country;
    if (latitude !== undefined) apartment.latitude = latitude;
    if (longitude !== undefined) apartment.longitude = longitude;
    if (description !== undefined) apartment.description = description;
    if (bathrooms !== undefined) apartment.bathrooms = bathrooms;
    if (salon !== undefined) apartment.salon = salon;
    if (bedrooms !== undefined) apartment.bedrooms = bedrooms;
    
    // Calculate max capacity from beds if not provided
    let finalMaxCapacity = maxCapacity !== undefined ? maxCapacity : apartment.maxCapacity;
    if (!finalMaxCapacity && (bedrooms || salon?.hasSofaBed)) {
      let calculated = 0;
      const bedsToCheck = bedrooms || apartment.bedrooms;
      const salonToCheck = salon !== undefined ? salon : apartment.salon;
      
      if (bedsToCheck && Array.isArray(bedsToCheck)) {
        bedsToCheck.forEach((bedroom: any) => {
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
      if (salonToCheck?.hasSofaBed && salonToCheck.sofaBedCapacity) {
        calculated += salonToCheck.sofaBedCapacity;
      }
      if (calculated > 0) {
        finalMaxCapacity = calculated;
      }
    }
    
    if (finalMaxCapacity !== undefined) {
      apartment.maxCapacity = finalMaxCapacity;
    }

    await apartment.save();

    const populatedApartment = await Apartment.findById(apartment._id)
      .populate('owner', 'name email phone');

    return NextResponse.json({ apartment: populatedApartment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update apartment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });
    }

    // Owners can only delete their own apartments
    if (user.role === 'owner') {
      const ownerId = (apartment.owner as any).toString();
      const userId = user._id.toString();
      if (ownerId !== userId) {
        return NextResponse.json({ error: 'Forbidden: You can only delete your own apartments' }, { status: 403 });
      }
    }

    // Only admin and owners can delete
    if (!['admin', 'owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Apartment.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Apartment deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete apartment' }, { status: 500 });
  }
}

