import React from 'react';
import type { Prospect, ProposalRecord, DealRecord, CSTenantRecord, SupportTicket } from '../types/database';
import { CoachingEngine } from '../engine/coachingEngine';
import type { CoachingSignalItem } from '../engine/coachingEngine';
import { systemStore } from '../lib/supabase';
import { 
  Sparkles, AlertCircle, DollarSign, CheckCircle2, 
  Clock, ShieldCheck, RefreshCw, Activity
} from 'lucide-react';

interface OwnerDashboardProps {
  prospects: Prospect[];
  proposals: ProposalRecord[];
  deals: DealRecord[];
  onRefresh: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  prospects,
  proposals,
  deals,
  onRefresh
}) => {
  const csTenants: CSTenantRecord[] = systemStore.getCSTenants();
  const supportTickets: SupportTicket[] = systemStore.getSupportTickets();

  // Calculate Executive Analytics (Sales + CS BOS)
  const potentialCS = deals.filter(d => d.status === 'CLOSED_PENDING').reduce((acc, d) => acc + d.amount, 0);
  const potentialFinance = deals.filter(d => d.status === 'PENDING_FINANCE').reduce((acc, d) => acc + d.amount, 0);
  const realizedOmset = deals.filter(d => ['ACTIVE_TENANT', 'REWARD_ELIGIBLE'].includes(d.status)).reduce((acc, d) => acc + d.amount, 0);
  const lostOmset = deals.filter(d => d.status === 'CANCELLED').reduce((acc, d) => acc + d.amount, 0);

  // CS BOS Aggregations
  const countHijau = csTenants.filter(t => t.health_status === 'HIJAU').length;
  const countKuning = csTenants.filter(t => t.health_status === 'KUNING').length;
  const countMerah = csTenants.filter(t => t.health_status === 'MERAH').length;
  const resolvedTickets = supportTickets.filter(t => t.status === 'RESOLVED').length;
  const ticketResolutionRate = supportTickets.length > 0 ? Math.round((resolvedTickets / supportTickets.length) * 100) : 100;

  // Generate Coaching Signals
  const coachingSignals: CoachingSignalItem[] = CoachingEngine.generateSignals(
    prospects,
    proposals,
    {
      prospek: prospects.length,
      discovery: prospects.filter(p => ['DISCOVERY', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length,
      demo: prospects.filter(p => ['DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length,
      proposal: proposals.length,
      closing: deals.length
    }
  );

  const handleCSVerify = (dealId: string) => {
    systemStore.updateDealStatus(dealId, 'PENDING_FINANCE', 'emp-2');
    onRefresh();
  };

  const handleFinanceVerify = (dealId: string) => {
    systemStore.updateDealStatus(dealId, 'READY_FOR_ACTIVATION', 'emp-3');
    onRefresh();
  };

  const handleSuperAdminActivate = (dealId: string) => {
    systemStore.updateDealStatus(dealId, 'ACTIVE_TENANT', 'emp-5');
    onRefresh();
  };

  return (
    <div className="space-y-5 text-white p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-card p-5 bg-gradient-to-r from-purple-950/40 via-indigo-900/20 to-gray-900 border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Founder / Owner Executive Report</h2>
                <span className="badge-purple text-[11px] px-2 py-0.5 rounded-full font-mono">
                  Master Data Agregasi
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Monitoring omset real-time, velocity handoff, & kesehatan tenant.
              </p>
            </div>
          </div>

          <button onClick={onRefresh} className="btn-secondary py-2 px-3 text-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EXECUTIVE OMSET PIPELINE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Card 1: Potential CS */}
        <div className="glass-card p-4 border-l-4 border-amber-500">
          <div className="flex justify-between items-center text-gray-400">
            <span>🟡 Pending CS Onboarding</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-extrabold text-amber-300">
              Rp {(potentialCS / 1000000).toFixed(0)} Juta
            </span>
          </div>
          <div className="text-[11px] text-gray-400">
            {deals.filter(d => d.status === 'CLOSED_PENDING').length} Deal verifikasi CS
          </div>
        </div>

        {/* Card 2: Potential Finance */}
        <div className="glass-card p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center text-gray-400">
            <span>🔵 Pending Pembayaran Finance</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-extrabold text-blue-300">
              Rp {(potentialFinance / 1000000).toFixed(0)} Juta
            </span>
          </div>
          <div className="text-[11px] text-gray-400">
            {deals.filter(d => d.status === 'PENDING_FINANCE').length} Deal konfirmasi kas
          </div>
        </div>

        {/* Card 3: Realized Omset */}
        <div className="glass-card p-4 border-l-4 border-emerald-500 bg-emerald-500/5">
          <div className="flex justify-between items-center text-emerald-300 font-bold">
            <span>🟢 Realized Omset (Sah & Aktif)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-emerald-300">
              Rp {(realizedOmset / 1000000).toFixed(0)} Juta
            </span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {deals.filter(d => ['ACTIVE_TENANT', 'REWARD_ELIGIBLE'].includes(d.status)).length} Tenant Aktif • Reward Eligible
          </div>
        </div>

        {/* Card 4: Lost Omset */}
        <div className="glass-card p-4 border-l-4 border-rose-500">
          <div className="flex justify-between items-center text-gray-400">
            <span>🔴 Lost Omset (Pembatalan)</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-extrabold text-rose-300">
              Rp {(lostOmset / 1000000).toFixed(0)} Juta
            </span>
          </div>
          <div className="text-[11px] text-gray-400">
            {deals.filter(d => d.status === 'CANCELLED').length} Deal dibatalkan
          </div>
        </div>
      </div>

      {/* CS BOS AGGREGATED REPORT */}
      <div className="glass-card p-5 border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">CS BOS Executive Summary Report</h3>
          </div>
          <span className="badge-purple text-[10px]">Operational Integration</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-900/80 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-gray-400">Customer Health:</span>
            <div className="flex items-center gap-2 font-bold mt-0.5">
              <span className="text-emerald-400 font-mono">{countHijau} 🟢</span>
              <span className="text-amber-400 font-mono">{countKuning} 🟡</span>
              <span className="text-rose-400 font-mono">{countMerah} 🔴</span>
            </div>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-gray-400">Onboarding Progress:</span>
            <div className="text-sm font-bold text-white mt-0.5">
              {csTenants.filter(t => t.workflow_stage === 'ACTIVE').length} / {csTenants.length} Aktif
            </div>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-gray-400">Ticket Resolution:</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              {ticketResolutionRate}% SLA Rate
            </div>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-white/5 space-y-1">
            <span className="text-gray-400">CSAT Score:</span>
            <div className="text-sm font-bold text-amber-300 mt-0.5">
              4.9 / 5.0 ⭐
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION HANDOFF & ACTIVATION QUEUE */}
      <div className="glass-card p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Verification Handoff & Super Admin Activation Gate</h3>
          </div>
          <span className="text-xs text-gray-500">Alur verifikasi lintas divisi (Sales → CS → Finance → Super Admin)</span>
        </div>

        {deals.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-xs">Belum ada deal.</div>
        ) : (
          <div className="space-y-2 text-xs">
            {deals.map((deal) => (
              <div 
                key={deal.id}
                className="bg-gray-900/80 p-3.5 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">{deal.prospect_nama || 'Pesantren'}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      deal.status === 'CLOSED_PENDING' ? 'badge-amber' :
                      deal.status === 'PENDING_FINANCE' ? 'badge-blue' :
                      deal.status === 'READY_FOR_ACTIVATION' ? 'badge-emerald' :
                      deal.status === 'ACTIVE_TENANT' ? 'badge-emerald' : 'badge-rose'
                    }`}>
                      {deal.status === 'READY_FOR_ACTIVATION' ? '🟢 LAMPU HIJAU' : deal.status}
                    </span>
                  </div>

                  <p className="text-gray-400 mt-0.5">
                    Sales: <strong className="text-gray-200">{deal.sales_name || 'Budi'}</strong> • Nilai: <strong className="text-emerald-400 font-mono">Rp {deal.amount.toLocaleString('id-ID')}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {deal.status === 'CLOSED_PENDING' && (
                    <button 
                      onClick={() => handleCSVerify(deal.id)}
                      className="btn-secondary text-xs py-1.5 px-3 bg-amber-500/10 text-amber-300 border-amber-500/30"
                    >
                      Verifikasi CS
                    </button>
                  )}

                  {deal.status === 'PENDING_FINANCE' && (
                    <button 
                      onClick={() => handleFinanceVerify(deal.id)}
                      className="btn-secondary text-xs py-1.5 px-3 bg-blue-500/10 text-blue-300 border-blue-500/30"
                    >
                      Verifikasi Finance
                    </button>
                  )}

                  {deal.status === 'READY_FOR_ACTIVATION' && (
                    <button 
                      onClick={() => handleSuperAdminActivate(deal.id)}
                      className="btn-primary text-xs py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold"
                    >
                      🚀 Super Admin: Aktifkan Aplikasi!
                    </button>
                  )}

                  {deal.status === 'ACTIVE_TENANT' && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reward Eligible
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COACHING SIGNALS RADAR */}
      <div className="glass-card p-5 border border-amber-500/20 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Coaching Signals Radar</h3>
          </div>
          <span className="badge-amber text-[10px]">Sinyal Otomatis Sistem</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coachingSignals.map((signal) => (
            <div key={signal.id} className="bg-gray-900/90 p-3 rounded-xl border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-300">{signal.title}</h4>
                <span className="badge-rose text-[9px]">{signal.severity}</span>
              </div>
              <p className="text-gray-300">{signal.message}</p>
              <div className="bg-amber-500/10 p-2 rounded-lg text-amber-200 text-[11px]">
                👉 {signal.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
