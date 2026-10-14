import { NextRequest } from 'next/server';
import { getUserById } from './db';
import { UserProfile } from './db/types';
import { SEED_USERS } from './db/seedData';

export async function getAuthenticatedUser(request?: NextRequest): Promise<UserProfile | null> {
  // 1. Check custom header if provided
  let userId: string | null = null;

  if (request) {
    userId = request.headers.get('x-user-id');
    if (!userId) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/spgs_user_id=([^;]+)/);
      if (match) {
        userId = match[1];
      }
    }
  }

  if (userId) {
    const user = await getUserById(userId);
    if (user) return user;
    const fallback = SEED_USERS.find((u) => u.id === userId);
    if (fallback) return fallback;
  }

  // Fallback: If no auth header/cookie is sent in local demo, return Citizen 1 or null
  return SEED_USERS[0];
}
