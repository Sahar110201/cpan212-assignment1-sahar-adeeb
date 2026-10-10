import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { TtlCache } from './cache.js';

// One cache for the whole app.
const cache = new TtlCache(config.cacheTtlSeconds);
let hits = 0;
let misses = 0;

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

// Return the weather summary for one city (from the cache when possible).
export async function getCityWeather(city) {
  const key = city.trim().toLowerCase();

  const stored = cache.get(key);
  if (stored) {
    hits += 1;
    return { ...stored, cached: true };
  }

  // Anything that isn't a valid cached answer is a miss, even if the lookup
  // fails below.
  misses += 1;

  const fetchedAt = new Date().toISOString();
  const place = await geocodeCity(city);
  const forecast = await getForecast(place.latitude, place.longitude);
  const summary = buildSummary(place, forecast, fetchedAt);

  // Only successful lookups reach this line, so failures are never cached.
  cache.set(key, summary);
  return summary;
}

// The numbers for GET /api/cache/stats.
export function getCacheStats() {
  return {
    entries: cache.size(),
    hits,
    misses,
    ttlSeconds: config.cacheTtlSeconds,
  };
}
