'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Grievance, GrievanceStatusHistory } from '@/lib/db/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { TimelineView } from '@/components/TimelineView';
import {
  Search,
  FileText,
  Clock,
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

function TrackComplaintContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [inputGrievanceId, setInputGrievanceId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [grievanceData, setGrievanceData] = useState<{
    grievance: Grievance;
    history: GrievanceStatusHistory[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setGrievanceData(null);

    try {
      const res = await fetch(`/api/grievances/${encodeURIComponent(idToSearch.trim())}`, {
        headers: user ? { 'x-user-id': user.id } : {},
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGrievanceData(data.data);
      } else {
        setError(data.error || 'No complaint found matching this Grievance ID.');
      }
    } catch (err) {
      setError('Failed to reach national grievance servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setInputGrievanceId(queryId);
      performSearch(queryId);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(inputGrievanceId);
  };

  const sampleIds = [
    { id: 'SPGS-2026-000001', label: 'Water Outage (In Progress)' },
    { id: 'SPGS-2026-000002', label: 'Garbage Dump (Escalated Overdue)' },
    { id: 'SPGS-2026-000003', label: 'Highway Lights (Resolved)' },
    { id: 'SPGS-2026-000010', label: 'Court Sub-Judice (Rejected)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Real-Time Public Tracking
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Track Your Grievance Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Enter your unique system-generated Grievance ID to inspect official department actions, officer notes, and SLA timelines.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto pt-4">
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-300 dark:border-slate-700 shadow-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-950">
            <Search className="ml-3 text-slate-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="e.g. SPGS-2026-000001"
              value={inputGrievanceId}
              onChange={(e) => setInputGrievanceId(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs shrink-0"
            >
              {loading ? 'Searching...' : 'Track Status'}
            </button>
          </div>
        </form>

        {/* Quick Demo Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-slate-400 text-[11px]">Demo quick search:</span>
          {sampleIds.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setInputGrievanceId(item.id);
                performSearch(item.id);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-700 transition"
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-center text-xs text-red-700 dark:text-red-300 font-medium animate-in fade-in">
          {error}
        </div>
      )}

      {/* Found Grievance Result */}
      {grievanceData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="font-mono font-black text-lg text-blue-600 dark:text-blue-400">
                  {grievanceData.grievance.grievance_id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {grievanceData.grievance.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={grievanceData.grievance.status} size="lg" />
                <PriorityBadge priority={grievanceData.grievance.priority} />
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {grievanceData.grievance.description}
            </p>

            {/* Department & SLA Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Building2 size={13} /> Assigned Department
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {grievanceData.grievance.department_name}
                </p>
                {grievanceData.grievance.assigned_officer_name && (
                  <p className="text-[11px] text-slate-500">
                    Officer: {grievanceData.grievance.assigned_officer_name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <MapPin size={13} /> Location
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {grievanceData.grievance.locality}
                </p>
                <p className="text-[11px] text-slate-500">
                  {grievanceData.grievance.city_town}, {grievanceData.grievance.state}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Clock size={13} /> SLA Target Deadline
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(grievanceData.grievance.sla_deadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                {grievanceData.grievance.is_overdue && (
                  <span className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                    Target Exceeded (Escalated)
                  </span>
                )}
              </div>
            </div>

            {/* Detailed action banner */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => router.push(`/grievances/${grievanceData.grievance.id}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
              >
                <span>Open Complete Case & Comments</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Chronological Status History Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              <span>Verifiable Redressal Timeline</span>
            </h3>
            <TimelineView history={grievanceData.history} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackComplaintPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
          Loading grievance tracking interface...
        </div>
      }
    >
      <TrackComplaintContent />
    </Suspense>
  );
}
