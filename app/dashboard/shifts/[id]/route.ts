// Route handler for static export compatibility
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // This is just for build compatibility
  // Actual routing happens client-side
  return NextResponse.json({ id: params.id });
}

export async function generateStaticParams() {
  return []; // Empty - pages generated client-side
}
