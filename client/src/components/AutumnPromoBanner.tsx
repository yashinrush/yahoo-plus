import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';

export const AutumnPromoBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="relative rounded-lg overflow-hidden shadow-2xs group cursor-pointer border border-slate-200">
      <img
        src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"
        alt="Autumn Travel"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80';
        }}
        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex flex-col justify-between text-white">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-amber-300 uppercase">
            Yahoo! JAPAN Special
          </span>
          <h4 className="font-black text-base leading-tight mt-0.5">
            {t('autumnPromoTitle')}
          </h4>
          <p className="text-[10px] text-slate-200 line-clamp-1 mt-0.5">
            {t('autumnPromoDesc')}
          </p>
        </div>

        <div>
          <button
            type="button"
            className="w-full py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
          >
            {t('autumnPromoBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
