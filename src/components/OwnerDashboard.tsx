import React, { useState } from 'react';
import type { DealRecord, CSTenantRecord, SupportTicket, AttendanceRecord, Prospect, ProposalRecord } from '../types/database';
import { systemStore } from '../lib/supabase';
import { CoachingEngine } from '../engine/coachingEngine';
import type { SalesCriticalZoneRecord } from '../engine/coachingEngine';
import { 
  DollarSign, ShieldAlert, CheckCircle2, 
  Clock, AlertTriangle, Layers, UserCheck, Lock, Award, Heart, HelpCircle, CheckSquare,
  MessageSquare, Calendar, Radio, ShieldCheck, UserPlus, Users
} from 'lucide-react';

interface OwnerDashboardProps {
  prospects: Prospect[];
  proposals: ProposalRecord[];
  deals: DealRecord[];
  csTenants: CSTenantRecord[];
  tickets: SupportTicket[];
  onRefresh: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  prospects,
  proposals,
  deals,
  csTenants,
  tickets,
  onRefresh
}) => {
  const currentEmployee = systemStore.getCurrentEmployee();
  const allEmployees = systemStore.getEmployees();
  const isSuperAdmin = currentEmployee.role === 'founder' || currentEmployee.role === 'super_admin';

  // Attendance Records for Finance Payroll Verification
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    systemStore.getAttendanceRecords()
  );

  // Critical Sales Performance Zone Detection (SIAPA & KAPAN Perlu Coaching)
  const criticalSalesZones: SalesCriticalZoneRecord[] = CoachingEngine.detectCriticalSalesZones(
    allEmployees,
    prospects,
    deals,
    proposals
  );

  const [coachingStatusMap, setCoachingStatusMap] = useState<Record<string, 'NEEDS_COACHING' | 'COACHING_IN_PROGRESS' | 'RESOLVED'>>({});

  const [activeSubTab, setActiveSubTab] = useState<'performance' | 'employees'>('performance');

  // Employee Form State
  const [employees, setEmployees] = useState(() => systemStore.getEmployees());
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // Form inputs
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState<any>('sales');
  const [empPhone, setEmpPhone] = useState('');
  const [empAlamat, setEmpAlamat] = useState('');
  const [empSignedDate, setEmpSignedDate] = useState('');
  const [empResignedDate, setEmpResignedDate] = useState('');
  const [empStatus, setEmpStatus] = useState<'AKTIF' | 'RESIGNED'>('AKTIF');
  const [empSpouseName, setEmpSpouseName] = useState('');
  const [empSpousePhone, setEmpSpousePhone] = useState('');
  const [empDependents, setEmpDependents] = useState<number>(0);
  const [empChildAges, setEmpChildAges] = useState<number[]>([]);

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmpName('');
    setEmpEmail('');
    setEmpRole('sales');
    setEmpPhone('');
    setEmpAlamat('');
    setEmpSignedDate('');
    setEmpResignedDate('');
    setEmpStatus('AKTIF');
    setEmpSpouseName('');
    setEmpSpousePhone('');
    setEmpDependents(0);
    setEmpChildAges([]);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: any) => {
    setEditingEmployee(emp);
    setEmpName(emp.name || '');
    setEmpEmail(emp.email || '');
    setEmpRole(emp.role || 'sales');
    setEmpPhone(emp.phone || '');
    setEmpAlamat(emp.alamat || '');
    setEmpSignedDate(emp.signed_contract_date || '');
    setEmpResignedDate(emp.resigned_date || '');
    setEmpStatus(emp.status || 'AKTIF');
    setEmpSpouseName(emp.nama_pasangan || '');
    setEmpSpousePhone(emp.no_telp_pasangan || '');
    setEmpDependents(emp.jumlah_tanggungan || 0);
    setEmpChildAges(emp.usia_anak || []);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      systemStore.updateEmployee(editingEmployee.id, {
        name: empName,
        email: empEmail,
        role: empRole,
        phone: empPhone,
        alamat: empAlamat,
        signed_contract_date: empSignedDate,
        resigned_date: empStatus === 'RESIGNED' ? empResignedDate : undefined,
        status: empStatus,
        nama_pasangan: empSpouseName,
        no_telp_pasangan: empSpousePhone,
        jumlah_tanggungan: Number(empDependents),
        usia_anak: empChildAges
      });
    } else {
      systemStore.addEmployee({
        tenant_id: 'tenant-minara-01',
        name: empName,
        email: empEmail,
        role: empRole,
        phone: empPhone,
        alamat: empAlamat,
        signed_contract_date: empSignedDate,
        resigned_date: empStatus === 'RESIGNED' ? empResignedDate : undefined,
        status: empStatus,
        nama_pasangan: empSpouseName,
        no_telp_pasangan: empSpousePhone,
        jumlah_tanggungan: Number(empDependents),
        usia_anak: empChildAges
      });
    }
    setEmployees(systemStore.getEmployees());
    setIsEmployeeModalOpen(false);
    onRefresh();
    alert('🎉 Data Pegawai & Keluarga berhasil disimpan!');
  };

  const handleAddChildAgeInput = () => {
    setEmpChildAges(prev => [...prev, 0]);
  };

  const handleChildAgeChange = (index: number, val: number) => {
    setEmpChildAges(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveChildAgeInput = (index: number) => {
    setEmpChildAges(prev => prev.filter((_, i) => i !== index));
  };

  const pendingCSCount = deals.filter(d => d.status === 'CLOSED_PENDING').length;
  const pendingCSAmount = deals.filter(d => d.status === 'CLOSED_PENDING').reduce((acc, d) => acc + d.amount, 0);

  const pendingFinanceCount = deals.filter(d => d.status === 'PENDING_FINANCE').length;
  const pendingFinanceAmount = deals.filter(d => d.status === 'PENDING_FINANCE').reduce((acc, d) => acc + d.amount, 0);

  const activeCount = deals.filter(d => d.status === 'ACTIVE_TENANT' || d.status === 'REWARD_ELIGIBLE').length;
  const activeAmount = deals.filter(d => d.status === 'ACTIVE_TENANT' || d.status === 'REWARD_ELIGIBLE').reduce((acc, d) => acc + d.amount, 0);

  const cancelledCount = deals.filter(d => d.status === 'CANCELLED').length;
  const cancelledAmount = deals.filter(d => d.status === 'CANCELLED').reduce((acc, d) => acc + d.amount, 0);

  const totalOmsetTarget = 500000000; // Tetap pada target awal (Rp 500 Juta)
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
    systemStore.verifyPaymentProof(dealId);
    onRefresh();
    alert('💳 KEUANGAN / CS: Bukti Pembayaran Terverifikasi! Status berubah menjadi PAYMENT_VERIFIED.');
  };

  const handleActivateTenantSuperAdmin = (dealId: string) => {
    if (!isSuperAdmin) {
      alert('⛔ HANYA Founder / Super Admin yang berhak menyetujui Aktivasi Tenant Sah!');
      return;
    }
    systemStore.activateLiveProduction1Click(dealId, currentEmployee.id);
    onRefresh();
    alert('🚀 SUPER ADMIN / DEVELOPER: 1-Click Live Production Aktif! Database produksi bersih & Kredensial telah diterbitkan!');
  };

  const handleVerifyAttendanceFinance = (attId: string) => {
    systemStore.verifyAttendanceFinance(attId);
    setAttendanceRecords(systemStore.getAttendanceRecords());
    onRefresh();
    alert('✅ Presensi Sales Terverifikasi Finance! Siap dicairkan untuk Gaji / Uang Harian.');
  };

  const handleUpdateCoachingState = (salesId: string, nextStatus: 'COACHING_IN_PROGRESS' | 'RESOLVED') => {
    setCoachingStatusMap(prev => ({ ...prev, [salesId]: nextStatus }));
    alert(`🤝 Status Coaching Sales berhasil diperbarui menjadi: ${nextStatus.replace('_', ' ')}`);
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
            Dashboard eksekutif untuk memantau kinerja operasional, status onboarding, dan realisasi omset.
          </p>
        </div>

        <div className="bg-gray-900 px-4 py-2 rounded-xl border border-white/10 text-right">
          <span className="text-[10px] text-gray-400 block font-medium">Peran Aktif Pengguna:</span>
          <strong className="text-emerald-400 text-sm">{currentEmployee.name} ({currentEmployee.role.toUpperCase()})</strong>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('performance')}
          className={`px-4 py-2 rounded-xl transition-all border ${
            activeSubTab === 'performance'
              ? 'bg-amber-500 border-amber-400 text-white shadow font-bold'
              : 'bg-gray-900 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          📊 Ringkasan Kinerja & Omset
        </button>
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`px-4 py-2 rounded-xl transition-all border ${
            activeSubTab === 'employees'
              ? 'bg-amber-500 border-amber-400 text-white shadow font-bold'
              : 'bg-gray-900 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          👥 Tata Kelola Pegawai & HR
        </button>
      </div>

      {activeSubTab === 'performance' && (
        <>

      {/* ⚠️ RADAR SALES ZONA KRITIS KINERJA & INTERAKSI COACHING OWNER (PETA SIAPA & KAPAN) */}
      <div className="glass-card p-5 border-2 border-rose-500/40 bg-rose-500/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Radar Sales Zona Kritis Kinerja (Deteksi Kapan & Siapa Perlu Coaching)</span>
                <span className="badge-rose text-[10px] px-2 py-0.5 font-bold">Real-time Radar</span>
              </h3>
              <p className="text-xs text-rose-200">
                Deteksi otomatis sales yang capaian kinerjanya di bawah 70% (Grade D / Zona Kritis) untuk pembinaan langsung oleh Owner/Manager.
              </p>
            </div>
          </div>

          <span className="badge-rose text-xs px-3 py-1 font-mono font-bold">
            {criticalSalesZones.length} Sales Kritis
          </span>
        </div>

        {criticalSalesZones.length === 0 ? (
          <div className="bg-gray-900/80 p-4 rounded-xl border border-emerald-500/30 text-center text-xs text-emerald-300 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="font-bold text-white">🎉 Luar Biasa! Semua Sales Berada di Atas Baseline Kinerja (&gt;70%)</p>
            <p className="text-gray-400">Tidak ada sales yang terdeteksi di Zona Kritis saat ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalSalesZones.map((record) => {
              const currentStatus = coachingStatusMap[record.sales_id] || record.status;
              return (
                <div key={record.id} className="bg-gray-900/90 p-4 rounded-xl border border-rose-500/30 space-y-3 text-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* SIAPA (Nama & Avatar Sales) */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={record.sales_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                        alt={record.sales_name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-rose-500/50"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold text-sm">{record.sales_name}</strong>
                          <span className="badge-rose text-[10px] px-2 py-0.5 font-bold font-mono">
                            ZONA KRITIS ({record.achievement_pct}% - Grade {record.grade})
                          </span>
                        </div>
                        
                        {/* KAPAN (Timestamp Terdeteksi System) */}
                        <p className="text-gray-400 text-[11px] flex items-center gap-2 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Terdeteksi Kritis pada: <strong className="text-amber-300">{new Date(record.detected_at).toLocaleString('id-ID')}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Capaian Data Ringkas */}
                    <div className="flex items-center gap-3 bg-gray-950 p-2.5 rounded-xl border border-white/10 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Prospek</span>
                        <strong className="text-white">{record.prospek_count}/250</strong>
                      </div>
                      <div className="border-l border-white/10 pl-3">
                        <span className="text-[10px] text-gray-400 block">Closing</span>
                        <strong className="text-amber-400">{record.closing_count}/10</strong>
                      </div>
                    </div>

                  </div>

                  {/* ALASAN & REKOMENDASI ACTION COACHING */}
                  <div className="bg-rose-950/40 p-3 rounded-lg border border-rose-500/20 space-y-1.5 text-[11px]">
                    <div className="text-rose-300 font-medium">
                      ⚠️ <strong>Alasan Evaluasi:</strong> {record.reason}
                    </div>
                    <div className="text-emerald-300 font-bold flex items-center gap-1.5 pt-1 border-t border-rose-500/20">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>💡 Rekomendasi Coaching Owner: {record.recommendation}</span>
                    </div>
                  </div>

                  {/* AKSI INTERAKSI OWNER/MANAGER */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[10px] text-gray-400 font-mono">
                      Status Pembinaan: <strong className="text-amber-400">{currentStatus}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {currentStatus === 'NEEDS_COACHING' && (
                        <button
                          onClick={() => handleUpdateCoachingState(record.sales_id, 'COACHING_IN_PROGRESS')}
                          className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-500 flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" /> 🤝 Ajak & Mulai Sesi Coaching
                        </button>
                      )}

                      {currentStatus === 'COACHING_IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateCoachingState(record.sales_id, 'RESOLVED')}
                          className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> ✅ Tandai Coaching Selesai
                        </button>
                      )}

                      {currentStatus === 'RESOLVED' && (
                        <span className="badge-emerald text-xs px-3 py-1 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Coaching Selesai & Dalam Pengawasan
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
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

      {/* PRESENSI SALES & VERIFIKASI KEUANGAN */}
      <div className="glass-card p-5 border border-indigo-500/30 bg-indigo-500/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Laporan Kehadiran Kunjungan Lapangan Tim Sales</h3>
              <p className="text-xs text-gray-400">Daftar verifikasi presensi harian untuk tim sales rep.</p>
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

      {/* RADAR SUPER ADMIN / DEVELOPER: CLIENT PIPELINE ACTIVATION */}
      <div className="glass-card p-5 border border-indigo-500/30 bg-indigo-500/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Daftar Pengajuan Aktivasi Layanan</span>
                <span className="badge-purple text-[10px] px-2 py-0.5 font-mono">Activation Gateway</span>
              </h3>
              <p className="text-xs text-gray-400">
                Calon klien PILIN yang siap diaktifkan ke live production.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-900/80 px-3 py-1 rounded-lg border border-indigo-500/30">
            {prospects.length} Form Aktivasi Client
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {prospects.map((p) => {
            const relatedDeal = deals.find(d => d.prospect_id === p.id);
            const status: 'DEMO_TRIAL' | 'PAYMENT_VERIFIED' | 'LIVE_PRODUCTION' = 
              relatedDeal?.client_pipeline_status || p.client_pipeline_status || 'DEMO_TRIAL';

            return (
              <div key={p.id} className="bg-gray-900/90 p-3.5 rounded-xl border border-white/10 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white">{p.nama_lembaga}</h4>
                    <p className="text-[11px] text-gray-400">PIC: {p.pic} • {p.no_hp}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    status === 'LIVE_PRODUCTION' ? 'badge-emerald' :
                    status === 'PAYMENT_VERIFIED' ? 'badge-blue' : 'badge-amber'
                  }`}>
                    {status === 'LIVE_PRODUCTION' ? '🟢 LIVE_PRODUCTION' :
                     status === 'PAYMENT_VERIFIED' ? '💳 PAYMENT_VERIFIED' : '🔵 DEMO_TRIAL'}
                  </span>
                </div>

                <div className="bg-gray-950 p-2 rounded-lg border border-white/5 space-y-1 text-[10px] font-mono">
                  <div className="text-indigo-300 flex items-center justify-between">
                    <span>Paket: <strong className="text-amber-300">{p.package_type || 'PRO'}</strong></span>
                    <span>Sales: {p.sales_owner_name}</span>
                  </div>
                  <div className="text-gray-400 truncate">Email: {p.email || 'N/A'}</div>
                  <div className="text-emerald-400 font-bold pt-0.5 flex justify-between items-center">
                    <span>Demo Link:</span>
                    <a href={p.demo_url || `https://demo.minara.id/trial?id=${p.id}`} target="_blank" rel="noopener noreferrer" className="text-amber-300 underline hover:text-white">
                      Buka Demo ↗
                    </a>
                  </div>
                </div>

                {/* DEVELOPER / SUPER ADMIN 1-CLICK ACTION */}
                <div className="pt-1 flex items-center justify-end">
                  {status === 'LIVE_PRODUCTION' ? (
                    <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Production Active & Clean DB
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        let dealId = relatedDeal?.id;
                        if (!dealId) {
                          const newDeal = systemStore.createDeal(p.id, p.nilai_peluang || 35000000, p.sales_owner_id, p.sales_owner_name || 'Sales');
                          dealId = newDeal.id;
                        }
                        systemStore.activateLiveProduction1Click(dealId, currentEmployee.id);
                        onRefresh();
                        alert(`🚀 DEVELOPER / SUPER ADMIN: Live Production untuk ${p.nama_lembaga} BERHASIL DIAKTIFKAN! Kredensial terbit & Database bersih siap pakai.`);
                      }}
                      className="w-full btn-primary text-[11px] py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-extrabold text-white justify-center shadow-lg"
                    >
                      ⚡ 1-Click AKTIFKAN LIVE PRODUCTION
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MULTI-DIVISION VERIFICATION HANDOFF GATEWAY */}
      <div className="glass-card p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Status Handoff Kontrak Layanan Klien</h3>
              <p className="text-xs text-gray-400 font-medium">Alur persetujuan administrasi dan verifikasi keuangan berjenjang.</p>
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

              {/* CLIENT PIPELINE TRANSITION STATUS & CREDENTIALS BADGE */}
              {deal.production_credentials && (
                <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/40 text-emerald-200 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span>🚀 KREDENSIAL LIVE PRODUCTION AKTIF (Super Admin Approved)</span>
                    <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">STATUS: LIVE_PRODUCTION</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div>Kode Tenant: <strong className="text-white">{deal.production_credentials.tenant_code}</strong></div>
                    <div>Email Master: <strong className="text-white">{deal.production_credentials.master_email}</strong></div>
                    <div>Password Temp: <strong className="text-amber-300">{deal.production_credentials.temporary_pass}</strong></div>
                  </div>
                </div>
              )}

              {/* HANDOFF ACTION CONTROLS */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-end gap-2 text-xs">
                
                {deal.status === 'CLOSED_PENDING' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleVerifyCS(deal.id)}
                      className="btn-primary text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-500"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1. Verifikasi CS (Validasi Onboarding)
                    </button>
                    <button 
                      onClick={() => handleVerifyFinance(deal.id)}
                      className="btn-secondary text-xs py-1.5 px-3 bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600/30 font-bold"
                    >
                      💳 Verifikasi Bukti Bayar (PAYMENT_VERIFIED)
                    </button>
                  </div>
                )}

                {deal.status === 'PENDING_FINANCE' && (
                  <button 
                    onClick={() => handleVerifyFinance(deal.id)}
                    className="btn-primary text-xs py-1.5 px-3 bg-blue-600 hover:bg-blue-500"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> 2. Verifikasi Pembayaran (PAYMENT_VERIFIED)
                  </button>
                )}

                {(deal.status === 'READY_FOR_ACTIVATION' || deal.client_pipeline_status === 'PAYMENT_VERIFIED') && deal.client_pipeline_status !== 'LIVE_PRODUCTION' && (
                  <button 
                    onClick={() => handleActivateTenantSuperAdmin(deal.id)}
                    className="btn-primary text-xs py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-400 font-extrabold text-white animate-pulse shadow-lg"
                  >
                    <Lock className="w-3.5 h-3.5" /> 🟢 1-CLICK AKTIFKAN LIVE PRODUCTION
                  </button>
                )}

                {deal.client_pipeline_status === 'LIVE_PRODUCTION' && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-400" /> Live Production Active & Komisi Sales Eligible
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Close activeSubTab === 'performance' wrapper */}
      </>
      )}

      {/* TAB 2: DATA PEGAWAI & HR */}
      {activeSubTab === 'employees' && (
        <div className="space-y-6">
          {/* Employee Directory Section */}
          <div className="glass-card p-5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Direktori & Data Pegawai (HR Database)
                </h3>
                <p className="text-xs text-gray-400">Kelola informasi pribadi, kontrak, jabatan, dan tanggungan keluarga karyawan.</p>
              </div>
              <button
                onClick={handleOpenAddEmployee}
                className="btn-primary text-xs py-2 px-4 bg-amber-500 hover:bg-amber-400 font-bold flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-white" />
                Tambah Pegawai Baru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 font-bold">
                    <th className="py-2.5 px-3">Nama & Kontak</th>
                    <th className="py-2.5 px-3">Jabatan</th>
                    <th className="py-2.5 px-3">Kontrak</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Pasangan & Telepon</th>
                    <th className="py-2.5 px-3 text-center">Anak (Usia)</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{emp.name}</div>
                        <div className="text-[10px] text-gray-400">{emp.email} • {emp.phone || '-'}</div>
                        {emp.alamat && <div className="text-[10px] text-gray-500 italic max-w-xs truncate">📍 {emp.alamat}</div>}
                      </td>
                      <td className="py-3 px-3 font-semibold uppercase font-mono tracking-wider text-amber-400">
                        {emp.role.toUpperCase()}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>Signed: {emp.signed_contract_date || '-'}</div>
                        {emp.status === 'RESIGNED' && <div className="text-rose-400">Resigned: {emp.resigned_date || '-'}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emp.status === 'RESIGNED' ? 'badge-rose' : 'badge-emerald'
                        }`}>
                          {emp.status || 'AKTIF'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {emp.nama_pasangan ? (
                          <>
                            <div className="font-bold">{emp.nama_pasangan}</div>
                            <div className="text-[10px] text-gray-400">📞 {emp.no_telp_pasangan || '-'}</div>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Belum ada data</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-white">{emp.jumlah_tanggungan || 0} Tanggungan</div>
                        {emp.usia_anak && emp.usia_anak.length > 0 ? (
                          <div className="text-[10px] text-gray-400 font-mono">
                            Usia: {emp.usia_anak.map(age => `${age}th`).join(', ')}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-500 italic">Tidak ada anak</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenEditEmployee(emp)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded border border-white/10 text-white transition-colors"
                        >
                          Ubah
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-2xl bg-[#0d1322] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/60">
              <h3 className="font-bold text-white text-sm">
                {editingEmployee ? '📝 Ubah Profil Pegawai' : '👥 Tambah Pegawai Baru'}
              </h3>
              <button 
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-4 text-xs text-slate-900">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Nama Lengkap *</label>
                  <input type="text" required value={empName} onChange={(e) => setEmpName(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Email *</label>
                  <input type="email" required value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Jabatan *</label>
                  <select value={empRole} onChange={(e) => setEmpRole(e.target.value as any)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white">
                    <option value="sales">Sales Representative</option>
                    <option value="cs">CS Agent</option>
                    <option value="finance">Finance Officer</option>
                    <option value="manager">Sales Manager</option>
                    <option value="founder">Founder / Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">No Kontak / Telepon *</label>
                  <input type="text" required value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Alamat Lengkap *</label>
                <textarea rows={2} required value={empAlamat} onChange={(e) => setEmpAlamat(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Signed Contract *</label>
                  <input type="date" required value={empSignedDate} onChange={(e) => setEmpSignedDate(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Status Kepegawaian *</label>
                  <select value={empStatus} onChange={(e) => setEmpStatus(e.target.value as any)} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white">
                    <option value="AKTIF">AKTIF</option>
                    <option value="RESIGNED">RESIGNED</option>
                  </select>
                </div>
                {empStatus === 'RESIGNED' && (
                  <div>
                    <label className="block text-rose-300 mb-1">Resigned Date *</label>
                    <input type="date" required value={empResignedDate} onChange={(e) => setEmpResignedDate(e.target.value)} className="w-full bg-gray-900 border border-rose-500/30 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                )}
              </div>

              {/* Data Pasangan & Kontak Darurat */}
              <div className="bg-gray-950/60 p-4 rounded-xl border border-white/5 space-y-3">
                <h4 className="font-bold text-amber-400">Data Keluarga & Kontak Darurat</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1">Nama Pasangan (Suami/Istri)</label>
                    <input type="text" value={empSpouseName} onChange={(e) => setEmpSpouseName(e.target.value)} placeholder="Nama pasangan" className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">No Telepon Pasangan</label>
                    <input type="text" value={empSpousePhone} onChange={(e) => setEmpSpousePhone(e.target.value)} placeholder="081xxx" className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Jumlah Tanggungan Keseluruhan</label>
                  <input type="number" value={empDependents} onChange={(e) => setEmpDependents(Number(e.target.value))} className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
              </div>

              {/* Usia Anak (Dynamic Array) */}
              <div className="bg-gray-950/60 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-amber-400">Detail Usia Anak</h4>
                  <button
                    type="button"
                    onClick={handleAddChildAgeInput}
                    className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded border border-amber-500/30 font-bold text-[10px]"
                  >
                    + Tambah Usia Anak
                  </button>
                </div>

                {empChildAges.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic">Belum ada detail data anak.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {empChildAges.map((age, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          type="number"
                          value={age}
                          min={0}
                          onChange={(e) => handleChildAgeChange(idx, Number(e.target.value))}
                          placeholder={`Anak ke-${idx + 1}`}
                          className="w-full bg-gray-900 border border-white/10 rounded-lg px-2.5 py-1 text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveChildAgeInput(idx)}
                          className="p-1 text-rose-400 hover:text-white rounded hover:bg-rose-500/20"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="btn-secondary py-2 px-4"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-4 bg-amber-500 hover:bg-amber-400 font-bold text-white"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambah Pegawai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
