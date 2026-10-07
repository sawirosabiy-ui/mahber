import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MahberHistoryGathering, Member } from '../../types';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';
import { HistoryView } from '../history/HistoryView';
import { ProfileModal } from '../profile/ProfileModal';
import {
  Globe,
  Moon,
  Sun,
  User,
  History,
  Info,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Calendar,
  Users,
  Bell,
} from 'lucide-react';

interface MoreSettingsProps {
  history: MahberHistoryGathering[];
  onNavigateTab: (tab: 'home' | 'mahber' | 'room' | 'mezmur' | 'more' | 'admin') => void;
  onOpenNotifications?: () => void;
  onOpenMezmur?: (mezmurId: string) => void;
  onRefreshHistory?: () => void;
}

export const MoreSettings: React.FC<MoreSettingsProps> = ({
  history,
  onNavigateTab,
  onOpenNotifications,
  onOpenMezmur,
  onRefreshHistory,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, allMembers, switchUser } = useAuth();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [inspectedMember, setInspectedMember] = useState<Member | null>(null);

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Profile Header Card */}
      <div 
        onClick={() => {
          setInspectedMember(currentUser);
          setShowProfileModal(true);
        }}
        className="rounded-3xl p-5 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/30 shadow-sacred space-y-3 cursor-pointer hover:border-[#B89A5A]/60 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#B89A5A]"
            />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] truncate">
                {currentUser.amharicName}
              </h2>
              <p className="text-xs text-gray-400">{currentUser.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    currentUser.role === 'admin'
                      ? 'bg-[#B89A5A]/25 text-[#B89A5A] border border-[#B89A5A]/40'
                      : 'bg-[#315C48]/25 text-[#427A60] dark:text-[#529575] border border-[#315C48]/40'
                  }`}
                >
                  {currentUser.role === 'admin' ? t.roleAdmin : t.roleMember}
                </span>
                <span className="text-[10px] text-gray-500">{currentUser.phone}</span>
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#B89A5A] shrink-0" />
        </div>
      </div>

      {/* Language & Theme Controls */}
      <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-1 border-b border-[#B89A5A]/15">
          {t.moreTitle}
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2.5">
            <Globe size={18} className="text-[#B89A5A]" />
            <span className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {t.languageSelect}
            </span>
          </div>
          <div className="flex bg-[#151311] dark:bg-[#151311] light:bg-[#F3ECE0] rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setLanguage('am')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                language === 'am' ? 'bg-[#6F2630] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              አማርኛ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                language === 'en' ? 'bg-[#6F2630] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="flex items-center justify-between py-1.5 border-t border-[#B89A5A]/10">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon size={18} className="text-[#B89A5A]" />
            ) : (
              <Sun size={18} className="text-[#B89A5A]" />
            )}
            <span className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {t.themeSelect}
            </span>
          </div>
          <div className="flex bg-[#151311] dark:bg-[#151311] light:bg-[#F3ECE0] rounded-xl p-1 border border-white/5">
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                theme === 'dark' ? 'bg-[#6F2630] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ጨለማ (Dark)
            </button>
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                theme === 'light' ? 'bg-[#6F2630] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ብርሃን (Light)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="rounded-3xl p-3 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred divide-y divide-[#B89A5A]/10">
        <button
          onClick={() => onOpenNotifications && onOpenNotifications()}
          className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-white/5 rounded-xl transition"
        >
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-[#B89A5A]" />
            <div>
              <div className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {language === 'am' ? 'የማሳወቂያ ማዕከል እና ምርጫዎች' : 'Notifications & Preferences'}
              </div>
              <div className="text-[10px] text-gray-400">
                {language === 'am' ? 'ማሳወቂያዎችን እና የግላዊነት ምርጫዎችን ያስተካክሉ' : 'Alert categories and notification toggles'}
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-white/5 rounded-xl transition"
        >
          <div className="flex items-center gap-3">
            <History size={18} className="text-[#B89A5A]" />
            <div>
              <div className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {t.mahberHistory}
              </div>
              <div className="text-[10px] text-gray-400">የቀደሙ ስብሰባዎች እና መዝገቦች</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        <button
          onClick={() => setShowUserSwitcher(!showUserSwitcher)}
          className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-white/5 rounded-xl transition"
        >
          <div className="flex items-center gap-3">
            <Users size={18} className="text-[#315C48]" />
            <div>
              <div className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {t.switchUser}
              </div>
              <div className="text-[10px] text-gray-400">
                የተጠቃሚ ሚናዎችን እና ግላዊነትን ለመፈተሽ
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#B89A5A] px-2 py-0.5 rounded-full bg-[#B89A5A]/15 font-mono">
            {currentUser.name.split(' ')[0]}
          </span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => onNavigateTab('admin')}
            className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-white/5 rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-[#6F2630]" />
              <div>
                <div className="text-xs font-bold text-[#D98A94]">
                  {t.adminDashboardTitle}
                </div>
                <div className="text-[10px] text-gray-400">
                  የአስተዳዳሪ ማስተዳደሪያ ገጽ (ልዩ መብት)
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#D98A94]" />
          </button>
        )}
      </div>

      {/* Member Switcher Modal / Dropdown */}
      {showUserSwitcher && (
        <div className="rounded-3xl p-4 bg-[#29251F] border border-[#B89A5A]/30 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
            <h4 className="text-xs font-bold text-[#B89A5A]">{t.switchUser}</h4>
            <span className="text-[10px] text-gray-400">10 አባላት</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {allMembers.map((m) => {
              const isSelected = m.id === currentUser.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    switchUser(m.id);
                    setShowUserSwitcher(false);
                  }}
                  className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition ${
                    isSelected
                      ? 'bg-[#6F2630] border-[#B89A5A] text-white font-bold'
                      : 'bg-[#201D19] border-white/5 text-gray-300 hover:border-[#B89A5A]/40'
                  }`}
                >
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[11px]">{m.amharicName}</div>
                    <div className="text-[9px] text-gray-400">{m.role === 'admin' ? '⭐ Admin' : 'Member'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Digital Memory Book (HistoryView) Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#181512] dark:bg-[#181512] light:bg-[#FFFDF8] rounded-t-3xl sm:rounded-3xl border border-[#B89A5A]/35 p-4 sm:p-5 shadow-sacred max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-3">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#B89A5A]" />
                <h3 className="text-base font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                  {language === 'am' ? 'የማኅበሩ የትውስታ መዝገብ' : 'Mahber Memory Book'}
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition"
              >
                ✕ {language === 'am' ? 'ዝጋ' : 'Close'}
              </button>
            </div>

            <HistoryView
              history={history}
              onOpenMezmur={(mezId) => {
                setShowHistoryModal(false);
                if (onOpenMezmur) onOpenMezmur(mezId);
                else onNavigateTab('mezmur');
              }}
              onRefreshHistory={onRefreshHistory}
            />
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      {inspectedMember && (
        <ProfileModal
          member={inspectedMember}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setInspectedMember(null);
          }}
        />
      )}

      {/* About Mahber Card */}
      <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred text-center space-y-2">
        <div className="flex items-center justify-center text-[#B89A5A]">
          <EthiopianCross size={20} color="#B89A5A" />
        </div>
        <h4 className="text-xs font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
          {t.aboutMahber}
        </h4>
        <p className="text-[11px] text-gray-400 leading-relaxed px-2">
          {t.aboutDescription}
        </p>
        <p className="text-[10px] text-[#B89A5A]/70 font-serif pt-1">
          መዝሙረ ዳዊት 133:1 — «እነሆ፥ ወንድሞች በኅብረት ቢቀመጡ መልካም ነው፥ ደስም ያሰኛል!»
        </p>
      </div>
    </div>
  );
};
