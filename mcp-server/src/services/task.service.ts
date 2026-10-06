import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskStatus } from '../models/types.js';
import { storage } from '../db/storage.js';
import { dependencyEngine } from '../../../agent/dependency-engine/index.js';

export class TaskService {
  async getTasks(goalId: string): Promise<Task[]> {
    return storage.getTasksByGoal(goalId);
  }

  async getTask(taskId: string): Promise<Task | null> {
    return storage.getTask(taskId);
  }

  async createTask(data: {
    goalId: string;
    title: string;
    description: string;
    assignee: string;
    isCritical?: boolean;
    deadline?: string;
    dependencies?: string[];
  }): Promise<Task> {
    const task: Task = {
      id: `task_${uuidv4().slice(0, 8)}`,
      goalId: data.goalId,
      title: data.title,
      description: data.description,
      assignee: data.assignee,
      status: 'incomplete',
      isCritical: data.isCritical ?? false,
      deadline: data.deadline,
      dependencies: data.dependencies || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTask(task);
    return task;
  }

  async updateTask(
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'goalId' | 'createdAt'>>
  ): Promise<Task | null> {
    const task = await storage.getTask(taskId);
    if (!task) return null;

    Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    await storage.saveTask(task);
    return task;
  }

  async getTaskDependencies(goalId: string) {
    const tasks = await storage.getTasksByGoal(goalId);
    return dependencyEngine.analyzeDependencies(tasks);
  }

  async getBlockers(goalId: string) {
    const analysis = await this.getTaskDependencies(goalId);
    return {
      blockedTasksCount: analysis.blockedTasks.length,
      blockedTasks: analysis.blockedTasks,
      blockers: analysis.blockers,
    };
  }

  async calculateTaskImpact(taskId: string, goalId: string) {
    const tasks = await storage.getTasksByGoal(goalId);
    return dependencyEngine.calculateTaskImpact(taskId, tasks);
  }
}

export const taskService = new TaskService();
