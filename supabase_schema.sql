-- =============================================================================
-- DATABASE SCHEMA: SALES OPERATING SYSTEM (SALES BOS) MINARA
-- PostgreSQL / Supabase Migration DDL
-- Single Source of Truth for Minara ERP Sales Ecosystem
-- =============================================================================

-- 1. EXTENSIONS & SCHEMA CLEANUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES FOR STATE MACHINES & ROLES
CREATE TYPE user_role AS ENUM ('sales', 'cs', 'finance', 'manager', 'founder', 'super_admin');

CREATE TYPE prospect_status AS ENUM (
    'ACTIVE', 'NURTURE', 'CLOSING', 'MENOLAK', 
    'FOLLOWUP_1', 'FOLLOWUP_2', 'FOLLOWUP_3', 'FOLLOWUP_4', 'FOLLOWUP_5',
    'PENDING', 'DORMANT', 'LOCKING'
);

CREATE TYPE pipeline_stage AS ENUM (
    'PROSPECT', 'QUALIFIED', 'DISCOVERY', 'DEMO', 
    'PROPOSAL', 'NEGOTIATION', 'WON', 'PENDING_CS', 'PENDING_FINANCE', 'ACTIVE_TENANT'
);

CREATE TYPE deal_lifecycle_status AS ENUM (
    'CLOSED_PENDING', 'PENDING_CS', 'PENDING_FINANCE', 
    'READY_FOR_ACTIVATION', 'ACTIVE_TENANT', 'REWARD_ELIGIBLE', 'CANCELLED'
);

CREATE TYPE performance_zone AS ENUM (
    'OVERACHIEVEMENT', 'MEETS_STANDARD', 'NEAR_STANDARD', 'BELOW_STANDARD', 'CRITICAL'
);

CREATE TYPE sla_anchor_event AS ENUM ('VISIT', 'DEMO');

