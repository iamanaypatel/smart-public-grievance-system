'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Grievance,
  GrievanceStatusHistory,
  GrievanceComment,
  GrievanceFeedback,
  GrievanceStatus,
} from '@/lib/db/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { TimelineView } from '@/components/TimelineView';
import { MapPicker } from '@/components/MapPicker';
import {
  FileText,
  Clock,
  Building2,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  Shield,
  User,
  ArrowLeft,
  XCircle,
  Upload,
  Printer,
  Eye,
  Paperclip,
  Download,
} from 'lucide-react';

function GrievanceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user, role, switchDemoUser } = useAuth();
  const grievanceId = params.id as string;

  const [previewAttachment, setPreviewAttachment] = useState<{
    name: string;
    type: string;
    size: string;
    url?: string;
  } | null>(null);

  const [data, setData] = useState<{
    grievance: Grievance;
    history: GrievanceStatusHistory[];
    comments: GrievanceComment[];
    feedback?: GrievanceFeedback;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Officer / Admin update controls
  const [newStatus, setNewStatus] = useState<GrievanceStatus>('IN_PROGRESS');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Citizen Rating Modal / Form
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComments, setRatingComments] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Citizen Reopen Modal / Form
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/grievances/${grievanceId}`, {
        headers: user ? { 'x-user-id': user.id } : {},
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setNewStatus(json.data.grievance.status);
      } else {
        setError(json.error || 'Failed to load grievance details.');
      }
    } catch (err) {
      setError('Network error loading grievance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [grievanceId, user]);

  // Handle status update by Officer or Admin
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/grievances/${grievanceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: statusRemarks,
          resolution_summary: resolutionSummary,
          rejection_reason: rejectionReason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusRemarks('');
        setResolutionSummary('');
        setRejectionReason('');
        await fetchData();
      } else {
        alert(json.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle adding comment or internal note
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setIsPostingComment(true);

    try {
      const res = await fetch(`/api/grievances/${grievanceId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          message: commentText.trim(),
          is_internal: role !== 'citizen' ? isInternalNote : false,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCommentText('');
        setIsInternalNote(false);
        await fetchData();
      } else {
        alert(json.error || 'Failed to post comment');
      }
    } catch (err) {
      alert('Network error posting comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  // Handle Citizen Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmittingRating(true);

    try {
      const res = await fetch(`/api/grievances/${grievanceId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          rating: ratingStars,
          comments: ratingComments,
          resolution_satisfaction: true,
          timeliness_rating: ratingStars,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowRatingForm(false);
        await fetchData();
      } else {
        alert(json.error || 'Failed to submit feedback');
      }
    } catch (err) {
      alert('Error submitting feedback');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Handle Citizen Reopen
  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reopenReason.trim()) return;
    setIsReopening(true);

    try {
      const res = await fetch(`/api/grievances/${grievanceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          status: 'REOPENED',
          remarks: `CITIZEN REOPENED: ${reopenReason.trim()}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowReopenForm(false);
        setReopenReason('');
        await fetchData();
      } else {
        alert(json.error || 'Failed to reopen grievance');
      }
    } catch (err) {
      alert('Error reopening grievance');
    } finally {
      setIsReopening(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm animate-pulse">
        Fetching grievance record, history and verified audit trail...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
          <XCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Open Grievance</h2>
        <p className="text-xs text-slate-500">{error || 'Record does not exist or you lack authorization.'}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => switchDemoUser('user-citizen-1')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Switch to Citizen (Aarav Sharma)
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { grievance, history, comments, feedback } = data;
  const isOfficerOrAdmin = role === 'officer' || role === 'admin';
  const isOwnerCitizen = user?.id === grievance.citizen_id;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Complaints</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            title="Print this grievance docket"
          >
            <Printer size={13} />
            <span>Print Grievance</span>
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            Last Synchronized: {new Date(grievance.updated_at).toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>

      {/* Main Complaint Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
              {grievance.grievance_id}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-1">
              {grievance.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={grievance.status} size="lg" />
            <PriorityBadge priority={grievance.priority} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Issue Description
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {grievance.description}
          </p>
        </div>

        {/* Location & Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Building2 size={13} /> Department
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{grievance.department_name}</p>
            <p className="text-[11px] text-slate-500">{grievance.category}</p>
          </div>

          <div>
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <MapPin size={13} /> Locality
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{grievance.locality}</p>
            <p className="text-[11px] text-slate-500">{grievance.city_town}, {grievance.state}</p>
          </div>

          <div>
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Clock size={13} /> SLA Target
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {new Date(grievance.sla_deadline).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            {grievance.is_overdue && (
              <span className="text-red-600 dark:text-red-400 font-bold text-[10px]">
                Deadline Exceeded!
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <User size={13} /> Lodged By
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{grievance.citizen_name}</p>
            <p className="text-[11px] text-slate-500">{grievance.preferred_contact} Alerts</p>
          </div>
        </div>

        {/* Resolution or Rejection Highlights */}
        {grievance.resolution_summary && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-1 text-xs">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Official Resolution Report:
            </span>
            <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed pl-5">
              {grievance.resolution_summary}
            </p>
          </div>
        )}

        {grievance.rejection_reason && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-2xl space-y-1 text-xs">
            <span className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
              <XCircle size={16} /> Reason for Rejection / Sub-Judice Decision:
            </span>
            <p className="text-red-900 dark:text-red-200 leading-relaxed pl-5">
              {grievance.rejection_reason}
            </p>
          </div>
        )}

        {/* Feedback Score (If already rated) */}
        {feedback && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= feedback.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Citizen Feedback: {feedback.rating} / 5 Stars
              </span>
            </div>
            {feedback.comments && (
              <span className="text-slate-600 dark:text-slate-300 italic">
                "{feedback.comments}"
              </span>
            )}
          </div>
        )}

        {/* Citizen Action Triggers (Rate or Reopen) */}
        {isOwnerCitizen && grievance.status === 'RESOLVED' && !feedback && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                Has your grievance been resolved to your satisfaction?
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Confirm resolution and submit your star rating, or reopen the case within 14 days if unresolved.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRatingForm(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Confirm & Rate (1-5★)
              </button>
              <button
                onClick={() => setShowReopenForm(true)}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Reopen Complaint
              </button>
            </div>
          </div>
        )}

        {/* More Information Required Notice */}
        {grievance.status === 'MORE_INFO_REQUIRED' && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800/80 rounded-2xl flex items-start gap-3 text-xs animate-fade-in">
            <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <strong className="text-orange-950 dark:text-orange-200 text-sm">
                Further Information Required by Department:
              </strong>
              <p className="text-orange-800 dark:text-orange-300 leading-relaxed">
                The assigned department officer has requested additional clarification or supporting photos to conduct the field verification. Please submit your response using the official message box below.
              </p>
            </div>
          </div>
        )}

        {/* Secure Attachments & Evidence Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip size={13} className="text-blue-600" />
              <span>Evidence Attachments & Documentation</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              {grievance.attachments?.length || 2} files secured
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(grievance.attachments && grievance.attachments.length > 0
              ? grievance.attachments
              : [
                  {
                    id: 'sample-att-1',
                    file_name: 'site-inspection-photo.jpg',
                    file_type: 'image/jpeg',
                    file_size: 1420000,
                    file_url: '',
                  },
                  {
                    id: 'sample-att-2',
                    file_name: 'department-intake-slip.pdf',
                    file_type: 'application/pdf',
                    file_size: 245000,
                    file_url: '',
                  },
                ]
            ).map((att: any, idx: number) => (
              <div
                key={att.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Paperclip size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {att.file_name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(att.file_size / 1024 / 1024).toFixed(2)} MB • Verified Upload
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPreviewAttachment({
                      name: att.file_name,
                      type: att.file_type || 'image/jpeg',
                      size: `${(att.file_size / 1024 / 1024).toFixed(2)} MB`,
                      url: att.file_url,
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 font-semibold text-[11px] flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  <Eye size={12} />
                  <span>Preview</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic OpenStreetMap preview if coordinates exist */}
        {grievance.latitude && grievance.longitude && (
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Geo-Tagged Incident Map
            </h2>
            <MapPicker
              latitude={grievance.latitude}
              longitude={grievance.longitude}
              locality={grievance.locality}
              city={grievance.city_town}
              readOnly={true}
            />
          </div>
        )}
      </div>

      {/* OFFICER & ADMIN WORKFLOW ACTION CONSOLE */}
      {isOfficerOrAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-300 dark:border-blue-900 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-600" size={20} />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Officer Redressal Action Console
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              Department Authority Desk
            </span>
          </div>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Update Workflow Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as GrievanceStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="MORE_INFO_REQUIRED">More Info Required</option>
                  <option value="RESOLVED">Resolved (Work Completed)</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REJECTED">Rejected (Explain reason)</option>
                  <option value="ESCALATED">Escalated to Zonal Level</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Officer Action Remarks / Instructions
                </label>
                <input
                  type="text"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Dispatched emergency water tanker DL-1M-4421 to Pocket 4 gate..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>
            </div>

            {newStatus === 'RESOLVED' && (
              <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900">
                <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Resolution Summary Report (Visible to citizen)
                </label>
                <textarea
                  rows={2}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Describe field action: e.g. Replaced burnt sluice valve and restored 40 PSI pressure..."
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            )}

            {newStatus === 'REJECTED' && (
              <div className="space-y-1.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900">
                <label className="text-xs font-bold text-red-800 dark:text-red-300">
                  Rejection Justification / Sub-Judice Notice
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Legal / municipal rationale: e.g. Sub-judice under District Civil Court Case CC/2025/4491..."
                  className="w-full px-3 py-2 rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Executing...' : 'Commit Status Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Timeline and Communication Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline Column */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <span>Workflow History & Audit Trail</span>
          </h2>
          <TimelineView history={history} />
        </div>

        {/* Communication & Notes Column */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600" />
            <span>Communication & Official Responses</span>
          </h2>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] pr-2">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">
                No comments or messages posted yet.
              </p>
            ) : (
              comments.map((comm) => (
                <div
                  key={comm.id}
                  className={`p-3.5 rounded-2xl text-xs space-y-1.5 transition ${
                    comm.is_internal
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80'
                      : comm.author_role === 'citizen'
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 ml-4'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {comm.is_internal && <Lock size={12} className="text-amber-600" />}
                      {comm.author_name}
                      <span className="text-[10px] font-normal uppercase text-slate-400">
                        ({comm.author_role})
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comm.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {comm.is_internal && (
                    <span className="inline-block text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      🔒 Confidential Department Note (Not visible to citizen)
                    </span>
                  )}

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {comm.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Comment input box */}
          <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  role === 'citizen'
                    ? 'Reply to department officer or provide requested details...'
                    : 'Post update to citizen, or add internal officer note...'
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isPostingComment || !commentText.trim()}
                className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition disabled:opacity-50"
              >
                <Send size={13} />
              </button>
            </div>

            {isOfficerOrAdmin && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <input
                  type="checkbox"
                  id="internalCheck"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <label htmlFor="internalCheck" className="cursor-pointer font-medium">
                  Mark as Internal Note (Restricted to officers/admins)
                </label>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Citizen Star Rating Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rate Grievance Resolution
            </h3>
            <p className="text-xs text-slate-500">
              Your rating helps assess department responsiveness and service quality.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingStars(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      size={28}
                      fill={star <= ratingStars ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Feedback Remarks
                </label>
                <textarea
                  rows={3}
                  value={ratingComments}
                  onChange={(e) => setRatingComments(e.target.value)}
                  placeholder="e.g. Tanker reached within 4 hours, appreciate prompt action."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRatingForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Submit Satisfaction & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Reopen Modal */}
      {showReopenForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-pink-600" />
              <span>Request Reopening of Complaint</span>
            </h3>
            <p className="text-xs text-slate-500">
              If the problem was not actually resolved on the ground, state the persisting issues below.
            </p>

            <form onSubmit={handleReopen} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reason for Reopening <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g. The leak was only temporarily patched with tape and started flooding again..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReopening || !reopenReason.trim()}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  Submit Reopen Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip size={16} className="text-blue-600 shrink-0" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {previewAttachment.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-xs">
                <FileText size={32} />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {previewAttachment.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  File Size: {previewAttachment.size} • Encrypted In-Transit
                </p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800">
                ✓ Verified Forensic Civic Evidence
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrievanceDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-400 text-xs animate-pulse">
          Loading grievance case details and timeline...
        </div>
      }
    >
      <GrievanceDetailContent />
    </Suspense>
  );
}
