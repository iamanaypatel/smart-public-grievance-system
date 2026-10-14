import { NextRequest, NextResponse } from 'next/server';
import { getDepartments, getCategories, updateDepartment, createDepartment } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function GET() {
  try {
    const departments = await getDepartments();
    const categories = await getCategories();
    return NextResponse.json({ success: true, departments, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Department ID required' }, { status: 400 });
    }

    const updated = await updateDepartment(id, updates, user);
    return NextResponse.json({ success: true, department: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, description, sla_days_normal, sla_days_high, sla_days_emergency, icon_name } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Department name and unique code are required' },
        { status: 400 }
      );
    }

    const created = await createDepartment(
      {
        name,
        code,
        description,
        sla_days_normal: Number(sla_days_normal) || 7,
        sla_days_high: Number(sla_days_high) || 3,
        sla_days_emergency: Number(sla_days_emergency) || 1,
        icon_name: icon_name || 'Building2',
      },
      user
    );

    return NextResponse.json({ success: true, department: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create department' },
      { status: 500 }
    );
  }
}
