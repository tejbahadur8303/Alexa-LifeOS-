import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { ActionLog } from '../types/index.js';
import { Activity as ActivityIcon, ShieldCheck, Filter } from 'lucide-react';

export const Activity: React.FC = () => {
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  useEffect(() => {
    api.getActivity(50).then(setActions).catch(console.error);
  }, []);

  const filtered = actions.filter((a) => filterLevel === 'ALL' || a.riskClassification === filterLevel);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agent Activity & Audit Trail</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full observability of tool invocations, consequence evaluations, and verified actions.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
          {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterLevel === lvl ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Tool / Action</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Decision Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filtered.map((act) => (
                <tr key={act.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-cyan-400 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 font-semibold">{act.toolName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        act.riskClassification === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300'
                          : act.riskClassification === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {act.riskClassification}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono uppercase text-slate-400 text-[11px]">{act.status}</td>
                  <td className="py-3 px-4">
                    {act.verified ? (
                      <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Yes</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md">{act.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
