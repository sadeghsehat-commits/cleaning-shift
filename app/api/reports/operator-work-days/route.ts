import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import UnavailabilityRequest from '@/models/UnavailabilityRequest';
import User from '@/models/User';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isWithinInterval } from 'date-fns';
import { getCurrentUser } from '@/lib/auth';

// GET - Get operator work days report
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view reports
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period'); // 'week' or 'month'
    const dateStr = searchParams.get('date'); // Date string for the period

    if (!period || !['week', 'month'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period. Must be "week" or "month"' }, { status: 400 });
    }

    if (!dateStr) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const date = new Date(dateStr);
    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      startDate = startOfWeek(date, { weekStartsOn: 1 }); // Monday
      endDate = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    } else {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    }

    // Get all operators
    const operators = await User.find({ role: 'operator' }).select('_id name email').lean();

    // Get all shifts in the period
    const shifts = await CleaningShift.find({
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $ne: 'cancelled' },
    })
      .populate('cleaner', 'name email _id')
      .lean();

    // Get all approved unavailability requests in the period
    const unavailabilityRequests = await UnavailabilityRequest.find({
      status: 'approved',
      dates: {
        $elemMatch: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    })
      .populate('operator', 'name email _id')
      .lean();

    // Build report for each operator
    const report = operators.map((operator) => {
      const operatorShifts = shifts.filter(
        (shift: any) => shift.cleaner && (shift.cleaner._id?.toString() === operator._id.toString() || shift.cleaner.toString() === operator._id.toString())
      );

      // Count unique work days
      const workDaysSet = new Set<string>();
      operatorShifts.forEach((shift: any) => {
        const shiftDate = new Date(shift.scheduledDate);
        const dateKey = format(shiftDate, 'yyyy-MM-dd');
        workDaysSet.add(dateKey);
      });
      const workDaysCount = workDaysSet.size;

      // Count unavailable days by reason
      const operatorUnavailability = unavailabilityRequests.filter(
        (req: any) => req.operator && (req.operator._id?.toString() === operator._id.toString() || req.operator.toString() === operator._id.toString())
      );

      const unavailableDaysByReason: Record<string, number> = {
        Malattia: 0,
        Ferie: 0,
        Permesso: 0,
      };

      const periodDays = eachDayOfInterval({ start: startDate, end: endDate });
      operatorUnavailability.forEach((req: any) => {
        req.dates.forEach((dateStr: string) => {
          const unavDate = new Date(dateStr);
          if (isWithinInterval(unavDate, { start: startDate, end: endDate })) {
            const reason = req.reason || 'Unknown';
            if (unavailableDaysByReason.hasOwnProperty(reason)) {
              unavailableDaysByReason[reason]++;
            }
          }
        });
      });

      const totalUnavailableDays = unavailableDaysByReason.Malattia + unavailableDaysByReason.Ferie + unavailableDaysByReason.Permesso;
      const totalDaysInPeriod = periodDays.length;
      const availableDays = totalDaysInPeriod - totalUnavailableDays - workDaysCount;

      return {
        operator: {
          _id: operator._id,
          name: operator.name,
          email: operator.email,
        },
        workDaysCount,
        unavailableDaysByReason,
        totalUnavailableDays,
        totalDaysInPeriod,
        availableDays,
        shiftsCount: operatorShifts.length,
      };
    });

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      report,
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}


