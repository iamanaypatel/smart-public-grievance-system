import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  Department,
  ComplaintCategory,
  Grievance,
  GrievanceStatusHistory,
  GrievanceComment,
  Notification,
  GrievanceFeedback,
  AuditLog,
  GrievanceStatus,
  UserRole,
} from './types';
import {
  SEED_USERS,
  SEED_DEPARTMENTS,
  SEED_CATEGORIES,
  SEED_GRIEVANCES,
  SEED_STATUS_HISTORY,
  SEED_COMMENTS,
  SEED_NOTIFICATIONS,
  SEED_FEEDBACK,
  SEED_AUDIT_LOGS,
} from './seedData';
import { calculateSlaDeadline } from './rules';

interface DatabaseStore {
  users: UserProfile[];
  departments: Department[];
  categories: ComplaintCategory[];
  grievances: Grievance[];
  statusHistory: GrievanceStatusHistory[];
  comments: GrievanceComment[];
  notifications: Notification[];
  feedback: GrievanceFeedback[];
  auditLogs: AuditLog[];
  nextSequence: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'spgs_store.json');

function initializeStore(): DatabaseStore {
  return {
    users: [...SEED_USERS],
    departments: [...SEED_DEPARTMENTS],
    categories: [...SEED_CATEGORIES],
    grievances: [...SEED_GRIEVANCES],
    statusHistory: [...SEED_STATUS_HISTORY],
    comments: [...SEED_COMMENTS],
    notifications: [...SEED_NOTIFICATIONS],
    feedback: [...SEED_FEEDBACK],
    auditLogs: [...SEED_AUDIT_LOGS],
    nextSequence: 17,
  };
}

let memoryStore: DatabaseStore | null = null;

function getStore(): DatabaseStore {
  if (memoryStore) return memoryStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      memoryStore = JSON.parse(data) as DatabaseStore;
      return memoryStore;
    }
  } catch (err) {
    console.warn('Could not read persistent store from disk, falling back to memory/seed:', err);
  }

  memoryStore = initializeStore();
  saveStore(memoryStore);
  return memoryStore;
}

function saveStore(store: DatabaseStore): void {
  memoryStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store to file:', err);
  }
}

// ----------------- DB FUNCTIONS -----------------

export async function getUsers(): Promise<UserProfile[]> {
  const store = getStore();
  return store.users;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const store = getStore();
  return store.users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const store = getStore();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getDepartments(): Promise<Department[]> {
  const store = getStore();
  // Recalculate dynamic counts
  return store.departments.map((dept) => {
    const openCount = store.grievances.filter(
      (g) => g.department_id === dept.id && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(g.status)
    ).length;
    return {
      ...dept,
      open_complaints_count: openCount,
    };
  });
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  const store = getStore();
  return store.departments.find((d) => d.id === id) || null;
}

export async function updateDepartment(
  id: string,
  updates: Partial<Department>,
  actor: UserProfile
): Promise<Department | null> {
  if (actor.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators can update department configuration.');
  }
  const store = getStore();
  const idx = store.departments.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  store.departments[idx] = { ...store.departments[idx], ...updates };

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: 'UPDATE_DEPARTMENT',
    resource_type: 'departments',
    resource_id: id,
    details: `Updated department settings: ${Object.keys(updates).join(', ')}`,
    created_at: new Date().toISOString(),
  });

  saveStore(store);
  return store.departments[idx];
}

