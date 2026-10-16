import React from 'react';
import {
  Home,
  Newspaper,
  Film,
  Trophy,
  TrendingUp,
  Cpu,
  Globe,
  MapPin,
  Coffee,
  Heart,
  Briefcase,
  Atom,
  Flame,
  Bookmark,
  History,
  UserCheck,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface CategorySidebarProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  bookmarkCount: number;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  activeCategory,
  onSelectCategory,
  bookmarkCount,
}) => {
  const { t } = useLanguage();

  const mainCategories = [
    { id: 'home', key: 'home', icon: Home },
    { id: 'news', key: 'news', icon: Newspaper },
    { id: 'entertainment', key: 'entertainment', icon: Film },
    { id: 'sports', key: 'sports', icon: Trophy },
    { id: 'economy', key: 'economy', icon: TrendingUp },
    { id: 'technology', key: 'technology', icon: Cpu },
    { id: 'world', key: 'world', icon: Globe },
    { id: 'local', key: 'local', icon: MapPin },
    { id: 'lifestyle', key: 'lifestyle', icon: Coffee },
    { id: 'healthcare', key: 'healthcare', icon: Heart },
    { id: 'business', key: 'business', icon: Briefcase },
    { id: 'science', key: 'science', icon: Atom },
    { id: 'trendingTopics', key: 'trendingTopics', icon: Flame },
  ];

  const personalChannels = [
    { id: 'bookmarks', key: 'savedArticles', icon: Bookmark, badge: bookmarkCount },
    { id: 'history', key: 'readingHistory', icon: History },
    { id: 'recommended', key: 'recommendedForYou', icon: UserCheck },
  ];

  const regions = [
    { id: 'tokyo', key: 'tokyo' },
    { id: 'osaka', key: 'osaka' },
    { id: 'nagoya', key: 'nagoya' },
    { id: 'fukuoka', key: 'fukuoka' },
  ];

  return (
    <aside className="w-full text-xs space-y-3" aria-label="Categories">
      {/* 1. Main Navigation */}
      <nav className="space-y-0.5">
        {mainCategories.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeCategory === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
              }`}
            >
              <IconComponent
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{t(item.key)}</span>
            </button>
          );
        })}
      </nav>

      <hr className="border-slate-200" />

      {/* 2. Personal Channels */}
      <nav className="space-y-0.5">
        {personalChannels.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeCategory === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded transition-colors text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-700 hover:bg-slate-100 font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <IconComponent
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{t(item.key)}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <hr className="border-slate-200" />

      {/* 3. Regional News */}
      <div className="space-y-1">
        <div className="px-3 py-1 font-bold text-slate-800 text-xs">
          {t('regionalNews')}
        </div>
        <div className="space-y-0.5">
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => onSelectCategory(`region-${reg.id}`)}
              className="w-full text-left px-3 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors cursor-pointer text-xs"
            >
              {t(reg.key)}
            </button>
          ))}
          <button
            type="button"
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:underline cursor-pointer text-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('changeRegion')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
