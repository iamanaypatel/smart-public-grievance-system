export type UserRole = 'citizen' | 'officer' | 'admin';

export type GrievancePriority = 'NORMAL' | 'HIGH' | 'EMERGENCY';

export type GrievanceStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'MORE_INFO_REQUIRED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'REOPENED'
  | 'ESCALATED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department_id?: string;
  department_name?: string;
  district?: string;
  state?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  head_officer_id?: string;
  sla_days_normal: number;
  sla_days_high: number;
  sla_days_emergency: number;
  is_active: boolean;
  icon_name: string;
  officer_count?: number;
  open_complaints_count?: number;
}

export interface ComplaintCategory {
  id: string;
  department_id: string;
  department_name: string;
  name: string;
  description: string;
  subcategories: string[];
}

export interface GrievanceAttachment {
  id: string;
  grievance_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by_id: string;
  created_at: string;
}

export interface GrievanceStatusHistory {
  id: string;
  grievance_id: string;
  from_status: GrievanceStatus | null;
  to_status: GrievanceStatus;
  changed_by_id: string;
  changed_by_name: string;
  changed_by_role: UserRole;
  remarks: string;
  created_at: string;
}

export interface GrievanceComment {
  id: string;
  grievance_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  message: string;
  is_internal: boolean; // TRUE: Internal note for officers/admins only; FALSE: Citizen visible
  created_at: string;
}

export interface Grievance {
  id: string;
  grievance_id: string; // e.g. SPGS-2026-000001
  citizen_id: string;
  citizen_name: string;
  citizen_phone?: string;
  citizen_email?: string;
  department_id: string;
  department_name: string;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  state: string;
  district: string;
  city_town: string;
  locality: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  incident_date: string;
  preferred_contact: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'PHONE';
  assigned_officer_id?: string;
  assigned_officer_name?: string;
  sla_deadline: string;
  is_overdue: boolean;
  is_escalated: boolean;
  reopen_count: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_summary?: string;
  rejection_reason?: string;
  attachments?: GrievanceAttachment[];
}

export interface Notification {
  id: string;
  user_id: string;
  grievance_id?: string;
  title: string;
  message: string;
  type: 'SUBMISSION' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'INFO_REQUEST' | 'ESCALATION' | 'RESOLUTION' | 'SYSTEM';
  is_read: boolean;
  created_at: string;
}

export interface GrievanceFeedback {
  id: string;
  grievance_id: string;
  citizen_id: string;
  rating: number; // 1 to 5
  comments: string;
  resolution_satisfaction: boolean;
  timeliness_rating: number; // 1 to 5
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface EscalationRule {
  id: string;
  department_id: string;
  priority: GrievancePriority;
  sla_days: number;
  escalation_after_days: number;
  notification_email: string;
}
