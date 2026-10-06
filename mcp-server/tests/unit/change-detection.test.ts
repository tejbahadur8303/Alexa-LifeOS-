import { describe, it, expect } from 'vitest';
import { changeDetector } from '../../../agent/change-detector/index.js';
import type { ContextSnapshot } from '../../src/models/types.js';

describe('What-Changed Engine (Change Detector)', () => {
  const previousSnapshot: ContextSnapshot = {
    id: 'snap_prev',
    goalId: 'goal_001',
    timestamp: '2026-10-03T10:00:00.000Z',
    travel: {
      etaMinutes: 45,
      departureTime: '',
      arrivalTime: '2026-10-04T08:30:00.000Z',
      currentBufferMinutes: 30,
      routeName: 'Highway 101',
      trafficStatus: 'normal',
      distanceKm: 25,
    },
    weather: {
      condition: 'Partly Cloudy',
      temperatureC: 21,
      rainProbabilityPercent: 10,
      windSpeedKmh: 12,
      advisory: null,
    },
    team: { total: 3, ready: 2, blocked: 0 },
    tasks: { total: 4, completed: 2, blocked: 1 },
  };

  const currentSnapshot: ContextSnapshot = {
    ...previousSnapshot,
    id: 'snap_curr',
    timestamp: '2026-10-03T10:15:00.000Z',
    travel: {
      ...previousSnapshot.travel,
      etaMinutes: 78,
      arrivalTime: '2026-10-04T08:55:00.000Z',
      currentBufferMinutes: 5,
      trafficStatus: 'severe',
    },
  };

  it('detects travel delta and flags HIGH impact when buffer drops below 15m', () => {
    const changes = changeDetector.detectDifferences(previousSnapshot, currentSnapshot);
    expect(changes.length).toBeGreaterThan(0);

    const travelChange = changes.find((c) => c.category === 'travel');
    expect(travelChange).toBeDefined();
    expect(travelChange?.deltaSummary).toContain('Travel ETA changed from 45m to 78m (+33m)');
    expect(travelChange?.impactLevel).toBe('HIGH');
    expect(travelChange?.recommendedAction).toContain('alternative');
  });
});
