import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface LatestItem {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  comments: number;
  image: string;
  url: string;
}

const DEFAULT_LATEST_BY_FILTER: Record<string, LatestItem[]> = {
  all: [
    {
      id: 'lat-1',
      title: '東京都心の再開発計画 新たな商業施設の建設が始まる',
      category: '社会',
      publishedAt: '10分前',
      comments: 432,
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-2',
      title: '再生可能エネルギーの導入拡大 政府が新たな目標を発表',
      category: '経済',
      publishedAt: '25分前',
      comments: 318,
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-3',
      title: '動画配信サービスの新機能発表 ユーザー体験を強化',
      category: 'テクノロジー',
      publishedAt: '40分前',
      comments: 276,
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-4',
      title: 'プロ野球 きょうからCS開幕 各チームの意気込み',
      category: 'スポーツ',
      publishedAt: '1時間前',
      comments: 520,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
  ],
  domestic: [
    {
      id: 'lat-dom-1',
      title: '全国の紅葉見頃予想 気象協会が最新情報を公開',
      category: '国内',
      publishedAt: '15分前',
      comments: 180,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-dom-2',
      title: '新幹線ダイヤ改正 主要駅の混雑緩和へ新ダイヤ導入',
      category: '交通',
      publishedAt: '35分前',
      comments: 240,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-dom-3',
      title: '地方自治体でDX推進 行政手続きの完全オンライン化へ',
      category: '行政',
      publishedAt: '50分前',
      comments: 95,
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-dom-4',
      title: '全国の伝統工芸品 若手職人による新プロダクトが注目',
      category: '文化',
      publishedAt: '1時間前',
      comments: 64,
      image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
  ],
  world: [
    {
      id: 'lat-w-1',
      title: '国連気候変動サミット 各国首脳が新たな排出削減策で合意',
      category: '国際',
      publishedAt: '20分前',
      comments: 310,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-w-2',
      title: '米主要株価指数が最高値を更新 ハイテク株主導で続伸',
      category: '国際経済',
      publishedAt: '45分前',
      comments: 420,
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-w-3',
      title: '欧州中銀 理事会で政策金利の引き下げを決定',
      category: '金融',
      publishedAt: '1時間前',
      comments: 185,
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-w-4',
      title: 'アジア太平洋経済協力会議 デジタル貿易ルール協議へ',
      category: '国際',
      publishedAt: '2時間前',
      comments: 140,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
  ],
  economy: [
    {
      id: 'lat-eco-1',
      title: '東証プライム上場企業の業績見通し 上方修正が相次ぐ',
      category: '経済',
      publishedAt: '12分前',
      comments: 290,
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-eco-2',
      title: '円相場 1ドル＝150円台前半で推移 日米金利差を意識',
      category: '為替',
      publishedAt: '30分前',
      comments: 512,
      image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-eco-3',
      title: '国内スタートアップ資金調達額 ディープテック分野で急拡大',
      category: 'ベンチャー',
      publishedAt: '55分前',
      comments: 88,
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-eco-4',
      title: '大手流通各社 プライベートブランドの値下げ攻勢',
      category: '消費',
      publishedAt: '1時間前',
      comments: 360,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
  ],
  entertainment: [
    {
      id: 'lat-ent-1',
      title: '今秋の話題作 映画興行収入ランキングで初登場首位',
      category: 'エンタメ',
      publishedAt: '18分前',
      comments: 610,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-ent-2',
      title: '世界的人気アニメの新作シリーズ 配信開始日が決定',
      category: 'アニメ',
      publishedAt: '40分前',
      comments: 780,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-ent-3',
      title: '日本武道館での記念ライブチケット 即日ソールドアウト',
      category: '音楽',
      publishedAt: '1時間前',
      comments: 340,
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-ent-4',
      title: '人気俳優主演の新作ドラマ 視聴率が好調なスタート',
      category: 'テレビ',
      publishedAt: '2時間前',
      comments: 290,
      image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
  ],
  sports: [
    {
      id: 'lat-spo-1',
      title: 'メジャーリーグ 大谷翔平選手 逆転ホームランでチーム勝利',
      category: 'MLB',
      publishedAt: '8分前',
      comments: 940,
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-spo-2',
      title: 'サッカー欧州CL 日本人選手がフル出場でアシストを記録',
      category: 'サッカー',
      publishedAt: '22分前',
      comments: 480,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-spo-3',
      title: 'プロバスケBリーグ 開幕節から白熱の攻防 観客動員も更新',
      category: 'バスケ',
      publishedAt: '50分前',
      comments: 210,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
    {
      id: 'lat-spo-4',
      title: '女子ゴルフ国内ツアー 期待のルーキーが単独首位で決勝へ',
      category: 'ゴルフ',
      publishedAt: '1時間前',
      comments: 165,
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=400&q=80',
      url: 'https://news.yahoo.co.jp',
    },
  ],
};

interface LatestNewsGridProps {
  onSelectArticle?: (article: any) => void;
}

export const LatestNewsGrid: React.FC<LatestNewsGridProps> = ({ onSelectArticle }) => {
  const { lang, t } = useLanguage();
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [items, setItems] = useState<LatestItem[]>(DEFAULT_LATEST_BY_FILTER.all);
  const [isLoading, setIsLoading] = useState(false);

  const filterOptions = [
    { id: 'all', labelJa: 'すべて', labelEn: 'All', apiCategory: undefined },
    { id: 'domestic', labelJa: '国内', labelEn: 'Domestic', apiCategory: 'nation' },
    { id: 'world', labelJa: '国際', labelEn: 'World', apiCategory: 'world' },
    { id: 'economy', labelJa: '経済', labelEn: 'Economy', apiCategory: 'business' },
    { id: 'entertainment', labelJa: 'エンタメ', labelEn: 'Entertainment', apiCategory: 'entertainment' },
    { id: 'sports', labelJa: 'スポーツ', labelEn: 'Sports', apiCategory: 'sports' },
  ];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const option = filterOptions.find((f) => f.id === activeSubFilter);
    const categoryParam = option?.apiCategory ? `&category=${option.apiCategory}` : '';

    fetch(`/api/news?lang=${lang}${categoryParam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;

        if (data?.articles && data.articles.length > 0) {
          const mapped: LatestItem[] = data.articles.slice(0, 4).map((a: any, idx: number) => ({
            id: a.id || `lat-live-${idx}`,
            title: a.title,
            category: a.category || (lang === 'ja' ? '最新' : 'Latest'),
            publishedAt: a.publishedAt || (lang === 'ja' ? '新着' : 'New'),
            comments: a.commentsCount || Math.floor(Math.random() * 300) + 50,
            image: a.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
            url: a.url || 'https://news.yahoo.co.jp',
          }));
          setItems(mapped);
        } else {
          // Use filter default
          setItems(DEFAULT_LATEST_BY_FILTER[activeSubFilter] || DEFAULT_LATEST_BY_FILTER.all);
        }
      })
      .catch(() => {
        if (isMounted) {
          setItems(DEFAULT_LATEST_BY_FILTER[activeSubFilter] || DEFAULT_LATEST_BY_FILTER.all);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lang, activeSubFilter]);

  return (
    <div className="bg-white p-3 sm:p-3.5">
      {/* Header with Sub Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900">
            {t('latestNewsHeading')}
          </h3>
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 text-xs overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          {filterOptions.map((opt) => {
            const isActive = activeSubFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveSubFilter(opt.id)}
                className={`transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-blue-600 font-bold underline underline-offset-4'
                    : 'text-slate-500 hover:text-slate-800 font-normal'
                }`}
              >
                {lang === 'ja' ? opt.labelJa : opt.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {items.map((item) => (
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
                  commentsCount: item.comments,
                  source: { name: 'Yahoo! 最新ニュース' },
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

              <span className="flex items-center gap-0.5 text-slate-500 font-medium shrink-0">
                <MessageSquare className="w-2.5 h-2.5" />
                {item.comments}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
