import React from 'react';
import { GrievanceStatus } from '@/lib/db/types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileQuestion,
  UserCheck,
  RotateCcw,
  XCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: GrievanceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs: Record<
    GrievanceStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    SUBMITTED: {
      label: 'Submitted',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Clock,
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: HelpCircle,
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: UserCheck,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Clock,
    },
    MORE_INFO_REQUIRED: {
      label: 'More Info Required',
      bg: 'bg-orange-50 dark:bg-orange-950/60',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800',
      icon: FileQuestion,
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    },
    CLOSED: {
      label: 'Closed',
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700',
      icon: CheckCircle2,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-red-50 dark:bg-red-950/60',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle,
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-pink-50 dark:bg-pink-950/60',
      text: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-200 dark:border-pink-800',
      icon: RotateCcw,
    },
    ESCALATED: {
      label: 'Escalated / Overdue',
      bg: 'bg-rose-100 dark:bg-rose-950',
      text: 'text-rose-700 dark:text-rose-200 font-semibold animate-pulse',
      border: 'border-rose-400 dark:border-rose-800',
      icon: AlertTriangle,
    },
  };

  const config = configs[status] || configs.SUBMITTED;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <Icon size={iconSizes} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
