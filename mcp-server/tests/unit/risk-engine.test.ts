import { describe, it, expect } from 'vitest';
import { riskEngine } from '../../../agent/risk-engine/index.js';
import type { Goal, Task, TravelSnapshot, TeamMember } from '../../src/models/types.js';

describe('Predictive Risk Engine', () => {
  const baseGoal: Goal = {
    id: 'goal_test_001',
    userId: 'usr_001',
    title: 'Attend Hackathon',
    description: 'Reach venue on time',
    deadline: '2026-10-04T09:00:00.000Z',
    targetLocation: 'Demo Venue',
    priority: 'high',
    status: 'active',
    successCriteria: ['arrive_before_deadline'],
    progress: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tasks: Task[] = [
    {
      id: 't1',
      goalId: 'goal_test_001',
      title: 'Backend Deployment',
      description: 'Deploy API',
      assignee: 'Rahul',
      status: 'incomplete',
      isCritical: true,
      dependencies: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 't2',
      goalId: 'goal_test_001',
      title: 'Demo Testing',
      description: 'Run demo',
      assignee: 'Alex',
      status: 'blocked',
      isCritical: true,
      dependencies: ['t1'],
      blockedReason: 'Waiting for t1',
      createdAt: '',
      updatedAt: '',
    },
  ];

  const nominalTravel: TravelSnapshot = {
    etaMinutes: 45,
    departureTime: '2026-10-04T07:45:00.000Z',
    arrivalTime: '2026-10-04T08:30:00.000Z',
    currentBufferMinutes: 30,
    routeName: 'Highway 101',
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
      contact: '555',
      handle: '@rahul',
    },
  ];

  it('evaluates baseline risk score accurately with incomplete critical task and blocked dependency', () => {
    const analysis = riskEngine.evaluateRisk({
      goal: baseGoal,
      tasks,
      travel: nominalTravel,
      teamMembers: team,
    });

    // Score: critical task incomplete (+25) + dependency blocked (+20) + team member incomplete (+10) = 55 (MEDIUM)
    expect(analysis.riskScore).toBe(55);
    expect(analysis.riskLevel).toBe('MEDIUM');
    expect(analysis.reasons.length).toBeGreaterThan(0);
    expect(analysis.affectedGoals).toContain('goal_test_001');
  });

  it('escalates to HIGH risk when travel buffer drops below 15 minutes', () => {
    const disruptedTravel: TravelSnapshot = {
      ...nominalTravel,
      etaMinutes: 78,
      arrivalTime: '2026-10-04T08:55:00.000Z',
      currentBufferMinutes: 5,
      trafficStatus: 'severe',
    };

    const analysis = riskEngine.evaluateRisk({
      goal: baseGoal,
      tasks,
      travel: disruptedTravel,
      teamMembers: team,
    });

    // Score: 55 + travel buffer < 15m (+25) = 80 (CRITICAL or HIGH)
    expect(analysis.riskScore).toBeGreaterThanOrEqual(75);
    expect(['HIGH', 'CRITICAL']).toContain(analysis.riskLevel);
    expect(analysis.reasons.some((r) => r.includes('Travel buffer is only 5 minutes'))).toBe(true);
    expect(analysis.recommendedActions.some((a) => a.includes('alternative'))).toBe(true);
  });

  it('generates clear, explainable decision narratives', () => {
    const analysis = riskEngine.evaluateRisk({
      goal: baseGoal,
      tasks,
      travel: nominalTravel,
      teamMembers: team,
    });

    const explanation = riskEngine.explainDecision(analysis, baseGoal, nominalTravel);
    expect(explanation).toContain('Attend Hackathon');
    expect(explanation).toContain('MEDIUM');
  });
});
