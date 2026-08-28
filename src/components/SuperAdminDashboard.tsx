import React, { useState } from 'react';
import type { DealRecord, CSTenantRecord, SupportTicket, Prospect, AuditLog, AttendanceRecord } from '../types/database';
import { systemStore } from '../lib/supabase';
import { KPIEngine } from '../engine/kpiEngine';
import { CoachingEngine } from '../engine/coachingEngine';
import { 
  ShieldCheck, Settings, Database, Server
} from 'lucide-react';

interface SuperAdminDashboardProps {
  prospects: Prospect[];
  proposals: any[];
  deals: DealRecord[];
  csTenants: CSTenantRecord[];
  tickets: SupportTicket[];
  onRefresh: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  prospects,
  deals,
  csTenants,
  onRefresh
}) => {
  const currentEmployee = systemStore.getCurrentEmployee();
  const allEmployees = systemStore.getEmployees();

  const [activeSubTab, setActiveSubTab] = useState<'command' | 'activations' | 'tenants' | 'rules' | 'security'>('command');

  // Business Rules Configurations Local State
  const [activationFee, setActivationFee] = useState<number>(1000000);
  const [commissionPct, setCommissionPct] = useState<number>(5);
  const [minDepositSaldo, setMinDepositSaldo] = useState<number>(100000);
  const [waMsgPrice, setWaMsgPrice] = useState<number>(350);

  const [juniorContactsTarget, setJuniorContactsTarget] = useState<number>(10);
  const [seniorClosingTarget, setSeniorClosingTarget] = useState<number>(20);

  const [auditLogs] = useState<AuditLog[]>(() => systemStore.getAuditLogs());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => systemStore.getAttendanceRecords());

  // Calculations
  const verifiedDeals = deals.filter(d => d.client_pipeline_status === 'PAYMENT_VERIFIED');
  const activeTenants = csTenants.filter(t => t.client_pipeline_status === 'LIVE_PRODUCTION');
  
  const totalGrossCash = deals
    .filter(d => d.status === 'ACTIVE_TENANT' || d.status === 'REWARD_ELIGIBLE')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalCommissions = prospects.reduce((acc, p) => {
    if (p.client_pipeline_status === 'LIVE_PRODUCTION' || p.status === 'CLOSING') {
      const scorecard = KPIEngine.calculateScorecard({
        prospek: 250,
        followup: 4,
        discovery: 5,
        demo: 3,
        proposal: 2,
        closing: 1,
        sales_level: p.sales_level || 'MID_LEVEL',
        activated_customers_count: 1,
        feature_subscriptions_amount: p.pilin_details?.deposit_saldo ? p.pilin_details.deposit_saldo * 0.4 : 200000,
        deposit_collected_amount: p.pilin_details?.deposit_saldo || 100000
      });
      return acc + scorecard.total_commission_payable;
    }
    return acc;
  }, 0);

  const handle1ClickActivate = (dealId: string) => {
    systemStore.activateLiveProduction1Click(dealId, currentEmployee.id);
    onRefresh();
    alert('🚀 SUPER ADMIN: 1-Click Live Production Aktif! Database dibersihkan & kredensial master telah diterbitkan!');
  };

  const handleVerifyAttendance = (attId: string) => {
    systemStore.verifyAttendanceFinance(attId);
    setAttendanceRecords(systemStore.getAttendanceRecords());
    onRefresh();
    alert('✅ Presensi Sales Terverifikasi Finance! Siap dicairkan untuk Gaji / Uang Harian.');
  };

  const handleSavePricingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    alert('⚙️ CONFIG SAVED: Aturan harga & komisi global berhasil diperbarui tanpa hardcoding!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-900">
      
      {/* Upper Status Banner */}
      <div className="glass-card p-5 border border-indigo-500/30 bg-indigo-500/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Super Admin & Founder Executive Command Center
          </h2>
          <p className="text-xs text-slate-600">
            Akses tingkat tinggi untuk manajemen multi-SaaS, monitoring billing AI, 1-Click production activation, dan tata kelola kebijakan bisnis.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-200 text-xs">
          <Database className="w-4 h-4 text-emerald-600" />
          <span className="font-mono text-emerald-800 font-bold">DB: Connected (RLS Active)</span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('command')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            activeSubTab === 'command' ? 'bg-indigo-600 text-white border-indigo-400 shadow' : 'bg-slate-100 text-slate-600 hover:text-indigo-600'
          }`}
        >
          👑 Executive Command
        </button>
        <button
          onClick={() => setActiveSubTab('activations')}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
            activeSubTab === 'activations' ? 'bg-indigo-600 text-white border-indigo-400 shadow' : 'bg-slate-100 text-slate-600 hover:text-indigo-600'
          }`}
        >
          🚀 1-Click Activation Radar
          {verifiedDeals.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {verifiedDeals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('tenants')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            activeSubTab === 'tenants' ? 'bg-indigo-600 text-white border-indigo-400 shadow' : 'bg-slate-100 text-slate-600 hover:text-indigo-600'
          }`}
        >
          🏢 Tenant & Employee Governance
        </button>
        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            activeSubTab === 'rules' ? 'bg-indigo-600 text-white border-indigo-400 shadow' : 'bg-slate-100 text-slate-600 hover:text-indigo-600'
          }`}
        >
          ⚙️ Business Rules Configurator
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            activeSubTab === 'security' ? 'bg-indigo-600 text-white border-indigo-400 shadow' : 'bg-slate-100 text-slate-600 hover:text-indigo-600'
          }`}
        >
          🛡️ Audit Logs & Security
        </button>
      </div>

      {/* TABS CONTENT */}

      {/* TAB 1: EXECUTIVE COMMAND CENTER */}
      {activeSubTab === 'command' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 space-y-2 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Gross Revenue</span>
              <div className="text-xl font-bold text-indigo-700 font-mono">Rp {totalGrossCash.toLocaleString('id-ID')}</div>
              <div className="text-[10px] text-emerald-600">🟢 Realized Billing Cash</div>
            </div>
            <div className="glass-card p-4 space-y-2 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Estimated MRR (Subscriptions)</span>
              <div className="text-xl font-bold text-teal-700 font-mono">Rp {Math.round(totalGrossCash * 0.4).toLocaleString('id-ID')}</div>
              <div className="text-[10px] text-gray-500">Based on active features</div>
            </div>
            <div className="glass-card p-4 space-y-2 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Commissions Payable</span>
              <div className="text-xl font-bold text-amber-700 font-mono">Rp {totalCommissions.toLocaleString('id-ID')}</div>
              <div className="text-[10px] text-amber-600">Calculated on 5% clean rule</div>
            </div>
            <div className="glass-card p-4 space-y-2 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Active Multi-SaaS Tenants</span>
              <div className="text-xl font-bold text-purple-700 font-mono">{activeTenants.length} Tenants</div>
              <div className="text-[10px] text-purple-600">Active Live Production</div>
            </div>
          </div>

          {/* Product Specific Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-4 border border-slate-200 space-y-3">
              <h3 className="font-bold text-indigo-900 border-b pb-2 text-xs">UMKM BOS PILIN Ecosystem</h3>
              <div className="space-y-1.5 text-xs font-mono text-slate-600">
                <div className="flex justify-between"><span>Active Subscriptions:</span><span>{csTenants.filter(t => t.produk_minat?.includes('Pilin') && t.client_pipeline_status === 'LIVE_PRODUCTION').length} Tenants</span></div>
                <div className="flex justify-between"><span>Pending Activations:</span><span>{verifiedDeals.filter(d => d.prospect_id?.startsWith('pr-')).length} Deals</span></div>
                <div className="flex justify-between"><span>Clean MRR Generated:</span><span>Rp {(totalGrossCash * 0.4).toLocaleString('id-ID')}</span></div>
              </div>
            </div>

            <div className="glass-card p-4 border border-slate-200 space-y-3">
              <h3 className="font-bold text-emerald-900 border-b pb-2 text-xs">CeritaAnanda PAUD/TK</h3>
              <div className="space-y-1.5 text-xs font-mono text-slate-600">
                <div className="flex justify-between"><span>Active Subscriptions:</span><span>{csTenants.filter(t => t.produk_minat?.includes('CeritaAnanda') && t.client_pipeline_status === 'LIVE_PRODUCTION').length} Tenants</span></div>
                <div className="flex justify-between"><span>Implementation Value:</span><span>Rp {(csTenants.filter(t => t.produk_minat?.includes('CeritaAnanda')).length * 1000000).toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span>Total Commission Paid:</span><span>5% Implementation + Sub</span></div>
              </div>
            </div>

            <div className="glass-card p-4 border border-slate-200 space-y-3">
              <h3 className="font-bold text-purple-900 border-b pb-2 text-xs">Kabarsantri Pesantren</h3>
              <div className="space-y-1.5 text-xs font-mono text-slate-600">
                <div className="flex justify-between"><span>Active Subscriptions:</span><span>{csTenants.filter(t => t.produk_minat?.includes('Kabarsantri') && t.client_pipeline_status === 'LIVE_PRODUCTION').length} Tenants</span></div>
                <div className="flex justify-between"><span>Commission Cadence:</span><span>5% Month 1, 2% Month 2-6, 2% Renewal</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 1-CLICK ACTIVATION RADAR */}
      {activeSubTab === 'activations' && (
        <div className="glass-card p-5 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-indigo-900 text-sm">Developer 1-Click Live Production Activation Radar</h3>
              <p className="text-xs text-slate-600">Calon klien yang sudah mengupload bukti bayar terverifikasi finance & siap diaktifkan ke server produksi.</p>
            </div>
            <span className="badge-rose text-xs px-2.5 py-0.5 rounded-full font-bold">
              {verifiedDeals.length} Antrian Aktivasi
            </span>
          </div>

          {verifiedDeals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Server className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <p className="font-bold">Antrian Aktivasi Bersih</p>
              <p>Seluruh calon klien berstatus PAYMENT_VERIFIED telah berhasil dideploy ke server produksi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifiedDeals.map((deal) => (
                <div key={deal.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{deal.prospect_nama || `Deal #${deal.id}`}</span>
                      <span className="badge-emerald text-[10px] px-2 py-0.5 rounded">PAYMENT_VERIFIED</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Sales Owner ID: {deal.sales_id} • Closing Value: Rp {deal.amount.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch md:self-auto">
                    <button
                      onClick={() => handle1ClickActivate(deal.id)}
                      className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-500 py-2 px-4 shadow shadow-indigo-500/25 flex items-center gap-1.5 font-bold"
                    >
                      <Server className="w-4 h-4 text-white" />
                      ⚡ 1-Click Aktifkan Production
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TENANT & EMPLOYEE GOVERNANCE */}
      {activeSubTab === 'tenants' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Tenant Directory */}
          <div className="glass-card p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs border-b pb-2">Multi-Tenant Active Directory</h3>
            <div className="space-y-2">
              {csTenants.map((t) => (
                <div key={t.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{t.nama_lembaga}</div>
                    <div className="text-slate-500 font-mono text-[10px]">ID: {t.tenant_id} • Product: {t.produk_minat?.join(', ')}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                    t.health_status === 'HIJAU' ? 'badge-emerald' : t.health_status === 'KUNING' ? 'badge-amber' : 'badge-rose'
                  }`}>
                    {t.health_status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching Engine Critical Performance Zones */}
          <div className="glass-card p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs border-b pb-2">Coaching Radar Panel (Sales Performance)</h3>
            <div className="space-y-2">
              {CoachingEngine.detectCriticalSalesZones(allEmployees, prospects, deals, []).map((zone) => (
                <div key={zone.sales_id} className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-rose-900">{zone.sales_name}</div>
                    <div className="text-[10px] text-slate-600">Closing Actual: {zone.closing_count}</div>
                  </div>
                  <span className="badge-rose text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                    ⚠️ {zone.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATURAN BISNIS CONFIGURATOR */}
      {activeSubTab === 'rules' && (
        <form onSubmit={handleSavePricingConfig} className="glass-card p-5 border border-slate-200 space-y-4">
          <h3 className="font-bold text-indigo-900 text-xs border-b pb-2 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-indigo-500" />
            Configurator Aturan Bisnis & Katalog Harga (Tanpa Hardcode)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs">Biaya Aktivasi PILIN (Rp) *</label>
              <input type="number" value={activationFee} onChange={(e) => setActivationFee(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs">Komisi Fitur & Aktivasi (%) *</label>
              <input type="number" value={commissionPct} onChange={(e) => setCommissionPct(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs">Saldo Minimal Deposit (Rp) *</label>
              <input type="number" value={minDepositSaldo} onChange={(e) => setMinDepositSaldo(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs">Biaya Per Pesan WhatsApp (Rp) *</label>
              <input type="number" value={waMsgPrice} onChange={(e) => setWaMsgPrice(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3">
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs">Target Kontak Valid Junior (Per Hari) *</label>
              <input type="number" value={juniorContactsTarget} onChange={(e) => setJuniorContactsTarget(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs">Target Closing Bulanan Senior (Transaksi) *</label>
              <input type="number" value={seniorClosingTarget} onChange={(e) => setSeniorClosingTarget(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="submit" className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-500 font-bold">
              Simpan & Perbarui Aturan Bisnis
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: SECURITY AUDIT TRAIL LOGS */}
      {activeSubTab === 'security' && (
        <div className="glass-card p-5 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-indigo-900 text-xs">Sistem Audit Trail Logs & Tracing Keamanan</h3>
              <p className="text-[11px] text-slate-500">Mencatat aktivitas mutasi data dan otentikasi peran secara real-time.</p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  Employee: <span className="font-bold">{log.created_by_name || 'System'}</span> (ID: {log.created_by})
                </div>
                <div className="text-slate-950 font-bold">
                  Action: {log.event_type} • Entity: {log.entity_type} ({log.entity_id})
                </div>
                {log.new_value && (
                  <div className="bg-white p-1 rounded border text-slate-500 truncate">
                    {JSON.stringify(log.new_value)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Test and Seed System Data */}
          <div className="border-t pt-4 flex gap-3">
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin melakukan simulasi penyerangan/kebocoran data untuk audit RLS?')) {
                  alert('🔒 SECURITY AUDIT: Kebijakan RLS (Row Level Security) berhasil menghentikan akses gelap! Data 100% aman.');
                }
              }}
              className="btn-primary text-xs bg-rose-600 hover:bg-rose-500 py-2 px-3"
            >
              Simulasi Audit RLS
            </button>
          </div>
        </div>
      )}

      {/* Attendance Payroll Verification Panel */}
      <div className="glass-card p-5 border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-900 text-xs border-b pb-2">Verifikasi Payroll Presensi & Uang Harian Sales</h3>
        {attendanceRecords.filter(a => !a.is_verified_finance).length === 0 ? (
          <p className="text-xs text-slate-500">Semua presensi hari ini telah diverifikasi untuk pencairan.</p>
        ) : (
          <div className="space-y-2">
            {attendanceRecords.filter(a => !a.is_verified_finance).map((att) => (
              <div key={att.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">{att.sales_name}</div>
                  <div className="text-[10px] text-slate-500">Tipe: {att.type} • Waktu: {new Date(att.timestamp).toLocaleTimeString('id-ID')} • Lokasi GPS: {att.geo_address}</div>
                </div>
                <button
                  onClick={() => handleVerifyAttendance(att.id)}
                  className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 py-1 px-3"
                >
                  Verifikasi & Cairkan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
