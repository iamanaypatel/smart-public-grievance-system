'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/lib/db/types';
import { Bell, Check, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time updates regarding status changes, officer responses, and escalations.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">No notifications found.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start gap-3 transition ${
                notif.is_read
                  ? 'bg-white dark:bg-slate-900'
                  : 'bg-blue-50/50 dark:bg-blue-950/30'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={15} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.created_at).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>
                {notif.grievance_id && (
                  <Link
                    href={`/grievances/${notif.grievance_id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                  >
                    <span>View Grievance Details</span>
                    <ArrowRight size={11} />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
