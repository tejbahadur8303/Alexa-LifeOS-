import React from 'react';
import { ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';
import type { Approval } from '../types/index.js';

interface ApprovalDialogProps {
  approvals: Approval[];
  onResolve: (approvalId: string, decision: 'approved' | 'rejected') => Promise<void>;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  approvals,
  onResolve,
}) => {
  const pending = approvals.filter((a) => a.status === 'pending');

  if (pending.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {pending.map((appr) => {
        const isHigh = appr.consequenceLevel === 'HIGH';

        return (
          <div
            key={appr.id}
            className={`border rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden transition-all ${
              isHigh
                ? 'bg-rose-950/40 border-rose-600/70 shadow-rose-900/30'
                : 'bg-amber-950/40 border-amber-600/70 shadow-amber-900/30'
            }`}
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className={`w-5 h-5 ${isHigh ? 'text-rose-400' : 'text-amber-400'}`} />
                <span
                  className={`text-xs font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  ACTION REQUIRES APPROVAL ({appr.consequenceLevel} RISK)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date(appr.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Action Intent */}
            <h4 className="text-base font-bold text-white mb-1">
              Guardian wants to: <span className="text-cyan-300">{appr.title}</span>
            </h4>
            <p className="text-xs text-slate-300 mb-3">{appr.description}</p>

            {/* Impact / Consequence summary */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 mb-4 space-y-1">
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block">
                Impact Justification:
              </span>
              <p className="leading-relaxed">{appr.impactSummary}</p>

              {appr.payload?.message && (
                <div className="mt-2 pt-2 border-t border-slate-850 font-mono text-[11px] text-cyan-200">
                  <span className="text-slate-400">Message to dispatch: </span>
                  "{appr.payload.message}"
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onResolve(appr.id, 'approved')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>APPROVE ACTION</span>
              </button>

              <button
                onClick={() => onResolve(appr.id, 'rejected')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold flex items-center justify-center space-x-1.5 border border-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
                <span>REJECT</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
