import React from 'react';
import { systemStore } from '../lib/supabase';
import { 
  Building2, UserCheck, Shield, Settings, FileText, 
  Sparkles, ShieldCheck, Activity, Trash2, Sun, Moon
} from 'lucide-react';

import type { UserRole, Employee } from '../types/database';

interface NavigationProps {
  currentEmployee: Employee;
  onEmployeeChange: (id: string) => void;
  onRoleChange: (role: UserRole) => void;
  onOpenConfig: () => void;
  onOpenAudit: () => void;
  onOpenSecurityTest: () => void;
  onDataCleared: () => void;
  activeTab: 'sales' | 'owner' | 'cs' | 'super_admin';
  onTabChange: (tab: 'sales' | 'owner' | 'cs' | 'super_admin') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  employees: Employee[];
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentEmployee,
  onEmployeeChange,
  onRoleChange,
  onOpenConfig,
  onOpenAudit,
  onOpenSecurityTest,
  onDataCleared,
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  employees,
  isDemoMode,
  onToggleDemoMode
}) => {
  const handleClearData = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan seluruh data untuk pengujian manual dari nol?')) {
      systemStore.clearAllData();
      onDataCleared();
      alert('Seluruh data berhasil dikosongkan! Anda dapat menginput data dummy baru secara manual.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-gray-100 to-indigo-400 bg-clip-text text-transparent">
                MINARA BOS
              </h1>
              <span className="badge-purple text-xs px-2 py-0.5 rounded-full font-mono">
                Sales & CS BOS v2.0
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>Business Operating System</span>
              <span>•</span>
              <span className="text-indigo-400 font-medium">Metodologi PILIN</span>
            </p>
          </div>
        </div>

        {/* Primary View Selector Tabs */}
        <div className="flex items-center gap-1 bg-gray-900/80 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => { onTabChange('sales'); if (currentEmployee.role !== 'sales') onRoleChange('sales'); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sales' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sales PWA Mobile</span>
          </button>

          <button
            onClick={() => { onTabChange('cs'); if (currentEmployee.role !== 'cs') onRoleChange('cs'); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cs' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CS BOS Suite</span>
          </button>

          <button
            onClick={() => { onTabChange('owner'); if (currentEmployee.role !== 'founder') onRoleChange('founder'); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'owner' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Founder / Owner Omset</span>
          </button>

          {(currentEmployee.role === 'founder' || currentEmployee.role === 'super_admin') && (
            <button
              onClick={() => { onTabChange('super_admin'); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === 'super_admin' 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 shadow-md' 
                  : 'bg-indigo-950/20 text-indigo-300 border-indigo-500/20 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>👑 Super Admin</span>
            </button>
          )}
        </div>

        {/* Role Switcher & System Controls */}
        <div className="flex items-center gap-2">
          {/* Active Employee Role Selector */}
          {isDemoMode && (
            <div className="relative flex items-center gap-2 bg-gray-900/90 border border-white/10 px-3 py-1.5 rounded-xl">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium">Pengguna Aktif:</span>
                <select
                  value={currentEmployee.id}
                  onChange={(e) => onEmployeeChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-2"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-gray-900 text-white">
                      {emp.name} ({emp.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            title={isDemoMode ? 'Matikan Mode Demo (Tampilan Produksi Bersih)' : 'Aktifkan Mode Demo (Alat Pengujian)'}
            className={`p-2.5 rounded-xl border text-xs transition-all flex items-center gap-1.5 font-bold ${
              isDemoMode
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900'
                : 'bg-gray-900 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <span>{isDemoMode ? '🛠️ Mode Demo: ON' : '💼 Mode Pro: ON'}</span>
          </button>

          {/* Clear All Data Button for Manual Testing */}
          {isDemoMode && (
            <button
              onClick={handleClearData}
              title="Kosongkan Semua Data untuk Pengujian Manual"
              className="p-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Kosongkan Data</span>
            </button>
          )}

          {/* Security Test Suite Button */}
          {isDemoMode && (
            <button
              onClick={onOpenSecurityTest}
              title="Role-Based Security & Handoff Test Suite"
              className="p-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Test RLS</span>
            </button>
          )}

          {/* Theme Switcher Button (Latar Belakang Putih vs Dark Mode) */}
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Ganti ke Dark Mode' : 'Ganti ke Latar Belakang Putih (Light Mode)'}
            className={`p-2.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 ${
              theme === 'light'
                ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                : 'bg-indigo-950/80 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900'
            }`}
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline text-[11px]">⚪ Latar Belakang Putih</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline text-[11px]">🌙 Dark Mode</span>
              </>
            )}
          </button>

          {/* System Settings Button */}
          {isDemoMode && (
            <button
              onClick={onOpenConfig}
              title="System Configurations (No Hard-coded Rules)"
              className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-white/10 text-gray-300 hover:text-emerald-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Audit Log Button */}
          <button
            onClick={onOpenAudit}
            title="Audit Trail Logs"
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-white/10 text-gray-300 hover:text-cyan-400 transition-colors"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
