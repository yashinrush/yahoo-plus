import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';

interface NewsCategoryTabsProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const NewsCategoryTabs: React.FC<NewsCategoryTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'top', key: 'tabTop' },
    { id: 'flash', key: 'tabFlash' },
    { id: 'society', key: 'tabSociety' },
    { id: 'economy', key: 'tabEconomy' },
    { id: 'world', key: 'tabWorld' },
    { id: 'technology', key: 'tabTech' },
    { id: 'entertainment', key: 'tabEntertainment' },
    { id: 'sports', key: 'tabSports' },
    { id: 'local', key: 'tabLocal' },
  ];

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-2 pt-1">
      <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`pb-2.5 pt-1 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <span>{t(tab.key)}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="text-[11px] text-slate-500 hover:text-blue-600 shrink-0 pl-2 whitespace-nowrap cursor-pointer"
      >
        {t('seeMore')}
      </button>
    </div>
  );
};
