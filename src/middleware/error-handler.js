import { HttpError } from '../lib/http-error.js';

// Express treats a middleware with four parameters as an error handler.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // A planned error: send its status and message (details only when it has them).
  if (err instanceof HttpError) {
    const error = { message: err.message };
    if (err.details !== undefined) {
      error.details = err.details;
    }
    return res.status(err.status).json({ error });
  }

  // Anything else is a bug. The details go to the terminal, never to the client.
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
