'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/db/types';
import { SEED_USERS } from '@/lib/db/seedData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | 'guest';
  isLoading: boolean;
  switchDemoUser: (userId: string) => void;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  demoUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType>({
  user: SEED_USERS[0],
  role: 'citizen',
  isLoading: false,
  switchDemoUser: () => {},
  login: async () => true,
  logout: () => {},
  demoUsers: SEED_USERS,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(SEED_USERS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync user with cookie for server-side API auth validation
  const syncCookie = (userId: string | null) => {
    if (typeof document !== 'undefined') {
      if (userId) {
        document.cookie = `spgs_user_id=${userId}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        document.cookie = `spgs_user_id=; path=/; max-age=0; SameSite=Lax`;
      }
    }
  };

  useEffect(() => {
    const savedUserId = localStorage.getItem('spgs_user_id');
    if (savedUserId) {
      const found = SEED_USERS.find((u) => u.id === savedUserId);
      if (found) {
        setUser(found);
        syncCookie(found.id);
      } else {
        setUser(SEED_USERS[0]);
        syncCookie(SEED_USERS[0].id);
      }
    } else {
      // Default to Citizen Aarav Sharma for initial demo
      setUser(SEED_USERS[0]);
      syncCookie(SEED_USERS[0].id);
    }
    setIsLoading(false);
  }, []);

  const switchDemoUser = (userId: string) => {
    const found = SEED_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      localStorage.setItem('spgs_user_id', found.id);
      syncCookie(found.id);
    }
  };

  const login = async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    const existing = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      localStorage.setItem('spgs_user_id', existing.id);
      syncCookie(existing.id);
      return true;
    }

    // Register simple demo user
    const newUser: UserProfile = {
      id: `user-custom-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/^./, (c) => c.toUpperCase()),
      email,
      role: requestedRole || 'citizen',
      district: 'Central',
      state: 'Delhi',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('spgs_user_id', newUser.id);
    syncCookie(newUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('spgs_user_id');
    syncCookie(null);
  };

  const role: UserRole | 'guest' = user ? user.role : 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        switchDemoUser,
        login,
        logout,
        demoUsers: SEED_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