-- 3. EMPLOYEES & ROLES TABLE
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'sales',
    avatar VARCHAR(500),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SYSTEM CONFIGURATIONS TABLE (No hard-coding in UI!)
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES employees(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Configurations
INSERT INTO system_configs (key, value) VALUES
('kpi_targets', '{
    "daily_prospect_contact": 10,
    "monthly_prospect": 50,
    "monthly_discovery": 20,
    "monthly_demo": 10,
    "monthly_proposal": 5,
    "monthly_closing": 2
}'::jsonb),
('sla_config', '{
    "anchor_event": "DEMO",
    "sla_hours": 48
}'::jsonb),
('performance_zones', '[
    {"min_pct": 101, "zone": "OVERACHIEVEMENT", "grade": "A+"},
    {"min_pct": 100, "max_pct": 100, "zone": "MEETS_STANDARD", "grade": "A"},
    {"min_pct": 80, "max_pct": 99, "zone": "NEAR_STANDARD", "grade": "B"},
    {"min_pct": 70, "max_pct": 79, "zone": "BELOW_STANDARD", "grade": "C"},
    {"min_pct": 0, "max_pct": 69, "zone": "CRITICAL", "grade": "D"}
]'::jsonb),
('point_rules', '{
    "prospect_valid": 10,
    "followup_valid": 5,
    "discovery_valid": 25,
    "demo_valid": 50,
    "proposal_valid": 75,
    "closing_valid": 200
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. PROSPECTS TABLE (Master & Transactional Data)
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    nama_lembaga VARCHAR(255) NOT NULL,
    pic VARCHAR(255) NOT NULL,
    no_hp VARCHAR(50) NOT NULL,
    wilayah VARCHAR(100) NOT NULL,
    sales_owner_id UUID NOT NULL REFERENCES employees(id),
    source VARCHAR(100) DEFAULT 'Direct Visit',
    status prospect_status NOT NULL DEFAULT 'ACTIVE',
    pipeline_stage pipeline_stage NOT NULL DEFAULT 'PROSPECT',
    
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    next_followup_at TIMESTAMPTZ,
    followup_count INT DEFAULT 0,
    aging_days INT DEFAULT 0,
    nilai_peluang NUMERIC(15, 2) DEFAULT 0,
    catatan TEXT,
    rejection_reason TEXT,

    week_number INT DEFAULT EXTRACT(WEEK FROM CURRENT_DATE),
    year_created INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROSPECT ACTIVITIES TABLE (Auditability & Proof Validation)
CREATE TABLE IF NOT EXISTS prospect_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    sales_id UUID NOT NULL REFERENCES employees(id),
    activity_type VARCHAR(50) NOT NULL, -- 'VISIT', 'CALL', 'DISCOVERY', 'DEMO', 'PROPOSAL', 'FOLLOWUP'
    is_valid BOOLEAN DEFAULT TRUE,
    proof_data JSONB, -- GPS location, photo URL, checklist responses
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DISCOVERY RECORDS TABLE
CREATE TABLE IF NOT EXISTS discovery_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID UNIQUE NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    sales_id UUID NOT NULL REFERENCES employees(id),
    jumlah_santri INT NOT NULL DEFAULT 0,
    sistem_saat_ini VARCHAR(255) NOT NULL,
    kendala_utama TEXT NOT NULL,
    decision_makers VARCHAR(255) NOT NULL,
    estimasi_anggaran NUMERIC(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DEMOS TABLE (SOP Checklist)
CREATE TABLE IF NOT EXISTS demos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    sales_id UUID NOT NULL REFERENCES employees(id),
    demo_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sop_checklist JSONB NOT NULL, -- {"sapaan_sesuai_sop": true, "presentation_completed": true, "qa_completed": true}
    feedback_pesantren TEXT,
    attendance_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PROPOSALS TABLE (SLA Tracking Engine)
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    sales_id UUID NOT NULL REFERENCES employees(id),
    anchor_event sla_anchor_event NOT NULL DEFAULT 'DEMO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deadline_at TIMESTAMPTZ NOT NULL,
    is_overdue BOOLEAN DEFAULT FALSE,
    overdue_duration_hours NUMERIC(8,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'SENT', -- 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'
    file_url VARCHAR(500)
);

-- 10. DEALS TABLE (State Machine & Multi-Division Handoff)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    sales_id UUID NOT NULL REFERENCES employees(id),
    cs_verifier_id UUID REFERENCES employees(id),
    finance_verifier_id UUID REFERENCES employees(id),
    
    amount NUMERIC(15, 2) NOT NULL,
    status deal_lifecycle_status NOT NULL DEFAULT 'CLOSED_PENDING',
    
    closed_at TIMESTAMPTZ DEFAULT NOW(),
    implemented_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    reward_eligible_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. KPI ACTUALS & SCORECARDS TABLE
CREATE TABLE IF NOT EXISTS kpi_actuals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    prospek_count INT DEFAULT 0,
    followup_count INT DEFAULT 0,
    discovery_count INT DEFAULT 0,
    demo_count INT DEFAULT 0,
    proposal_count INT DEFAULT 0,
    closing_count INT DEFAULT 0,
    total_points INT DEFAULT 0,
    
    achievement_pct NUMERIC(5,2) DEFAULT 0,
    performance_zone performance_zone DEFAULT 'CRITICAL',
    grade VARCHAR(5) DEFAULT 'D',
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, period_month, period_year)
);

-- 12. COACHING SIGNALS TABLE (Area for Review Signals)
CREATE TABLE IF NOT EXISTS coaching_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    signal_type VARCHAR(100) NOT NULL, -- 'CONVERSION_DISCOVERY_DEMO', 'SLA_PROPOSAL_OVERDUE', 'DORMANT_WARNING'
    message TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVIEWED', 'RESOLVED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE (Principle 01: Every Action Leaves a Trace)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES employees(id),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    previous_value JSONB,
    new_value JSONB
);

-- 14. ROW LEVEL SECURITY (RLS POLICIES)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Sales RLS Policy: Sales only reads & writes own prospects & activities
CREATE POLICY sales_prospects_policy ON prospects
    FOR ALL
    USING (
        sales_owner_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid() AND role IN ('manager', 'founder', 'cs', 'finance', 'super_admin')
        )
    );

-- 15. EXECUTIVE OMSET PIPELINE VIEW (For Founder / Owner Dashboard)
CREATE OR REPLACE VIEW owner_omset_pipeline AS
SELECT 
    tenant_id,
    COUNT(CASE WHEN status IN ('CLOSED_PENDING', 'PENDING_CS') THEN 1 END) AS count_pending_cs,
    SUM(CASE WHEN status IN ('CLOSED_PENDING', 'PENDING_CS') THEN amount ELSE 0 END) AS potential_omset_cs,
    
    COUNT(CASE WHEN status = 'PENDING_FINANCE' THEN 1 END) AS count_pending_finance,
    SUM(CASE WHEN status = 'PENDING_FINANCE' THEN amount ELSE 0 END) AS potential_omset_finance,
    
    COUNT(CASE WHEN status IN ('ACTIVE_TENANT', 'REWARD_ELIGIBLE') THEN 1 END) AS count_realized_omset,
    SUM(CASE WHEN status IN ('ACTIVE_TENANT', 'REWARD_ELIGIBLE') THEN amount ELSE 0 END) AS realized_omset,
    
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) AS count_cancelled,
    SUM(CASE WHEN status = 'CANCELLED' THEN amount ELSE 0 END) AS lost_omset
FROM deals
GROUP BY tenant_id;
