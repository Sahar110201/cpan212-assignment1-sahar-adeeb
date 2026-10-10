import { HttpError } from '../lib/http-error.js';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;

function invalid(field, message) {
  return new HttpError(400, 'Invalid query', { [field]: message });
}

// Check ?city= and return the trimmed city name.
export function parseCity(value) {
  if (value === undefined) {
    throw invalid('city', 'city is required');
  }
  if (typeof value !== 'string') {
    // A repeated parameter (?city=a&city=b) arrives as an array.
    throw invalid('city', 'city must be sent only once');
  }

  const city = value.trim();
  if (city === '') {
    throw invalid('city', 'city is required');
  }
  if (city.length < MIN_NAME_LENGTH || city.length > MAX_NAME_LENGTH) {
    throw invalid('city', 'city must be 2 to 60 characters');
  }
  return city;
}

// Check ?cities= and return an array of trimmed city names.
export function parseCities(value) {
  if (value === undefined) {
    throw invalid('cities', 'cities is required');
  }
  if (typeof value !== 'string') {
    throw invalid('cities', 'cities must be sent only once');
  }
  if (value.trim() === '') {
    throw invalid('cities', 'cities is required');
  }

  const names = value.split(',').map((name) => name.trim());

  if (names.some((name) => name === '')) {
    throw invalid('cities', 'cities must not contain an empty name');
  }
  if (names.length < 2 || names.length > 5) {
    throw invalid('cities', 'cities must list 2 to 5 cities');
  }

  for (const name of names) {
    if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
      throw invalid('cities', `"${name}" must be 2 to 60 characters`);
    }
  }

  const seen = new Set();
  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw invalid('cities', `"${name}" is listed more than once`);
    }
    seen.add(key);
  }

  return names;
}