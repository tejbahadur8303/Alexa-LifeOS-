import type { CalendarEvent } from '../../models/types.js';
import { storage } from '../../db/storage.js';

export interface CalendarProvider {
  getEvents(userId: string): Promise<CalendarEvent[]>;
  getEventDetails(eventId: string): Promise<CalendarEvent | null>;
  rescheduleEvent(eventId: string, newStartTime: string): Promise<CalendarEvent | null>;
  resetToNormal(): Promise<void>;
}

export class SimulatedCalendarProvider implements CalendarProvider {
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    const all = await storage.getEvents();
    return all.filter((e) => !userId || e.userId === userId);
  }

  async getEventDetails(eventId: string): Promise<CalendarEvent | null> {
    const all = await storage.getEvents();
    return all.find((e) => e.id === eventId) || null;
  }

  async rescheduleEvent(eventId: string, newStartTime: string): Promise<CalendarEvent | null> {
    const event = await this.getEventDetails(eventId);
    if (!event) return null;
    event.startTime = newStartTime;
    // Update end time assuming 9 hour duration
    const startMs = new Date(newStartTime).getTime();
    event.endTime = new Date(startMs + 9 * 3600 * 1000).toISOString();
    return event;
  }

  async resetToNormal(): Promise<void> {
    const event = await this.getEventDetails('evt_hackathon_001');
    if (event) {
      event.startTime = '2026-10-04T09:00:00.000Z';
      event.endTime = '2026-10-04T18:00:00.000Z';
    }
  }
}

export const calendarSimulator = new SimulatedCalendarProvider();
