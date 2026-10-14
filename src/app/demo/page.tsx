'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Send,
  UserCheck,
  Search,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  User,
  Droplets,
  Building2,
  Clock,
  Star,
  Layers,
  Check,
  Info,
} from 'lucide-react';

export default function DemoWalkthroughPage() {
  const router = useRouter();
  const { user, switchDemoUser } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const toggleComplete = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  const handleStepAction = (userId: string, path: string, stepNum: number) => {
    switchDemoUser(userId);
    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps((prev) => [...prev, stepNum]);
    }
    router.push(path);
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset all grievances and status timelines back to the clean initial competition benchmark?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'x-user-id': 'user-admin-1' },
      });
      const data = await res.json();
      if (data.success) {
        setResetMsg('Demonstration data reset to initial benchmark state.');
        setCompletedSteps([]);
        setTimeout(() => {
          setResetMsg(null);
          window.location.reload();
        }, 1200);
      } else {
        alert(data.error || 'Reset failed');
      }
    } catch (e) {
      alert('Error resetting demo database');
    } finally {
      setIsResetting(false);
    }
  };

  const STEPS = [
    {
      num: 1,
      title: 'Step 1: Citizen Complaint Submission',
      role: 'Citizen (Aarav Sharma)',
      userId: 'user-citizen-1',
      path: '/citizen/submit',
      icon: Send,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60',
      scenario: 'Water supply has been unavailable in my locality for the last five days.',
      details:
        'Demonstrates multi-step intake with rule-based department recommendation (Water Supply), duplicate detection warning, interactive OpenStreetMap GPS pin, and automatic generation of unique ID SPGS-2026-000001.',
      actionLabel: 'Switch to Citizen & Open Submit Form',
    },
    {
      num: 2,
      title: 'Step 2: Department Officer Review & Processing',
      role: 'Officer - Water Supply (Priya Nair)',
      userId: 'user-officer-water',
      path: '/officer/dashboard',
      icon: UserCheck,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60',
      scenario: 'Water Department Officer inspects new complaints and manages department workload.',
      details:
        'Demonstrates role-based queue isolation. Officer Priya Nair sees only Water grievances, transitions status (Under Review → Assigned → In Progress), and posts citizen-visible status updates vs. internal notes.',
      actionLabel: 'Switch to Water Officer & Open Desk',
    },
    {
      num: 3,
      title: 'Step 3: Citizen Tracking & Chronological Timeline',
      role: 'Citizen (Aarav Sharma)',
      userId: 'user-citizen-1',
      path: '/citizen/track?id=SPGS-2026-000001',
      icon: Search,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60',
      scenario: 'Citizen checks live redressal status and officer remarks in real time.',
      details:
        'Demonstrates public tracking by Grievance ID, chronological status timeline, officer notes, SLA countdown, and citizen response controls.',
      actionLabel: 'Switch to Citizen & Track SPGS-2026-000001',
    },
    {
      num: 4,
      title: 'Step 4: Department Resolution & Field Notes',
      role: 'Officer - Water Supply (Priya Nair)',
      userId: 'user-officer-water',
      path: '/grievances/grv-1',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
      scenario: 'Officer files completion report: "Sluice valve replaced; supply restored."',
      details:
        'Officer enters official resolution summary and transitions status to Resolved. Timestamp and actor details are recorded in the immutable database history.',
      actionLabel: 'Go to Case SPGS-2026-000001 to Resolve',
    },
    {
      num: 5,
      title: 'Step 5: Citizen Feedback, Rating & Closure',
      role: 'Citizen (Aarav Sharma)',
      userId: 'user-citizen-1',
      path: '/grievances/grv-3',
      icon: Star,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60',
      scenario: 'Citizen inspects resolved case, rates satisfaction (1–5 stars), or requests reopening.',
      details:
        'Demonstrates statutory 14-day citizen feedback loop. Submitting a 5-star rating automatically closes the grievance and updates live municipal satisfaction scores.',
      actionLabel: 'Inspect Resolved Case & Rating System',
    },
    {
      num: 6,
      title: 'Step 6: SLA Overdue Detection & Auto-Escalation',
      role: 'Admin / Officer Desk',
      userId: 'user-admin-1',
      path: '/grievances/grv-2',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60',
      scenario: 'Case SPGS-2026-000002 has exceeded the statutory 5-day SLA deadline.',
      details:
        'The SLA engine automatically detects missed deadlines, marks the case ESCALATED, alerts the Zonal Commissioner, and records the infraction in the administrative security audit log.',
      actionLabel: 'Inspect Escalated Overdue Case SPGS-2026-000002',
    },
    {
      num: 7,
      title: 'Step 7: Administrator Oversight & Live Analytics',
      role: 'Administrator (Vikramaditya Verma)',
      userId: 'user-admin-1',
      path: '/admin/analytics',
      icon: BarChart3,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60',
      scenario: 'Full administrative intelligence computed dynamically from PostgreSQL records.',
      details:
        'Evaluates real-time Recharts dashboards: department volume vs. resolved, officer caseload distribution, geographic breakdown, citizen ratings, and CSV data export.',
      actionLabel: 'Switch to Admin & Open Analytics',
    },
  ];

  const currentStep = STEPS[activeStep - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Innovation Competition Evaluation Guide</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            End-to-End Demo Walkthrough
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Follow this recommended 7-step presentation flow to evaluate the complete citizen-to-officer-to-administrator lifecycle.
          </p>
        </div>

        {/* Reset control */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 transition shadow-xs cursor-pointer"
          >
            <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      {resetMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center text-xs text-emerald-700 dark:text-emerald-300 font-bold animate-in fade-in">
          ✓ {resetMsg}
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800 pb-3">
          <span>7-Step Redressal Lifecycle</span>
          <span>
            {completedSteps.length} of {STEPS.length} Steps Completed
          </span>
        </div>

        {/* Horizontal Steps Nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STEPS.map((s) => {
            const isCurrent = activeStep === s.num;
            const isDone = completedSteps.includes(s.num);

            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`p-3 rounded-2xl text-left border transition text-xs space-y-1.5 cursor-pointer ${
                  isCurrent
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 shadow-xs'
                    : isDone
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? <Check size={13} /> : s.num}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#{s.num}</span>
                </div>
                <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 line-clamp-1">
                  {s.title.split(':')[1] || s.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${currentStep.color}`}>
                <StepIcon size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Target Role: {currentStep.role}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {currentStep.title}
                </h2>
              </div>
            </div>

            <button
              onClick={() => toggleComplete(currentStep.num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                completedSteps.includes(currentStep.num)
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
              }`}
            >
              <Check size={14} className={completedSteps.includes(currentStep.num) ? 'text-emerald-600' : 'text-slate-400'} />
              <span>{completedSteps.includes(currentStep.num) ? 'Step Completed' : 'Mark as Done'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-[10px]">
                Competition Evaluation Scenario:
              </span>
              <p className="font-medium text-slate-700 dark:text-slate-300 italic">
                “{currentStep.scenario}”
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-300">
              {currentStep.details}
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500">
              Clicking will automatically switch your user persona and take you to the designated screen.
            </div>

            <button
              onClick={() => handleStepAction(currentStep.userId, currentStep.path, currentStep.num)}
              className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 card-hover cursor-pointer"
            >
              <span>{currentStep.actionLabel}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Demo Credentials & Quick Switch Reference */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck size={17} className="text-emerald-600" />
          <span>Evaluation Persona Reference & Security Boundaries</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Citizen Persona</span>
            <div className="font-bold text-slate-900 dark:text-white">Aarav Sharma</div>
            <p className="text-slate-500 text-[11px]">Submits grievances, reviews evidence, gives ratings.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">Officer (Water)</span>
            <div className="font-bold text-slate-900 dark:text-white">Priya Nair</div>
            <p className="text-slate-500 text-[11px]">Processes drinking water supply queue, SLA deadlines.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Officer (Sanitation)</span>
            <div className="font-bold text-slate-900 dark:text-white">Rajesh Kumar</div>
            <p className="text-slate-500 text-[11px]">Handles solid waste, open garbage dumps, drain clearance.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Administrator</span>
            <div className="font-bold text-slate-900 dark:text-white">Vikramaditya Verma</div>
            <p className="text-slate-500 text-[11px]">Full oversight, department SLA config, CSV export, audit logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
