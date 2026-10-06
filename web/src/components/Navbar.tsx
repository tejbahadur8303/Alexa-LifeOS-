import React from 'react';
import { Shield, Radio, CheckCircle, AlertTriangle, Activity, Settings, ListTodo, Layers } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingApprovalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  pendingApprovalsCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">LifeOS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                Alexa+ Guardian
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Autonomous Goal Protection</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('goals')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'goals'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setCurrentTab('approvals')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
              currentTab === 'approvals'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-slate-950 font-bold animate-pulse">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('activity')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'activity'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'settings'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-mono">MCP: Streamable HTTP</span>
          </div>
        </div>
      </div>
    </header>
  );
};
