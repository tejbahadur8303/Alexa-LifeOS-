import { changeDetectionService } from '../services/change-detection.service.js';
import { goalService } from '../services/goal.service.js';

export const contextResources = [
  {
    uri: 'mcp://guardian/context/current',
    name: 'Current Context Snapshot',
    mimeType: 'application/json',
    description: 'Latest captured environmental context snapshot including travel, weather, team, and tasks.',
    handler: async () => {
      const activeGoal = await goalService.getActiveGoal();
      const goalId = activeGoal ? activeGoal.id : 'goal_hackathon_001';
      return changeDetectionService.captureCurrentSnapshot(goalId);
    },
  },
  {
    uri: 'mcp://guardian/context/changes',
    name: 'Context Changes (What Changed)',
    mimeType: 'application/json',
    description: 'Differences and deltas between previous and current operational contexts.',
    handler: async () => {
      const activeGoal = await goalService.getActiveGoal();
      const goalId = activeGoal ? activeGoal.id : 'goal_hackathon_001';
      return changeDetectionService.detectContextChanges(goalId);
    },
  },
];
