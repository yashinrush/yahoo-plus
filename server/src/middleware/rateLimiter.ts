import { Request, Response, NextFunction } from 'express';

interface RateLimiterOptions {
  windowMs: number;       // Window duration in milliseconds
  maxRequests: number;    // Maximum allowed requests within window
  message?: string;       // Custom error message
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * Creates an in-memory rate limiting middleware with standard RateLimit headers.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = options;
  const store = new Map<string, ClientRecord>();

  // Periodically clean expired client records every 2 minutes
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 120000);

  if (cleanup.unref) {
    cleanup.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client identifier: x-forwarded-for, req.ip, or fallback
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || '127.0.0.1';
    const key = `${req.baseUrl || ''}:${ip}`;

    const now = Date.now();
    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    // Standard RFC RateLimit headers
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      res.status(429).json({
        status: 'error',
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfterSeconds: resetSeconds,
      });
      return;
    }

    next();
  };
}

// 1. General API Rate Limiter: 120 requests per 60 seconds per client
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'General API rate limit exceeded. Please throttle your requests.',
});

// 2. Strict Auth Rate Limiter: 10 requests per 60 seconds to prevent brute force / credential stuffing
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. For security reasons, please wait before retrying.',
});

// 3. AI Summarization Rate Limiter: 10 requests per 60 seconds to safeguard Gemini quota
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'AI summarization rate limit exceeded. Please wait a minute before requesting another summary.',
});
