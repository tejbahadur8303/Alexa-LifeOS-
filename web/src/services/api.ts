import type {
  Goal,
  Task,
  RiskAnalysis,
  ContextSnapshot,
  ContextChange,
  Approval,
  ActionLog,
  GoalStatusResponse,
} from '../types/index.js';

const API_BASE = '/api';

export const api = {
  async getGoals(): Promise<Goal[]> {
    const res = await fetch(`${API_BASE}/goals`);
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  async getGoalStatus(goalId = 'goal_hackathon_001'): Promise<GoalStatusResponse> {
    const res = await fetch(`${API_BASE}/goals/${goalId}`);
    if (!res.ok) throw new Error('Failed to fetch goal status');
    return res.json();
  },

  async getTasks(goalId = 'goal_hackathon_001'): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks?goalId=${goalId}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async getTaskDependencies(goalId = 'goal_hackathon_001') {
    const res = await fetch(`${API_BASE}/tasks/dependencies?goalId=${goalId}`);
    if (!res.ok) throw new Error('Failed to fetch task dependencies');
    return res.json();
  },

  async getRisks(goalId = 'goal_hackathon_001'): Promise<RiskAnalysis> {
    const res = await fetch(`${API_BASE}/risks?goalId=${goalId}`);
    if (!res.ok) throw new Error('Failed to fetch risks');
    return res.json();
  },

  async getContext(goalId = 'goal_hackathon_001'): Promise<ContextSnapshot> {
    const res = await fetch(`${API_BASE}/context?goalId=${goalId}`);
    if (!res.ok) throw new Error('Failed to fetch context');
    return res.json();
  },

  async getContextChanges(goalId = 'goal_hackathon_001'): Promise<{
    hasChanges: boolean;
    latestSnapshot: ContextSnapshot;
    previousSnapshot: ContextSnapshot | null;
    changes: ContextChange[];
  }> {
    const res = await fetch(`${API_BASE}/context/changes?goalId=${goalId}`);
    if (!res.ok) throw new Error('Failed to fetch context changes');
    return res.json();
  },

  async getApprovals(): Promise<Approval[]> {
    const res = await fetch(`${API_BASE}/approvals`);
    if (!res.ok) throw new Error('Failed to fetch approvals');
    return res.json();
  },

  async resolveApproval(
    id: string,
    decision: 'approved' | 'rejected',
    resolvedBy = 'Alex'
  ) {
    const res = await fetch(`${API_BASE}/approvals/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, resolvedBy }),
    });
    if (!res.ok) throw new Error('Failed to resolve approval');
    return res.json();
  },

  async getActivity(limit = 50): Promise<ActionLog[]> {
    const res = await fetch(`${API_BASE}/activity?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch activity log');
    return res.json();
  },

  async injectDisruption(type: string, delayMinutes?: number, goalId = 'goal_hackathon_001') {
    const res = await fetch(`${API_BASE}/disruptions/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, delayMinutes, goalId }),
    });
    if (!res.ok) throw new Error('Failed to inject disruption');
    return res.json();
  },

  async resetDisruption(goalId = 'goal_hackathon_001') {
    const res = await fetch(`${API_BASE}/disruptions/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId }),
    });
    if (!res.ok) throw new Error('Failed to reset disruption');
    return res.json();
  },

  async triggerReplan(goalId = 'goal_hackathon_001') {
    const res = await fetch(`${API_BASE}/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId }),
    });
    if (!res.ok) throw new Error('Failed to trigger replanning');
    return res.json();
  },

  async sendAgentCommand(command: string, goalId = 'goal_hackathon_001') {
    const res = await fetch(`${API_BASE}/agent/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, goalId }),
    });
    if (!res.ok) throw new Error('Failed to send agent command');
    return res.json();
  },

  async getHealth() {
    const res = await fetch('/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getMemories(userId = 'usr_alex_001') {
    const res = await fetch(`${API_BASE}/memories?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch memories');
    return res.json();
  },
};
