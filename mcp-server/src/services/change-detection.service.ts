import { v4 as uuidv4 } from 'uuid';
import type { ContextSnapshot, ContextChange } from '../models/types.js';
import { storage } from '../db/storage.js';
import { travelSimulator } from '../adapters/simulation/travel.simulator.js';
import { weatherSimulator } from '../adapters/simulation/weather.simulator.js';
import { teamSimulator } from '../adapters/simulation/team.simulator.js';
import { changeDetector } from '../../../agent/change-detector/index.js';

export class ChangeDetectionService {
  async captureCurrentSnapshot(goalId: string): Promise<ContextSnapshot> {
    const goal = await storage.getGoal(goalId);
    const targetLoc = goal?.targetLocation || 'Demo Venue';

    const travel = await travelSimulator.getTravelStatus(goalId);
    const weather = await weatherSimulator.getCurrentWeather(targetLoc);
    const teamMembers = await teamSimulator.getTeamMembers();
    const tasks = await storage.getTasksByGoal(goalId);

    const snapshot: ContextSnapshot = {
      id: `snap_${uuidv4().slice(0, 8)}`,
      goalId,
      timestamp: new Date().toISOString(),
      travel,
      weather,
      team: {
        total: teamMembers.length,
        ready: teamMembers.filter((m) => m.status === 'ready').length,
        blocked: teamMembers.filter((m) => m.status === 'blocked').length,
      },
      tasks: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === 'complete').length,
        blocked: tasks.filter((t) => t.status === 'blocked').length,
      },
    };

    await storage.saveContextSnapshot(snapshot);
    return snapshot;
  }

  async detectContextChanges(goalId: string): Promise<{
    hasChanges: boolean;
    latestSnapshot: ContextSnapshot;
    previousSnapshot: ContextSnapshot | null;
    changes: ContextChange[];
  }> {
    const current = await this.captureCurrentSnapshot(goalId);
    const snapshots = await storage.getLatestSnapshots(2);
    // snapshots[0] is the current one we just saved, snapshots[1] is the previous one
    const previous = snapshots.length > 1 ? snapshots[1] : null;

    const changes = changeDetector.detectDifferences(previous, current);

    return {
      hasChanges: changes.length > 0 && changes[0].field !== 'baseline_initialized',
      latestSnapshot: current,
      previousSnapshot: previous,
      changes,
    };
  }
}

export const changeDetectionService = new ChangeDetectionService();
