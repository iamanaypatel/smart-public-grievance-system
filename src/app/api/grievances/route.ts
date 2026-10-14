import { NextRequest, NextResponse } from 'next/server';
import { getGrievances, createGrievance, getCategories } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || undefined;
    const department_id = searchParams.get('department_id') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const search = searchParams.get('search') || undefined;
    const is_overdue = searchParams.get('is_overdue') === 'true' ? true : undefined;
    const is_escalated = searchParams.get('is_escalated') === 'true' ? true : undefined;

    const grievances = await getGrievances(user, {
      status,
      department_id,
      priority,
      search,
      is_overdue,
      is_escalated,
    });

    return NextResponse.json({ success: true, count: grievances.length, data: grievances });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'citizen') {
      return NextResponse.json(
        { success: false, error: 'Only citizen accounts can submit public complaints' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Required fields validation
    if (!body.title || !body.description || !body.department_id || !body.locality) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: Title, Description, Department, and Locality are mandatory.',
        },
        { status: 400 }
      );
    }

    const newGrievance = await createGrievance(body, user);
    return NextResponse.json({ success: true, data: newGrievance }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
