import type { WeatherSnapshot } from '../../models/types.js';

export interface WeatherProvider {
  getCurrentWeather(location: string): Promise<WeatherSnapshot>;
  getWeatherForecast(location: string, timeIso: string): Promise<WeatherSnapshot>;
  injectAdverseWeather(condition?: string, rainProb?: number): Promise<WeatherSnapshot>;
  resetToNormal(): Promise<WeatherSnapshot>;
}

export class SimulatedWeatherProvider implements WeatherProvider {
  private current: WeatherSnapshot = {
    condition: 'Partly Cloudy',
    temperatureC: 21,
    rainProbabilityPercent: 10,
    windSpeedKmh: 12,
    advisory: null,
  };

  async getCurrentWeather(location: string): Promise<WeatherSnapshot> {
    return { ...this.current };
  }

  async getWeatherForecast(location: string, timeIso: string): Promise<WeatherSnapshot> {
    return { ...this.current };
  }

  async injectAdverseWeather(
    condition = 'Heavy Thunderstorm & Flash Rain',
    rainProb = 85
  ): Promise<WeatherSnapshot> {
    this.current = {
      condition,
      temperatureC: 16,
      rainProbabilityPercent: rainProb,
      windSpeedKmh: 42,
      advisory: 'Severe Weather Warning: Reduced visibility and road hydroplaning risks reported.',
    };
    return { ...this.current };
  }

  async resetToNormal(): Promise<WeatherSnapshot> {
    this.current = {
      condition: 'Partly Cloudy',
      temperatureC: 21,
      rainProbabilityPercent: 10,
      windSpeedKmh: 12,
      advisory: null,
    };
    return { ...this.current };
  }
}

export const weatherSimulator = new SimulatedWeatherProvider();
