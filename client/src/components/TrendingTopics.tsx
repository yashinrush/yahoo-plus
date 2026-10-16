import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.js';

interface TrendingTopicItem {
  rank: number;
  keyword: string;
  isSurging?: boolean;
}

interface TrendingTopicsProps {
  onSelectTopic: (keyword: string) => void;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({ onSelectTopic }) => {
  const { lang, t } = useLanguage();
  const [topics, setTopics] = useState<TrendingTopicItem[]>([
    { rank: 1, keyword: lang === 'ja' ? '衆議院選挙 2024' : 'House of Representatives Election 2024', isSurging: true },
    { rank: 2, keyword: lang === 'ja' ? '生成AIの最新動向' : 'Generative AI Innovations', isSurging: true },
    { rank: 3, keyword: lang === 'ja' ? '大谷翔平 最新ニュース' : 'Shohei Ohtani Latest Updates' },
    { rank: 4, keyword: lang === 'ja' ? '秋の旅行特集' : 'Autumn Travel Features' },
    { rank: 5, keyword: lang === 'ja' ? '新型iPhone 発表' : 'Next-Gen iPhone Announcement' },
  ]);

  useEffect(() => {
    fetch(`/api/trending?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
          setTopics(data.topics);
        }
      })
      .catch(() => {});
  }, [lang]);

  const handleTopicClick = (keyword: string) => {
    onSelectTopic(keyword);
    // Record hit to boost trending velocity
    fetch('/api/trending/hit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword }),
    }).catch(() => {});
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-800">
          {t('trendingTopics')}
        </h3>
      </div>

      <ol className="space-y-2">
        {topics.map((item) => {
          const isTopTwo = item.rank <= 2;

          return (
            <li key={item.rank}>
              <button
                type="button"
                onClick={() => handleTopicClick(item.keyword)}
                className="w-full flex items-center justify-between gap-2 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isTopTwo
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <span className="text-xs text-slate-800 group-hover:text-blue-600 transition-colors truncate font-medium">
                    {item.keyword}
                  </span>
                </div>

                {item.isSurging && (
                  <span className="shrink-0 text-[10px] font-bold bg-[#e60012] text-white px-1 py-0.2 rounded shadow-2xs">
                    {t('surging')}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="pt-2 border-t border-slate-100 text-right">
        <button type="button" className="text-[11px] text-blue-600 hover:underline cursor-pointer">
          {t('seeMore')}
        </button>
      </div>
    </div>
  );
};
