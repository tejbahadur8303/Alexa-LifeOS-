import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import type { GoalStatusResponse, Approval, ActionLog } from '../types/index.js';
import { GoalCard } from '../components/GoalCard.js';
import { RiskCard } from '../components/RiskCard.js';
import { ApprovalDialog } from '../components/ApprovalDialog.js';
import { DisruptionSimulator } from '../components/DisruptionSimulator.js';
import { ContextPanel } from '../components/ContextPanel.js';
import { DependencyGraph } from '../components/DependencyGraph.js';
import { AgentActivity } from '../components/AgentActivity.js';
import { CommandBar } from '../components/CommandBar.js';

interface DashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const [goalData, setGoalData] = useState<GoalStatusResponse | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);

  const refreshAll = async () => {
    try {
      const [status, appr, act] = await Promise.all([
        api.getGoalStatus('goal_hackathon_001'),
        api.getApprovals(),
        api.getActivity(15),
      ]);
      setGoalData(status);
      setApprovals(appr);
      setActions(act);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveApproval = async (approvalId: string, decision: 'approved' | 'rejected') => {
    await api.resolveApproval(approvalId, decision);
    await refreshAll();
  };

  const handleInjectDisruption = async (type: string, delayMinutes?: number) => {
    await api.injectDisruption(type, delayMinutes);
    await refreshAll();
  };

  const handleResetDisruption = async () => {
    await api.resetDisruption();
    await refreshAll();
  };

  const handleFixRisk = async () => {
    try {
      setIsFixing(true);
      await api.triggerReplan('goal_hackathon_001');
      await refreshAll();
    } finally {
      setIsFixing(false);
    }
  };

  const handleSendCommand = async (command: string) => {
    const res = await api.sendAgentCommand(command);
    await refreshAll();
    return res;
  };

  if (loading && !goalData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3 font-mono text-cyan-400">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Connecting to LifeOS Guardian Agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Alexa Voice / Natural Language Bar */}
      <CommandBar onSendCommand={handleSendCommand} />

      {/* Pending Approvals Callout (Section 23: Human-in-the-loop authorization) */}
      <ApprovalDialog approvals={approvals} onResolve={handleResolveApproval} />

      {/* Top Grid: Active Goal & Risk Engine Status (Section 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GoalCard
            goalData={goalData}
            onViewPlan={() => onNavigateTab('goals')}
          />
        </div>

        <div>
          <RiskCard
            risk={goalData?.risk || null}
            travel={goalData?.travel || null}
            onFixRisk={handleFixRisk}
            onViewPlan={() => onNavigateTab('goals')}
            isFixing={isFixing}
          />
        </div>
      </div>

      {/* Disruption Simulator (Section 18: Demo controls) */}
      <DisruptionSimulator
        onInject={handleInjectDisruption}
        onReset={handleResetDisruption}
      />

      {/* Context Panel: Travel, Weather, Team streams */}
      <ContextPanel
        travel={goalData?.travel || null}
        context={null}
      />

      {/* Workflow Dependency Graph & Agent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DependencyGraph tasks={goalData?.tasks.items || []} />
        </div>

        <div>
          <AgentActivity actions={actions} limit={6} />
        </div>
      </div>
    </div>
  );
};
