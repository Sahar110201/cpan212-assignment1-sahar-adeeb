import { Router } from 'express';
import { parseCity } from '../validators/weather-query.js';
import { getCityWeather } from '../lib/weather.js';

export const weatherRouter = Router();

const ATTRIBUTION = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';

// GET /api/weather?city=Toronto
weatherRouter.get('/weather', async (req, res) => {
  const city = parseCity(req.query.city);
  const data = await getCityWeather(city);
  res.json({ data, attribution: ATTRIBUTION });
});

// TODO (you): GET /api/compare?cities=Toronto,Vancouver,Halifax
weatherRouter.get('/compare', (req, res) => {
  res.status(501).json({ error: { message: 'Not written yet: GET /api/compare' } });
});