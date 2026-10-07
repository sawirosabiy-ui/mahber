import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';

interface WelcomeSplashProps {
  onEnter: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onEnter }) => {
  const { t, language } = useLanguage();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center text-center p-6 bg-[#151311] overflow-hidden select-none animate-fade-in">
      {/* Background imagery with sacred lighting */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=1200&auto=format&fit=crop&q=80"
          alt="Lalibela Rock-hewn Church"
          className="w-full h-full object-cover object-center filter brightness-40 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151311] via-[#151311]/70 to-[#151311]/90" />
      </div>

      {/* Top sacred emblem */}
      <div className="relative z-10 pt-12 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[#B89A5A]/15 border-2 border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A] shadow-candle-glow mb-4">
          <EthiopianCross size={48} color="#B89A5A" />
        </div>
      </div>

      {/* Center typography */}
      <div className="relative z-10 space-y-3 max-w-xs">
        <h1 className="text-2xl font-bold tracking-tight text-[#F5EFE3]">
          {language === 'am' ? 'መድኃኔዓለም ማኅበር' : 'MEDHANIALEM MAHBER'}
        </h1>
        <p className="text-sm text-[#B89A5A] font-serif tracking-widest uppercase">
          {language === 'am' ? 'አንድ ማኅበር ፣ አንድ ቤተክርስቲያን' : 'ONE FELLOWSHIP • ONE CHURCH'}
        </p>

        <SacredDivider className="my-3" />

        <p className="text-xs text-gray-300 font-light leading-relaxed">
          {language === 'am'
            ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ እምነት እና ወንድማማችነት ኅብረት'
            : 'Private Ethiopian Orthodox Christian Fellowship'}
        </p>
      </div>

      {/* Bottom Action & Motto */}
      <div className="relative z-10 pb-8 w-full max-w-xs space-y-4">
        <button
          onClick={onEnter}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-sm font-semibold tracking-wide shadow-sacred transition touch-press border border-[#B89A5A]/30 flex items-center justify-center gap-2"
        >
          <span>ወደ ማኅበሩ ይግቡ (Enter)</span>
        </button>

        <div className="text-xs text-[#B89A5A]/80 font-serif">
          {t.welcomeInGodsName}
        </div>
      </div>
    </div>
  );
};
