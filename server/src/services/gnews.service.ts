import { env } from '../config/env.js';

export interface NormalizedArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
  category: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  commentsCount?: number;
  likesCount?: number;
}

interface GNewsRawArticle {
  title: string;
  description: string;
  content?: string;
  url: string;
  image?: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
}

interface CacheEntry {
  data: NormalizedArticle[];
  timestamp: number;
}

// In-memory cache with 10-minute TTL to preserve GNews free-tier quota (100 req/day)
const CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map<string, CacheEntry>();

export async function fetchArticles(params: {
  category?: string;
  q?: string;
  lang?: 'ja' | 'en';
  country?: string;
}): Promise<{ articles: NormalizedArticle[]; source: 'api' | 'cache' | 'fallback' }> {
  const lang = params.lang || 'ja';
  const category = params.category || 'general';
  const q = params.q?.trim();
  const cacheKey = `${lang}:${category}:${q || 'top'}`;

  // 1. Check in-memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { articles: cached.data, source: 'cache' };
  }

  // 2. Query GNews API if key exists
  if (env.GNEWS_API_KEY) {
    try {
      const url = new URL(
        q ? 'https://gnews.io/api/v4/search' : 'https://gnews.io/api/v4/top-headlines'
      );
      url.searchParams.set('apikey', env.GNEWS_API_KEY);
      url.searchParams.set('lang', lang);
      url.searchParams.set('max', '10');

      if (q) {
        url.searchParams.set('q', q);
      } else if (category && category !== 'all' && category !== 'major') {
        url.searchParams.set('category', category);
      }

      const response = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const json = await response.json() as { articles?: GNewsRawArticle[] };
        if (json.articles && Array.isArray(json.articles)) {
          const normalized: NormalizedArticle[] = json.articles.map((item, index) => ({
            id: `gnews-${Date.now()}-${index}`,
            title: item.title,
            description: item.description || '',
            content: item.content || '',
            url: item.url,
            image: item.image || undefined,
            publishedAt: formatRelativeTime(item.publishedAt, lang),
            source: {
              name: item.source.name || 'Yahoo! Pulse News',
              url: item.source.url,
            },
            category: category === 'all' ? 'top' : category,
            isFeatured: index === 0,
            isTrending: index < 2,
            commentsCount: Math.floor(Math.random() * 80) + 12,
            likesCount: Math.floor(Math.random() * 1200) + 100,
          }));

          // Update cache
          memoryCache.set(cacheKey, { data: normalized, timestamp: Date.now() });
          return { articles: normalized, source: 'api' };
        }
      } else {
        console.warn(`GNews returned status ${response.status}. Using fallback articles.`);
      }
    } catch (err) {
      console.error('Error fetching from GNews API:', err);
    }
  }

  // 3. Fallback normalized dataset
  return { articles: getFallbackArticles(lang), source: 'fallback' };
}

function formatRelativeTime(isoString: string, lang: 'ja' | 'en'): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMins < 60) {
      return lang === 'ja' ? `${diffMins}分前` : `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return lang === 'ja' ? `${diffHours}時間前` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return lang === 'ja' ? `${diffDays}日前` : `${diffDays}d ago`;
  } catch {
    return lang === 'ja' ? 'たった今' : 'just now';
  }
}

function getFallbackArticles(lang: 'ja' | 'en'): NormalizedArticle[] {
  if (lang === 'ja') {
    return [
      {
        id: 'hero-1',
        title: '日本の経済成長率 予想を上回る 個人消費の回復がけん引',
        description: '内閣府が発表した実質GDP速報値は、個人消費と企業の設備投資の回復により市場予想を上回るプラス成長を維持した。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '5分前',
        source: { name: 'Yahoo! 経済ニュース' },
        category: '経済',
        isFeatured: true,
        isTrending: true,
        commentsCount: 86,
        likesCount: 1200,
      },
      {
        id: 'sub-1',
        title: '政府 新たな経済対策を閣議決定 物価高対策に重点',
        description: 'エネルギー補助金の継続や低所得世帯への重点給付金を含む新たな総合経済対策を正式に閣議決定した。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '12分前',
        source: { name: '政治タイムズ' },
        category: '政治',
        commentsCount: 24,
        likesCount: 532,
      },
      {
        id: 'sub-2',
        title: 'サッカー日本代表 W杯予選で快勝 次戦は来月',
        description: '強豪相手に終始主導権を握り、後半に鮮やかな連係から2ゴールを挙げて予選突破へ大きく前進。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
        publishedAt: '30分前',
        source: { name: 'スポーツ速報' },
        category: 'スポーツ',
        commentsCount: 98,
        likesCount: 1100,
      },
      {
        id: 'sub-3',
        title: '新型スマートフォンが発表 AI機能を大幅強化',
        description: '次世代オンデバイスAIチップを搭載し、リアルタイム音声通話翻訳や写真の高度な編集機能を標準実装。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1時間前',
        source: { name: 'テクノロジー総合' },
        category: 'テクノロジー',
        commentsCount: 41,
        likesCount: 862,
      },
      {
        id: 'sub-4',
        title: '人気アーティスト 新曲をリリース 初のドームツアーも決定',
        description: '配信開始と同時に各音楽チャートで1位を獲得。来春には全国5大都市を巡るドームツアーが決定。',
        url: 'https://news.yahoo.co.jp',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2時間前',
        source: { name: 'エンタメニュース' },
        category: 'エンタメ',
        commentsCount: 120,
        likesCount: 1500,
      },
    ];
  }

  // English fallback
  return [
    {
      id: 'hero-en-1',
      title: 'Japan Economic Growth Exceeds Forecasts Driven by Resilient Consumer Spending',
      description: 'Cabinet Office preliminary GDP data highlights robust corporate capital investments and domestic consumer resurgence.',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      publishedAt: '5m ago',
      source: { name: 'Yahoo! Business' },
      category: 'Economy',
      isFeatured: true,
      isTrending: true,
      commentsCount: 86,
      likesCount: 1200,
    },
    {
      id: 'sub-en-1',
      title: 'Government Approves New Economic Stimulus Package Targeting Inflation Relief',
      description: 'Comprehensive relief measures include extended energy subsidies and assistance programs for local municipalities.',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
      publishedAt: '12m ago',
      source: { name: 'Politics Today' },
      category: 'Politics',
      commentsCount: 24,
      likesCount: 532,
    },
    {
      id: 'sub-en-2',
      title: 'Japan National Soccer Team Triumphs in World Cup Qualifier Match',
      description: 'Decisive second-half tactical substitutions secure key victory on the continental qualifying journey.',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
      publishedAt: '30m ago',
      source: { name: 'Sports Flash' },
      category: 'Sports',
      commentsCount: 98,
      likesCount: 1100,
    },
    {
      id: 'sub-en-3',
      title: 'Next-Generation Smartphone Unveiled with Deep On-Device AI Integration',
      description: 'Flagship device showcases low-latency voice translation and intelligent computational photography.',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      publishedAt: '1h ago',
      source: { name: 'Tech Radar' },
      category: 'Technology',
      commentsCount: 41,
      likesCount: 862,
    },
    {
      id: 'sub-en-4',
      title: 'Popular Artist Drops Record-Breaking Single and Announces Dome Tour',
      description: 'Chart-topping release precedes five-city nationwide stadium tour scheduled for upcoming spring season.',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      publishedAt: '2h ago',
      source: { name: 'Entertainment Beat' },
      category: 'Entertainment',
      commentsCount: 120,
      likesCount: 1500,
    },
  ];
}
