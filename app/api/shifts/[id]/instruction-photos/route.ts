import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

// Add instruction photo (owner/admin only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owners and admins can add instruction photos
    if (user.role !== 'owner' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'owner')
      .populate('cleaner', 'name email');
    
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Owners can only add photos to their own apartment shifts
    if (user.role === 'owner') {
      const apartment = shift.apartment as any;
      if (apartment.owner.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const { url, description } = await request.json();

    console.log('Received instruction photo request:', {
      urlLength: url?.length || 0,
      urlPrefix: url?.substring(0, 50) || 'no url',
      description: description || 'no description',
    });

    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.error('Missing or invalid URL');
      return NextResponse.json({ error: 'Photo URL is required' }, { status: 400 });
    }

    // Validate base64 format
    if (!url.startsWith('data:image/')) {
      console.error('Invalid image format:', url.substring(0, 50));
      return NextResponse.json({ error: 'Invalid image format. Please upload a valid image.' }, { status: 400 });
    }

    // Check if base64 string is too long (MongoDB has a 16MB document limit)
    // Base64 images can be large, so we'll limit to ~5MB to be safe
    const base64Length = url.length;
    const maxLength = 5 * 1024 * 1024; // 5MB in characters (base64 is ~33% larger than binary)
    
    console.log('Image size check:', {
      base64Length,
      maxLength,
      isTooLarge: base64Length > maxLength,
    });
    
    if (base64Length > maxLength) {
      const fileSizeMB = (base64Length / (1024 * 1024)).toFixed(2);
      console.error('Image too large:', fileSizeMB, 'MB');
      return NextResponse.json({ 
        error: `Image is too large (${fileSizeMB}MB). Please use a smaller image (max ~3MB file size).` 
      }, { status: 400 });
    }

    if (!shift.instructionPhotos) {
      shift.instructionPhotos = [];
    }

    try {
      console.log('Attempting to save instruction photo...');
      shift.instructionPhotos.push({
        uploadedBy: user._id,
        uploadedAt: new Date(),
        url: url.trim(),
        description: description || '',
      });

      await shift.save();
      console.log('Instruction photo saved successfully');
    } catch (error: any) {
      console.error('Error saving instruction photo:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        code: error.code,
      });
      
      if (error.message?.includes('too large') || error.message?.includes('maximum') || error.message?.includes('BSON')) {
        return NextResponse.json({ 
          error: 'Image is too large for database. Please compress the image and try again (max ~3MB file size).' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: error.message || 'Failed to save instruction photo. Please try again with a smaller image.' 
      }, { status: 500 });
    }

    // Notify operator (don't fail if notification fails)
    try {
      const cleaner = shift.cleaner as any;
      if (cleaner) {
        await Notification.create({
          user: cleaner._id,
          type: 'instruction_photo_added',
          title: 'New Instruction Photo',
          message: `A new instruction photo has been added for your shift${description ? ': ' + description : ''}`,
          relatedShift: shift._id,
        });
        console.log('Notification sent successfully');
      }
    } catch (notificationError: any) {
      console.error('Error sending notification (non-critical):', notificationError);
      // Don't fail the request if notification fails - photo is already saved
    }

    return NextResponse.json({ shift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add instruction photo' }, { status: 500 });
  }
}

// Get instruction photos
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id);
    
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    return NextResponse.json({ photos: shift.instructionPhotos || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to get instruction photos' }, { status: 500 });
  }
}

