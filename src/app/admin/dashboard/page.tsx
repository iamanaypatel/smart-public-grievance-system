'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Grievance, Department } from '@/lib/db/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import {
  ShieldAlert,
  Download,
  Building2,
  BarChart3,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Printer,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, role, switchDemoUser } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'SLA_DEADLINE' | 'PRIORITY'>('NEWEST');

  const fetchAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [grvRes, deptRes] = await Promise.all([
        fetch('/api/grievances', { headers: { 'x-user-id': user.id } }),
        fetch('/api/departments'),
      ]);
      const grvData = await grvRes.json();
      const deptData = await deptRes.json();
      if (grvData.success) setGrievances(grvData.data || []);
      if (deptData.success) setDepartments(deptData.departments || []);
    } catch (err) {
      console.warn('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  // Aggregate stats
  const total = grievances.length;
  const resolved = grievances.filter((g) => ['RESOLVED', 'CLOSED'].includes(g.status)).length;
  const overdue = grievances.filter((g) => g.is_overdue || g.status === 'ESCALATED').length;
  const pending = grievances.filter((g) => ['SUBMITTED', 'UNDER_REVIEW'].includes(g.status)).length;
  const inProgress = grievances.filter((g) => ['ASSIGNED', 'IN_PROGRESS', 'MORE_INFO_REQUIRED', 'REOPENED'].includes(g.status)).length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const filtered = grievances
    .filter((g) => {
      if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
      if (deptFilter !== 'ALL' && g.department_id !== deptFilter) return false;
      if (priorityFilter !== 'ALL' && g.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          g.grievance_id.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q) ||
          g.citizen_name.toLowerCase().includes(q) ||
          g.department_name.toLowerCase().includes(q) ||
          g.locality.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'SLA_DEADLINE') {
        return new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime();
      }
      if (sortBy === 'PRIORITY') {
        const order: Record<string, number> = { EMERGENCY: 3, HIGH: 2, NORMAL: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-8 pb-12">
      {/* Role notice if not logged in as Admin */}
      {role !== 'admin' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>
              You are currently viewing as <strong>{user?.name}</strong> ({role}). To experience the Administrator Management Console:
            </span>
          </div>
          <button
            onClick={() => switchDemoUser('user-admin-1')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition"
          >
            Switch to Admin (Vikramaditya Verma)
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            National Administrative Oversight
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            System-wide grievance monitoring, SLA deadline control, and departmental audit governance.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs"
            title="Print Summary Docket"
          >
            <Printer size={14} />
            <span>Print Records</span>
          </button>

          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
          >
            <BarChart3 size={14} />
            <span>Deep Analytics</span>
          </Link>

          <Link
            href="/admin/departments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Building2 size={14} />
            <span>Departments</span>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shadow-xs"
          >
            <ShieldCheck size={14} />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Total System Cases</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{total}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Pending Review</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{pending}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Active In-Progress</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{inProgress}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Resolved Successfully</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolved}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">SLA Overdue / Escalated</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{overdue}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search across all complaints, citizen names, departments, localities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
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
            <option value="REOPENED">Reopened</option>
            <option value="ESCALATED">Escalated</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="EMERGENCY">Emergency Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="NORMAL">Normal Priority</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="NEWEST">Sort: Newest First</option>
            <option value="SLA_DEADLINE">Sort: Urgent SLA Deadline</option>
            <option value="PRIORITY">Sort: Highest Priority</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Grievance ID</th>
                <th className="py-3 px-4">Title & Locality</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading administrative grievance records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No complaints matched the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {g.grievance_id}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{g.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{g.locality}, {g.city_town}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {g.department_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {g.citizen_name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={g.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={g.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {new Date(g.sla_deadline).toLocaleDateString('en-IN')}
                      {g.is_overdue && (
                        <span className="block text-[10px] text-red-600 font-bold">Overdue!</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/grievances/${g.id}`}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
