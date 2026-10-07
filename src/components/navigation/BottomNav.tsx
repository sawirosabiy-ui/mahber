import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Users,
  MessageSquare,
  Music,
  MoreHorizontal,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 'home' | 'mahber' | 'room' | 'mezmur' | 'more' | 'admin';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  roomUnreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  roomUnreadCount = 0,
}) => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const tabs: { key: NavTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { key: 'home', label: t.navHome, icon: <Home size={19} /> },
    { key: 'mahber', label: t.navMahber, icon: <Users size={19} /> },
    {
      key: 'room',
      label: t.navRoom,
      icon: (
        <div className="relative">
          <MessageSquare size={19} />
          {roomUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B89A5A]" />
          )}
        </div>
      ),
    },
    { key: 'mezmur', label: t.navMezmur, icon: <Music size={19} /> },
    { key: 'more', label: t.navMore, icon: <MoreHorizontal size={19} /> },
    // Strictly show Admin ONLY if current user is one of the two admins!
    { key: 'admin', label: t.navAdmin, icon: <ShieldCheck size={19} />, adminOnly: true },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#151311]/95 dark:bg-[#151311]/95 light:bg-[#FFFDF8]/95 backdrop-blur-lg border-t border-[#B89A5A]/20 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-1 py-1.5">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isAdminTab = tab.key === 'admin';

          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition touch-press relative ${
                isActive
                  ? isAdminTab
                    ? 'text-[#D98A94]'
                    : 'text-[#B89A5A]'
                  : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white'
              }`}
            >
              {/* Active glow accent pill */}
              {isActive && (
                <span
                  className={`absolute -top-1 w-6 h-0.5 rounded-full ${
                    isAdminTab ? 'bg-[#6F2630]' : 'bg-[#B89A5A]'
                  }`}
                />
              )}

              <div
                className={`p-1 rounded-xl transition ${
                  isActive
                    ? isAdminTab
                      ? 'bg-[#6F2630]/25'
                      : 'bg-[#B89A5A]/15'
                    : ''
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
