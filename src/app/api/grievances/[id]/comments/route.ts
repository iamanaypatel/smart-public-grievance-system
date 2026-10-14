import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '@/lib/db';
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

    const body = await request.json();
    const { message, is_internal } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const comment = await addComment(id, message, Boolean(is_internal), user);
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}
