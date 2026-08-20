import { createClient } from '@supabase/supabase-js';
import type { 
  Employee, Prospect, ProspectActivity, DiscoveryRecord, DemoRecord, 
  ProposalRecord, DealRecord, AuditLog, UserRole, DealLifecycleStatus,
  CSTenantRecord, SupportTicket, ReactivationLead, CSTenantWorkflowStage, TicketStatus, ReactivationStage,
  AttendanceRecord
} from '../types/database';
import { 
  INITIAL_EMPLOYEES, INITIAL_PROSPECTS, INITIAL_DISCOVERY, 
  INITIAL_DEMOS, INITIAL_PROPOSALS, INITIAL_DEALS, INITIAL_AUDIT_LOGS,
  INITIAL_CS_TENANTS, INITIAL_SUPPORT_TICKETS, INITIAL_REACTIVATION_LEADS 
} from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-minara.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SystemStore {
  private employees: Employee[] = [...INITIAL_EMPLOYEES];
  private prospects: Prospect[] = [...INITIAL_PROSPECTS];
  private activities: ProspectActivity[] = [];
  private discoveries: DiscoveryRecord[] = [...INITIAL_DISCOVERY];
  private demos: DemoRecord[] = [...INITIAL_DEMOS];
  private proposals: ProposalRecord[] = [...INITIAL_PROPOSALS];
  private deals: DealRecord[] = [...INITIAL_DEALS];
  private csTenants: CSTenantRecord[] = [...INITIAL_CS_TENANTS];
  private supportTickets: SupportTicket[] = [...INITIAL_SUPPORT_TICKETS];
  private reactivationLeads: ReactivationLead[] = [...INITIAL_REACTIVATION_LEADS];
  private attendanceRecords: AttendanceRecord[] = [];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private currentEmployee: Employee = INITIAL_EMPLOYEES[0];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedProspects = localStorage.getItem('minara_prospects');
      if (savedProspects) this.prospects = JSON.parse(savedProspects);

      const savedDeals = localStorage.getItem('minara_deals');
      if (savedDeals) this.deals = JSON.parse(savedDeals);

      const savedCSTenants = localStorage.getItem('minara_cs_tenants');
      if (savedCSTenants) this.csTenants = JSON.parse(savedCSTenants);

      const savedTickets = localStorage.getItem('minara_tickets');
      if (savedTickets) this.supportTickets = JSON.parse(savedTickets);

      const savedAttendance = localStorage.getItem('minara_attendance');
      if (savedAttendance) this.attendanceRecords = JSON.parse(savedAttendance);

      const savedAudit = localStorage.getItem('minara_audit');
      if (savedAudit) this.auditLogs = JSON.parse(savedAudit);
    } catch {
      // Fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('minara_prospects', JSON.stringify(this.prospects));
      localStorage.setItem('minara_deals', JSON.stringify(this.deals));
      localStorage.setItem('minara_cs_tenants', JSON.stringify(this.csTenants));
      localStorage.setItem('minara_tickets', JSON.stringify(this.supportTickets));
      localStorage.setItem('minara_attendance', JSON.stringify(this.attendanceRecords));
      localStorage.setItem('minara_audit', JSON.stringify(this.auditLogs));
    } catch {
      // Ignore
    }
  }

  public clearAllData() {
    this.prospects = [];
    this.activities = [];
    this.discoveries = [];
    this.demos = [];
    this.proposals = [];
    this.deals = [];
    this.csTenants = [];
    this.supportTickets = [];
    this.reactivationLeads = [];
    this.attendanceRecords = [];
    this.auditLogs = [];
    
    try {
      localStorage.removeItem('minara_prospects');
      localStorage.removeItem('minara_deals');
      localStorage.removeItem('minara_cs_tenants');
      localStorage.removeItem('minara_tickets');
      localStorage.removeItem('minara_attendance');
      localStorage.removeItem('minara_audit');
    } catch {
      // Ignore
    }
  }

  public getEmployees(): Employee[] { return this.employees; }
  
  public getCurrentEmployee(): Employee { return this.currentEmployee; }
  
  public setCurrentEmployeeRole(role: UserRole): Employee {
    const emp = this.employees.find(e => e.role === role) || this.employees[0];
    this.currentEmployee = emp;
    return emp;
  }

  // SALES ATTENDANCE / PRESENSI METHODS (DISALURKAN KE KEUKANGAN / PAYROLL GAJI)
  public getAttendanceRecords(): AttendanceRecord[] {
    return this.attendanceRecords;
  }

  public addAttendanceRecord(rec: Omit<AttendanceRecord, 'id' | 'created_at'>): AttendanceRecord {
    const newRec: AttendanceRecord = {
      ...rec,
      id: `att-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.attendanceRecords.unshift(newRec);
    this.saveToStorage();

    this.logAudit(rec.sales_id, `SALES_ATTENDANCE_${rec.type}`, 'attendance', newRec.id, undefined, newRec as unknown as Record<string, unknown>);
    return newRec;
  }

  public verifyAttendanceFinance(id: string): AttendanceRecord | null {
    const idx = this.attendanceRecords.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const prev = { ...this.attendanceRecords[idx] };
    const updated = { ...this.attendanceRecords[idx], is_verified_finance: true };
    this.attendanceRecords[idx] = updated;
    this.saveToStorage();

    this.logAudit(this.currentEmployee.id, 'FINANCE_ATTENDANCE_VERIFIED', 'attendance', id, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public getProspects(salesId?: string, role: UserRole = 'sales'): Prospect[] {
    if (role === 'sales' && salesId) {
      return this.prospects.filter(p => p.sales_owner_id === salesId);
    }
    return this.prospects;
  }

  public addProspect(newP: Omit<Prospect, 'id' | 'created_at' | 'updated_at'>): Prospect {
    const prospectId = `pr-${Date.now()}`;
    const productTag = (newP.produk_minat && newP.produk_minat[0]) ? newP.produk_minat[0].toLowerCase() : 'app';
    const demoUrl = `https://demo.minara.id/trial?id=${prospectId}&product=${productTag}&package=${newP.package_type || 'PRO'}`;
    
    const prospect: Prospect = {
      ...newP,
      id: prospectId,
      demo_url: demoUrl,
      client_pipeline_status: newP.client_pipeline_status || 'DEMO_TRIAL',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.prospects.unshift(prospect);
    this.saveToStorage();

    this.logAudit(this.currentEmployee.id, 'PROSPECT_CREATED_AUTO_DEMO_READY', 'prospects', prospect.id, undefined, prospect as unknown as Record<string, unknown>);
    return prospect;
  }

  public updateProspect(id: string, updates: Partial<Prospect>): Prospect | null {
    const idx = this.prospects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    
    const prev = { ...this.prospects[idx] };
    const updated = { ...this.prospects[idx], ...updates, updated_at: new Date().toISOString() };
    this.prospects[idx] = updated;
    this.saveToStorage();

    this.logAudit(this.currentEmployee.id, 'PROSPECT_UPDATED', 'prospects', id, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public addActivity(act: Omit<ProspectActivity, 'id' | 'created_at'>): ProspectActivity {
    const activity: ProspectActivity = {
      ...act,
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.activities.unshift(activity);
    this.saveToStorage();
    return activity;
  }

  public getDiscoveries(): DiscoveryRecord[] { return this.discoveries; }

  public addDiscovery(disc: Omit<DiscoveryRecord, 'id' | 'created_at'>): DiscoveryRecord {
    const record: DiscoveryRecord = {
      ...disc,
      id: `disc-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.discoveries.unshift(record);
    this.updateProspect(disc.prospect_id, { pipeline_stage: 'DISCOVERY', status: 'ACTIVE' });
    return record;
  }

  public getDemos(): DemoRecord[] { return this.demos; }

  public addDemo(demo: Omit<DemoRecord, 'id' | 'created_at'>): DemoRecord {
    const record: DemoRecord = {
      ...demo,
      id: `demo-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.demos.unshift(record);
    this.updateProspect(demo.prospect_id, { pipeline_stage: 'DEMO', status: 'ACTIVE' });
    return record;
  }

  public getProposals(): ProposalRecord[] { return this.proposals; }

  public addProposal(prop: Omit<ProposalRecord, 'id' | 'created_at'>): ProposalRecord {
    const record: ProposalRecord = {
      ...prop,
      id: `prop-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.proposals.unshift(record);
    this.updateProspect(prop.prospect_id, { pipeline_stage: 'PROPOSAL', status: 'ACTIVE' });
    return record;
  }

  public getDeals(): DealRecord[] { return this.deals; }

  public createDeal(prospectId: string, amount: number, salesId: string, salesName: string): DealRecord {
    const prospect = this.prospects.find(p => p.id === prospectId);
    const deal: DealRecord = {
      id: `deal-${Date.now()}`,
      tenant_id: 'tenant-minara-01',
      prospect_id: prospectId,
      prospect_nama: prospect?.nama_lembaga || 'Pesantren',
      sales_id: salesId,
      sales_name: salesName,
      amount,
      status: 'CLOSED_PENDING',
      closed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.deals.unshift(deal);
    this.updateProspect(prospectId, { pipeline_stage: 'WON', status: 'CLOSING' });
    
    this.createCSTenantFromDeal(deal, prospect);

    this.saveToStorage();

    this.logAudit(salesId, 'DEAL_CLOSED_HANDOFF_INITIATED', 'deals', deal.id, undefined, deal as unknown as Record<string, unknown>);
    return deal;
  }

  // AI AUTOMATED FINANCE WORKFLOW (Otomatisasi Penerbitan Invoice & Payment Gate)
  public autoProcessAIFinanceBilling(dealId: string): DealRecord | null {
    const idx = this.deals.findIndex(d => d.id === dealId);
    if (idx === -1) return null;

    const prev = { ...this.deals[idx] };
    const updated = {
      ...this.deals[idx],
      status: 'READY_FOR_ACTIVATION' as const,
      finance_verifier_id: 'ai-finance-agent-01',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.deals[idx] = updated;
    this.saveToStorage();

    this.logAudit('ai-finance-agent-01', 'AI_FINANCE_AUTO_INVOICE_AND_PAYMENT_VERIFIED', 'deals', dealId, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  // 1-CLICK LIVE PRODUCTION ACTIVATION (Super Admin / Developer)
  public verifyPaymentProof(dealId: string, proofUrl?: string): DealRecord | null {
    const idx = this.deals.findIndex(d => d.id === dealId);
    if (idx === -1) return null;

    const prev = { ...this.deals[idx] };
    const updated = {
      ...this.deals[idx],
      client_pipeline_status: 'PAYMENT_VERIFIED' as const,
      payment_proof_url: proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300',
      status: 'READY_FOR_ACTIVATION' as const,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.deals[idx] = updated;
    
    // Also sync CS Tenant record payment status
    const csIdx = this.csTenants.findIndex(t => t.deal_id === dealId);
    if (csIdx !== -1) {
      this.csTenants[csIdx].client_pipeline_status = 'PAYMENT_VERIFIED';
      this.csTenants[csIdx].payment_status = 'LUNAS';
    }

    this.saveToStorage();
    this.logAudit(this.currentEmployee.id, 'CLIENT_PIPELINE_PAYMENT_VERIFIED', 'deals', dealId, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public activateLiveProduction1Click(dealId: string, superAdminId: string): DealRecord | null {
    const idx = this.deals.findIndex(d => d.id === dealId);
    if (idx === -1) return null;

    const deal = this.deals[idx];
    const prev = { ...deal };
    const tenantCode = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const masterEmail = deal.email || `admin.${deal.prospect_nama?.toLowerCase().replace(/\s+/g, '') || 'client'}@minara.id`;
    const tempPass = `Minara#${Math.floor(100 + Math.random() * 900)}`;

    const creds = {
      tenant_code: tenantCode,
      master_email: masterEmail,
      temporary_pass: tempPass,
      activated_at: new Date().toISOString(),
      activated_by: superAdminId
    };

    const updated = {
      ...deal,
      client_pipeline_status: 'LIVE_PRODUCTION' as const,
      status: 'ACTIVE_TENANT' as const,
      reward_eligible_at: new Date().toISOString(),
      production_credentials: creds,
      updated_at: new Date().toISOString()
    };

    this.deals[idx] = updated;

    // Sync to CS Tenant Record
    const csIdx = this.csTenants.findIndex(t => t.deal_id === dealId);
    if (csIdx !== -1) {
      this.csTenants[csIdx].client_pipeline_status = 'LIVE_PRODUCTION';
      this.csTenants[csIdx].workflow_stage = 'ACTIVE';
      this.csTenants[csIdx].production_credentials = creds;
      this.csTenants[csIdx].next_action = 'Sistem Live Production Aktif! Lakukan Review Penggunaan (Hari ke-14)';
    }

    this.saveToStorage();
    this.logAudit(superAdminId, 'SUPER_ADMIN_1CLICK_LIVE_PRODUCTION_ACTIVATED', 'deals', dealId, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  private createCSTenantFromDeal(deal: DealRecord, prospect?: Prospect) {
    const csTenant: CSTenantRecord = {
      id: `cst-${Date.now()}`,
      tenant_id: 'tenant-minara-01',
      deal_id: deal.id,
      prospect_id: deal.prospect_id,
      nama_lembaga: prospect?.nama_lembaga || deal.prospect_nama || 'Pesantren Baru',
      pic: prospect?.pic || 'Pengasuh Utama',
      no_hp: prospect?.no_hp || '081200000000',
      sales_owner_name: deal.sales_name || 'Sales Rep',
      amount: deal.amount,
      cs_owner_id: 'emp-2',
      cs_owner_name: 'Siti Rahmawati (CS)',
      workflow_stage: 'TENANT_BARU',
      health_status: 'HIJAU',
      day_1_setup_completed: false,
      day_7_training_completed: false,
      day_14_review_completed: false,
      day_30_healthcheck_completed: false,
      active_user_count: 0,
      complaint_count: 0,
      payment_status: 'PENDING',
      next_action: 'Account Setup & Pengaturan Modul (Hari ke-1)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.csTenants.unshift(csTenant);
  }

  public updateDealStatus(dealId: string, newStatus: DealLifecycleStatus, verifierId: string, reason?: string): DealRecord | null {
    const idx = this.deals.findIndex(d => d.id === dealId);
    if (idx === -1) return null;

    const prev = { ...this.deals[idx] };
    const updates: Partial<DealRecord> = { status: newStatus, updated_at: new Date().toISOString() };

    if (newStatus === 'PENDING_FINANCE') {
      updates.cs_verifier_id = verifierId;
      updates.implemented_at = new Date().toISOString();
    } else if (newStatus === 'READY_FOR_ACTIVATION') {
      updates.finance_verifier_id = verifierId;
      updates.paid_at = new Date().toISOString();
    } else if (newStatus === 'ACTIVE_TENANT') {
      updates.reward_eligible_at = new Date().toISOString();
    } else if (newStatus === 'CANCELLED') {
      updates.cancelled_at = new Date().toISOString();
      updates.cancellation_reason = reason;
    }

    const updated = { ...this.deals[idx], ...updates };
    this.deals[idx] = updated;
    this.saveToStorage();

    this.logAudit(verifierId, `DEAL_STATUS_${newStatus}`, 'deals', dealId, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public getCSTenants(): CSTenantRecord[] {
    return this.csTenants;
  }

  public updateCSTenantStage(id: string, stage: CSTenantWorkflowStage, nextAction?: string): CSTenantRecord | null {
    const idx = this.csTenants.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const prev = { ...this.csTenants[idx] };
    const updated = {
      ...this.csTenants[idx],
      workflow_stage: stage,
      next_action: nextAction || this.csTenants[idx].next_action,
      updated_at: new Date().toISOString()
    };
    this.csTenants[idx] = updated;
    this.saveToStorage();

    this.logAudit(this.currentEmployee.id, `CS_STAGE_${stage}`, 'cs_tenants', id, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public updateCSTenantMilestone(id: string, milestone: 'day_1' | 'day_7' | 'day_14' | 'day_30'): CSTenantRecord | null {
    const idx = this.csTenants.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const prev = { ...this.csTenants[idx] };
    const updates: Partial<CSTenantRecord> = { updated_at: new Date().toISOString() };

    if (milestone === 'day_1') updates.day_1_setup_completed = true;
    else if (milestone === 'day_7') updates.day_7_training_completed = true;
    else if (milestone === 'day_14') updates.day_14_review_completed = true;
    else if (milestone === 'day_30') updates.day_30_healthcheck_completed = true;

    const updated = { ...this.csTenants[idx], ...updates };
    this.csTenants[idx] = updated;
    this.saveToStorage();

    this.logAudit(this.currentEmployee.id, `CS_MILESTONE_${milestone.toUpperCase()}`, 'cs_tenants', id, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public getSupportTickets(): SupportTicket[] {
    return this.supportTickets;
  }

  public addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'ticket_code' | 'created_at'>): SupportTicket {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tick-${Date.now()}`,
      ticket_code: `TCK-2026-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString()
    };
    this.supportTickets.unshift(newTicket);
    
    const tenantIdx = this.csTenants.findIndex(t => t.id === ticket.cs_tenant_id);
    if (tenantIdx !== -1) {
      this.csTenants[tenantIdx].complaint_count += 1;
      if (this.csTenants[tenantIdx].complaint_count >= 2) {
        this.csTenants[tenantIdx].health_status = 'KUNING';
      }
    }

    this.saveToStorage();
    this.logAudit(this.currentEmployee.id, 'TICKET_CREATED', 'support_tickets', newTicket.id, undefined, newTicket as unknown as Record<string, unknown>);
    return newTicket;
  }

  public updateTicketStatus(id: string, status: TicketStatus, solution?: string): SupportTicket | null {
    const idx = this.supportTickets.findIndex(t => t.id === id);
    if (idx === -1) return null;

    const prev = { ...this.supportTickets[idx] };
    const updates: Partial<SupportTicket> = { status };
    if (solution) updates.solution = solution;
    if (status === 'RESOLVED') updates.resolved_at = new Date().toISOString();

    const updated = { ...this.supportTickets[idx], ...updates };
    this.supportTickets[idx] = updated;
    this.saveToStorage();

    this.logAudit(this.currentEmployee.id, `TICKET_STATUS_${status}`, 'support_tickets', id, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public getReactivationLeads(): ReactivationLead[] {
    return this.reactivationLeads;
  }

  public updateReactivationStage(id: string, stage: ReactivationStage): ReactivationLead | null {
    const idx = this.reactivationLeads.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const prev = { ...this.reactivationLeads[idx] };
    const updated = { ...this.reactivationLeads[idx], stage, updated_at: new Date().toISOString() };
    this.reactivationLeads[idx] = updated;
    this.saveToStorage();

    this.logAudit(this.currentEmployee.id, `REACTIVATION_STAGE_${stage}`, 'reactivation_leads', id, prev as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>);
    return updated;
  }

  public getAuditLogs(): AuditLog[] { return this.auditLogs; }

  private logAudit(
    actorId: string, eventType: string, entityType: string, entityId: string, 
    prev?: Record<string, unknown>, next?: Record<string, unknown>
  ) {
    const actor = this.employees.find(e => e.id === actorId) || this.currentEmployee;
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      tenant_id: 'tenant-minara-01',
      created_at: new Date().toISOString(),
      created_by: actorId,
      created_by_name: `${actor.name} (${actor.role.toUpperCase()})`,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      previous_value: prev,
      new_value: next
    };
    this.auditLogs.unshift(log);
    this.saveToStorage();
  }
}

export const systemStore = new SystemStore();
