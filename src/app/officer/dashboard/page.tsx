'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Grievance } from '@/lib/db/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  UserCheck,
  FileQuestion,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Flame,
  Droplets,
  Trash2,
  Printer,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user, role, switchDemoUser } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNASSIGNED' | 'HIGH_PRIORITY' | 'OVERDUE' | 'AWAITING_INFO' | 'RESOLVED'>('ALL');
  const [statusDropdownFilter, setStatusDropdownFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'SLA_DEADLINE' | 'NEWEST' | 'PRIORITY'>('SLA_DEADLINE');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOfficerGrievances = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/grievances', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.success) {
        setGrievances(data.data);
      }
    } catch (err) {
      console.warn('Error fetching officer grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerGrievances();
  }, [user]);

  // Queue counts
  const total = grievances.length;
  const unassigned = grievances.filter((g) => !g.assigned_officer_id && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(g.status)).length;
  const highPriority = grievances.filter((g) => g.priority === 'HIGH' || g.priority === 'EMERGENCY').length;
  const overdue = grievances.filter((g) => g.is_overdue || g.status === 'ESCALATED').length;
  const awaitingInfo = grievances.filter((g) => g.status === 'MORE_INFO_REQUIRED').length;
  const resolved = grievances.filter((g) => ['RESOLVED', 'CLOSED'].includes(g.status)).length;

  const filtered = grievances
    .filter((g) => {
      if (activeTab === 'UNASSIGNED' && (g.assigned_officer_id || ['RESOLVED', 'CLOSED', 'REJECTED'].includes(g.status))) return false;
      if (activeTab === 'HIGH_PRIORITY' && g.priority !== 'HIGH' && g.priority !== 'EMERGENCY') return false;
      if (activeTab === 'OVERDUE' && !g.is_overdue && g.status !== 'ESCALATED') return false;
      if (activeTab === 'AWAITING_INFO' && g.status !== 'MORE_INFO_REQUIRED') return false;
      if (activeTab === 'RESOLVED' && !['RESOLVED', 'CLOSED'].includes(g.status)) return false;

      if (statusDropdownFilter !== 'ALL' && g.status !== statusDropdownFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          g.grievance_id.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.locality.toLowerCase().includes(q) ||
          g.citizen_name.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'SLA_DEADLINE') return new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime();
      if (sortBy === 'NEWEST') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'PRIORITY') {
        const pOrder: Record<string, number> = { EMERGENCY: 3, HIGH: 2, NORMAL: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-8 pb-12">
      {/* Role notice if not logged in as officer */}
      {role !== 'officer' && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>
              You are currently viewing as <strong>{user?.name}</strong> ({role}). To experience the operational queue for a specific department:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchDemoUser('user-officer-water')}
              className="px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold text-xs transition flex items-center gap-1"
            >
              <Droplets size={12} />
              <span>Officer Priya Nair (Water)</span>
            </button>
            <button
              onClick={() => switchDemoUser('user-officer-sanitation')}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Officer Rajesh Kumar (Sanitation)</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Operational Department Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {user?.department_name || 'Department'} Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Authorized Officer: <strong>{user?.name}</strong> • Jurisdiction District: {user?.district || 'Central'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Active Records: {total}
          </span>
        </div>
      </div>

      {/* Operational Queue Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'ALL'
              ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>All Assigned</span>
            <Briefcase size={14} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{total}</div>
        </button>

        <button
          onClick={() => setActiveTab('UNASSIGNED')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'UNASSIGNED'
              ? 'bg-purple-50 dark:bg-purple-950 border-purple-500 ring-2 ring-purple-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Unassigned</span>
            <Clock size={14} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">{unassigned}</div>
        </button>

        <button
          onClick={() => setActiveTab('HIGH_PRIORITY')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'HIGH_PRIORITY'
              ? 'bg-amber-50 dark:bg-amber-950 border-amber-500 ring-2 ring-amber-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>High / Emerg</span>
            <Flame size={14} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{highPriority}</div>
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'OVERDUE'
              ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 ring-2 ring-rose-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Overdue SLA</span>
            <AlertTriangle size={14} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{overdue}</div>
        </button>

        <button
          onClick={() => setActiveTab('AWAITING_INFO')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'AWAITING_INFO'
              ? 'bg-orange-50 dark:bg-orange-950 border-orange-500 ring-2 ring-orange-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Awaiting Citizen</span>
            <FileQuestion size={14} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-2">{awaitingInfo}</div>
        </button>

        <button
          onClick={() => setActiveTab('RESOLVED')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeTab === 'RESOLVED'
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 ring-2 ring-emerald-200'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Resolved</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{resolved}</div>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search queue by Grievance ID, title, citizen name, locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Dropdown */}
          <select
            value={statusDropdownFilter}
            onChange={(e) => setStatusDropdownFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            title="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="MORE_INFO_REQUIRED">More Info Required</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
            <option value="ESCALATED">Escalated</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            title="Sort Queue"
          >
            <option value="SLA_DEADLINE">SLA Deadline (Urgent First)</option>
            <option value="PRIORITY">Priority (Emergency First)</option>
            <option value="NEWEST">Newest Lodged</option>
          </select>

          {/* Print Queue Docket */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            title="Print queue docket summary"
          >
            <Printer size={13} />
            <span>Print Queue</span>
          </button>
        </div>
      </div>

      {/* Queue Grievance Table & Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading departmental records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              Queue Clear Under This Filter
            </h3>
            <p className="text-xs text-slate-500">
              No pending complaints match the current filter criteria for your department.
            </p>
          </div>
        ) : (
          filtered.map((g) => (
            <div
              key={g.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    {g.grievance_id}
                  </span>
                  <StatusBadge status={g.status} size="sm" />
                  <PriorityBadge priority={g.priority} size="sm" />
                  {g.is_overdue && (
                    <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-extrabold uppercase animate-pulse">
                      SLA Violated
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar size={13} />
                  <span>
                    Received:{' '}
                    {new Date(g.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
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

              {/* Footer Meta & Direct Action Link */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{g.locality}, {g.city_town}</span>
                  </span>
                  <span>•</span>
                  <span>Citizen: <strong className="text-slate-700 dark:text-slate-300">{g.citizen_name}</strong></span>
                  <span>•</span>
                  <span>Target: {new Date(g.sla_deadline).toLocaleDateString('en-IN')}</span>
                </div>

                <Link
                  href={`/grievances/${g.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-xs"
                >
                  <span>Review & Process Case</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
