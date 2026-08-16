import React from 'react';
import type { Prospect, ProposalRecord, DealRecord } from '../types/database';
import { KPIEngine } from '../engine/kpiEngine';
import type { KPIOverallScorecard } from '../engine/kpiEngine';
import { systemStore } from '../lib/supabase';
import { 
  Users, CheckCircle2, TrendingUp, Clock, 
  Award, ChevronRight, Plus, MapPin, Building, 
  FileCheck, Filter, Calendar, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';

interface SalesDashboardProps {
  prospects: Prospect[];
  proposals: ProposalRecord[];
  deals: DealRecord[];
  onOpenProspectModal: (prospect?: Prospect) => void;
  onRefresh: () => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  prospects,
  proposals,
  deals,
  onOpenProspectModal,
  onRefresh
}) => {
  const currentSales = systemStore.getCurrentEmployee();

  // Calculate actuals
  const prospekCount = prospects.length;
  const followupCount = prospects.reduce((acc, p) => acc + p.followup_count, 0);
  const discoveryCount = prospects.filter(p => ['DISCOVERY', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length;
  const demoCount = prospects.filter(p => ['DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length;
  const proposalCount = proposals.length;
  const closingCount = deals.filter(d => d.sales_id === currentSales.id && d.status !== 'CANCELLED').length;
  const pipelineValue = prospects.reduce((acc, p) => acc + (p.nilai_peluang || 0), 0);

  const scorecard: KPIOverallScorecard = KPIEngine.calculateScorecard({
    prospek: prospekCount,
    followup: followupCount,
    discovery: discoveryCount,
    demo: demoCount,
    proposal: proposalCount,
    closing: closingCount,
    points: prospekCount * 10 + followupCount * 5 + discoveryCount * 25 + demoCount * 50 + proposalCount * 75 + closingCount * 200
  });

  // Filter today's actions (Active follow-ups)
  const todaysActions = prospects.filter(p => {
    return p.status === 'ACTIVE' || p.status.startsWith('FOLLOWUP') || p.aging_days > 7;
  });

  return (
    <div className="text-white p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      
      {/* Sales Profile Header */}
      <div className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-emerald-500">
        <div className="flex items-center gap-4">
          <img 
            src={currentSales.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
            alt={currentSales.name} 
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{currentSales.name}</h2>
              <span className="badge-emerald text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verifikasi GPS & Foto
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 font-medium">
              <span>Kanvasing General: <strong className="text-indigo-400">Pilin • CeritaAnanda • Kabarsantri</strong></span>
              <span>•</span>
              <span>Total Poin: <strong className="text-amber-400">{scorecard.totalPoints} PTS</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={onRefresh}
            title="Refresh Data"
            className="btn-secondary py-2 px-3 text-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onOpenProspectModal()}
            className="btn-primary w-full md:w-auto justify-center text-xs py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Prospek Baru</span>
          </button>
        </div>
      </div>

      {/* 6 PRIMARY KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 flex flex-col justify-between hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Lead Aktif</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-white">{prospekCount}</span>
            <span className="text-xs text-gray-400 ml-1">Lembaga</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            Target: {scorecard.cards.prospek.target} / bln
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between hover:border-teal-500/40">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Discovery</span>
            <Building className="w-4 h-4 text-teal-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-white">{discoveryCount}</span>
            <span className="text-xs text-gray-400 ml-1">Sesi</span>
          </div>
          <div className="text-[10px] text-teal-400 font-medium">
            Target: {scorecard.cards.discovery.target} / bln
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between hover:border-cyan-500/40">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Demo SOP</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-white">{demoCount}</span>
            <span className="text-xs text-gray-400 ml-1">Demo</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-medium">
            Target: {scorecard.cards.demo.target} / bln
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between hover:border-blue-500/40">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Proposal</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-extrabold text-white">{proposalCount}</span>
            <span className="text-xs text-gray-400 ml-1">Berkas</span>
          </div>
          <div className="text-[10px] text-blue-400 font-medium">
            Target: {scorecard.cards.proposal.target} / bln
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between hover:border-amber-500/40 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
            <span>Closing</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-amber-300">{closingCount}</span>
            <span className="text-xs text-gray-400 ml-1">Deal</span>
          </div>
          <div className="text-[10px] text-amber-400 font-bold">
            Target: {scorecard.cards.closing.target} Deals
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col justify-between hover:border-indigo-500/40">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Nilai Pipeline</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-1.5">
            <span className="text-lg font-black text-white">
              Rp {(pipelineValue / 1000000).toFixed(0)}M
            </span>
          </div>
          <div className="text-[10px] text-indigo-400 font-medium">
            General 3 Produk
          </div>
        </div>
      </div>

      {/* PERSONAL PERFORMANCE SCORECARD */}
      <div className="glass-card p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Personal Performance Scorecard</h3>
              <p className="text-xs text-gray-400">Standar baseline (100%) vs Overachievement (&gt;100%)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-900 px-3.5 py-1.5 rounded-xl border border-white/10">
            <div className="text-right text-xs">
              <span className="text-gray-400 block text-[10px]">Zona Kinerja:</span>
              <strong className="text-white">{scorecard.zone}</strong>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black text-white ${
              scorecard.grade === 'A+' ? 'bg-gradient-to-tr from-amber-500 to-yellow-300' :
              scorecard.grade === 'A' ? 'bg-gradient-to-tr from-emerald-500 to-teal-400' :
              scorecard.grade === 'B' ? 'bg-gradient-to-tr from-blue-500 to-cyan-400' :
              scorecard.grade === 'C' ? 'bg-gradient-to-tr from-amber-600 to-orange-500' :
              'bg-gradient-to-tr from-rose-600 to-red-500'
            }`}>
              {scorecard.grade}
            </div>
          </div>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(scorecard.cards).map((card) => (
            <div key={card.key} className="bg-gray-900/60 p-3.5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-200">{card.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  card.status === 'OVERACHIEVEMENT' ? 'badge-amber' :
                  card.status === 'MEETS_STANDARD' ? 'badge-emerald' : 'badge-rose'
                }`}>
                  {card.achievementPct}%
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>Aktual: <strong className="text-white">{card.actual}</strong></span>
                <span>Target: <strong>{card.target}</strong></span>
              </div>

              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    card.achievementPct > 100 ? 'bg-amber-400' :
                    card.achievementPct >= 100 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(card.achievementPct, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TODAY'S ACTION WIDGET */}
      <div className="glass-card p-5 border border-emerald-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Today's Action (Cadence Follow-up 4x)</h3>
          </div>
          <span className="badge-emerald text-xs px-2.5 py-0.5 rounded-full">
            {todaysActions.length} Prospek Cadence
          </span>
        </div>

        {todaysActions.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-xs">
            🎉 Belum ada prospek yang diinput. Klik "+ Input Prospek Baru" untuk mulai kanvasing.
          </div>
        ) : (
          <div className="space-y-2">
            {todaysActions.slice(0, 4).map((prospect) => (
              <div 
                key={prospect.id}
                onClick={() => onOpenProspectModal(prospect)}
                className="bg-gray-900/80 hover:bg-gray-800 p-3 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  {/* Photo Thumbnail if available */}
                  {prospect.visit_proof?.photo_url ? (
                    <img src={prospect.visit_proof.photo_url} alt="Foto Kunjungan" className="w-9 h-9 rounded-lg object-cover border border-emerald-500/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">
                      {prospect.followup_cadence || 'H+7'}
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-white">{prospect.nama_lembaga}</h4>
                    <p className="text-gray-400 text-[11px]">PIC: {prospect.pic} • {prospect.wilayah}</p>
                    
                    {/* Traceability Badge (GPS & Waktu) */}
                    {prospect.visit_proof && (
                      <div className="text-[10px] text-emerald-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>📍 GPS: {prospect.visit_proof.gps_lat.toFixed(3)}, {prospect.visit_proof.gps_lng.toFixed(3)}</span>
                        <span>•</span>
                        <span>⏰ {new Date(prospect.visit_proof.visit_timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge-amber text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold">
                    {prospect.followup_cadence || 'H+7'} Cadence
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PIPELINE VIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Sales Pipeline General ({prospects.length} Prospek)</span>
          </h3>
          <span className="text-xs text-gray-500">Terverifikasi GPS Tempat, Foto, & Waktu</span>
        </div>

        {prospects.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-400 text-xs space-y-2">
            <Layers className="w-8 h-8 text-indigo-400 mx-auto opacity-50" />
            <p className="font-bold text-white text-sm">Belum Ada Prospek Kanvasing</p>
            <p>Data sales bersifat general untuk 3 produk Minara (Pilin, CeritaAnanda, & Kabarsantri) dengan verifikasi foto & GPS tempat.</p>
            <button onClick={() => onOpenProspectModal()} className="btn-primary text-xs mt-2">
              + Input Prospek Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {prospects.map((prospect) => (
              <div 
                key={prospect.id}
                onClick={() => onOpenProspectModal(prospect)}
                className="glass-card p-4 hover:border-emerald-500/50 cursor-pointer transition-all space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {prospect.visit_proof?.photo_url && (
                      <img src={prospect.visit_proof.photo_url} alt="Foto Bukti" className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30" />
                    )}
                    <div>
                      <h4 className="font-bold text-white hover:text-emerald-400 transition-colors">
                        {prospect.nama_lembaga}
                      </h4>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" /> {prospect.wilayah}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    prospect.pipeline_stage === 'WON' ? 'badge-amber' :
                    prospect.pipeline_stage === 'PROPOSAL' ? 'badge-blue' :
                    prospect.pipeline_stage === 'DEMO' ? 'badge-purple' : 'badge-emerald'
                  }`}>
                    {prospect.pipeline_stage}
                  </span>
                </div>

                {/* Product Interest Badges */}
                <div className="flex flex-wrap gap-1">
                  {(prospect.produk_minat || ['Pilin', 'CeritaAnanda', 'Kabarsantri']).map(p => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {p}
                    </span>
                  ))}
                </div>

                {/* Traceability Footer */}
                {prospect.visit_proof && (
                  <div className="bg-gray-900/80 p-2 rounded-lg border border-white/5 space-y-0.5 text-[10px]">
                    <div className="flex justify-between items-center text-emerald-400 font-mono font-bold">
                      <span>📍 GPS: {prospect.visit_proof.gps_lat.toFixed(3)}, {prospect.visit_proof.gps_lng.toFixed(3)}</span>
                      <span className="text-gray-400">⏰ {new Date(prospect.visit_proof.visit_timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-gray-400 truncate">
                      {prospect.visit_proof.geo_address}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-gray-400">
                    Peluang: {prospect.nilai_peluang > 0 ? (
                      <strong className="text-emerald-400 font-mono">Rp {prospect.nilai_peluang.toLocaleString('id-ID')}</strong>
                    ) : (
                      <em className="text-gray-500">Set di Discovery</em>
                    )}
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{prospect.followup_cadence || 'H+7'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
