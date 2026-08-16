import React, { useState } from 'react';
import { configEngine } from '../engine/configEngine';
import type { SlaAnchorEvent } from '../types/database';
import { X, Settings, Save } from 'lucide-react';

interface SystemConfigModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export const SystemConfigModal: React.FC<SystemConfigModalProps> = ({
  onClose,
  onSaved
}) => {
  const currentTargets = configEngine.getKPITargets();
  const currentSLA = configEngine.getSLAConfig();

  // Targets state
  const [dailyContact, setDailyContact] = useState(currentTargets.daily_prospect_contact);
  const [monthlyProspect, setMonthlyProspect] = useState(currentTargets.monthly_prospect);
  const [monthlyDiscovery, setMonthlyDiscovery] = useState(currentTargets.monthly_discovery);
  const [monthlyDemo, setMonthlyDemo] = useState(currentTargets.monthly_demo);
  const [monthlyProposal, setMonthlyProposal] = useState(currentTargets.monthly_proposal);
  const [monthlyClosing, setMonthlyClosing] = useState(currentTargets.monthly_closing);

  // SLA state
  const [anchorEvent, setAnchorEvent] = useState<SlaAnchorEvent>(currentSLA.anchor_event);
  const [slaHours, setSlaHours] = useState(currentSLA.sla_hours);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();

    configEngine.setKPITargets({
      daily_prospect_contact: Number(dailyContact),
      monthly_prospect: Number(monthlyProspect),
      monthly_discovery: Number(monthlyDiscovery),
      monthly_demo: Number(monthlyDemo),
      monthly_proposal: Number(monthlyProposal),
      monthly_closing: Number(monthlyClosing)
    });

    configEngine.setSLAConfig({
      anchor_event: anchorEvent,
      sla_hours: Number(slaHours)
    });

    onSaved();
    onClose();
    alert('Konfigurasi Target & SLA Sistem berhasil diperbarui tanpa hardcoding UI!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-xl bg-[#0d1322] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Konfigurasi Target & SLA Sistem</h3>
              <p className="text-xs text-gray-400">Master Config Engine (Section 4 & Section 13)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveConfig} className="p-5 space-y-5">
          
          {/* Target KPI Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Target Baseline KPI Bulanan (Configurable Target)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Target Kontak Harian</label>
                <input
                  type="number"
                  value={dailyContact}
                  onChange={(e) => setDailyContact(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Target Prospek Bulanan</label>
                <input
                  type="number"
                  value={monthlyProspect}
                  onChange={(e) => setMonthlyProspect(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Target Discovery Bulanan</label>
                <input
                  type="number"
                  value={monthlyDiscovery}
                  onChange={(e) => setMonthlyDiscovery(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Target Demo SOP Bulanan</label>
                <input
                  type="number"
                  value={monthlyDemo}
                  onChange={(e) => setMonthlyDemo(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Target Proposal Bulanan</label>
                <input
                  type="number"
                  value={monthlyProposal}
                  onChange={(e) => setMonthlyProposal(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Target Closing Bulanan</label>
                <input
                  type="number"
                  value={monthlyClosing}
                  onChange={(e) => setMonthlyClosing(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold text-amber-300"
                />
              </div>
            </div>
          </div>

          {/* Proposal SLA Section */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Proposal SLA Configuration (Section 13)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">SLA Anchor Event *</label>
                <select
                  value={anchorEvent}
                  onChange={(e) => setAnchorEvent(e.target.value as SlaAnchorEvent)}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="DEMO">Demo Produk Selesai</option>
                  <option value="VISIT">Kunjungan Lapangan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Batas SLA (Jam) *</label>
                <input
                  type="number"
                  value={slaHours}
                  onChange={(e) => setSlaHours(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Batal
            </button>
            <button type="submit" className="btn-primary text-xs">
              <Save className="w-4 h-4" /> Simpan Konfigurasi Sistem
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
