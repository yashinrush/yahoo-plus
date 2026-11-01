import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { env } from './config/env.js';
import { serverTimingMiddleware } from './middleware/timing.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { healthRouter } from './routes/health.routes.js';
import { newsRouter } from './routes/news.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import { trendingRouter } from './routes/trending.routes.js';
import { abRouter } from './routes/abtest.routes.js';
import { commentsRouter } from './routes/comments.routes.js';

export const app = express();

// High-resolution latency profiling (Server-Timing and X-Response-Time headers)
app.use(serverTimingMiddleware);

// Permissive CORS for deployed Vercel and local environments
app.use(
  cors({
    origin: (_origin, callback) => {
      // Allow all origins (standard for public news platform)
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// Vercel serverless rewrite normalization: restore original path if rewritten to /api
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url === '/api' && req.originalUrl && req.originalUrl !== '/api') {
    req.url = req.originalUrl;
  }
  next();
});

// General API Rate Limiting (120 req / 60s per client)
app.use('/api', apiRateLimiter);

// Top-level API status
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'yahoo-pulse-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/news', newsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/trending', trendingRouter);
app.use('/api/ab', abRouter);
app.use('/api/comments', commentsRouter);

// Serve frontend build in production
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
app.use(express.static(clientDistPath));

// SPA fallback for non-API client routes in production
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// 404 Handler for API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    status: 'error',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});
