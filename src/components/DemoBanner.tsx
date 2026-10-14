'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DemoTourModal } from './DemoTourModal';
import {
  RotateCcw,
  Sparkles,
  User,
  Droplets,
  Trash2,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';

export function DemoBanner() {
  const { user, switchDemoUser } = useAuth();
  const [showTour, setShowTour] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to reset demo data back to the clean initial competition state?')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: {
          'x-user-id': 'user-admin-1', // Admin privilege for reset
        },
      });
      const data = await res.json();
      if (data.success) {
        setResetMessage('Demo data reset successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        alert(data.error || 'Reset failed');
      }
    } catch (err) {
      alert('Error resetting demo data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div className="bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 text-xs py-2 px-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Badge & Active Identity */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold uppercase tracking-wider text-[10px]">
              <Sparkles size={11} className="text-amber-600 dark:text-amber-400" /> Competition Demo Mode
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-400">Current Role:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {user?.name || 'Guest'}
              </span>
              <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {user?.role || 'Guest'}
                {user?.department_name ? ` • ${user.department_name}` : ''}
              </span>
            </div>
          </div>

          {/* Role quick switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">Quick Switch:</span>

            <button
              onClick={() => switchDemoUser('user-citizen-1')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition text-[11px] font-medium cursor-pointer ${
                user?.id === 'user-citizen-1'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <User size={12} />
              <span>Citizen</span>
            </button>

            <button
              onClick={() => switchDemoUser('user-officer-water')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition text-[11px] font-medium cursor-pointer ${
                user?.id === 'user-officer-water'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <Droplets size={12} className="text-cyan-600 dark:text-cyan-400" />
              <span>Officer (Water)</span>
            </button>

            <button
              onClick={() => switchDemoUser('user-officer-sanitation')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition text-[11px] font-medium cursor-pointer ${
                user?.id === 'user-officer-sanitation'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <Trash2 size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Officer (Sanitation)</span>
            </button>

            <button
              onClick={() => switchDemoUser('user-admin-1')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition text-[11px] font-medium cursor-pointer ${
                user?.id === 'user-admin-1'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <ShieldCheck size={12} className="text-amber-600 dark:text-amber-400" />
              <span>Administrator</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            <button
              onClick={() => setShowTour(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition text-[11px] shadow-xs cursor-pointer"
            >
              <Sparkles size={12} />
              <span>3-Min Tour</span>
            </button>

            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition text-[11px] cursor-pointer"
              title="Reset sample complaints and timeline to clean initial state"
            >
              <RotateCcw size={11} className={isResetting ? 'animate-spin' : ''} />
              <span>{isResetting ? 'Resetting...' : 'Reset Data'}</span>
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="text-center text-[11px] text-emerald-600 dark:text-emerald-400 pt-1 font-semibold animate-pulse">
            ✓ {resetMessage}
          </div>
        )}
      </div>

      <DemoTourModal isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
