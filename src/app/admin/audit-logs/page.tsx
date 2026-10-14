'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuditLog } from '@/lib/db/types';
import { ShieldCheck, Calendar, User, Search, Lock } from 'lucide-react';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit-logs', {
      headers: { 'x-user-id': user?.id || 'user-admin-1' },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setLogs(json.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          Security & Traceability
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          System Security Audit Trail
        </h1>
        <p className="text-xs text-slate-500">
          Immutable audit record of all administrative status transitions, assignments, and escalations.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading security audit trail...
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <strong className="text-slate-800 dark:text-slate-200">{log.actor_name}</strong>
                      <span className="text-[10px] text-slate-400 block capitalize">({log.actor_role})</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {log.resource_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
