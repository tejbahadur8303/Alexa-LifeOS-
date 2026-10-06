import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { Approval } from '../types/index.js';
import { ShieldAlert, Check, X, ShieldCheck, Clock } from 'lucide-react';

export const Approvals: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      const data = await api.getApprovals();
      setApprovals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleResolve = async (id: string, decision: 'approved' | 'rejected') => {
    await api.resolveApproval(id, decision);
    await fetchApprovals();
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Consequence-Aware Approvals</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Guardian strictly pauses before medium/high-risk actions to require human authorization.
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No Pending Approvals</p>
          <p className="text-xs text-slate-400 mt-1">All autonomous actions are currently in compliance with policy.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((appr) => {
            const isPending = appr.status === 'pending';
            const isApproved = appr.status === 'approved';

            return (
              <div
                key={appr.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : isApproved
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        appr.consequenceLevel === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {appr.consequenceLevel} RISK
                    </span>
                    <span className="text-xs font-mono text-slate-400">{appr.actionType}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                      isPending
                        ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                        : isApproved
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {appr.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{appr.title}</h4>
                <p className="text-xs text-slate-300 mb-3">{appr.description}</p>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-xs mb-4">
                  <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider block mb-1">
                    Justification & Impact:
                  </span>
                  <p className="text-slate-300">{appr.impactSummary}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-850 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Requested: {new Date(appr.requestedAt).toLocaleString()}</span>
                  </div>

                  {isPending ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResolve(appr.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleResolve(appr.id, 'approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Approve
                      </button>
                    </div>
                  ) : (
                    <span>Resolved by: {appr.resolvedBy || 'Alex'}</span>
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
