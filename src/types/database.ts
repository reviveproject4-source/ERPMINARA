export type UserRole = 'sales' | 'cs' | 'finance' | 'manager' | 'founder' | 'super_admin';

export type MinaraProduct = 'CeritaAnanda' | 'Kabarsantri' | 'Pilin';

export type SalesLevel = 'JUNIOR' | 'MID_LEVEL';

export type SubscriptionPackage = 'BASIC' | 'PRO' | 'ENTERPRISE';

export type ClientPipelineStatus = 'DEMO_TRIAL' | 'PAYMENT_VERIFIED' | 'LIVE_PRODUCTION';

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

export type AttendanceType = 'MASUK' | 'KELUAR' | 'CHECKIN_FIELD';

// ==========================================
// MINARA — PILIN COMMERCIAL PRICING CATALOG
// ==========================================

export interface PilinFeatureCatalogItem {
  id: string;
  name: string;
  category: 'Relationship' | 'Growth' | 'Campaign' | 'Advocacy';
  monthly_price: number;
  commission_5pct: number;
}

export const PILIN_FEATURE_CATALOG: PilinFeatureCatalogItem[] = [
  // Relationship Features
  { id: 'sapaan', name: 'Sapaan', category: 'Relationship', monthly_price: 75000, commission_5pct: 3750 },
  { id: 'reminder', name: 'Reminder', category: 'Relationship', monthly_price: 200000, commission_5pct: 10000 },
  { id: 'smart_loyalty', name: 'Smart Loyalty', category: 'Relationship', monthly_price: 350000, commission_5pct: 17500 },
  { id: 'milestone', name: 'Milestone', category: 'Relationship', monthly_price: 110000, commission_5pct: 5500 },
  { id: 'customer_setia', name: 'Customer Setia', category: 'Relationship', monthly_price: 120000, commission_5pct: 6000 },
  { id: 'reactivation', name: 'Reactivation', category: 'Relationship', monthly_price: 80000, commission_5pct: 4000 },

  // Growth Features
  { id: 'hypnoselling', name: 'Hypnoselling', category: 'Growth', monthly_price: 100000, commission_5pct: 5000 },
  { id: 'happy_hour', name: 'Happy Hour', category: 'Growth', monthly_price: 100000, commission_5pct: 5000 },
  { id: 'upselling_cross_selling', name: 'Upselling & Cross-selling', category: 'Growth', monthly_price: 150000, commission_5pct: 7500 },
  { id: 'reminder_stok', name: 'Reminder Stok', category: 'Growth', monthly_price: 125000, commission_5pct: 6250 },

  // Campaign Add-on
  { id: 'blas_promo', name: 'BLAS / Broadcast Promo', category: 'Campaign', monthly_price: 150000, commission_5pct: 7500 },

  // Advocacy Add-on
  { id: 'referral', name: 'Referral / Ajak Teman', category: 'Advocacy', monthly_price: 130000, commission_5pct: 6500 },
];

export const PILIN_COMMERCIAL_RULES = {
  ACTIVATION_FEE: 1000000,           // Rp 1,000,000 one-time activation
  ACTIVATION_COMMISSION_5PCT: 50000,  // Rp 50,000 (5% x Rp 1M)
  MIN_DEPOSIT_SALDO: 100000,         // Minimum Deposit Saldo PILIN
  DEPOSIT_COMMISSION: 0,             // Rp 0 Commission (EXCLUDED)
  WA_MESSAGE_PRICE: 350,             // Rp 350 / WhatsApp message
  WA_USAGE_COMMISSION: 0,            // Rp 0 Commission (EXCLUDED)
  COMMISSION_RATE: 0.05              // 5% Rate on eligible revenue
};

// Mandatory Traceable Field Visit Proof
export interface VisitProof {
  photo_url: string;
  gps_lat: number;
  gps_lng: number;
  geo_address: string;
  visit_timestamp: string;
  is_verified: boolean;
}

// Product Commission Calculation Structure (MINARA V1 Spec)
export interface ProductCommissionBreakdown {
  product: MinaraProduct;
  implementation_amount: number;
  subscription_amount: number;
  expansion_amount?: number;
  implementation_commission_5pct: number;
  subscription_commission_2pct: number;
  expansion_commission_5pct?: number;
  renewal_commission_2pct: number;
  total_commission: number;
}