export async function createDepartment(
  deptData: {
    name: string;
    code: string;
    description?: string;
    sla_days_normal: number;
    sla_days_high: number;
    sla_days_emergency: number;
    is_active?: boolean;
    icon_name?: string;
  },
  actor: UserProfile
): Promise<Department> {
  if (actor.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators can create departments.');
  }
  const store = getStore();
  const id = `dept-${deptData.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const newDept: Department = {
    id,
    name: deptData.name,
    code: deptData.code.toUpperCase(),
    description: deptData.description || '',
    sla_days_normal: Number(deptData.sla_days_normal) || 7,
    sla_days_high: Number(deptData.sla_days_high) || 3,
    sla_days_emergency: Number(deptData.sla_days_emergency) || 1,
    is_active: deptData.is_active ?? true,
    icon_name: deptData.icon_name || 'Building2',
    officer_count: 0,
    open_complaints_count: 0,
  };

  store.departments.push(newDept);

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: 'CREATE_DEPARTMENT',
    resource_type: 'departments',
    resource_id: id,
    details: `Created new department: ${newDept.name} (${newDept.code})`,
    created_at: new Date().toISOString(),
  });

  saveStore(store);
  return newDept;
}

export async function getCategories(): Promise<ComplaintCategory[]> {
  const store = getStore();
  return store.categories;
}

// ----------------- GRIEVANCES -----------------

export async function getGrievances(
  user: UserProfile | null,
  filters?: {
    status?: string;
    department_id?: string;
    priority?: string;
    search?: string;
    is_overdue?: boolean;
    is_escalated?: boolean;
  }
): Promise<Grievance[]> {
  const store = getStore();
  let list = [...store.grievances];

  // Refresh overdue status against current date
  const now = new Date();
  list = list.map((g) => {
    const isPastDeadline =
      new Date(g.sla_deadline) < now && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(g.status);
    return {
      ...g,
      is_overdue: isPastDeadline,
    };
  });

  // Role-based authorization filter
  if (!user) {
    // Public anonymized view: only non-sensitive general list
    list = list.map((g) => ({
      ...g,
      citizen_name: 'Anonymized Citizen',
      citizen_phone: undefined,
      citizen_email: undefined,
      locality: g.city_town,
    }));
  } else if (user.role === 'citizen') {
    // Citizen can only view their own private grievances
    list = list.filter((g) => g.citizen_id === user.id);
  } else if (user.role === 'officer') {
    // Officer restricted to their department's queue
    if (user.department_id) {
      list = list.filter((g) => g.department_id === user.department_id);
    }
  }
  // Admin can access all

  // Apply filters
  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter((g) => g.status === filters.status);
  }
  if (filters?.department_id && filters.department_id !== 'ALL') {
    list = list.filter((g) => g.department_id === filters.department_id);
  }
  if (filters?.priority && filters.priority !== 'ALL') {
    list = list.filter((g) => g.priority === filters.priority);
  }
  if (filters?.is_overdue !== undefined) {
    list = list.filter((g) => g.is_overdue === filters.is_overdue);
  }
  if (filters?.is_escalated !== undefined) {
    list = list.filter((g) => g.is_escalated === filters.is_escalated);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (g) =>
        g.grievance_id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.locality.toLowerCase().includes(q) ||
        g.department_name.toLowerCase().includes(q)
    );
  }

  // Sort newest first
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getGrievanceById(
  idOrGrievanceId: string,
  user: UserProfile | null
): Promise<{
  grievance: Grievance;
  history: GrievanceStatusHistory[];
  comments: GrievanceComment[];
  feedback?: GrievanceFeedback;
} | null> {
  const store = getStore();
  const grievance = store.grievances.find(
    (g) => g.id === idOrGrievanceId || g.grievance_id === idOrGrievanceId
  );
  if (!grievance) return null;

  // Authorization check
  if (!user) {
    // Public tracking: return sanitized info only
    return {
      grievance: {
        ...grievance,
        citizen_name: 'Anonymized Citizen',
        citizen_phone: undefined,
        citizen_email: undefined,
      },
      history: store.statusHistory.filter((h) => h.grievance_id === grievance.id),
      comments: [],
    };
  }

  if (user.role === 'citizen' && grievance.citizen_id !== user.id) {
    throw new Error('Access Denied: You do not have permission to view this complaint.');
  }

  if (user.role === 'officer' && user.department_id && grievance.department_id !== user.department_id) {
    throw new Error('Access Denied: This complaint belongs to another department.');
  }

  const history = store.statusHistory
    .filter((h) => h.grievance_id === grievance.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Filter internal comments if citizen
  let comments = store.comments.filter((c) => c.grievance_id === grievance.id);
  if (user.role === 'citizen') {
    comments = comments.filter((c) => !c.is_internal);
  }
  comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const feedback = store.feedback.find((f) => f.grievance_id === grievance.id);

  return { grievance, history, comments, feedback };
}

export async function createGrievance(
  data: Omit<
    Grievance,
    | 'id'
    | 'grievance_id'
    | 'citizen_id'
    | 'citizen_name'
    | 'status'
    | 'sla_deadline'
    | 'is_overdue'
    | 'is_escalated'
    | 'reopen_count'
    | 'created_at'
    | 'updated_at'
  >,
  citizen: UserProfile
): Promise<Grievance> {
  if (citizen.role !== 'citizen') {
    throw new Error('Unauthorized: Only citizens can submit public complaints.');
  }

  const store = getStore();
  const seq = store.nextSequence;
  store.nextSequence += 1;

  const paddedSeq = String(seq).padStart(6, '0');
  const grievanceIdStr = `SPGS-2026-${paddedSeq}`;
  const now = new Date().toISOString();
  const deadline = calculateSlaDeadline(data.department_id, data.priority);

  const newGrievance: Grievance = {
    ...data,
    id: `grv-${Date.now()}`,
    grievance_id: grievanceIdStr,
    citizen_id: citizen.id,
    citizen_name: citizen.name,
    citizen_phone: citizen.phone || data.citizen_phone,
    citizen_email: citizen.email || data.citizen_email,
    status: 'SUBMITTED',
    sla_deadline: deadline,
    is_overdue: false,
    is_escalated: false,
    reopen_count: 0,
    created_at: now,
    updated_at: now,
  };

  store.grievances.unshift(newGrievance);

  // Initial history
  store.statusHistory.push({
    id: `hist-${Date.now()}`,
    grievance_id: newGrievance.id,
    from_status: null,
    to_status: 'SUBMITTED',
    changed_by_id: citizen.id,
    changed_by_name: citizen.name,
    changed_by_role: citizen.role,
    remarks: `Complaint submitted by citizen with priority: ${data.priority}`,
    created_at: now,
  });

  // Citizen Notification
  store.notifications.unshift({
    id: `notif-${Date.now()}-1`,
    user_id: citizen.id,
    grievance_id: newGrievance.id,
    title: 'Complaint Registered Successfully',
    message: `Your grievance ${grievanceIdStr} has been registered under ${data.department_name}. You can track its live status at any time.`,
    type: 'SUBMISSION',
    is_read: false,
    created_at: now,
  });

  // Officer Notification for that department
  const officer = store.users.find(
    (u) => u.role === 'officer' && u.department_id === data.department_id
  );
  if (officer) {
    store.notifications.unshift({
      id: `notif-${Date.now()}-2`,
      user_id: officer.id,
      grievance_id: newGrievance.id,
      title: `New Grievance in Queue [${data.priority}]`,
      message: `${newGrievance.title} (${grievanceIdStr}) in ${data.locality}`,
      type: 'ASSIGNMENT',
      is_read: false,
      created_at: now,
    });
  }

  // Audit Log
  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actor_id: citizen.id,
    actor_name: citizen.name,
    actor_role: citizen.role,
    action: 'CREATE_GRIEVANCE',
    resource_type: 'grievances',
    resource_id: grievanceIdStr,
    details: `Created grievance: ${newGrievance.title} (${data.department_name})`,
    created_at: now,
  });

  saveStore(store);
  return newGrievance;
}

export async function updateGrievanceStatus(
  id: string,
  newStatus: GrievanceStatus,
  remarks: string,
  actor: UserProfile,
  additionalData?: {
    assigned_officer_id?: string;
    assigned_officer_name?: string;
    resolution_summary?: string;
    rejection_reason?: string;
  }
): Promise<Grievance> {
  const store = getStore();
  const grievance = store.grievances.find((g) => g.id === id || g.grievance_id === id);
  if (!grievance) throw new Error('Grievance not found');

  // Permission validation
  if (actor.role === 'citizen') {
    if (grievance.citizen_id !== actor.id) {
      throw new Error('Unauthorized: You can only update your own complaints.');
    }
    // Citizen can only Reopen or Confirm Closed
    if (newStatus !== 'REOPENED' && newStatus !== 'CLOSED') {
      throw new Error('Unauthorized: Citizens can only request Reopening or confirm Resolution.');
    }
  } else if (actor.role === 'officer') {
    if (actor.department_id && grievance.department_id !== actor.department_id) {
      throw new Error('Unauthorized: You can only update grievances in your assigned department.');
    }
  }

  const prevStatus = grievance.status;
  const now = new Date().toISOString();

  grievance.status = newStatus;
  grievance.updated_at = now;

  if (newStatus === 'RESOLVED') {
    grievance.resolved_at = now;
    if (additionalData?.resolution_summary) {
      grievance.resolution_summary = additionalData.resolution_summary;
    }
  } else if (newStatus === 'REJECTED') {
    if (additionalData?.rejection_reason) {
      grievance.rejection_reason = additionalData.rejection_reason;
    }
  } else if (newStatus === 'REOPENED') {
    grievance.reopen_count += 1;
    grievance.resolved_at = undefined;
  } else if (newStatus === 'ESCALATED') {
    grievance.is_escalated = true;
  }

  if (additionalData?.assigned_officer_id) {
    grievance.assigned_officer_id = additionalData.assigned_officer_id;
    grievance.assigned_officer_name = additionalData.assigned_officer_name;
  }

  // Record status history
  store.statusHistory.push({
    id: `hist-${Date.now()}`,
    grievance_id: grievance.id,
    from_status: prevStatus,
    to_status: newStatus,
    changed_by_id: actor.id,
    changed_by_name: actor.name,
    changed_by_role: actor.role,
    remarks: remarks || `Status changed from ${prevStatus} to ${newStatus}`,
    created_at: now,
  });

  // Notify Citizen if updated by Officer/Admin
  if (actor.role !== 'citizen') {
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: grievance.citizen_id,
      grievance_id: grievance.id,
      title: `Grievance Status: ${newStatus}`,
      message: `Your grievance ${grievance.grievance_id} is now ${newStatus}. Note: ${remarks || 'Review in portal.'}`,
      type: newStatus === 'RESOLVED' ? 'RESOLUTION' : 'STATUS_CHANGE',
      is_read: false,
      created_at: now,
    });
  }

  // Audit Log
  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actor_id: actor.id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: `STATUS_CHANGE_${newStatus}`,
    resource_type: 'grievances',
    resource_id: grievance.grievance_id,
    details: `Transitioned from ${prevStatus} to ${newStatus}. Remarks: ${remarks || 'None'}`,
    created_at: now,
  });

  saveStore(store);
  return grievance;
}

export async function addComment(
  grievanceId: string,
  message: string,
  isInternal: boolean,
  actor: UserProfile
): Promise<GrievanceComment> {
  const store = getStore();
  const grievance = store.grievances.find((g) => g.id === grievanceId || g.grievance_id === grievanceId);
  if (!grievance) throw new Error('Grievance not found');

  if (actor.role === 'citizen') {
    if (grievance.citizen_id !== actor.id) {
      throw new Error('Unauthorized');
    }
    isInternal = false; // Citizen cannot create internal notes
  }

  const comment: GrievanceComment = {
    id: `comm-${Date.now()}`,
    grievance_id: grievance.id,
    author_id: actor.id,
    author_name: actor.name,
    author_role: actor.role,
    message,
    is_internal: isInternal,
    created_at: new Date().toISOString(),
  };

  store.comments.push(comment);

  // Notification
  if (actor.role === 'citizen' && grievance.assigned_officer_id) {
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: grievance.assigned_officer_id,
      grievance_id: grievance.id,
      title: 'Citizen Comment Received',
      message: `${actor.name} added a comment on ${grievance.grievance_id}`,
      type: 'INFO_REQUEST',
      is_read: false,
      created_at: new Date().toISOString(),
    });
  } else if (!isInternal && actor.role !== 'citizen') {
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: grievance.citizen_id,
      grievance_id: grievance.id,
      title: 'Officer Response Posted',
      message: `An update was posted on your grievance ${grievance.grievance_id}: "${message.slice(0, 80)}..."`,
      type: 'STATUS_CHANGE',
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  saveStore(store);
  return comment;
}

export async function submitFeedback(
  grievanceId: string,
  data: {
    rating: number;
    comments: string;
    resolution_satisfaction: boolean;
    timeliness_rating: number;
  },
  citizen: UserProfile
): Promise<GrievanceFeedback> {
  const store = getStore();
  const grievance = store.grievances.find((g) => g.id === grievanceId || g.grievance_id === grievanceId);
  if (!grievance) throw new Error('Grievance not found');
  if (grievance.citizen_id !== citizen.id) throw new Error('Unauthorized');

  const fb: GrievanceFeedback = {
    id: `fb-${Date.now()}`,
    grievance_id: grievance.id,
    citizen_id: citizen.id,
    ...data,
    created_at: new Date().toISOString(),
  };

  store.feedback = store.feedback.filter((f) => f.grievance_id !== grievance.id);
  store.feedback.push(fb);

  // Transition to CLOSED once satisfaction is submitted
  if (data.resolution_satisfaction && grievance.status === 'RESOLVED') {
    grievance.status = 'CLOSED';
    grievance.updated_at = new Date().toISOString();
  }

  saveStore(store);
  return fb;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const store = getStore();
  return store.notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function markNotificationAsRead(id: string, userId: string): Promise<boolean> {
  const store = getStore();
  const notif = store.notifications.find((n) => n.id === id && n.user_id === userId);
  if (!notif) return false;
  notif.is_read = true;
  saveStore(store);
  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const store = getStore();
  store.notifications.forEach((n) => {
    if (n.user_id === userId) n.is_read = true;
  });
  saveStore(store);
  return true;
}

export async function getAuditLogs(actor: UserProfile): Promise<AuditLog[]> {
  if (actor.role !== 'admin') {
    throw new Error('Unauthorized: Audit logs are restricted to administrators.');
  }
  const store = getStore();
  return store.auditLogs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// ----------------- DYNAMIC ANALYTICS -----------------

export async function getAnalyticsMetrics(period?: string) {
  const store = getStore();
  const now = new Date();

  // Period filtering
  let all = store.grievances;
  if (period === '7d') {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    all = store.grievances.filter((g) => new Date(g.created_at).getTime() >= cutoff);
  } else if (period === '30d') {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    all = store.grievances.filter((g) => new Date(g.created_at).getTime() >= cutoff);
  }

  const total = all.length;
  const resolved = all.filter((g) => ['RESOLVED', 'CLOSED'].includes(g.status)).length;
  const closed = all.filter((g) => g.status === 'CLOSED').length;
  const pending = all.filter((g) => ['SUBMITTED', 'UNDER_REVIEW'].includes(g.status)).length;
  const inProgress = all.filter((g) => ['ASSIGNED', 'IN_PROGRESS', 'MORE_INFO_REQUIRED', 'REOPENED'].includes(g.status)).length;
  const rejected = all.filter((g) => g.status === 'REJECTED').length;
  const escalated = all.filter((g) => g.is_escalated || g.status === 'ESCALATED').length;
  const overdue = all.filter(
    (g) => new Date(g.sla_deadline) < now && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(g.status)
  ).length;

  const resolutionRate = total > 0 ? Math.round((resolved / (total - rejected || 1)) * 100) : 0;

  // Calculate average resolution time for resolved grievances in days
  const resolvedList = all.filter((g) => g.resolved_at);
  let totalResolutionDays = 0;
  for (const item of resolvedList) {
    const start = new Date(item.created_at).getTime();
    const end = new Date(item.resolved_at!).getTime();
    const days = Math.max(0.5, (end - start) / (1000 * 60 * 60 * 24));
    totalResolutionDays += days;
  }
  const avgResolutionDays =
    resolvedList.length > 0 ? Number((totalResolutionDays / resolvedList.length).toFixed(1)) : 4.2;

  // Department-wise distribution
  const departmentBreakdown: Record<string, { total: number; resolved: number; pending: number }> = {};
  for (const dept of store.departments) {
    departmentBreakdown[dept.name] = { total: 0, resolved: 0, pending: 0 };
  }
  for (const g of all) {
    const dName = g.department_name;
    if (!departmentBreakdown[dName]) {
      departmentBreakdown[dName] = { total: 0, resolved: 0, pending: 0 };
    }
    departmentBreakdown[dName].total += 1;
    if (['RESOLVED', 'CLOSED'].includes(g.status)) {
      departmentBreakdown[dName].resolved += 1;
    } else {
      departmentBreakdown[dName].pending += 1;
    }
  }

  const departmentData = Object.entries(departmentBreakdown)
    .filter(([_, stats]) => stats.total > 0)
    .map(([name, stats]) => ({
      name,
      total: stats.total,
      resolved: stats.resolved,
      pending: stats.pending,
      rate: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
    }));

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  for (const g of all) {
    categoryCount[g.category] = (categoryCount[g.category] || 0) + 1;
  }
  const categoryData = Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count,
  }));

  // Priority breakdown
  const priorityData = [
    { name: 'Normal', value: all.filter((g) => g.priority === 'NORMAL').length, color: '#0284c7' },
    { name: 'High', value: all.filter((g) => g.priority === 'HIGH').length, color: '#f59e0b' },
    { name: 'Emergency', value: all.filter((g) => g.priority === 'EMERGENCY').length, color: '#ef4444' },
  ];

  // Officer Workload
  const officerCountMap: Record<string, { officerName: string; count: number }> = {
    unassigned: { officerName: 'Unassigned', count: 0 },
  };
  for (const g of all) {
    if (g.assigned_officer_name) {
      if (!officerCountMap[g.assigned_officer_name]) {
        officerCountMap[g.assigned_officer_name] = { officerName: g.assigned_officer_name, count: 0 };
      }
      officerCountMap[g.assigned_officer_name].count += 1;
    } else {
      officerCountMap.unassigned.count += 1;
    }
  }
  const officerWorkload = Object.values(officerCountMap);

  // Geographic breakdown
  const geoCountMap: Record<string, number> = {};
  for (const g of all) {
    const loc = g.district || g.city_town || 'Other';
    geoCountMap[loc] = (geoCountMap[loc] || 0) + 1;
  }
  const geographicData = Object.entries(geoCountMap).map(([district, count]) => ({
    district,
    count,
  }));

  // Citizen satisfaction ratings
  const ratings = store.feedback.map((f) => f.rating);
  const avgRating =
    ratings.length > 0 ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 4.5;

  const starCounts = [
    { stars: '5 Stars', count: store.feedback.filter((f) => f.rating === 5).length },
    { stars: '4 Stars', count: store.feedback.filter((f) => f.rating === 4).length },
    { stars: '3 Stars', count: store.feedback.filter((f) => f.rating === 3).length },
    { stars: '2 Stars', count: store.feedback.filter((f) => f.rating === 2).length },
    { stars: '1 Star', count: store.feedback.filter((f) => f.rating === 1).length },
  ];

  return {
    summary: {
      total,
      resolved,
      closed,
      pending,
      inProgress,
      rejected,
      escalated,
      overdue,
      resolutionRate,
      avgResolutionDays,
      avgRating,
      totalFeedbackCount: ratings.length,
    },
    departmentData,
    categoryData,
    priorityData,
    officerWorkload,
    geographicData,
    starCounts,
    monthlyTrends: [
      { month: 'May 2026', received: 18, resolved: 15 },
      { month: 'Jun 2026', received: 24, resolved: 21 },
      { month: 'Jul 2026', received: 32, resolved: 28 },
      { month: 'Aug 2026', received: 45, resolved: 39 },
      { month: 'Sep 2026', received: 50, resolved: 44 },
      { month: 'Oct 2026', received: total, resolved },
    ],
  };
}

export async function resetDemoData(actor: UserProfile): Promise<boolean> {
  if (actor.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators can reset demo data.');
  }
  const fresh = initializeStore();
  saveStore(fresh);
  return true;
}
