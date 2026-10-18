import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Calendar,
  CreditCard,
  Music,
  Users,
  MoreHorizontal,
  LayoutDashboard,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'gatherings'
  | 'finance'
  | 'mezmur'
  | 'members'
  | 'more'
  | 'admin'
  | 'mahber'
  | 'room';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  roomUnreadCount?: number;
  isAdminMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  roomUnreadCount = 0,
  isAdminMode = false,
}) => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const showAdminTabs = isAdminMode || isAdmin;

  // Role-based 5 canonical tabs per Blueprint & Mockup Photo 1
  const memberTabs: { key: NavTab; label: string; icon: React.ReactNode }[] = [
    { key: 'home', label: t.navHome, icon: <Home size={19} /> },
    { key: 'gatherings', label: t.navGatherings, icon: <Calendar size={19} /> },
    { key: 'finance', label: t.navFinance, icon: <CreditCard size={19} /> },
    { key: 'mezmur', label: t.navMezmur, icon: <Music size={19} /> },
    {
      key: 'more',
      label: t.navMore,
      icon: (
        <div className="relative">
          <MoreHorizontal size={19} />
          {roomUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B89A5A]" />
          )}
        </div>
      ),
    },
  ];

  const adminTabs: { key: NavTab; label: string; icon: React.ReactNode }[] = [
    { key: 'home', label: t.navOverview, icon: <LayoutDashboard size={19} /> },
    { key: 'gatherings', label: t.navGatherings, icon: <Calendar size={19} /> },
    { key: 'finance', label: t.navFinance, icon: <CreditCard size={19} /> },
    { key: 'members', label: t.navMembers, icon: <Users size={19} /> },
    {
      key: 'more',
      label: t.navMore,
      icon: (
        <div className="relative">
          <MoreHorizontal size={19} />
          {roomUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B89A5A]" />
          )}
        </div>
      ),
    },
  ];

  const visibleTabs = showAdminTabs ? adminTabs : memberTabs;

  // Normalized active tab for selection state (maps legacy keys)
  const isKeyActive = (key: NavTab) => {
    if (activeTab === key) return true;
    if (key === 'gatherings' && activeTab === 'mahber') return true;
    if (key === 'members' && activeTab === 'admin') return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1210]/95 dark:bg-[#0E1210]/95 light:bg-[#FFFDF8]/95 backdrop-blur-lg border-t border-[#B89A5A]/20 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-1 py-1.5">
        {visibleTabs.map((tab) => {
          const isActive = isKeyActive(tab.key);

          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition touch-press relative ${
                isActive
                  ? 'text-[#B89A5A] dark:text-[#B89A5A] light:text-[#8C733C]'
                  : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white'
              }`}
            >
              {/* Active glow accent pill */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-[#B89A5A]" />
              )}

              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-[#B89A5A]/15' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
