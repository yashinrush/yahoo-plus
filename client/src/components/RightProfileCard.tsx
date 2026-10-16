import React from 'react';
import { ChevronRight, Mail, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const RightProfileCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs space-y-3">
      {/* Top Profile Bar */}
      <div className="flex items-center justify-between cursor-pointer hover:opacity-85 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Taro"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-xs text-slate-800">{t('userName')}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 4 Circular Shortcuts */}
      <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-slate-100">
        {/* Mail */}
        <button type="button" className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <Mail className="w-4 h-4 fill-white" />
          </div>
          <span className="text-[10px] text-slate-600 font-medium">{t('mail')}</span>
        </button>

        {/* PayPay */}
        <button type="button" className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-2xs group-hover:scale-105 transition-transform">
            P
          </div>
          <span className="text-[10px] text-slate-600 font-medium">PayPay</span>
        </button>

        {/* Points */}
        <button type="button" className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-blue-900 flex items-center justify-center font-black text-sm shadow-2xs group-hover:scale-105 transition-transform">
            T
          </div>
          <span className="text-[10px] text-slate-600 font-medium">{t('points')}</span>
        </button>

        {/* Favorites */}
        <button type="button" className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <Star className="w-4.5 h-4.5 fill-amber-500" />
          </div>
          <span className="text-[10px] text-slate-600 font-medium">{t('favorites')}</span>
        </button>
      </div>

      {/* Yahoo! Points Balance Bar */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-900 text-yellow-400 font-black text-[10px] flex items-center justify-center">
            T
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">{t('yahooPoints')}</p>
            <p className="font-bold text-slate-800 text-xs">{t('pointsCount')}</p>
          </div>
        </div>

        <button type="button" className="text-[10px] text-blue-600 hover:underline cursor-pointer">
          {t('pointHistory')}
        </button>
      </div>
    </div>
  );
};
