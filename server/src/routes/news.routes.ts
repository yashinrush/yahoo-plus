import { Router, Request, Response } from 'express';
import { fetchArticles } from '../services/gnews.service.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { appCache } from '../services/cache.service.js';

export const newsRouter = Router();

/**
 * GET /api/news
 * Fetches normalized articles with caching and language support.
 */
newsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, q, lang } = req.query;

    const selectedLang: 'ja' | 'en' = lang === 'en' ? 'en' : 'ja';
    const result = await fetchArticles({
      category: typeof category === 'string' ? category : undefined,
      q: typeof q === 'string' ? q : undefined,
      lang: selectedLang,
    });

    // HTTP Cache-Control header for client/CDN edge caching
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

    res.status(200).json({
      status: 'ok',
      source: result.source,
      lang: selectedLang,
      count: result.articles.length,
      articles: result.articles,
    });
  } catch (err) {
    console.error('Error in news endpoint:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch news articles',
    });
  }
});

/**
 * GET /api/news/recommended
 * Multi-factor scored and personalized news feed with caching
 */
newsRouter.get('/recommended', async (req: Request, res: Response) => {
  try {
    const { lang, userId } = req.query;
    const selectedLang: 'ja' | 'en' = lang === 'en' ? 'en' : 'ja';

    const cacheKey = `rec:${userId || 'demo'}:${selectedLang}`;
    const cached = appCache.get<any>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=45');
      return res.status(200).json(cached);
    }

    const { getPersonalizedRecommendations } = await import('../services/recommendation.service.js');
    const { prisma } = await import('../db/prisma.js');

    // Default to first user (Taro) if no userId provided
    let activeUserId = typeof userId === 'string' ? userId : undefined;
    if (!activeUserId) {
      const demoUser = await prisma.user.findFirst();
      if (demoUser) activeUserId = demoUser.id;
    }

    const recommended = await getPersonalizedRecommendations({
      userId: activeUserId,
      lang: selectedLang,
      limit: 8,
    });

    const payload = {
      status: 'ok',
      count: recommended.length,
      articles: recommended,
    };

    // Cache recommendation result for 60 seconds
    appCache.set(cacheKey, payload, 60);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=45');
    res.status(200).json(payload);
  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate recommendations',
    });
  }
});

/**
 * POST /api/news/summarize
 * Generates or retrieves cached Gemini AI summary for an article (Rate limited)
 */
newsRouter.post('/summarize', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const { articleId, title, description, url, lang } = req.body;
    if (!title) {
      return res.status(400).json({ status: 'error', message: 'title is required' });
    }

    const { summarizeArticle } = await import('../services/gemini.service.js');
    const result = await summarizeArticle({
      articleId,
      title,
      description: description || '',
      url,
      lang: lang === 'en' ? 'en' : 'ja',
    });

    res.status(200).json({
      status: 'ok',
      data: result,
    });
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI summary',
    });
  }
});
