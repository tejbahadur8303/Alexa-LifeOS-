import { z } from 'zod';
import { travelSimulator } from '../adapters/simulation/travel.simulator.js';

export const travelTools = [
  {
    name: 'get_route',
    description: `Purpose: Calculates turn-by-turn route, transit steps, and estimated duration for a destination.
When to use: Use when planning travel itinerary to an event venue.
Permission requirements: LOW risk.`,
    parameters: z.object({
      origin: z.string().describe('Origin location address'),
      destination: z.string().describe('Destination venue'),
      deadline: z.string().describe('Target arrival deadline (ISO 8601)'),
    }),
    handler: async (args: any) => {
      try {
        const route = await travelSimulator.getRoute(args.origin, args.destination, args.deadline);
        return { success: true, data: route };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'ROUTE_CALCULATION_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_eta',
    description: `Purpose: Calculates estimated travel time in minutes between two points under current traffic conditions.
When to use: Call to quickly verify driving or transit duration.
Permission requirements: LOW risk.`,
    parameters: z.object({
      origin: z.string(),
      destination: z.string(),
    }),
    handler: async (args: any) => {
      try {
        const eta = await travelSimulator.getEta(args.origin, args.destination);
        return { success: true, data: { etaMinutes: eta } };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'ETA_UNAVAILABLE', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_travel_status',
    description: `Purpose: Returns the active trip status, departure time, arrival time, traffic severity, and arrival buffer minutes.
When to use: Crucial tool called whenever checking if traffic conditions threaten an active goal's arrival deadline.
Permission requirements: LOW risk.`,
    parameters: z.object({
      goalId: z.string().optional().describe('Goal ID associated with the trip'),
    }),
    handler: async (args: any) => {
      try {
        const status = await travelSimulator.getTravelStatus(args.goalId);
        return { success: true, data: status };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'TRAVEL_STATUS_ERROR', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'find_alternative_route',
    description: `Purpose: Discovers uncongested alternative routes (e.g. dedicated Express Rail/Metro corridor) when the primary route is delayed.
When to use: Call immediately when traffic increases and arrival buffer drops below the safety threshold.
Permission requirements: LOW risk (Finding alternative; applying alternative requires approval).`,
    parameters: z.object({
      goalId: z.string().describe('Active Goal ID'),
    }),
    handler: async (args: any) => {
      try {
        const alt = await travelSimulator.findAlternativeRoute(args.goalId);
        return { success: true, data: alt };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'ALT_ROUTE_SEARCH_FAILED', message: err.message, retryable: true },
        };
      }
    },
  },
];
