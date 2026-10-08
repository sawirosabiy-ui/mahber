import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Gathering, AttendanceRecord, Member, MahberHistoryGathering } from '../../types';
import { mahberService } from '../../services/mahberService';
import { EthiopianCross } from '../common/EthiopianCross';
import { EmptyView } from '../common/StateViews';
import { HistoryView } from '../history/HistoryView';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  ChevronRight,
  BookOpen,
  History,
} from 'lucide-react';

interface MahberGatheringProps {
  gathering: Gathering | null;
  attendance: AttendanceRecord[];
  allMembers: Member[];
  history?: MahberHistoryGathering[];
  onOpenMezmur?: (mezmurId: string) => void;
  onRefreshHistory?: () => void;
}

export const MahberGathering: React.FC<MahberGatheringProps> = ({
  gathering,
  attendance,
  allMembers,
  history = [],
  onOpenMezmur,
  onRefreshHistory,
}) => {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'program' | 'roster' | 'history'>('program');

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

  const activeMembers = allMembers.filter((m) => !m.isDeactivated);
  const totalCount = activeMembers.length;

  const comingCount = attendance.filter((a) => a.status === 'coming').length;
  const cantComeCount = attendance.filter((a) => a.status === 'cant_come').length;
  const noResponseCount = Math.max(0, totalCount - comingCount - cantComeCount);
  const attendancePercentage = totalCount > 0 ? Math.round((comingCount / totalCount) * 100) : 0;

  // Month days for Meskerem (1 to 30)
  const meskeremDays = Array.from({ length: 30 }, (_, i) => i + 1);

  // Extract day number from gathering.ethDate (e.g. "27 መስከረም 2019" -> 27)
  const gatheringDayMatch = gathering.ethDate.match(/\d+/);
  const gatheringDay = gatheringDayMatch ? parseInt(gatheringDayMatch[0], 10) : 27;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Segmented Control */}
      <div className="flex p-1 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] rounded-2xl border border-[#B89A5A]/20 shadow-sacred-sm">
        <button
          onClick={() => setActiveTab('program')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'program'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white'
          }`}
        >
          {t.tabProgram}
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'calendar'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white'
          }`}
        >
          {t.tabDate}
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'roster'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white'
          }`}
        >
          {t.attendanceRoster} ({comingCount}/{totalCount})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
            activeTab === 'history'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white'
          }`}
        >
          {language === 'am' ? 'ታሪክ' : 'History'}
        </button>
      </div>

      {/* Program View */}
      {activeTab === 'program' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Card with Church Photography */}
          <div className="relative rounded-3xl overflow-hidden border border-[#B89A5A]/30 bg-[#201D19] shadow-sacred">
            <div className="h-40 w-full relative">
              <img
                src={gathering.imageUrl || "https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=800&auto=format&fit=crop&q=80"}
                alt="Ethiopian Orthodox Church"
                className="w-full h-full object-cover brightness-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#201D19] via-[#201D19]/50 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                    <EthiopianCross size={18} color="#B89A5A" />
                    <span>{gathering.titleAm || t.appTitle}</span>
                  </h2>
                  <p className="text-xs text-gray-300">
                    {gathering.ethDate} • {gathering.time}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-[#315C48]/80 text-[11px] text-white border border-[#315C48]">
                    {gathering.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={14} className="text-[#B89A5A]" />
                <span>{gathering.locationDetails || t.gatheringAddress}</span>
              </div>
              {gathering.notes && (
                <p className="text-[11px] text-gray-300 italic pt-1">
                  «{gathering.notes}»
                </p>
              )}
            </div>
          </div>

          {/* Today's Program List */}
          <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#B89A5A]" />
                <h3 className="text-sm font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                  {t.todaysProgram}
                </h3>
              </div>
              <span className="text-[11px] text-[#B89A5A] font-serif">
                {gathering.program.length} ክፍሎች
              </span>
            </div>

            <div className="space-y-2">
              {gathering.program.map((item) => (
                <div
                  key={item.order}
                  className="p-3 rounded-2xl bg-[#29251F]/70 dark:bg-[#29251F]/70 light:bg-[#F8F3EA] border border-[#B89A5A]/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#B89A5A]/15 text-[#B89A5A] font-bold text-xs flex items-center justify-center font-serif">
                      {item.order}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                        {language === 'am' ? item.titleAm : item.titleEn}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {language === 'am' ? item.titleEn : item.titleAm}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-500" />
                </div>
              ))}
            </div>

            {/* THIS MAHBER'S MEZMUR */}
            {(() => {
              const currentM = mahberService.getCurrentStudyMezmur();
              if (!currentM) return null;
              return (
                <div
                  onClick={() => {
                    const mezmurTabBtn = document.querySelector('button[data-tab="mezmur"]') as HTMLButtonElement;
                    if (mezmurTabBtn) mezmurTabBtn.click();
                  }}
                  className="p-3.5 rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/25 shadow-sacred-sm cursor-pointer hover:border-[#B89A5A]/50 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#B89A5A] uppercase tracking-wider">
                      {language === 'am' ? 'የዚህ ማኅበር መዝሙር' : "THIS MAHBER'S MEZMUR"}
                    </span>
                    <span className="text-[11px] text-gray-400">{currentM.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                        🎵 {currentM.titleAm}
                      </h4>
                      <p className="text-[11px] text-gray-400">{currentM.titleEn || currentM.categoryAm}</p>
                    </div>
                    <span className="text-[11px] text-[#B89A5A] font-medium">
                      {language === 'am' ? 'ክፈት →' : 'Open →'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Attendance progress summary card */}
          <div
            onClick={() => setActiveTab('roster')}
            className="rounded-2xl p-3.5 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred-sm flex items-center justify-between cursor-pointer hover:border-[#B89A5A]/40 transition"
          >
            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-[#315C48]" />
              <span className="text-xs font-medium text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {comingCount} / {totalCount} {t.attendingOutOf}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-800 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className="bg-[#315C48] h-full rounded-full transition-all duration-500"
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
              <ChevronRight size={14} className="text-[#B89A5A]" />
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred space-y-4">
            <div className="text-center pb-2 border-b border-[#B89A5A]/15">
              <h3 className="text-base font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {gathering.ethDate}
              </h3>
              <p className="text-xs text-gray-400">{gathering.gregDate}</p>
            </div>

            {/* Days of week in Amharic & English */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400 pb-1">
              <span>እሑድ</span>
              <span>ሰኞ</span>
              <span>ማክሰ</span>
              <span>ረቡዕ</span>
              <span>ሐሙስ</span>
              <span>ዓርብ</span>
              <span>ቅዳሜ</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {meskeremDays.map((day) => {
                const isGatheringDay = day === gatheringDay;
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition ${
                      isGatheringDay
                        ? 'bg-[#6F2630] text-white ring-2 ring-[#B89A5A] font-bold shadow-md'
                        : day < gatheringDay
                        ? 'text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-white/5'
                        : 'text-gray-500 hover:bg-white/5'
                    }`}
                  >
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>

            {/* Selected Gathering Day Legend */}
            <div className="p-3 rounded-2xl bg-[#6F2630]/15 border border-[#6F2630]/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6F2630] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {gatheringDay}
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                  {gathering.ethDate} • {t.nextMahber}
                </div>
                <div className="text-gray-400">
                  {gathering.time} • {gathering.location}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Roster View */}
      {activeTab === 'roster' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <h3 className="text-sm font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {t.attendanceRoster}
              </h3>
              <div className="text-xs font-medium text-[#315C48] dark:text-[#529575]">
                {comingCount} / {totalCount} {t.statusComing}
              </div>
            </div>

            {/* Stat Row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#315C48]/15 border border-[#315C48]/30">
                <div className="font-bold text-[#315C48]">{comingCount}</div>
                <div className="text-[10px] text-gray-400">{t.statusComing}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#6F2630]/15 border border-[#6F2630]/30">
                <div className="font-bold text-[#6F2630]">{cantComeCount}</div>
                <div className="text-[10px] text-gray-400">{t.statusCantCome}</div>
              </div>
              <div className="p-2 rounded-xl bg-gray-500/10 border border-gray-500/20">
                <div className="font-bold text-gray-400">{noResponseCount}</div>
                <div className="text-[10px] text-gray-400">{t.statusNoResponse}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-white/5">
              <div
                className="bg-[#315C48] h-full rounded-full transition-all duration-500"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>

            {/* Members Attendance List (Strict Privacy Protected) */}
            <div className="divide-y divide-[#B89A5A]/10">
              {activeMembers.map((member) => {
                const actualAttendanceMap = mahberService.getActualAttendance(gathering.id);
                const actualStatus = actualAttendanceMap[member.id];
                const record = attendance.find((a) => a.memberId === member.id);
                const status = record?.status || 'no_response';

                return (
                  <div key={member.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#B89A5A]/30"
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] flex items-center gap-1.5">
                          <span>{member.amharicName}</span>
                          {member.role === 'admin' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#B89A5A]/20 text-[#B89A5A] font-normal">
                              አስተዳዳሪ
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">{member.name}</div>
                      </div>
                    </div>

                    {/* Status Badge (Shows recorded Actual Attendance if available, else RSVP) */}
                    <div className="text-right">
                      {actualStatus ? (
                        actualStatus.status === 'PRESENT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#315C48]/25 text-[#427A60] dark:text-[#529575] border border-[#315C48]/40 text-[11px] font-semibold">
                            <span>🟢</span>
                            <span>{language === 'am' ? 'ተገኝቷል' : 'Present'}</span>
                          </span>
                        ) : actualStatus.status === 'EXCUSED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B89A5A]/25 text-[#D3BA7E] border border-[#B89A5A]/40 text-[11px] font-semibold">
                            <span>🟡</span>
                            <span>{language === 'am' ? 'በይቅርታ' : 'Excused'}</span>
                          </span>
                        ) : actualStatus.status === 'LATE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E07A24]/25 text-[#E07A24] border border-[#E07A24]/50 text-[11px] font-bold">
                            <span>🟠</span>
                            <span>{language === 'am' ? 'ዘግይቷል' : 'Late'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6F2630]/25 text-[#D98A94] border border-[#6F2630]/40 text-[11px] font-semibold">
                            <span>🔴</span>
                            <span>{language === 'am' ? 'ያልተገኘ' : 'Absent'}</span>
                          </span>
                        )
                      ) : status === 'coming' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#315C48]/20 text-[#427A60] dark:text-[#529575] border border-[#315C48]/30 text-[11px] font-medium">
                          <CheckCircle2 size={12} />
                          <span>{t.statusComing}</span>
                        </span>
                      ) : status === 'cant_come' ? (
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6F2630]/20 text-[#8C3542] dark:text-[#D98A94] border border-[#6F2630]/30 text-[11px] font-medium">
                            <XCircle size={12} />
                            <span>{t.statusCantCome}</span>
                          </span>
                          {/* If current viewer is admin, display note indicator */}
                          {isAdmin && record?.privateReason && (
                            <span className="text-[10px] text-[#B89A5A] mt-0.5">
                              ምክንያት: {record.privateReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-500/15 text-gray-400 border border-gray-500/20 text-[11px]">
                          <HelpCircle size={12} />
                          <span>{t.statusNoResponse}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* History / Digital Memory Book View */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          <HistoryView
            history={history}
            onOpenMezmur={onOpenMezmur}
            onRefreshHistory={onRefreshHistory}
          />
        </div>
      )}
    </div>
  );
};
