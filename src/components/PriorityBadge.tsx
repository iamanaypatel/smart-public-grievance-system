import React from 'react';
import { GrievancePriority } from '@/lib/db/types';
import { AlertCircle, Flame, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: GrievancePriority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const configs = {
    NORMAL: {
      label: 'Normal',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800',
      icon: AlertCircle,
    },
    HIGH: {
      label: 'High Priority',
      bg: 'bg-amber-100 dark:bg-amber-950/80',
      text: 'text-amber-800 dark:text-amber-200 font-semibold',
      border: 'border-amber-300 dark:border-amber-700',
      icon: Flame,
    },
    EMERGENCY: {
      label: 'EMERGENCY',
      bg: 'bg-red-100 dark:bg-red-950',
      text: 'text-red-700 dark:text-red-200 font-bold tracking-wide animate-pulse',
      border: 'border-red-400 dark:border-red-800',
      icon: ShieldAlert,
    },
  }[priority] || {
    label: 'Normal',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: AlertCircle,
  };

  const Icon = configs.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${configs.bg} ${configs.text} ${configs.border} ${padding}`}
    >
      <Icon size={13} className="shrink-0" />
      <span>{configs.label}</span>
    </span>
  );
}
