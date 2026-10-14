import { NextRequest, NextResponse } from 'next/server';
import { getGrievances } from '@/lib/db';
import { checkForDuplicates, recommendDepartment, getSuggestedFaqs } from '@/lib/db/rules';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, department_id, locality, pincode } = body;

    const allGrievances = await getGrievances(null); // System lookup
    const duplicateResult = checkForDuplicates(allGrievances, {
      departmentId: department_id,
      title: title || '',
      locality: locality || '',
      pincode,
    });

    const recommendedDept = recommendDepartment(`${title || ''} ${description || ''}`);
    const suggestedFaqs = getSuggestedFaqs(`${title || ''} ${description || ''}`);

    return NextResponse.json({
      success: true,
      duplicateCheck: duplicateResult,
      recommendation: recommendedDept,
      suggestedFaqs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Duplicate check failed' },
      { status: 500 }
    );
  }
}
