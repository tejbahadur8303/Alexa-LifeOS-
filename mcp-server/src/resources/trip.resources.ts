import { travelSimulator } from '../adapters/simulation/travel.simulator.js';
import { goalService } from '../services/goal.service.js';

export const tripResources = [
  {
    uri: 'mcp://guardian/trip/current',
    name: 'Current Trip and Route Status',
    mimeType: 'application/json',
    description: 'Current departure time, ETA, buffer minutes, traffic conditions, and active route.',
    handler: async () => {
      const activeGoal = await goalService.getActiveGoal();
      return travelSimulator.getTravelStatus(activeGoal ? activeGoal.id : 'goal_hackathon_001');
    },
  },
];
