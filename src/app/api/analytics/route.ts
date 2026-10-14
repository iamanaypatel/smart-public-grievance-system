import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsMetrics } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get('period') || 'all';
    const analytics = await getAnalyticsMetrics(period);
    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
      disclaimer: 'All metrics dynamically aggregated from active database records.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
