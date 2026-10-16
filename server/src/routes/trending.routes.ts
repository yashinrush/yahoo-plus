import { Router, Request, Response } from 'express';
import { getTrendingTopics, recordSearchHit } from '../services/trending.service.js';

export const trendingRouter = Router();

/**
 * GET /api/trending
 * Returns ranked trending topics with velocity indicators
 */
trendingRouter.get('/', (req: Request, res: Response) => {
  const { lang } = req.query;
  const selectedLang: 'ja' | 'en' = lang === 'en' ? 'en' : 'ja';
  const topics = getTrendingTopics(selectedLang);

  res.status(200).json({
    status: 'ok',
    count: topics.length,
    topics,
  });
});

/**
 * POST /api/trending/hit
 * Records user query hit to dynamically boost trending velocity
 */
trendingRouter.post('/hit', (req: Request, res: Response) => {
  const { keyword } = req.body;
  if (keyword && typeof keyword === 'string') {
    recordSearchHit(keyword);
  }
  res.status(200).json({ status: 'ok' });
});
