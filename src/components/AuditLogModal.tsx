import React from 'react';
import type { AuditLog } from '../types/database';
import { X, FileText, Clock, User } from 'lucide-react';

interface AuditLogModalProps {
  logs: AuditLog[];
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  logs,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-3xl bg-[#0d1322] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Audit Log Trail</h3>
              <p className="text-xs text-gray-400">Principle 01: Every Important Business Action Leaves a Trace (Section 23)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">Belum ada catatan audit.</div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id}
                className="bg-gray-900/80 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="badge-cyan text-[10px] font-mono font-bold">
                      {log.event_type}
                    </span>
                    <span className="text-gray-300 font-medium">{log.entity_type} #{log.entity_id.slice(-6)}</span>
                  </div>

                  <span className="text-gray-400 text-[11px] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aktor: <strong>{log.created_by_name || log.created_by}</strong></span>
                </div>

                {log.previous_value && (
                  <div className="bg-gray-950 p-2 rounded-lg font-mono text-[10px] text-gray-400 overflow-x-auto">
                    <span className="text-rose-400">Previous:</span> {JSON.stringify(log.previous_value)}
                  </div>
                )}

                {log.new_value && (
                  <div className="bg-gray-950 p-2 rounded-lg font-mono text-[10px] text-gray-300 overflow-x-auto">
                    <span className="text-emerald-400">New Value:</span> {JSON.stringify(log.new_value)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gray-900/60 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">
            Tutup Audit Log
          </button>
        </div>

      </div>
    </div>
  );
};
