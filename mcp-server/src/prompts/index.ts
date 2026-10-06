import { planningPrompts } from './planning.prompts.js';
import { riskPrompts } from './risk.prompts.js';
import { briefingPrompts } from './briefing.prompts.js';

export const allPrompts = [
  ...planningPrompts,
  ...riskPrompts,
  ...briefingPrompts,
];
