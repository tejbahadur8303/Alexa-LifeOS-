import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Dashboard } from './pages/Dashboard.js';
import { Goals } from './pages/Goals.js';
import { Approvals } from './pages/Approvals.js';
import { Activity } from './pages/Activity.js';
import { Settings } from './pages/Settings.js';
import { api } from './services/api.js';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchBadge = async () => {
    try {
      const approvals = await api.getApprovals();
      const count = approvals.filter((a) => a.status === 'pending').length;
      setPendingCount(count);
    } catch {
      // ignore in offline/initial mount
    }
  };

  useEffect(() => {
    fetchBadge();
    const interval = setInterval(fetchBadge, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingApprovalsCount={pendingCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && <Dashboard onNavigateTab={setCurrentTab} />}
        {currentTab === 'goals' && <Goals onSelectGoal={() => setCurrentTab('goals')} />}
        {currentTab === 'approvals' && <Approvals />}
        {currentTab === 'activity' && <Activity />}
        {currentTab === 'settings' && <Settings />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        LifeOS — Alexa+ Guardian • MCP 2025-11-25 Streamable HTTP • Autonomous Goal Protection Agent
      </footer>
    </div>
  );
}

export default App;
