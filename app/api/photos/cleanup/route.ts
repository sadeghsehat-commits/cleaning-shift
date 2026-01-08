import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CleaningShift from '@/models/CleaningShift';

// Cleanup photos at end of day (delete all photos for shifts of previous days)
// Photos for shifts scheduled for today will be deleted at midnight (end of today)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get today's date at 00:00 (midnight) - this is the cutoff
    // All photos for shifts with scheduledDate before today will be deleted
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    
    // Find all shifts that have photos and are scheduled for previous days (before today)
    const shifts = await CleaningShift.find({
      scheduledDate: { $lt: today },
      $or: [
        { 'problems.photos': { $exists: true, $ne: [] } },
        { 'instructionPhotos': { $exists: true, $ne: [] } },
      ],
    });

    let cleanedCount = 0;
    let shiftsUpdated = 0;

    for (const shift of shifts) {
      let updated = false;

      // Clean up problem photos (delete all photos for shifts of previous days)
      if (shift.problems && shift.problems.length > 0) {
        for (const problem of shift.problems) {
          if (problem.photos && problem.photos.length > 0) {
            const originalLength = problem.photos.length;
            problem.photos = [];
            updated = true;
            cleanedCount += originalLength;
          }
        }
      }

      // Clean up instruction photos (delete all photos for shifts of previous days)
      if (shift.instructionPhotos && shift.instructionPhotos.length > 0) {
        const originalLength = shift.instructionPhotos.length;
        shift.instructionPhotos = [];
        updated = true;
        cleanedCount += originalLength;
      }

      if (updated) {
        await shift.save();
        shiftsUpdated++;
      }
    }

    return NextResponse.json({
      message: 'Photo cleanup completed - deleted all photos for shifts of previous days',
      cleanedCount,
      shiftsProcessed: shifts.length,
      shiftsUpdated,
      cutoffDate: today.toISOString(),
    });
  } catch (error: any) {
    console.error('Error cleaning up photos:', error);
    return NextResponse.json({ error: error.message || 'Failed to cleanup photos' }, { status: 500 });
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}

