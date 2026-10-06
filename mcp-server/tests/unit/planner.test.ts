import { describe, it, expect } from 'vitest';
import { planner } from '../../../agent/planner/index.js';
import type { Goal, Task, TravelSnapshot, RiskAnalysis, ItineraryRoute } from '../../src/models/types.js';

describe('Agent Planner & Natural Language Interpreter', () => {
  const goal: Goal = {
    id: 'goal_001',
    userId: 'usr_001',
    title: 'Attend Hackathon',
    description: '',
    deadline: '2026-10-04T09:00:00.000Z',
    targetLocation: 'Demo Venue',
    priority: 'critical',
    status: 'at_risk',
    successCriteria: [],
    progress: 70,
    createdAt: '',
    updatedAt: '',
  };

  const disruptedTravel: TravelSnapshot = {
    etaMinutes: 78,
    departureTime: '',
    arrivalTime: '2026-10-04T08:55:00.000Z',
    currentBufferMinutes: 5,
    routeName: 'Highway',
    trafficStatus: 'severe',
    distanceKm: 28,
  };

  const tasks: Task[] = [
    {
      id: 'task_001',
      goalId: 'goal_001',
      title: 'Backend Deployment',
      description: '',
      assignee: 'Rahul',
      status: 'incomplete',
      isCritical: true,
      dependencies: [],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'task_002',
      goalId: 'goal_001',
      title: 'Demo Testing',
      description: '',
      assignee: 'Alex',
      status: 'blocked',
      isCritical: true,
      dependencies: ['task_001'],
      blockedReason: 'Waiting for Rahul',
      createdAt: '',
      updatedAt: '',
    },
  ];

  const risk: RiskAnalysis = {
    id: 'risk_001',
    goalId: 'goal_001',
    riskLevel: 'HIGH',
    riskScore: 82,
    reasons: ['Travel buffer 5m', 'Backend deployment incomplete'],
    affectedGoals: ['goal_001'],
    recommendedActions: ['Switch route', 'Alert Rahul'],
    evaluatedAt: '',
  };

  const altRoute: ItineraryRoute = {
    id: 'alt_001',
    goalId: 'goal_001',
    routeName: 'Express Transit',
    mode: 'express_rail',
    departureTime: '2026-10-04T07:40:00.000Z',
    arrivalTime: '2026-10-04T08:32:00.000Z',
    durationMinutes: 52,
    bufferMinutes: 28,
    steps: [],
    isAlternative: true,
    isSelected: false,
  };

  it('triggers replanning when buffer is low and generates mitigation proposals', () => {
    const result = planner.evaluateReplanning(goal, disruptedTravel, tasks, risk, altRoute);
    expect(result.replanRequired).toBe(true);
    expect(result.proposals.length).toBe(2);

    const routeProposal = result.proposals.find((p) => p.actionType === 'switch_route');
    expect(routeProposal).toBeDefined();
    expect(routeProposal?.requiresApproval).toBe(true);
    expect(routeProposal?.consequenceLevel).toBe('MEDIUM');

    const msgProposal = result.proposals.find((p) => p.actionType === 'send_message');
    expect(msgProposal).toBeDefined();
    expect(msgProposal?.payload.recipient).toBe('Rahul');
  });

  it('interprets natural language commands accurately', () => {
    const brief = planner.interpretNaturalLanguage('Alexa, brief me', { goal, risk, travel: disruptedTravel });
    expect(brief.intent).toBe('daily_briefing');
    expect(brief.response).toContain('Briefing');

    const changed = planner.interpretNaturalLanguage('What changed?', { goal, risk, travel: disruptedTravel });
    expect(changed.intent).toBe('detect_changes');

    const approveRoute = planner.interpretNaturalLanguage('Take the alternative', { goal, risk, travel: disruptedTravel });
    expect(approveRoute.intent).toBe('approve_route');
  });
});
