import React, { useState } from 'react';
import type { DealRecord, CSTenantRecord, SupportTicket, AttendanceRecord } from '../types/database';
import { systemStore } from '../lib/supabase';
import { 
  DollarSign, ShieldAlert, CheckCircle2, 
  Clock, AlertTriangle, Layers, UserCheck, Lock, Award, Heart, HelpCircle, CheckSquare
} from 'lucide-react';

interface OwnerDashboardProps {
  deals: DealRecord[];
  csTenants: CSTenantRecord[];
  tickets: SupportTicket[];
  onRefresh: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  deals,
  csTenants,
  tickets,
  onRefresh
}) => {
  const currentEmployee = systemStore.getCurrentEmployee();
  const isSuperAdmin = currentEmployee.role === 'founder' || currentEmployee.role === 'super_admin';

  // Attendance Records for Finance Payroll Verification
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    systemStore.getAttendanceRecords()
  );

  const pendingCSCount = deals.filter(d => d.status === 'CLOSED_PENDING').length;
  const pendingCSAmount = deals.filter(d => d.status === 'CLOSED_PENDING').reduce((acc, d) => acc + d.amount, 0);

  const pendingFinanceCount = deals.filter(d => d.status === 'PENDING_FINANCE').length;
  const pendingFinanceAmount = deals.filter(d => d.status === 'PENDING_FINANCE').reduce((acc, d) => acc + d.amount, 0);

  const activeCount = deals.filter(d => d.status === 'ACTIVE_TENANT' || d.status === 'REWARD_ELIGIBLE').length;
  const activeAmount = deals.filter(d => d.status === 'ACTIVE_TENANT' || d.status === 'REWARD_ELIGIBLE').reduce((acc, d) => acc + d.amount, 0);

  const cancelledCount = deals.filter(d => d.status === 'CANCELLED').length;
  const cancelledAmount = deals.filter(d => d.status === 'CANCELLED').reduce((acc, d) => acc + d.amount, 0);

  const totalOmsetTarget = 2500000000; // 5x Target Multiplier (Rp 2.5 Miliar)
  const omsetAchievementPct = Math.round((activeAmount / totalOmsetTarget) * 100);

  // CS BOS Executive Aggregations
  const csHijauCount = csTenants.filter(t => t.health_status === 'HIJAU').length;
  const csKuningCount = csTenants.filter(t => t.health_status === 'KUNING').length;
  const csMerahCount = csTenants.filter(t => t.health_status === 'MERAH').length;

  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;
  const ticketResolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

  const handleVerifyCS = (dealId: string) => {
    systemStore.updateDealStatus(dealId, 'PENDING_FINANCE', currentEmployee.id);
    onRefresh();
    alert('✅ Verifikasi Onboarding CS Selesai! Deal diteruskan ke Divisi Keuangan.');
  };

  const handleVerifyFinance = (dealId: string) => {
    systemStore.updateDealStatus(dealId, 'READY_FOR_ACTIVATION', currentEmployee.id);
    onRefresh();
    alert('✅ Verifikasi Pembayaran Finance Selesai! Lampu Hijau disiapkan untuk Super Admin.');
  };

  const handleActivateTenantSuperAdmin = (dealId: string) => {
    if (!isSuperAdmin) {
      alert('⛔ HANYA Founder / Super Admin yang berhak menyetujui Aktivasi Tenant Sah!');
      return;
    }
    systemStore.updateDealStatus(dealId, 'ACTIVE_TENANT', currentEmployee.id);
    onRefresh();
    alert('🎉 KONTRAK SAH & APLIKASI AKTIF! Sales berhak mendapatkan Komisi / Reward.');
  };

  const handleVerifyAttendanceFinance = (attId: string) => {
    systemStore.verifyAttendanceFinance(attId);
    setAttendanceRecords(systemStore.getAttendanceRecords());
    onRefresh();
    alert('✅ Presensi Sales Terverifikasi Finance! Siap dicairkan untuk Gaji / Uang Harian.');
  };

  return (
    <div className="text-white p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Executive Banner */}
      <div className="glass-card p-6 border-l-4 border-amber-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">Owner & Executive Command Center</h2>
            <span className="badge-amber text-xs px-2.5 py-0.5 rounded-full font-bold">
              Omset & CS BOS Integrated
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Perspektif Eksekutif: Memastikan Alur Data Operasional $\rightarrow$ Omset Sah $\rightarrow$ Kesehatan Tenant $\rightarrow$ Verifikasi Payroll Gaji.
          </p>
        </div>

        <div className="bg-gray-900 px-4 py-2 rounded-xl border border-white/10 text-right">
          <span className="text-[10px] text-gray-400 block font-medium">Peran Aktif Pengguna:</span>
          <strong className="text-emerald-400 text-sm">{currentEmployee.name} ({currentEmployee.role.toUpperCase()})</strong>
        </div>
      </div>

      {/* 4 PIPELINE OMSET FINANCIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* 1. Pending CS */}
        <div className="glass-card p-5 border border-amber-500/30 bg-amber-500/5 space-y-2">
          <div className="flex justify-between items-center text-amber-300 text-xs font-bold">
            <span>Pending CS Onboarding</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            Rp {(pendingCSAmount / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-gray-400 flex justify-between">
            <span>{pendingCSCount} Deal Menunggu CS</span>
            <span className="text-amber-400 font-bold">Tolak Ukur: Validasi Data</span>
          </div>
        </div>

        {/* 2. Pending Finance */}
        <div className="glass-card p-5 border border-blue-500/30 bg-blue-500/5 space-y-2">
          <div className="flex justify-between items-center text-blue-300 text-xs font-bold">
            <span>Pending Pembayaran Finance</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            Rp {(pendingFinanceAmount / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-gray-400 flex justify-between">
            <span>{pendingFinanceCount} Deal Menunggu Bayar</span>
            <span className="text-blue-400 font-bold">Tolak Ukur: Pembayaran</span>
          </div>
        </div>

        {/* 3. Realized Omset */}
        <div className="glass-card p-5 border border-emerald-500/30 bg-emerald-500/5 space-y-2">
          <div className="flex justify-between items-center text-emerald-300 text-xs font-bold">
            <span>Realized Omset (Active Tenant)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            Rp {(activeAmount / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-gray-400 flex justify-between">
            <span>{activeCount} Active Tenants</span>
            <span className="text-emerald-400 font-bold">Capaian Target: {omsetAchievementPct}%</span>
          </div>
        </div>

        {/* 4. Lost Omset */}
        <div className="glass-card p-5 border border-rose-500/30 bg-rose-500/5 space-y-2">
          <div className="flex justify-between items-center text-rose-300 text-xs font-bold">
            <span>Lost Omset (Pembatalan)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            Rp {(cancelledAmount / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-gray-400 flex justify-between">
            <span>{cancelledCount} Deal Dibatalkan</span>
            <span className="text-rose-400 font-bold">Umpan Balik Evaluasi</span>
          </div>
        </div>

      </div>

      {/* CS BOS EXECUTIVE AGGREGATIONS */}
      <div className="glass-card p-5 border border-emerald-500/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Ringkasan Kesehatan & Kepuasan Pelanggan (CS BOS)</h3>
              <p className="text-xs text-gray-400">Monitor performa retensi & keaktifan tenant secara teragregasi</p>
            </div>
          </div>
          <span className="badge-emerald text-xs px-2.5 py-0.5 font-bold">98% Active Retention Rate</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-900/80 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-gray-400 block text-[10px]">Tenant Sehat (🟢 Hijau)</span>
              <strong className="text-emerald-400 text-lg font-black">{csHijauCount} Tenant</strong>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-60" />
          </div>

          <div className="bg-gray-900/80 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-gray-400 block text-[10px]">Perhatian (🟡 Kuning)</span>
              <strong className="text-amber-400 text-lg font-black">{csKuningCount} Tenant</strong>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-400 opacity-60" />
          </div>

          <div className="bg-gray-900/80 p-3.5 rounded-xl border border-rose-500/30 flex items-center justify-between">
            <div>
              <span className="text-gray-400 block text-[10px]">Risiko Churn (🔴 Merah)</span>
              <strong className="text-rose-400 text-lg font-black">{csMerahCount} Tenant</strong>
            </div>
            <ShieldAlert className="w-6 h-6 text-rose-400 opacity-60" />
          </div>

          <div className="bg-gray-900/80 p-3.5 rounded-xl border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-gray-400 block text-[10px]">Support Ticket SLA</span>
              <strong className="text-blue-400 text-lg font-black">{ticketResolutionRate}% Selesai</strong>
            </div>
            <HelpCircle className="w-6 h-6 text-blue-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* PRESENSI SALES & VERIFIKASI KEUANGAN (DATA GAJI & TRANSPORT HARIAN) */}
      <div className="glass-card p-5 border border-indigo-500/30 bg-indigo-500/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Data Presensi Sales Field & Verifikasi Keuangan (Gaji & Transport)</h3>
              <p className="text-xs text-gray-400">Verifikasi pencairan uang makan, uang transport harian, dan insentif presensi sales</p>
            </div>
          </div>
          <span className="badge-blue text-xs px-2.5 py-0.5 font-bold">
            {attendanceRecords.length} Record Presensi
          </span>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">
            Belum ada data presensi sales terdaftar. Sales dapat melakukan presensi di Sales Mobile PWA.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {attendanceRecords.map((att) => (
              <div key={att.id} className="bg-gray-900/90 p-3 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={att.photo_url} alt="Selfie Presensi" className="w-10 h-10 rounded-lg object-cover border border-indigo-500/40" />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-bold">{att.sales_name}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.type === 'MASUK' ? 'badge-emerald' :
                        att.type === 'CHECKIN_FIELD' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {att.type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      📍 {att.geo_address} • ⏰ {new Date(att.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {att.is_verified_finance ? (
                    <span className="badge-emerald text-xs px-3 py-1 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Keuangan (Gaji Liquid)
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerifyAttendanceFinance(att.id)}
                      className="btn-primary text-xs py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Verifikasi Pembayaran Gaji / Transport
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MULTI-DIVISION VERIFICATION HANDOFF GATEWAY */}
      <div className="glass-card p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Alur Handoff Antar Divisi (Sales $\rightarrow$ CS $\rightarrow$ Finance $\rightarrow$ Owner)</h3>
              <p className="text-xs text-gray-400">Persetujuan berjenjang tanpa duplikasi penginputan data</p>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-400">Total Deals: {deals.length}</span>
        </div>

        <div className="space-y-3">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-gray-900/80 p-4 rounded-xl border border-white/10 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{deal.prospect_nama}</h4>
                  <p className="text-gray-400 text-[11px]">
                    Sales: <strong>{deal.sales_name}</strong> • Closing pada: {new Date(deal.closed_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-black font-mono text-base block">
                    Rp {deal.amount.toLocaleString('id-ID')}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    deal.status === 'CLOSED_PENDING' ? 'badge-amber' :
                    deal.status === 'PENDING_FINANCE' ? 'badge-blue' :
                    deal.status === 'READY_FOR_ACTIVATION' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold' :
                    deal.status === 'ACTIVE_TENANT' ? 'badge-emerald' : 'badge-rose'
                  }`}>
                    {deal.status === 'CLOSED_PENDING' ? '1. Menunggu Validasi Data CS' :
                     deal.status === 'PENDING_FINANCE' ? '2. Menunggu Verifikasi Pembayaran Finance' :
                     deal.status === 'READY_FOR_ACTIVATION' ? '🟢 3. Siap Aktivasi Super Admin' :
                     deal.status === 'ACTIVE_TENANT' ? '4. Kontrak Sah & Aplikasi Aktif' : 'Dibatalkan'}
                  </span>
                </div>
              </div>

              {/* HANDOFF ACTION CONTROLS */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-end gap-2 text-xs">
                
                {deal.status === 'CLOSED_PENDING' && (
                  <button 
                    onClick={() => handleVerifyCS(deal.id)}
                    className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-500"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1. Verifikasi CS (Validasi Onboarding)
                  </button>
                )}

                {deal.status === 'PENDING_FINANCE' && (
                  <button 
                    onClick={() => handleVerifyFinance(deal.id)}
                    className="btn-primary text-xs py-1.5 px-3 bg-blue-600 hover:bg-blue-500"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> 2. Verifikasi Finance (Kas Diterima)
                  </button>
                )}

                {deal.status === 'READY_FOR_ACTIVATION' && (
                  <button 
                    onClick={() => handleActivateTenantSuperAdmin(deal.id)}
                    className="btn-primary text-xs py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-400 font-bold text-white animate-pulse"
                  >
                    <Lock className="w-3.5 h-3.5" /> 🚀 Super Admin: Sahkan & Aktifkan Aplikasi!
                  </button>
                )}

                {deal.status === 'ACTIVE_TENANT' && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-400" /> Kontrak Sah & Komisi Sales Eligible
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
