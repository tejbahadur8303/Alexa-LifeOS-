import { z } from 'zod';
import { goalService } from '../services/goal.service.js';

export const goalTools = [
  {
    name: 'create_goal',
    description: `Purpose: Creates a new monitored high-level goal in LifeOS Guardian with success criteria and deadline.
When to use: Use when the user states a new objective to achieve and protect (e.g. "Alexa, make sure I reach my hackathon tomorrow by 9 AM").
Permission requirements: LOW risk (Creation of internal tracking goal).
Side effects: Stores new goal entity and initializes continuous monitoring.`,
    parameters: z.object({
      title: z.string().describe('Title of the goal, e.g. "Attend Hackathon"'),
      description: z.string().describe('Detailed statement of the user objective'),
      deadline: z.string().describe('ISO 8601 deadline timestamp, e.g. "2026-10-04T09:00:00.000Z"'),
      targetLocation: z.string().optional().describe('Physical destination or venue'),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('Goal priority'),
      successCriteria: z.array(z.string()).optional().describe('Checklist of criteria to verify completion'),
    }),
    handler: async (args: any) => {
      try {
        const goal = await goalService.createGoal(args);
        return {
          success: true,
          data: goal,
        };
      } catch (err: any) {
        return {
          success: false,
          error: {
            code: 'GOAL_CREATION_FAILED',
            message: err.message || 'Failed to create goal',
            retryable: false,
          },
        };
      }
    },
  },
  {
    name: 'get_goal_status',
    description: `Purpose: Retrieves current goal status, health score (0-100%), verified success criteria, risks, and travel conditions.
When to use: Call whenever evaluating whether the active goal is on track, at risk, or blocked.
Permission requirements: LOW risk (Read-only query).`,
    parameters: z.object({
      goalId: z.string().describe('Unique ID of the goal, e.g. "goal_hackathon_001"'),
    }),
    handler: async (args: any) => {
      try {
        const status = await goalService.getGoalStatus(args.goalId);
        if (!status) {
          return {
            success: false,
            error: {
              code: 'GOAL_NOT_FOUND',
              message: `Goal with ID "${args.goalId}" does not exist`,
              retryable: false,
            },
          };
        }
        return {
          success: true,
          data: status,
        };
      } catch (err: any) {
        return {
          success: false,
          error: {
            code: 'GOAL_STATUS_ERROR',
            message: err.message || 'Failed to fetch goal status',
            retryable: true,
          },
        };
      }
    },
  },
  {
    name: 'update_goal',
    description: `Purpose: Updates properties of an existing goal such as deadline, priority, or next action.
When to use: Use when replanning or adapting to changed user constraints.
Permission requirements: MEDIUM risk (Modifies active plan).`,
    parameters: z.object({
      goalId: z.string().describe('Unique ID of the goal'),
      title: z.string().optional(),
      description: z.string().optional(),
      deadline: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      status: z.enum(['draft', 'active', 'at_risk', 'blocked', 'completed', 'failed', 'cancelled']).optional(),
      nextAction: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        const { goalId, ...updates } = args;
        const updated = await goalService.updateGoal(goalId, updates);
        if (!updated) {
          return {
            success: false,
            error: { code: 'GOAL_NOT_FOUND', message: 'Goal not found', retryable: false },
          };
        }
        return { success: true, data: updated };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'UPDATE_GOAL_FAILED', message: err.message, retryable: false },
        };
      }
    },
  },
  {
    name: 'complete_goal',
    description: `Purpose: Marks an active goal as completed after verifying all success criteria.
When to use: Use when all tasks, arrivals, and conditions have been met.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string().describe('Unique ID of the goal to complete'),
    }),
    handler: async (args: any) => {
      try {
        const updated = await goalService.setGoalStatus(args.goalId, 'completed');
        return { success: true, data: updated };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'COMPLETE_GOAL_FAILED', message: err.message, retryable: false },
        };
      }
    },
  },
];
