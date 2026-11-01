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

const GNEWS_CATEGORY_MAP: Record<string, string> = {
  general: 'general',
  top: 'general',
  home: 'general',
  news: 'general',
  flash: 'general',
  economy: 'business',
  business: 'business',
  technology: 'technology',
  tech: 'technology',
  entertainment: 'entertainment',
  sports: 'sports',
  society: 'nation',
  nation: 'nation',
  world: 'world',
  science: 'science',
  health: 'health',
  healthcare: 'health',
  lifestyle: 'entertainment',
};

const REGIONAL_QUERY_MAP: Record<string, { ja: string; en: string }> = {
  tokyo: { ja: '東京', en: 'Tokyo' },
  osaka: { ja: '大阪', en: 'Osaka' },
  nagoya: { ja: '名古屋', en: 'Nagoya' },
  fukuoka: { ja: '福岡', en: 'Fukuoka' },
  local: { ja: '日本 国内 地域', en: 'Japan regional' },
};

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  general: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  economy: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  sports: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
  entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  nation: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
  world: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  science: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
};

export async function fetchArticles(params: {
  category?: string;
  q?: string;
  lang?: 'ja' | 'en';
  country?: string;
}): Promise<{ articles: NormalizedArticle[]; source: 'api' | 'cache' | 'fallback' }> {
  const lang = params.lang || 'ja';
  const rawCat = (params.category || 'general').toLowerCase();
  let query = params.q?.trim();

  // If regional category, populate query keyword if not already provided
  if (!query && REGIONAL_QUERY_MAP[rawCat]) {
    query = REGIONAL_QUERY_MAP[rawCat][lang];
  }

  const mappedCat = GNEWS_CATEGORY_MAP[rawCat] || 'general';
  const cacheKey = `${lang}:${rawCat}:${query || mappedCat}`;

  // 1. Check in-memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { articles: cached.data, source: 'cache' };
  }

  // 2. Query GNews API if key exists
  if (env.GNEWS_API_KEY) {
    try {
      const url = new URL(
        query ? 'https://gnews.io/api/v4/search' : 'https://gnews.io/api/v4/top-headlines'
      );
      url.searchParams.set('apikey', env.GNEWS_API_KEY);
      url.searchParams.set('lang', lang);
      url.searchParams.set('max', '10');

      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.set('category', mappedCat);
      }

      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const json = (await response.json()) as { articles?: GNewsRawArticle[] };
        if (json.articles && Array.isArray(json.articles) && json.articles.length > 0) {
          const normalized: NormalizedArticle[] = json.articles.map((item, index) => {
            const fallbackImage =
              DEFAULT_CATEGORY_IMAGES[mappedCat] || DEFAULT_CATEGORY_IMAGES.general;

            return {
              id: `gnews-${Date.now()}-${index}`,
              title: item.title,
              description: item.description || '',
              content: item.content || '',
              url: item.url,
              image: item.image && item.image.startsWith('http') ? item.image : fallbackImage,
              publishedAt: formatRelativeTime(item.publishedAt, lang),
              source: {
                name: item.source.name || 'Yahoo! Pulse News',
                url: item.source.url,
              },
              category: getDisplayCategory(rawCat, lang),
              isFeatured: index === 0,
              isTrending: index < 2,
              commentsCount: Math.floor(Math.random() * 80) + 12,
              likesCount: Math.floor(Math.random() * 1200) + 100,
            };
          });

          // Update cache
          memoryCache.set(cacheKey, { data: normalized, timestamp: Date.now() });
          return { articles: normalized, source: 'api' };
        }
      } else {
        console.warn(`GNews returned status ${response.status} for category=${rawCat}, query=${query}. Using structured category fallback.`);
      }
    } catch (err) {
      console.error('Error fetching from GNews API:', err);
    }
  }

  // 3. Fallback normalized dataset
  const fallbackArticles = getFallbackArticles(lang, rawCat, query);
  return { articles: fallbackArticles, source: 'fallback' };
}

