'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Users,
  ShieldCheck,
  Building2,
  RefreshCw,
  Info,
  Download,
  Calendar,
  MapPin,
  ArrowRight,
  Archive,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | '30d' | '7d'>('all');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading && !data) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm animate-pulse">
        Aggregating live analytics from PostgreSQL grievance database...
      </div>
    );
  }

  const {
    summary,
    departmentData,
    categoryData,
    priorityData,
    monthlyTrends,
    officerWorkload,
    geographicData,
    starCounts,
  } = data || {
    summary: {},
    departmentData: [],
    categoryData: [],
    priorityData: [],
    monthlyTrends: [],
    officerWorkload: [],
    geographicData: [],
    starCounts: [],
  };

  const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#ef4444', '#64748b'];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Public Performance Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Grievance Redressal Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time performance indicators computed directly from active civic database records. Zero hardcoded mock numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Period Filter (Prompt Section 11) */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === '30d'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                period === '7d'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
          </div>

          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>

          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Prompt Section 11 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Received */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 card-hover">
          <span className="text-[11px] text-slate-400 font-semibold">Total Received</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.total}
          </div>
          <p className="text-[10px] text-slate-400">All registered</p>
        </div>

        {/* Pending Complaints */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 card-hover">
          <span className="text-[11px] text-slate-400 font-semibold">Pending Review</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {summary.pending}
          </div>
          <p className="text-[10px] text-slate-400">Under review</p>
        </div>

        {/* Resolved & Closed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 card-hover">
          <span className="text-[11px] text-slate-400 font-semibold">Resolved & Closed</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.resolved}
          </div>
          <p className="text-[10px] text-slate-400">{summary.closed || 0} confirmed closed</p>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 card-hover">
          <span className="text-[11px] text-slate-400 font-semibold">Redressal Rate</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {summary.resolutionRate}%
          </div>
          <p className="text-[10px] text-slate-400">Resolved / Admissible</p>
        </div>

        {/* Avg Resolution Days */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 card-hover">
          <span className="text-[11px] text-slate-400 font-semibold">Avg Resolution</span>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {summary.avgResolutionDays} <span className="text-xs font-bold text-slate-400">Days</span>
          </div>
          <p className="text-[10px] text-slate-400">Database average</p>
        </div>

        {/* Overdue Count */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 card-hover">
          <span className="text-[11px] text-slate-400 font-semibold">SLA Overdue</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {summary.overdue}
          </div>
          <p className="text-[10px] text-slate-400">Exceeded SLA limit</p>
        </div>
      </div>

      {/* Row 1 Charts: Monthly Trend & Priority Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Intake vs. Redressal Trend
              </h2>
              <p className="text-xs text-slate-400">
                Tracking monthly volume of complaints lodged vs. verified resolutions
              </p>
            </div>
            <TrendingUp size={20} className="text-blue-600" />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#1e293b',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="received" name="Received" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Split */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Grievance Severity Breakdown
            </h2>
            <p className="text-xs text-slate-400">Active distribution by statutory urgency</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#1e293b',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {priorityData.map((p: any) => (
              <div key={p.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{p.value} cases</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Department-wise Volume & Resolution Rate */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Department Redressal Performance
            </h2>
            <p className="text-xs text-slate-400">
              Comparative intake and resolution success across all 10 civic departments
            </p>
          </div>
          <Building2 size={20} className="text-blue-600" />
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#1e293b',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Bar dataKey="total" name="Total Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved Cases" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Officer Workload & Geographic Distribution (Prompt Section 11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Officer Workload */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Officer Workload Distribution
              </h2>
              <p className="text-xs text-slate-400">Caseload assigned across departmental officers</p>
            </div>
            <Users size={18} className="text-blue-600" />
          </div>

          <div className="space-y-3 pt-2">
            {officerWorkload && officerWorkload.length > 0 ? (
              officerWorkload.map((ow: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{ow.officerName}</span>
                    <span className="text-blue-600 font-mono">{ow.count} cases</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (ow.count / (summary.total || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No officer assignments yet.</p>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Geographic Distribution
              </h2>
              <p className="text-xs text-slate-400">Complaints mapped by jurisdiction district</p>
            </div>
            <MapPin size={18} className="text-emerald-600" />
          </div>

          <div className="space-y-3 pt-2">
            {geographicData && geographicData.length > 0 ? (
              geographicData.map((gd: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{gd.district}</span>
                    <span className="text-emerald-600 font-mono">{gd.count} complaints</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (gd.count / (summary.total || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No geographic data recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Citizen Satisfaction Rating Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Citizen Satisfaction Ratings
            </h2>
            <p className="text-xs text-slate-400">
              Verified feedback submitted by citizens post-resolution
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-amber-500 font-black text-lg">
            <Star size={18} className="fill-amber-400 text-amber-400" />
            <span>{summary.avgRating} / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {starCounts && starCounts.length > 0 ? (
            starCounts.map((sc: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center space-y-1"
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {sc.stars}
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {sc.count}
                </div>
                <span className="text-[10px] text-slate-400">Ratings</span>
              </div>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
}
