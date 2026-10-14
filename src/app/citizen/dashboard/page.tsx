'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Grievance, Notification } from '@/lib/db/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Bell,
  HelpCircle,
  Archive,
  Info,
  Printer,
  ArrowUpDown,
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user, role, switchDemoUser } = useAuth();
  const { t } = useLanguage();

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'SLA'>('NEWEST');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasDraft, setHasDraft] = useState(false);

  const fetchGrievancesAndNotifs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [grvRes, notifRes] = await Promise.all([
        fetch('/api/grievances', { headers: { 'x-user-id': user.id } }),
        fetch('/api/notifications', { headers: { 'x-user-id': user.id } }),
      ]);
      const grvData = await grvRes.json();
      const notifData = await notifRes.json();

      if (grvData.success) {
        setGrievances(grvData.data || []);
      }
      if (notifData.success) {
        setNotifications((notifData.data || []).slice(0, 4));
      }
    } catch (err) {
      console.warn('Error fetching citizen data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievancesAndNotifs();
    try {
      const draft = localStorage.getItem('spgs_draft_complaint');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.title || parsed.description) {
          setHasDraft(true);
        }
      }
    } catch (e) {}
  }, [user]);

  // Compute citizen metrics as required by Prompt Section 6
  const total = grievances.length;
  const pending = grievances.filter((g) => ['SUBMITTED', 'UNDER_REVIEW'].includes(g.status)).length;
  const inProgress = grievances.filter((g) => ['ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(g.status)).length;
  const resolved = grievances.filter((g) => g.status === 'RESOLVED').length;
  const closed = grievances.filter((g) => g.status === 'CLOSED').length;
  const awaitingInfo = grievances.filter((g) => g.status === 'MORE_INFO_REQUIRED').length;
  const rejected = grievances.filter((g) => g.status === 'REJECTED').length;
  const escalated = grievances.filter((g) => g.is_escalated || g.status === 'ESCALATED').length;

  // Extract unique departments for department filter
  const departmentsList = Array.from(new Set(grievances.map((g) => g.department_name)));

  const filtered = grievances
    .filter((g) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'IN_PROGRESS_GROUP') {
          if (!['ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(g.status)) return false;
        } else if (statusFilter === 'PENDING_GROUP') {
          if (!['SUBMITTED', 'UNDER_REVIEW'].includes(g.status)) return false;
        } else if (g.status !== statusFilter) {
          return false;
        }
      }

      if (deptFilter !== 'ALL' && g.department_name !== deptFilter) {
        return false;
      }

      if (priorityFilter !== 'ALL' && g.priority !== priorityFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          g.grievance_id.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          (g.category && g.category.toLowerCase().includes(q)) ||
          g.department_name.toLowerCase().includes(q) ||
          g.locality.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'OLDEST') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'SLA') return new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime();
      return 0;
    });

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Role Notice if viewing as non-citizen */}
      {role !== 'citizen' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>
              You are currently logged in as <strong>{user?.name}</strong> ({role}). Citizen dashboard displays personal submitted grievances.
            </span>
          </div>
          <button
            onClick={() => switchDemoUser('user-citizen-1')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition cursor-pointer"
          >
            Switch to Citizen (Aarav Sharma)
          </button>
        </div>
      )}

      {/* Header with Greeting & Submit CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Citizen Grievance Redressal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track and manage your submitted civic complaints with official department timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            title="Print a clean summary of your grievances"
          >
            <Printer size={15} />
            <span>Print Summary</span>
          </button>

          <Link
            href="/citizen/track"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Search size={15} />
            <span>Track by ID</span>
          </Link>

          <Link
            href="/citizen/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition card-hover cursor-pointer"
          >
            <PlusCircle size={17} />
            <span>{t('btn_submit_complaint')}</span>
          </Link>
        </div>
      </div>

      {/* Unfinished Draft Resume Banner */}
      {hasDraft && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span>
              <strong>Unfinished Complaint Draft:</strong> You have an unsaved grievance draft saved on this device.
            </span>
          </div>
          <Link
            href="/citizen/submit"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <span>Resume Complaint Form</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* 6 Required Metric Cards (Prompt Section 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Complaints */}
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition card-hover cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total</span>
            <FileText size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{total}</div>
          <span className="text-[10px] text-slate-400 font-medium">All logged</span>
        </button>

        {/* 2. Pending Complaints */}
        <button
          onClick={() => setStatusFilter('PENDING_GROUP')}
          className={`p-4 rounded-2xl border text-left transition card-hover cursor-pointer ${
            statusFilter === 'PENDING_GROUP'
              ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-400 dark:border-purple-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pending</span>
            <Clock size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">{pending}</div>
          <span className="text-[10px] text-slate-400 font-medium">Under review</span>
        </button>

        {/* 3. In Progress Complaints */}
        <button
          onClick={() => setStatusFilter('IN_PROGRESS_GROUP')}
          className={`p-4 rounded-2xl border text-left transition card-hover cursor-pointer ${
            statusFilter === 'IN_PROGRESS_GROUP'
              ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">In Progress</span>
            <RotateCcw size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{inProgress}</div>
          <span className="text-[10px] text-slate-400 font-medium">Assigned to field</span>
        </button>

        {/* 4. Resolved Complaints */}
        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-4 rounded-2xl border text-left transition card-hover cursor-pointer ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{resolved}</div>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting rating</span>
        </button>

        {/* 5. Closed Complaints */}
        <button
          onClick={() => setStatusFilter('CLOSED')}
          className={`p-4 rounded-2xl border text-left transition card-hover cursor-pointer ${
            statusFilter === 'CLOSED'
              ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-400 dark:border-teal-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Closed</span>
            <Archive size={16} className="text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-2">{closed}</div>
          <span className="text-[10px] text-slate-400 font-medium">Satisfaction logged</span>
        </button>

        {/* 6. Awaiting Information */}
        <button
          onClick={() => setStatusFilter('MORE_INFO_REQUIRED')}
          className={`p-4 rounded-2xl border text-left transition card-hover cursor-pointer ${
            statusFilter === 'MORE_INFO_REQUIRED'
              ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">More Info</span>
            <HelpCircle size={16} className="text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-2">{awaitingInfo}</div>
          <span className="text-[10px] text-slate-400 font-medium">Action needed</span>
        </button>
      </div>

      {/* Recent Notifications & Activity Stream (Prompt Section 6) */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Bell size={14} className="text-blue-600" />
              <span>Recent Activity & Updates</span>
            </h3>
            <Link
              href="/notifications"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all notifications →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{notif.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-1">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Grievance ID, title, category, locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            title="Filter by Department"
          >
            <option value="ALL">All Departments</option>
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            title="Filter by Status"
          >
            <option value="ALL">All Statuses ({total})</option>
            <option value="PENDING_GROUP">Pending Review ({pending})</option>
            <option value="IN_PROGRESS_GROUP">In Progress ({inProgress})</option>
            <option value="RESOLVED">Resolved ({resolved})</option>
            <option value="CLOSED">Closed ({closed})</option>
            <option value="MORE_INFO_REQUIRED">More Info Required ({awaitingInfo})</option>
            <option value="REJECTED">Rejected ({rejected})</option>
            <option value="ESCALATED">Escalated ({escalated})</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            title="Filter by Priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="EMERGENCY">Emergency</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            title="Sort Complaints"
          >
            <option value="NEWEST">Newest Logged</option>
            <option value="OLDEST">Oldest First</option>
            <option value="SLA">SLA Deadline (Urgent)</option>
          </select>
        </div>
      </div>

      {/* Grievances List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading your grievances from database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No Complaints Match Your Filter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You currently have no complaints under this filter. Submit a new complaint to get started.
              </p>
            </div>
            <Link
              href="/citizen/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Submit a Complaint Now</span>
            </Link>
          </div>
        ) : (
          filtered.map((g) => (
            <div
              key={g.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3 card-hover"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    {g.grievance_id}
                  </span>
                  <StatusBadge status={g.status} size="sm" />
                  <PriorityBadge priority={g.priority} size="sm" />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar size={13} />
                  <span>
                    Logged:{' '}
                    {new Date(g.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 transition">
                  <Link href={`/grievances/${g.id}`}>{g.title}</Link>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {/* Meta pills & Action Link */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={13} className="text-slate-400" />
                    <strong className="text-slate-700 dark:text-slate-300">{g.department_name}</strong>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{g.locality}, {g.city_town}</span>
                  </span>
                  {g.is_overdue && (
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold">
                      Overdue SLA
                    </span>
                  )}
                </div>

                <Link
                  href={`/grievances/${g.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>View Details & Timeline</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Rejection / Resolution notice highlight */}
              {g.rejection_reason && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-800 dark:text-red-300">
                  <strong>Rejection Explanation:</strong> {g.rejection_reason}
                </div>
              )}
              {g.resolution_summary && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                  <strong>Resolution Report:</strong> {g.resolution_summary}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
