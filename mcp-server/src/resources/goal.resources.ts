import { storage } from '../db/storage.js';
import { goalService } from '../services/goal.service.js';

export const goalResources = [
  {
    uri: 'mcp://guardian/goals/active',
    name: 'Active Goal Overview',
    mimeType: 'application/json',
    description: 'Currently active protected goal, progress, deadline, and health status.',
    handler: async () => {
      const activeGoal = await goalService.getActiveGoal();
      if (!activeGoal) return { status: 'none_active' };
      return goalService.getGoalStatus(activeGoal.id);
    },
  },
  {
    uriPattern: /^mcp:\/\/guardian\/goals\/([a-zA-Z0-9_-]+)$/,
    name: 'Goal Detail by ID',
    mimeType: 'application/json',
    description: 'Detailed goal data and criteria for a specific goal ID.',
    handler: async (uri: string) => {
      const match = uri.match(/^mcp:\/\/guardian\/goals\/([a-zA-Z0-9_-]+)$/);
      if (!match) throw new Error('Invalid URI pattern');
      const goalId = match[1];
      return goalService.getGoalStatus(goalId);
    },
  },
];
