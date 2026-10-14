# Smart Public Grievance System (SPGS) — India
### Real-Time Civic Grievance Redressal, Officer Workflow & Analytics Platform

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/iamanaypatel/smart-public-grievance-system)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/iamanaypatel/smart-public-grievance-system)

SPGS is a modern, responsive, secure full-stack civic-tech web application designed for transparent, accountable, and time-bound civic grievance redressal in India. It is engineered from first principles for college innovation competitions, live hackathon evaluations, and scalable production deployment.

---

## 🌟 Key Features

1. **Role-Based Portals & Access Control**:
   - **Citizen**: Submit multi-step geo-tagged complaints, track live timeline, communicate with officers, reopen unresolved cases, rate resolution satisfaction (1–5 stars).
   - **Department Officer**: Departmental queue (Water, Sanitation, Electricity, Roads, etc.), update workflow statuses (`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved`), attach resolution evidence, post confidential internal notes vs citizen-visible updates.
   - **Administrator**: Full system oversight, configure department SLAs, create departments, inspect immutable security audit logs, export complaints to CSV.

2. **Smart Capabilities & Automation**:
   - **Rule-Based Department Recommendation**: Automatically detects municipal category from keywords (e.g., "water leakage" → Water Supply; "transformer sparks" → Electricity).
   - **Real-Time Duplicate Complaint Detection**: Checks matching category and locality within recent 14 days and warns citizens prior to submission.
   - **OpenStreetMap Geo-Tagging**: Interactive Leaflet map coordinate picker for incident location precision.
   - **SLA Deadline Tracking & Automatic Escalation**: Enforces departmental response SLAs; flags overdue cases for Zonal Commissioner review.
   - **Bilingual Interface**: Full English & हिन्दी localization toggle.
   - **Public Transparency Dashboard**: Aggregated, anonymized statistics with zero citizen PII exposure.

3. **Database Architecture**:
   - Zero-configuration persistent store (`data/spgs_store.json`) with persistent disk sync.
   - Production PostgreSQL & Supabase migrations (`supabase/schema.sql` and `supabase/seed.sql`) with Row-Level Security (RLS) policies.

---

## 🚀 Quick Start (Running Locally)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Page Sitemap (All 16 Required Pages)

| Page | Route | Description |
|---|---|---|
| **Public Landing Page** | `/` | Hero, live dashboard preview, 4-step workflow, features, 10 departments, FAQ accordion. |
| **Citizen Registration & Login** | `/login` | 1-click evaluation persona selector + email registration. |
| **Citizen Dashboard** | `/citizen/dashboard` | 6 required metrics, recent notifications, filters, grievances table. |
| **Complaint Submission** | `/citizen/submit` | Multi-step form with auto-routing, duplicate check, GPS map picker, draft saving. |
| **Complaint Tracking** | `/citizen/track` | Public lookup by Grievance ID with full timeline inspection. |
| **Complaint Details & Timeline** | `/grievances/[id]` | Chronological audit trail, officer action desk, citizen feedback/reopen modal. |
| **Officer Dashboard** | `/officer/dashboard` | Department-isolated queue, priority filters, SLA countdowns, assignment tools. |
| **Department Management** | `/admin/departments` | Create departments, edit SLA days, inspect category/subcategory hierarchies. |
| **Admin Dashboard** | `/admin/dashboard` | System-wide queue oversight, status filters, CSV report export. |
| **Analytics Dashboard** | `/admin/analytics` | Recharts charts, time-period filters (7d/30d/all), officer caseload, satisfaction ratings. |
| **Public Transparency Dashboard** | `/transparency` | Zero-PII aggregated public performance scorecard & department benchmarking. |
| **Notification Center** | `/notifications` | Live in-app alerts for status updates, escalations, info requests. |
| **Profile & Settings** | `/profile` | Active user persona metadata, jurisdiction district, contact details. |
| **Citizen Charter & FAQ** | `/faq` | Detailed municipal redressal guidelines, rights, and FAQ archive. |
| **Privacy Policy** | `/privacy` | DPDP Act compliance notes, data minimization, citizen rights. |
| **Terms of Service** | `/terms` | Permitted civic complaints, sub-judice exclusion rules, SLA rules. |
| **Demo Walkthrough** | `/demo` | Guided 7-step interactive presentation path for competition judges. |

---

## 🎯 Recommended 7-Step Evaluation Demo Flow

Visit `/demo` or use the **Demo Banner** at the top of the application to test the complete lifecycle:

1. **Step 1 (Citizen Submit)**: Click "Citizen (Aarav Sharma)" → Go to `/citizen/submit` → Click the **"Pre-fill Competition Scenario"** button (Water Outage in Mayur Vihar) → Submit and receive your unique Grievance ID (`SPGS-2026-000001`).
2. **Step 2 (Officer Review)**: Click "Officer (Water - Priya Nair)" in the top banner → View the complaint in the Water Supply queue → Click "Review & Process Case" → Transition status to "In Progress" with an official note.
3. **Step 3 (Citizen Track)**: Click "Citizen" → View the live updated status on the Citizen Dashboard or `/citizen/track?id=SPGS-2026-000001`.
4. **Step 4 (Officer Resolve)**: Switch back to Water Officer → Mark status as "Resolved" with field report: *"Emergency tanker dispatched to Pocket 4; sluice valve replaced"*.
5. **Step 5 (Citizen Rating)**: Switch to Citizen → Open the resolved complaint → Submit a 5-Star satisfaction rating → Complaint automatically transitions to "Closed".
6. **Step 6 (SLA Escalation)**: Inspect case `SPGS-2026-000002` (Garbage Vat) to see automatic system escalation due to exceeded 5-day SLA deadline.
7. **Step 7 (Admin Analytics)**: Switch to Administrator → Open `/admin/analytics` to view dynamic Recharts charts calculated from actual database records.

---

## 👥 Pre-Configured Test Personas

| Role | Name | Identifier | Jurisdiction |
|---|---|---|---|
| **Citizen** | Aarav Sharma | `user-citizen-1` | East Delhi (Mayur Vihar) |
| **Citizen** | Meera Patel | `user-citizen-2` | West Delhi |
| **Officer (Water Supply)** | Priya Nair | `user-officer-water` | New Delhi Ward |
| **Officer (Sanitation)** | Rajesh Kumar | `user-officer-sanitation` | New Delhi Ward |
| **Officer (Electricity)** | Suresh Verma | `user-officer-electricity` | Bengaluru Urban |
| **Administrator** | Vikramaditya Verma | `user-admin-1` | Central Oversight |

---

## 🛠 Technology Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom Civic-Tech color tokens
- **Charts**: Recharts (Dynamic BarCharts, PieCharts, LineCharts)
- **Maps**: OpenStreetMap with Leaflet
- **Icons**: Lucide React
- **Database**: PostgreSQL schema with Supabase support & built-in local persistent JSON store (`data/spgs_store.json`)

---

## 🔒 External Credentials & Demo Modes

- **SMS & Email Notifications**: In-app notifications are fully functional and persist to the database. External Twilio SMS and SendGrid email delivery are intentionally stubbed with a visible "Simulation Mode" badge to avoid requiring paid third-party API credentials during college evaluations.
- **Supabase Integration**: When `NEXT_PUBLIC_SUPABASE_URL` is configured, client queries connect to Supabase. When running locally without cloud credentials, SPGS automatically falls back to its persistent JSON store so evaluators can run the full app with zero configuration.
