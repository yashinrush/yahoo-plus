import React from 'react';
import { Sun, CloudRain } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const WeatherWidget: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <span className="font-bold text-slate-800">{t('tokyoWeather')}</span>
        <button type="button" className="text-[11px] text-blue-600 hover:underline cursor-pointer">
          {t('seeMore')}
        </button>
      </div>

      <div className="pt-2.5 grid grid-cols-2 divide-x divide-slate-100 text-center">
        {/* Today */}
        <div className="px-2 space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">{t('today')}</p>
          <div className="flex justify-center py-1">
            <Sun className="w-8 h-8 text-amber-500" />
          </div>
          <div className="text-xs font-bold">
            <span className="text-red-500">24℃</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-blue-500">16℃</span>
          </div>
          <p className="text-[11px] text-slate-600">{t('sunny')}</p>
        </div>

        {/* Tomorrow */}
        <div className="px-2 space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">{t('tomorrow')}</p>
          <div className="flex justify-center py-1">
            <CloudRain className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-xs font-bold">
            <span className="text-red-500">22℃</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-blue-500">14℃</span>
          </div>
          <p className="text-[11px] text-slate-600">{t('cloudyRain')}</p>
        </div>
      </div>
    </div>
  );
};
