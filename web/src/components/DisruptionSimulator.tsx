import React, { useState } from 'react';
import { Flame, CloudRain, AlertOctagon, Train, RotateCcw, Activity } from 'lucide-react';

interface DisruptionSimulatorProps {
  onInject: (type: string, delayMinutes?: number) => Promise<void>;
  onReset: () => Promise<void>;
}

export const DisruptionSimulator: React.FC<DisruptionSimulatorProps> = ({
  onInject,
  onReset,
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleAction = async (type: string, delayMinutes?: number) => {
    try {
      setLoadingType(type);
      await onInject(type, delayMinutes);
    } finally {
      setLoadingType(null);
    }
  };

  const handleReset = async () => {
    try {
      setLoadingType('reset');
      await onReset();
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
            Disruption Simulator (Demo Controls)
          </h3>
        </div>
        <button
          onClick={handleReset}
          disabled={loadingType !== null}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo</span>
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Test how Guardian continuously evaluates external shifts, detects goal threats, and initiates autonomous replanning with user consent.
      </p>

      {/* Disruption Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Primary Demo Traffic Spike */}
        <button
          onClick={() => handleAction('traffic_delay', 33)}
          disabled={loadingType !== null}
          className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all text-left group"
        >
          <div>
            <div className="font-mono text-[11px] text-rose-400 uppercase">Primary Demo</div>
            <div className="text-white font-bold mt-0.5">+33m Traffic Delay</div>
            <div className="text-[10px] text-rose-300/80">Buffer 30m &rarr; 5m (HIGH Risk)</div>
          </div>
          <Flame className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform flex-shrink-0" />
        </button>

        {/* Train Delay */}
        <button
          onClick={() => handleAction('train_delayed', 25)}
          disabled={loadingType !== null}
          className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all text-left group"
        >
          <div>
            <div className="font-mono text-[11px] text-amber-400 uppercase">Transit Slip</div>
            <div className="text-white font-bold mt-0.5">Rail Line Delayed</div>
            <div className="text-[10px] text-amber-300/80">+25m Track Maintenance</div>
          </div>
          <Train className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform flex-shrink-0" />
        </button>

        {/* Bad Weather */}
        <button
          onClick={() => handleAction('adverse_weather')}
          disabled={loadingType !== null}
          className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all text-left group"
        >
          <div>
            <div className="font-mono text-[11px] text-indigo-400 uppercase">Environmental</div>
            <div className="text-white font-bold mt-0.5">Heavy Rainstorm</div>
            <div className="text-[10px] text-indigo-300/80">85% Precip & Hydroplaning</div>
          </div>
          <CloudRain className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0" />
        </button>

        {/* Team Blocker */}
        <button
          onClick={() => handleAction('team_blocker')}
          disabled={loadingType !== null}
          className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all text-left group"
        >
          <div>
            <div className="font-mono text-[11px] text-purple-400 uppercase">Team Deliverable</div>
            <div className="text-white font-bold mt-0.5">Rahul Blocked</div>
            <div className="text-[10px] text-purple-300/80">Staging Server Outage</div>
          </div>
          <AlertOctagon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};
