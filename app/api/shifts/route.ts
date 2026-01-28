import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    void Apartment;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const cleanerId = searchParams.get('cleanerId');
    const apartmentId = searchParams.get('apartmentId');

    let query: Record<string, unknown> = {};

    if (apartmentId) {
      if (user.role === 'admin') {
        query.apartment = apartmentId;
      } else if (user.role === 'owner') {
        const apartment = await Apartment.findById(apartmentId);
        if (apartment && apartment.owner.toString() === user._id.toString()) {
          query.apartment = apartmentId;
        } else {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (user.role === 'operator') {
      query.cleaner = user._id;
    } else if (cleanerId && user.role === 'admin') {
      query.cleaner = cleanerId;
    }

    if (user.role === 'owner' && !apartmentId) {
      const apartments = await Apartment.find({ owner: user._id }).select('_id').lean();
      if (apartments.length === 0) {
        return NextResponse.json({ shifts: [] });
      }
      query.apartment = { $in: apartments.map((a: { _id: unknown }) => a._id) };
    }

    if (month) {
      const monthDate = new Date(month);
      query.scheduledDate = { $gte: startOfMonth(monthDate), $lte: endOfMonth(monthDate) };
    }

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (month) {
        const monthDate = new Date(month);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        (query as any).scheduledDate = {
          $gte: start > monthStart ? start : monthStart,
          $lte: end < monthEnd ? end : monthEnd,
        };
      } else {
        (query as any).scheduledDate = { $gte: start, $lte: end };
      }
    } else if (startDate) {
      const start = new Date(startDate);
      (query as any).scheduledDate = month
        ? { $gte: start > startOfMonth(new Date(month)) ? start : startOfMonth(new Date(month)), $lte: endOfMonth(new Date(month)) }
        : { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      (query as any).scheduledDate = month
        ? { $gte: startOfMonth(new Date(month)), $lte: end < endOfMonth(new Date(month)) ? end : endOfMonth(new Date(month)) }
        : { $lte: end };
    }

    const statusFilter = searchParams.get('status');
    if (statusFilter) (query as any).status = statusFilter;

    const excludeCompleted = searchParams.get('excludeCompleted') === 'true';
    if (excludeCompleted && !statusFilter) (query as any).status = { $ne: 'completed' };

    const apartmentFields = (user.role === 'admin' || user.role === 'owner') ? 'name address owner howToEnterDescription howToEnterPhotos' : 'name address';
    let shifts = await CleaningShift.find(query)
      .populate('apartment', apartmentFields)
      .populate('cleaner', 'name email phone')
      .populate('createdBy', 'name role')
      .sort({ scheduledDate: 1, scheduledStartTime: 1 });

    if (user.role === 'admin' || user.role === 'owner') {
      shifts = await CleaningShift.populate(shifts, { path: 'apartment.owner', select: 'name email' });
    }

    shifts = shifts.filter((s: any) => s.apartment != null);

    if (excludeCompleted && statusFilter !== 'completed') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      shifts = shifts.filter((s: any) => {
        if (s.status === 'in_progress') return true;
        const sd = new Date(s.scheduledDate);
        const sdOnly = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
        if (sdOnly.getTime() === today.getTime()) return true;
        const st = new Date(s.scheduledStartTime);
        const dt = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), st.getHours(), st.getMinutes(), 0, 0);
        return dt >= now;
      });
    }

    const statusPriority: Record<string, number> = { scheduled: 1, in_progress: 2, cancelled: 3, completed: 4 };
    const sorted = [...shifts].sort((a: any, b: any) => {
      const pa = statusPriority[a.status] ?? 99;
      const pb = statusPriority[b.status] ?? 99;
      if (pa !== pb) return pa - pb;
      const da = new Date(a.scheduledDate).getTime();
      const db = new Date(b.scheduledDate).getTime();
      if (da !== db) return da - db;
      return new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime();
    });

    return NextResponse.json({ shifts: sorted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only administrators can create shifts' }, { status: 403 });
    }

    const { apartment, cleaner, scheduledDate, scheduledStartTime, scheduledEndTime, notes, guestCount } = await request.json();
    if (!apartment || !cleaner || !scheduledDate || !scheduledStartTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shiftDate = new Date(scheduledDate);
    const dateOnly = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate());
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingApartment = await CleaningShift.findOne({
      apartment,
      scheduledDate: { $gte: dateOnly, $lt: nextDay },
      status: { $ne: 'cancelled' },
    });
    if (existingApartment) {
      return NextResponse.json({ error: 'This apartment already has a shift scheduled for this date.' }, { status: 400 });
    }

    const existingOperator = await CleaningShift.find({
      cleaner,
      scheduledDate: { $gte: dateOnly, $lt: nextDay },
      status: { $ne: 'cancelled' },
    });
    if (existingOperator.length >= 3) {
      return NextResponse.json({ error: 'This operator already has 3 shifts on this date.' }, { status: 400 });
    }

    const newStart = new Date(scheduledStartTime);
    const newEnd = scheduledEndTime ? new Date(scheduledEndTime) : new Date(newStart.getTime() + 90 * 60 * 1000);
    const newStartDt = new Date(dateOnly);
    newStartDt.setHours(newStart.getHours(), newStart.getMinutes(), 0, 0);
    const newEndDt = new Date(dateOnly);
    newEndDt.setHours(newEnd.getHours(), newEnd.getMinutes(), 0, 0);

    for (const ex of existingOperator) {
      const es = new Date(ex.scheduledStartTime);
      const ee = ex.scheduledEndTime ? new Date(ex.scheduledEndTime) : new Date(es.getTime() + 90 * 60 * 1000);
      const esDt = new Date(dateOnly);
      esDt.setHours(es.getHours(), es.getMinutes(), 0, 0);
      const eeDt = new Date(dateOnly);
      eeDt.setHours(ee.getHours(), ee.getMinutes(), 0, 0);
      const gapBefore = (newStartDt.getTime() - eeDt.getTime()) / (1000 * 60);
      const gapAfter = (esDt.getTime() - newEndDt.getTime()) / (1000 * 60);
      if ((gapBefore < 90 && gapBefore > -90) || (gapAfter < 90 && gapAfter > -90)) {
        return NextResponse.json({ error: 'Shifts must be at least 90 minutes apart.' }, { status: 400 });
      }
    }

    const shift = await CleaningShift.create({
      apartment,
      cleaner,
      scheduledDate: new Date(scheduledDate),
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : undefined,
      notes,
      guestCount,
      createdBy: user._id,
      status: 'scheduled',
      confirmedSeen: { confirmed: false },
    });

    const populated = await CleaningShift.findById(shift._id)
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email phone');

    await Notification.create({
      user: cleaner,
      type: 'shift_assigned',
      title: 'TOP UP',
      message: 'You have been assigned a new cleaning shift.',
      relatedShift: shift._id,
    });

    return NextResponse.json({ shift: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create shift' }, { status: 500 });
  }
}
