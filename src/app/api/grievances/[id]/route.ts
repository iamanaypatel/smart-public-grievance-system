import { NextRequest, NextResponse } from 'next/server';
import { getGrievanceById, updateGrievanceStatus } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    const result = await getGrievanceById(id, user);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Grievance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message?.includes('Access Denied') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, remarks, assigned_officer_id, assigned_officer_name, resolution_summary, rejection_reason } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = await updateGrievanceStatus(
      id,
      status,
      remarks,
      user,
      {
        assigned_officer_id,
        assigned_officer_name,
        resolution_summary,
        rejection_reason,
      }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update grievance' },
      { status }
    );
  }
}
