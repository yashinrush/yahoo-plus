import { Request, Response, NextFunction } from 'express';

/**
 * Server Timing Middleware
 * 
 * Attaches standard W3C `Server-Timing` and `X-Response-Time` HTTP headers
 * to all incoming requests, enabling fine-grained latency profiling in browser DevTools.
 */
export function serverTimingMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();

  const originalEnd = res.end;

  // Intercept the end call to calculate elapsed duration
  res.end = function (this: Response, ...args: any[]) {
    const duration = performance.now() - start;
    const durFormatted = duration.toFixed(2);

    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durFormatted}ms`);
      res.setHeader('Server-Timing', `total;dur=${durFormatted};desc="Total Request Latency"`);
    }

    return (originalEnd as any).apply(this, args);
  };

  next();
}
