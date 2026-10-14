import React from 'react';
import { GrievanceStatusHistory } from '@/lib/db/types';
import { StatusBadge } from './StatusBadge';
import { User, Shield, Briefcase, Calendar } from 'lucide-react';

interface TimelineViewProps {
  history: GrievanceStatusHistory[];
}

export function TimelineView({ history }: TimelineViewProps) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500 py-4 italic">No timeline events recorded yet.</p>;
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'citizen':
        return <User size={14} className="text-blue-500" />;
      case 'officer':
        return <Briefcase size={14} className="text-indigo-500" />;
      case 'admin':
        return <Shield size={14} className="text-amber-500" />;
      default:
        return <User size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {history.map((event, index) => {
        const isLatest = index === history.length - 1;
        const eventDate = new Date(event.created_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        return (
          <div key={event.id || index} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 transition-all ${
                isLatest
                  ? 'border-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                  : 'border-slate-400 dark:border-slate-600'
              }`}
            />

            <div className="bg-white dark:bg-slate-900/90 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={event.to_status} size="sm" />
                  {isLatest && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={12} />
                  <span>{eventDate}</span>
                </div>
              </div>

              {/* Remarks */}
              <p className="text-sm text-slate-700 dark:text-slate-300 font-normal leading-relaxed mb-3">
                {event.remarks}
              </p>

              {/* Attribution */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  {getRoleIcon(event.changed_by_role)}
                  {event.changed_by_name}
                </span>
                <span>•</span>
                <span className="capitalize text-slate-400">{event.changed_by_role}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
