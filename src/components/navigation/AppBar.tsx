import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EthiopianCross } from '../common/EthiopianCross';
import { Bell, ChevronDown, Crown, MessageSquare } from 'lucide-react';

interface AppBarProps {
  onProfileClick: () => void;
  onNotificationsClick: () => void;
  onRoomClick?: () => void;
  unreadCount?: number;
  isAdminMode?: boolean;
  onToggleAdminMode?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({
  onProfileClick,
  onNotificationsClick,
  onRoomClick,
  unreadCount = 0,
  isAdminMode = false,
  onToggleAdminMode,
}) => {
  const { language } = useLanguage();
  const { currentUser, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full px-3.5 py-2.5 bg-[#0E1210]/95 dark:bg-[#0E1210]/95 light:bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#B89A5A]/20 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/35 flex items-center justify-center text-[#B89A5A]">
          <EthiopianCross size={19} color="#B89A5A" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-serif font-bold tracking-wider text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              MAHBER
            </span>
            <span className="text-[11px] font-medium text-[#B89A5A]">
              ማኅበር
            </span>
          </div>
          <div className="text-[9px] text-gray-400 dark:text-gray-400 light:text-gray-600 font-sans tracking-tight">
            Faith • Fellowship • Together
          </div>
        </div>
      </div>

      {/* Right Actions: Room / Chat, Notifications, Role / Profile */}
      <div className="flex items-center gap-1.5">
        {onRoomClick && (
          <button
            onClick={onRoomClick}
            className="p-1.5 rounded-full hover:bg-white/5 transition relative text-gray-400 hover:text-[#B89A5A]"
            title={language === 'am' ? 'የማኅበር ክፍል' : 'Room Chat'}
          >
            <MessageSquare size={17} />
          </button>
        )}

        <button
          onClick={onNotificationsClick}
          className="p-1.5 rounded-full hover:bg-white/5 transition relative text-gray-400 hover:text-[#B89A5A]"
          title={language === 'am' ? 'ማሳወቂያዎች' : 'Notifications'}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#B89A5A] ring-2 ring-[#0E1210]" />
          )}
        </button>

        {/* Role Pill Switcher (Mockup Photo 1) */}
        {isAdmin && onToggleAdminMode ? (
          <button
            onClick={onToggleAdminMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition touch-press ${
              isAdminMode
                ? 'bg-[#6F2630]/30 border-[#B89A5A]/40 text-[#F5EFE3]'
                : 'bg-[#B89A5A]/15 border-[#B89A5A]/30 text-[#B89A5A]'
            }`}
            title="Toggle Admin / Member view"
          >
            <Crown size={12} className={isAdminMode ? 'text-[#B89A5A]' : 'text-gray-400'} />
            <span>{isAdminMode ? 'Admin' : 'Member'}</span>
            <ChevronDown size={11} className="opacity-70" />
          </button>
        ) : (
          <button
            onClick={onProfileClick}
            className="flex items-center gap-1 p-0.5 rounded-full hover:bg-white/5 transition touch-press"
            title="View Profile"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-[#B89A5A]/40"
            />
          </button>
        )}
      </div>
    </header>
  );
};
