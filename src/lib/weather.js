import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';

function buildSummary(place, forecast, fetchedAt) {
  const daily = forecast.daily;

  return {
    location: {
      name: place.name,
      region: place.region,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    },
    current: {
      time: forecast.current.time,
      temperatureC: forecast.current.temperature_2m,
      feelsLikeC: forecast.current.apparent_temperature,
      humidityPercent: forecast.current.relative_humidity_2m,
      windKmh: forecast.current.wind_speed_10m,
      weatherCode: forecast.current.weather_code,
      conditions: describeWeatherCode(forecast.current.weather_code),
    },
    daily: daily.time.map((date, i) => ({
      date,
      minC: daily.temperature_2m_min[i],
      maxC: daily.temperature_2m_max[i],
      precipitationChancePercent: daily.precipitation_probability_max[i] ?? null,
      weatherCode: daily.weather_code[i],
      conditions: describeWeatherCode(daily.weather_code[i]),
    })),
    fetchedAt,
    cached: false,
  };
}
// TODO (you): return the cache statistics for GET /api/cache/stats.
export async function getCityWeather(city) {
  const fetchedAt = new Date().toISOString();
  const place = await geocodeCity(city);
  const forecast = await getForecast(place.latitude, place.longitude);
  return buildSummary(place, forecast, fetchedAt);
}
export function getCacheStats() {
  throw new Error('getCacheStats is not written yet');
}
