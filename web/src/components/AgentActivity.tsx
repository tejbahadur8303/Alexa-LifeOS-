import React from 'react';
import { Activity, CheckCircle2, AlertCircle, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import type { ActionLog } from '../types/index.js';

interface AgentActivityProps {
  actions: ActionLog[];
  limit?: number;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({ actions, limit = 10 }) => {
  const displayActions = actions.slice(0, limit);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
            Agent Operational Audit Log
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500">Live Decision Stream</span>
      </div>

      {displayActions.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">No recent actions recorded.</p>
      ) : (
        <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {displayActions.map((act) => {
            const timeStr = new Date(act.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div key={act.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                    act.status === 'verified'
                      ? 'bg-emerald-400'
                      : act.status === 'pending'
                      ? 'bg-amber-400 animate-pulse'
                      : act.status === 'rejected'
                      ? 'bg-rose-400'
                      : 'bg-cyan-400'
                  }`}
                />

                <div className="bg-slate-950/50 hover:bg-slate-950/80 border border-slate-850 p-2.5 rounded-xl transition-all">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span className="text-cyan-400 font-semibold">{timeStr}</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {act.toolName}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          act.riskClassification === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300'
                            : act.riskClassification === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {act.riskClassification} RISK
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-snug">{act.explanation}</p>

                  {act.verified && (
                    <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Execution Verified</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
