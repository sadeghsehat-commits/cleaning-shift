import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { sendFCMNotification } from '@/lib/fcm-notifications';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only operators can report problems
    if (user.role !== 'operator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const shift = await CleaningShift.findById(id)
      .populate('apartment', 'owner');
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    const { description, type, photos } = await request.json();

    if (!description || !type) {
      return NextResponse.json({ error: 'Description and type are required' }, { status: 400 });
    }

    if (!shift.problems) {
      shift.problems = [];
    }

    const problemData: any = {
      reportedBy: user._id,
      reportedAt: new Date(),
      description,
      type,
      resolved: false,
    };

    // Add photos if provided
    if (photos && Array.isArray(photos) && photos.length > 0) {
      problemData.photos = photos.map((photoUrl: string) => ({
        url: photoUrl,
        uploadedAt: new Date(),
      }));
    }

    shift.problems.push(problemData);

    await shift.save();

    // Notify admin and owner
    const apartment = shift.apartment as any;
    const photoCount = photos && photos.length > 0 ? photos.length : 0;
    const photoText = photoCount > 0 ? ` with ${photoCount} photo${photoCount > 1 ? 's' : ''}` : '';
    
    if (apartment.owner) {
      let ownerId: string;
      if (typeof apartment.owner === 'object' && '_id' in apartment.owner) {
        ownerId = (apartment.owner as any)._id.toString();
      } else {
        ownerId = apartment.owner.toString();
      }

      await Notification.create({
        user: ownerId,
        type: 'problem_reported',
        title: 'Problem Reported',
        message: `A problem has been reported: ${description}${photoText}`,
        relatedShift: shift._id,
      });

      try {
        await sendFCMNotification(
          ownerId,
          'TOP UP - Problem Reported',
          `Operator reported: ${description}${photoText}`,
          {
            shiftId: shift._id.toString(),
            url: `/dashboard/shifts/details?id=${shift._id}`,
            type: 'problem_reported',
          }
        );
      } catch (notifError) {
        console.error('Error sending problem notification to owner:', notifError);
      }
    }

    const User = (await import('@/models/User')).default;
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'problem_reported',
        title: 'Problem Reported',
        message: `A problem has been reported: ${description}${photoText}`,
        relatedShift: shift._id,
      });
    }

    return NextResponse.json({ shift });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to report problem' }, { status: 500 });
  }
}

