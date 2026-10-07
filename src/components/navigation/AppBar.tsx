import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EthiopianCross } from '../common/EthiopianCross';
import { Bell } from 'lucide-react';

interface AppBarProps {
  onProfileClick: () => void;
  onNotificationsClick: () => void;
  unreadCount?: number;
}

export const AppBar: React.FC<AppBarProps> = ({
  onProfileClick,
  onNotificationsClick,
  unreadCount = 0,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-2.5 bg-[#151311]/90 dark:bg-[#151311]/90 light:bg-[#F5EFE7]/90 backdrop-blur-md border-b border-[#B89A5A]/15 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A]">
          <EthiopianCross size={18} color="#B89A5A" />
        </div>
        <div>
          <div className="text-xs font-bold leading-tight tracking-tight text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
            {language === 'am' ? 'መድኃኔዓለም ማኅበር' : 'MEDHANIALEM'}
          </div>
          <div className="text-[9px] text-[#B89A5A] font-serif uppercase tracking-wider">
            {language === 'am' ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ' : 'Orthodox Mahber'}
          </div>
        </div>
      </div>

      {/* Right Actions: Notification Bell + Current User Avatar */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onNotificationsClick}
          className="p-1.5 rounded-full hover:bg-white/5 transition relative text-gray-400 hover:text-white"
          title={language === 'am' ? 'ማሳወቂያዎች' : 'Notifications'}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute 1 top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#B89A5A] ring-2 ring-[#151311]" />
          )}
        </button>

        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition touch-press"
          title="View Profile / Switch User"
        >
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-[#B89A5A]/40"
            />
            {currentUser.role === 'admin' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#B89A5A] ring-2 ring-[#151311]" />
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
