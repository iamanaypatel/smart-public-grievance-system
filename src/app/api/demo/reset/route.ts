import { NextRequest, NextResponse } from 'next/server';
import { resetDemoData } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only administrators can reset demo data.' },
        { status: 403 }
      );
    }

    await resetDemoData(user);
    return NextResponse.json({
      success: true,
      message: 'Demo dataset has been successfully reset to initial pristine state.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reset demo data' },
      { status: 500 }
    );
  }
}
