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
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WelcomeSplash } from './components/welcome/WelcomeSplash';
import { LoginView } from './components/auth/LoginView';
import { NotificationCenter } from './components/notifications/NotificationCenter';
import { LoadingView, ErrorView } from './components/common/StateViews';
import { Smartphone, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
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

  // Screen preview width selector (for testing 360px, 375px, 390px, 412px)
  const [simulatedWidth, setSimulatedWidth] = useState<'360' | '375' | '390' | '412' | 'full'>('390');

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

  // Device width mapping for testing
  const widthClasses: Record<string, string> = {
    '360': 'max-w-[360px]',
    '375': 'max-w-[375px]',
    '390': 'max-w-[390px]',
    '412': 'max-w-[412px]',
    full: 'max-w-md',
  };

  return (
    <div className="min-h-screen bg-[#0e0c0b] text-[#F5EFE3] flex flex-col items-center">
      {/* Dev / Viewport Toolbar (Allows instant testing across 360, 375, 390, 412px and User Persona) */}
      <div className="w-full bg-[#1b1714] border-b border-[#B89A5A]/20 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-gray-400 select-none z-50">
        <div className="flex items-center gap-2">
          <Smartphone size={13} className="text-[#B89A5A]" />
          <span className="font-semibold text-gray-300">ስክሪን (Viewport):</span>
          {(['360', '375', '390', '412'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setSimulatedWidth(w)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                simulatedWidth === w
                  ? 'bg-[#B89A5A] text-black font-bold'
                  : 'bg-black/30 hover:bg-white/10 text-gray-400'
              }`}
            >
              {w}px
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[#F5EFE3] font-medium">
            {currentUser.amharicName.split(' ')[0]} ({isAdmin ? '⭐ Admin' : 'Member'})
          </span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 text-[10px] text-[#D98A94] hover:underline"
            title="Sign Out"
          >
            <LogOut size={12} />
            <span>ውጣ (Logout)</span>
          </button>
        </div>
      </div>

      {/* Main Mobile App Container */}
      <div
        className={`w-full ${widthClasses[simulatedWidth]} min-h-screen bg-[#151311] dark:bg-[#151311] light:bg-[#F5EFE7] shadow-2xl relative flex flex-col border-x border-[#B89A5A]/15`}
      >
        {/* Top App Bar with Notification Bell */}
        <AppBar
          onProfileClick={() => setActiveTab('more')}
          onNotificationsClick={() => setShowNotifications(true)}
          unreadCount={mahberService.getUnreadCount(currentUser.id)}
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
                  onAttendanceUpdate={handleAttendanceUpdate}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'mahber' && gathering && (
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

              {/* PROTECTED ADMIN ROUTE BARRIER (Enforces 403 / Access Denied) */}
              {activeTab === 'admin' && (
                isAdmin ? (
                  <AdminDashboard
                    gathering={gathering}
                    attendance={attendance}
                    contributions={contributions}
                    mezmurs={mezmurs}
                    onReviewAbsence={handleAdminReviewAbsence}
                    onRecordPayment={handleRecordPayment}
                    onSetCurrentMezmur={handleSetCurrentMezmur}
                    onAddMezmur={handleAddMezmur}
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
                  />
                ) : (
                  <div className="py-20 px-4 text-center space-y-4 animate-fade-in">
                    <div className="w-14 h-14 rounded-full bg-[#6F2630]/20 border border-[#6F2630] flex items-center justify-center text-[#D98A94] mx-auto">
                      <ShieldAlert size={28} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F5EFE3]">
                        {language === 'am' ? '403: የተከለከለ ገጽ' : '403: Unauthorized Access'}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                        {language === 'am'
                          ? 'ይህ ገጽ ለሁለቱ የተፈቀደላቸው የማኅበሩ አስተዳዳሪዎች ብቻ የተከለለ ነው።'
                          : 'This management section is strictly reserved for the two designated Mahber administrators.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-4 py-2 rounded-xl bg-[#6F2630] text-white text-xs font-semibold hover:bg-[#8C3542] transition inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      <span>{language === 'am' ? 'ወደ ዋና ገጽ ተመለስ' : 'Return to Home'}</span>
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation with unread badge */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          roomUnreadCount={mahberService.getUnreadCount(currentUser.id)}
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
