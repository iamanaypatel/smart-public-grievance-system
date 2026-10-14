'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  EyeOff,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function TransparencyPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <EyeOff size={18} className="text-blue-600 shrink-0" />
          <span>
            <strong>Data Privacy Guaranteed:</strong> All displayed records are fully aggregated and anonymized. Citizen names, phone numbers, exact residential coordinates, and private department notes are strictly redacted.
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Open Governance Initiative
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Public Transparency Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Independent civic redressal statistics for accountability, department benchmarking, and citizen oversight.
        </p>
      </div>

      {loading || !data ? (
        <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
          Loading anonymized public metrics...
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Total Complaints Received</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {data.summary.total}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Successfully Resolved</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.summary.resolved}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Resolution Rate</span>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {data.summary.resolutionRate}%
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold">Average Redressal Time</span>
              <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                {data.summary.avgResolutionDays} Days
              </div>
            </div>
          </div>

          {/* Department-wise Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Department-Wise Redressal Performance
                </h2>
                <p className="text-xs text-slate-400">Total volume vs. resolved cases across municipal departments</p>
              </div>
              <Building2 size={20} className="text-blue-600" />
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                  <Bar dataKey="total" name="Complaints Lodged" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Public Redressal Scorecard
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Total Cases</th>
                    <th className="py-3 px-4">Resolved</th>
                    <th className="py-3 px-4">Pending</th>
                    <th className="py-3 px-4">Resolution %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.departmentData.map((d: any) => (
                    <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{d.name}</td>
                      <td className="py-3 px-4">{d.total}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{d.resolved}</td>
                      <td className="py-3 px-4 text-amber-600">{d.pending}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${d.rate}%` }}
                            />
                          </div>
                          <span className="font-bold">{d.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
