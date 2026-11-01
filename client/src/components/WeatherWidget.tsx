import React from 'react';
import { Sun, CloudRain, CloudSun, Cloud } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface WeatherWidgetProps {
  region?: string;
  onOpenPreferences?: () => void;
}

interface CityWeather {
  cityJa: string;
  cityEn: string;
  today: {
    tempHigh: number;
    tempLow: number;
    condJa: string;
    condEn: string;
    icon: 'sun' | 'rain' | 'cloudSun' | 'cloud';
  };
  tomorrow: {
    tempHigh: number;
    tempLow: number;
    condJa: string;
    condEn: string;
    icon: 'sun' | 'rain' | 'cloudSun' | 'cloud';
  };
}

const REGIONAL_WEATHER_DATA: Record<string, CityWeather> = {
  tokyo: {
    cityJa: '東京の天気',
    cityEn: 'Tokyo Weather',
    today: { tempHigh: 21, tempLow: 13, condJa: '晴れ', condEn: 'Sunny', icon: 'sun' },
    tomorrow: { tempHigh: 19, tempLow: 12, condJa: 'くもり時々雨', condEn: 'Cloudy / Rain', icon: 'cloudRain' as any },
  },
  osaka: {
    cityJa: '大阪の天気',
    cityEn: 'Osaka Weather',
    today: { tempHigh: 23, tempLow: 14, condJa: '晴れのち曇り', condEn: 'Sunny then Cloudy', icon: 'cloudSun' },
    tomorrow: { tempHigh: 20, tempLow: 13, condJa: '曇り', condEn: 'Cloudy', icon: 'cloud' },
  },
  nagoya: {
    cityJa: '名古屋の天気',
    cityEn: 'Nagoya Weather',
    today: { tempHigh: 22, tempLow: 12, condJa: '快晴', condEn: 'Clear Sunny', icon: 'sun' },
    tomorrow: { tempHigh: 18, tempLow: 11, condJa: '雨のち晴れ', condEn: 'Rain then Clear', icon: 'cloudRain' as any },
  },
  fukuoka: {
    cityJa: '福岡の天気',
    cityEn: 'Fukuoka Weather',
    today: { tempHigh: 24, tempLow: 15, condJa: '晴れ', condEn: 'Sunny', icon: 'sun' },
    tomorrow: { tempHigh: 21, tempLow: 14, condJa: 'くもり', condEn: 'Cloudy', icon: 'cloud' },
  },
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  region = 'tokyo',
  onOpenPreferences,
}) => {
  const { lang } = useLanguage();

  const cityKey = region.toLowerCase();
  const weather = REGIONAL_WEATHER_DATA[cityKey] || REGIONAL_WEATHER_DATA.tokyo;

  // Compute dynamic today & tomorrow dates
  const now = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(now.getDate() + 1);

  const formatDayLabel = (d: Date, isToday: boolean) => {
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const jaDays = ['日', '月', '火', '水', '木', '金', '土'];
    const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekday = lang === 'ja' ? jaDays[d.getDay()] : enDays[d.getDay()];

    if (lang === 'ja') {
      return `${isToday ? '今日' : '明日'} ${month}/${day} (${weekday})`;
    }
    return `${isToday ? 'Today' : 'Tomorrow'} ${month}/${day} (${weekday})`;
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'rain':
      case 'cloudRain':
        return <CloudRain className="w-7 h-7 text-blue-500" />;
      case 'cloudSun':
        return <CloudSun className="w-7 h-7 text-amber-500" />;
      case 'cloud':
        return <Cloud className="w-7 h-7 text-slate-400" />;
      case 'sun':
      default:
        return <Sun className="w-7 h-7 text-amber-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <span className="font-bold text-slate-800">
          {lang === 'ja' ? weather.cityJa : weather.cityEn}
        </span>
        <button
          type="button"
          onClick={onOpenPreferences}
          className="text-[11px] text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5"
        >
          <span>{lang === 'ja' ? '地域変更 >' : 'Change >'}</span>
        </button>
      </div>

      <div className="pt-2.5 grid grid-cols-2 divide-x divide-slate-100 text-center">
        {/* Today */}
        <div className="px-2 space-y-1">
          <p className="text-[10px] text-slate-500 font-medium">
            {formatDayLabel(now, true)}
          </p>
          <div className="flex justify-center py-1">
            {renderIcon(weather.today.icon)}
          </div>
          <div className="text-xs font-bold">
            <span className="text-red-500">{weather.today.tempHigh}℃</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-blue-500">{weather.today.tempLow}℃</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {lang === 'ja' ? weather.today.condJa : weather.today.condEn}
          </p>
        </div>

        {/* Tomorrow */}
        <div className="px-2 space-y-1">
          <p className="text-[10px] text-slate-500 font-medium">
            {formatDayLabel(tomorrowDate, false)}
          </p>
          <div className="flex justify-center py-1">
            {renderIcon(weather.tomorrow.icon)}
          </div>
          <div className="text-xs font-bold">
            <span className="text-red-500">{weather.tomorrow.tempHigh}℃</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-blue-500">{weather.tomorrow.tempLow}℃</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {lang === 'ja' ? weather.tomorrow.condJa : weather.tomorrow.condEn}
          </p>
        </div>
      </div>
    </div>
  );
};
