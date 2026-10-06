import type { Task } from '../../mcp-server/src/models/types.js';

export interface BlockerInfo {
  taskId: string;
  taskTitle: string;
  assignee: string;
  blockedByTaskId: string;
  blockedByTitle: string;
  blockedByAssignee: string;
  reason: string;
}

export interface DependencyAnalysis {
  hasCycles: boolean;
  blockedTasks: Task[];
  blockers: BlockerInfo[];
  readyTasks: Task[];
  criticalPath: Task[];
}

export class DependencyEngine {
  analyzeDependencies(tasks: Task[]): DependencyAnalysis {
    const taskMap = new Map<string, Task>();
    for (const t of tasks) {
      taskMap.set(t.id, t);
    }

    const blockers: BlockerInfo[] = [];
    const blockedTasks: Task[] = [];
    const readyTasks: Task[] = [];

    for (const t of tasks) {
      if (t.status === 'complete') {
        continue;
      }

      let isBlocked = false;
      for (const depId of t.dependencies) {
        const depTask = taskMap.get(depId);
        if (depTask && depTask.status !== 'complete') {
          isBlocked = true;
          blockers.push({
            taskId: t.id,
            taskTitle: t.title,
            assignee: t.assignee,
            blockedByTaskId: depTask.id,
            blockedByTitle: depTask.title,
            blockedByAssignee: depTask.assignee,
            reason: `Prerequisite "${depTask.title}" assigned to ${depTask.assignee} is ${depTask.status}.`,
          });
        }
      }

      if (isBlocked || t.status === 'blocked') {
        blockedTasks.push(t);
      } else {
        readyTasks.push(t);
      }
    }

    const criticalPath = tasks.filter((t) => t.isCritical);

    return {
      hasCycles: false,
      blockedTasks,
      blockers,
      readyTasks,
      criticalPath,
    };
  }

  calculateTaskImpact(taskId: string, tasks: Task[]): {
    impactedTaskIds: string[];
    impactSummary: string;
  } {
    const downstream: string[] = [];
    for (const t of tasks) {
      if (t.dependencies.includes(taskId)) {
        downstream.push(t.id);
      }
    }

    const task = tasks.find((t) => t.id === taskId);
    const title = task ? task.title : taskId;

    return {
      impactedTaskIds: downstream,
      impactSummary:
        downstream.length > 0
          ? `Incomplete task "${title}" is directly blocking ${downstream.length} downstream task(s): ${downstream.join(', ')}.`
          : `Task "${title}" has no direct downstream dependencies.`,
    };
  }
}

export const dependencyEngine = new DependencyEngine();
