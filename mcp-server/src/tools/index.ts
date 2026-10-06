import { goalTools } from './goal.tools.js';
import { taskTools } from './task.tools.js';
import { calendarTools } from './calendar.tools.js';
import { travelTools } from './travel.tools.js';
import { weatherTools } from './weather.tools.js';
import { riskTools } from './risk.tools.js';
import { planningTools } from './planning.tools.js';
import { communicationTools } from './communication.tools.js';
import { memoryTools } from './memory.tools.js';
import { approvalTools } from './approval.tools.js';

export const allTools = [
  ...goalTools,
  ...taskTools,
  ...calendarTools,
  ...travelTools,
  ...weatherTools,
  ...riskTools,
  ...planningTools,
  ...communicationTools,
  ...memoryTools,
  ...approvalTools,
];
