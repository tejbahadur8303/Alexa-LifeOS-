import { z } from 'zod';
import { planningService } from '../services/planning.service.js';
import { goalService } from '../services/goal.service.js';

export const planningTools = [
  {
    name: 'replan_goal',
    description: `Purpose: Re-evaluates an active goal under changed conditions and generates protective action proposals (e.g. switching route, alerting teammates).
When to use: Call automatically whenever risk escalates to HIGH/CRITICAL or when a disruption occurs.
Permission requirements: MEDIUM risk (Generates action approval requests).`,
    parameters: z.object({
      goalId: z.string().describe('ID of goal requiring replanning'),
    }),
    handler: async (args: any) => {
      try {
        const result = await planningService.replanGoal(args.goalId);
        return { success: true, data: result };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'REPLANNING_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'generate_next_actions',
    description: `Purpose: Analyzes the current goal status and recommends prioritized next actions to maintain deadline protection.
When to use: Use when the user asks "What should I do next?" or during periodic check-ins.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string(),
    }),
    handler: async (args: any) => {
      try {
        const status = await goalService.getGoalStatus(args.goalId);
        if (!status) {
          return { success: false, error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found', retryable: false } };
        }
        return {
          success: true,
          data: {
            goalId: args.goalId,
            status: status.goal.status,
            recommendedActions: status.risk.recommendedActions,
            nextAction: status.goal.nextAction,
          },
        };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'NEXT_ACTIONS_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'generate_daily_briefing',
    description: `Purpose: Synthesizes a daily operational briefing covering active goals, schedule, travel conditions, risks, and pending approvals.
When to use: Call when the user requests "Alexa, brief me" or at the start of the day.
Permission requirements: LOW risk.`,
    parameters: z.object({
      userId: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        const briefing = await planningService.generateDailyBriefing(args.userId);
        return { success: true, data: briefing };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'BRIEFING_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
];
