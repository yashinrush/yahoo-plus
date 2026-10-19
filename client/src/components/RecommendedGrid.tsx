import React, { useState, useEffect } from 'react';
import { Bookmark, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface RecommendedArticle {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  image: string;
  url: string;
}

const DEFAULT_RECOMMENDED: RecommendedArticle[] = [
  {
    id: 'rec-1',
    title: '在宅ワークで変わる働き方 知っておきたいポイント',
    category: 'ライフスタイル',
    publishedAt: '3時間前',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
  {
    id: 'rec-2',
    title: '生成AIがもたらす未来 私たちの生活はどう変わる？',
    category: 'テクノロジー',
    publishedAt: '5時間前',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
  {
    id: 'rec-3',
    title: '秋に行きたい！日本の絶景 紅葉スポット10選',
    category: 'トラベル',
    publishedAt: '6時間前',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
  {
    id: 'rec-4',
    title: '東京の最新グルメスポット 今話題の人気店まとめ',
    category: 'グルメ',
    publishedAt: '8時間前',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
  {
    id: 'rec-5',
    title: '日本の先端半導体エコシステム 官民連携の最新進展',
    category: 'テクノロジー',
    publishedAt: '9時間前',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
  {
    id: 'rec-6',
    title: '新幹線 延伸計画の現状と地域経済への波及効果',
    category: '経済',
    publishedAt: '10時間前',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
  {
    id: 'rec-7',
    title: '健康長寿を実現する日本食の知恵 最新栄養学の視点',
    category: 'ヘルスケア',
    publishedAt: '12時間前',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
  {
    id: 'rec-8',
    title: '宇宙探査の新時代 日本の小型月面着陸機がもたらす知見',
    category: '科学',
    publishedAt: '14時間前',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    url: 'https://news.yahoo.co.jp',
  },
];

interface RecommendedGridProps {
  onToggleBookmark: (id: string, article?: any) => void;
  bookmarkedIds: Set<string>;
  onSelectArticle?: (article: any) => void;
}

export const RecommendedGrid: React.FC<RecommendedGridProps> = ({
  onToggleBookmark,
  bookmarkedIds,
  onSelectArticle,
}) => {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<RecommendedArticle[]>(DEFAULT_RECOMMENDED);
  const [page, setPage] = useState<number>(0);
  const pageSize = 4;

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/news/recommended?lang=${lang}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.articles && data.articles.length > 0) {
          const mapped: RecommendedArticle[] = data.articles.map((a: any, idx: number) => ({
            id: a.id || `rec-live-${idx}`,
            title: a.title,
            category: a.category || (lang === 'ja' ? 'おすすめ' : 'Recommended'),
            publishedAt: a.publishedAt || (lang === 'ja' ? '本日' : 'Today'),
            image: a.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
            url: a.url || 'https://news.yahoo.co.jp',
          }));
          setItems(mapped);
          setPage(0);
        }
      })
      .catch(() => {
        // Fallback active
      });

    return () => {
      isMounted = false;
    };
  }, [lang]);

  const totalPages = Math.ceil(items.length / pageSize);
  const currentItems = items.slice(page * pageSize, (page + 1) * pageSize);

  const nextPage = () => {
    setPage((prev) => (prev + 1 < totalPages ? prev + 1 : 0));
  };

  const prevPage = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  return (
    <div className="bg-white p-3 sm:p-3.5 border-b border-slate-200 relative">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900">
            {t('recommendedHeading')}
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            ({page + 1}/{totalPages})
          </span>
        </div>

        {/* Carousel indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === page ? 'bg-blue-600 w-4' : 'bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative group/carousel">
        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 transition-opacity duration-200">
          {currentItems.map((item) => {
            const isBookmarked = bookmarkedIds.has(item.id) || bookmarkedIds.has(item.url);

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between group cursor-pointer"
                onClick={() => {
                  if (onSelectArticle) {
                    onSelectArticle({
                      id: item.id,
                      title: item.title,
                      description: item.title,
                      category: item.category,
                      publishedAt: item.publishedAt,
                      image: item.image,
                      url: item.url,
                      source: { name: 'Yahoo! おすすめ' },
                    });
                  } else {
                    window.open(item.url, '_blank');
                  }
                }}
              >
                <div>
                  <div className="rounded-md overflow-hidden h-20 sm:h-24 bg-slate-100 border border-slate-200/80 mb-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-blue-600 font-semibold">{item.category}</span>
                    <span>{item.publishedAt}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(item.id, item);
                    }}
                    className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                    aria-label="Bookmark"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Circular Prev Slider Arrow */}
        {page > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevPage();
            }}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer z-10"
            aria-label="Previous recommendations"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Circular Next Slider Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextPage();
          }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-105 transition-all cursor-pointer z-10"
          aria-label="Next recommendations"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
