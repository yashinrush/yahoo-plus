import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { Article } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';

interface HeroSectionProps {
  mainArticle: Article;
  subArticles: Article[];
  onSelectArticle?: (article: Article) => void;
}

interface SummaryData {
  summary: string;
  keyPoints: string[];
  model?: string;
  cached?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  mainArticle,
  subArticles,
  onSelectArticle,
}) => {
  const { lang, t } = useLanguage();
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleToggleSummary = async () => {
    if (!showAiSummary) {
      setShowAiSummary(true);
      if (!summaryData) {
        setIsSummarizing(true);
        try {
          const res = await fetch('/api/news/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: mainArticle.id,
              title: mainArticle.title,
              description: mainArticle.description,
              url: mainArticle.url,
              lang,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              setSummaryData(json.data);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch summary:', err);
        } finally {
          setIsSummarizing(false);
        }
      }
    } else {
      setShowAiSummary(false);
    }
  };

  return (
    <div className="bg-white p-3.5 border-b border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Side: Big Featured Photo Card */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="relative rounded-lg overflow-hidden h-[260px] sm:h-[300px] group bg-slate-900">
            <img
              src={mainArticle.image || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'}
              alt={mainArticle.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 cursor-pointer"
              onClick={() => onSelectArticle && onSelectArticle(mainArticle)}
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

            {/* Top-left "主要ニュース" Badge */}
            <div className="absolute top-3 left-3">
              <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded">
                {t('mainNewsBadge')}
              </span>
            </div>

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white space-y-2">
              <h2
                onClick={() => onSelectArticle && onSelectArticle(mainArticle)}
                className="text-base sm:text-lg font-bold leading-snug line-clamp-2 hover:underline cursor-pointer"
              >
                {mainArticle.title}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs text-slate-200 pt-1">
                {/* Left Metadata Group */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                    {mainArticle.category}
                  </span>
                  <span className="text-[11px] text-slate-300 shrink-0">{mainArticle.publishedAt}</span>
                  <button
                    type="button"
                    onClick={() => onSelectArticle && onSelectArticle(mainArticle)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <ThumbsUp className="w-3 h-3 text-slate-300" />
                    <span>{mainArticle.likesCount ? (mainArticle.likesCount > 999 ? `${(mainArticle.likesCount/1000).toFixed(1)}k` : mainArticle.likesCount) : '1.2k'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectArticle && onSelectArticle(mainArticle)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    <MessageSquare className="w-3 h-3 text-slate-300" />
                    <span>{mainArticle.commentsCount || 86}</span>
                  </button>
                </div>

                {/* Right Action Buttons: Comments & AI Summary */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Comments Drawer Button */}
                  <button
                    type="button"
                    onClick={() => onSelectArticle && onSelectArticle(mainArticle)}
                    className="whitespace-nowrap flex items-center gap-1 text-[11px] font-bold bg-[#e60012] hover:bg-red-700 text-white h-7 px-2.5 py-1 rounded transition-colors cursor-pointer shadow-2xs shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'ja' ? 'ヤフコメ' : 'Comments'}</span>
                  </button>

                  {/* AI Summary Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleSummary}
                    className="whitespace-nowrap flex items-center gap-1 text-[11px] font-bold bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white h-7 px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{lang === 'ja' ? 'AI要約' : 'AI Summary'}</span>
                    {showAiSummary ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable AI Summary Card */}
          {showAiSummary && (
            <div className="mt-2.5 p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-700 space-y-2 animate-fadeIn">
              <div className="font-bold text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>{t('aiSummaryTitle')}</span>
                </div>
                {summaryData?.model && (
                  <span className="text-[10px] font-semibold text-blue-700 bg-white px-1.5 py-0.2 rounded border border-blue-200">
                    {summaryData.model} {summaryData.cached ? '• Cached' : '• Live'}
                  </span>
                )}
              </div>

              {isSummarizing ? (
                <div className="flex items-center gap-2 py-3 text-blue-600 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'ja' ? 'Gemini AI が記事を要約中...' : 'Gemini AI generating executive takeaways...'}</span>
                </div>
              ) : summaryData ? (
                <>
                  <p className="leading-relaxed font-medium text-slate-800">
                    {summaryData.summary}
                  </p>
                  <ul className="space-y-1 pt-1.5 border-t border-blue-200/80 text-slate-700">
                    {summaryData.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-slate-500 italic">
                  {mainArticle.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: 4 Compact Stacked Headline Rows */}
        <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-slate-100">
          {subArticles.slice(0, 4).map((sub, idx) => (
            <div
              key={sub.id || idx}
              onClick={() => onSelectArticle && onSelectArticle(sub)}
              className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-24 h-16 rounded overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80">
                <img
                  src={sub.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80'}
                  alt={sub.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                  {sub.title}
                </h3>

                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="text-blue-600 font-semibold">{sub.category}</span>
                  <span>{sub.publishedAt}</span>
                  <span className="flex items-center gap-0.5">
                    <ThumbsUp className="w-2.5 h-2.5 text-slate-400" />
                    <span>{sub.likesCount ? (sub.likesCount > 999 ? `${(sub.likesCount/1000).toFixed(1)}k` : sub.likesCount) : '532'}</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageSquare className="w-2.5 h-2.5 text-slate-400" />
                    <span>{sub.commentsCount || 24}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
