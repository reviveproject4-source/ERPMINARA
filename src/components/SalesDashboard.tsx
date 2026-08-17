import React, { useState } from 'react';
import type { Prospect, ProposalRecord, DealRecord, SalesLevel } from '../types/database';
import { KPIEngine } from '../engine/kpiEngine';
import type { KPIOverallScorecard } from '../engine/kpiEngine';
import { systemStore } from '../lib/supabase';
import { SalesAttendanceModal } from './SalesAttendanceModal';
import { 
  Users, CheckCircle2, TrendingUp, Clock, 
  Award, ChevronRight, Plus, MapPin, Building, 
  FileCheck, Filter, Calendar, RefreshCw, Layers, ShieldCheck, Mail, UserCheck,
  AlertTriangle, DollarSign, HelpCircle, GraduationCap, ShoppingBag, Radio, Sparkles
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
  const [salesLevel, setSalesLevel] = useState<SalesLevel>(currentSales.sales_level || 'MID_LEVEL');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Calculate actuals per product
  const prospekCount = prospects.length;
  const followupCount = prospects.reduce((acc, p) => acc + p.followup_count, 0);
  const discoveryCount = prospects.filter(p => ['DISCOVERY', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length;
  const demoCount = prospects.filter(p => ['DEMO', 'PROPOSAL', 'NEGOTIATION', 'WON'].includes(p.pipeline_stage)).length;
  const proposalCount = proposals.length;
  
  const myDeals = deals.filter(d => d.sales_id === currentSales.id && d.status !== 'CANCELLED');
  const closingCount = myDeals.length;

  // Product-specific amounts
  const pilinDeals = myDeals.filter(d => (d.produk_minat || []).includes('Pilin') || d.pilin_details);
  const pilinAmount = pilinDeals.reduce((acc, d) => acc + d.amount, 0);

  const caDeals = myDeals.filter(d => (d.produk_minat || []).includes('CeritaAnanda') || d.ceritaananda_details);
  const caAmount = caDeals.reduce((acc, d) => acc + d.amount, 0);

  const ksDeals = myDeals.filter(d => (d.produk_minat || []).includes('Kabarsantri') || d.kabarsantri_details);
  const ksInitialAmount = ksDeals.reduce((acc, d) => acc + (d.amount * 0.5), 0);
  const ksSubMonth2_6Amount = ksDeals.reduce((acc, d) => acc + (d.amount * 0.3), 0);
  const ksRenewalMonth7Amount = ksDeals.reduce((acc, d) => acc + (d.amount * 0.2), 0);

  const closingAmount = myDeals.reduce((acc, d) => acc + d.amount, 0);
  const pipelineValue = prospects.reduce((acc, p) => acc + (p.nilai_peluang || 0), 0);

  // Calculate Scorecard based on Sales Level (Junior vs Mid-Level) & Minara Bible Rules
  const scorecard: KPIOverallScorecard = KPIEngine.calculateScorecard({
    prospek: prospekCount,
    followup: followupCount,
    discovery: discoveryCount,
    demo: demoCount,
    proposal: proposalCount,
    closing: closingCount,
    sales_level: salesLevel,
    pilin_amount: pilinAmount,
    ceritaananda_amount: caAmount,
    kabarsantri_initial_amount: ksInitialAmount,
    kabarsantri_subscription_month2_6_amount: ksSubMonth2_6Amount,
    kabarsantri_renewal_month7_amount: ksRenewalMonth7Amount,
    closing_amount: closingAmount,
    points: prospekCount * 10 + followupCount * 5 + discoveryCount * 25 + demoCount * 50 + proposalCount * 75 + closingCount * 200
  });

  // Filter today's actions
  const todaysActions = prospects.filter(p => {
    return p.status === 'ACTIVE' || p.status.startsWith('FOLLOWUP') || p.aging_days > 7;
  });

  return (
    <div className="text-white p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      
      {/* Sales Profile Header & Sales Level Switcher */}
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
                <ShieldCheck className="w-3 h-3" /> Verifikasi GPS, Foto, & Presensi
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 font-medium">
              <span>Kanvasing General: <strong className="text-indigo-400">Pilin • CeritaAnanda • Kabarsantri</strong></span>
              <span>•</span>
              <span>Total Poin: <strong className="text-amber-400">{scorecard.totalPoints} PTS</strong></span>
            </p>
          </div>
        </div>

        {/* Level Switcher & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Sales Level Toggle */}
          <div className="flex items-center bg-gray-900/90 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setSalesLevel('JUNIOR')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                salesLevel === 'JUNIOR' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🌱 Junior (Bulan 1-3)
            </button>
            <button
              onClick={() => setSalesLevel('MID_LEVEL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                salesLevel === 'MID_LEVEL' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🚀 Menengah (Bulan 4+)
            </button>
          </div>

          <button 
            onClick={() => setIsAttendanceModalOpen(true)}
            className="btn-secondary text-xs py-2 px-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>📍 Presensi Sales</span>
          </button>

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
            <span>+ Input Prospek</span>
          </button>
        </div>
      </div>

      {/* 💳 PRODUCT COMMISSION BREAKDOWN BANNER (PERHITUNGAN GAJI DIVISI KEUANGAN) */}
      <div className="glass-card p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-2xl space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-indigo-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Struktur Komisi Produk untuk Perhitungan Gaji Divisi Keuangan (Minara Bible)</span>
          </div>
          <span className="badge-blue text-[10px] px-2.5 py-0.5 font-bold font-mono">
            Total Komisi: Rp {scorecard.total_commission_all_products.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* PILIN Commission */}
          <div className="bg-gray-900/80 p-3 rounded-xl border border-blue-500/30 space-y-1">
            <div className="flex justify-between items-center text-blue-300 font-bold">
              <span className="flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" /> PILIN (UMKM BOS)</span>
              <span className="badge-blue text-[9px] font-mono">Komisi 5%</span>
            </div>
            <div className="text-gray-300 font-mono text-[11px] justify-between flex">
              <span>Implementasi: Rp {pilinAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-emerald-400 font-bold font-mono text-xs pt-1 border-t border-white/5 flex justify-between">
              <span>Komisi Gaji:</span>
              <span>Rp {(pilinAmount * 0.05).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* CeritaAnanda Commission */}
          <div className="bg-gray-900/80 p-3 rounded-xl border border-emerald-500/30 space-y-1">
            <div className="flex justify-between items-center text-emerald-300 font-bold">
              <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> CeritaAnanda (PAUD/TK)</span>
              <span className="badge-emerald text-[9px] font-mono">Komisi 5%</span>
            </div>
            <div className="text-gray-300 font-mono text-[11px] justify-between flex">
              <span>Implementasi: Rp {caAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-emerald-400 font-bold font-mono text-xs pt-1 border-t border-white/5 flex justify-between">
              <span>Komisi Gaji:</span>
              <span>Rp {(caAmount * 0.05).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Kabarsantri Commission */}
          <div className="bg-gray-900/80 p-3 rounded-xl border border-purple-500/30 space-y-1">
            <div className="flex justify-between items-center text-purple-300 font-bold">
              <span className="flex items-center gap-1"><Radio className="w-3.5 h-3.5" /> Kabarsantri (Pesantren)</span>
              <span className="badge-purple text-[9px] font-mono">5% / 2% / 2%</span>
            </div>
            <div className="text-gray-300 font-mono text-[10px] space-y-0.5">
              <div className="flex justify-between"><span>Aktivasi Bln 1 (5%):</span><span>Rp {(ksInitialAmount * 0.05).toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Langganan Bln 2-6 (2%):</span><span>Rp {(ksSubMonth2_6Amount * 0.02).toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Perpanjangan Bln 7+ (2%):</span><span>Rp {(ksRenewalMonth7Amount * 0.02).toLocaleString('id-ID')}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* OPSI B BANNER: PENJELASAN ALASAN RAPOR & STRUKTUR GAJI */}
      <div className={`glass-card p-4 border-2 rounded-2xl space-y-2 text-xs ${
        scorecard.zone === 'OVERACHIEVEMENT' || scorecard.zone === 'MEETS_STANDARD' 
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' 
          : scorecard.zone === 'NEAR_STANDARD' 
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-200' 
          : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
      }`}>
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Penjelasan Rapor Kinerja Level {salesLevel} & Gaji Divisi Keuangan</span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] ${
            scorecard.zone === 'OVERACHIEVEMENT' || scorecard.zone === 'MEETS_STANDARD' ? 'badge-emerald' :
            scorecard.zone === 'NEAR_STANDARD' ? 'badge-amber' : 'badge-rose'
          }`}>
            Status Rapor: {scorecard.zone} (Grade {scorecard.grade})
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{scorecard.explanation_reason}</span>
          </p>

          <p className="text-[11px] text-gray-300 flex items-center gap-1.5 pl-5 font-mono">
            <DollarSign className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{scorecard.payroll_impact_explanation}</span>
          </p>
        </div>
      </div>

      {/* 6 PRIMARY KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 flex flex-col justify-between hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
            <span>Data Prospek (10%)</span>
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
            <span>Discovery (10%)</span>
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
            <span>Demo SOP (15%)</span>
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
            <span>Proposal SLA (15%)</span>
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
            <span>Closing (50%)</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-amber-300">{closingCount}</span>
            <span className="text-xs text-gray-400 ml-1">Deal</span>
          </div>
          <div className="text-[10px] text-amber-400 font-bold">
            Omset: Rp {(closingAmount / 1000000).toFixed(1)}M / {(scorecard.target_closing_amount / 1000000).toFixed(0)}M
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
              <h3 className="text-sm font-bold text-white">
                Personal Performance Scorecard (Minara Bible — Level {salesLevel})
              </h3>
              <p className="text-xs text-gray-400">
                Prospek 10% • Discovery 10% • Demo 15% • Proposal 15% • Closing 50%
              </p>
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
              scorecard.grade === 'B' ? 'bg-gradient-to-tr from-amber-500 to-orange-400' :
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
            🎉 Belum ada prospek yang diinput. Klik "+ Input Prospek" untuk mulai kanvasing.
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
                  {prospect.visit_proof?.photo_url ? (
                    <img src={prospect.visit_proof.photo_url} alt="Foto Kunjungan" className="w-9 h-9 rounded-lg object-cover border border-emerald-500/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">
                      {prospect.followup_cadence || 'H+7'}
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-white">{prospect.nama_lembaga}</h4>
                    <p className="text-gray-400 text-[11px]">
                      PIC: {prospect.pic} • {prospect.no_hp} {prospect.email && `• ${prospect.email}`}
                    </p>
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
          <span className="text-xs text-gray-500">Mencakup Email, Foto, GPS Tempat, & Waktu</span>
        </div>

        {prospects.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-400 text-xs space-y-2">
            <Layers className="w-8 h-8 text-indigo-400 mx-auto opacity-50" />
            <p className="font-bold text-white text-sm">Belum Ada Prospek Kanvasing</p>
            <p>Data sales bersifat general untuk 3 produk Minara (Pilin, CeritaAnanda, & Kabarsantri) dengan Email, foto, & GPS tempat.</p>
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

                {/* Email Display */}
                {prospect.email && (
                  <div className="text-[11px] text-cyan-300 flex items-center gap-1.5 font-mono">
                    <Mail className="w-3 h-3 text-cyan-400" /> {prospect.email}
                  </div>
                )}

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

      {/* SALES ATTENDANCE MODAL */}
      {isAttendanceModalOpen && (
        <SalesAttendanceModal
          onClose={() => setIsAttendanceModalOpen(false)}
          onSaved={() => onRefresh()}
        />
      )}

    </div>
  );
};
