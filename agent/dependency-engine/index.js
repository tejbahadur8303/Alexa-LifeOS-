"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyEngine = exports.DependencyEngine = void 0;
class DependencyEngine {
    analyzeDependencies(tasks) {
        const taskMap = new Map();
        for (const t of tasks) {
            taskMap.set(t.id, t);
        }
        const blockers = [];
        const blockedTasks = [];
        const readyTasks = [];
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
            }
            else {
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
    calculateTaskImpact(taskId, tasks) {
        const downstream = [];
        for (const t of tasks) {
            if (t.dependencies.includes(taskId)) {
                downstream.push(t.id);
            }
        }
        const task = tasks.find((t) => t.id === taskId);
        const title = task ? task.title : taskId;
        return {
            impactedTaskIds: downstream,
            impactSummary: downstream.length > 0
                ? `Incomplete task "${title}" is directly blocking ${downstream.length} downstream task(s): ${downstream.join(', ')}.`
                : `Task "${title}" has no direct downstream dependencies.`,
        };
    }
}
exports.DependencyEngine = DependencyEngine;
exports.dependencyEngine = new DependencyEngine();
