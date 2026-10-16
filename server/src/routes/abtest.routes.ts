import { Router, Request, Response } from 'express';
import {
  assignExperimentGroup,
  trackEvent,
  getExperimentMetrics,
  ExperimentVariant,
} from '../services/abtest.service.js';

export const abRouter = Router();

/**
 * GET /api/ab/variant
 * Returns deterministic experiment variant for the user/session
 */
abRouter.get('/variant', (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || req.ip || 'anonymous-user';
  const variant = assignExperimentGroup(sessionId);

  res.status(200).json({
    status: 'ok',
    variant,
    strategy:
      variant === 'A'
        ? 'Variant A: Freshness-biased algorithm'
        : 'Variant B: Interest-biased algorithm',
  });
});

/**
 * POST /api/ab/track
 * Telemetry endpoint to record impressions and clicks
 */
abRouter.post('/track', (req: Request, res: Response) => {
  const { variant, eventType, sessionId, articleId } = req.body;

  if (!variant || !eventType || !sessionId) {
    return res.status(400).json({
      status: 'error',
      message: 'variant, eventType, and sessionId are required',
    });
  }

  trackEvent({
    variant: variant as ExperimentVariant,
    eventType,
    sessionId,
    articleId,
  });

  res.status(200).json({ status: 'ok' });
});

/**
 * GET /api/ab/metrics
 * Returns experiment comparison report with CTR
 */
abRouter.get('/metrics', (_req: Request, res: Response) => {
  const data = getExperimentMetrics();
  res.status(200).json({ status: 'ok', data });
});
