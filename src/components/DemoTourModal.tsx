'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Send,
  UserCheck,
  Search,
  Sparkles,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoTourModal({ isOpen, onClose }: DemoTourModalProps) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { switchDemoUser } = useAuth();

  if (!isOpen) return null;

  const STEPS = [
    {
      step: 1,
      title: 'Step 1: Citizen Submits a Complaint',
      role: 'Citizen (Aarav Sharma)',
      targetUserId: 'user-citizen-1',
      path: '/citizen/submit',
      icon: Send,
      scenario: '“Water supply has been unavailable in my locality for the last five days.”',
      description:
        'Submit a multi-step complaint with rule-based department recommendation, priority tagging, GPS pin, and duplicate detection. A unique Grievance ID (e.g. SPGS-2026-000001) is automatically assigned.',
      actionText: 'Switch to Citizen & Go to Submit Form',
    },
    {
      step: 2,
      title: 'Step 2: Department Officer Reviews Queue',
      role: 'Officer - Water Supply (Priya Nair)',
      targetUserId: 'user-officer-water',
      path: '/officer/dashboard',
      icon: UserCheck,
      scenario: 'Officer views department-specific grievances and processes priority cases.',
      description:
        'The officer inspects incoming complaints in their department queue, changes status (Submitted → Under Review → Assigned → In Progress), and posts citizen-visible updates or private internal notes.',
      actionText: 'Switch to Water Officer & View Desk',
    },
    {
      step: 3,
      title: 'Step 3: Citizen Tracks Live Progress',
      role: 'Citizen (Aarav Sharma)',
      targetUserId: 'user-citizen-1',
      path: '/citizen/track',
      icon: Search,
      scenario: 'Citizen checks the live timeline and responds to requests for information.',
      description:
        'Citizens track their complaint using the grievance ID, review the chronological timeline, and communicate transparently with the department.',
      actionText: 'Switch to Citizen & Track Status',
    },
    {
      step: 4,
      title: 'Step 4: Officer Resolves Complaint',
      role: 'Officer - Water Supply (Priya Nair)',
      targetUserId: 'user-officer-water',
      path: '/grievances/grv-1',
      icon: CheckCircle2,
      scenario: 'Emergency tanker dispatched and main sluice valve replaced.',
      description:
        'Officer enters resolution details and transitions status to Resolved. Citizen can subsequently rate the resolution or request reopening.',
      actionText: 'Go to Grievance Detail to Resolve',
    },
    {
      step: 5,
      title: 'Step 5: Citizen Feedback & Rating',
      role: 'Citizen (Aarav Sharma)',
      targetUserId: 'user-citizen-1',
      path: '/grievances/grv-3',
      icon: Sparkles,
      scenario: 'Citizen provides a 5-star rating and satisfaction confirmation on a resolved case.',
      description:
        'Citizens confirm their satisfaction, submit star ratings and comments, automatically moving the grievance into the Closed state.',
      actionText: 'View Citizen Rating on Resolved Case',
    },
    {
      step: 6,
      title: 'Step 6: SLA Overdue Detection & Escalation',
      role: 'Admin / Officer Desk',
      targetUserId: 'user-admin-1',
      path: '/grievances/grv-2',
      icon: AlertTriangle,
      scenario: 'Case SPGS-2026-000002 has exceeded the 5-day SLA deadline.',
      description:
        'The system automatically identifies missed service level deadlines, applies the ESCALATED tag, alerts zonal commissioners, and logs an audit trail event.',
      actionText: 'Inspect Escalated Case SPGS-2026-000002',
    },
    {
      step: 7,
      title: 'Step 7: Administrator Analytics & Transparency',
      role: 'Admin (Vikramaditya Verma)',
      targetUserId: 'user-admin-1',
      path: '/admin/analytics',
      icon: BarChart3,
      scenario: 'Real-time performance analytics calculated directly from database records.',
      description:
        'Review interactive Recharts charts showing department workloads, resolution rates, monthly trends, and citizen satisfaction scores. Zero hardcoded mock numbers.',
      actionText: 'Open Admin Analytics Dashboard',
    },
  ];

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  const handleStepAction = () => {
    switchDemoUser(currentStep.targetUserId);
    router.push(currentStep.path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-slate-900 dark:text-white border-b border-blue-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <StepIcon size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-amber-400">
                Innovation Competition Pitch Tour
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentStep.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-transparent cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Progress dots */}
          <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            {STEPS.map((s) => (
              <button
                key={s.step}
                onClick={() => setStep(s.step)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  s.step === step
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : s.step < step
                    ? 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
                title={`Go to Step ${s.step}`}
              />
            ))}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-medium">
            <strong>Demonstration Scenario:</strong> {currentStep.scenario}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Role in this Step:
            </span>
            <div className="inline-block px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold text-xs ml-2">
              {currentStep.role}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <ArrowLeft size={14} /> Prev
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStepAction}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-sm transition"
            >
              <span>{currentStep.actionText}</span>
              <ArrowRight size={14} />
            </button>
            {step < STEPS.length && (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
