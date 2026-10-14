import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const notifications = await getNotifications(user.id);
    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      await markAllNotificationsAsRead(user.id);
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (id) {
      await markNotificationAsRead(id, user.id);
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
