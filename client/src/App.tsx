import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { Header } from './components/Header.js';
import { CategorySidebar } from './components/CategorySidebar.js';
import { NewsCategoryTabs } from './components/NewsCategoryTabs.js';
import { HeroSection } from './components/HeroSection.js';
import { RecommendedGrid } from './components/RecommendedGrid.js';
import { LatestNewsGrid } from './components/LatestNewsGrid.js';
import { WeatherWidget } from './components/WeatherWidget.js';
import { RightProfileCard } from './components/RightProfileCard.js';
import { TrendingTopics } from './components/TrendingTopics.js';
import { AutumnPromoBanner } from './components/AutumnPromoBanner.js';
import type { Article } from './types/index.js';
import { Check, Sliders, X, Activity, Zap, ShieldCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  region: string;
  preferredCategories: string;
  points: number;
}

const AppContent: React.FC = () => {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [activeTab, setActiveTab] = useState<string>('top');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('tokyo');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'technology',
    'economy',
    'sports',
  ]);

  // 1. Load User Profile and Bookmarks from Database
  const loadUserData = useCallback(async () => {
    try {
      const [userRes, bookmarksRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/user/bookmarks'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.user) {
          setUser(userData.user);
          setSelectedRegion(userData.user.region || 'tokyo');
          if (userData.user.preferredCategories) {
            setSelectedCategories(userData.user.preferredCategories.split(','));
          }
        }
      }

      if (bookmarksRes.ok) {
        const bmData = await bookmarksRes.json();
        if (bmData.bookmarks) {
          const ids = new Set<string>();
          bmData.bookmarks.forEach((b: { article: { id: string; url: string } }) => {
            ids.add(b.article.id);
            if (b.article.url) ids.add(b.article.url);
          });
          setBookmarkedIds(ids);
        }
      }
    } catch (err) {
      console.warn('Could not load user data from database:', err);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // 2. Fetch live articles from Express backend (/api/news, /api/news/recommended, bookmarks, history)
  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = '/api/news';
      const params = new URLSearchParams();
      params.set('lang', lang);

      // Handle personal channels: Bookmarks, History, Recommended
      if (activeCategory === 'recommended') {
        endpoint = '/api/news/recommended';
      } else if (activeCategory === 'bookmarks') {
        const res = await fetch('/api/user/bookmarks');
        if (res.ok) {
          const json = await res.json();
          if (json.bookmarks && json.bookmarks.length > 0) {
            setArticles(json.bookmarks.map((b: any) => ({
              id: b.article.id,
              title: b.article.title,
              description: b.article.description || '',
              url: b.article.url,
              image: b.article.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
              publishedAt: b.article.publishedAt || (lang === 'ja' ? '保存済み' : 'Saved'),
              source: { name: b.article.sourceName || 'Yahoo! Pulse' },
              category: b.article.category || 'Bookmarks',
              commentsCount: 12,
              likesCount: 85,
            })));
            setIsLoading(false);
            return;
          }
        }
      } else if (activeCategory === 'history') {
        const res = await fetch('/api/user/history');
        if (res.ok) {
          const json = await res.json();
          if (json.history && json.history.length > 0) {
            setArticles(json.history.map((h: any) => ({
              id: h.article.id,
              title: h.article.title,
              description: h.article.description || '',
              url: h.article.url,
              image: h.article.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
              publishedAt: h.article.publishedAt || (lang === 'ja' ? '閲覧済み' : 'Read'),
              source: { name: h.article.sourceName || 'Yahoo! Pulse' },
              category: h.article.category || 'History',
              commentsCount: 18,
              likesCount: 130,
            })));
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Map category keys to standard GNews categories
        const catMap: Record<string, string> = {
          home: 'general',
          top: 'general',
          news: 'general',
          flash: 'general',
          society: 'nation',
          sports: 'sports',
          economy: 'business',
          business: 'business',
          technology: 'technology',
          entertainment: 'entertainment',
          world: 'world',
          science: 'science',
          healthcare: 'health',
          local: 'nation',
          regional: 'nation',
        };

        const targetCat = catMap[activeTab] || catMap[activeCategory];
        if (targetCat && targetCat !== 'general') {
          params.set('category', targetCat);
        } else if (activeCategory && !['home', 'news', 'top'].includes(activeCategory)) {
          params.set('category', activeCategory);
        }

        if (searchQuery.trim()) {
          params.set('q', searchQuery.trim());
        }
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { articles: Article[] };
        if (json.articles && json.articles.length > 0) {
          setArticles(json.articles);
        }
      }
    } catch (err) {
      console.warn('Could not load live news from backend, fallback active:', err);
    } finally {
      setIsLoading(false);
    }
  }, [lang, activeCategory, activeTab, searchQuery]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // 3. Persist Bookmark Toggle to Database
  const handleToggleBookmark = async (id: string, articleData?: Partial<Article>) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      await fetch('/api/user/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: id.startsWith('cmv') ? id : undefined,
          url: articleData?.url || (id.startsWith('http') ? id : undefined),
          title: articleData?.title,
          description: articleData?.description,
          imageUrl: articleData?.image,
          category: articleData?.category || 'general',
          sourceName: articleData?.source?.name || 'Yahoo! Pulse',
        }),
      });
    } catch (err) {
      console.error('Failed to sync bookmark to server:', err);
    }
  };

  // 4. Save User Preferences to Database
  const handleSavePreferences = async () => {
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: selectedRegion,
          preferredCategories: selectedCategories.join(','),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
        }
        setShowPreferencesModal(false);
        loadNews();
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  // 5. Handle Live Debounced Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (activeCategory === 'bookmarks' || activeCategory === 'history') {
      setActiveCategory('home');
    }
    // Also hit trending endpoint velocity boost
    if (query.trim()) {
      fetch('/api/trending/hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: query.trim() }),
      }).catch(() => {});
    }
  };

  // Default featured photo story if articles empty
  const defaultMainArticle: Article = {
    id: 'hero-main-1',
    title: lang === 'ja' ? '日本経済予測を上回る成長 個人消費が堅調に推移' : 'Japan Economic Growth Exceeds Forecasts Driven by Resilient Consumer Spending',
    description: lang === 'ja'
      ? '内閣府が発表した最新の四半期GDP速報値によると、個人消費と設備投資が予想以上に伸び、実質成長率は年率換算でプラスを維持。インバウンド需要の回復も寄与しています。'
      : 'According to latest government GDP metrics, domestic consumer spending and capital investment outpaced market expectations, maintaining steady annualized positive expansion.',
    url: 'https://news.yahoo.co.jp',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    publishedAt: lang === 'ja' ? '5分前' : '5m ago',
    source: { name: 'Yahoo! Pulse' },
    category: lang === 'ja' ? '経済' : 'Economy',
    commentsCount: 86,
    likesCount: 1200,
  };

  const mainArticle: Article = articles[0] || defaultMainArticle;
  const subArticles: Article[] = articles.length > 1 ? articles.slice(1, 5) : [
    {
      id: 'sub-1',
      title: lang === 'ja' ? '政府 新たな経済対策を閣議決定 物価高対策に重点' : 'Government Approves New Economic Stimulus Package Targeting Inflation Relief',
      description: '',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
      publishedAt: lang === 'ja' ? '12分前' : '12m ago',
      source: { name: 'Yahoo! Pulse' },
      category: lang === 'ja' ? '政治' : 'Politics',
      commentsCount: 24,
      likesCount: 532,
    },
    {
      id: 'sub-2',
      title: lang === 'ja' ? 'サッカー日本代表 W杯予選で快勝 次戦は来月' : 'Japan National Soccer Team Triumphs in World Cup Qualifier Match',
      description: '',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
      publishedAt: lang === 'ja' ? '30分前' : '30m ago',
      source: { name: 'Yahoo! Pulse' },
      category: lang === 'ja' ? 'スポーツ' : 'Sports',
      commentsCount: 98,
      likesCount: 1100,
    },
    {
      id: 'sub-3',
      title: lang === 'ja' ? '新型スマートフォンが発表 AI機能を大幅強化' : 'Next-Generation Smartphone Unveiled with Deep On-Device AI Integration',
      description: '',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      publishedAt: lang === 'ja' ? '1時間前' : '1h ago',
      source: { name: 'Yahoo! Pulse' },
      category: lang === 'ja' ? 'テクノロジー' : 'Technology',
      commentsCount: 41,
      likesCount: 862,
    },
    {
      id: 'sub-4',
      title: lang === 'ja' ? '人気アーティスト 新曲をリリース 初のドームツアーも決定' : 'Popular Artist Drops Record-Breaking Single and Announces Dome Tour',
      description: '',
      url: 'https://news.yahoo.co.jp',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      publishedAt: lang === 'ja' ? '2時間前' : '2h ago',
      source: { name: 'Yahoo! Pulse' },
      category: lang === 'ja' ? 'エンタメ' : 'Entertainment',
      commentsCount: 120,
      likesCount: 1500,
    },
  ];

  // A/B Testing & System Health Telemetry
  const [abVariant, setAbVariant] = useState<'A' | 'B'>('B');
  const [abStrategy, setAbStrategy] = useState<string>('');
  const [abMetrics, setAbMetrics] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [showInspectorModal, setShowInspectorModal] = useState<boolean>(false);
  const [inspectorTab, setInspectorTab] = useState<'ab' | 'health'>('ab');

  useEffect(() => {
    let sid = localStorage.getItem('yp_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('yp_session_id', sid);
    }

    fetch('/api/ab/variant', {
      headers: { 'x-session-id': sid },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.variant) {
          setAbVariant(data.variant);
          setAbStrategy(data.strategy);

          // Track impression
          fetch('/api/ab/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              variant: data.variant,
              eventType: 'impression',
              sessionId: sid,
            }),
          }).catch(() => {});
        }
      })
      .catch(() => {});

    // Initial system health ping
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setSystemHealth(data))
      .catch(() => {});
  }, []);

  const openInspector = async (tab: 'ab' | 'health' = 'ab') => {
    setInspectorTab(tab);
    try {
      const [abRes, healthRes] = await Promise.all([
        fetch('/api/ab/metrics'),
        fetch('/api/health'),
      ]);
      if (abRes.ok) {
        const json = await abRes.json();
        setAbMetrics(json.data);
      }
      if (healthRes.ok) {
        const json = await healthRes.json();
        setSystemHealth(json);
      }
    } catch {
      // Ignored
    }
    setShowInspectorModal(true);
  };

  const trackSimulatedClick = async () => {
    const sid = localStorage.getItem('yp_session_id') || 'session_user';
    await fetch('/api/ab/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant: abVariant,
        eventType: 'click',
        sessionId: sid,
      }),
    });
    const res = await fetch('/api/ab/metrics');
    if (res.ok) {
      const json = await res.json();
      setAbMetrics(json.data);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-800 flex flex-col font-sans">
      {/* 1. Header with YAHOO! PULSE branding, Wide Search, JA/EN Toggle, and Taro Profile */}
      <Header
        onSearch={handleSearch}
        bookmarkCount={bookmarkedIds.size}
        onBookmarkClick={() => {
          setActiveCategory('bookmarks');
          setActiveTab('top');
        }}
      />

      {/* 2. Three-Column Desktop Grid Container (Exact Yahoo! JAPAN Portal density) */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 py-3">
        {/* Search feedback notice if active */}
        {searchQuery && (
          <div className="mb-3 bg-blue-50 border border-blue-200 text-blue-900 px-3.5 py-1.5 rounded text-xs flex items-center justify-between">
            <span>
              Search query: <strong className="font-bold">&quot;{searchQuery}&quot;</strong>
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3 items-start">
          {/* COLUMN 1: Left Navigation Sidebar (Authentic Japanese portal categories) */}
          <div className="w-full md:w-[170px] shrink-0 space-y-3">
            <CategorySidebar
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                if (cat === 'region-change') {
                  setShowPreferencesModal(true);
                } else if (['tokyo', 'osaka', 'nagoya', 'fukuoka'].includes(cat)) {
                  setSelectedRegion(cat);
                  setSearchQuery(cat);
                  setActiveCategory(cat);
                } else {
                  setActiveCategory(cat);
                  // Sync activeTab
                  const tabMapping: Record<string, string> = {
                    home: 'top',
                    news: 'top',
                    sports: 'sports',
                    economy: 'economy',
                    business: 'economy',
                    technology: 'technology',
                    world: 'world',
                    entertainment: 'entertainment',
                    society: 'society',
                    local: 'local',
                  };
                  if (tabMapping[cat]) {
                    setActiveTab(tabMapping[cat]);
                  }
                }
              }}
              bookmarkCount={bookmarkedIds.size}
            />

            {/* Preferences Modal Button */}
            <button
              onClick={() => setShowPreferencesModal(true)}
              className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'ja' ? '設定・興味の変更' : 'Preferences'}</span>
            </button>
          </div>

          {/* COLUMN 2: Center Main Content (Tabs, Hero Split View, Recommended, Latest) */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden relative">
              {isLoading && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 animate-pulse z-20" />
              )}
              {/* Top Category Tabs */}
              <NewsCategoryTabs
                activeTab={activeTab}
                onSelectTab={(tabId) => {
                  setActiveTab(tabId);
                  const catMapping: Record<string, string> = {
                    top: 'home',
                    flash: 'home',
                    society: 'society',
                    economy: 'economy',
                    world: 'world',
                    technology: 'technology',
                    entertainment: 'entertainment',
                    sports: 'sports',
                    local: 'local',
                  };
                  setActiveCategory(catMapping[tabId] || tabId);
                }}
              />

              {/* Top Hero Section (Split View: Big Photo on left, 4 rows on right) */}
              <HeroSection
                mainArticle={mainArticle}
                subArticles={subArticles}
              />

              {/* Second Section: あなたにおすすめ (Recommended for you) */}
              <RecommendedGrid
                onToggleBookmark={(id) => handleToggleBookmark(id)}
                bookmarkedIds={bookmarkedIds}
              />

              {/* Third Section: 最新ニュース (Latest News) */}
              <LatestNewsGrid />
            </div>
          </div>

          {/* COLUMN 3: Right Sidebar (Weather, Taro Card with 4 circular shortcuts, Trends, Banner) */}
          <div className="w-full md:w-[275px] shrink-0 space-y-3">
            {/* Weather Widget (Tokyo / 2-day forecast) */}
            <WeatherWidget />

            {/* Taro-san Profile & Services Card (Mail, PayPay, Points, Favorites) */}
            <RightProfileCard />

            {/* 注目のトピック (Trending Topics with Surging Badges) */}
            <TrendingTopics
              onSelectTopic={(keyword) => handleSearch(keyword)}
            />

            {/* 秋の旅行特集 (Autumn Travel Feature) */}
            <AutumnPromoBanner />
          </div>
        </div>
      </main>

      {/* Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                {lang === 'ja' ? 'ユーザー設定 & パーソナライズ' : 'User Settings & Personalization'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ja' ? '地域設定 (天気・地域ニュース)' : 'Region Setting'}
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 bg-slate-50 font-medium"
              >
                <option value="tokyo">{lang === 'ja' ? '東京 (Tokyo)' : 'Tokyo'}</option>
                <option value="osaka">{lang === 'ja' ? '大阪 (Osaka)' : 'Osaka'}</option>
                <option value="nagoya">{lang === 'ja' ? '名古屋 (Nagoya)' : 'Nagoya'}</option>
                <option value="fukuoka">{lang === 'ja' ? '福岡 (Fukuoka)' : 'Fukuoka'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {lang === 'ja' ? '関心のあるカテゴリ (おすすめアルゴリズムに反映)' : 'Interested Categories'}
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { id: 'technology', ja: 'テクノロジー', en: 'Technology' },
                  { id: 'economy', ja: '経済・ビジネス', en: 'Economy & Business' },
                  { id: 'sports', ja: 'スポーツ', en: 'Sports' },
                  { id: 'entertainment', ja: 'エンタメ', en: 'Entertainment' },
                  { id: 'world', ja: '国際ニュース', en: 'World' },
                  { id: 'lifestyle', ja: 'ライフスタイル', en: 'Lifestyle' },
                ].map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          isChecked ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                        );
                      }}
                      className={`p-2 rounded border text-left flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang === 'ja' ? cat.ja : cat.en}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreferencesModal(false)}
                className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {lang === 'ja' ? 'キャンセル' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                {lang === 'ja' ? '設定を保存' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Engineering Inspector Modal (A/B Testing & System Health Observability) */}
      {showInspectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">LINE Yahoo Engineering Inspector</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInspectorModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setInspectorTab('ab')}
                className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                  inspectorTab === 'ab'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                A/B Testing Telemetry
              </button>
              <button
                onClick={() => setInspectorTab('health')}
                className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                  inspectorTab === 'health'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                System Health & Performance
              </button>
            </div>

            {inspectorTab === 'ab' ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-bold text-blue-900">
                    Active Cohort: Variant {abVariant} ({abStrategy})
                  </div>
                  <div className="text-[11px] text-blue-800 mt-1">
                    Deterministic 50/50 hashing by session ID.
                  </div>
                  <button
                    onClick={trackSimulatedClick}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-[11px] font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                  >
                    Simulate Article Click (+CTR)
                  </button>
                </div>

                {abMetrics?.metrics && (
                  <div className="grid grid-cols-2 gap-2">
                    {abMetrics.metrics.map((m: any) => (
                      <div
                        key={m.variant}
                        className={`p-2.5 rounded border ${
                          m.variant === abVariant
                            ? 'border-blue-500 bg-white ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <div className="mt-1 text-slate-600 space-y-0.5 text-[11px]">
                          <div>Impressions: <strong>{m.uniqueImpressions}</strong></div>
                          <div>Clicks: <strong>{m.uniqueClicks}</strong></div>
                          <div className="text-blue-600 font-bold">CTR: {m.ctrPercent}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Database */}
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      SQLite Database Ping:
                    </span>
                    <span className="font-bold text-emerald-600">
                      {systemHealth?.database?.latencyMs ?? 5} ms
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Status: <strong className="text-slate-700 capitalize">{systemHealth?.database?.status ?? 'connected'}</strong> (Prisma ORM)
                  </div>
                </div>

                {/* Cache */}
                <div className="p-3 rounded bg-blue-50/60 border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      In-Memory TTL Cache:
                    </span>
                    <span className="font-bold text-blue-700">
                      {systemHealth?.cache?.hitRatio ?? 50}% Hit Ratio
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 mt-2 text-center">
                    <div className="p-1 bg-white rounded border border-blue-100">
                      <div className="font-bold text-slate-800">{systemHealth?.cache?.hits ?? 0}</div>
                      <div className="text-[9px] text-slate-400">Hits</div>
                    </div>
                    <div className="p-1 bg-white rounded border border-blue-100">
                      <div className="font-bold text-slate-800">{systemHealth?.cache?.misses ?? 0}</div>
                      <div className="text-[9px] text-slate-400">Misses</div>
                    </div>
                    <div className="p-1 bg-white rounded border border-blue-100">
                      <div className="font-bold text-slate-800">{systemHealth?.cache?.keysCount ?? 0}</div>
                      <div className="text-[9px] text-slate-400">Active Keys</div>
                    </div>
                  </div>
                </div>

                {/* Observability */}
                <div className="p-3 rounded bg-amber-50/60 border border-amber-200">
                  <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    Protection & Observability
                  </div>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
                    <li>Rate Limiter: 120 req/min (API), 10 req/min (Auth & AI)</li>
                    <li>Headers: <code>Server-Timing</code> & <code>X-Response-Time</code></li>
                    <li>Memory: {systemHealth?.system?.memoryUsageMB?.heapUsed ?? 15} MB Heap Used</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInspectorModal(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-bold hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Clean, elegant Yahoo! JAPAN styling) */}
      <footer className="mt-8 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-[1240px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Yahoo Pulse — Inspired by Yahoo! JAPAN. Portfolio Project.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-400">
            <span>
              User: <strong className="font-semibold text-slate-700">{user?.name || 'Taro'}</strong> ({user?.region || 'Tokyo'})
            </span>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => openInspector('ab')}
              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>A/B Test Cohort {abVariant}</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => openInspector('health')}
              className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-semibold cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Diagnostics ({systemHealth?.database?.latencyMs ?? 5}ms)</span>
            </button>
            <span className="text-slate-300">|</span>
            <a href="#help" className="hover:text-blue-600 transition-colors">ヘルプ</a>
            <a href="#terms" className="hover:text-blue-600 transition-colors">利用規約</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
