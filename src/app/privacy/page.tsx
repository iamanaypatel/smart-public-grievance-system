'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  EyeOff,
  FileText,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            Data Governance & Citizen Rights
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Last Updated: October 2026 • Grounded in the principles of India's Digital Personal Data Protection (DPDP) framework.
          </p>
        </div>
      </div>

      {/* Core Privacy Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Purpose Limitation</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Personal information is collected solely to route, verify, and resolve municipal grievances. We never sell, monetize, or distribute citizen data.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <EyeOff size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero Public PII</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All reports on the Public Transparency Dashboard are strictly anonymized and aggregated. Names, contact numbers, and home addresses are never published.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Role-Based Isolation</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Citizen evidence files and location coordinates are accessible only to verified officers assigned to the corresponding municipal department.
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-8 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            1. Information We Collect
          </h2>
          <p>
            When lodging a civic complaint on the Smart Public Grievance System (SPGS), we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Identity & Contact Details:</strong> Name, email address, phone number, and preferred notification channel (SMS, Email, WhatsApp).</li>
            <li><strong>Incident Details:</strong> Complaint title, descriptive text, department classification, category, and date of occurrence.</li>
            <li><strong>Civic Location Data:</strong> State, district, city/town, locality, PIN code, and optional GPS coordinates selected on OpenStreetMap.</li>
            <li><strong>Supporting Evidence:</strong> User-uploaded photographs (JPG, PNG) and documentation files (PDF) under 10MB per submission.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            2. How We Use Collected Data
          </h2>
          <p>
            Data processed by the platform serves the following administrative objectives:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>Generating a tamper-evident, unique Grievance Tracking ID (e.g. <code>SPGS-2026-000001</code>).</li>
            <li>Executing rule-based department routing to forward complaints to the competent ward officer.</li>
            <li>Calculating statutory Service Level Agreement (SLA) response deadlines and triggering automatic escalation if deadlines lapse.</li>
            <li>Dispatching real-time status update notifications and SMS alerts upon workflow milestones.</li>
            <li>Preventing duplicate spam or parallel filings for the same localized incident within a 14-day window.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            3. Officer Confidentiality & Internal Notes
          </h2>
          <p>
            The platform enforces a strict separation between <strong>citizen-visible updates</strong> and <strong>confidential internal notes</strong>. Technical inter-departmental communications, administrative audits, and internal officer remarks are restricted to authorized personnel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            4. Citizen Rights under DPDP Principles
          </h2>
          <p>
            Indian citizens utilizing the SPGS portal possess the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Right to Confirmation & Access:</strong> Real-time access to the status history and full chronological timeline of their complaint.</li>
            <li><strong>Right to Resolution Review:</strong> A statutory 14-day window post-resolution to rate service quality (1–5 stars) or request a reopening if field work is incomplete.</li>
            <li><strong>Right to Grievance Redressal:</strong> Ability to lodge escalations against unreasonable delays or administrative inaction.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            5. Competition Prototype Notice
          </h2>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
            <strong>Important Disclaimer:</strong> This web application is an independent civic-tech software prototype developed for university innovation competitions and technical evaluation. It is not an officially recognized agency of the Central or State Governments of India. Fictional sample departments and records are provided strictly for demonstration purposes.
          </div>
        </section>
      </div>
    </div>
  );
}
