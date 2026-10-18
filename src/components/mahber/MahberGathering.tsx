import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Gathering,
  AttendanceRecord,
  Member,
  MahberHistoryGathering,
  GatheringAttendanceEntry,
} from '../../types';
import { mahberService } from '../../services/mahberService';
import { EthiopianCross } from '../common/EthiopianCross';
import { EmptyView } from '../common/StateViews';
import { HistoryView } from '../history/HistoryView';
import { CalendarRemindersView } from './CalendarRemindersView';
import { HostingRotationView } from './HostingRotationView';
import { GatheringDetailsModal } from './GatheringDetailsModal';
import { AttendanceManagerModal } from './AttendanceManagerModal';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Sparkles,
} from 'lucide-react';
import { NavTab } from '../navigation/BottomNav';

interface MahberGatheringProps {
  gathering: Gathering | null;
  attendance: AttendanceRecord[];
  allMembers: Member[];
  history?: MahberHistoryGathering[];
  onOpenMezmur?: (mezmurId: string) => void;
  onRefreshHistory?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const MahberGathering: React.FC<MahberGatheringProps> = ({
  gathering,
  attendance,
  allMembers,
  history = [],
  onOpenMezmur,
  onRefreshHistory,
  onNavigateTab,
}) => {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();

  // Top Section Navigation matching Photos 2 & 3: [Upcoming | Past | Calendar | Rotation]
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'calendar' | 'rotation'>('upcoming');

  // Modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Live Gathering Attendance State (auto-updates when admin saves)
  const [actualAttendanceMap, setActualAttendanceMap] = useState<Record<string, GatheringAttendanceEntry>>(() =>
    gathering ? mahberService.getActualAttendance(gathering.id) : {}
  );

  const refreshActual = () => {
    if (gathering) {
      setActualAttendanceMap(mahberService.getActualAttendance(gathering.id));
    }
  };

  useEffect(() => {
    refreshActual();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mahber_actual_attendance_v1' || e.key === 'mahber_history_v3') {
        refreshActual();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('mahber_attendance_updated', refreshActual);
    window.addEventListener('mahber_history_updated', refreshActual);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mahber_attendance_updated', refreshActual);
      window.removeEventListener('mahber_history_updated', refreshActual);
    };
  }, [gathering?.id]);

  if (!gathering) {
    return (
      <div className="py-6">
        <EmptyView
          title={language === 'am' ? 'ቀጣይ ማኅበር የለም።' : 'No upcoming Mahber.'}
          subtitle={
            language === 'am'
              ? 'አስተዳዳሪው የሚቀጥለውን የማኅበር መሰብሰቢያ ቀን እስኪያዘጋጅ ይጠብቁ።'
              : 'Please wait until an administrator schedules the next gathering.'
          }
        />
      </div>
    );
  }

  const assignedHost =
    allMembers.find((m) => m.id === gathering.scheduledHostId) ||
    allMembers.find((m) => m.id === gathering.assignedHostId) ||
    allMembers[0];

