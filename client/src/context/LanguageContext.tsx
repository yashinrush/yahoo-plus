import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ja' | 'en';

interface Translations {
  [key: string]: {
    ja: string;
    en: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Brand & Search
  searchPlaceholder: {
    ja: 'キーワードでニュースを検索',
    en: 'Search news by keyword...',
  },
  searchBtn: {
    ja: '検索',
    en: 'Search',
  },
  userName: {
    ja: 'Taro さん',
    en: 'Taro-san',
  },
  savedArticles: {
    ja: 'ブックマーク',
    en: 'Bookmarks',
  },
  notifications: {
    ja: 'お知らせ',
    en: 'Notifications',
  },

  // Services Navigation
  mail: { ja: 'メール', en: 'Mail' },
  shopping: { ja: 'ショッピング', en: 'Shopping' },
  auctions: { ja: 'ヤフオク!', en: 'Auctions' },
  paypay: { ja: 'PayPay', en: 'PayPay' },
  travel: { ja: 'トラベル', en: 'Travel' },
  finance: { ja: 'ファイナンス', en: 'Finance' },
  weather: { ja: '天気', en: 'Weather' },
  sports: { ja: 'スポーツ', en: 'Sports' },
  games: { ja: 'ゲーム', en: 'Games' },
  video: { ja: '動画', en: 'Video' },
  map: { ja: '地図', en: 'Map' },
  more: { ja: 'その他', en: 'More' },

  // Left Sidebar Categories
  home: { ja: 'ホーム', en: 'Home' },
  news: { ja: 'ニュース', en: 'News' },
  entertainment: { ja: 'エンタメ', en: 'Entertainment' },
  economy: { ja: '経済', en: 'Economy' },
  technology: { ja: 'テクノロジー', en: 'Technology' },
  world: { ja: '国際', en: 'World' },
  local: { ja: '地域', en: 'Regional' },
  lifestyle: { ja: 'ライフスタイル', en: 'Lifestyle' },
  healthcare: { ja: 'ヘルスケア', en: 'Healthcare' },
  business: { ja: 'ビジネス', en: 'Business' },
  science: { ja: '科学', en: 'Science' },
  trendingTopics: { ja: '注目のトピック', en: 'Trending Topics' },

  // Personal Channels
  readingHistory: { ja: '閲覧履歴', en: 'History' },
  recommendedForYou: { ja: 'あなたへのおすすめ', en: 'For You' },

  // Regional cities
  regionalNews: { ja: '地域のニュース', en: 'Regional News' },
  tokyo: { ja: '東京', en: 'Tokyo' },
  osaka: { ja: '大阪', en: 'Osaka' },
  nagoya: { ja: '名古屋', en: 'Nagoya' },
  fukuoka: { ja: '福岡', en: 'Fukuoka' },
  changeRegion: { ja: '地域を変更', en: 'Change Region' },

  // Center Tabs
  tabTop: { ja: 'トップ', en: 'Top' },
  tabFlash: { ja: '速報', en: 'Breaking' },
  tabSociety: { ja: '社会', en: 'Society' },
  tabEconomy: { ja: '経済', en: 'Economy' },
  tabWorld: { ja: '国際', en: 'World' },
  tabTech: { ja: 'テクノロジー', en: 'Technology' },
  tabEntertainment: { ja: 'エンタメ', en: 'Entertainment' },
  tabSports: { ja: 'スポーツ', en: 'Sports' },
  tabLocal: { ja: '地域', en: 'Regional' },
  seeMore: { ja: 'もっと見る >', en: 'See More >' },

  // Center Sections
  mainNewsBadge: { ja: '主要ニュース', en: 'Main News' },
  recommendedHeading: { ja: 'あなたにおすすめ', en: 'Recommended for You' },
  latestNewsHeading: { ja: '最新ニュース', en: 'Latest News' },
  all: { ja: 'すべて', en: 'All' },
  domestic: { ja: '国内', en: 'Domestic' },

  // Weather Widget
  tokyoWeather: { ja: '東京の天気', en: 'Tokyo Weather' },
  today: { ja: '今日 10/15 (火)', en: 'Today 10/15 (Tue)' },
  tomorrow: { ja: '明日 10/16 (水)', en: 'Tomorrow 10/16 (Wed)' },
  sunny: { ja: '晴れ', en: 'Sunny' },
  cloudyRain: { ja: 'くもり一時雨', en: 'Cloudy, brief rain' },

  // Profile Card
  points: { ja: 'ポイント', en: 'Points' },
  favorites: { ja: 'お気に入り', en: 'Favorites' },
  yahooPoints: { ja: 'Yahoo!ポイント', en: 'Yahoo! Points' },
  pointHistory: { ja: 'ポイント履歴 >', en: 'Point History >' },
  pointsCount: { ja: '1,230 ポイント', en: '1,230 pts' },

  // Trending
  surging: { ja: '急上昇', en: 'Surging' },

  // Autumn Promo
  autumnPromoTitle: { ja: '秋の旅行特集', en: 'Autumn Travel Feature' },
  autumnPromoDesc: { ja: 'おすすめの観光スポット・グルメ・宿情報', en: 'Top sightseeing spots, dining, & accommodations' },
  autumnPromoBtn: { ja: '特集を見る >', en: 'View Special >' },

  // AI Summary
  aiSummaryBtn: { ja: 'AI要約', en: 'AI Summary' },
  aiSummaryTitle: { ja: 'Gemini AI 要約 & キーポイント', en: 'Gemini AI Summary & Key Takeaways' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('yp_lang');
    return saved === 'en' ? 'en' : 'ja'; // default to Japanese as in Yahoo! JAPAN
  });

  useEffect(() => {
    localStorage.setItem('yp_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][lang] || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