// Full Breakdown for PILIN Sales Performance V1
export interface PilinCommercialBreakdown {
  activation_fee: number;               // Rp 1,000,000
  activation_commission: number;        // 5% = Rp 50,000
  feature_subscription_total: number;   // Total monthly feature subscriptions
  feature_commission: number;           // 5% x feature_subscription_total
  expansion_sales_total: number;        // Total expansion feature purchases
  expansion_commission: number;         // 5% x expansion_sales_total
  deposit_collected: number;            // Saldo PILIN (EXCLUDED from commission)
  deposit_commission: number;           // Rp 0
  wa_usage_amount: number;              // WA usage revenue (EXCLUDED)
  wa_usage_commission: number;          // Rp 0
  total_cash_collected: number;         // Activation + Features + Deposit
  commissionable_revenue: number;       // Activation + Features + Expansion
  total_commission_payable: number;     // 5% x commissionable_revenue
}

// Production Account Credentials for 1-Click Activate
export interface ProductionCredentials {
  tenant_code: string;
  master_email: string;
  temporary_pass: string;
  activated_at: string;
  activated_by: string;
}

// Sales Attendance Record
export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  sales_id: string;
  sales_name: string;
  sales_level?: SalesLevel;
  type: AttendanceType;
  timestamp: string;
  gps_lat: number;
  gps_lng: number;
  geo_address: string;
  photo_url: string;
  notes?: string;
  is_verified_finance: boolean;
  created_at: string;
}

// Specific Details for PILIN (BOS UMKM Retail & Jasa)
export interface PilinDetails {
  nama_toko: string;
  alamat: string;
  owner: string;
  no_admin: string;
  email?: string;
  website?: string;
  media_sosial?: string;
  jenis_usaha: 'Retail' | 'Jasa';
  selected_features?: string[];          // IDs from PILIN_FEATURE_CATALOG
  deposit_saldo?: number;                // Saldo PILIN (Rp 100k+, 0% Commission)
  wa_messages_sent?: number;             // WA messages (Rp 350/msg, 0% Commission)
  is_expansion_sale?: boolean;           // True if feature expansion by existing customer
  keterangan_kunjungan?: string;
  app_pembayaran_saat_ini?: string;
}

// Specific Details for CeritaAnanda
export interface CeritaAnandaDetails {
  nama_yayasan: string;
  nama_tk: string;
  pic: string;
  alamat: string;
  no_kontak: string;
  email?: string;
  jumlah_guru: number;
  jumlah_murid: number;
}

// Specific Details for Kabarsantri
export interface KabarsantriDetails {
  nama_lembaga: string;
  pic: string;
  no_hp: string;
  email?: string;
  wilayah: string;
  jumlah_santri?: number;
  tenure_months?: number;
}

export interface Employee {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: UserRole;
  sales_level?: SalesLevel;
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
  target_closing_amount: number;
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
  nama_lembaga: string;
  pic: string;
  no_hp: string;
  no_wa_usaha?: string;
  email?: string;
  demo_url?: string;
  wilayah: string;
  sales_owner_id: string;
  sales_owner_name?: string;
  sales_level?: SalesLevel;
  package_type?: SubscriptionPackage;
  client_pipeline_status?: ClientPipelineStatus;
  source: string;
  produk_minat: MinaraProduct[];
  
  visit_proof?: VisitProof;
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
  sales_level?: SalesLevel;
  package_type?: SubscriptionPackage;
  client_pipeline_status?: ClientPipelineStatus;
  payment_proof_url?: string;
  production_credentials?: ProductionCredentials;
  cs_verifier_id?: string;
  finance_verifier_id?: string;
  amount: number;
  email?: string;
  no_wa_usaha?: string;
  produk_minat?: MinaraProduct[];
  pilin_details?: PilinDetails;
  ceritaananda_details?: CeritaAnandaDetails;
  kabarsantri_details?: KabarsantriDetails;
  visit_proof?: VisitProof;
  commission_breakdown?: ProductCommissionBreakdown[];
  pilin_breakdown?: PilinCommercialBreakdown;
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
  email?: string;
  package_type?: SubscriptionPackage;
  client_pipeline_status?: ClientPipelineStatus;
  production_credentials?: ProductionCredentials;
  sales_owner_name: string;
  amount: number;
  produk_minat?: MinaraProduct[];
  pilin_details?: PilinDetails;
  ceritaananda_details?: CeritaAnandaDetails;
  kabarsantri_details?: KabarsantriDetails;
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
  email?: string;
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
