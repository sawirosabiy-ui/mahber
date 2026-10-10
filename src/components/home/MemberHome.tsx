import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Gathering, AttendanceRecord, MemberContribution, Mezmur } from '../../types';
import { mahberService } from '../../services/mahberService';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';
import { AttendanceModal } from '../attendance/AttendanceModal';
import { EmptyView } from '../common/StateViews';
import { calculateGatheringCountdown, ethiopianToGregorian } from '../../utils/ethiopianCalendar';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Music,
  MessageSquare,
  Play,
  ArrowRight,
  Sparkles,
  Shield,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  DollarSign,
} from 'lucide-react';

interface MemberHomeProps {
  gathering: Gathering | null;
  attendance: AttendanceRecord[];
  contribution: MemberContribution;
  currentMezmur: Mezmur | undefined;
  onAttendanceUpdate: (status: 'coming' | 'cant_come', reason?: any, note?: string) => void;
  onNavigateTab: (tab: 'home' | 'mahber' | 'room' | 'mezmur' | 'more' | 'admin') => void;
}

export const MemberHome: React.FC<MemberHomeProps> = ({
  gathering,
  attendance,
  contribution,
  currentMezmur,
  onAttendanceUpdate,
  onNavigateTab,
}) => {
  const { t, language } = useLanguage();
  const { currentUser, allMembers } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rsvpToast, setRsvpToast] = useState<string | null>(null);

  // Sacred Painting Rotation & Mahber V1 Data
  const [paintingRotation, setPaintingRotation] = useState(() => mahberService.getPaintingRotation());
  const [userPenalties, setUserPenalties] = useState(() => mahberService.getMemberPenalties(currentUser.id));
  const [proposals, setProposals] = useState(() => mahberService.getSpendingProposals());

  // Live countdown state based on local device time
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
    <div className="space-y-4 pb-20">
      {/* RSVP Confirmation Toast */}
      {rsvpToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#315C48] text-white px-4 py-2.5 rounded-2xl shadow-candle-glow border border-[#427A60] flex items-center gap-2 text-xs font-semibold animate-fade-in max-w-xs text-center">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{rsvpToast}</span>
        </div>
      )}

      {/* Top Identity Header */}
      <div className="pt-2 pb-1 text-center flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-[#B89A5A]/10 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A] mb-1.5 shadow-candle-glow">
          <EthiopianCross size={24} color="#B89A5A" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
          {language === 'am' ? 'መድኃኔዓለም ማኅበር' : 'MEDHANIALEM MAHBER'}
        </h1>
        <p className="text-xs text-[#B89A5A]/80 tracking-wider font-serif">
          {language === 'am' ? 'አንድ ማኅበር ፣ አንድ ቤተክርስቲያን' : 'ONE FELLOWSHIP • ONE CHURCH'}
        </p>
      </div>

      {/* If No Scheduled Gathering Exists: Calm Empty State */}
      {!gathering ? (
        <EmptyView
          title={language === 'am' ? 'ቀጣይ ማኅበር የለም።' : 'No upcoming Mahber.'}
          subtitle={
            language === 'am'
              ? 'አስተዳዳሪው የሚቀጥለውን የማኅበር መሰብሰቢያ ቀን እስኪያዘጋጅ ይጠብቁ።'
              : 'Please wait until an administrator schedules the next gathering.'
          }
        />
      ) : (
        <>
          {/* Date Header Pill (Primary: Ethiopian Date, Secondary: Gregorian Date) */}
          <div className="mx-1 py-2 px-3.5 rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 flex items-center justify-between shadow-sacred-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                  {gathering.ethDate}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
                  {gathering.gregDate}
                </div>
              </div>
            </div>
            {/* Dynamic Countdown */}
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#315C48]/25 text-[#427A60] dark:text-[#529575] border border-[#315C48]/30">
              {language === 'am' ? countdownLabel.am : countdownLabel.en}
            </span>
          </div>

          {/* Primary Card: Next Mahber Hero */}
          <div className="relative rounded-3xl overflow-hidden border border-[#B89A5A]/30 bg-[#201D19] shadow-sacred group">
            {/* Arched church interior visual */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={gathering.imageUrl || "https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=800&auto=format&fit=crop&q=80"}
                alt="Ethiopian Church Arch"
                className="w-full h-full object-cover object-center filter brightness-50 group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#201D19] via-[#201D19]/40 to-transparent" />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#B89A5A]/30 text-[11px] text-[#B89A5A] font-medium flex items-center gap-1.5">
                <EthiopianCross size={12} color="#B89A5A" />
                <span>{t.nextMahber}</span>
              </div>
            </div>

            <div className="p-4 -mt-10 relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                  {language === 'am' ? 'የሚቀጥለው ማኅበር መሰብሰቢያ' : 'Upcoming Mahber Gathering'}
                </h2>
                <button
                  onClick={() => onNavigateTab('mahber')}
                  className="text-xs text-[#B89A5A] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{t.btnViewDetails}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#29251F]/80 border border-white/5">
                  <Clock size={15} className="text-[#B89A5A]" />
                  <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">{gathering.time}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#29251F]/80 border border-white/5">
                  <MapPin size={15} className="text-[#B89A5A]" />
                  <span className="text-gray-300 dark:text-gray-300 light:text-gray-700">{gathering.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Status Card */}
          <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2.5">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 light:text-gray-500 tracking-wider uppercase">
                {t.yourStatus}
              </span>
              <span className="text-xs font-medium text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {currentUser.amharicName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Attendance Status */}
              <div className="p-3 rounded-2xl bg-[#29251F]/70 dark:bg-[#29251F]/70 light:bg-[#F8F3EA] border border-[#B89A5A]/15 flex items-center gap-2.5">
                {attendanceStatus === 'coming' ? (
                  <CheckCircle2 size={20} className="text-[#315C48] shrink-0" />
                ) : attendanceStatus === 'cant_come' ? (
                  <XCircle size={20} className="text-[#6F2630] shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-gray-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400">{t.statusAttendance}</div>
                  <div className="text-xs font-semibold truncate text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                    {attendanceStatus === 'coming'
                      ? `🟢 ${t.statusComing}`
                      : attendanceStatus === 'cant_come'
                      ? `🔴 ${t.statusCantCome}`
                      : `⚪ ${t.statusNoResponse}`}
                  </div>
                </div>
              </div>

              {/* Contribution Status (Text + Icon for Accessibility) */}
              <div
                onClick={() => onNavigateTab('more')}
                className="p-3 rounded-2xl bg-[#29251F]/70 dark:bg-[#29251F]/70 light:bg-[#F8F3EA] border border-[#B89A5A]/15 flex items-center gap-2.5 cursor-pointer hover:border-[#B89A5A]/40 transition"
              >
                {isPaid ? (
                  <CheckCircle2 size={20} className="text-[#315C48] shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-[#B89A5A] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400">{t.statusContribution}</div>
                  <div className="text-xs font-semibold truncate text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                    {isPaid ? `🟢 ✓ ${t.statusPaid}` : `🟡 ⚠ ${contribution.totalOutstanding} ${t.currencyEtb}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Attendance Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={handleComingClick}
                className={`flex-1 py-3 px-3 rounded-2xl font-bold text-xs tracking-wide transition shadow-md touch-press flex items-center justify-center gap-1.5 ${
                  attendanceStatus === 'coming'
                    ? 'bg-[#315C48] text-white border border-[#427A60] ring-2 ring-[#315C48]/30'
                    : 'bg-[#6F2630] hover:bg-[#8C3542] text-white'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{t.btnImComing}</span>
              </button>

              <button
                onClick={handleCantComeClick}
                className={`flex-1 py-3 px-3 rounded-2xl font-semibold text-xs tracking-wide border transition touch-press flex items-center justify-center gap-1.5 ${
                  attendanceStatus === 'cant_come'
                    ? 'bg-[#6F2630]/20 border-[#6F2630] text-[#E5DCD0]'
                    : 'border-[#B89A5A]/30 text-gray-300 dark:text-gray-300 light:text-[#4A3F35] hover:bg-white/5'
                }`}
              >
                <XCircle size={16} />
                <span>{t.btnCantCome}</span>
              </button>
            </div>
          </div>

          {/* Personal Outstanding Penalties Banner (if any) */}
          {userPenalties.filter((p) => p.status === 'pending').length > 0 && (
            <div className="rounded-2xl p-3.5 bg-[#6F2630]/25 border border-[#6F2630]/50 text-xs space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between text-[#E5DCD0] font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-[#D98A94]" />
                  <span>{language === 'am' ? 'ያልተከፈለ ቅጣት አለብዎት' : 'Outstanding Penalties'}</span>
                </span>
                <span className="text-[#B89A5A]">
                  {userPenalties.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)} {t.currencyEtb}
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                {language === 'am'
                  ? 'የማርፈድ (100 ብር) ወይም ያለፈቃድ የመቅረት (200 ብር) ቅጣት ተመዝግቧል። እባክዎ ለገንዘብ ያዥ ናትናኤል እንዳለ ወይም ሳዊሮስ አብይ ያስረክቡ።'
                  : 'Late arrival (100 ETB) or absence (200 ETB) recorded. Please settle with Finance Admin.'}
              </p>
            </div>
          )}

          {/* Sacred Painting Rotation & Host Info Card */}
          {(() => {
            const holder = allMembers.find((m) => m.id === paintingRotation.currentHolderId) || allMembers[0];
            const nextHost = allMembers.find((m) => m.id === paintingRotation.nextAssignedHostId) || allMembers[1];
            const scheduledHost = allMembers.find((m) => m.id === (gathering.scheduledHostId || paintingRotation.scheduledHostId)) || nextHost;
            const hasSwap = gathering.scheduledHostId && gathering.scheduledHostId !== paintingRotation.nextAssignedHostId;

            return (
              <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/25 shadow-sacred space-y-3">
                <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F5EFE3]">
                    <Shield size={16} className="text-[#B89A5A]" />
                    <span>{language === 'am' ? 'የተቀደሱ ሥዕላት ዙር እና አስተናጋጅ' : 'Sacred Painting Rotation & Host'}</span>
                  </div>
                  {hasSwap && (
                    <span className="px-2 py-0.5 rounded-full bg-[#B89A5A]/20 border border-[#B89A5A]/40 text-[10px] text-[#B89A5A] font-semibold">
                      {language === 'am' ? 'የአስተናጋጅ ቅያሪ' : 'Host Swap'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Current Holder */}
                  <div className="p-2.5 rounded-2xl bg-[#29251F]/70 border border-[#B89A5A]/15 flex items-center gap-2">
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

                  {/* Scheduled Host */}
                  <div className="p-2.5 rounded-2xl bg-[#29251F]/70 border border-[#B89A5A]/15 flex items-center gap-2">
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

          {/* Spiritual & Scripture Teaching Card */}
          {(gathering.biblePassage || gathering.teachingNotes) && (
            <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5EFE3] border-b border-[#B89A5A]/15 pb-2">
                <BookOpen size={16} className="text-[#B89A5A]" />
                <span>{language === 'am' ? 'የመንፈሳዊ ንባብ እና ትምህርት መርሃ-ግብር' : 'Scripture Reading & Teaching'}</span>
              </div>
              {gathering.biblePassage && (
                <div className="text-xs">
                  <span className="text-[#B89A5A] font-semibold">
                    {language === 'am' ? 'የዕለቱ ምንባብ: ' : 'Passage: '}
                  </span>
                  <span className="text-[#F5EFE3]">{gathering.biblePassage}</span>
                </div>
              )}
              {gathering.teachingNotes && (
                <p className="text-[11px] text-gray-300 leading-relaxed italic bg-white/5 p-2.5 rounded-xl border border-white/5">
                  "{gathering.teachingNotes}"
                </p>
              )}
            </div>
          )}

          {/* Spending Proposals & Majority Voting (Shared Fund) */}
          {proposals.filter((p) => p.status === 'active').length > 0 && (
            <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/25 shadow-sacred space-y-3">
              <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5EFE3]">
                  <DollarSign size={16} className="text-[#B89A5A]" />
                  <span>{language === 'am' ? 'የጋራ ፈንድ የወጪ ውሳኔ (ድምጽ ይስጡ)' : 'Shared Fund Spending Proposals'}</span>
                </div>
                <span className="text-[10px] text-[#B89A5A] font-semibold">
                  {language === 'am' ? '>50% ድምጽ ያስፈልጋል' : '>50% majority required'}
                </span>
              </div>

              {proposals.filter((p) => p.status === 'active').map((prop) => {
                const userVote = prop.votes.find((v) => v.memberId === currentUser.id);
                const favorCount = prop.votes.filter((v) => v.vote === 'favor').length;
                const againstCount = prop.votes.filter((v) => v.vote === 'against').length;
                const majorityTarget = Math.floor(allMembers.length / 2) + 1; // 6 for 11 members

                const handleCastVote = (vote: 'favor' | 'against') => {
                  const res = mahberService.voteOnProposal(prop.id, currentUser.id, vote, allMembers.length);
                  if (res.error) {
                    setRsvpToast(res.error);
                  } else {
                    setProposals(mahberService.getSpendingProposals());
                    setRsvpToast(
                      language === 'am' ? 'ድምጽዎ በተሳካ ሁኔታ ተመዝግቧል!' : 'Your vote was recorded!'
                    );
                  }
                  setTimeout(() => setRsvpToast(null), 3000);
                };

                return (
                  <div key={prop.id} className="p-3 rounded-2xl bg-[#29251F]/80 border border-[#B89A5A]/20 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#F5EFE3]">
                          {language === 'am' ? prop.titleAm : prop.title}
                        </h4>
                        <p className="text-[11px] text-gray-300 mt-0.5">{prop.description}</p>
                      </div>
                      <span className="text-xs font-extrabold text-[#B89A5A] px-2 py-0.5 rounded-lg bg-[#B89A5A]/15">
                        {prop.amount} {t.currencyEtb}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span>{language === 'am' ? `የደገፉ: ${favorCount}/${majorityTarget}` : `In Favor: ${favorCount}/${majorityTarget}`}</span>
                      <span>{language === 'am' ? `የተቃወሙ: ${againstCount}` : `Against: ${againstCount}`}</span>
                    </div>

                    {/* Progress bar towards majority */}
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#315C48] transition-all"
                        style={{ width: `${Math.min(100, (favorCount / majorityTarget) * 100)}%` }}
                      />
                    </div>

                    {/* Voting buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleCastVote('favor')}
                        disabled={!!userVote}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                          userVote?.vote === 'favor'
                            ? 'bg-[#315C48] text-white ring-1 ring-white/20'
                            : userVote
                            ? 'opacity-40 bg-white/5 text-gray-400'
                            : 'bg-[#315C48]/30 hover:bg-[#315C48]/50 text-[#68B78D] border border-[#315C48]/50'
                        }`}
                      >
                        <ThumbsUp size={12} />
                        <span>{language === 'am' ? 'እደግፋለሁ' : 'In Favor'}</span>
                      </button>

                      <button
                        onClick={() => handleCastVote('against')}
                        disabled={!!userVote}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                          userVote?.vote === 'against'
                            ? 'bg-[#6F2630] text-white ring-1 ring-white/20'
                            : userVote
                            ? 'opacity-40 bg-white/5 text-gray-400'
                            : 'bg-[#6F2630]/30 hover:bg-[#6F2630]/50 text-[#E598A4] border border-[#6F2630]/50'
                        }`}
                      >
                        <ThumbsDown size={12} />
                        <span>{language === 'am' ? 'እቃወማለሁ' : 'Against'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Current Mezmur Banner with Study Status */}
      {currentMezmur ? (
        (() => {
          const studyStatus = mahberService.calculateUserStudyStatus(currentUser.id, currentMezmur.id);
          const hasPracticedToday = mahberService.hasPracticedToday(currentUser.id, mahberService.getUserStudy(currentUser.id, currentMezmur.id)?.id || '');

          return (
            <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#6F2630]/20 border border-[#6F2630]/40 flex items-center justify-center text-[#B89A5A] shrink-0">
                    <Music size={22} />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#B89A5A] font-medium uppercase tracking-wider">
                      {t.currentMezmur}
                    </div>
                    <div className="text-sm font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                      {currentMezmur.titleAm}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {currentMezmur.titleEn || currentMezmur.categoryAm}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('mezmur')}
                  className="w-10 h-10 rounded-full bg-[#B89A5A] hover:bg-[#D3BA7E] text-[#151311] flex items-center justify-center shadow-md touch-press transition shrink-0"
                  title={t.btnOpenMezmur}
                >
                  <Play size={18} fill="#151311" className="ml-0.5" />
                </button>
              </div>

              {/* Study Participation Status Indicator */}
              <div className="pt-2 border-t border-[#B89A5A]/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">የጥናት ደረጃ (Your Status):</span>
                  {studyStatus === 'active' ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#315C48]/20 border border-[#315C48]/40 text-[#427A60] font-semibold text-[11px] flex items-center gap-1">
                      <span>🟢</span>
                      <span>{hasPracticedToday ? (language === 'am' ? 'ዛሬ ተለማምደዋል' : 'Practiced today') : (language === 'am' ? 'እያጠናሁ ነው' : 'Studying')}</span>
                    </span>
                  ) : studyStatus === 'started' ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#B89A5A]/20 border border-[#B89A5A]/40 text-[#D3BA7E] font-semibold text-[11px] flex items-center gap-1">
                      <span>🟡</span>
                      <span>{language === 'am' ? 'ተጀምሯል' : 'Started'}</span>
                    </span>
                  ) : studyStatus === 'completed' ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#315C48]/30 border border-[#315C48] text-white font-semibold text-[11px] flex items-center gap-1">
                      <span>✓</span>
                      <span>{language === 'am' ? 'ተጠናቋል' : 'Completed'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-medium text-[11px] flex items-center gap-1">
                      <span>⚪</span>
                      <span>{language === 'am' ? 'አልተጀመረም' : 'Not started'}</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onNavigateTab('mezmur')}
                  className="text-[11px] text-[#B89A5A] hover:underline font-semibold"
                >
                  {studyStatus === 'not_started'
                    ? (language === 'am' ? 'ጥናት ጀምር →' : 'Start Study →')
                    : (language === 'am' ? 'ክፈት →' : 'Open →')}
                </button>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="p-3 rounded-2xl bg-[#201D19] border border-white/5 text-center text-xs text-gray-400">
          {language === 'am' ? 'እስካሁን መዝሙር አልተመረጠም።' : 'No Mezmur selected yet.'}
        </div>
      )}

      {/* Room Preview Card */}
      {(() => {
        const unreadMsgCount = mahberService.getUnreadCount(currentUser.id);
        const prayerCount = mahberService.getPrayerRequests(currentUser.id, currentUser.role === 'admin').length;

        return (
          <div
            onClick={() => onNavigateTab('room')}
            className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred flex items-center justify-between cursor-pointer hover:border-[#B89A5A]/40 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#315C48]/20 border border-[#315C48]/40 flex items-center justify-center text-[#427A60]">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                  {t.roomActivity}
                </div>
                <div className="text-[11px] text-gray-400">
                  {unreadMsgCount > 0 ? `${unreadMsgCount} ${t.newMessages}` : (language === 'am' ? 'ሁሉም ተነቧል' : 'All caught up')} • {prayerCount} {t.tabPrayers}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#B89A5A]">
              {unreadMsgCount > 0 && <span className="w-2 h-2 rounded-full bg-[#315C48] animate-pulse" />}
              <ArrowRight size={15} />
            </div>
          </div>
        );
      })()}

      {/* Digital Memory Book & History Shortcut */}
      <div
        onClick={() => onNavigateTab('mahber')}
        className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/25 shadow-sacred flex items-center justify-between cursor-pointer hover:border-[#B89A5A]/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#B89A5A]/15 border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {language === 'am' ? 'የማኅበር ታሪክና ትውስታዎች' : 'Mahber History & Memory Book'}
            </div>
            <div className="text-[11px] text-gray-400">
              {language === 'am' ? 'ያለፉ መሰብሰቢያዎች ፣ ትውስታዎች እና ፎቶዎች' : 'Past gatherings, spiritual memories & photos'}
            </div>
          </div>
        </div>
        <ArrowRight size={15} className="text-[#B89A5A]" />
      </div>

      {/* Admin Management Hub Card (Visible strictly to Admins) */}
      {currentUser.role === 'admin' && (
        <div
          onClick={() => onNavigateTab('admin')}
          className="rounded-3xl p-4 bg-[#6F2630]/20 border border-[#6F2630]/40 shadow-sacred space-y-2 cursor-pointer hover:bg-[#6F2630]/30 transition animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#D98A94]">
              ⭐ {language === 'am' ? 'የአስተዳዳሪ ማዕከል' : 'Admin Control Hub'}
            </span>
            <span className="text-[11px] text-[#B89A5A] font-semibold">
              {language === 'am' ? 'ወደ አስተዳዳሪ ሂድ →' : 'Open Admin →'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#F5EFE3]">
                {language === 'am' ? 'የመገኘት መመዝገቢያ ፣ ኦዲት እና አባላት' : 'Live 4-State Attendance, Audits & Members'}
              </h4>
              <p className="text-[10px] text-gray-300">
                🟢 {language === 'am' ? 'ተገኝቷል' : 'Present'} • 🟡 {language === 'am' ? 'በይቅርታ' : 'Excused'} • 🟠 {language === 'am' ? 'ዘግይቷል' : 'Late (Orange)'} • 🔴 {language === 'am' ? 'ያልተገኘ' : 'Absent'}
              </p>
            </div>
          </div>
        </div>
      )}

      <SacredDivider />

      {/* Attendance Modal */}
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
