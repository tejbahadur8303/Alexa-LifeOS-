import React from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import type { RiskAnalysis, TravelSnapshot } from '../types/index.js';

interface RiskCardProps {
  risk: RiskAnalysis | null;
  travel: TravelSnapshot | null;
  onFixRisk: () => void;
  onViewPlan: () => void;
  isFixing?: boolean;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  risk,
  travel,
  onFixRisk,
  onViewPlan,
  isFixing = false,
}) => {
  if (!risk) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
      </div>
    );
  }

  const isHighOrCritical = risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL';
  const isMedium = risk.riskLevel === 'MEDIUM';

  return (
    <div
      className={`rounded-2xl p-6 border transition-all relative overflow-hidden backdrop-blur-sm ${
        isHighOrCritical
          ? 'bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/30'
          : isMedium
          ? 'bg-amber-950/20 border-amber-800/60 shadow-lg shadow-amber-950/30'
          : 'bg-emerald-950/20 border-emerald-800/60 shadow-lg shadow-emerald-950/30'
      }`}
    >
      {/* Risk Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Guardian Risk Assessment
          </span>
          <div className="flex items-center space-x-2">
            {isHighOrCritical ? (
              <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
            ) : isMedium ? (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            )}
            <h3
              className={`text-2xl font-extrabold font-mono tracking-tight ${
                isHighOrCritical
                  ? 'text-rose-400'
                  : isMedium
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {risk.riskLevel} RISK
            </h3>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-2xl font-extrabold text-white">{risk.riskScore}</span>
          <span className="text-xs text-slate-400">/100</span>
          <p className="text-[10px] text-slate-400">Predictive Score</p>
        </div>
      </div>

      {/* Risk Reasons (Explainability) */}
      <div className="mb-5">
        <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2">
          Explainable Threat Factors
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-200">
          {risk.reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  isHighOrCritical ? 'bg-rose-400' : isMedium ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span className="font-medium leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Mitigations */}
      {risk.recommendedActions && risk.recommendedActions.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-5 text-xs">
          <span className="font-mono text-[11px] text-cyan-400 uppercase tracking-wider block mb-1">
            Guardian Recommendation:
          </span>
          <p className="text-slate-300 leading-snug">{risk.recommendedActions[0]}</p>
        </div>
      )}

      {/* Action Buttons (Section 20: [ VIEW PLAN ] [ FIX RISK ]) */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={onViewPlan}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold font-mono tracking-wide border border-slate-700 transition-all text-center"
        >
          VIEW PLAN
        </button>

        <button
          onClick={onFixRisk}
          disabled={isFixing}
          className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide transition-all shadow-md flex items-center justify-center space-x-1.5 ${
            isHighOrCritical
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
          }`}
        >
          {isFixing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>REPLANNING...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>FIX RISK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
