import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { mahberService } from './services/mahberService';
import { mahberDataService } from './services/mahberDataService';
import {
  Gathering,
  AttendanceRecord,
  MemberContribution,
  Mezmur,
  RoomMessage,
  MahberHistoryGathering,
  AbsenceReasonCategory,
  AdminReviewStatus,
} from './types';
import { AppBar } from './components/navigation/AppBar';
import { BottomNav, NavTab } from './components/navigation/BottomNav';
import { MemberHome } from './components/home/MemberHome';
import { MahberGathering } from './components/mahber/MahberGathering';
import { ContributionView } from './components/contribution/ContributionView';
import { MezmurView } from './components/mezmur/MezmurView';
import { RoomView } from './components/room/RoomView';
import { MoreSettings } from './components/settings/MoreSettings';
import { MemberDirectory } from './components/members/MemberDirectory';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WelcomeSplash } from './components/welcome/WelcomeSplash';
import { LoginView } from './components/auth/LoginView';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { AdminPasswordModal } from './components/admin/AdminPasswordModal';
import { LoadingView, ErrorView } from './components/common/StateViews';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { MessageReplyInfo, RoomMessageType } from './types';

const MahberAppContent: React.FC = () => {
  const { currentUser, allMembers, isAdmin, isAuthenticated, signOut } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();

  // App Navigation & Splash state
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    return localStorage.getItem('mahber_entered') === 'true';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [previousTab, setPreviousTab] = useState<NavTab>('home');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return isAdmin;
  });

  // Admin Security Unlock State (persisted in sessionStorage)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return mahberService.isAdminSessionUnlocked();
  });

  // Notification center modal state
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Async data states
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // App Data State
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [contributions, setContributions] = useState<Record<string, MemberContribution>>({});
  const [mezmurs, setMezmurs] = useState<Mezmur[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [history, setHistory] = useState<MahberHistoryGathering[]>([]);

  // Load backend data asynchronously
  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [gRes, aRes, mRes] = await Promise.all([
        mahberDataService.getNextGathering(),
        mahberDataService.getAttendance(currentUser.id, isAdmin),
        mahberDataService.getMezmurs(),
      ]);

      if (gRes.data) setGathering(gRes.data);
      setAttendance(aRes.data);
      setMezmurs(mRes.data);
      setContributions(mahberService.getAllContributions());
      setMessages(mahberService.getMessages());
      setHistory(mahberService.getHistory());
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch Mahber records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, currentUser.id, isAdmin]);

  // Real-time synchronization for concurrent messages and history updates
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setHistory(mahberService.getHistory());
    };
    const handleChatUpdate = () => {
      setMessages(mahberService.getMessages());
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mahber_history_v3') {
        handleHistoryUpdate();
      }
      if (e.key === 'mahber_messages_v5') {
        handleChatUpdate();
      }
    };

    window.addEventListener('mahber_history_updated', handleHistoryUpdate);
    window.addEventListener('mahber_chat_updated', handleChatUpdate);
    window.addEventListener('storage', handleStorage);

    let bcHist: BroadcastChannel | null = null;
    let bcChat: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bcHist = new BroadcastChannel('mahber_history_channel');
      bcHist.onmessage = handleHistoryUpdate;
      bcChat = new BroadcastChannel('mahber_chat_channel');
      bcChat.onmessage = handleChatUpdate;
    }

    return () => {
      window.removeEventListener('mahber_history_updated', handleHistoryUpdate);
      window.removeEventListener('mahber_chat_updated', handleChatUpdate);
      window.removeEventListener('storage', handleStorage);
      bcHist?.close();
      bcChat?.close();
    };
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setPreviousTab(activeTab);
    setActiveTab(tab);
  };

  const handleEnterApp = () => {
    setHasEntered(true);
    localStorage.setItem('mahber_entered', 'true');
  };

  const handleAttendanceUpdate = async (
    status: 'coming' | 'cant_come',
    reason?: AbsenceReasonCategory,
    note?: string
  ) => {
    if (!gathering) return;
    await mahberDataService.submitAttendance(gathering.id, currentUser.id, status, reason, note);
    const updated = await mahberDataService.getAttendance(currentUser.id, isAdmin);
    setAttendance(updated.data);
  };

  const handleAdminReviewAbsence = (attendanceId: string, status: AdminReviewStatus) => {
    mahberService.adminReviewAbsence(attendanceId, status);
    setAttendance(mahberService.getAllAttendanceRaw());
  };

  const handleRecordPayment = (memberId: string, amount: number, note?: string) => {
    const updated = mahberService.adminRecordPayment(
      memberId,
      amount,
      'meskerem',
      'መስከረም',
      'Meskerem',
      '2019',
      note
    );
    setContributions({ ...updated });
  };

  const handleSetCurrentMezmur = (mezmurId: string) => {
    const updated = mahberService.setCurrentStudyMezmur(mezmurId);
    setMezmurs([...updated]);
  };

  const handleAddMezmur = (titleAm: string, titleEn: string, categoryAm: string) => {
    const updated = mahberService.addMezmur({
      titleAm,
      titleEn,
      categoryAm,
      categoryEn: categoryAm,
      status: 'new',
      duration: '03:15',
      dateAdded: '2026-10-07',
      voicesCount: 4,
      stanzas: [
        {
          stanzaNumber: 1,
          titleAm: 'ምዕራፍ 1',
          titleEn: 'Stanza 1',
          textAm: `${titleAm}\nስለ ስምህ እንዘምራለን ለዘላለም።`,
        },
      ],
    });
    setMezmurs([...updated]);
  };

  const handleSendMessage = (
    text: string,
    type: RoomMessageType = 'chat',
    replyTo?: MessageReplyInfo,
    attachmentUrl?: string
  ) => {
    const res = mahberService.sendMessage(
      currentUser.id,
      currentUser.name,
      currentUser.amharicName,
      currentUser.avatarUrl,
      currentUser.role === 'admin',
      text,
      type,
      replyTo,
      attachmentUrl
    );
    if (res.success) {
      setMessages(mahberService.getMessages());
    } else if (res.error) {
      alert(res.error);
    }
  };

  const handleToggleReaction = (messageId: string, emoji: '🙏' | '❤️' | '✝️') => {
    const updated = mahberService.toggleReaction(messageId, currentUser.id, emoji);
    setMessages([...updated]);
  };

  // If user has not passed the solemn Welcome / Splash screen
  if (!hasEntered) {
    return <WelcomeSplash onEnter={handleEnterApp} />;
  }

  // If user is not authenticated, render secure Login screen
  if (!isAuthenticated) {
    return <LoginView onSuccess={() => loadData()} />;
  }

  const currentMemberContribution =
    contributions[currentUser.id] || mahberService.getMemberContribution(currentUser.id);

  const currentStudyMezmur = mezmurs.find((m) => m.status === 'current_study');

  return (
    <div className="min-h-screen bg-[#0E1210] dark:bg-[#0E1210] light:bg-[#FAF8F2] text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] flex flex-col items-center">
      {/* Main Mobile App Container */}
      <div
        className="w-full max-w-md min-h-screen bg-[#141A17] dark:bg-[#141A17] light:bg-[#FFFDF8] shadow-2xl relative flex flex-col border-x border-[#B89A5A]/20 pb-20"
      >
        {/* Top App Bar with Notification Bell and Role Selector */}
        <AppBar
          onProfileClick={() => setActiveTab('more')}
          onNotificationsClick={() => setShowNotifications(true)}
          onRoomClick={() => setActiveTab('room')}
          unreadCount={mahberService.getUnreadCount(currentUser.id)}
          isAdminMode={isAdminMode}
          onToggleAdminMode={() => setIsAdminMode((prev) => !prev)}
        />

        {/* Content Body with Loading & Error States */}
        <main className="flex-1 px-3.5 pt-3">
          {loading ? (
            <LoadingView />
          ) : errorMessage ? (
            <ErrorView message={errorMessage} onRetry={loadData} />
          ) : (
            <>
              {activeTab === 'home' && gathering && (
                <MemberHome
                  gathering={gathering}
                  attendance={attendance}
                  contribution={currentMemberContribution}
                  currentMezmur={currentStudyMezmur}
                  isAdminMode={isAdminMode}
                  onAttendanceUpdate={handleAttendanceUpdate}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {(activeTab === 'gatherings' || activeTab === 'mahber') && gathering && (
                <MahberGathering
                  gathering={gathering}
                  attendance={attendance}
                  allMembers={allMembers}
                  history={history}
                  onOpenMezmur={(mezId) => {
                    handleSetCurrentMezmur(mezId);
                    setActiveTab('mezmur');
                  }}
                  onRefreshHistory={() => setHistory(mahberService.getHistory())}
                  onNavigateTab={(tab) => handleSelectTab(tab)}
                />
              )}

              {activeTab === 'finance' && (
                <ContributionView
                  contribution={currentMemberContribution}
                  contributions={Object.values(contributions)}
                  allMembers={allMembers}
                />
              )}

              {activeTab === 'room' && (
                <RoomView
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onToggleReaction={handleToggleReaction}
                  onRefreshMessages={() => setMessages(mahberService.getMessages())}
                />
              )}

              {activeTab === 'mezmur' && (
                <MezmurView
                  mezmurs={mezmurs}
                  onSetCurrentStudy={handleSetCurrentMezmur}
                  onRefreshMezmurs={() => setMezmurs(mahberService.getMezmurs())}
                />
              )}

              {activeTab === 'more' && (
                <MoreSettings
                  history={history}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenNotifications={() => setShowNotifications(true)}
                  onOpenMezmur={(mezId) => {
                    handleSetCurrentMezmur(mezId);
                    setActiveTab('mezmur');
                  }}
                  onRefreshHistory={() => setHistory(mahberService.getHistory())}
                />
              )}

              {/* MEMBER DIRECTORY (Photo 13 & 16) */}
              {activeTab === 'members' && (
                <MemberDirectory
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {/* ADMIN DASHBOARD WITH PASSWORD GATE (Requires mahber@27) */}
              {activeTab === 'admin' && (
                isAdminUnlocked ? (
                  <AdminDashboard
                    gathering={gathering}
                    attendance={attendance}
                    contributions={contributions}
                    mezmurs={mezmurs}
                    onReviewAbsence={handleAdminReviewAbsence}
                    onRecordPayment={handleRecordPayment}
                    onSetCurrentMezmur={handleSetCurrentMezmur}
                    onAddMezmur={handleAddMezmur}
                    onArchiveMezmur={(mezmurId) => {
                      const updated = mahberService.archiveMezmur(mezmurId);
                      setMezmurs([...updated]);
                    }}
                    onUpdateGathering={(g) => setGathering(g)}
                    onCreateGathering={async (newGData) => {
                      const created = mahberService.createGathering(newGData);
                      setGathering(created);
                      setHistory(mahberService.getHistory());
                    }}
                    onCompleteGathering={async (gatheringId) => {
                      mahberService.completeGathering(gatheringId);
                      const next = mahberService.getNextGathering();
                      setGathering(next);
                      setHistory(mahberService.getHistory());
                      const updatedAttendance = await mahberDataService.getAttendance(currentUser.id, isAdmin);
                      setAttendance(updatedAttendance.data);
                    }}
                    onRefreshHistory={() => setHistory(mahberService.getHistory())}
                    onLockAdmin={() => {
                      mahberService.setAdminSessionUnlocked(false);
                      setIsAdminUnlocked(false);
                      setActiveTab('home');
                    }}
                  />
                ) : (
                  <AdminPasswordModal
                    isOpen={true}
                    onSuccess={() => {
                      setIsAdminUnlocked(true);
                    }}
                    onCancel={() => {
                      setActiveTab(previousTab || 'home');
                    }}
                  />
                )
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation with unread badge */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          roomUnreadCount={mahberService.getUnreadCount(currentUser.id)}
          isAdminMode={isAdminMode}
        />

        {/* Sacred Notification Center Drawer/Modal */}
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setShowNotifications(false);
          }}
        />
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
