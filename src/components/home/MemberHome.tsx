import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Gathering, AttendanceRecord, MemberContribution, Mezmur } from '../../types';
import { NavTab } from '../navigation/BottomNav';
import { mahberService } from '../../services/mahberService';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';
import { AttendanceModal } from '../attendance/AttendanceModal';
import { EmptyView } from '../common/StateViews';
import { calculateGatheringCountdown } from '../../utils/ethiopianCalendar';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Music,
  Play,
  ArrowRight,
  Shield,
  BookOpen,
  DollarSign,
  Users,
  Wallet,
  Bus,
  Coins,
  Bell,
  ChevronRight,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';

interface MemberHomeProps {
  gathering: Gathering | null;
  attendance: AttendanceRecord[];
  contribution: MemberContribution;
  currentMezmur: Mezmur | undefined;
  isAdminMode?: boolean;
  onAttendanceUpdate: (status: 'coming' | 'cant_come', reason?: any, note?: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const MemberHome: React.FC<MemberHomeProps> = ({
  gathering,
  attendance,
  contribution,
  currentMezmur,
  isAdminMode = false,
  onAttendanceUpdate,
  onNavigateTab,
}) => {
  const { t, language } = useLanguage();
  const { currentUser, allMembers } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rsvpToast, setRsvpToast] = useState<string | null>(null);
  const [showBibleModal, setShowBibleModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  // Sacred Painting Rotation & Mahber V1 Data
  const [paintingRotation, setPaintingRotation] = useState(() => mahberService.getPaintingRotation());
  const [userPenalties, setUserPenalties] = useState(() => mahberService.getMemberPenalties(currentUser.id));
  const [proposals, setProposals] = useState(() => mahberService.getSpendingProposals());

  // Dynamic live countdown
  const [countdownLabel, setCountdownLabel] = useState<{ am: string; en: string }>({
    am: 'ቀናት ቀርተዋል',
    en: 'DAYS LEFT',
  });

  useEffect(() => {
    setPaintingRotation(mahberService.getPaintingRotation());
    setUserPenalties(mahberService.getMemberPenalties(currentUser.id));
    setProposals(mahberService.getSpendingProposals());
  }, [currentUser.id]);

  useEffect(() => {
    if (!gathering) return;

    const updateCountdown = () => {
      const targetDate = new Date(gathering.gregDateRaw || '2026-10-07T18:00:00');
      const res = calculateGatheringCountdown(targetDate, gathering.time);
      setCountdownLabel({ am: res.labelAm, en: res.labelEn });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [gathering]);

  // User's own attendance
  const userAttendance = attendance.find((a) => a.memberId === currentUser.id);
  const attendanceStatus = userAttendance?.status || 'no_response';
  const isPaid = contribution.totalOutstanding === 0;

  const handleComingClick = () => {
    onAttendanceUpdate('coming');
    setRsvpToast(
      language === 'am'
        ? 'ለዚህ ማኅበር እንደምትሳተፉ ተመዝግቧል።'
        : "You're marked as attending this Mahber."
    );
    setTimeout(() => setRsvpToast(null), 3000);
  };

  const handleCantComeClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (reason: any, note: string) => {
    onAttendanceUpdate('cant_come', reason, note);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-[#F5EFE3]">
      {/* Toast Alert */}
      {rsvpToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#315C48] text-white px-4 py-2.5 rounded-2xl shadow-candle-glow border border-[#427A60] flex items-center gap-2 text-xs font-semibold animate-fade-in max-w-xs text-center">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{rsvpToast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADMIN HOME VIEW (Photo 1 Left - Dark Charcoal & Antique Gold)  */}
      {/* ============================================================== */}
      {isAdminMode ? (
        <div className="space-y-4">
          {/* Greeting Area with Church Silhouette Header */}
          <div className="relative rounded-3xl p-5 bg-[#141A17] border border-[#B89A5A]/30 overflow-hidden shadow-sacred">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=800&auto=format&fit=crop&q=80"
                alt="Church Architecture"
                className="w-full h-full object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#141A17] via-[#141A17]/70 to-transparent" />
            </div>

            <div className="relative z-10 max-w-[70%]">
              <h2 className="text-xl font-bold tracking-tight text-[#F5EFE3]">
                {language === 'am'
                  ? `እንደ ምን አደሩ፣ ${currentUser.amharicName?.split(' ')[0] || currentUser.name.split(' ')[0]}`
                  : `Good Morning, ${currentUser.name.split(' ')[0]}`}
              </h2>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {language === 'am'
                  ? 'እግዚአብሔር ማኅበራችንን ይባርክ፤ በእምነት እና በፍቅር አንድነታችንን ያጽናልን።'
                  : 'May God bless our Mahber and strengthen our unity in faith and love.'}
              </p>
            </div>
          </div>

          {/* Next Gathering Card (Photo 1) */}
          {gathering ? (
            <div
              onClick={() => onNavigateTab('gatherings')}
              className="rounded-3xl p-4 bg-[#1B2420] border border-[#B89A5A]/30 shadow-sacred flex items-center justify-between cursor-pointer hover:border-[#B89A5A]/60 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#B89A5A]/20 border border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A] shrink-0 shadow-candle-glow">
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B89A5A]">
                      {language === 'am' ? 'የሚቀጥለው ማኅበር' : 'Next Gathering'}
                    </span>
                    <ChevronRight size={13} className="text-[#B89A5A]" />
                  </div>
                  <div className="text-xs font-bold text-[#F5EFE3] mt-0.5">
                    {gathering.ethDate} ({gathering.gregDate}) • {gathering.time}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-[#B89A5A]" />
                    <span>{gathering.location}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#B89A5A] shrink-0" />
            </div>
          ) : (
            <EmptyView title={language === 'am' ? 'ቀጣይ ማኅበር የለም' : 'No upcoming Mahber'} />
          )}

          {/* 6 Metric Cards in Two 3-Col Rows (Photo 1 Left) */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Card 1: Total Members */}
            <div
              onClick={() => onNavigateTab('members')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition shadow-sacred flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                <Users size={13} className="text-[#B89A5A]" />
                <span className="truncate">{language === 'am' ? 'ጠቅላላ አባላት' : 'Total Members'}</span>
              </div>
              <div className="my-1.5">
                <span className="text-xl font-bold text-[#F5EFE3]">{allMembers.length}</span>
              </div>
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[9px] font-semibold text-emerald-300 w-fit">
                {language === 'am' ? 'ንቁ' : 'Active'}
              </span>
            </div>

            {/* Card 2: Shared Fund */}
            <div
              onClick={() => onNavigateTab('finance')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition shadow-sacred flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                <Wallet size={13} className="text-[#B89A5A]" />
                <span className="truncate">{language === 'am' ? 'የጋራ ፈንድ' : 'Shared Fund'}</span>
              </div>
              <div className="my-1.5">
                <span className="text-sm font-bold text-[#F5EFE3] truncate block">
                  {mahberService.getSharedFundBalance().toLocaleString()} ETB
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-400">
                <TrendingUp size={10} />
                <span>+12%</span>
              </span>
            </div>

            {/* Card 3: Attendance */}
            <div
              onClick={() => onNavigateTab('gatherings')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition shadow-sacred flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                <Calendar size={13} className="text-[#B89A5A]" />
                <span className="truncate">{language === 'am' ? 'ምልአተ ጉባኤ' : 'Attendance'}</span>
              </div>
              <div className="my-1.5">
                <span className="text-xl font-bold text-[#F5EFE3]">
                  {attendance.filter((a) => a.status === 'coming').length || 8}/11
                </span>
              </div>
              <span className="text-[9px] text-amber-400 font-semibold truncate">
                {language === 'am' ? '3 ቀሪ' : '3 pending'}
              </span>
            </div>

            {/* Card 4: Monthly Contributions */}
            <div
              onClick={() => onNavigateTab('finance')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition shadow-sacred flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                <Coins size={13} className="text-[#B89A5A]" />
                <span className="truncate">{language === 'am' ? 'ወርሃዊ መዋጮ' : 'Contributions'}</span>
              </div>
              <div className="my-1">
                <span className="text-sm font-bold text-[#F5EFE3]">8/11</span>
                <div className="w-full h-1 bg-black/40 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '73%' }} />
                </div>
              </div>
              <span className="text-[9px] text-gray-400">73% {language === 'am' ? 'ተከፍሏል' : 'paid'}</span>
            </div>

            {/* Card 5: Outstanding Arrears */}
            <div
              onClick={() => onNavigateTab('finance')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition shadow-sacred flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                <AlertCircle size={13} className="text-amber-400" />
                <span className="truncate">{language === 'am' ? 'ያልተከፈለ' : 'Outstanding'}</span>
              </div>
              <div className="my-1.5">
                <span className="text-xs font-bold text-amber-300 truncate block">3,200 ETB</span>
              </div>
              <span className="text-[9px] text-gray-400">3 {language === 'am' ? 'አባላት' : 'members'}</span>
            </div>

            {/* Card 6: Transport Fund */}
            <div
              onClick={() => onNavigateTab('finance')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition shadow-sacred flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                <Bus size={13} className="text-[#B89A5A]" />
                <span className="truncate">{language === 'am' ? 'የትራንስፖርት' : 'Transport'}</span>
              </div>
              <div className="my-1.5">
                <span className="text-xs font-bold text-[#F5EFE3] truncate block">4,500 ETB</span>
              </div>
              <span className="text-[9px] text-gray-400 truncate">
                {language === 'am' ? 'ለዚህ ስብሰባ' : 'This gathering'}
              </span>
            </div>
          </div>

          {/* Action Attention Banner (Photo 1) */}
          <div
            onClick={() => onNavigateTab('admin')}
            className="rounded-2xl p-3.5 bg-[#6F2630]/25 border border-[#6F2630]/60 flex items-center justify-between cursor-pointer hover:bg-[#6F2630]/35 transition shadow-sacred"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6F2630]/40 flex items-center justify-center text-[#E5A0A9] shrink-0">
                <Bell size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F5EFE3]">
                  {language === 'am' ? '2 ትኩረት የሚሹ ጉዳዮች' : '2 items need your attention'}
                </div>
                <div className="text-[10px] text-gray-300">
                  {language === 'am'
                    ? 'ምልአተ ጉባኤ አልተዘጋም • 1 የወጪ ጥያቄ ውሳኔ ይጠብቃል'
                    : 'Attendance not finalized • 1 spending proposal pending'}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
          </div>

          {/* Gold CTA: Go to Admin Dashboard (Photo 1) */}
          <button
            onClick={() => onNavigateTab('admin')}
            className="w-full py-3 rounded-2xl bg-[#B89A5A] hover:bg-[#C8AC6E] text-[#141A17] font-bold text-xs tracking-wide shadow-sacred transition touch-press flex items-center justify-center gap-2"
          >
            <span>📊 {language === 'am' ? 'ወደ አስተዳዳሪ ዳሽቦርድ ሂድ' : 'Go to Admin Dashboard'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        /* ============================================================== */
        /* MEMBER HOME VIEW (Photo 1 Middle - Warm Parchment & Gold)       */
        /* ============================================================== */
        <div className="space-y-4">
          {/* Greeting Area with Church Background (Photo 1 Middle) */}
          <div className="relative rounded-3xl p-5 bg-[#141A17] border border-[#B89A5A]/30 overflow-hidden shadow-sacred">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=800&auto=format&fit=crop&q=80"
                alt="Church Architecture"
                className="w-full h-full object-cover object-right"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#141A17] via-[#141A17]/70 to-transparent" />
            </div>

            <div className="relative z-10 max-w-[70%]">
              <h2 className="text-xl font-bold tracking-tight text-[#F5EFE3]">
                {language === 'am'
                  ? `ሰላም፣ ${currentUser.amharicName?.split(' ')[0] || currentUser.name.split(' ')[0]}`
                  : `Selam, ${currentUser.name.split(' ')[0]}`}
              </h2>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {language === 'am'
                  ? 'በእምነትህ በርታ የመንፈስንም አንድነት ጠብቅ።'
                  : 'Be strong in your faith and keep the unity of the Spirit.'}
              </p>
            </div>
          </div>

          {/* Next Gathering Card (Photo 1) */}
          {gathering ? (
            <div
              onClick={() => onNavigateTab('gatherings')}
              className="rounded-3xl p-4 bg-[#1B2420] border border-[#B89A5A]/30 shadow-sacred flex items-center justify-between cursor-pointer hover:border-[#B89A5A]/60 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#B89A5A]/20 border border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A] shrink-0 shadow-candle-glow">
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B89A5A]">
                      {language === 'am' ? 'የሚቀጥለው ማኅበር' : 'Next Gathering'}
                    </span>
                    <ChevronRight size={13} className="text-[#B89A5A]" />
                  </div>
                  <div className="text-xs font-bold text-[#F5EFE3] mt-0.5">
                    {gathering.ethDate} ({gathering.gregDate}) • {gathering.time}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-[#B89A5A]" />
                    <span>{gathering.location}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#B89A5A] shrink-0" />
            </div>
          ) : (
            <EmptyView title={language === 'am' ? 'ቀጣይ ማኅበር የለም' : 'No upcoming Mahber'} />
          )}

          {/* 4 Quick Access Buttons Grid (Photo 1 Middle) */}
          <div className="grid grid-cols-4 gap-2">
            {/* 1. Bible */}
            <button
              onClick={() => setShowBibleModal(true)}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 hover:border-[#B89A5A]/50 transition flex flex-col items-center text-center shadow-sacred group"
            >
              <div className="w-10 h-10 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A] mb-1.5 group-hover:scale-110 transition">
                <BookOpen size={18} />
              </div>
              <div className="text-[11px] font-bold text-[#F5EFE3]">{language === 'am' ? 'መጽሐፍ' : 'Bible'}</div>
              <div className="text-[9px] text-gray-400 truncate w-full mt-0.5">
                {language === 'am' ? 'የዕለቱ ንባብ' : "Today's Reading"}
              </div>
            </button>

            {/* 2. Mezmur */}
            <button
              onClick={() => onNavigateTab('mezmur')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 hover:border-[#B89A5A]/50 transition flex flex-col items-center text-center shadow-sacred group"
            >
              <div className="w-10 h-10 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A] mb-1.5 group-hover:scale-110 transition">
                <Music size={18} />
              </div>
              <div className="text-[11px] font-bold text-[#F5EFE3]">{language === 'am' ? 'መዝሙር' : 'Mezmur'}</div>
              <div className="text-[9px] text-gray-400 truncate w-full mt-0.5">
                {language === 'am' ? 'አዳዲስ ዝማሬዎች' : 'New Hymns'}
              </div>
            </button>

            {/* 3. Announcements */}
            <button
              onClick={() => setShowAnnouncementsModal(true)}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 hover:border-[#B89A5A]/50 transition flex flex-col items-center text-center shadow-sacred group relative"
            >
              <div className="w-10 h-10 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A] mb-1.5 group-hover:scale-110 transition relative">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6F2630] border border-white text-[9px] font-bold text-white flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="text-[11px] font-bold text-[#F5EFE3] truncate w-full">
                {language === 'am' ? 'ማስታወቂያ' : 'Announce'}
              </div>
              <div className="text-[9px] text-gray-400 truncate w-full mt-0.5">
                {language === 'am' ? 'ወቅታዊ መረጃ' : 'Latest Updates'}
              </div>
            </button>

            {/* 4. My Contributions */}
            <button
              onClick={() => onNavigateTab('finance')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 hover:border-[#B89A5A]/50 transition flex flex-col items-center text-center shadow-sacred group"
            >
              <div className="w-10 h-10 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A] mb-1.5 group-hover:scale-110 transition">
                <Wallet size={18} />
              </div>
              <div className="text-[11px] font-bold text-[#F5EFE3] truncate w-full">
                {language === 'am' ? 'መዋጮዬ' : 'Contributions'}
              </div>
              <div className="text-[9px] text-gray-400 truncate w-full mt-0.5">
                {language === 'am' ? 'የክፍያ ሁኔታ' : 'View Status'}
              </div>
            </button>
          </div>

          {/* "My Overview" Section (Photo 1 Middle) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {language === 'am' ? 'የእኔ አጠቃላይ መረጃ' : 'My Overview'}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {/* My Balance */}
              <div
                onClick={() => onNavigateTab('finance')}
                className="p-3.5 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition flex items-center gap-3 shadow-sacred"
              >
                <div className="w-10 h-10 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center shrink-0">
                  <Coins size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">
                    {language === 'am' ? 'የእኔ ሂሳብ' : 'My Balance'}
                  </div>
                  <div className="text-sm font-bold text-[#F5EFE3]">
                    {contribution.totalOutstanding === 0 ? '100 ETB' : `${contribution.totalOutstanding} ETB`}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-semibold">
                    {contribution.totalOutstanding === 0
                      ? (language === 'am' ? 'ተከፍሏል' : 'Paid this month')
                      : (language === 'am' ? 'ቀሪ አለብዎት' : 'Arrears')}
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div
                onClick={() => onNavigateTab('gatherings')}
                className="p-3.5 rounded-2xl bg-[#141A17] border border-[#B89A5A]/25 cursor-pointer hover:border-[#B89A5A]/50 transition flex items-center gap-3 shadow-sacred"
              >
                <div className="w-10 h-10 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">
                    {language === 'am' ? 'ምልአተ ጉባኤ' : 'Attendance'}
                  </div>
                  <div className="text-sm font-bold text-[#F5EFE3]">8/11</div>
                  <div className="text-[9px] text-[#B89A5A] font-semibold">
                    {language === 'am' ? 'ይህ ወር' : 'This month'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sacred Scripture Card (Photo 1 Middle) */}
          <div className="rounded-3xl p-5 bg-[#1B2420] border-2 border-[#B89A5A]/35 text-center shadow-sacred relative overflow-hidden space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#B89A5A]/20 text-[#B89A5A] flex items-center justify-center mx-auto shadow-candle-glow">
              <EthiopianCross size={18} color="#B89A5A" />
            </div>
            <div className="text-sm font-bold text-[#F5EFE3] font-serif tracking-wide">
              “እግዚአብሔር ይባርክህ ይጠብቅህም”
            </div>
            <p className="text-xs text-[#E5DCD0] italic font-serif">
              "The Lord blesses us and keeps us together."
            </p>
            <div className="text-[10px] text-[#B89A5A] font-bold tracking-widest uppercase">
              Psalm 133:1 • መዝሙረ ዳዊት 133:1
            </div>
          </div>

          {/* Upcoming Reminder Banner (Photo 1 Middle) */}
          <div className="rounded-2xl p-3 bg-[#6F2630]/20 border border-[#6F2630]/50 flex items-center justify-between shadow-sacred">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#6F2630]/40 flex items-center justify-center text-[#E5A0A9] shrink-0">
                <Bell size={14} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'የሚመጣ ማሳሰቢያ' : 'Upcoming Reminder'}
                </div>
                <div className="text-[10px] text-gray-300">
                  {language === 'am'
                    ? 'ቀን 24 እና 26 — የማኅበር መሰብሰቢያ ማስታወሻዎች'
                    : 'Day 24 & 26 — Gathering reminders'}
                </div>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-400" />
          </div>

          {/* Member RSVP Card */}
          <div className="rounded-3xl p-4 bg-[#141A17] border border-[#B89A5A]/25 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <span className="text-xs font-bold text-[#F5EFE3]">
                {language === 'am' ? 'በስብሰባው ላይ ይሳተፋሉ?' : 'Will you attend the gathering?'}
              </span>
              <span className="text-[10px] text-[#B89A5A] font-semibold">
                {language === 'am' ? countdownLabel.am : countdownLabel.en}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleComingClick}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                  attendanceStatus === 'coming'
                    ? 'bg-[#315C48] text-white ring-2 ring-[#315C48]/40'
                    : 'bg-[#6F2630] hover:bg-[#8C3542] text-white'
                }`}
              >
                <CheckCircle2 size={14} />
                <span>{t.btnImComing}</span>
              </button>

              <button
                onClick={handleCantComeClick}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  attendanceStatus === 'cant_come'
                    ? 'bg-[#6F2630]/30 border-[#6F2630] text-[#E5DCD0]'
                    : 'border-[#B89A5A]/30 text-gray-300 hover:bg-white/5'
                }`}
              >
                <XCircle size={14} />
                <span>{t.btnCantCome}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sacred Painting Rotation Info */}
      {(() => {
        const holder = allMembers.find((m) => m.id === paintingRotation.currentHolderId) || allMembers[0];
        const scheduledHost = allMembers.find((m) => m.id === (gathering?.scheduledHostId || paintingRotation.scheduledHostId)) || allMembers[1];

        return (
          <div className="rounded-3xl p-4 bg-[#141A17] border border-[#B89A5A]/25 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5EFE3]">
                <Shield size={16} className="text-[#B89A5A]" />
                <span>{language === 'am' ? 'የተቀደሱ ሥዕላት ዙር እና አስተናጋጅ' : 'Sacred Painting Rotation & Host'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-[#0E1210] border border-[#B89A5A]/15 flex items-center gap-2">
                <img
                  src={holder?.avatarUrl}
                  alt={holder?.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#B89A5A]/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-400">
                    {language === 'am' ? 'ሥዕላቱን የያዘው' : 'Painting Holder'}
                  </div>
                  <div className="font-semibold truncate text-[#F5EFE3]">
                    {language === 'am' ? holder?.amharicName : holder?.name}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#0E1210] border border-[#B89A5A]/15 flex items-center gap-2">
                <img
                  src={scheduledHost?.avatarUrl}
                  alt={scheduledHost?.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#B89A5A]/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-400">
                    {language === 'am' ? 'ቀጣይ አስተናጋጅ' : 'Upcoming Host'}
                  </div>
                  <div className="font-semibold truncate text-[#F5EFE3]">
                    {language === 'am' ? scheduledHost?.amharicName : scheduledHost?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Current Study Mezmur Card */}
      {currentMezmur && (
        <div className="rounded-3xl p-4 bg-[#141A17] border border-[#B89A5A]/25 shadow-sacred space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#6F2630]/20 border border-[#6F2630]/40 flex items-center justify-center text-[#B89A5A] shrink-0">
                <Music size={20} />
              </div>
              <div>
                <div className="text-[10px] text-[#B89A5A] font-medium uppercase tracking-wider">
                  {t.currentMezmur}
                </div>
                <div className="text-xs font-bold text-[#F5EFE3]">
                  {currentMezmur.titleAm}
                </div>
                <div className="text-[10px] text-gray-400">
                  {currentMezmur.titleEn || currentMezmur.categoryAm}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('mezmur')}
              className="w-9 h-9 rounded-full bg-[#B89A5A] hover:bg-[#D3BA7E] text-[#141A17] flex items-center justify-center shadow-md touch-press transition shrink-0"
            >
              <Play size={16} fill="#141A17" className="ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bible Reading Modal */}
      {showBibleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#141A17] rounded-3xl border border-[#B89A5A]/40 p-5 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#B89A5A]" />
                <h3 className="text-sm font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'የዕለቱ ቅዱስ ምንባብ' : "Today's Scripture"}
                </h3>
              </div>
              <button
                onClick={() => setShowBibleModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0E1210] border border-white/5 space-y-2 text-xs leading-relaxed">
              <div className="font-bold text-[#B89A5A]">መዝሙረ ዳዊት 133:1-3</div>
              <p className="text-gray-300 italic">
                “ወንድሞች በኅብረት ቢቀመጡ መልካም ነው፥ እነሆም፥ ምንኛ ያማረ ነው! በራስ ላይ እንደ ፈሰሰ እንደ መልካም ዘይት ነው፥ ወደ ጢም የሚወርድ፥ ወደ አሮን ጢም፥ እስከ ልብሱ ጫፍ ድረስ የሚወርድ።”
              </p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-white/5">
                "Behold, how good and how pleasant it is for brethren to dwell together in unity!"
              </div>
            </div>

            <button
              onClick={() => setShowBibleModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition"
            >
              {language === 'am' ? 'አሜን (ዝጋ)' : 'Amen (Close)'}
            </button>
          </div>
        </div>
      )}

      {/* Announcements Modal */}
      {showAnnouncementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#141A17] rounded-3xl border border-[#B89A5A]/40 p-5 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-2.5">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#B89A5A]" />
                <h3 className="text-sm font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'ወቅታዊ ማስታወቂያዎች' : 'Latest Announcements'}
                </h3>
              </div>
              <button
                onClick={() => setShowAnnouncementsModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#0E1210] border border-[#B89A5A]/20 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-[#B89A5A] font-semibold">
                  <span>የማኅበር ቀን 27 ማሳሰቢያ</span>
                  <span>ዛሬ</span>
                </div>
                <div className="font-bold text-[#F5EFE3]">የጥቅምት 27 ማኅበር ዝግጅት</div>
                <p className="text-[11px] text-gray-400">
                  የቀጣዩ ወር ማኅበር በአቶ አበበ ተስፋዬ ቤት ይካሄዳል። እባክዎ በሰዓቱ ይገኙ።
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#0E1210] border border-white/5 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold">
                  <span>የመዝሙር ጥናት</span>
                  <span>ትናንት</span>
                </div>
                <div className="font-bold text-[#F5EFE3]">አዲስ የመዝሙር ጥናት ተጀምሯል</div>
                <p className="text-[11px] text-gray-400">
                  "በስመ አብ" የተሰኘው መዝሙር ለዚህ ወር ጥናት ተመርጧል። በመዝሙር ገጽ ያዳምጡ።
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAnnouncementsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition"
            >
              {language === 'am' ? 'ዝጋ' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Attendance Excuse Modal */}
      {gathering && (
        <AttendanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};
