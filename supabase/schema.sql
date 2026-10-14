-- ============================================================================
-- Smart Public Grievance System (SPGS) for India
-- Complete PostgreSQL & Supabase Database Schema
-- Includes UUID keys, Foreign Keys, Indexes, Constraints, and RLS Policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase auth.users)
CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'citizen' NOT NULL,
    phone TEXT,
    department_id UUID,
    district TEXT,
    state TEXT DEFAULT 'Delhi',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    head_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sla_days_normal INT DEFAULT 7 NOT NULL,
    sla_days_high INT DEFAULT 3 NOT NULL,
    sla_days_emergency INT DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    icon_name TEXT DEFAULT 'Landmark' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_department
FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

-- 3. Complaint Categories Table
CREATE TABLE IF NOT EXISTS public.complaint_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    subcategories TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Grievance Status & Priority Enums
CREATE TYPE grievance_priority AS ENUM ('NORMAL', 'HIGH', 'EMERGENCY');
CREATE TYPE grievance_status AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'MORE_INFO_REQUIRED',
    'RESOLVED',
    'CLOSED',
    'REJECTED',
    'REOPENED',
    'ESCALATED'
);

-- 5. Grievances Main Table
CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id TEXT UNIQUE NOT NULL, -- e.g. SPGS-2026-000001
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    citizen_name TEXT NOT NULL,
    citizen_phone TEXT,
    citizen_email TEXT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    department_name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority grievance_priority DEFAULT 'NORMAL' NOT NULL,
    status grievance_status DEFAULT 'SUBMITTED' NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    city_town TEXT NOT NULL,
    locality TEXT NOT NULL,
    pincode TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    incident_date DATE NOT NULL,
    preferred_contact TEXT DEFAULT 'SMS' NOT NULL,
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_officer_name TEXT,
    sla_deadline TIMESTAMPTZ NOT NULL,
    is_overdue BOOLEAN DEFAULT FALSE NOT NULL,
    is_escalated BOOLEAN DEFAULT FALSE NOT NULL,
    reopen_count INT DEFAULT 0 NOT NULL,
    resolution_summary TEXT,
    rejection_reason TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Grievance Status History (Audit Trail of Workflow Transitions)
CREATE TABLE IF NOT EXISTS public.grievance_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
    from_status grievance_status,
    to_status grievance_status NOT NULL,
    changed_by_id UUID NOT NULL REFERENCES public.profiles(id),
    changed_by_name TEXT NOT NULL,
    changed_by_role user_role NOT NULL,
    remarks TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Grievance Comments & Notes
CREATE TABLE IF NOT EXISTS public.grievance_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id),
    author_name TEXT NOT NULL,
    author_role user_role NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE NOT NULL, -- True: officers only; False: citizen visible
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Grievance Attachments & Evidence
CREATE TABLE IF NOT EXISTS public.grievance_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. In-App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    grievance_id UUID REFERENCES public.grievances(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Citizen Feedback & Ratings
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID UNIQUE NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES public.profiles(id),
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    timeliness_rating INT CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5) NOT NULL,
    comments TEXT,
    resolution_satisfaction BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Security Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role user_role NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_grievances_citizen_id ON public.grievances(citizen_id);
CREATE INDEX IF NOT EXISTS idx_grievances_department_id ON public.grievances(department_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON public.grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_priority ON public.grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievances_deadline ON public.grievances(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_history_grievance_id ON public.grievance_status_history(grievance_id);
CREATE INDEX IF NOT EXISTS idx_comments_grievance_id ON public.grievance_comments(grievance_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view own profile or admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Departments: Readable by all authenticated users
CREATE POLICY "Departments are public view" ON public.departments
    FOR SELECT USING (true);

-- Grievances:
-- 1. Citizens view only their own records
CREATE POLICY "Citizens view own grievances" ON public.grievances
    FOR SELECT USING (
        auth.uid() = citizen_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'officer' AND department_id = grievances.department_id)
    );

-- Comments:
-- Citizens can only view comments where is_internal = FALSE
CREATE POLICY "Citizens view non-internal comments" ON public.grievance_comments
    FOR SELECT USING (
        (is_internal = false AND EXISTS (
            SELECT 1 FROM public.grievances WHERE id = grievance_comments.grievance_id AND citizen_id = auth.uid()
        )) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'officer'))
    );

-- Notifications: User can only see their own
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);