function getDisplayCategory(cat: string, lang: 'ja' | 'en'): string {
  const map: Record<string, { ja: string; en: string }> = {
    general: { ja: '主要', en: 'Top' },
    top: { ja: '主要', en: 'Top' },
    news: { ja: 'ニュース', en: 'News' },
    flash: { ja: '速報', en: 'Breaking' },
    economy: { ja: '経済', en: 'Economy' },
    business: { ja: 'ビジネス', en: 'Business' },
    technology: { ja: 'テクノロジー', en: 'Technology' },
    sports: { ja: 'スポーツ', en: 'Sports' },
    entertainment: { ja: 'エンタメ', en: 'Entertainment' },
    society: { ja: '社会', en: 'Society' },
    nation: { ja: '国内', en: 'Nation' },
    world: { ja: '国際', en: 'World' },
    science: { ja: '科学', en: 'Science' },
    healthcare: { ja: 'ヘルスケア', en: 'Healthcare' },
    health: { ja: '健康', en: 'Health' },
    lifestyle: { ja: 'ライフスタイル', en: 'Lifestyle' },
    tokyo: { ja: '東京', en: 'Tokyo' },
    osaka: { ja: '大阪', en: 'Osaka' },
    nagoya: { ja: '名古屋', en: 'Nagoya' },
    fukuoka: { ja: '福岡', en: 'Fukuoka' },
    local: { ja: '地域', en: 'Regional' },
  };
  const item = map[cat.toLowerCase()];
  return item ? item[lang] : cat;
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

const CATEGORY_DATASETS: Record<string, { ja: NormalizedArticle[]; en: NormalizedArticle[] }> = {
  technology: {
    ja: [
      {
        id: 'tech-1',
        title: '北海道千歳市 次世代2nm半導体工場の試作ラインが本格稼働へ',
        description: '最先端EUV露光装置を導入した国内初の2nmロジック半導体製造ラインが試験稼働を開始。AI・自動運転向けチップ供給を目指す。',
        url: 'https://news.yahoo.co.jp/articles/tech-2nm-pilot-run',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '15分前',
        source: { name: 'IT・科学総合' },
        category: 'テクノロジー',
        isFeatured: true,
        isTrending: true,
        commentsCount: 142,
        likesCount: 2300,
      },
      {
        id: 'tech-2',
        title: '生成AIモデルの日本語推論速度が大幅向上 国内ベンダーが新発表',
        description: '独自の軽量化アーキテクチャを採用し、消費電力を40%削減しながら高精度な日本語文書要約を実現。',
        url: 'https://news.yahoo.co.jp/articles/tech-ai-model-boost',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        publishedAt: '35分前',
        source: { name: 'テックインサイト' },
        category: 'テクノロジー',
        commentsCount: 68,
        likesCount: 920,
      },
      {
        id: 'tech-3',
        title: '東京湾で電動自動運航フェリーの実証実験が成功',
        description: 'LiDARセンサーと衛星測位を融合した自律航行システムにより、夜間でも安全な離着岸を実証。',
        url: 'https://news.yahoo.co.jp/articles/tech-autonomous-ferry',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1時間前',
        source: { name: 'モビリティ速報' },
        category: 'テクノロジー',
        commentsCount: 45,
        likesCount: 650,
      },
      {
        id: 'tech-4',
        title: '量子コンピューティング研究で新発見 常温動作に一歩前進',
        description: '新材料の量子コヒーレンス保持時間を従来の100倍に延伸することに東京大学などの研究チームが成功。',
        url: 'https://news.yahoo.co.jp/articles/tech-quantum-leap',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2時間前',
        source: { name: '先端サイエンス' },
        category: 'テクノロジー',
        commentsCount: 89,
        likesCount: 1400,
      },
    ],
    en: [
      {
        id: 'tech-en-1',
        title: 'Japan Accelerates Domestic 2nm Silicon Production at Hokkaido Foundries',
        description: 'Pilot 2nm extreme ultraviolet lithography lines begin testing ahead of schedule, targeting automotive and edge AI processors.',
        url: 'https://news.yahoo.co.jp/articles/tech-2nm-pilot-run-en',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '15m ago',
        source: { name: 'Tech Radar' },
        category: 'Technology',
        isFeatured: true,
        isTrending: true,
        commentsCount: 142,
        likesCount: 2300,
      },
      {
        id: 'tech-en-2',
        title: 'Next-Gen Japanese LLM Slashes Inference Latency by 40%',
        description: 'Proprietary architectural compression enables energy-efficient real-time reasoning on consumer-grade hardware.',
        url: 'https://news.yahoo.co.jp/articles/tech-ai-model-boost-en',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        publishedAt: '35m ago',
        source: { name: 'AI Chronicle' },
        category: 'Technology',
        commentsCount: 68,
        likesCount: 920,
      },
      {
        id: 'tech-en-3',
        title: 'Fully Autonomous Electric Ferry Completes Maiden Voyage in Tokyo Bay',
        description: 'Equipped with sensor fusion and edge collision avoidance, commuter vessels demonstrate automated harbor docking.',
        url: 'https://news.yahoo.co.jp/articles/tech-autonomous-ferry-en',
        image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1h ago',
        source: { name: 'Mobility Today' },
        category: 'Technology',
        commentsCount: 45,
        likesCount: 650,
      },
      {
        id: 'tech-en-4',
        title: 'Quantum Coherence Breakthrough Extends Qubit Stability by 100x',
        description: 'Collaborative university research achieves room-temperature quantum states in novel synthetic crystal structures.',
        url: 'https://news.yahoo.co.jp/articles/tech-quantum-leap-en',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2h ago',
        source: { name: 'Science Frontier' },
        category: 'Technology',
        commentsCount: 89,
        likesCount: 1400,
      },
    ],
  },
  sports: {
    ja: [
      {
        id: 'spo-1',
        title: '大谷翔平 圧巻の50号ホームラン＆盗塁 記録ラッシュに現地スタジアム熱狂',
        description: '豪快な一発でチームを勝利に導き、メジャーリーグ史上初の金字塔を樹立。監督やチームメイトも惜しみない賛辞。',
        url: 'https://news.yahoo.co.jp/articles/spo-ohtani-record',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '10分前',
        source: { name: 'スポーツ報知' },
        category: 'スポーツ',
        isFeatured: true,
        isTrending: true,
        commentsCount: 380,
        likesCount: 5200,
      },
      {
        id: 'spo-2',
        title: 'サッカー日本代表 W杯アジア最終予選で快勝 グループ首位独走',
        description: 'アウェーの過酷な環境をものともせず、連動したハイプレスと華麗なパスワークから3得点を奪って快勝。',
        url: 'https://news.yahoo.co.jp/articles/spo-samurai-blue',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
        publishedAt: '40分前',
        source: { name: 'フットボールダイジェスト' },
        category: 'スポーツ',
        commentsCount: 210,
        likesCount: 3100,
      },
      {
        id: 'spo-3',
        title: 'プロ野球 クライマックスシリーズ第3戦 延長12回の劇的サヨナラ勝ち',
        description: '両軍投手陣の魂の力投が続いた熱戦は、代打の一振りが勝負を決定づけ日本シリーズ進出に王手。',
        url: 'https://news.yahoo.co.jp/articles/spo-npb-cs-game3',
        image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1時間前',
        source: { name: 'ベースボールマガジン' },
        category: 'スポーツ',
        commentsCount: 165,
        likesCount: 1850,
      },
      {
        id: 'spo-4',
        title: '世界水泳 日本の新星が個人メドレーで銀メダル獲得 快挙達成',
        description: '終盤のラストスパートで世界記録保持者に迫る大健闘。自己ベストを大幅に更新して表彰台に登壇。',
        url: 'https://news.yahoo.co.jp/articles/spo-swimming-silver',
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2時間前',
        source: { name: 'アスリート通信' },
        category: 'スポーツ',
        commentsCount: 74,
        likesCount: 1200,
      },
    ],
    en: [
      {
        id: 'spo-en-1',
        title: 'Shohei Ohtani Shatters Historical Milestones with Spectacular Multi-Home Run Display',
        description: 'Fans erupt across the stadium as monumental achievements cement MVP contention in an unforgettable postseason push.',
        url: 'https://news.yahoo.co.jp/articles/spo-ohtani-record-en',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '10m ago',
        source: { name: 'Major League Digest' },
        category: 'Sports',
        isFeatured: true,
        isTrending: true,
        commentsCount: 380,
        likesCount: 5200,
      },
      {
        id: 'spo-en-2',
        title: 'Japan Dominates Continental Qualifier with Decisive 3-0 Victory',
        description: 'Dynamic tactical fluidity and resolute defending earn crucial three points away from home.',
        url: 'https://news.yahoo.co.jp/articles/spo-samurai-blue-en',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
        publishedAt: '40m ago',
        source: { name: 'Global Football Review' },
        category: 'Sports',
        commentsCount: 210,
        likesCount: 3100,
      },
      {
        id: 'spo-en-3',
        title: 'Dramatic 12th-Inning Walk-Off Seals Championship Series Showdown',
        description: 'Pinch-hit heroics cap an epic pitching duel, sending the home franchise into the final tournament round.',
        url: 'https://news.yahoo.co.jp/articles/spo-npb-cs-game3-en',
        image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1h ago',
        source: { name: 'Baseball Insider' },
        category: 'Sports',
        commentsCount: 165,
        likesCount: 1850,
      },
      {
        id: 'spo-en-4',
        title: 'Rising Swimming Prodigy Clinches Silver in 400m Individual Medley',
        description: 'Sensational final-lap acceleration shatters national record at the International Aquatics Championship.',
        url: 'https://news.yahoo.co.jp/articles/spo-swimming-silver-en',
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2h ago',
        source: { name: 'Olympic Athletics Today' },
        category: 'Sports',
        commentsCount: 74,
        likesCount: 1200,
      },
    ],
  },
  entertainment: {
    ja: [
      {
        id: 'ent-1',
        title: '人気バンド 初の5大ドームツアー開催を発表 新アルバムもリリースへ',
        description: 'デビュー10周年の節目に全国30万人動員の大型ツアーを敢行。チケット先行受付にアクセスが殺到。',
        url: 'https://news.yahoo.co.jp/articles/ent-dome-tour',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '20分前',
        source: { name: 'オリコンニュース' },
        category: 'エンタメ',
        isFeatured: true,
        isTrending: true,
        commentsCount: 198,
        likesCount: 2800,
      },
      {
        id: 'ent-2',
        title: '劇場版アニメ 最新作が興行収入100億円を最速突破',
        description: '美麗な作画と感動的なストーリーが幅広い世代の心を掴み、海外公開でも絶賛の声が相次ぐ。',
        url: 'https://news.yahoo.co.jp/articles/ent-anime-boxoffice',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        publishedAt: '50分前',
        source: { name: 'シネマトゥデイ' },
        category: 'エンタメ',
        commentsCount: 154,
        likesCount: 2400,
      },
      {
        id: 'ent-3',
        title: '国際映画祭で邦画長編作品が最高賞グランプリを受賞',
        description: '日本の伝統文化と現代社会の家族像を繊細に描き出した演出が審査員満場一致の評価を獲得。',
        url: 'https://news.yahoo.co.jp/articles/ent-film-award',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1時間前',
        source: { name: '映画情報局' },
        category: 'エンタメ',
        commentsCount: 82,
        likesCount: 1100,
      },
      {
        id: 'ent-4',
        title: '話題の配信ドラマ シーズン2制作決定 新キャストも一部解禁',
        description: '世界ランキング上位にランクインしたサスペンス劇が待望の続編へ。クランクインを前に期待高まる。',
        url: 'https://news.yahoo.co.jp/articles/ent-drama-renewal',
        image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2時間前',
        source: { name: 'ステージウェブ' },
        category: 'エンタメ',
        commentsCount: 63,
        likesCount: 890,
      },
    ],
    en: [
      {
        id: 'ent-en-1',
        title: 'Acclaimed J-Pop Band Announces 5-Dome Stadium Tour Alongside Milestone Album',
        description: 'Over 300,000 fans expected across nationwide concert tour celebrating a decade of musical evolution.',
        url: 'https://news.yahoo.co.jp/articles/ent-dome-tour-en',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '20m ago',
        source: { name: 'Billboard Japan' },
        category: 'Entertainment',
        isFeatured: true,
        isTrending: true,
        commentsCount: 198,
        likesCount: 2800,
      },
      {
        id: 'ent-en-2',
        title: 'Flagship Anime Feature Surpasses $70 Million Box Office Record in Record Time',
        description: 'Critically lauded animation and evocative storytelling draw unprecedented international acclaim.',
        url: 'https://news.yahoo.co.jp/articles/ent-anime-boxoffice-en',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        publishedAt: '50m ago',
        source: { name: 'Cinema Pulse' },
        category: 'Entertainment',
        commentsCount: 154,
        likesCount: 2400,
      },
      {
        id: 'ent-en-3',
        title: 'Japanese Drama Clinches Grand Prix at International Film Festival',
        description: 'Poignant exploration of contemporary family bonds wins unanimous admiration from international jury members.',
        url: 'https://news.yahoo.co.jp/articles/ent-film-award-en',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1h ago',
        source: { name: 'Festival Daily' },
        category: 'Entertainment',
        commentsCount: 82,
        likesCount: 1100,
      },
      {
        id: 'ent-en-4',
        title: 'Hit Streaming Series Renewed for Highly Anticipated Season Two',
        description: 'Global chart-topper confirms returning cast and high-stakes narrative continuation.',
        url: 'https://news.yahoo.co.jp/articles/ent-drama-renewal-en',
        image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2h ago',
        source: { name: 'Stream Guide' },
        category: 'Entertainment',
        commentsCount: 63,
        likesCount: 890,
      },
    ],
  },
  economy: {
    ja: [
      {
        id: 'eco-1',
        title: '日経平均株価 続伸し最高値圏へ 外国人投資家の買い越し拡大',
        description: '円相場の安定と好調な国内企業業績、持続的な賃金上昇モメンタムを背景に幅広い業種で買い注文が優勢。',
        url: 'https://news.yahoo.co.jp/articles/eco-nikkei-rally',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '12分前',
        source: { name: '日本経済新聞' },
        category: '経済',
        isFeatured: true,
        isTrending: true,
        commentsCount: 176,
        likesCount: 2100,
      },
      {
        id: 'eco-2',
        title: '日銀 総裁が金融政策の正常化方針を改めて言及 物価目標2%達成へ',
        description: '春闘賃上げの波及効果と個人消費の粘り強さを確認。経済環境を見極めながら段階的な追加利上げを模索。',
        url: 'https://news.yahoo.co.jp/articles/eco-boj-policy',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
        publishedAt: '30分前',
        source: { name: 'ロイター通信' },
        category: '経済',
        commentsCount: 142,
        likesCount: 1600,
      },
      {
        id: 'eco-3',
        title: '政府 新たな総合経済対策を閣議決定 物価高支援と重点給付金',
        description: '電気・ガス代補助の再開と子育て世帯向け支援金を盛り込み、景気の下支えとデフレ脱却を確実なものに。',
        url: 'https://news.yahoo.co.jp/articles/eco-stimulus-package',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1時間前',
        source: { name: '政治経済ニュース' },
        category: '経済',
        commentsCount: 95,
        likesCount: 1100,
      },
      {
        id: 'eco-4',
        title: '為替相場 1ドル=152円台で推移 米金利先高観と需給動向を注視',
        description: '米雇用統計を前に持ち高調整の動きが交錯。財務省幹部は急激な変動に対してあらゆる手段を排除せずと牽制。',
        url: 'https://news.yahoo.co.jp/articles/eco-fx-yen-dollar',
        image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2時間前',
        source: { name: 'マーケット速報' },
        category: '経済',
        commentsCount: 88,
        likesCount: 940,
      },
    ],
    en: [
      {
        id: 'eco-en-1',
        title: 'Nikkei Extends Record Rally Driven by Foreign Inflows and Corporate Profits',
        description: 'Broad-based buying momentum lifts Tokyo equities as wage increases fuel sustainable domestic demand projections.',
        url: 'https://news.yahoo.co.jp/articles/eco-nikkei-rally-en',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '12m ago',
        source: { name: 'Nikkei Financial' },
        category: 'Economy',
        isFeatured: true,
        isTrending: true,
        commentsCount: 176,
        likesCount: 2100,
      },
      {
        id: 'eco-en-2',
        title: 'Bank of Japan Reaffirms Measured Policy Normalization Path',
        description: 'Central bank leadership signals calibrated rate adjustments as inflation consistently tracks 2% target.',
        url: 'https://news.yahoo.co.jp/articles/eco-boj-policy-en',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
        publishedAt: '30m ago',
        source: { name: 'Reuters Market' },
        category: 'Economy',
        commentsCount: 142,
        likesCount: 1600,
      },
      {
        id: 'eco-en-3',
        title: 'Cabinet Formally Enacts Comprehensive Stimulus Package',
        description: 'Targeted household subsidies and renewable infrastructure credits aim to solidify economic resilience.',
        url: 'https://news.yahoo.co.jp/articles/eco-stimulus-package-en',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1h ago',
        source: { name: 'Economic Times' },
        category: 'Economy',
        commentsCount: 95,
        likesCount: 1100,
      },
      {
        id: 'eco-en-4',
        title: 'Yen Stabilizes Around 152 Against US Dollar Amid Mixed Yield Cues',
        description: 'Foreign exchange authorities monitor speculative volatility ahead of key labor market indicators.',
        url: 'https://news.yahoo.co.jp/articles/eco-fx-yen-dollar-en',
        image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
        publishedAt: '2h ago',
        source: { name: 'Forex Weekly' },
        category: 'Economy',
        commentsCount: 88,
        likesCount: 940,
      },
    ],
  },
  general: {
    ja: [
      {
        id: 'gen-1',
        title: '日本経済予測を上回る成長 個人消費が堅調に推移',
        description: '内閣府が発表した最新の四半期GDP速報値によると、個人消費と設備投資が予想以上に伸び、実質成長率は年率換算でプラスを維持。インバウンド需要の回復も寄与しています。',
        url: 'https://news.yahoo.co.jp/articles/gen-gdp-boost',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '5分前',
        source: { name: 'Yahoo! ニュース' },
        category: '主要',
        isFeatured: true,
        isTrending: true,
        commentsCount: 86,
        likesCount: 1200,
      },
      {
        id: 'gen-2',
        title: '政府 新たな経済対策を閣議決定 物価高対策に重点',
        description: 'エネルギー補助金の継続や低所得世帯への給付金を含む総合経済対策を正式に決定。',
        url: 'https://news.yahoo.co.jp/articles/gen-policy-measure',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '12分前',
        source: { name: '政治タイムズ' },
        category: '政治',
        commentsCount: 24,
        likesCount: 532,
      },
      {
        id: 'gen-3',
        title: '大谷翔平 最新試合で殊勲の一打 連夜の活躍に球場大歓声',
        description: '勝負どころで見事なタイムリーヒットを放ちチームを牽引。ポストシーズン進出へ勢いづく。',
        url: 'https://news.yahoo.co.jp/articles/gen-ohtani-clutch',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
        publishedAt: '30分前',
        source: { name: 'スポーツ速報' },
        category: 'スポーツ',
        commentsCount: 98,
        likesCount: 1100,
      },
      {
        id: 'gen-4',
        title: '新型スマートフォンが発表 AI機能を大幅強化',
        description: '次世代オンデバイスAIチップを搭載し、リアルタイム音声通話翻訳や高度な編集機能を標準実装。',
        url: 'https://news.yahoo.co.jp/articles/gen-smart-device',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1時間前',
        source: { name: 'テクノロジー総合' },
        category: 'テクノロジー',
        commentsCount: 41,
        likesCount: 862,
      },
    ],
    en: [
      {
        id: 'gen-en-1',
        title: 'Japan Economic Growth Exceeds Forecasts Driven by Resilient Consumer Spending',
        description: 'Cabinet Office preliminary GDP metrics highlight robust capital investments and domestic consumer resurgence, maintaining steady expansion.',
        url: 'https://news.yahoo.co.jp/articles/gen-gdp-boost-en',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        publishedAt: '5m ago',
        source: { name: 'Yahoo! Pulse News' },
        category: 'Top',
        isFeatured: true,
        isTrending: true,
        commentsCount: 86,
        likesCount: 1200,
      },
      {
        id: 'gen-en-2',
        title: 'Government Approves Comprehensive Stimulus Package Targeting Inflation Relief',
        description: 'Energy subsidies and direct municipal grants headline new fiscal assistance framework.',
        url: 'https://news.yahoo.co.jp/articles/gen-policy-measure-en',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '12m ago',
        source: { name: 'Politics Today' },
        category: 'Politics',
        commentsCount: 24,
        likesCount: 532,
      },
      {
        id: 'gen-en-3',
        title: 'Shohei Ohtani Delivers Decisive Clutch Hit as Playoff Excitement Builds',
        description: 'Late-inning rally highlights explosive offensive showcase in crucial regular season finale.',
        url: 'https://news.yahoo.co.jp/articles/gen-ohtani-clutch-en',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
        publishedAt: '30m ago',
        source: { name: 'Sports Flash' },
        category: 'Sports',
        commentsCount: 98,
        likesCount: 1100,
      },
      {
        id: 'gen-en-4',
        title: 'Next-Generation Smartphone Unveiled with Deep On-Device AI Integration',
        description: 'Flagship device showcases low-latency real-time voice translation and intelligent computational photography.',
        url: 'https://news.yahoo.co.jp/articles/gen-smart-device-en',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        publishedAt: '1h ago',
        source: { name: 'Tech Radar' },
        category: 'Technology',
        commentsCount: 41,
        likesCount: 862,
      },
    ],
  },
};

// Aliases for categories
CATEGORY_DATASETS.business = CATEGORY_DATASETS.economy;
CATEGORY_DATASETS.top = CATEGORY_DATASETS.general;
CATEGORY_DATASETS.news = CATEGORY_DATASETS.general;
CATEGORY_DATASETS.flash = CATEGORY_DATASETS.general;

function getFallbackArticles(lang: 'ja' | 'en', category: string, query?: string): NormalizedArticle[] {
  const datasetGroup =
    CATEGORY_DATASETS[category.toLowerCase()] || CATEGORY_DATASETS.general;
  const list = datasetGroup[lang] || datasetGroup.ja;

  if (query && query.trim()) {
    const qLower = query.toLowerCase();
    const filtered = list.filter(
      (a) =>
        a.title.toLowerCase().includes(qLower) ||
        a.description.toLowerCase().includes(qLower) ||
        a.category.toLowerCase().includes(qLower)
    );
    if (filtered.length > 0) return filtered;
  }

  return list;
}
