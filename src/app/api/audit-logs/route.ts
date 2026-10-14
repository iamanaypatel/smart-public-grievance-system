import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const logs = await getAuditLogs(user);
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
