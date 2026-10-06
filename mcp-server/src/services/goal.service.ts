import { v4 as uuidv4 } from 'uuid';
import type { Goal, GoalStatus } from '../models/types.js';
import { storage } from '../db/storage.js';
import { travelSimulator } from '../adapters/simulation/travel.simulator.js';
import { teamSimulator } from '../adapters/simulation/team.simulator.js';
import { riskEngine } from '../../../agent/risk-engine/index.js';
import { goalEngine } from '../../../agent/goal-engine/index.js';

export class GoalService {
  async getGoal(goalId: string): Promise<Goal | null> {
    return storage.getGoal(goalId);
  }

  async getAllGoals(): Promise<Goal[]> {
    return storage.getAllGoals();
  }

  async getActiveGoal(): Promise<Goal | null> {
    const goals = await storage.getAllGoals();
    return (
      goals.find((g) => g.status === 'active' || g.status === 'at_risk' || g.status === 'blocked') ||
      goals[0] ||
      null
    );
  }

  async createGoal(data: {
    userId?: string;
    title: string;
    description: string;
    deadline: string;
    targetLocation?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    successCriteria?: string[];
  }): Promise<Goal> {
    const goal: Goal = {
      id: `goal_${uuidv4().slice(0, 8)}`,
      userId: data.userId || 'usr_alex_001',
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      targetLocation: data.targetLocation || 'Demo Venue',
      priority: data.priority || 'high',
      status: 'active',
      successCriteria: data.successCriteria || [
        'arrive_before_deadline',
        'presentation_ready',
        'demo_ready',
        'team_ready',
      ],
      progress: 0,
      nextAction: 'Initialize context monitoring and task schedule',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveGoal(goal);
    return goal;
  }

  async updateGoal(
    goalId: string,
    updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Goal | null> {
    const goal = await storage.getGoal(goalId);
    if (!goal) return null;

    Object.assign(goal, updates, { updatedAt: new Date().toISOString() });
    return storage.saveGoal(goal);
  }

  async setGoalStatus(goalId: string, status: GoalStatus): Promise<Goal | null> {
    return this.updateGoal(goalId, { status });
  }

  async getGoalStatus(goalId: string) {
    const goal = await storage.getGoal(goalId);
    if (!goal) return null;

    const tasks = await storage.getTasksByGoal(goalId);
    const travel = await travelSimulator.getTravelStatus(goalId);
    const teamMembers = await teamSimulator.getTeamMembers();
    const risk = (await storage.getLatestRisk(goalId)) || riskEngine.evaluateRisk({
      goal,
      tasks,
      travel,
      teamMembers,
    });

    const health = goalEngine.evaluateGoal(goal, tasks, travel, teamMembers, risk);

    return {
      goal,
      health,
      risk,
      travel,
      tasks: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === 'complete').length,
        blocked: tasks.filter((t) => t.status === 'blocked').length,
        items: tasks,
      },
      team: {
        total: teamMembers.length,
        ready: teamMembers.filter((m) => m.status === 'ready').length,
        members: teamMembers,
      },
    };
  }
}

export const goalService = new GoalService();
