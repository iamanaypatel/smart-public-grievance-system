'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Department, ComplaintCategory } from '@/lib/db/types';
import { MapPicker } from '@/components/MapPicker';
import {
  FileText,
  MapPin,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Save,
  ShieldCheck,
  Send,
  HelpCircle,
  FileCheck,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function SubmitComplaintPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_date: '',
    priority: 'NORMAL' as 'NORMAL' | 'HIGH' | 'EMERGENCY',
    department_id: '',
    department_name: '',
    category: '',
    subcategory: '',
    state: 'Delhi',
    district: 'East Delhi',
    city_town: 'New Delhi',
    locality: 'Mayur Vihar Phase 1, Pocket 4',
    pincode: '110091',
    latitude: 28.6087,
    longitude: 77.2946,
    preferred_contact: 'SMS' as 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PHONE',
    consent: false,
    files: [] as { name: string; size: number; type: string }[],
  });

  // Smart feature states
  const [recommendation, setRecommendation] = useState<{
    departmentId: string;
    departmentName: string;
    confidence: number;
    reason: string;
  } | null>(null);

  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [suggestedFaqs, setSuggestedFaqs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments & categories
  useEffect(() => {
    fetch('/api/departments')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setDepartments(json.departments || []);
          setCategories(json.categories || []);
          if (json.departments?.length > 0 && !formData.department_id) {
            setFormData((prev) => ({
              ...prev,
              department_id: json.departments[0].id,
              department_name: json.departments[0].name,
            }));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingDepts(false));

    // Load draft if available
    const draft = localStorage.getItem('spgs_draft_complaint');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {}
    } else {
      setFormData((prev) => ({
        ...prev,
        incident_date: new Date().toISOString().slice(0, 10),
      }));
    }
  }, []);

  // Real-time recommendation & duplicate check on text changes
  useEffect(() => {
    if (formData.title.length > 5 || formData.description.length > 10) {
      const timer = setTimeout(() => {
        fetch('/api/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            department_id: formData.department_id,
            locality: formData.locality,
            pincode: formData.pincode,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              if (res.recommendation) setRecommendation(res.recommendation);
              if (res.duplicateCheck?.hasDuplicate) {
                setDuplicateWarning(res.duplicateCheck);
              } else {
                setDuplicateWarning(null);
              }
              if (res.suggestedFaqs) setSuggestedFaqs(res.suggestedFaqs);
            }
          })
          .catch(() => {});
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [formData.title, formData.description, formData.department_id, formData.locality]);

  const applyRecommendation = () => {
    if (!recommendation) return;
    setFormData((prev) => ({
      ...prev,
      department_id: recommendation.departmentId,
      department_name: recommendation.departmentName,
    }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem('spgs_draft_complaint', JSON.stringify(formData));
    alert('Draft saved locally! You can resume submission at any time.');
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.title.trim() || formData.title.length < 10) {
        errs.title = 'Title must be at least 10 characters describing the issue.';
      }
      if (!formData.description.trim() || formData.description.length < 20) {
        errs.description = 'Description must be at least 20 characters providing clear context.';
      }
      if (!formData.incident_date) {
        errs.incident_date = 'Please select the date of occurrence.';
      }
    } else if (currentStep === 2) {
      if (!formData.department_id) {
        errs.department_id = 'Please select a relevant department.';
      }
    } else if (currentStep === 3) {
      if (!formData.locality.trim()) {
        errs.locality = 'Locality / Area / Landmark is required.';
      }
      if (!formData.city_town.trim()) {
        errs.city_town = 'City / Town is required.';
      }
      if (!formData.state.trim()) {
        errs.state = 'State is required.';
      }
    } else if (currentStep === 5) {
      if (!formData.consent) {
        errs.consent = 'You must confirm the truthfulness declaration before submitting.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(5, s + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setIsSubmitting(true);

    try {
      const selectedDept = departments.find((d) => d.id === formData.department_id);
      const payload = {
        title: formData.title,
        description: formData.description,
        department_id: formData.department_id,
        department_name: selectedDept?.name || formData.department_name || 'Water Supply',
        category: formData.category || 'General Civic Grievance',
        subcategory: formData.subcategory || '',
        priority: formData.priority,
        incident_date: formData.incident_date,
        state: formData.state,
        district: formData.district,
        city_town: formData.city_town,
        locality: formData.locality,
        pincode: formData.pincode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        preferred_contact: formData.preferred_contact,
        citizen_phone: user?.phone || '+91 98765 43210',
        citizen_email: user?.email || 'citizen@example.com',
      };

      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'user-citizen-1',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('spgs_draft_complaint');
        setSubmissionSuccess(data.data);
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      alert('Network error while lodging grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill demo scenario with 1-click
  const fillDemoScenario = () => {
    const waterDept = departments.find((d) => d.name.toLowerCase().includes('water')) || departments[0];
    setFormData({
      title: 'Water supply has been unavailable in my locality for the last five days',
      description: 'Drinking water supply to Pocket 4, Mayur Vihar Phase 1 has completely stopped since October 8. Over 150 families are affected and relying on expensive private water tankers. Despite multiple verbal complaints to the local junior engineer, no supply has resumed.',
      incident_date: new Date().toISOString().slice(0, 10),
      priority: 'EMERGENCY',
      department_id: waterDept?.id || '',
      department_name: waterDept?.name || 'Water Supply',
      category: 'Water Supply Disruption',
      subcategory: 'No Supply for > 48 Hours',
      state: 'Delhi',
      district: 'East Delhi',
      city_town: 'New Delhi',
      locality: 'Mayur Vihar Phase 1, Pocket 4',
      pincode: '110091',
      latitude: 28.6087,
      longitude: 77.2946,
      preferred_contact: 'SMS',
      consent: true,
      files: [{ name: 'pipeline_dry_tap_photo.jpg', size: 1048576, type: 'image/jpeg' }],
    });
  };

  // Success view
  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
          <CheckCircle2 size={44} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Registered on National Public Grievance Database
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Grievance Registered Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Your complaint has been logged and assigned to the relevant department queue. An official SMS confirmation has been dispatched.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Unique Grievance ID</span>
              <div className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {submissionSuccess.grievance_id}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Initial Status</span>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {submissionSuccess.status}
              </div>
            </div>
          </div>

          <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
            <p><strong>Department:</strong> {submissionSuccess.department_name}</p>
            <p><strong>Location:</strong> {submissionSuccess.locality}, {submissionSuccess.city_town}</p>
            <p><strong>SLA Resolution Target:</strong> {new Date(submissionSuccess.sla_deadline).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => router.push(`/grievances/${submissionSuccess.id}`)}
            className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <span>Track Timeline & Updates</span>
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => router.push('/citizen/dashboard')}
            className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header & Demo Quick Fill */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Public Redressal Service
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Submit a Public Grievance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Lodge complaints directly with municipal corporations and utility departments across India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fillDemoScenario}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition shadow-xs"
            title="Auto-fill Competition Pitch Scenario (Water supply outage in Mayur Vihar)"
          >
            <Sparkles size={14} />
            <span>Pre-fill Competition Scenario</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
          >
            <Save size={13} />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Multi-step Stepper Indicator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Department' },
            { num: 3, label: 'Location' },
            { num: 4, label: 'Evidence' },
            { num: 5, label: 'Review' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => validateStep(step) && setStep(s.num)}
              className={`p-2 rounded-xl transition flex flex-col items-center gap-1 ${
                step === s.num
                  ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900'
                  : s.num < step
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === s.num
                    ? 'bg-blue-600 text-white'
                    : s.num < step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {s.num < step ? '✓' : s.num}
              </div>
              <span className="hidden sm:inline text-[11px]">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duplicate Complaint Alert Banner */}
      {duplicateWarning && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
            <AlertTriangle size={18} />
            <span>Potential Duplicate Complaint Warning</span>
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            A similar complaint has recently been submitted for this locality in the same department.
          </p>
          <div className="space-y-1.5 pt-1">
            {duplicateWarning.matchedGrievances.slice(0, 2).map((m: any) => (
              <div
                key={m.id}
                className="p-2.5 rounded-lg bg-white/80 dark:bg-black/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">
                    {m.grievance_id}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{m.title}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Knowledge Base FAQs before submission */}
      {suggestedFaqs.length > 0 && step === 1 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs">
            <Lightbulb size={16} className="text-amber-500" />
            <span>Suggested Redressal FAQs for Quick Assistance:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedFaqs.slice(0, 2).map((faq) => (
              <a
                key={faq.id}
                href={faq.link}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition block text-xs"
              >
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{faq.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{faq.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* FORM STEPS CONTENT */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              <span>Step 1: Grievance Basic Information</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Complaint Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Water supply has been unavailable in my locality for the last five days"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              />
              {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title}</p>}
            </div>

            {/* Smart Recommendation Prompt */}
            {recommendation && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                  <Sparkles size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Auto-Detected Department:{' '}
                    <strong>{recommendation.departmentName}</strong> ({recommendation.reason})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={applyRecommendation}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shrink-0"
                >
                  Apply Recommendation
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Detailed Grievance Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue comprehensively, mentioning affected streets, duration, hazard level, and any previous attempts..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              />
              {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Date of Incident / Start <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
                >
                  <option value="NORMAL">Normal (Standard SLA)</option>
                  <option value="HIGH">High (Urgent civic disruption)</option>
                  <option value="EMERGENCY">Emergency (Hazard to life / safety / vital supply)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Department & Category */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="text-blue-600" size={20} />
              <span>Step 2: Department & Grievance Categorization</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => {
                  const dept = departments.find((d) => d.id === e.target.value);
                  setFormData({
                    ...formData,
                    department_id: e.target.value,
                    department_name: dept?.name || '',
                    category: '',
                    subcategory: '',
                  });
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code}) — SLA: Normal {dept.sla_days_normal}d / Emerg {dept.sla_days_emergency}d
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
                >
                  <option value="">Select Category...</option>
                  {categories
                    .filter((c) => c.department_id === formData.department_id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  <option value="Other Civic Issue">Other Civic Issue</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder="e.g. No Supply for > 48 Hours"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Map */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-blue-600" size={20} />
              <span>Step 3: Location Details & OpenStreetMap Pin</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Delhi, Gujarat, Maharashtra"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. East Delhi, Ahmedabad"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  City / Town <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city_town}
                  onChange={(e) => setFormData({ ...formData, city_town: e.target.value })}
                  placeholder="e.g. New Delhi, Ahmedabad"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Locality / Colony / Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="e.g. Mayur Vihar Phase 1, Pocket 4"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 110091"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Interactive OpenStreetMap Component */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Interactive Geographic Location (OpenStreetMap)</span>
                <span className="text-[11px] font-normal text-slate-400">
                  Geo-tagged coordinate binding
                </span>
              </label>
              <MapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                locality={formData.locality}
                city={formData.city_town}
                onLocationSelect={(lat, lng) =>
                  setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                }
              />
            </div>
          </div>
        )}

        {/* STEP 4: Evidence & Contact */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="text-blue-600" size={20} />
              <span>Step 4: Evidence Documents & Preferred Contact</span>
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Attach Photographs & PDF Evidence (Optional)
              </label>
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <Upload size={28} className="mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Drop photographs, scanned receipts, or PDF reports here
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports JPG, PNG, PDF up to 10MB per file. Evidence is stored securely and accessible only to assigned officers.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      files: [
                        ...prev.files,
                        { name: `evidence_doc_${Date.now()}.jpg`, size: 1048576, type: 'image/jpeg' },
                      ],
                    }))
                  }
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                >
                  Simulate Photo Upload
                </button>
              </div>

              {formData.files.length > 0 && (
                <div className="space-y-1 pt-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Attached files:</span>
                  {formData.files.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-slate-700 dark:text-slate-300">{f.name}</span>
                      <span className="text-slate-400 text-[10px]">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Preferred Notification Channel <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['SMS', 'EMAIL', 'WHATSAPP', 'PHONE'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferred_contact: method })}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                      formData.preferred_contact === method
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review, Consent & Submission */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="text-blue-600" size={20} />
              <span>Step 5: Review Details & Truthfulness Declaration</span>
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-semibold">Title:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-sm">
                  {formData.title}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-semibold">Department:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.department_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-semibold">Priority:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{formData.priority}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-semibold">Location:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formData.locality}, {formData.city_town}, {formData.state} ({formData.pincode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Contact Via:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.preferred_contact}</span>
              </div>
            </div>

            {/* Consent & Privacy Notice */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {t('field_consent')} I understand that citizen personal identifiable information (name, phone, address) is kept strictly confidential and is not published on the Public Transparency Dashboard.
                </label>
              </div>
              {errors.consent && <p className="text-xs text-red-500 font-medium pl-7">{errors.consent}</p>}
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft size={14} />
              <span>{t('btn_prev')}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition"
            >
              <span>{t('btn_next')}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-lg transition disabled:opacity-50"
            >
              <Send size={15} className={isSubmitting ? 'animate-spin' : ''} />
              <span>{isSubmitting ? 'LODGING GRIEVANCE...' : t('btn_submit')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
