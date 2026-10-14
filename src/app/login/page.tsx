'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Landmark,
  User,
  ShieldCheck,
  Droplets,
  Trash2,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchDemoUser, login, demoUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'citizen' | 'officer' | 'admin'>('citizen');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await login(email.trim(), role);
    if (role === 'citizen') router.push('/citizen/dashboard');
    else if (role === 'officer') router.push('/officer/dashboard');
    else router.push('/admin/dashboard');
  };

  const handleDemoSelect = (userId: string, targetPath: string) => {
    switchDemoUser(userId);
    router.push(targetPath);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
          <Landmark size={26} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Access SPGS Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign in to track your grievances or choose a demo persona for competition evaluation.
        </p>
      </div>

      {/* Demo 1-Click Role Accounts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Sparkles size={14} />
          <span>Competition Evaluation Personas (1-Click)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleDemoSelect('user-citizen-1', '/citizen/dashboard')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/60 text-left transition flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-slate-800 dark:text-white">Aarav Sharma</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Citizen Portal</p>
            </div>
            <ArrowRight size={14} className="text-slate-400" />
          </button>

          <button
            onClick={() => handleDemoSelect('user-officer-water', '/officer/dashboard')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 bg-slate-50 dark:bg-slate-800/60 text-left transition flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-slate-800 dark:text-white">Priya Nair</p>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">Officer (Water)</p>
            </div>
            <ArrowRight size={14} className="text-slate-400" />
          </button>

          <button
            onClick={() => handleDemoSelect('user-officer-sanitation', '/officer/dashboard')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 text-left transition flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-slate-800 dark:text-white">Rajesh Kumar</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Officer (Sanitation)</p>
            </div>
            <ArrowRight size={14} className="text-slate-400" />
          </button>

          <button
            onClick={() => handleDemoSelect('user-admin-1', '/admin/dashboard')}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 bg-slate-50 dark:bg-slate-800/60 text-left transition flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-xs text-slate-800 dark:text-white">Vikramaditya Verma</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Administrator</p>
            </div>
            <ArrowRight size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Manual Email Login Form */}
      <form
        onSubmit={handleCustomLogin}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Or Sign In with Email
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@example.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="citizen">Citizen</option>
            <option value="officer">Department Officer</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition"
        >
          Sign In / Register
        </button>
      </form>
    </div>
  );
}
