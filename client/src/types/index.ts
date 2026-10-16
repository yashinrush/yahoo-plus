export type NewsCategory =
  | 'all'
  | 'major'
  | 'technology'
  | 'business'
  | 'world'
  | 'sports'
  | 'entertainment'
  | 'science'
  | 'lifestyle'
  | 'local';

export interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  source: {
    name: string;
    url?: string;
  };
  image?: string;
  publishedAt: string;
  category: string;
  isTrending?: boolean;
  isFeatured?: boolean;
  isBookmarked?: boolean;
  commentsCount?: number;
  likesCount?: number;
  readTimeMinutes?: number;
  aiSummary?: {
    summary: string;
    keyPoints: string[];
  };
}

export interface RecommendedItem {
  id: string;
  title: string;
  category: string;
  timeAgo: string;
  image: string;
  url: string;
  isBookmarked?: boolean;
}

export interface LatestNewsItem {
  id: string;
  title: string;
  category: string;
  timeAgo: string;
  image: string;
  url: string;
  commentsCount: number;
}

export interface WeatherDay {
  label: string;
  dateStr: string;
  condition: string;
  tempHigh: number;
  tempLow: number;
  iconType: 'sun' | 'rain' | 'cloud';
}

export interface TrendingItem {
  id: string;
  rank: number;
  keyword: string;
  isSurging?: boolean;
}

export type TrendingTopic = {
  id: string;
  rank: number;
  keyword: string;
  change: 'up' | 'down' | 'same' | 'new';
  articleCount?: number;
};

export type WeatherInfo = {
  location: string;
  condition: string;
  tempC: number;
  tempHighC: number;
  tempLowC: number;
  rainProbabilityPercent: number;
  humidityPercent: number;
  icon: string;
};
