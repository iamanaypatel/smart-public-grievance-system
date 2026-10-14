'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileCheck,
  ShieldAlert,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Building2,
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-3"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
        <div className="space-y-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Civic Redressal Charter & Conditions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Terms of Service & Usage Guidelines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Rules governing public grievance submission, statutory timelines, sub-judice limitations, and citizen conduct.
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileCheck size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Legitimate Civic Scope</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Covers municipal services including water supply, sanitation, electricity, roads, public health, and municipal infrastructure.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Scale size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sub-Judice Exclusion</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Matters under active litigation in civil/criminal courts or land ownership disputes cannot be adjudicated through this portal.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Binding SLA Rules</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Departments must respond within 24 hours for emergency grievances, 3 days for high-priority cases, and 7 days for standard complaints.
          </p>
        </div>
      </div>

      {/* Detailed Terms */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-8 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or submitting a grievance on the Smart Public Grievance System (SPGS), you agree to abide by these Terms of Service, the Citizen Charter, and all applicable municipal bylaws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            2. Citizen Declaration & Integrity
          </h2>
          <p>
            When lodging a complaint, the citizen declares and covenants that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>The information, photographs, and coordinates submitted are factual and accurately represent a genuine public issue.</li>
            <li>No offensive, defamatory, politically motivated, or abusive language will be included in grievance descriptions or comments.</li>
            <li>Repeated parallel filings for an identical issue will be merged by the automated duplicate detection engine to preserve departmental bandwidth.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            3. Inadmissible Matters (Rejection Criteria)
          </h2>
          <p>
            Authorized officers reserve the statutory right to legitimately reject grievances under the following circumstances, provided that a detailed reason is recorded in the permanent audit trail:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Sub-Judice Matters:</strong> Any dispute pending adjudication before any High Court, District Court, or Judicial Tribunal.</li>
            <li><strong>Private Title Disputes:</strong> Personal property boundary or tenancy disputes between private individuals.</li>
            <li><strong>RTI Inquiries:</strong> Queries seeking official government documents or files that must be lodged under the Right to Information Act, 2005.</li>
            <li><strong>Frivolous / Vexatious Claims:</strong> Complaints lacking verifiable location coordinates or evidence after repeated requests for information.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            4. Service Level Agreements & Escalation
          </h2>
          <p>
            Departments are held accountable to published SLA timeframes. When an assigned officer does not transition an emergency or high-priority complaint within statutory limits, the system triggers an automatic escalation event to the Zonal Commissioner and logs the infraction in the administrative security audit log.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            5. Independence & Prototype Declaration
          </h2>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
            This platform is an independent digital civic-tech solution built for collegiate competitions and engineering demonstrations. It does not replace or supersede official government portals (such as CPGRAMS or state-level portals) unless an officially sanctioned integration has been deployed and verified.
          </div>
        </section>
      </div>
    </div>
  );
}
