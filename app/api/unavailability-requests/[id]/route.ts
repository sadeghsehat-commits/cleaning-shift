import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UnavailabilityRequest from '@/models/UnavailabilityRequest';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';

// PATCH - Approve or reject an unavailability request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can approve/reject requests
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins can review requests' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be "approved" or "rejected"' }, { status: 400 });
    }

    const unavailabilityRequest = await UnavailabilityRequest.findById(id)
      .populate('operator', 'name email');

    if (!unavailabilityRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (unavailabilityRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request has already been reviewed' }, { status: 400 });
    }

    unavailabilityRequest.status = status;
    unavailabilityRequest.reviewedBy = user._id;
    unavailabilityRequest.reviewedAt = new Date();
    await unavailabilityRequest.save();

    // Notify the operator
    const operatorName = (unavailabilityRequest.operator as any)?.name || 'Operator';
    const dateCount = unavailabilityRequest.dates.length;
    const dateText = dateCount === 1 ? 'day' : 'days';
    const statusText = status === 'approved' ? 'approved' : 'rejected';

    await Notification.create({
      user: unavailabilityRequest.operator._id,
      type: 'unavailability_request_reviewed',
      title: `Unavailability Request ${statusText === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your request to be unavailable for ${dateCount} ${dateText} has been ${statusText}.`,
    });

    const populated = await UnavailabilityRequest.findById(id)
      .populate('operator', 'name email')
      .populate('reviewedBy', 'name')
      .lean();

    return NextResponse.json({ request: populated });
  } catch (error: any) {
    console.error('Error updating unavailability request:', error);
    return NextResponse.json({ error: error.message || 'Failed to update request' }, { status: 500 });
  }
}

// DELETE - Delete an unavailability request (only by the operator who created it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const unavailabilityRequest = await UnavailabilityRequest.findById(id);

    if (!unavailabilityRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only the operator who created it or an admin can delete it
    if (user.role !== 'admin' && unavailabilityRequest.operator.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only pending requests can be deleted
    if (unavailabilityRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending requests can be deleted' }, { status: 400 });
    }

    await UnavailabilityRequest.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting unavailability request:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete request' }, { status: 500 });
  }
}

