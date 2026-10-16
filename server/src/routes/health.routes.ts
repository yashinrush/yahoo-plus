import { Router, Request, Response } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { appCache } from '../services/cache.service.js';

export const healthRouter = Router();

/**
 * GET /api/health
 * Comprehensive enterprise health-check endpoint for uptime monitoring,
 * container readiness probes, database latency, and cache diagnostics.
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  
  // Database health check with ping latency measurement
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;

  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Number((performance.now() - dbStart).toFixed(2));
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = `error: ${error instanceof Error ? error.message : 'unknown'}`;
  }

  const cacheStats = appCache.getStats();

  res.status(200).json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    service: 'yahoo-pulse-api',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      provider: 'sqlite',
    },
    cache: {
      ...cacheStats,
      type: 'in-memory-ttl',
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: {
        rss: Math.round(memory.rss / (1024 * 1024)),
        heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
        heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
      },
    },
  });
});
