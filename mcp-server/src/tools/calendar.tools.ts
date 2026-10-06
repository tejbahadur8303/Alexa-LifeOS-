import { z } from 'zod';
import { calendarSimulator } from '../adapters/simulation/calendar.simulator.js';

export const calendarTools = [
  {
    name: 'get_calendar_events',
    description: `Purpose: Returns upcoming schedule and calendar events for the user.
When to use: Call to check event deadlines, meeting venues, and scheduled pitch times.
Permission requirements: LOW risk (Read-only).`,
    parameters: z.object({
      userId: z.string().optional().describe('User ID to filter by'),
    }),
    handler: async (args: any) => {
      try {
        const events = await calendarSimulator.getEvents(args.userId || 'usr_alex_001');
        return { success: true, data: events };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'CALENDAR_ERROR', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_event_details',
    description: `Purpose: Retrieves detailed metadata for a specific calendar event.
When to use: Use when inspecting event location, start/end times, and importance.
Permission requirements: LOW risk.`,
    parameters: z.object({
      eventId: z.string().describe('ID of the event'),
    }),
    handler: async (args: any) => {
      try {
        const event = await calendarSimulator.getEventDetails(args.eventId);
        if (!event) {
          return { success: false, error: { code: 'EVENT_NOT_FOUND', message: 'Event not found', retryable: false } };
        }
        return { success: true, data: event };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'EVENT_DETAILS_ERROR', message: err.message, retryable: true },
        };
      }
    },
  },
];
