'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Notification } from '@/lib/db/types';
import {
  Landmark,
  Bell,
  Sun,
  Moon,
  Globe,
  LogOut,
  User,
  PlusCircle,
  Search,
  LayoutDashboard,
  BarChart3,
  Building2,
  HelpCircle,
  Menu,
  X,
  Check,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { 'x-user-id': user.id },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setNotifications(data.data);
          setUnreadCount(data.data.filter((n: Notification) => !n.is_read).length);
        }
      } catch (err) {
        console.warn('Could not load notifications:', err);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Polling for demo updates
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Mark read failed:', err);
    }
  };

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#departments', label: 'Departments' },
    ...(role === 'citizen'
      ? [
          { href: '/citizen/dashboard', label: t('nav_citizen') },
          { href: '/citizen/submit', label: t('btn_submit_complaint') },
        ]
      : []),
    ...(role === 'officer'
      ? [
          { href: '/officer/dashboard', label: t('nav_officer') },
        ]
      : []),
    ...(role === 'admin'
      ? [
          { href: '/admin/dashboard', label: t('nav_admin') },
          { href: '/admin/analytics', label: 'Analytics' },
          { href: '/admin/departments', label: 'Departments' },
        ]
      : []),
    { href: '/citizen/track', label: 'Track Complaint' },
    { href: '/transparency', label: t('nav_transparency') },
    { href: '/demo', label: 'Demo Flow' },
    { href: '/faq', label: t('nav_faq') },
  ];

  return (
    <header className="sticky top-[37px] z-30 bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-md border-b border-[#D9E2EF] dark:border-[#23314D] shadow-xs">
      {/* Indian Tricolor micro accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Portal Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#123B70] dark:bg-blue-950 flex items-center justify-center text-white border border-[#2457A7] shadow-sm group-hover:scale-105 transition">
              <Landmark size={22} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#1C2B3A] dark:text-white">
                  SPGS <span className="text-[#123B70] dark:text-blue-400">INDIA</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#EAF2FC] dark:bg-blue-950 text-[#123B70] dark:text-blue-300 border border-[#D9E2EF] dark:border-blue-900">
                  Gov Civic Tech
                </span>
              </div>
              <p className="text-[11px] text-[#5B6573] dark:text-slate-400 hidden sm:block truncate max-w-xs">
                {t('app_subtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#EAF2FC] text-[#123B70] dark:bg-blue-950/80 dark:text-blue-300 font-bold'
                      : 'text-[#5B6573] dark:text-slate-300 hover:text-[#1C2B3A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Lang, Theme, Notifs, Profile */}
          <div className="flex items-center gap-2">
            {/* Hindi / English Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D9E2EF] dark:border-slate-800 bg-[#F4F7FB] dark:bg-slate-800 text-xs font-semibold text-[#1C2B3A] dark:text-slate-200 hover:bg-[#EAF2FC] dark:hover:bg-slate-700 transition"
              title="Toggle English / हिन्दी"
            >
              <Globe size={13} className="text-[#2457A7] dark:text-blue-400" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[#D9E2EF] dark:border-slate-800 bg-[#F4F7FB] dark:bg-slate-800 text-[#5B6573] dark:text-slate-300 hover:bg-[#EAF2FC] dark:hover:bg-slate-700 transition cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-lg border border-[#D9E2EF] dark:border-slate-800 bg-[#F4F7FB] dark:bg-slate-800 text-[#5B6573] dark:text-slate-300 hover:bg-[#EAF2FC] dark:hover:bg-slate-700 transition relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-[#D9E2EF] dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 bg-[#EAF2FC] dark:bg-slate-800/80 border-b border-[#D9E2EF] dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-[#123B70] dark:text-blue-400" />
                        <span className="text-xs font-bold text-[#1C2B3A] dark:text-slate-200">
                          Notifications ({notifications.length})
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-[#2457A7] dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Check size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-center text-slate-400 italic">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs transition ${
                              notif.is_read
                                ? 'bg-white dark:bg-slate-900 opacity-80'
                                : 'bg-[#EAF2FC]/60 dark:bg-blue-950/30'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-semibold text-[#1C2B3A] dark:text-slate-200">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(notif.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[#5B6573] dark:text-slate-400 text-[11px] leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 bg-[#F4F7FB] dark:bg-slate-800/60 border-t border-[#D9E2EF] dark:border-slate-800 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs text-[#2457A7] dark:text-blue-400 font-semibold hover:underline"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar / Quick Link */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#D9E2EF] dark:border-slate-800">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-85 transition group"
                  title="View Profile & Settings"
                >
                  <div className="w-8 h-8 rounded-full bg-[#123B70] text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs group-hover:ring-2 group-hover:ring-[#2457A7]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-[#1C2B3A] dark:text-slate-200 truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-[#5B6573] dark:text-slate-400 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-[#5B6573] hover:text-[#B42318] hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-[#123B70] hover:bg-[#2457A7] text-white text-xs font-bold transition shadow-xs"
              >
                {t('nav_login')}
              </Link>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
