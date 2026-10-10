import { config } from '../config.js';
import { HttpError } from './http-error.js';

// This is the only file that calls fetch or knows Open-Meteo's URLs.
// The exact requests are on the assignment page.

// TODO (you): write a helper that fetches a URL and returns the parsed JSON.
async function fetchJson(url, serviceName) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });

//   - fetch resolves for every HTTP status, so check res.ok yourself.
if (!res.ok) {
  throw new HttpError(
    502,
    `The ${serviceName} service answered with status ${res.status}`
  );
}
//   - Turn every failure into an HttpError: 504 when the timeout fired
//     (err.name is 'TimeoutError'), 502 for a network failure, a status that
//     isn't ok, or a body that isn't JSON.
return await res.json();
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    if (err.name === 'TimeoutError') {
      throw new HttpError(
        504,
        `The ${serviceName} service did not respond within ${config.upstreamTimeoutMs} ms`
      );
    }
    throw new HttpError(
      502,
      `Could not get a valid response from the ${serviceName} service`
    );
  }
}
// TODO (you): look up a city with the geocoding API and return
// { name, region, country, latitude, longitude, timezone } for the first result.
export async function geocodeCity(name) {
  const params = new URLSearchParams({
    name,
    count: '1',
    language: 'en',
    format: 'json',
  });
  const data = await fetchJson(
    `${config.geocodingUrl}/search?${params}`,
    'geocoding'
  );

// Throw a 404 HttpError when there are no results.
if (!data?.results || data.results.length === 0) {
  throw new HttpError(404, `City not found: ${name}`);
}
const first = data.results[0];
  return {
    name: first.name,
    region: first.admin1 ?? null,
    country: first.country ?? null,
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone,
  };
}
// TODO (you): get the current weather and a 3-day daily forecast from the
// forecast API and return the parsed response.
export async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '3',
  });
  const data = await fetchJson(
    `${config.forecastUrl}/forecast?${params}`,
    'forecast'
  );

  if (!data?.current || !data?.daily) {
    throw new HttpError(
      502,
      'Could not get a valid response from the forecast service'
    );
  }

  return data;
}
