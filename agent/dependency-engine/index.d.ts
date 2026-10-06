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
export declare class DependencyEngine {
    analyzeDependencies(tasks: Task[]): DependencyAnalysis;
    calculateTaskImpact(taskId: string, tasks: Task[]): {
        impactedTaskIds: string[];
        impactSummary: string;
    };
}
export declare const dependencyEngine: DependencyEngine;
