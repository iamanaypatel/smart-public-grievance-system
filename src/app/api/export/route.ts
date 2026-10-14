import { NextRequest, NextResponse } from 'next/server';
import { getGrievances } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: CSV export is restricted to administrators' },
        { status: 403 }
      );
    }

    const grievances = await getGrievances(user);

    const headers = [
      'Grievance ID',
      'Citizen Name',
      'Department',
      'Category',
      'Priority',
      'Status',
      'State',
      'District',
      'Locality',
      'Incident Date',
      'SLA Deadline',
      'Overdue',
      'Created At',
      'Resolved At',
    ];

    const rows = grievances.map((g) => [
      `"${g.grievance_id}"`,
      `"${g.citizen_name.replace(/"/g, '""')}"`,
      `"${g.department_name.replace(/"/g, '""')}"`,
      `"${g.category.replace(/"/g, '""')}"`,
      `"${g.priority}"`,
      `"${g.status}"`,
      `"${g.state}"`,
      `"${g.district}"`,
      `"${g.locality.replace(/"/g, '""')}"`,
      `"${g.incident_date}"`,
      `"${g.sla_deadline}"`,
      g.is_overdue ? 'YES' : 'NO',
      `"${g.created_at}"`,
      `"${g.resolved_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="SPGS_Grievances_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}
