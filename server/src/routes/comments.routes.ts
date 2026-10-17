import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { analyzeDiscussionSentiment } from '../services/gemini.service.js';

export const commentsRouter = Router();

const createCommentSchema = z.object({
  content: z.string().min(2, 'Comment must be at least 2 characters').max(1000, 'Comment exceeds 1000 characters'),
  userId: z.string().optional(),
  articleData: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      sourceName: z.string().optional(),
      category: z.string().optional(),
    })
    .optional(),
});

/**
 * Seed initial contextual comments if article has zero comments
 */
async function ensureSeedComments(articleId: string, articleTitle: string, defaultUserId: string) {
  const count = await prisma.comment.count({ where: { articleId } });
  if (count > 0) return;

  const sampleComments = [
    {
      content: `この件について、関係各所の迅速な発表と透明性のある情報公開を評価したいです。今後の具体的な運用基準の整備にも期待しています。`,
      likesCount: 14,
    },
    {
      content: `現場での負担増やコスト面の懸念も残りますね。制度設計だけでなく、利用者側への分かりやすい周知活動も不可欠だと思います。`,
      likesCount: 8,
    },
  ];

  for (const s of sampleComments) {
    await prisma.comment.create({
      data: {
        articleId,
        userId: defaultUserId,
        content: s.content,
        likesCount: s.likesCount,
      },
    });
  }
}

/**
 * Helper to ensure article exists in database before comment insertion
 */
async function ensureArticleExists(articleId: string, articleData?: { title?: string; description?: string; url?: string; sourceName?: string; category?: string }) {
  let article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    const url = articleData?.url || `https://news.yahoo.co.jp/articles/${articleId}`;
    article = await prisma.article.upsert({
      where: { url },
      update: {},
      create: {
        id: articleId,
        title: articleData?.title || 'Yahoo! News Article',
        description: articleData?.description || 'Yahoo Pulse live news story',
        url,
        sourceName: articleData?.sourceName || 'Yahoo! ニュース',
        category: articleData?.category || 'general',
        publishedAt: new Date().toISOString(),
      },
    });
  }
  return article;
}

/**
 * GET /api/comments/article/:articleId
 * Returns list of comments and real-time AI sentiment analysis
 */
commentsRouter.get('/article/:articleId', async (req: Request, res: Response) => {
  try {
    const articleId = String(req.params.articleId);
    const { sort, lang, title } = req.query;

    const selectedSort = sort === 'newest' ? 'newest' : 'likes';
    const selectedLang: 'ja' | 'en' = lang === 'en' ? 'en' : 'ja';
    const articleTitle = typeof title === 'string' && title ? title : 'News Story';

    // Find default user for seeding if needed
    let demoUser = await prisma.user.findFirst();
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          email: 'taro@example.com',
          name: '田中 太郎 (Taro)',
          passwordHash: 'dummy',
          region: 'tokyo',
        },
      });
    }

    // Ensure seed comments if this article was opened for the first time
    await ensureArticleExists(articleId, { title: articleTitle });
    await ensureSeedComments(articleId, articleTitle, demoUser.id);

    const comments = await prisma.comment.findMany({
      where: { articleId },
      orderBy: selectedSort === 'likes' ? [{ likesCount: 'desc' }, { createdAt: 'desc' }] : { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Run Gemini Discussion Sentiment Analysis
    const sentiment = await analyzeDiscussionSentiment({
      articleTitle,
      comments: comments.map((c) => ({ content: c.content, likesCount: c.likesCount })),
      lang: selectedLang,
    });

    res.status(200).json({
      status: 'ok',
      count: comments.length,
      comments,
      sentiment,
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve comments',
    });
  }
});

/**
 * POST /api/comments/article/:articleId
 * Adds a new comment to an article
 */
commentsRouter.post('/article/:articleId', async (req: Request, res: Response) => {
  try {
    const articleId = String(req.params.articleId);
    const validation = createCommentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: validation.error.errors[0]?.message || 'Invalid comment input',
      });
    }

    const { content, userId, articleData } = validation.data;

    // Resolve User
    let activeUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!activeUser) {
      activeUser = await prisma.user.findFirst();
      if (!activeUser) {
        activeUser = await prisma.user.create({
          data: {
            email: 'taro@example.com',
            name: '田中 太郎 (Taro)',
            passwordHash: 'dummy',
            region: 'tokyo',
          },
        });
      }
    }

    // Ensure Article exists
    await ensureArticleExists(articleId, articleData);

    // Create Comment
    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId: activeUser.id,
        content,
        likesCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'ok',
      comment,
    });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to post comment',
    });
  }
});

/**
 * POST /api/comments/:commentId/like
 * Increments the like counter (共感・参考になった)
 */
commentsRouter.post('/:commentId/like', async (req: Request, res: Response) => {
  try {
    const commentId = String(req.params.commentId);

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'ok',
      comment: updated,
    });
  } catch (err) {
    console.error('Error liking comment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upvote comment',
    });
  }
});

/**
 * DELETE /api/comments/:commentId
 * Deletes a comment
 */
commentsRouter.delete('/:commentId', async (req: Request, res: Response) => {
  try {
    const commentId = String(req.params.commentId);

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.status(200).json({
      status: 'ok',
      message: 'Comment deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete comment',
    });
  }
});
