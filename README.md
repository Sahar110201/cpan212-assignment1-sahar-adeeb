# City Weather API

This is an Express Weather API that answers your questions related to weather by caling the free Open-Metro API. It turns a city name into coordinates and the forcast and summary. It can compare 2 to 5 cities at the same time and also keeps working if one of them fails.

## Run it

Requires Node.js 24 

npm install
 copying `.env.example` to `.env`
 npm run dev

## Environment variables


| Variable | Default | What it controls |
| --- | --- | --- |
| PORT | 4000 | The port the server listens on |
| GEOCODING_URL | https://geocoding-api.open-meteo.com/v1 | Base URL of the geocoding API |
| FORECAST_URL | https://api.open-meteo.com/v1 | Base URL of the forecast API |
| UPSTREAM_TIMEOUT_MS | 5000 | How long to wait for each Open-Meteo request |
| CACHE_TTL_SECONDS | 600 | How long a cached answer stays valid |

## Endpoints

### GET /api/weather?city=Toronto

Current weather and a 3-day forecast for 1 city. It responds 400 for a bad `city`, 404 when the city is not found and 502 or 504 when Open-Meteo fails or is too slow to respond.

```
curl "http://localhost:4000/api/weather?city=Toronto"
```

### GET /api/compare?cities=Toronto,Vancouver,Halifax

The same lookup for 2 to 5 cities at the same time. It responds 200 with a result for every city even when some of it faila, plus a summary with the number of successes and failures and the warmest and coldest city. Responds 400 for a bad `cities` value.

```
curl "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"
```

### GET /api/cache/stats

How many answers are cached (`entries`), how many lookups used the cache (`hits`), how many didn't (`misses`) and the cache lifetime (`ttlSeconds`).

```
curl "http://localhost:4000/api/cache/stats"
```

## Testing

Start the server fresh (`npm run dev`) and then run these in order. On Windows you can run them in Git Bash.

```bash
# 1. Weather for a city: 200
curl -i "http://localhost:4000/api/weather?city=Toronto"

# 2. The same city again, from the cache: 200 with "cached": true
curl -i "http://localhost:4000/api/weather?city=Toronto"

# 3. Weather without a city: 400
curl -i "http://localhost:4000/api/weather"

# 4. Weather for a city that doesn't exist: 404
curl -i "http://localhost:4000/api/weather?city=Qwertyville"

# 5. Compare three cities: 200
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"

# 6. Compare with one city that doesn't exist: 200, with one failed city
curl -i "http://localhost:4000/api/compare?cities=Toronto,Qwertyville"

# 7. Compare too many cities: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax,Calgary,Ottawa,Montreal"

# 8. Compare with a repeated city: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto,toronto"

# 9. Cache stats: 200
curl -i "http://localhost:4000/api/cache/stats"

# 10. An unknown route: 404
curl -i "http://localhost:4000/nope"
```

## Data source

Weather data by [Open-Meteo.com](https://open-meteo.com/).

## AI use

- I used Claude whenever I got stuck on a code or did not understand it. I pasted my xode onto claude and asked it to see where I was wrong. It corrected me on ultiple istantances and even pointed it out how I can fix it wor write the code. It helped me a lot whenever I got stuck or faced errors. I also ran and tested everything myself.