import type { TravelSnapshot, ItineraryRoute } from '../../models/types.js';

export interface TravelProvider {
  getRoute(origin: string, destination: string, deadlineIso: string): Promise<ItineraryRoute>;
  getEta(origin: string, destination: string): Promise<number>;
  getTravelStatus(goalId?: string): Promise<TravelSnapshot>;
  findAlternativeRoute(goalId: string): Promise<ItineraryRoute>;
  injectTrafficDelay(delayMinutes: number): Promise<TravelSnapshot>;
  resetToNormal(): Promise<TravelSnapshot>;
}

export class SimulatedTravelProvider implements TravelProvider {
  private currentEtaMinutes = 45;
  private routeName = 'I-94 Highway Direct & Tech Expressway';
  private trafficStatus: 'normal' | 'moderate' | 'heavy' | 'severe' = 'normal';
  private departureTime = '2026-10-04T07:45:00.000Z'; // 7:45 AM
  private arrivalTime = '2026-10-04T08:30:00.000Z';   // 8:30 AM
  private deadlineTime = '2026-10-04T09:00:00.000Z';  // 9:00 AM

  async getRoute(origin: string, destination: string, deadlineIso: string): Promise<ItineraryRoute> {
    const deadline = new Date(deadlineIso || this.deadlineTime).getTime();
    const duration = this.currentEtaMinutes;
    const arrival = new Date(deadline - 30 * 60 * 1000); // 30 min buffer ideal
    const departure = new Date(arrival.getTime() - duration * 60 * 1000);

    return {
      id: 'route_primary_001',
      goalId: 'goal_hackathon_001',
      routeName: this.routeName,
      mode: 'driving',
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      durationMinutes: duration,
      bufferMinutes: Math.round((deadline - arrival.getTime()) / (60 * 1000)),
      steps: [
        'Depart 742 Evergreen Terrace via Highway 101 North',
        'Take Exit 42 toward Innovation Boulevard',
        'Turn right at Demo Avenue to Tech Campus Parking'
      ],
      isAlternative: false,
      isSelected: true,
    };
  }

  async getEta(origin: string, destination: string): Promise<number> {
    return this.currentEtaMinutes;
  }

  async getTravelStatus(goalId?: string): Promise<TravelSnapshot> {
    const deadlineMs = new Date(this.deadlineTime).getTime();
    const arrivalMs = new Date(this.arrivalTime).getTime();
    const currentBuffer = Math.round((deadlineMs - arrivalMs) / (60 * 1000));

    return {
      etaMinutes: this.currentEtaMinutes,
      departureTime: this.departureTime,
      arrivalTime: this.arrivalTime,
      currentBufferMinutes: currentBuffer,
      routeName: this.routeName,
      trafficStatus: this.trafficStatus,
      distanceKm: 28.4,
    };
  }

  async findAlternativeRoute(goalId: string): Promise<ItineraryRoute> {
    // Alternative transit corridor unaffected by highway congestion
    // Arrives at 8:32 AM (28 minute buffer before 9:00 AM deadline)
    return {
      id: 'route_alt_express_002',
      goalId,
      routeName: 'Blue Line Metro + Innovation Express Shuttle (Dedicated Transitway)',
      mode: 'express_rail',
      departureTime: '2026-10-04T07:40:00.000Z',
      arrivalTime: '2026-10-04T08:32:00.000Z',
      durationMinutes: 52,
      bufferMinutes: 28,
      steps: [
        'Depart at 7:40 AM from North Station on Metro Line 2 (Dedicated rail, 0 traffic risk)',
        'Arrive at Tech Center Station at 8:16 AM',
        'Board Priority Event Shuttle at Gate 3 at 8:22 AM',
        'Drop-off directly at Innovation Hall 4 main entrance at 8:32 AM'
      ],
      isAlternative: true,
      isSelected: false,
    };
  }

  async injectTrafficDelay(delayMinutes = 33): Promise<TravelSnapshot> {
    this.currentEtaMinutes = 45 + delayMinutes; // 78 minutes
    this.trafficStatus = 'severe';
    this.routeName = 'I-94 Highway (Severe Congestion - Accident near Exit 14)';
    // If departure is at 7:37 AM, arrival becomes 8:55 AM (leaving only 5 minutes buffer before 9:00 AM!)
    this.departureTime = '2026-10-04T07:37:00.000Z';
    this.arrivalTime = '2026-10-04T08:55:00.000Z';

    return this.getTravelStatus();
  }

  async applyAlternativeRoute(route: ItineraryRoute): Promise<TravelSnapshot> {
    this.currentEtaMinutes = route.durationMinutes;
    this.trafficStatus = 'normal';
    this.routeName = route.routeName;
    this.departureTime = route.departureTime;
    this.arrivalTime = route.arrivalTime;

    return this.getTravelStatus();
  }

  async resetToNormal(): Promise<TravelSnapshot> {
    this.currentEtaMinutes = 45;
    this.trafficStatus = 'normal';
    this.routeName = 'I-94 Highway Direct & Tech Expressway';
    this.departureTime = '2026-10-04T07:45:00.000Z';
    this.arrivalTime = '2026-10-04T08:30:00.000Z';
    return this.getTravelStatus();
  }
}

export const travelSimulator = new SimulatedTravelProvider();
