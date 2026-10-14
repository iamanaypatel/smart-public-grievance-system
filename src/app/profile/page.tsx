'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Profile & Persona Settings
      </h1>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-blue-600 dark:text-blue-400 capitalize font-semibold">
              {user?.role} {user?.department_name ? `• ${user.department_name}` : ''}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail size={14} /> Registered Email
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Phone size={14} /> Phone / SMS
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.phone || '+91 98765 43210'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <MapPin size={14} /> District & State
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.district || 'Central'}, {user?.state || 'Delhi'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar size={14} /> Registered On
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