  // Up to 4 upcoming monthly gatherings sequence
  const upcomingGatheringsList = [
    {
      id: 'g-2018-01',
      monthCode: 'MES',
      ethDate: 'መስከረም 27, 2018 (Oct 6, 2025)',
      time: '2:00 PM – 5:00 PM',
      location: 'CMC, Addis Ababa',
      host: allMembers[0],
      isNext: true,
    },
    {
      id: 'g-2018-02',
      monthCode: 'TIK',
      ethDate: 'ጥቅምት 27, 2018 (Nov 6, 2025)',
      time: '2:00 PM – 5:00 PM',
      location: 'Bole, Addis Ababa',
      host: allMembers[1],
      isNext: false,
    },
    {
      id: 'g-2018-03',
      monthCode: 'HID',
      ethDate: 'ኅዳር 27, 2018 (Dec 6, 2025)',
      time: '2:00 PM – 5:00 PM',
      location: 'Megenagna, Addis Ababa',
      host: allMembers[2],
      isNext: false,
    },
    {
      id: 'g-2018-04',
      monthCode: 'TAH',
      ethDate: 'ታኅሣሥ 27, 2018 (Jan 6, 2026)',
      time: '2:00 PM – 5:00 PM',
      location: 'Sarbet, Addis Ababa',
      host: allMembers[3],
      isNext: false,
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Top Segmented Controls matching Photos 2 & 3 */}
      <div className="flex bg-[#141A17] p-1 rounded-2xl border border-[#B89A5A]/20">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የሚመጡ' : 'Upcoming'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'calendar'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የቀን መቁጠሪያ' : 'Calendar'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rotation')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rotation'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የአስተናጋጅ ተራ' : 'Rotation'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'ያለፉ' : 'Past'}
        </button>
      </div>

      {/* VIEW 1: UPCOMING GATHERINGS (Photos 2 & 3) */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {/* Featured Hero Card for Next Gathering matching Photos 2 & 3 */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#6F2630]/80 via-[#1B2420] to-[#141A17] border border-[#B89A5A]/40 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#B89A5A]/20 text-[#B89A5A] text-[10px] font-black uppercase tracking-wider border border-[#B89A5A]/30 flex items-center gap-1.5">
                <Sparkles size={12} />
                {language === 'am' ? 'ቀጣይ ማኅበር' : 'Next Gathering'}
              </span>
              <span className="text-xs text-[#F5EFE3] font-semibold flex items-center gap-1">
                <Clock size={13} className="text-[#B89A5A]" />
                {gathering.time}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#6F2630] border-2 border-[#B89A5A] flex flex-col items-center justify-center text-center shadow-lg shrink-0">
                <span className="text-[10px] font-black text-[#B89A5A] tracking-wider uppercase">
                  MES
                </span>
                <span className="text-xl font-black text-white leading-none">27</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#F5EFE3] leading-tight">
                  {gathering.ethDate}
                </h3>
                <p className="text-xs text-[#B89A5A]">{gathering.gregDate}</p>
                <p className="text-xs text-[#9E9484] flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-[#B89A5A]" />
                  {gathering.location} · Hosted by {assignedHost.name}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(true)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:opacity-95"
              >
                {language === 'am' ? 'ዝርዝር መረጃ እይ →' : 'View Details →'}
              </button>
              <button
                type="button"
                onClick={() => setIsAttendanceModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#1B2420] text-[#F5EFE3] text-xs font-bold border border-[#B89A5A]/30 hover:bg-[#25322C] flex items-center gap-1.5"
              >
                <Users size={14} className="text-[#B89A5A]" />
                {isAdmin ? 'Roll Call' : 'Attendance'}
              </button>
            </div>
          </div>

          {/* Quick Actions Grid matching Photo 2 Screen 5 */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 flex flex-col items-center text-center gap-1.5 hover:border-[#B89A5A]/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                <Users size={16} />
              </div>
              <span className="text-[11px] font-bold text-[#F5EFE3]">
                {language === 'am' ? 'ተሳትፎ መዝግብ' : 'Attendance'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 flex flex-col items-center text-center gap-1.5 hover:border-[#B89A5A]/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                <CalendarIcon size={16} />
              </div>
              <span className="text-[11px] font-bold text-[#F5EFE3]">
                {language === 'am' ? 'ቀን መቁጠሪያ' : 'Calendar'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rotation')}
              className="p-3 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 flex flex-col items-center text-center gap-1.5 hover:border-[#B89A5A]/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center">
                <RotateCcw size={16} />
              </div>
              <span className="text-[11px] font-bold text-[#F5EFE3]">
                {language === 'am' ? 'የአስተናጋጅ ተራ' : 'Rotation'}
              </span>
            </button>
          </div>

          {/* Upcoming Schedule List matching Photo 2 & 3 */}
          <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20 space-y-3">
            <h4 className="text-xs font-bold text-[#B89A5A] uppercase tracking-wider">
              {language === 'am' ? 'የሚቀጥሉት ወራት ማኅበራት' : 'Upcoming Gatherings Schedule'}
            </h4>

            <div className="space-y-2.5">
              {upcomingGatheringsList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between hover:border-[#B89A5A]/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6F2630]/80 border border-[#B89A5A]/50 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[8px] font-black text-[#B89A5A] uppercase">
                        {item.monthCode}
                      </span>
                      <span className="text-sm font-black text-white leading-none">27</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#F5EFE3]">{item.ethDate}</p>
                        {item.isNext && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#B89A5A] text-[#0E1210] text-[8px] font-black uppercase">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9E9484] flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-[#B89A5A]" />
                        {item.location} · Host: {item.host?.name || 'Assigned Host'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#9E9484]" />
                </div>
              ))}
            </div>
          </div>

          {/* Scripture Card matching Photo 2 & 3 */}
          <div className="p-4 rounded-2xl bg-[#141A17] border border-[#B89A5A]/30 text-center space-y-1.5">
            <EthiopianCross size={20} color="#B89A5A" className="mx-auto" />
            <p className="text-xs font-medium text-[#F5EFE3] italic">
              "For where two or three are gathered in my name, there am I among them."
            </p>
            <p className="text-[10px] font-bold text-[#B89A5A]">Matthew 18:20</p>
          </div>
        </div>
      )}

      {/* VIEW 2: CALENDAR & REMINDERS (Photos 2 & 7) */}
      {activeTab === 'calendar' && (
        <CalendarRemindersView
          currentGathering={gathering}
          onSelectGathering={() => setIsDetailsModalOpen(true)}
        />
      )}

      {/* VIEW 3: HOSTING ROTATION & SWAPS (Photos 3 & 6) */}
      {activeTab === 'rotation' && (
        <HostingRotationView
          allMembers={allMembers}
          gatheringId={gathering.id}
          onRotationUpdated={refreshActual}
        />
      )}

      {/* VIEW 4: PAST GATHERINGS & ARCHIVE */}
      {activeTab === 'past' && (
        <HistoryView
          history={history}
          onRefreshHistory={onRefreshHistory}
        />
      )}

      {/* MODAL: Gathering Details matching Photo 4 */}
      {isDetailsModalOpen && (
        <GatheringDetailsModal
          gathering={gathering}
          allMembers={allMembers}
          onClose={() => setIsDetailsModalOpen(false)}
          onOpenAttendanceRollCall={() => {
            setIsDetailsModalOpen(false);
            setIsAttendanceModalOpen(true);
          }}
          onOpenRotation={() => {
            setIsDetailsModalOpen(false);
            setActiveTab('rotation');
          }}
        />
      )}

      {/* MODAL: Attendance Roll Call Manager matching Photo 5 */}
      {isAttendanceModalOpen && (
        <AttendanceManagerModal
          gatheringId={gathering.id}
          gatheringTitle={`${gathering.ethDate} · ${gathering.time}`}
          allMembers={allMembers}
          onClose={() => setIsAttendanceModalOpen(false)}
          onSaved={refreshActual}
        />
      )}
    </div>
  );
};
