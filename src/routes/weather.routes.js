import { Router } from 'express';
import { HttpError } from '../lib/http-error.js';
import { parseCity, parseCities } from '../validators/weather-query.js';
import { getCityWeather } from '../lib/weather.js';

export const weatherRouter = Router();

const ATTRIBUTION = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';

// GET /api/weather?city=Toronto
weatherRouter.get('/weather', async (req, res) => {
  const city = parseCity(req.query.city);
  const data = await getCityWeather(city);
  res.json({ data, attribution: ATTRIBUTION });
});

// GET /api/compare?cities=Toronto,Vancouver,Halifax
weatherRouter.get('/compare', async (req, res) => {
  const names = parseCities(req.query.cities);

  // Start every lookup at the same time. allSettled never rejects, so one
  // failing city can't throw away the others.
  const results = await Promise.allSettled(
    names.map((name) => getCityWeather(name))
  );

  // Results come back in the same order as the names we asked for.
  const cities = results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return { city: names[i], ok: true, weather: result.value };
    }

    const err = result.reason;
    if (err instanceof HttpError) {
      return {
        city: names[i],
        ok: false,
        error: { status: err.status, message: err.message },
      };
    }

    // An unplanned error: log it, but don't leak its message to the client.
    console.error(err);
    return {
      city: names[i],
      ok: false,
      error: { status: 500, message: 'Internal server error' },
    };
  });

  // Warmest and coldest: the first-listed city wins a tie because we only
  // replace the leader when a city is strictly warmer or colder.
  let warmest = null;
  let coldest = null;
  for (const entry of cities) {
    if (!entry.ok) {
      continue;
    }
    const temp = entry.weather.current.temperatureC;
    if (warmest === null || temp > warmest.temp) {
      warmest = { temp, name: entry.weather.location.name };
    }
    if (coldest === null || temp < coldest.temp) {
      coldest = { temp, name: entry.weather.location.name };
    }
  }

  const succeeded = cities.filter((entry) => entry.ok).length;

  res.json({
    data: {
      cities,
      summary: {
        succeeded,
        failed: cities.length - succeeded,
        warmest: warmest ? warmest.name : null,
        coldest: coldest ? coldest.name : null,
      },
    },
    attribution: ATTRIBUTION,
  });
});