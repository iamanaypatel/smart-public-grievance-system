'use client';

import React from 'react';
import { HelpCircle, Shield, Clock, BookOpen, AlertCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is the Smart Public Grievance System (SPGS)?',
      a: 'SPGS is a civic-tech digital redressal prototype built for Indian citizens to submit grievances directly to municipal authorities, track status changes in real time, review officer notes, and benchmark government service resolution.',
    },
    {
      q: 'What is the standard SLA response timeframe?',
      a: 'Service Level Agreements (SLAs) vary by department and urgency: Emergency complaints (drinking water outage, sparking transformers, severe road cave-ins) carry an SLA of 24–48 hours; High priority complaints carry an SLA of 2–4 days; Normal civic complaints carry 5–7 days.',
    },
    {
      q: 'What happens when a department misses its SLA deadline?',
      a: 'The system automatically tags the complaint as ESCALATED, triggers an alert to the Zonal Commissioner, and records the failure in the permanent audit trail.',
    },
    {
      q: 'Can a citizen reopen an unresolved complaint?',
      a: 'Yes. Citizens have a 14-day window after an officer marks a case "Resolved" to confirm satisfaction or request a reopening if field work is incomplete.',
    },
    {
      q: 'What issues cannot be entertained on SPGS (Sub-Judice)?',
      a: 'Matters under active litigation in civil/criminal courts, private land title disputes, or official RTI queries cannot be adjudicated on this portal and will be legitimately rejected with sub-judice citations.',
    },
    {
      q: 'How is citizen privacy protected?',
      a: 'On the Public Transparency Dashboard, all personal identifiable information (citizen names, phone numbers, email addresses, exact house numbers) is strictly anonymized. Only aggregated statistics and municipal trends are visible publicly.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Citizen Charter & Knowledge Base
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Frequently Asked Questions & Rights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Understand public redressal guidelines, statutory SLA timelines, and citizen privacy protections.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle size={16} className="text-blue-600 shrink-0" />
              <span>{f.q}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
              {f.a}
            </p>
          </div>
        ))}
      </div>

      {/* Privacy Policy & Terms Section */}
      <div id="privacy" className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Shield size={16} className="text-emerald-600" />
          <span>Privacy & Data Governance Notice</span>
        </h2>
        <p>
          Under the Digital Personal Data Protection principles, SPGS collects only essential information required for municipal grievance redressal. Evidence photos and locations are accessible only to authorized departmental field officers and system administrators.
        </p>
        <p>
          This is an innovation competition demonstration prototype and does not assert official government authority.
        </p>
      </div>
    </div>
  );
}
