import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'citizen') {
      return NextResponse.json(
        { success: false, error: 'Only citizens can submit resolution feedback' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, comments, resolution_satisfaction, timeliness_rating } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5 stars' },
        { status: 400 }
      );
    }

    const feedback = await submitFeedback(
      id,
      {
        rating: Number(rating),
        comments: comments || '',
        resolution_satisfaction: Boolean(resolution_satisfaction),
        timeliness_rating: Number(timeliness_rating || rating),
      },
      user
    );

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
