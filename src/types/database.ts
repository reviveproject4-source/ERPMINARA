export type UserRole = 'sales' | 'cs' | 'finance' | 'manager' | 'founder' | 'super_admin';

export type MinaraProduct = 'CeritaAnanda' | 'Kabarsantri' | 'Pilin';

export type ProspectStatus = 
  | 'ACTIVE' 
  | 'NURTURE' 
  | 'CLOSING' 
  | 'MENOLAK' 
  | 'FOLLOWUP_H7' 
  | 'FOLLOWUP_H30' 
  | 'FOLLOWUP_H60' 
  | 'FOLLOWUP_H90'
  | 'PENDING' 
  | 'DORMANT' 
  | 'LOCKING';

export type PipelineStage = 
  | 'PROSPECT' 
  | 'QUALIFIED' 
  | 'DISCOVERY' 
  | 'DEMO' 
  | 'PROPOSAL' 
  | 'NEGOTIATION' 
  | 'WON' 
  | 'PENDING_CS' 
  | 'PENDING_FINANCE' 
  | 'ACTIVE_TENANT';

export type DealLifecycleStatus = 
  | 'CLOSED_PENDING' 
  | 'PENDING_CS' 
  | 'PENDING_FINANCE' 
  | 'READY_FOR_ACTIVATION' 
  | 'ACTIVE_TENANT' 
  | 'REWARD_ELIGIBLE' 
  | 'CANCELLED';

export type PerformanceZone = 'OVERACHIEVEMENT' | 'MEETS_STANDARD' | 'NEAR_STANDARD' | 'BELOW_STANDARD' | 'CRITICAL';

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D';

export type SlaAnchorEvent = 'VISIT' | 'DEMO';

export type CSTenantWorkflowStage = 'TENANT_BARU' | 'SETUP' | 'TRAINING' | 'GO_LIVE' | 'ACTIVE' | 'RENEWAL';

export type CustomerHealthStatus = 'HIJAU' | 'KUNING' | 'MERAH';

export type TicketCategory = 'Technical Issue' | 'Training' | 'Billing' | 'Feature Request';

export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

export type ReactivationStage = 'DATABASE' | 'CONTACTED' | 'RESPONDED' | 'DEMO' | 'NEGOTIATION' | 'CLOSED';

// Mandatory Traceable Field Visit Proof (Applies to all 3 products: Pilin, CeritaAnanda, Kabarsantri)
export interface VisitProof {
  photo_url: string;
  gps_lat: number;
  gps_lng: number;
  geo_address: string;
  visit_timestamp: string; // ISO Timestamp (bisa ditrace)
  is_verified: boolean;
}

// Specific Details for PILIN (BOS UMKM Retail & Jasa)
export interface PilinDetails {
  nama_toko: string;
  alamat: string;
  owner: string;
  no_admin: string;
  website?: string;
  media_sosial?: string;
  jenis_usaha: 'Retail' | 'Jasa';
  keterangan_kunjungan?: string;
  app_pembayaran_saat_ini?: string;
}

// Specific Details for CeritaAnanda (Assesmen PAUD & TK)
export interface CeritaAnandaDetails {
  nama_yayasan: string;
  nama_tk: string;
  pic: string;
  alamat: string;
  no_kontak: string;
  jumlah_guru: number;
  jumlah_murid: number;
}

// Specific Details for Kabarsantri (Pesantren & Lembaga Islam)
export interface KabarsantriDetails {
  nama_lembaga: string;
  pic: string;
  no_hp: string;
  wilayah: string;
  jumlah_santri?: number;
}

export interface Employee {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface KPITargetsConfig {
  daily_prospect_contact: number;
  monthly_prospect: number;
  monthly_discovery: number;
  monthly_demo: number;
  monthly_proposal: number;
  monthly_closing: number;
}

export interface SLAConfig {
  anchor_event: SlaAnchorEvent;
  sla_hours: number;
}

export interface PerformanceZoneConfig {
  min_pct: number;
  max_pct?: number;
  zone: PerformanceZone;
  grade: Grade;
}

export interface PointRulesConfig {
  prospect_valid: number;
  followup_valid: number;
  discovery_valid: number;
  demo_valid: number;
  proposal_valid: number;
  closing_valid: number;
}

export interface Prospect {
  id: string;
  tenant_id: string;
  nama_lembaga: string; // Used as main display name (Nama Toko / Nama TK / Nama Pesantren)
  pic: string;
  no_hp: string;
  wilayah: string;
  sales_owner_id: string;
  sales_owner_name?: string;
  source: string;
  produk_minat: MinaraProduct[];
  
  // Mandatory Traceability Visit Proof (Foto, GPS Tempat, & Waktu)
  visit_proof?: VisitProof;

  // Dynamic Product-Specific Details
  pilin_details?: PilinDetails;
  ceritaananda_details?: CeritaAnandaDetails;
  kabarsantri_details?: KabarsantriDetails;

