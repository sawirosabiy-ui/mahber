import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { MemberDashboard } from './components/dashboard/MemberDashboard';
import { UserProfileView } from './components/profile/UserProfileView';
import { MemberDirectory } from './components/members/MemberDirectory';
import { EthiopianCross } from './components/common/EthiopianCross';
import { LogOut, Moon, Sun, Globe, LayoutDashboard, User, Users } from 'lucide-react';

type AppTab = 'dashboard' | 'profile' | 'members';

const MahberAppContent: React.FC = () => {
  const { currentUser, isAuthenticated, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // If user is not authenticated, render secure Login screen
  if (!isAuthenticated) {
    return <LoginView onSuccess={() => setActiveTab('dashboard')} />;
  }

  const isAmharic = language === 'am';

  return (
    <div className="min-h-screen bg-[#0E1210] dark:bg-[#0E1210] light:bg-[#FAF8F2] text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] flex flex-col items-center">
      {/* Container - Responsive for mobile and desktop */}
      <div className="w-full max-w-lg min-h-screen bg-[#141A17] dark:bg-[#141A17] light:bg-[#FFFDF8] shadow-2xl relative flex flex-col border-x border-[#B89A5A]/20 pb-20">
        
        {/* Top App Bar: Mahber Identity, Language, Theme, and Sign-Out */}
        <header className="sticky top-0 z-40 w-full px-4 py-3 bg-[#0E1210]/95 dark:bg-[#0E1210]/95 light:bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#B89A5A]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A] shadow-candle-glow">
              <EthiopianCross size={20} color="#B89A5A" />
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
                {isAmharic ? 'የመድኃኔዓለም ማኅበር' : 'Medhanialem Mahber'}
              </div>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(isAmharic ? 'en' : 'am')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-[#B89A5A]/25 text-[11px] font-semibold text-[#B89A5A] flex items-center gap-1 transition"
              title={isAmharic ? 'Switch to English' : 'ወደ አማርኛ ቀይር'}
            >
              <Globe size={13} />
              <span>{isAmharic ? 'EN' : 'አማ'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-[#B89A5A]/25 text-[#B89A5A] transition"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Sign Out Action */}
            <button
              type="button"
              onClick={signOut}
              className="p-1.5 px-2.5 rounded-full bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition ml-1"
              title={isAmharic ? 'ውጣ' : 'Sign Out'}
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">{isAmharic ? 'ውጣ' : 'Sign Out'}</span>
            </button>
          </div>
        </header>

        {/* Tab Navigation Pill Bar */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex rounded-2xl bg-[#0E1210] p-1 border border-[#B89A5A]/20">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#B89A5A] text-[#0E1210] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>{isAmharic ? 'ዳሽቦርድ' : 'Dashboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'profile'
                  ? 'bg-[#B89A5A] text-[#0E1210] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User size={14} />
              <span>{isAmharic ? 'የግል ማኅደር' : 'Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'members'
                  ? 'bg-[#B89A5A] text-[#0E1210] shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>{isAmharic ? '11 አባላት' : 'Members'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <main className="flex-1 px-4 py-3">
          {activeTab === 'dashboard' && (
            <MemberDashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'profile' && (
            <UserProfileView onBack={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'members' && (
            <MemberDirectory onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1210]/95 dark:bg-[#0E1210]/95 light:bg-[#FAF8F2]/95 backdrop-blur-md border-t border-[#B89A5A]/20 pb-safe">
          <div className="max-w-lg mx-auto flex items-center justify-around py-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-0.5 transition ${
                activeTab === 'dashboard' ? 'text-[#B89A5A]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="text-[10px] font-medium">{isAmharic ? 'ዳሽቦርድ' : 'Dashboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-0.5 transition ${
                activeTab === 'profile' ? 'text-[#B89A5A]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <User size={18} />
              <span className="text-[10px] font-medium">{isAmharic ? 'ማኅደር' : 'Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`flex flex-col items-center gap-0.5 transition ${
                activeTab === 'members' ? 'text-[#B89A5A]' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Users size={18} />
              <span className="text-[10px] font-medium">{isAmharic ? 'አባላት' : 'Members'}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MahberAppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
