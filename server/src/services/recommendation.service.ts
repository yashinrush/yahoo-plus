import { prisma } from '../db/prisma.js';
import { fetchArticles, NormalizedArticle } from './gnews.service.js';

export interface ScoredArticle extends NormalizedArticle {
  rankingScore: number;
  scoreBreakdown: {
    interestScore: number;
    recencyScore: number;
    popularityScore: number;
    readPenalty: number;
  };
}

export interface RecommendationWeights {
  interest: number;    // Weight for matching user's preferred categories
  recency: number;     // Weight for fresh/breaking articles
  popularity: number;  // Weight for high engagement (likes + comments)
  readPenalty: number; // Penalty if article already in user's reading history
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  interest: 0.4,
  recency: 0.3,
  popularity: 0.2,
  readPenalty: 0.5,
};

/**
 * Deterministic, explainable recommendation engine
 */
export async function getPersonalizedRecommendations(params: {
  userId?: string;
  lang?: 'ja' | 'en';
  weights?: Partial<RecommendationWeights>;
  limit?: number;
}): Promise<ScoredArticle[]> {
  const lang = params.lang || 'ja';
  const limit = params.limit || 8;
  const weights: RecommendationWeights = {
    ...DEFAULT_WEIGHTS,
    ...params.weights,
  };

  // 1. Fetch user preferences and reading history
  let preferredCategories: string[] = ['technology', 'economy', 'sports'];
  const readArticleUrls = new Set<string>();

  if (params.userId) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        history: {
          include: { article: true },
          take: 50,
        },
      },
    });

    if (user) {
      if (user.preferredCategories) {
        preferredCategories = user.preferredCategories.toLowerCase().split(',').map((c) => c.trim());
      }
      user.history.forEach((h) => {
        if (h.article?.url) readArticleUrls.add(h.article.url);
      });
    }
  }

  // 2. Ingest candidate articles across categories
  const [generalFeed, techFeed, economyFeed] = await Promise.all([
    fetchArticles({ category: 'general', lang }),
    fetchArticles({ category: 'technology', lang }),
    fetchArticles({ category: 'business', lang }),
  ]);

  // Deduplicate candidates by URL
  const candidateMap = new Map<string, NormalizedArticle>();
  [...generalFeed.articles, ...techFeed.articles, ...economyFeed.articles].forEach((art) => {
    if (!candidateMap.has(art.url)) {
      candidateMap.set(art.url, art);
    }
  });

  const candidates = Array.from(candidateMap.values());

  // 3. Multi-factor Scoring
  const scoredCandidates: ScoredArticle[] = candidates.map((article) => {
    // A. Interest Score (0.0 to 1.0)
    const artCat = article.category.toLowerCase();
    const isPreferred = preferredCategories.some(
      (pref) => artCat.includes(pref) || pref.includes(artCat)
    );
    const interestScore = isPreferred ? 1.0 : 0.2;

    // B. Recency Decay Score (0.0 to 1.0)
    // Parsing relative time strings like "12分前" or "12m ago"
    let elapsedMinutes = 60;
    const matchMins = article.publishedAt.match(/(\d+)\s*(分前|m ago)/);
    const matchHours = article.publishedAt.match(/(\d+)\s*(時間前|h ago)/);
    if (matchMins) {
      elapsedMinutes = parseInt(matchMins[1], 10);
    } else if (matchHours) {
      elapsedMinutes = parseInt(matchHours[1], 10) * 60;
    }
    // Half-life decay over 180 minutes (3 hours)
    const recencyScore = Math.exp(-elapsedMinutes / 180);

    // C. Popularity Score (0.0 to 1.0)
    const totalEngagement = (article.likesCount || 100) + (article.commentsCount || 10) * 5;
    // Logarithmic scaling normalized up to 3000 points
    const popularityScore = Math.min(1.0, Math.log10(totalEngagement + 1) / Math.log10(3000));

    // D. Read History Fatigue Penalty (0.0 or 1.0)
    const isAlreadyRead = readArticleUrls.has(article.url);
    const readPenalty = isAlreadyRead ? 1.0 : 0.0;

    // Final Composite Ranking Score
    const rawScore =
      weights.interest * interestScore +
      weights.recency * recencyScore +
      weights.popularity * popularityScore -
      weights.readPenalty * readPenalty;

    const rankingScore = Math.max(0.01, Math.round(rawScore * 100) / 100);

    return {
      ...article,
      rankingScore,
      scoreBreakdown: {
        interestScore: Math.round(interestScore * 100) / 100,
        recencyScore: Math.round(recencyScore * 100) / 100,
        popularityScore: Math.round(popularityScore * 100) / 100,
        readPenalty,
      },
    };
  });

  // 4. Sort by ranking score descending
  scoredCandidates.sort((a, b) => b.rankingScore - a.rankingScore);

  // 5. Diversity Balancing: avoid 3 stories in a row from the same category
  const balancedList: ScoredArticle[] = [];
  const categoryCounts = new Map<string, number>();

  for (const article of scoredCandidates) {
    const count = categoryCounts.get(article.category) || 0;
    // Cap any single category to maximum 3 items in top recommendations
    if (count < 3 || balancedList.length > candidates.length - 3) {
      balancedList.push(article);
      categoryCounts.set(article.category, count + 1);
    }
    if (balancedList.length >= limit) break;
  }

  return balancedList;
}
