import { z } from 'zod';
import { weatherSimulator } from '../adapters/simulation/weather.simulator.js';

export const weatherTools = [
  {
    name: 'get_weather',
    description: `Purpose: Returns current local weather conditions, temperature, rain probability, and advisories for a location.
When to use: Use when determining if adverse weather poses a risk to outdoor travel or commuting.
Permission requirements: LOW risk.`,
    parameters: z.object({
      location: z.string().describe('Target location or city name'),
    }),
    handler: async (args: any) => {
      try {
        const weather = await weatherSimulator.getCurrentWeather(args.location);
        return { success: true, data: weather };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'WEATHER_SERVICE_ERROR', message: err.message, retryable: true },
        };
      }
    },
  },
  {
    name: 'get_weather_forecast',
    description: `Purpose: Provides hourly weather forecast for a future timestamp.
When to use: Call to forecast tomorrow morning's commuting conditions during the target arrival window.
Permission requirements: LOW risk.`,
    parameters: z.object({
      location: z.string(),
      time: z.string().describe('ISO 8601 target time'),
    }),
    handler: async (args: any) => {
      try {
        const forecast = await weatherSimulator.getWeatherForecast(args.location, args.time);
        return { success: true, data: forecast };
      } catch (err: any) {
        return {
          success: false,
          error: { code: 'FORECAST_UNAVAILABLE', message: err.message, retryable: true },
        };
      }
    },
  },
];
