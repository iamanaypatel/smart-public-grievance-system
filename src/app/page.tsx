'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Search,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Trash2,
  Zap,
  Building2,
  Compass,
  HeartPulse,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Lock,
  Layers,
  Flame,
  Award,
  ExternalLink,
  Check,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { switchDemoUser } = useAuth();
  const [quickTrackId, setQuickTrackId] = useState('');
  const [stats, setStats] = useState({
    total: 16,
    resolved: 5,
    resolutionRate: 83,
    avgResolutionDays: 3.8,
  });

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [previewTab, setPreviewTab] = useState<'citizen' | 'officer' | 'admin'>('citizen');

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.summary) {
          setStats(json.data.summary);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackId.trim()) return;
    router.push(`/citizen/track?id=${encodeURIComponent(quickTrackId.trim())}`);
  };

  const departmentsList = [
    { name: 'Municipal Corporation', icon: Building2, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50', code: 'MC' },
    { name: 'Water Supply', icon: Droplets, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/50', code: 'WS' },
    { name: 'Electricity', icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50', code: 'ELEC' },
    { name: 'Public Works (PWD)', icon: Building2, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/50', code: 'PWD' },
    { name: 'Sanitation & Waste', icon: Trash2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', code: 'SWM' },
    { name: 'Roads & Transport', icon: Compass, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50', code: 'RT' },
    { name: 'Public Health', icon: HeartPulse, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50', code: 'PH' },
    { name: 'Police & Public Safety', icon: ShieldCheck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50', code: 'PPS' },
    { name: 'Education', icon: GraduationCap, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/50', code: 'EDU' },
    { name: 'Other Public Services', icon: HelpCircle, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/50', code: 'OPS' },
  ];

  const features = [
    {
      title: 'Smart Department Routing',
      desc: 'Automatic municipal department categorization powered by civic keyword matching and location context.',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'SLA Engine & Escalation',
      desc: 'Enforceable resolution deadlines with automatic escalation to Zonal Commissioners if SLA is breached.',
      icon: Clock,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'Duplicate Prevention',
      desc: 'Real-time detection of matching category complaints in the same locality within 14 days.',
      icon: Layers,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
    },
    {
      title: 'OpenStreetMap Geo-Tagging',
      desc: 'Precise GPS coordinate pin-point on interactive maps for swift field officer inspection.',
      icon: MapPin,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'Privacy-First Transparency',
      desc: '100% aggregated, anonymized public scorecards with zero citizen PII exposure.',
      icon: Lock,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
    },
    {
      title: 'Citizen Satisfaction & Reopening',
      desc: '14-day window for citizens to rate resolution quality or request a reopening if field work is incomplete.',
      icon: Award,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
    },
  ];

  const faqs = [
    {
      q: 'How does SPGS track my complaint?',
      a: 'Every complaint receives an immutable unique Grievance ID (e.g. SPGS-2026-000001). Citizens can inspect live status transitions, officer remarks, and SLA deadlines at any moment without login.',
    },
    {
      q: 'What is the standard SLA response timeframe?',
      a: 'Emergency grievances (water cutoffs, sparking transformers) have a 24-hour SLA. High priority carries 2–3 days, and normal civic complaints carry 5–7 days.',
    },
    {
      q: 'What happens if a department misses the deadline?',
      a: 'The system automatically marks the complaint as ESCALATED, alerts the Zonal Commissioner, and records the breach in the permanent audit trail.',
    },
    {
      q: 'Can a citizen reopen an unresolved complaint?',
      a: 'Yes. Citizens have 14 days after a case is marked "Resolved" to review the field work. If dissatisfied, they can request reopening with comments.',
    },
    {
      q: 'Is my personal information visible on the public dashboard?',
      a: 'No. The Public Transparency Dashboard uses only aggregated municipal statistics. Your name, phone, email, and exact house address are never displayed publicly.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/70 via-white to-slate-50/80 dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white p-8 md:p-14 border border-slate-200/90 dark:border-blue-900/50 shadow-sm dark:shadow-2xl animate-fade-in">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 dark:bg-emerald-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-400/30 text-xs font-bold">
              <Sparkles size={13} className="text-amber-500 dark:text-amber-400" />
              <span>{t('hero_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              {t('hero_title')}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t('hero_desc')}
            </p>

            {/* Quick Track Input Bar */}
            <form onSubmit={handleQuickTrack} className="pt-2 max-w-xl">
              <div className="relative flex items-center bg-white dark:bg-black/30 backdrop-blur-md rounded-2xl p-1.5 border border-slate-300 dark:border-white/20 focus-within:border-blue-600 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-950 shadow-sm">
                <Search className="ml-3 text-slate-400 shrink-0" size={18} />
                <input
                  type="text"
                  placeholder="Enter Grievance ID (e.g. SPGS-2026-000001)..."
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('btn_track_complaint')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/citizen/submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2 card-hover cursor-pointer"
              >
                <FileText size={17} />
                <span>{t('btn_submit_complaint')}</span>
              </Link>

              <Link
                href="/citizen/track"
                className="px-5 py-3 rounded-xl bg-white dark:bg-blue-600/80 hover:bg-slate-50 dark:hover:bg-blue-600 text-blue-700 dark:text-white font-semibold text-sm border border-slate-300 dark:border-blue-400/40 shadow-xs transition flex items-center gap-2 card-hover cursor-pointer"
              >
                <Search size={17} className="text-blue-600 dark:text-cyan-300" />
                <span>{t('btn_track_complaint')}</span>
              </Link>

              <Link
                href="/demo"
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xs transition flex items-center gap-2 card-hover cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Demo Walkthrough</span>
              </Link>

              <Link
                href="/transparency"
                className="px-4 py-3 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white font-semibold text-sm border border-slate-300 dark:border-white/15 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <TrendingUp size={16} className="text-blue-600 dark:text-cyan-400" />
                <span>Public Stats</span>
              </Link>
            </div>
          </div>

          {/* Hero Right: Live Interactive Dashboard Mockup Preview */}
          <div className="lg:col-span-5 animate-scale-in">
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xl p-5 space-y-4 backdrop-blur-xl">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold ml-2">
                    SPGS Live Dashboard Preview
                  </span>
                </div>
                <div className="flex gap-1 text-[10px]">
                  <button
                    onClick={() => setPreviewTab('citizen')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${previewTab === 'citizen' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Citizen
                  </button>
                  <button
                    onClick={() => setPreviewTab('officer')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${previewTab === 'officer' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Officer
                  </button>
                  <button
                    onClick={() => setPreviewTab('admin')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${previewTab === 'admin' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Dynamic Preview Content */}
              {previewTab === 'citizen' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">SPGS-2026-000001</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-500/30">
                      ● IN PROGRESS
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Water supply unavailable in locality for last five days
                  </h4>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Droplets size={13} className="text-cyan-600 dark:text-cyan-400" />
                    <span>Water Supply Dept • Mayur Vihar Phase 1</span>
                  </div>

                  {/* Stepper bar */}
                  <div className="py-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pb-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Submitted</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Review</span>
                      <span className="text-blue-600 dark:text-cyan-300 font-bold">Assigned</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">In Progress</span>
                      <span>Resolved</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div className="w-4/5 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 h-full rounded-full" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-blue-700 dark:text-cyan-300">Officer Priya Nair (Water Supply):</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      "Emergency tanker dispatched to Pocket 4; sluice valve replacement underway. Expected resolution: Today."
                    </p>
                  </div>
                </div>
              )}

              {previewTab === 'officer' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Water Supply Department Queue</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 font-bold text-[10px]">
                      SLA: 14h Left
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="font-black text-slate-900 dark:text-white text-base">5</div>
                      <span className="text-slate-500 dark:text-slate-400">Assigned</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="font-black text-amber-600 dark:text-amber-400 text-base">2</div>
                      <span className="text-slate-500 dark:text-slate-400">High Pri</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="font-black text-emerald-600 dark:text-emerald-400 text-base">4</div>
                      <span className="text-slate-500 dark:text-slate-400">Resolved</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Direct access to transition status, upload field proof, and post citizen-visible updates.
                  </p>
                  <Link
                    href="/officer/dashboard"
                    className="block text-center py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
                  >
                    Open Officer Desk →
                  </Link>
                </div>
              )}

              {previewTab === 'admin' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">National Administration Oversight</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      83% Resolution Rate
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Active Departments:</span>
                      <span className="text-slate-900 dark:text-white font-bold">10 Municipal Depts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">SLA Enforcement:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Automated Zonal Escalation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Audit Logs:</span>
                      <span className="text-slate-900 dark:text-white font-bold">Immutable PostgreSQL Records</span>
                    </div>
                  </div>
                  <Link
                    href="/admin/dashboard"
                    className="block text-center py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Open Admin Console →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Counter Ribbon */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 card-hover animate-fade-in stagger-1">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Grievances Registered
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 card-hover animate-fade-in stagger-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.resolutionRate}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Resolution Redressal Rate
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 card-hover animate-fade-in stagger-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.avgResolutionDays} Days
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Average Redressal Time
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 card-hover animate-fade-in stagger-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              10 Departments
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Unified Civic Integration
            </p>
          </div>
        </div>
      </section>

      {/* 4-Step Redressal Lifecycle */}
      <section id="how-it-works" className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Accountable Governance Workflow
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            How Complaints Are Resolved on SPGS
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            A transparent end-to-end journey ensuring every citizen issue reaches the competent department officer with statutory deadlines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 card-hover">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Lodge with Evidence
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Citizen enters issue details, uploads photo evidence, selects GPS location via OpenStreetMap, and receives a unique Grievance ID.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 card-hover">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Smart Routing & SLA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rule engine classifies the category, assigns the grievance to the competent ward officer, and calculates enforceable SLA deadlines.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 card-hover">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Action & Escalation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Field officers post updates and relief notes. If statutory deadlines are missed, the system automatically triggers zonal escalation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 card-hover">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Resolution & Rating
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Work is verified, officer provides resolution proof, and citizen gives star ratings or can reopen unresolved cases within 14 days.
            </p>
          </div>
        </div>
      </section>

      {/* Key Innovation Features Section */}
      <section id="features" className="space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Engineered for Governance Impact
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Core Civic-Tech Capabilities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Built from first principles for Indian municipal environments to tackle common bottlenecks in public grievance systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 card-hover"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${feat.color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Departments Grid (All 10 Departments) */}
      <section id="departments" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Civic Authorities
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Supported Municipal Departments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sample configurable civic departments covering essential urban and rural administrative services.
            </p>
          </div>
          <Link
            href="/citizen/submit"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Submit to any department →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {departmentsList.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.name}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition flex items-center gap-3 card-hover"
              >
                <div className={`w-10 h-10 rounded-xl ${dept.bg} ${dept.color} flex items-center justify-center shrink-0 shadow-xs`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {dept.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Code: {dept.code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* In-Page FAQ Accordion */}
      <section id="faq" className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Citizen Knowledge Base
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Get answers about grievance filing, tracking, statutory deadlines, and citizen rights.
            </p>
          </div>
          <Link
            href="/faq"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Full Citizen Charter & FAQ →
          </Link>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp size={16} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400 shrink-0" />
                )}
              </button>
              {expandedFaq === idx && (
                <div className="p-4 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Privacy and Responsible-Use Notice */}
      <section className="p-6 rounded-3xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Lock size={22} />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Privacy-Protected Civic Platform
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              In accordance with Digital Personal Data Protection principles, all citizen evidence and personal details are strictly isolated to authorized department officers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/privacy"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Terms of Use
          </Link>
        </div>
      </section>
    </div>
  );
}
