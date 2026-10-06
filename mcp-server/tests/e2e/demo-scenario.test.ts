import { describe, it, expect, beforeAll } from 'vitest';
import { storage } from '../../src/db/storage.js';
import { goalService } from '../../src/services/goal.service.js';
import { taskService } from '../../src/services/task.service.js';
import { travelSimulator } from '../../src/adapters/simulation/travel.simulator.js';
import { riskService } from '../../src/services/risk.service.js';
import { planningService } from '../../src/services/planning.service.js';
import { permissionService } from '../../src/services/permission.service.js';
import { changeDetectionService } from '../../src/services/change-detection.service.js';

describe('LifeOS Guardian End-to-End Primary Demo Scenario', () => {
  beforeAll(async () => {
    process.env.FORCE_MEMORY_DB = 'true';
    await storage.init();
    await travelSimulator.resetToNormal();
  });

  it('executes the full autonomous goal protection lifecycle from disruption to resolution', async () => {
    // 1. Goal: User objective "Alexa, make sure I reach my hackathon tomorrow by 9 AM and my team is ready."
    const goal = (await goalService.getGoal('goal_hackathon_001')) || (await goalService.createGoal({
      title: 'Attend Amazon Hackathon',
      description: 'Make sure I reach my hackathon tomorrow by 9 AM and my team is ready.',
      deadline: '2026-10-04T09:00:00.000Z',
      targetLocation: 'Demo Venue - Innovation Hall 4',
      priority: 'critical',
      successCriteria: [
        'arrive_before_deadline',
        'presentation_ready',
        'demo_ready',
        'team_ready',
      ],
    }));
    expect(goal.id).toBeDefined();

    // 2. Initial state gathering: baseline travel buffer is 30m, slides complete, backend incomplete
    const initialTravel = await travelSimulator.getTravelStatus(goal.id);
    expect(initialTravel.etaMinutes).toBe(45);
    expect(initialTravel.currentBufferMinutes).toBe(30);

    const initialRisk = await riskService.analyzeGoalRisk(goal.id);
    expect(['LOW', 'MEDIUM']).toContain(initialRisk.riskLevel);

    // Capture initial context snapshot
    await changeDetectionService.captureCurrentSnapshot(goal.id);

    // 3. Unexpected Disruption: Traffic increases on highway (+33 minutes)
    const disruptedTravel = await travelSimulator.injectTrafficDelay(33);
    expect(disruptedTravel.etaMinutes).toBe(78);
    expect(disruptedTravel.currentBufferMinutes).toBe(5);

    // 4. Change Detector notices the shift
    const changeReport = await changeDetectionService.detectContextChanges(goal.id);
    expect(changeReport.hasChanges).toBe(true);
    const travelChange = changeReport.changes.find((c) => c.category === 'travel');
    expect(travelChange?.impactLevel).toBe('HIGH');
    expect(travelChange?.deltaSummary).toContain('78m');

    // 5. Risk Engine evaluates new risk: Buffer < 15m triggers HIGH risk
    const escalatedRisk = await riskService.analyzeGoalRisk(goal.id);
    expect(['HIGH', 'CRITICAL']).toContain(escalatedRisk.riskLevel);
    expect(escalatedRisk.reasons.some((r) => r.includes('Travel buffer is only 5 minutes'))).toBe(true);

    // 6. Planner identifies alternatives and formulates replanning proposals
    const replan = await planningService.replanGoal(goal.id);
    expect(replan.replanRequired).toBe(true);
    expect(replan.proposals.length).toBeGreaterThan(0);

    // 7. Verify Consequence-Aware Permissions: Actions are paused waiting for approval
    const pendingApprovals = await permissionService.getPendingApprovals();
    expect(pendingApprovals.length).toBeGreaterThan(0);

    const routeApproval = pendingApprovals.find((a) => a.actionType === 'switch_route');
    expect(routeApproval).toBeDefined();
    expect(routeApproval?.consequenceLevel).toBe('MEDIUM');

    // 8. User grants permission: "Take the alternative"
    const routeResolution = await permissionService.resolveApproval(
      routeApproval!.id,
      'approved',
      'Alex'
    );
    expect(routeResolution.verified).toBe(true);
    expect(routeResolution.executionResult.newBufferMinutes).toBe(28);

    // 9. User grants permission to alert Rahul regarding backend blocker
    const msgApproval = pendingApprovals.find((a) => a.actionType === 'send_message');
    if (msgApproval) {
      const msgResolution = await permissionService.resolveApproval(
        msgApproval.id,
        'approved',
        'Alex'
      );
      expect(msgResolution.verified).toBe(true);
      expect(msgResolution.executionResult.delivered).toBe(true);
    }

    // 10. Final goal status: verified safe and protected
    const finalStatus = await goalService.getGoalStatus(goal.id);
    expect(finalStatus?.travel.currentBufferMinutes).toBe(28);
    expect(finalStatus?.travel.trafficStatus).toBe('normal');

    console.log('[E2E Test] Primary demo scenario passed with 100% verification!');
  });
});
