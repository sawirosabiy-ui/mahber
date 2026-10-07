import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { EthiopianCross } from './EthiopianCross';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

export const LoadingView: React.FC<{ message?: string }> = ({ message }) => {
  const { language } = useLanguage();
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A] animate-pulse shadow-candle-glow">
        <EthiopianCross size={24} color="#B89A5A" />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
          {message || (language === 'am' ? 'የማኅበራችሁን መረጃ በመጫን ላይ...' : 'Loading your Mahber...')}
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5 font-serif">
          {language === 'am' ? 'በእግዚአብሔር ስም' : 'In the Name of God'}
        </div>
      </div>
    </div>
  );
};

export const EmptyView: React.FC<{ title?: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const { language } = useLanguage();
  return (
    <div className="py-16 px-4 rounded-3xl bg-[#201D19]/60 border border-[#B89A5A]/15 flex flex-col items-center justify-center text-center space-y-2.5">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
        <Inbox size={20} />
      </div>
      <div className="text-xs font-bold text-[#F5EFE3]">
        {title || (language === 'am' ? 'ምንም መረጃ አልተገኘም' : 'No records found')}
      </div>
      {subtitle && <p className="text-[11px] text-gray-400 max-w-xs">{subtitle}</p>}
    </div>
  );
};

export const ErrorView: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  const { language } = useLanguage();
  return (
    <div className="py-16 px-4 rounded-3xl bg-[#6F2630]/15 border border-[#6F2630]/30 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-[#6F2630]/30 text-[#D98A94] flex items-center justify-center">
        <AlertCircle size={22} />
      </div>
      <div>
        <div className="text-xs font-bold text-[#F5EFE3]">
          {language === 'am' ? 'ስህተት ተከስቷል' : 'Something went wrong'}
        </div>
        <p className="text-[11px] text-[#E5DCD0] mt-1 max-w-xs">
          {message || (language === 'am' ? 'እባክዎን እንደገና ይሞክሩ።' : 'Please try again.')}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-xl bg-[#6F2630] text-white text-xs font-semibold hover:bg-[#8C3542] transition flex items-center gap-1.5"
        >
          <RefreshCw size={13} />
          <span>{language === 'am' ? 'እንደገና ሞክር' : 'Retry'}</span>
        </button>
      )}
    </div>
  );
};
