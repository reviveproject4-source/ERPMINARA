import React, { useState } from 'react';
import type { CSTenantRecord, SupportTicket, ReactivationLead, CSTenantWorkflowStage, TicketCategory, TicketPriority, ReactivationStage } from '../types/database';
import { CSKPIEngine } from '../engine/csKpiEngine';
import { systemStore } from '../lib/supabase';
import { 
  Layers, CheckCircle2, Activity, 
  HelpCircle, RefreshCw, UserCheck, Plus, X, Award, 
  PhoneCall, Zap
} from 'lucide-react';

interface CSDashboardProps {
  csTenants: CSTenantRecord[];
  supportTickets: SupportTicket[];
  reactivationLeads: ReactivationLead[];
  onRefresh: () => void;
}

export const CSDashboard: React.FC<CSDashboardProps> = ({
  csTenants,
  supportTickets,
  reactivationLeads,
  onRefresh
}) => {
  const currentCS = systemStore.getCurrentEmployee();

  // Active Tab View in CS BOS
  const [activeSubTab, setActiveSubTab] = useState<'onboarding' | 'health' | 'tickets' | 'reactivation' | 'kpi'>('onboarding');

  // New Support Ticket Modal State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState(csTenants[0]?.id || '');
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>('Technical Issue');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('Normal');
  const [ticketDescription, setTicketDescription] = useState('');

  // Calculate Health Counts
  const countHijau = csTenants.filter(t => t.health_status === 'HIJAU').length;
  const countKuning = csTenants.filter(t => t.health_status === 'KUNING').length;
  const countMerah = csTenants.filter(t => t.health_status === 'MERAH').length;

  // Calculate Support Counts
  const newTickets = supportTickets.filter(t => t.status === 'NEW').length;
  const resolvedCount = supportTickets.filter(t => t.status === 'RESOLVED').length;
  const resolutionRate = supportTickets.length > 0 ? Math.round((resolvedCount / supportTickets.length) * 100) : 100;

  // CS KPI Scorecard Calculation
  const csScorecard = CSKPIEngine.calculateScorecard({
    responseTimeMinutes: 12,
    ticketResolutionPct: resolutionRate,
    csatScore: 4.9,
    adoptionPct: 92,
    retentionPct: 95,
    onboardingPct: 100,
    reactivationCount: reactivationLeads.filter(r => r.stage === 'CONTACTED' || r.stage === 'CLOSED').length,
    bugFeedbackCount: 12,
    reportingSubmitted: true
  });

  const handleStageUpdate = (tenantId: string, stage: CSTenantWorkflowStage) => {
    systemStore.updateCSTenantStage(tenantId, stage);
    onRefresh();
  };

  const handleMilestoneToggle = (tenantId: string, milestone: 'day_1' | 'day_7' | 'day_14' | 'day_30') => {
    systemStore.updateCSTenantMilestone(tenantId, milestone);
    onRefresh();
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = csTenants.find(t => t.id === selectedTenantId) || csTenants[0];
    if (!tenant) return;

    systemStore.addSupportTicket({
      tenant_id: 'tenant-minara-01',
      cs_tenant_id: tenant.id,
      nama_lembaga: tenant.nama_lembaga,
      category: ticketCategory,
      priority: ticketPriority,
      description: ticketDescription,
      status: 'NEW',
      response_time_minutes: 10,
      sla_overdue: false
    });

    setIsTicketModalOpen(false);
    setTicketDescription('');
    onRefresh();
  };

  const handleResolveTicket = (ticketId: string) => {
    const solution = prompt('Ringkasan solusi tiket support:');
    if (!solution) return;

    systemStore.updateTicketStatus(ticketId, 'RESOLVED', solution);
    onRefresh();
  };

  const handleReactivationStage = (id: string, stage: ReactivationStage) => {
    systemStore.updateReactivationStage(id, stage);
    onRefresh();
  };

  return (
    <div className="space-y-5 text-white p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-card p-5 border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-950/40 via-gray-900 to-gray-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Customer Success OS (CS BOS)</h2>
                <span className="badge-purple text-[11px] px-2 py-0.5 rounded-full">
                  Phase 2 CS
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Petugas CS: <strong className="text-indigo-400">{currentCS.name}</strong> • Single Source of Data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsTicketModalOpen(true)}
              className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-500 py-2 px-3"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Tiket Support</span>
            </button>
            <button onClick={onRefresh} className="btn-secondary py-2 px-3 text-xs">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S ACTION BANNER */}
      <div className="glass-card p-4 border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-gray-200">
            Fokus Hari Ini: <strong className="text-emerald-400">{csTenants.filter(t => !t.day_7_training_completed).length} Training Onboarding</strong> • <strong className="text-rose-400">{newTickets} Tiket Support Baru</strong>
          </span>
        </div>

        <span className="badge-emerald text-xs px-2.5 py-0.5 font-mono">
          CSAT: {csScorecard.cards.csat.actual} / 5.0
        </span>
      </div>

      {/* NAV SUB-TABS */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2.5 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('onboarding')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'onboarding' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 inline mr-1.5" />
          Tenant Onboarding ({csTenants.length})
        </button>

        <button
          onClick={() => setActiveSubTab('health')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'health' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 inline mr-1.5" />
          Customer Health ({countHijau}🟢 / {countKuning}🟡 / {countMerah}🔴)
        </button>

        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'tickets' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 inline mr-1.5" />
          Support Tickets ({supportTickets.length})
        </button>

        <button
          onClick={() => setActiveSubTab('reactivation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'reactivation' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5 inline mr-1.5" />
          Reaktivasi Queue ({reactivationLeads.length})
        </button>

        <button
          onClick={() => setActiveSubTab('kpi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'kpi' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
          CS Scorecard ({csScorecard.grade})
        </button>
      </div>

      {/* TENANT ONBOARDING WORKFLOW */}
      {activeSubTab === 'onboarding' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {csTenants.map((tenant) => (
            <div key={tenant.id} className="glass-card p-4 space-y-3 text-xs border border-white/10 hover:border-indigo-500/40">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{tenant.nama_lembaga}</h4>
                  <p className="text-gray-400 text-[11px]">PIC: {tenant.pic} • {tenant.no_hp}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tenant.health_status === 'HIJAU' ? 'badge-emerald' :
                  tenant.health_status === 'KUNING' ? 'badge-amber' : 'badge-rose'
                }`}>
                  {tenant.health_status}
                </span>
              </div>

              <div className="bg-gray-900/60 p-2.5 rounded-lg border border-white/5 space-y-1 text-[11px]">
                <div className="flex justify-between text-gray-400">
                  <span>Sales:</span>
                  <span className="text-gray-200 font-medium">{tenant.sales_owner_name}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Nilai Deal:</span>
                  <span className="text-emerald-400 font-bold font-mono">Rp {tenant.amount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-medium mb-1">Workflow Stage:</label>
                <select
                  value={tenant.workflow_stage}
                  onChange={(e) => handleStageUpdate(tenant.id, e.target.value as CSTenantWorkflowStage)}
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="TENANT_BARU">TENANT BARU</option>
                  <option value="SETUP">SETUP</option>
                  <option value="TRAINING">TRAINING</option>
                  <option value="GO_LIVE">GO LIVE</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="RENEWAL">RENEWAL</option>
                </select>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Onboarding Milestones:</div>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={tenant.day_1_setup_completed}
                    onChange={() => handleMilestoneToggle(tenant.id, 'day_1')}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Hari 1: Account Setup</span>
                </label>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={tenant.day_7_training_completed}
                    onChange={() => handleMilestoneToggle(tenant.id, 'day_7')}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Hari 7: Training Admin/User</span>
                </label>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={tenant.day_14_review_completed}
                    onChange={() => handleMilestoneToggle(tenant.id, 'day_14')}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Hari 14: Review Penggunaan</span>
                </label>

                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={tenant.day_30_healthcheck_completed}
                    onChange={() => handleMilestoneToggle(tenant.id, 'day_30')}
                    className="accent-indigo-500 rounded"
                  />
                  <span>Hari 30: Health Check</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOMER HEALTH */}
      {activeSubTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 border-l-4 border-emerald-500">
            <h4 className="text-xs font-bold text-emerald-400">🟢 HIJAU (Aktif)</h4>
            <span className="text-2xl font-black text-white my-1 block">{countHijau} Tenant</span>
            <p className="text-[11px] text-gray-400">Penggunaan stabil & bebas kendala.</p>
          </div>

          <div className="glass-card p-4 border-l-4 border-amber-500">
            <h4 className="text-xs font-bold text-amber-400">🟡 KUNING (Menurun)</h4>
            <span className="text-2xl font-black text-amber-300 my-1 block">{countKuning} Tenant</span>
            <p className="text-[11px] text-gray-400">Aktivitas menurun / komplain ringan.</p>
          </div>

          <div className="glass-card p-4 border-l-4 border-rose-500">
            <h4 className="text-xs font-bold text-rose-400">🔴 MERAH (Churn Risk)</h4>
            <span className="text-2xl font-black text-rose-300 my-1 block">{countMerah} Tenant</span>
            <p className="text-[11px] text-gray-400">Tidak ada login &gt; 7 hari / komplain berat.</p>
          </div>
        </div>
      )}

      {/* SUPPORT TICKETS */}
      {activeSubTab === 'tickets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {supportTickets.map((ticket) => (
            <div key={ticket.id} className="glass-card p-4 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-400">{ticket.ticket_code}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ticket.status === 'RESOLVED' ? 'badge-emerald' :
                  ticket.status === 'IN_PROGRESS' ? 'badge-amber' : 'badge-rose'
                }`}>
                  {ticket.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">{ticket.nama_lembaga}</h4>
                <p className="text-gray-400 text-[11px]">{ticket.category} • Prioritas: <strong className="text-amber-400">{ticket.priority}</strong></p>
              </div>

              <p className="text-gray-200 bg-gray-900/80 p-2.5 rounded-lg border border-white/5">
                "{ticket.description}"
              </p>

              {ticket.solution && (
                <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-200 text-[11px]">
                  💡 <strong>Solusi CS:</strong> {ticket.solution}
                </div>
              )}

              {ticket.status !== 'RESOLVED' && (
                <div className="pt-2 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={() => handleResolveTicket(ticket.id)}
                    className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 py-1.5 px-3"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesaikan Tiket
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REACTIVATION QUEUE */}
      {activeSubTab === 'reactivation' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Reaktivasi Database Lama (Target: 100 DB / Bulan / CS)
            </h3>
            <span className="badge-amber text-xs font-mono font-bold">
              {reactivationLeads.length} / 100 Prospek
            </span>
          </div>

          <div className="space-y-2">
            {reactivationLeads.map((react) => (
              <div key={react.id} className="glass-card p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white">{react.nama_lembaga}</h4>
                  <p className="text-gray-400 text-[11px]">PIC: {react.pic} • Sumber: {react.source_type}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[11px]">Stage:</span>
                  <select
                    value={react.stage}
                    onChange={(e) => handleReactivationStage(react.id, e.target.value as ReactivationStage)}
                    className="bg-gray-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                  >
                    <option value="DATABASE">DATABASE</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="RESPONDED">RESPONDED</option>
                    <option value="DEMO">DEMO</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CS KPI SCORECARD */}
      {activeSubTab === 'kpi' && (
        <div className="glass-card p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">CS KPI Performance Scorecard</h3>
              <p className="text-xs text-gray-400">Dihitung dari data operasional sistem.</p>
            </div>

            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-white">Grade: {csScorecard.grade}</span>
              <span className="badge-purple text-xs font-mono">{csScorecard.overallPct}% SCORE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-400">Response Time (10%)</div>
              <div className="text-sm font-bold text-emerald-400">{csScorecard.cards.responseTime.actual} Min</div>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-400">Ticket Resolution (20%)</div>
              <div className="text-sm font-bold text-teal-400">{csScorecard.cards.ticketResolution.actual}%</div>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-400">CSAT Score (15%)</div>
              <div className="text-sm font-bold text-amber-400">{csScorecard.cards.csat.actual} / 5.0</div>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-400">Reaktivasi Recovery (15%)</div>
              <div className="text-sm font-bold text-cyan-400">{csScorecard.cards.reactivation.actual} / 100 DB</div>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-400">Customer Retention (10%)</div>
              <div className="text-sm font-bold text-purple-400">{csScorecard.cards.retention.actual}%</div>
            </div>

            <div className="bg-gray-900/60 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-gray-400">Onboarding Success (10%)</div>
              <div className="text-sm font-bold text-blue-400">{csScorecard.cards.onboarding.actual}%</div>
            </div>
          </div>
        </div>
      )}

      {/* NEW SUPPORT TICKET MODAL */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg bg-[#0d1322] border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Buat Tiket Customer Support Baru</h3>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Pilih Tenant / Pesantren *</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {csTenants.map(t => (
                    <option key={t.id} value={t.id}>{t.nama_lembaga} ({t.pic})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Kategori Tiket *</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as TicketCategory)}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Training">Training</option>
                    <option value="Billing">Billing</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Prioritas *</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as TicketPriority)}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (SLA 4 Jam)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Deskripsi Masalah / Pertanyaan *</label>
                <textarea
                  rows={3}
                  required
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Detail kendala..."
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setIsTicketModalOpen(false)} className="btn-secondary text-xs">
                  Batal
                </button>
                <button type="submit" className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-500">
                  Simpan & Kirim Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