  status: ProspectStatus;
  pipeline_stage: PipelineStage;
  last_activity_at: string;
  next_followup_at?: string;
  followup_count: number;
  followup_cadence?: 'H+7' | 'H+30' | 'H+60' | 'H+90';
  aging_days: number;
  nilai_peluang: number;
  catatan?: string;
  rejection_reason?: string;
  week_number: number;
  year_created: number;
  created_at: string;
  updated_at: string;
}

export interface ProspectActivity {
  id: string;
  tenant_id: string;
  prospect_id: string;
  sales_id: string;
  activity_type: 'VISIT' | 'CALL' | 'DISCOVERY' | 'DEMO' | 'PROPOSAL' | 'FOLLOWUP';
  is_valid: boolean;
  proof_data?: {
    gps_lat?: number;
    gps_lng?: number;
    photo_url?: string;
    notes?: string;
  };
  notes?: string;
  created_at: string;
}

export interface DiscoveryRecord {
  id: string;
  prospect_id: string;
  sales_id: string;
  jumlah_santri: number;
  sistem_saat_ini: string;
  kendala_utama: string;
  decision_makers: string;
  estimasi_anggaran: number;
  notes?: string;
  created_at: string;
}

export interface DemoRecord {
  id: string;
  prospect_id: string;
  sales_id: string;
  demo_date: string;
  sop_checklist: {
    sapaan_sesuai_sop: boolean;
    presentation_completed: boolean;
    qa_completed: boolean;
  };
  feedback_pesantren?: string;
  attendance_count: number;
  created_at: string;
}

export interface ProposalRecord {
  id: string;
  prospect_id: string;
  sales_id: string;
  anchor_event: SlaAnchorEvent;
  created_at: string;
  deadline_at: string;
  is_overdue: boolean;
  overdue_duration_hours: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  file_url?: string;
}

export interface DealRecord {
  id: string;
  tenant_id: string;
  prospect_id: string;
  prospect_nama?: string;
  sales_id: string;
  sales_name?: string;
  cs_verifier_id?: string;
  finance_verifier_id?: string;
  amount: number;
  produk_minat?: MinaraProduct[];
  pilin_details?: PilinDetails;
  ceritaananda_details?: CeritaAnandaDetails;
  visit_proof?: VisitProof;
  status: DealLifecycleStatus;
  closed_at: string;
  implemented_at?: string;
  paid_at?: string;
  reward_eligible_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CSTenantRecord {
  id: string;
  tenant_id: string;
  deal_id: string;
  prospect_id: string;
  nama_lembaga: string;
  pic: string;
  no_hp: string;
  sales_owner_name: string;
  amount: number;
  produk_minat?: MinaraProduct[];
  pilin_details?: PilinDetails;
  ceritaananda_details?: CeritaAnandaDetails;
  visit_proof?: VisitProof;
  cs_owner_id: string;
  cs_owner_name: string;
  workflow_stage: CSTenantWorkflowStage;
  health_status: CustomerHealthStatus;
  day_1_setup_completed: boolean;
  day_7_training_completed: boolean;
  day_14_review_completed: boolean;
  day_30_healthcheck_completed: boolean;
  last_login_at?: string;
  active_user_count: number;
  complaint_count: number;
  payment_status: 'LUNAS' | 'PENDING' | 'OVERDUE';
  next_action: string;
  deadline_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_code: string;
  tenant_id: string;
  cs_tenant_id: string;
  nama_lembaga: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  solution?: string;
  status: TicketStatus;
  response_time_minutes: number;
  sla_overdue: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface ReactivationLead {
  id: string;
  tenant_id: string;
  prospect_id?: string;
  nama_lembaga: string;
  pic: string;
  no_hp: string;
  source_type: 'trial_user' | 'demo_lama' | 'proposal_lama' | 'pelanggan_berhenti' | 'pelanggan_tidak_aktif';
  stage: ReactivationStage;
  cs_owner_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CSKPIScorecard {
  cards: {
    responseTime: { actual: number; target: number; pct: number; weight: number };
    ticketResolution: { actual: number; target: number; pct: number; weight: number };
    csat: { actual: number; target: number; pct: number; weight: number };
    adoption: { actual: number; target: number; pct: number; weight: number };
    retention: { actual: number; target: number; pct: number; weight: number };
    onboarding: { actual: number; target: number; pct: number; weight: number };
    reactivation: { actual: number; target: number; pct: number; weight: number };
    bugFeedback: { actual: number; target: number; pct: number; weight: number };
    reporting: { actual: number; target: number; pct: number; weight: number };
  };
  overallPct: number;
  zone: PerformanceZone;
  grade: Grade;
}

export interface KPIActuals {
  id: string;
  employee_id: string;
  period_month: number;
  period_year: number;
  prospek_count: number;
  followup_count: number;
  discovery_count: number;
  demo_count: number;
  proposal_count: number;
  closing_count: number;
  total_points: number;
  achievement_pct: number;
  performance_zone: PerformanceZone;
  grade: Grade;
}

export interface CoachingSignal {
  id: string;
  employee_id: string;
  employee_name?: string;
  signal_type: string;
  message: string;
  recommendation: string;
  status: 'ACTIVE' | 'REVIEWED' | 'RESOLVED';
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}
