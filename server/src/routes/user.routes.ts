import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware.js';

export const userRouter = Router();

// Apply auth to all user routes
userRouter.use(requireAuth);

/**
 * PUT /api/user/preferences
 */
const preferencesSchema = z.object({
  region: z.string().optional(),
  preferredCategories: z.string().optional(),
});

userRouter.put('/preferences', async (req: AuthRequest, res: Response) => {
  try {
    const parse = preferencesSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', errors: parse.error.format() });
    }

    const { region, preferredCategories } = parse.data;
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(region ? { region } : {}),
        ...(preferredCategories ? { preferredCategories } : {}),
      },
      select: {
        id: true,
        name: true,
        region: true,
        preferredCategories: true,
      },
    });

    res.status(200).json({ status: 'ok', user: updated });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update preferences' });
  }
});

/**
 * GET /api/user/bookmarks
 */
userRouter.get('/bookmarks', async (req: AuthRequest, res: Response) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.userId },
      include: {
        article: {
          include: { aiSummary: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'ok',
      count: bookmarks.length,
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        savedAt: b.createdAt,
        article: b.article,
      })),
    });
  } catch (err) {
    console.error('Fetch bookmarks error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch bookmarks' });
  }
});

/**
 * POST /api/user/bookmarks
 * Toggle or save an article by URL or ID
 */
const saveBookmarkSchema = z.object({
  articleId: z.string().optional(),
  title: z.string().optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  sourceName: z.string().optional(),
  publishedAt: z.string().optional(),
});

userRouter.post('/bookmarks', async (req: AuthRequest, res: Response) => {
  try {
    const parse = saveBookmarkSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ status: 'error', errors: parse.error.format() });
    }

    let articleId = parse.data.articleId;

    // If articleId not found or created on the fly from feed
    if (!articleId && parse.data.url) {
      let article = await prisma.article.findUnique({ where: { url: parse.data.url } });
      if (!article) {
        article = await prisma.article.create({
          data: {
            title: parse.data.title || 'Saved Article',
            description: parse.data.description || '',
            url: parse.data.url,
            imageUrl: parse.data.imageUrl,
            sourceName: parse.data.sourceName || 'Yahoo! Pulse',
            category: parse.data.category || 'general',
            publishedAt: parse.data.publishedAt || 'recently',
          },
        });
      }
      articleId = article.id;
    }

    if (!articleId) {
      return res.status(400).json({ status: 'error', message: 'articleId or url is required' });
    }

    // Toggle bookmark (if exists delete, else create)
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: req.userId!,
          articleId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.status(200).json({ status: 'ok', action: 'removed', articleId });
    }

    const created = await prisma.bookmark.create({
      data: {
        userId: req.userId!,
        articleId,
      },
      include: { article: true },
    });

    res.status(201).json({ status: 'ok', action: 'saved', bookmark: created });
  } catch (err) {
    console.error('Save bookmark error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update bookmark' });
  }
});

/**
 * GET /api/user/history
 */
userRouter.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.readingHistory.findMany({
      where: { userId: req.userId },
      include: { article: true },
      orderBy: { viewedAt: 'desc' },
      take: 20,
    });

    res.status(200).json({
      status: 'ok',
      count: history.length,
      history: history.map((h) => ({
        id: h.id,
        viewedAt: h.viewedAt,
        article: h.article,
      })),
    });
  } catch (err) {
    console.error('Fetch history error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch reading history' });
  }
});
