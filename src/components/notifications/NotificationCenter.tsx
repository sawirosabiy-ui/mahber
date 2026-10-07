import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { mahberService } from '../../services/mahberService';
import { MahberNotification, NotificationPreference } from '../../types';
import { EthiopianCross } from '../common/EthiopianCross';
import {
  Bell,
  X,
  CheckCheck,
  Settings,
  Calendar,
  MessageSquare,
  Music,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'home' | 'mahber' | 'room' | 'mezmur' | 'more') => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');

  // Notifications state
  const [notifications, setNotifications] = useState<MahberNotification[]>(() =>
    mahberService.getInAppNotifications(currentUser.id)
  );

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreference>(() =>
    mahberService.getNotificationPreferences(currentUser.id)
  );

  if (!isOpen) return null;

  const handleTogglePref = (key: keyof Omit<NotificationPreference, 'userId' | 'mahberId' | 'updatedAt'>) => {
    const updated = mahberService.updateNotificationPreferences(currentUser.id, {
      [key]: !preferences[key],
    });
    setPreferences(updated);
    setNotifications(mahberService.getInAppNotifications(currentUser.id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: MahberNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    onClose();
    onNavigateTab(notif.linkTab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#1B1815] rounded-t-3xl sm:rounded-3xl border border-[#B89A5A]/30 p-5 shadow-sacred max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A]">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5EFE3]">
                {language === 'am' ? 'የማሳወቂያ ማዕከል' : 'Notification Center'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {language === 'am' ? 'የማኅበሩ አስፈላጊ ማሳሰቢያዎች' : 'Sacred Mahber Notices'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'notifications' ? 'preferences' : 'notifications')}
              className={`p-1.5 rounded-xl border transition ${
                activeTab === 'preferences'
                  ? 'bg-[#B89A5A]/20 border-[#B89A5A] text-[#B89A5A]'
                  : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
              }`}
              title={language === 'am' ? 'ምርጫዎች' : 'Preferences'}
            >
              <Settings size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/30 border border-white/10 text-gray-400 hover:text-white transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* View Switcher: Notifications vs Preferences */}
        {activeTab === 'notifications' ? (
          <>
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-gray-400 text-[11px]">
                {notifications.filter((n) => !n.isRead).length}{' '}
                {language === 'am' ? 'ያልተነበቡ' : 'unread'}
              </span>
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#B89A5A] hover:underline flex items-center gap-1 font-semibold"
              >
                <CheckCheck size={13} />
                <span>{language === 'am' ? 'ሁሉንም አንብብ' : 'Mark all read'}</span>
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 py-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <Bell size={24} className="mx-auto opacity-30 text-[#B89A5A]" />
                  <p className="text-xs">
                    {language === 'am' ? 'ምንም አዲስ ማሳወቂያ የለም።' : 'No new notifications.'}
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer text-left space-y-1.5 ${
                        n.isRead
                          ? 'bg-[#201D19]/60 border-white/5 text-gray-300 opacity-75'
                          : 'bg-[#29251F] border-[#B89A5A]/30 text-[#F5EFE3] shadow-sacred-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {n.type === 'mahber_reminder' && (
                            <Calendar size={14} className="text-[#315C48] shrink-0" />
                          )}
                          {n.type === 'mezmur' && (
                            <Music size={14} className="text-[#B89A5A] shrink-0" />
                          )}
                          {n.type === 'announcement' && (
                            <Bell size={14} className="text-[#D98A94] shrink-0" />
                          )}
                          {n.type === 'room_message' && (
                            <MessageSquare size={14} className="text-[#427A60] shrink-0" />
                          )}
                          <span className="text-xs font-bold leading-snug">{n.title}</span>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#B89A5A] shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed pl-5">{n.body}</p>

                      <div className="text-[10px] text-gray-500 pl-5 flex items-center justify-between">
                        <span>{n.dateEth}</span>
                        <span className="text-[#B89A5A] font-semibold">
                          {language === 'am' ? 'ይመልከቱ →' : 'View →'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Preferences Panel */
          <div className="flex-1 overflow-y-auto space-y-4 py-3">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#B89A5A]">
                {language === 'am' ? 'የማሳወቂያ ምርጫዎች' : 'Notification Preferences'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === 'am'
                  ? 'የሚፈልጓቸውን የማሳወቂያ ዓይነቶች ያብሩ ወይም ያጥፉ።'
                  : 'Manage which alerts and notifications you wish to receive.'}
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: 'mahberReminders' as const,
                  labelAm: 'የማኅበር መሰብሰቢያ ማስታወሻዎች',
                  labelEn: 'Gathering reminders',
                  icon: <Calendar size={15} className="text-[#315C48]" />,
                },
                {
                  key: 'roomMessages' as const,
                  labelAm: 'የክፍል መልዕክቶች (Room chat)',
                  labelEn: 'Room fellowship messages',
                  icon: <MessageSquare size={15} className="text-[#427A60]" />,
                },
                {
                  key: 'announcements' as const,
                  labelAm: 'አስፈላጊ ማስታወቂያዎች (Announcements)',
                  labelEn: 'Important announcements',
                  icon: <Bell size={15} className="text-[#D98A94]" />,
                },
                {
                  key: 'prayerRequests' as const,
                  labelAm: 'የጸሎት ጥያቄዎች (Prayer requests)',
                  labelEn: 'Prayer request updates',
                  icon: <EthiopianCross size={14} color="#B89A5A" />,
                },
                {
                  key: 'mezmurReminders' as const,
                  labelAm: 'የመዝሙር ጥናት ማሳሰቢያ',
                  labelEn: 'Mezmur study reminders',
                  icon: <Music size={15} className="text-[#B89A5A]" />,
                },
                {
                  key: 'contributionReminders' as const,
                  labelAm: 'የመዋጮ ማሳሰቢያዎች (Contributions)',
                  labelEn: 'Contribution reminders',
                  icon: <CreditCard size={15} className="text-[#B89A5A]" />,
                },
              ].map((item) => {
                const isEnabled = preferences[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleTogglePref(item.key)}
                    className="p-3 rounded-2xl bg-[#201D19] border border-white/5 flex items-center justify-between cursor-pointer hover:border-[#B89A5A]/30 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="text-xs text-[#F5EFE3]">
                        {language === 'am' ? item.labelAm : item.labelEn}
                      </span>
                    </div>

                    <div
                      className={`w-10 h-5 rounded-full p-0.5 transition flex items-center ${
                        isEnabled ? 'bg-[#315C48] justify-end' : 'bg-gray-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Privacy Protection Callout */}
            <div className="p-3 rounded-2xl bg-[#6F2630]/15 border border-[#6F2630]/30 text-[11px] text-[#E5DCD0] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#D98A94]">
                <ShieldAlert size={14} />
                <span>{language === 'am' ? 'የግላዊነት ጥበቃ' : 'Privacy Protection'}</span>
              </div>
              <p className="text-gray-400">
                {language === 'am'
                  ? 'የአባላት የገንዘብ እዳ ወይም ሚስጥራዊ የህክምና ምክንያቶች በማሳወቂያዎች ውስጥ በፍጹም አይገቡም።'
                  : 'Individual financial debts or sensitive medical absence reasons never appear in notifications.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
