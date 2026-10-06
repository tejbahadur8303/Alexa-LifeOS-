import type { Goal } from '../models/types.js';
import { storage } from '../db/storage.js';
import { travelSimulator } from '../adapters/simulation/travel.simulator.js';
import { teamSimulator } from '../adapters/simulation/team.simulator.js';
import { riskService } from './risk.service.js';
import { permissionService } from './permission.service.js';
import { planner, type ReplanResult } from '../../../agent/planner/index.js';

export class PlanningService {
  async replanGoal(goalId: string): Promise<ReplanResult> {
    const goal = await storage.getGoal(goalId);
    if (!goal) throw new Error(`Goal with ID "${goalId}" not found`);

    const tasks = await storage.getTasksByGoal(goalId);
    const travel = await travelSimulator.getTravelStatus(goalId);
    const risk = await riskService.analyzeGoalRisk(goalId);
    const altRoute = await travelSimulator.findAlternativeRoute(goalId);

    const replanResult = planner.evaluateReplanning(goal, travel, tasks, risk, altRoute);

    // If replan required, auto-create pending approval requests for proposed actions
    if (replanResult.replanRequired) {
      for (const proposal of replanResult.proposals) {
        if (proposal.requiresApproval) {
          await permissionService.requestApproval({
            goalId,
            actionType: proposal.actionType,
            title: proposal.title,
            description: proposal.description,
            impactSummary: proposal.impactSummary,
            payload: proposal.payload,
          });
        }
      }
    }

    return replanResult;
  }

  async generateDailyBriefing(userId = 'usr_alex_001'): Promise<{
    user: string;
    greeting: string;
    activeGoalsSummary: string;
    riskStatus: string;
    travelSummary: string;
    blockersSummary: string;
    pendingApprovalsCount: number;
    recommendedNextStep: string;
  }> {
    const user = (await storage.getUser(userId)) || { name: 'Alex' };
    const goals = await storage.getAllGoals();
    const activeGoal = goals.find((g) => g.status === 'active' || g.status === 'at_risk' || g.status === 'blocked') || goals[0];

    let riskLevel = 'LOW';
    let travelBuffer = 30;
    let blockersCount = 0;

    if (activeGoal) {
      const risk = await riskService.analyzeGoalRisk(activeGoal.id);
      riskLevel = risk.riskLevel;
      const travel = await travelSimulator.getTravelStatus(activeGoal.id);
      travelBuffer = travel.currentBufferMinutes;
      const tasks = await storage.getTasksByGoal(activeGoal.id);
      blockersCount = tasks.filter((t) => t.status === 'blocked').length;
    }

    const pendingApprovals = await permissionService.getPendingApprovals();

    return {
      user: user.name,
      greeting: `Good morning, ${user.name}. Here is your LifeOS Guardian operational briefing.`,
      activeGoalsSummary: `You have ${goals.length} goal active: "${activeGoal?.title || 'Hackathon Preparation'}".`,
      riskStatus: `Current risk level is ${riskLevel}. Travel buffer: ${travelBuffer} minutes before deadline.`,
      travelSummary: `Travel ETA is currently ${travelBuffer < 15 ? 'CRITICALLY DELAYED' : 'nominal'}.`,
      blockersSummary:
        blockersCount > 0
          ? `${blockersCount} task(s) currently blocked by pending dependencies.`
          : 'No tasks currently blocked.',
      pendingApprovalsCount: pendingApprovals.length,
      recommendedNextStep:
        pendingApprovals.length > 0
          ? `Review ${pendingApprovals.length} pending approval(s) in your Guardian console.`
          : 'All systems nominal.',
    };
  }
}

export const planningService = new PlanningService();
