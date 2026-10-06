import { userResources } from './user.resources.js';
import { goalResources } from './goal.resources.js';
import { contextResources } from './context.resources.js';
import { tripResources } from './trip.resources.js';
import { riskResources } from './risk.resources.js';

export const allResources = [
  ...userResources,
  ...goalResources,
  ...contextResources,
  ...tripResources,
  ...riskResources,
];
