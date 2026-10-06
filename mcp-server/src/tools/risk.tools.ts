import { z } from 'zod';
import { riskService } from '../services/risk.service.js';
import { changeDetectionService } from '../services/change-detection.service.js';

export const riskTools = [
  {
    name: 'analyze_goal_risk',
    description: `Purpose: Executes deterministic risk evaluation for an active goal combining deadline proximity, travel buffer, critical tasks, blockers, weather, and team readiness.
When to use: Call periodically or after external events to evaluate whether the goal is SAFE, MEDIUM risk, HIGH risk, or CRITICAL.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string().describe('ID of goal to evaluate'),
    }),
    handler: async (args: any) => {
      try {
        const risk = await riskService.analyzeGoalRisk(args.goalId);
        return { success: true, data: risk };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'RISK_ANALYSIS_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'detect_context_changes',
    description: `Purpose: Compares the current context snapshot against the previous state to detect differences in travel ETA, weather, task completion, and team readiness.
When to use: Call whenever the user asks "What changed?" or when investigating why risk escalated.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string().describe('Goal ID to inspect'),
    }),
    handler: async (args: any) => {
      try {
        const result = await changeDetectionService.detectContextChanges(args.goalId);
        return { success: true, data: result };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'CHANGE_DETECTION_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'calculate_goal_impact',
    description: `Purpose: Simulates hypothetical disruptions (such as +30 min traffic delay or bad weather) to forecast projected risk and arrival buffer impact.
When to use: Use to pre-evaluate potential risks before they materialize.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string(),
      addedTravelDelayMinutes: z.number().optional(),
      weatherSeverity: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        const impact = await riskService.calculateGoalImpact(args.goalId, {
          addedTravelDelayMinutes: args.addedTravelDelayMinutes,
          weatherSeverity: args.weatherSeverity,
        });
        return { success: true, data: impact };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'IMPACT_CALCULATION_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
];
