import { z } from 'zod';
import { taskService } from '../services/task.service.js';

export const taskTools = [
  {
    name: 'create_task',
    description: `Purpose: Creates a task linked to a goal with assignees, critical flags, and dependencies.
When to use: Use when decomposing a goal into actionable milestones.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string().describe('ID of parent goal'),
      title: z.string().describe('Title of the task'),
      description: z.string().describe('Task details'),
      assignee: z.string().describe('Team member responsible, e.g. "Rahul" or "Alex"'),
      isCritical: z.boolean().optional().describe('Whether failure blocks the overall goal'),
      deadline: z.string().optional().describe('ISO 8601 task deadline'),
      dependencies: z.array(z.string()).optional().describe('Array of prerequisite task IDs'),
    }),
    handler: async (args: any) => {
      try {
        const task = await taskService.createTask(args);
        return { success: true, data: task };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'CREATE_TASK_FAILED', message: err.message, retryable: false },
        };
      }
    },
  },
  {
    name: 'update_task',
    description: `Purpose: Updates a task status ('incomplete' | 'in_progress' | 'complete' | 'blocked') and details.
When to use: Use when a teammate completes work or reports a blocker.
Permission requirements: MEDIUM risk.`,
    parameters: z.object({
      taskId: z.string().describe('Task ID to update'),
      status: z.enum(['incomplete', 'in_progress', 'complete', 'blocked']).optional(),
      blockedReason: z.string().optional(),
    }),
    handler: async (args: any) => {
      try {
        const { taskId, ...updates } = args;
        const task = await taskService.updateTask(taskId, updates);
        if (!task) {
          return { success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found', retryable: false } };
        }
        return { success: true, data: task };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'UPDATE_TASK_FAILED', message: err.message, retryable: false },
        };
      }
    },
  },
  {
    name: 'get_tasks',
    description: `Purpose: Lists all tasks associated with a goal including their completion and dependency state.
When to use: Call to inspect the work plan and current progress.
Permission requirements: LOW risk (Read-only).`,
    parameters: z.object({
      goalId: z.string().describe('Goal ID'),
    }),
    handler: async (args: any) => {
      try {
        const tasks = await taskService.getTasks(args.goalId);
        return { success: true, data: tasks };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'GET_TASKS_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_task_dependencies',
    description: `Purpose: Analyzes task dependency chains, checks for circular dependencies, and identifies critical paths.
When to use: Use when determining the order of execution or analyzing why a goal is stalled.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string().describe('Goal ID'),
    }),
    handler: async (args: any) => {
      try {
        const analysis = await taskService.getTaskDependencies(args.goalId);
        return { success: true, data: analysis };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'DEPENDENCY_ANALYSIS_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_blockers',
    description: `Purpose: Specifically returns only the blocked tasks and the root prerequisite causes preventing their progress.
When to use: Use when diagnosing workflow bottlenecks or explaining why demo testing cannot start.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string().describe('Goal ID'),
    }),
    handler: async (args: any) => {
      try {
        const blockers = await taskService.getBlockers(args.goalId);
        return { success: true, data: blockers };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'GET_BLOCKERS_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
];
