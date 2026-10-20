import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MahberHistoryGathering, Member } from '../../types';
import { EthiopianCross } from '../common/EthiopianCross';
import { HistoryView } from '../history/HistoryView';
import { UserProfileView } from '../profile/UserProfileView';
import {
  Globe,
  Moon,
  Sun,
  ShieldCheck,
  ChevronRight,
  Bell,
  LogOut,
  Users,
  Key,
  Smartphone,
  Eye,
  Check,
  X,
  Lock,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { NavTab } from '../navigation/BottomNav';

interface MoreSettingsProps {
  history: MahberHistoryGathering[];
  onNavigateTab: (tab: NavTab) => void;
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
  const { currentUser, signOut } = useAuth();

  // Active sub-screen: 'menu' | 'profile' | 'appearance' | 'security' | 'notifications' | 'history'
  const [activeScreen, setActiveScreen] = useState<'menu' | 'profile' | 'appearance' | 'security' | 'notifications' | 'history'>('menu');

  // Appearance preferences state
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Security preferences state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState<string | null>(null);

  // Notification toggles matching Photo 14 Screen 5
  const [notifState, setNotifState] = useState({
    pushAllowed: true,
    gatheringReminders: true, // Days 24 & 26
    hostingChanges: true,
    announcements: true,
    financeUpdates: true,
    systemMessages: true,
    promotions: false,
  });

  const toggleNotif = (key: keyof typeof notifState) => {
    setNotifState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordToast(language === 'am' ? 'የይለፍ ቃሎች አይመሳሰሉም!' : 'Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordToast(language === 'am' ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት!' : 'Password must be at least 6 characters!');
      return;
    }

    try {
      const stored = localStorage.getItem('mahber_passwords_v1') || '{}';
      const passwords = JSON.parse(stored);
      passwords[currentUser.phone] = newPassword;
      localStorage.setItem('mahber_passwords_v1', JSON.stringify(passwords));
      setPasswordToast(language === 'am' ? 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል!' : 'Password updated successfully!');
      setTimeout(() => {
        setShowPasswordChangeModal(false);
        setPasswordToast(null);
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch {
      setPasswordToast('Error saving password.');
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* SCREEN 1: MAIN MORE MENU */}
      {activeScreen === 'menu' && (
        <div className="space-y-4">
          {/* User Profile Overview Card matching Photo 14 Screen 1 */}
          <div
            onClick={() => setActiveScreen('profile')}
            className="rounded-3xl p-5 bg-[#141A17] border border-[#B89A5A]/30 shadow-xl space-y-3 cursor-pointer hover:border-[#B89A5A]/60 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#B89A5A]"
                />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[#F5EFE3] truncate">
                    {currentUser.name}
                  </h2>
                  <p className="text-xs text-[#9E9484]">{currentUser.amharicName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        currentUser.role === 'admin'
                          ? 'bg-[#B89A5A]/20 text-[#B89A5A] border-[#B89A5A]/40'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Administrator' : 'Active Member'}
                    </span>
                    <span className="text-[10px] text-[#9E9484]">{currentUser.phone}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#B89A5A] shrink-0" />
            </div>
          </div>

          {/* Quick Settings Navigation matching Photo 14 */}
          <div className="bg-[#141A17] rounded-3xl p-4 border border-[#B89A5A]/20 space-y-1">
            {/* Appearance & Language */}
            <button
              type="button"
              onClick={() => setActiveScreen('appearance')}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-[#1B2420] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Language & Appearance</p>
                  <p className="text-[10px] text-[#9E9484]">
                    {language === 'am' ? 'አማርኛ' : 'English'} · {theme === 'dark' ? 'Charcoal Gold' : 'Warm Parchment'}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#9E9484]" />
            </button>

            {/* Security & Password */}
            <button
              type="button"
              onClick={() => setActiveScreen('security')}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-[#1B2420] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Security & Password</p>
                  <p className="text-[10px] text-[#9E9484]">Password, 2FA, Active Sessions</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#9E9484]" />
            </button>

            {/* Notification Preferences */}
            <button
              type="button"
              onClick={() => setActiveScreen('notifications')}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-[#1B2420] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Notification Preferences</p>
                  <p className="text-[10px] text-[#9E9484]">Gathering reminders (Days 24 & 26), alerts</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#9E9484]" />
            </button>

            {/* Gathering Archive & History */}
            <button
              type="button"
              onClick={() => setActiveScreen('history')}
              className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-[#1B2420] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                  <EthiopianCross size={18} color="#B89A5A" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Mahber Memory Archive</p>
                  <p className="text-[10px] text-[#9E9484]">Historical gatherings, photo albums & notes</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#9E9484]" />
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full py-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-950/60 transition-colors"
          >
            <LogOut size={16} />
            {language === 'am' ? 'ይውጡ (Sign Out)' : 'Sign Out'}
          </button>
        </div>
      )}

      {/* SCREEN 2: PROFILE & PERSONAL INFO */}
      {activeScreen === 'profile' && (
        <UserProfileView onBack={() => setActiveScreen('menu')} />
      )}

      {/* SCREEN 3: APPEARANCE & LANGUAGE (Photo 14 Screen 3) */}
      {activeScreen === 'appearance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveScreen('menu')}
              className="text-xs font-bold text-[#B89A5A] hover:underline"
            >
              ← Back to Settings
            </button>
            <span className="text-xs font-bold text-[#F5EFE3]">Language & Appearance</span>
          </div>

          <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 space-y-4">
            {/* Language Selector */}
            <div>
              <label className="text-xs font-bold text-[#F5EFE3] uppercase block mb-2">
                Language
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    language === 'en'
                      ? 'bg-[#B89A5A] text-[#0E1210] border-[#B89A5A] shadow'
                      : 'bg-[#1B2420] text-[#9E9484] border-[#B89A5A]/15'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('am')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    language === 'am'
                      ? 'bg-[#B89A5A] text-[#0E1210] border-[#B89A5A] shadow'
                      : 'bg-[#1B2420] text-[#9E9484] border-[#B89A5A]/15'
                  }`}
                >
                  አማርኛ (Amharic)
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="pt-2 border-t border-[#B89A5A]/15">
              <label className="text-xs font-bold text-[#F5EFE3] uppercase block mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    theme === 'dark'
                      ? 'bg-[#1B2420] text-[#B89A5A] border-[#B89A5A] shadow'
                      : 'bg-[#141A17] text-[#9E9484] border-[#B89A5A]/15'
                  }`}
                >
                  <Moon size={14} />
                  Dark (Charcoal & Gold)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    theme === 'light'
                      ? 'bg-[#F3EFE6] text-[#2B241E] border-[#B89A5A] shadow'
                      : 'bg-[#141A17] text-[#9E9484] border-[#B89A5A]/15'
                  }`}
                >
                  <Sun size={14} />
                  Light (Warm Parchment)
                </button>
              </div>
            </div>

            {/* Text Size */}
            <div className="pt-2 border-t border-[#B89A5A]/15">
              <label className="text-xs font-bold text-[#F5EFE3] uppercase block mb-2">
                Text Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setTextSize(sz)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      textSize === sz
                        ? 'bg-[#B89A5A] text-[#0E1210] shadow'
                        : 'bg-[#1B2420] text-[#9E9484] border border-[#B89A5A]/15'
                    }`}
                  >
                    {sz === 'xlarge' ? 'Extra Large' : sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 4: SECURITY & PASSWORD (Photo 14 Screen 4) */}
      {activeScreen === 'security' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveScreen('menu')}
              className="text-xs font-bold text-[#B89A5A] hover:underline"
            >
              ← Back to Settings
            </button>
            <span className="text-xs font-bold text-[#F5EFE3]">Security & Password</span>
          </div>

          <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 space-y-4">
            {/* Account Security Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3">
              <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Account Protected</p>
                <p className="text-[10px] text-emerald-200/80">
                  Closed Mahber community data encryption active.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowPasswordChangeModal(true)}
                className="w-full p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between text-left hover:border-[#B89A5A]/40"
              >
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Change Password</p>
                  <p className="text-[10px] text-[#9E9484]">Update account login password</p>
                </div>
                <ChevronRight size={16} className="text-[#9E9484]" />
              </button>

              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Two-Factor Authentication</p>
                  <p className="text-[10px] text-[#9E9484]">
                    {is2FAEnabled ? 'Enabled via SMS / Authenticator' : 'Not enabled'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    is2FAEnabled ? 'bg-[#B89A5A]' : 'bg-[#0E1210]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      is2FAEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Device Management</p>
                  <p className="text-[10px] text-[#9E9484]">1 active session on this device</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">Current</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 5: NOTIFICATION PREFERENCES (Photo 14 Screen 5) */}
      {activeScreen === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveScreen('menu')}
              className="text-xs font-bold text-[#B89A5A] hover:underline"
            >
              ← Back to Settings
            </button>
            <span className="text-xs font-bold text-[#F5EFE3]">Notifications</span>
          </div>

          <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 space-y-4">
            <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#F5EFE3]">Allow Push Notifications</p>
                <p className="text-[10px] text-[#9E9484]">Get notified about important community updates</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotif('pushAllowed')}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notifState.pushAllowed ? 'bg-[#B89A5A]' : 'bg-[#0E1210]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    notifState.pushAllowed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-[#B89A5A]/15 space-y-2">
              <h4 className="text-[11px] font-bold text-[#B89A5A] uppercase tracking-wider">
                Notification Types
              </h4>

              {/* Day 24 & 26 Gathering Reminders matching Invariant */}
              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Gathering Reminders</p>
                  <p className="text-[10px] text-[#9E9484]">Days 24 & 26 before gathering</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotif('gatheringReminders')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notifState.gatheringReminders ? 'bg-[#B89A5A]' : 'bg-[#0E1210]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notifState.gatheringReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Hosting Changes */}
              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Hosting Changes</p>
                  <p className="text-[10px] text-[#9E9484]">When your hosting schedule changes</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotif('hostingChanges')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notifState.hostingChanges ? 'bg-[#B89A5A]' : 'bg-[#0E1210]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notifState.hostingChanges ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Finance Updates */}
              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">Finance Updates</p>
                  <p className="text-[10px] text-[#9E9484]">Your contributions and records</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotif('financeUpdates')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    notifState.financeUpdates ? 'bg-[#B89A5A]' : 'bg-[#0E1210]'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      notifState.financeUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 6: MAHBER HISTORY ARCHIVE */}
      {activeScreen === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveScreen('menu')}
              className="text-xs font-bold text-[#B89A5A] hover:underline"
            >
              ← Back to Settings
            </button>
            <span className="text-xs font-bold text-[#F5EFE3]">Memory Archive</span>
          </div>

          <HistoryView
            history={history}
            onOpenMezmur={onOpenMezmur}
            onRefreshHistory={onRefreshHistory}
          />
        </div>
      )}

      {/* PASSWORD CHANGE MODAL */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141A17] border border-[#B89A5A]/40 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
              <h3 className="text-sm font-bold text-[#F5EFE3] flex items-center gap-2">
                <Lock size={16} className="text-[#B89A5A]" />
                Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordChangeModal(false)}
                className="p-1 rounded-lg text-[#9E9484] hover:text-[#F5EFE3]"
              >
                <X size={18} />
              </button>
            </div>

            {passwordToast && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-xs text-center font-bold">
                {passwordToast}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#1B2420] text-[#9E9484] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold hover:opacity-95 shadow-md"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
