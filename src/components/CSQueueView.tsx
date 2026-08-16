import React, { useState } from 'react';
import type { Prospect } from '../types/database';
import { systemStore } from '../lib/supabase';
import { 
  Layers, Lock, CheckCircle2, XCircle, Phone, MapPin, User
} from 'lucide-react';

interface CSQueueViewProps {
  prospects: Prospect[];
  onRefresh: () => void;
}

export const CSQueueView: React.FC<CSQueueViewProps> = ({
  prospects,
  onRefresh
}) => {
  const currentCS = systemStore.getCurrentEmployee();
  const [activeQueueLead, setActiveQueueLead] = useState<Prospect | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Klien belum membutuhkan sistem ERP saat ini.');

  // Sort queue strictly by week_number ASC and created_at ASC (FIFO Engine)
  const activeQueue = prospects
    .filter(p => p.status === 'ACTIVE' || p.status.startsWith('FOLLOWUP'))
    .sort((a, b) => a.week_number - b.week_number || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleGetNextQueue = () => {
    if (activeQueue.length === 0) {
      alert('Antrean minggu ini kosong!');
      return;
    }
    setActiveQueueLead(activeQueue[0]);
  };

  const handleQualifyLead = () => {
    if (!activeQueueLead) return;
    systemStore.updateProspect(activeQueueLead.id, {
      pipeline_stage: 'DISCOVERY',
      status: 'ACTIVE'
    });
    alert('✅ Prospek Dinyatakan Kualified! Melanjut ke Tahap Discovery Sales.');
    setActiveQueueLead(null);
    onRefresh();
  };

  const handleRejectLead = () => {
    if (!activeQueueLead) return;
    systemStore.updateProspect(activeQueueLead.id, {
      status: 'MENOLAK',
      rejection_reason: rejectionReason
    });
    alert('Data Penolakan Tersimpan sebagai Intelligence Produk!');
    setActiveQueueLead(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-white p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-card p-6 border-l-4 border-blue-500 bg-gradient-to-r from-blue-900/30 via-gray-900 to-gray-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Divisi CS Queue Management</h2>
                <span className="badge-blue text-xs px-2.5 py-0.5 rounded-full font-mono">
                  Strict Weekly FIFO Engine
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                CS memproses data prospek urut berdasarkan urutan minggu (Anti-Cherry Picking).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleGetNextQueue}
              className="btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-bold py-2.5 shadow-lg shadow-blue-500/25"
            >
              <Lock className="w-4 h-4" />
              <span>Ambil Prospek Minggu Ini (Strict Queue)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Queue Card Process */}
      {activeQueueLead ? (
        <div className="glass-card p-6 border border-blue-500/40 bg-gradient-to-b from-blue-950/40 to-gray-900 space-y-4 animate-pulse-slow">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="badge-blue text-xs font-mono font-bold">
                MINGGU KE-{activeQueueLead.week_number} (Tahun {activeQueueLead.year_created})
              </span>
              <span className="text-xs text-gray-400">Locked for: {currentCS.name}</span>
            </div>
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Antrean Terkunci (Satu per Satu)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{activeQueueLead.nama_lembaga}</h3>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-400" /> PIC: {activeQueueLead.pic}
              </p>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp: {activeQueueLead.no_hp}
              </p>
              <p className="text-xs text-gray-300 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Wilayah: {activeQueueLead.wilayah}
              </p>
            </div>

            <div className="bg-gray-900/80 p-3 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="text-gray-400 font-medium mb-1">Catatan Sales Lapangan:</div>
              <div className="text-gray-200 italic">"{activeQueueLead.catatan || 'Kunjungan awal lapangan.'}"</div>
            </div>
          </div>

          {/* CS Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Alasan jika menolak..."
                className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                onClick={handleRejectLead}
                className="btn-secondary text-xs bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
              >
                <XCircle className="w-4 h-4" />
                <span>Klien Menolak</span>
              </button>

              <button 
                onClick={handleQualifyLead}
                className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-500 font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lanjut / Qualify (Berminat)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center space-y-3 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Antrean CS Terkunci (Sequential Weekly FIFO)</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Klik tombol <strong>"Ambil Prospek Minggu Ini"</strong> di atas untuk memproses data prospek tertua secara otomatis.
          </p>
        </div>
      )}

      {/* Queue Summary Grid */}
      <div className="glass-card p-5 border border-white/10 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Daftar Urutan Antrean Minggu Ini ({activeQueue.length} Prospek Aktif)
        </h3>

        <div className="space-y-2">
          {activeQueue.map((prospect, idx) => (
            <div 
              key={prospect.id}
              className="bg-gray-900/60 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 font-mono font-bold flex items-center justify-center text-[10px]">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white">{prospect.nama_lembaga}</h4>
                  <span className="text-[11px] text-gray-400">Minggu Ke-{prospect.week_number} • {prospect.wilayah}</span>
                </div>
              </div>

              <span className="badge-blue text-[10px]">
                {prospect.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
