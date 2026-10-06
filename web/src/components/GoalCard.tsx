import React from 'react';
import { Target, CheckCircle2, AlertCircle, XCircle, Clock, MapPin, Sparkles } from 'lucide-react';
import type { GoalStatusResponse } from '../types/index.js';

interface GoalCardProps {
  goalData: GoalStatusResponse | null;
  onViewPlan: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goalData, onViewPlan }) => {
  if (!goalData) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-2/3 mb-6"></div>
        <div className="h-3 bg-slate-800 rounded mb-4"></div>
      </div>
    );
  }

  const { goal, health, travel, tasks, team } = goalData;
  const progress = goal.progress || 78;

  // Criteria status checks
  const presentationReady = health.criteriaStatus?.['presentation_ready']?.met ?? true;
  const demoReady = health.criteriaStatus?.['demo_ready']?.met ?? false;
  const travelSafe = health.criteriaStatus?.['arrive_before_deadline']?.met ?? true;
  const teamReady = health.criteriaStatus?.['team_ready']?.met ?? false;

  const backendTask = tasks.items.find((t) => t.title.toLowerCase().includes('backend'));
  const isBackendBlocking = backendTask && backendTask.status !== 'complete';

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm transition-all hover:border-slate-700">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Active Protected Goal</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{goal.title}</h2>
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{goal.description}</p>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
              health.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : health.status === 'at_risk'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {health.status.replace('_', ' ')}
          </span>
          <span className="text-[11px] text-slate-500 font-mono mt-1">Health: {health.healthScore}%</span>
        </div>
      </div>

      {/* Logistics Pills */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mb-5 font-mono">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Deadline: Tomorrow 9:00 AM</span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>{goal.targetLocation}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
          <span className="text-slate-400">Readiness Progress</span>
          <span className="font-bold text-cyan-400">{progress}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Success Criteria & Blockers Grid (Section 2 & 20) */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider flex items-center justify-between">
          <span>Success Criteria Status</span>
          <button
            onClick={onViewPlan}
            className="text-cyan-400 hover:text-cyan-300 font-sans normal-case text-xs flex items-center space-x-1"
          >
            <span>View Plan Details</span>
            <span>&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Presentation */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-200 font-medium">Presentation Slides</span>
            </div>
            <span className="text-[11px] text-emerald-400/90 font-mono">READY</span>
          </div>

          {/* Travel / Arrival */}
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
              travelSafe
                ? 'bg-slate-950/60 border-slate-800/80'
                : 'bg-rose-950/20 border-rose-800/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              {travelSafe ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span className="text-slate-200 font-medium">Travel & Arrival</span>
            </div>
            <span
              className={`text-[11px] font-mono ${
                travelSafe ? 'text-emerald-400/90' : 'text-rose-400 font-bold'
              }`}
            >
              {travelSafe ? `BUFFER ${travel.currentBufferMinutes}m` : `CRITICAL (${travel.currentBufferMinutes}m)`}
            </span>
          </div>

          {/* Backend Deployment */}
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
              isBackendBlocking
                ? 'bg-amber-950/20 border-amber-800/50'
                : 'bg-slate-950/60 border-slate-800/80'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isBackendBlocking ? (
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span className="text-slate-200 font-medium">Backend Deployment (Rahul)</span>
            </div>
            <span
              className={`text-[11px] font-mono ${
                isBackendBlocking ? 'text-amber-400 font-bold' : 'text-emerald-400/90'
              }`}
            >
              {isBackendBlocking ? 'BLOCKING' : 'READY'}
            </span>
          </div>

          {/* Demo Testing */}
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
              !demoReady
                ? 'bg-rose-950/20 border-rose-800/50'
                : 'bg-slate-950/60 border-slate-800/80'
            }`}
          >
            <div className="flex items-center space-x-2">
              {!demoReady ? (
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span className="text-slate-200 font-medium">Demo Testing Rehearsal</span>
            </div>
            <span
              className={`text-[11px] font-mono ${
                !demoReady ? 'text-rose-400 font-bold' : 'text-emerald-400/90'
              }`}
            >
              {!demoReady ? 'BLOCKED' : 'VERIFIED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
