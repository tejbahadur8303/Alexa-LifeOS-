import { describe, it, expect } from 'vitest';
import { goalEngine } from '../../../agent/goal-engine/index.js';
import type { Goal, Task, TravelSnapshot, TeamMember, RiskAnalysis } from '../../src/models/types.js';

describe('Goal Shield Engine', () => {
  const goal: Goal = {
    id: 'goal_001',
    userId: 'usr_001',
    title: 'Attend Hackathon',
    description: '',
    deadline: '2026-10-04T09:00:00.000Z',
    targetLocation: 'Demo Venue',
    priority: 'high',
    status: 'active',
    successCriteria: ['arrive_before_deadline', 'presentation_ready', 'demo_ready', 'team_ready'],
    progress: 78,
    createdAt: '',
    updatedAt: '',
  };

  const tasks: Task[] = [
    {
      id: 't1',
      goalId: 'goal_001',
      title: 'Presentation Slides',
      description: '',
      assignee: 'Priya',
      status: 'complete',
      isCritical: true,
      dependencies: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 't2',
      goalId: 'goal_001',
      title: 'Demo Testing',
      description: '',
      assignee: 'Alex',
      status: 'blocked',
      isCritical: true,
      dependencies: ['backend'],
      blockedReason: 'Waiting for backend',
      createdAt: '',
      updatedAt: '',
    },
  ];

  const travelSafe: TravelSnapshot = {
    etaMinutes: 45,
    departureTime: '',
    arrivalTime: '2026-10-04T08:30:00.000Z',
    currentBufferMinutes: 30,
    routeName: 'Highway',
    trafficStatus: 'normal',
    distanceKm: 25,
  };

  const team: TeamMember[] = [
    {
      id: 'm1',
      name: 'Rahul',
      role: 'Backend',
      status: 'incomplete',
      assignedDeliverable: 'API',
      contact: '',
      handle: '@rahul',
    },
    {
      id: 'm2',
      name: 'Priya',
      role: 'Product',
      status: 'ready',
      assignedDeliverable: 'Deck',
      contact: '',
      handle: '@priya',
    },
  ];

  const risk: RiskAnalysis = {
    id: 'risk_001',
    goalId: 'goal_001',
    riskLevel: 'MEDIUM',
    riskScore: 45,
    reasons: ['Critical backend incomplete'],
    affectedGoals: ['goal_001'],
    recommendedActions: [],
    evaluatedAt: '',
  };

  it('evaluates success criteria and calculates explainable health score', () => {
    const health = goalEngine.evaluateGoal(goal, tasks, travelSafe, team, risk);
    expect(health.healthScore).toBeGreaterThan(0);
    expect(health.healthScore).toBeLessThanOrEqual(100);
    expect(health.criteriaStatus['presentation_ready'].met).toBe(true);
    expect(health.criteriaStatus['demo_ready'].met).toBe(false);
    expect(health.criteriaStatus['arrive_before_deadline'].met).toBe(true);
  });
});
