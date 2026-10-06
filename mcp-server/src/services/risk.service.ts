import type { RiskAnalysis } from '../models/types.js';
import { storage } from '../db/storage.js';
import { travelSimulator } from '../adapters/simulation/travel.simulator.js';
import { weatherSimulator } from '../adapters/simulation/weather.simulator.js';
import { teamSimulator } from '../adapters/simulation/team.simulator.js';
import { riskEngine } from '../../../agent/risk-engine/index.js';
import { goalEngine } from '../../../agent/goal-engine/index.js';

export class RiskService {
  async analyzeGoalRisk(goalId: string): Promise<RiskAnalysis> {
    const goal = await storage.getGoal(goalId);
    if (!goal) {
      throw new Error(`Goal with ID "${goalId}" not found`);
    }

    const tasks = await storage.getTasksByGoal(goalId);
    const travel = await travelSimulator.getTravelStatus(goalId);
    const weather = await weatherSimulator.getCurrentWeather(goal.targetLocation);
    const teamMembers = await teamSimulator.getTeamMembers();

    const risk = riskEngine.evaluateRisk({
      goal,
      tasks,
      travel,
      weather,
      teamMembers,
    });

    await storage.saveRisk(risk);

    // Update goal status according to risk and health
    const health = goalEngine.evaluateGoal(goal, tasks, travel, teamMembers, risk);
    if (goal.status !== health.status && goal.status !== 'completed' && goal.status !== 'cancelled') {
      goal.status = health.status;
      await storage.saveGoal(goal);
    }

    return risk;
  }

  async calculateGoalImpact(
    goalId: string,
    hypothetical: {
      addedTravelDelayMinutes?: number;
      taskDelayedId?: string;
      weatherSeverity?: string;
    }
  ) {
    const goal = await storage.getGoal(goalId);
    if (!goal) throw new Error(`Goal with ID "${goalId}" not found`);

    const currentRisk = await this.analyzeGoalRisk(goalId);
    const baselineTravel = await travelSimulator.getTravelStatus(goalId);
    const simulatedTravel = {
      ...baselineTravel,
      etaMinutes: baselineTravel.etaMinutes + (hypothetical.addedTravelDelayMinutes || 0),
      currentBufferMinutes:
        baselineTravel.currentBufferMinutes - (hypothetical.addedTravelDelayMinutes || 0),
    };

    const tasks = await storage.getTasksByGoal(goalId);
    const teamMembers = await teamSimulator.getTeamMembers();

    const projectedRisk = riskEngine.evaluateRisk({
      goal,
      tasks,
      travel: simulatedTravel,
      teamMembers,
    });

    return {
      goalId,
      currentRiskLevel: currentRisk.riskLevel,
      currentRiskScore: currentRisk.riskScore,
      projectedRiskLevel: projectedRisk.riskLevel,
      projectedRiskScore: projectedRisk.riskScore,
      deltaScore: projectedRisk.riskScore - currentRisk.riskScore,
      impactSeverity: projectedRisk.riskScore > currentRisk.riskScore ? 'ESCALATED' : 'STABLE',
      projectedReasons: projectedRisk.reasons,
      recommendedMitigation: projectedRisk.recommendedActions,
    };
  }
}

export const riskService = new RiskService();
