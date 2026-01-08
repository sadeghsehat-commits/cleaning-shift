import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';
import Apartment from '@/models/Apartment';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    // Import models to ensure they're registered with mongoose
    const ApartmentModel = (await import('@/models/Apartment')).default;
    const UserModel = (await import('@/models/User')).default;
    
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can access reports
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    
    // Default to current month if not specified
    let selectedDate: Date;
    if (monthParam) {
      // Parse YYYY-MM format correctly
      const [year, month] = monthParam.split('-').map(Number);
      selectedDate = new Date(year, month - 1, 1); // month is 0-indexed
    } else {
      selectedDate = new Date();
    }
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);

    // Get all operators
    const operators = await User.find({ role: 'operator' })
      .select('name email _id')
      .sort({ name: 1 });

    // Get all completed shifts for the month
    const shifts = await CleaningShift.find({
      scheduledDate: { $gte: startDate, $lte: endDate },
      status: 'completed',
    })
      .populate('apartment', 'name address')
      .populate('cleaner', 'name email')
      .sort({ scheduledDate: 1, scheduledStartTime: 1 });

    // Filter out shifts with null apartments or cleaners
    const validShifts = shifts.filter(
      (shift: any) => shift.apartment && shift.cleaner
    );

    // Group shifts by operator
    const reportData = operators.map((operator) => {
      const operatorShifts = validShifts.filter(
        (shift: any) => shift.cleaner._id.toString() === operator._id.toString()
      );

      // Group by apartment
      const apartmentGroups: { [key: string]: any[] } = {};
      const daysWorked = new Set<string>();

      operatorShifts.forEach((shift: any) => {
        const apartmentId = shift.apartment._id.toString();
        const apartmentName = shift.apartment.name;
        const key = `${apartmentId}|${apartmentName}`;

        if (!apartmentGroups[key]) {
          apartmentGroups[key] = [];
        }
        apartmentGroups[key].push(shift);

        // Track days worked
        const dayKey = format(new Date(shift.scheduledDate), 'yyyy-MM-dd');
        daysWorked.add(dayKey);
      });

      // Format apartment data
      const apartments = Object.entries(apartmentGroups).map(([key, shifts]) => {
        const [apartmentId, apartmentName] = key.split('|');
        const firstShift = shifts[0];
        return {
          id: apartmentId,
          name: apartmentName,
          address: firstShift.apartment.address,
          shiftCount: shifts.length,
          shifts: shifts.map((shift: any) => ({
            date: format(new Date(shift.scheduledDate), 'yyyy-MM-dd'),
            dateFormatted: format(new Date(shift.scheduledDate), 'dd/MM/yyyy'),
            startTime: shift.scheduledStartTime
              ? format(new Date(shift.scheduledStartTime), 'HH:mm')
              : '',
            endTime: shift.scheduledEndTime
              ? format(new Date(shift.scheduledEndTime), 'HH:mm')
              : '',
          })),
        };
      });

      return {
        operatorId: operator._id.toString(),
        operatorName: operator.name,
        operatorEmail: operator.email,
        totalShifts: operatorShifts.length,
        daysWorked: Array.from(daysWorked).sort(),
        daysWorkedCount: daysWorked.size,
        apartments,
      };
    });

    return NextResponse.json({
      month: format(selectedDate, 'yyyy-MM'),
      monthFormatted: format(selectedDate, 'MMMM yyyy'),
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      operators: reportData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}

