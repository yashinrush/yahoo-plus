import { Bell, Bookmark, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { SearchBar } from './SearchBar.js';

interface HeaderProps {
  onSearch: (query: string) => void;
  bookmarkCount: number;
  onBookmarkClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  bookmarkCount,
  onBookmarkClick,
}) => {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1240px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo: Authentic YAHOO! PULSE */}
        <div className="shrink-0 flex items-center">
          <a href="/" className="flex flex-col items-start leading-none group" aria-label="Yahoo Pulse">
            <span className="text-[#e60012] font-serif font-black text-2xl tracking-tighter sm:text-3xl">
              YAHOO!
            </span>
            <span className="text-[#e60012] font-sans font-bold text-[9px] tracking-[0.25em] -mt-0.5 pl-0.5">
              PULSE
            </span>
          </a>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-[580px]">
          <SearchBar onSearch={onSearch} placeholder={t('searchPlaceholder')} />
        </div>

        {/* Right Action Icons & User */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* EN / JA Language Switcher */}
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Toggle Language (English / 日本語)"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className={lang === 'ja' ? 'font-bold text-blue-600' : 'text-slate-400'}>JA</span>
            <span className="text-slate-300">/</span>
            <span className={lang === 'en' ? 'font-bold text-blue-600' : 'text-slate-400'}>EN</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer"
            aria-label={t('notifications')}
          >
            <Bell className="w-4.5 h-4.5" />
          </button>

          {/* Bookmarks */}
          <button
            type="button"
            onClick={onBookmarkClick}
            className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors relative cursor-pointer"
            aria-label={t('savedArticles')}
          >
            <Bookmark className={`w-4.5 h-4.5 ${bookmarkCount > 0 ? 'text-blue-600 fill-blue-600' : ''}`} />
            {bookmarkCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* User Profile: Taro さん */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 pl-1">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Taro"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-700">
              {t('userName')}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
          </div>
        </div>
      </div>
    </header>
  );
};
