export interface TrendingTopicItem {
  rank: number;
  keyword: string;
  keywordEn: string;
  keywordJa: string;
  velocityScore: number;
  isSurging: boolean;
  category: string;
  articleCount: number;
}

// In-memory frequency & velocity tracker for search queries
const searchHitCounts = new Map<string, { count: number; lastHit: number }>();

export function recordSearchHit(keyword: string) {
  const normalized = keyword.toLowerCase().trim();
  const existing = searchHitCounts.get(normalized) || { count: 0, lastHit: Date.now() };
  searchHitCounts.set(normalized, {
    count: existing.count + 1,
    lastHit: Date.now(),
  });
}

/**
 * Calculates trending keywords by combining baseline editorial momentum
 * with real-time user search velocity.
 */
export function getTrendingTopics(lang: 'ja' | 'en' = 'ja'): TrendingTopicItem[] {
  const baseTopics = [
    {
      keywordJa: '衆議院選挙 2024',
      keywordEn: 'House of Representatives Election 2024',
      velocityScore: 98,
      isSurging: true,
      category: 'politics',
      articleCount: 142,
    },
    {
      keywordJa: '生成AIの最新動向',
      keywordEn: 'Generative AI Innovations',
      velocityScore: 94,
      isSurging: true,
      category: 'technology',
      articleCount: 118,
    },
    {
      keywordJa: '大谷翔平 最新ニュース',
      keywordEn: 'Shohei Ohtani Latest Updates',
      velocityScore: 82,
      isSurging: false,
      category: 'sports',
      articleCount: 95,
    },
    {
      keywordJa: '秋の旅行特集',
      keywordEn: 'Autumn Travel Features',
      velocityScore: 76,
      isSurging: false,
      category: 'travel',
      articleCount: 74,
    },
    {
      keywordJa: '新型iPhone 発表',
      keywordEn: 'Next-Gen iPhone Announcement',
      velocityScore: 71,
      isSurging: false,
      category: 'technology',
      articleCount: 68,
    },
    {
      keywordJa: '為替介入と円安の影響',
      keywordEn: 'Currency Intervention & Yen Dynamics',
      velocityScore: 65,
      isSurging: false,
      category: 'economy',
      articleCount: 52,
    },
    {
      keywordJa: 'プロ野球クライマックスシリーズ',
      keywordEn: 'Pro Baseball Climax Series',
      velocityScore: 59,
      isSurging: false,
      category: 'sports',
      articleCount: 46,
    },
    {
      keywordJa: '次世代半導体パイロットライン',
      keywordEn: 'Next-Gen Semiconductor Pilot Line',
      velocityScore: 54,
      isSurging: false,
      category: 'technology',
      articleCount: 39,
    },
  ];

  // Adjust rankings based on live user search hits
  const enriched = baseTopics.map((topic) => {
    const hits = searchHitCounts.get(topic.keywordJa.toLowerCase()) || 
                 searchHitCounts.get(topic.keywordEn.toLowerCase());
    const boost = hits ? hits.count * 5 : 0;
    return {
      ...topic,
      keyword: lang === 'ja' ? topic.keywordJa : topic.keywordEn,
      velocityScore: topic.velocityScore + boost,
      isSurging: topic.isSurging || boost > 15,
    };
  });

  // Sort by velocity score descending
  enriched.sort((a, b) => b.velocityScore - a.velocityScore);

  return enriched.slice(0, 5).map((item, index) => ({
    rank: index + 1,
    keyword: item.keyword,
    keywordEn: item.keywordEn,
    keywordJa: item.keywordJa,
    velocityScore: item.velocityScore,
    isSurging: item.isSurging,
    category: item.category,
    articleCount: item.articleCount,
  }));
}
