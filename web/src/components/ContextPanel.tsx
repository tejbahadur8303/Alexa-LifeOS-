import React from 'react';
import { Navigation, CloudSun, Users, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { TravelSnapshot, ContextSnapshot } from '../types/index.js';

interface ContextPanelProps {
  travel: TravelSnapshot | null;
  context: ContextSnapshot | null;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ travel, context }) => {
  const isTrafficSevere = travel?.trafficStatus === 'severe' || (travel?.currentBufferMinutes ?? 30) < 15;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Travel & Commute Context */}
      <div
        className={`p-5 rounded-2xl border backdrop-blur-sm transition-all ${
          isTrafficSevere
            ? 'bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/20'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Navigation className={`w-4 h-4 ${isTrafficSevere ? 'text-rose-400' : 'text-cyan-400'}`} />
            <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Travel & ETA
            </h4>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
              isTrafficSevere
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {travel?.trafficStatus || 'Normal'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-extrabold text-white font-mono">
              {travel?.etaMinutes ?? 45} <span className="text-xs font-normal text-slate-400">min</span>
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                isTrafficSevere ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              Buffer: {travel?.currentBufferMinutes ?? 30}m
            </span>
          </div>

          <p className="text-xs text-slate-300 truncate" title={travel?.routeName}>
            {travel?.routeName || 'I-94 Highway Direct'}
          </p>

          <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/80 flex justify-between">
            <span>Dep: {travel?.departureTime ? new Date(travel.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '07:45 AM'}</span>
            <span>Arr: {travel?.arrivalTime ? new Date(travel.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:30 AM'}</span>
          </div>
        </div>
      </div>

      {/* Weather Context */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CloudSun className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Environmental
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {context?.weather.condition || 'Clear'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-extrabold text-white font-mono">
              {context?.weather.temperatureC ?? 21}°C
            </span>
            <span className="text-xs font-mono text-cyan-400">
              Rain: {context?.weather.rainProbabilityPercent ?? 10}%
            </span>
          </div>

          <p className="text-xs text-slate-300 truncate">
            Wind: {context?.weather.windSpeedKmh ?? 12} km/h • Road conditions dry
          </p>

          <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/80 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Weather window favorable for travel</span>
          </div>
        </div>
      </div>

      {/* Team Readiness Context */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Team Readiness
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
            2/3 READY
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Priya (Presentation)</span>
            <span className="text-emerald-400 font-mono text-[11px]">READY</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Aman (Demo Video)</span>
            <span className="text-emerald-400 font-mono text-[11px]">READY</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Rahul (Backend)</span>
            <span className="text-amber-400 font-mono text-[11px] font-bold">INCOMPLETE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
