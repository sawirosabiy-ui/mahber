import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Member, ActualAttendanceStatus, GatheringAttendanceEntry } from '../../types';
import { mahberService } from '../../services/mahberService';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  Search,
  Check,
  ChevronRight,
  AlertTriangle,
  X,
  ShieldCheck,
} from 'lucide-react';

interface AttendanceManagerModalProps {
  gatheringId: string;
  gatheringTitle?: string;
  allMembers: Member[];
  onClose: () => void;
  onSaved?: () => void;
}

export const AttendanceManagerModal: React.FC<AttendanceManagerModalProps> = ({
  gatheringId,
  gatheringTitle = 'Meskerem 27, 2018 (Oct 6, 2025)',
  allMembers,
  onClose,
  onSaved,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  // Load current attendance map or initialize defaults
  const [attendanceMap, setAttendanceMap] = useState<Record<string, GatheringAttendanceEntry>>(() =>
    mahberService.getActualAttendance(gatheringId)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ActualAttendanceStatus>('PRESENT');
  const [statusNote, setStatusNote] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Filter members by name or phone
  const filteredMembers = allMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.amharicName.includes(searchQuery) ||
      m.phone.includes(searchQuery)
  );

  // Compute live stats for the 11 members
  const stats = {
    present: allMembers.filter((m) => (attendanceMap[m.id]?.status || 'PRESENT') === 'PRESENT').length,
    excused: allMembers.filter((m) => attendanceMap[m.id]?.status === 'EXCUSED').length,
    late: allMembers.filter((m) => attendanceMap[m.id]?.status === 'LATE').length,
    absent: allMembers.filter((m) => attendanceMap[m.id]?.status === 'ABSENT').length,
    total: allMembers.length,
  };

  const handleOpenEdit = (member: Member) => {
    const currentEntry = attendanceMap[member.id];
    setSelectedMember(member);
    setSelectedStatus(currentEntry?.status || 'PRESENT');
    setStatusNote(currentEntry?.note || '');
    setCorrectionReason(currentEntry?.correctionReason || '');
  };

  const handleApplyMemberStatus = () => {
    if (!selectedMember) return;

    // Invariant: LATE has 100 ETB penalty, ABSENT has 200 ETB penalty, EXCUSED and PRESENT have 0
    let penalty = 0;
    if (selectedStatus === 'LATE') penalty = 100;
    if (selectedStatus === 'ABSENT') penalty = 200;

    const updatedEntry: GatheringAttendanceEntry = {
      memberId: selectedMember.id,
      status: selectedStatus,
      isLate: selectedStatus === 'LATE',
      isExcused: selectedStatus === 'EXCUSED',
      penaltyAmount: penalty,
      note: statusNote,
      correctionReason: correctionReason,
      updatedAt: new Date().toISOString(),
    };

    setAttendanceMap((prev) => ({
      ...prev,
      [selectedMember.id]: updatedEntry,
    }));

    setSelectedMember(null);
  };

  const handleFinalSave = () => {
    const entriesMap: Record<string, { status: ActualAttendanceStatus; note?: string }> = {};
    allMembers.forEach((m) => {
      const entry = attendanceMap[m.id];
      entriesMap[m.id] = {
        status: entry?.status || 'PRESENT',
        note: entry?.note || '',
      };
    });

    mahberService.saveActualAttendance(
      gatheringId,
      entriesMap,
      currentUser?.id || 'admin',
      currentUser?.name || 'Attendance Administrator'
    );
    setIsSavedSuccess(true);
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141A17] border border-[#B89A5A]/30 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header matching Photo 5 */}
        <div className="p-4 border-b border-[#B89A5A]/20 flex items-center justify-between shrink-0 bg-[#0E1210]">
          <div>
            <h3 className="text-sm font-bold text-[#F5EFE3]">
              {language === 'am' ? 'የተሳትፎ ምዝገባ (Attendance Management)' : 'Attendance Management'}
            </h3>
            <p className="text-xs text-[#B89A5A]">{gatheringTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9E9484] hover:text-[#F5EFE3] hover:bg-[#1B2420]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Confirmation View matching Photo 5 Screen 4 */}
        {isSavedSuccess ? (
          <div className="p-6 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-lg animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#F5EFE3]">
                {language === 'am' ? 'የተሳትፎ መዝገብ በተሳካ ሁኔታ ጸድቋል!' : 'Attendance Saved!'}
              </h4>
              <p className="text-xs text-[#9E9484] mt-1 max-w-xs mx-auto">
                {language === 'am'
                  ? 'የ11ዱ አባላት የተሳትፎ ውጤት እና ተያያዥ የቅጣት ሒሳቦች ተመዝግበዋል።'
                  : 'The attendance record and penalty calculations for all 11 members have been updated successfully.'}
              </p>
            </div>

            {/* Summary stat cards */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-[#1B2420] border border-emerald-500/30 text-center">
                <span className="text-base font-bold text-emerald-400">{stats.present}</span>
                <p className="text-[10px] text-[#9E9484]">Present</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1B2420] border border-sky-500/30 text-center">
                <span className="text-base font-bold text-sky-400">{stats.excused}</span>
                <p className="text-[10px] text-[#9E9484]">Excused</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1B2420] border border-amber-500/30 text-center">
                <span className="text-base font-bold text-amber-400">{stats.late}</span>
                <p className="text-[10px] text-[#9E9484]">Late</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#1B2420] border border-rose-500/30 text-center">
                <span className="text-base font-bold text-rose-400">{stats.absent}</span>
                <p className="text-[10px] text-[#9E9484]">Absent</p>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSavedSuccess(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1B2420] text-[#F5EFE3] text-xs font-semibold hover:bg-[#25322C]"
              >
                {language === 'am' ? 'እንደገና ገምግም' : 'Review Again'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold shadow-md hover:opacity-95"
              >
                {language === 'am' ? 'ጨርስ' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 4 Stat Overview Tiles matching Photo 5 */}
            <div className="grid grid-cols-5 gap-1.5 p-3 bg-[#0E1210]/60 border-b border-[#B89A5A]/15 shrink-0 text-center">
              <div className="p-1.5 rounded-lg bg-[#1B2420]">
                <span className="text-sm font-black text-emerald-400">{stats.present}</span>
                <p className="text-[9px] text-[#9E9484]">Present</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[#1B2420]">
                <span className="text-sm font-black text-sky-400">{stats.excused}</span>
                <p className="text-[9px] text-[#9E9484]">Excused</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[#1B2420]">
                <span className="text-sm font-black text-amber-400">{stats.late}</span>
                <p className="text-[9px] text-[#9E9484]">Late</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[#1B2420]">
                <span className="text-sm font-black text-rose-400">{stats.absent}</span>
                <p className="text-[9px] text-[#9E9484]">Absent</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[#1B2420]">
                <span className="text-sm font-black text-[#F5EFE3]">{stats.total}</span>
                <p className="text-[9px] text-[#9E9484]">Total</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-[#B89A5A]/10 bg-[#141A17] shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-[#9E9484]" />
                <input
                  type="text"
                  placeholder={language === 'am' ? 'አባላትን ፈልግ...' : 'Search members...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/20 text-xs text-[#F5EFE3] placeholder-[#9E9484]/50 focus:outline-none focus:border-[#B89A5A]"
                />
              </div>
            </div>

            {/* Member Roll Call List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredMembers.map((member) => {
                const entry = attendanceMap[member.id];
                const currentStatus: ActualAttendanceStatus = entry?.status || 'PRESENT';

                let badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-500/30';
                if (currentStatus === 'LATE')
                  badgeColor = 'bg-amber-950 text-amber-300 border-amber-500/30';
                if (currentStatus === 'EXCUSED')
                  badgeColor = 'bg-sky-950 text-sky-300 border-sky-500/30';
                if (currentStatus === 'ABSENT')
                  badgeColor = 'bg-rose-950 text-rose-300 border-rose-500/30';

                return (
                  <div
                    key={member.id}
                    onClick={() => handleOpenEdit(member)}
                    className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between hover:border-[#B89A5A]/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-[#B89A5A]/30"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#F5EFE3]">{member.name}</p>
                        <p className="text-[10px] text-[#9E9484]">{member.amharicName}</p>
                        {entry?.note && (
                          <p className="text-[10px] text-[#B89A5A] italic mt-0.5">"{entry.note}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badgeColor}`}
                      >
                        {currentStatus}
                      </span>
                      <ChevronRight size={14} className="text-[#9E9484]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Sticky Action Bar matching Photo 5 */}
            <div className="p-3 border-t border-[#B89A5A]/20 bg-[#0E1210] shrink-0">
              <button
                type="button"
                onClick={handleFinalSave}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
              >
                <Check size={16} />
                {language === 'am' ? 'የተሳትፎ መዝገብ አስቀምጥ (Save Attendance)' : 'Save Attendance →'}
              </button>
            </div>
          </>
        )}

        {/* Selected Member Status Picker Sheet matching Photo 5 Screen 2 & 3 */}
        {selectedMember && (
          <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-[#141A17] border border-[#B89A5A]/40 rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-8">
              <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedMember.avatarUrl}
                    alt={selectedMember.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[#B89A5A]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#F5EFE3]">{selectedMember.name}</h4>
                    <p className="text-[10px] text-[#9E9484]">{selectedMember.amharicName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="p-1 rounded-lg text-[#9E9484] hover:text-[#F5EFE3]"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 4 Status Touch Buttons matching Photo 5 Screen 2 */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-2">
                  {language === 'am' ? 'ሁኔታ ይምረጡ' : 'Select Status'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('PRESENT')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedStatus === 'PRESENT'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50'
                        : 'bg-[#1B2420] border-[#B89A5A]/15 text-[#9E9484] hover:bg-[#1B2420]/80'
                    }`}
                  >
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <span className="text-xs font-bold">Present</span>
                    <span className="text-[9px] text-[#9E9484]">0 ETB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('LATE')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedStatus === 'LATE'
                        ? 'bg-amber-950 border-amber-500 text-amber-300 ring-2 ring-amber-500/50'
                        : 'bg-[#1B2420] border-[#B89A5A]/15 text-[#9E9484] hover:bg-[#1B2420]/80'
                    }`}
                  >
                    <Clock size={18} className="text-amber-400" />
                    <span className="text-xs font-bold">Late</span>
                    <span className="text-[9px] text-amber-300 font-semibold">+100 ETB Penalty</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('EXCUSED')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedStatus === 'EXCUSED'
                        ? 'bg-sky-950 border-sky-500 text-sky-300 ring-2 ring-sky-500/50'
                        : 'bg-[#1B2420] border-[#B89A5A]/15 text-[#9E9484] hover:bg-[#1B2420]/80'
                    }`}
                  >
                    <HelpCircle size={18} className="text-sky-400" />
                    <span className="text-xs font-bold">Excused</span>
                    <span className="text-[9px] text-[#9E9484]">With valid cause</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('ABSENT')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedStatus === 'ABSENT'
                        ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/50'
                        : 'bg-[#1B2420] border-[#B89A5A]/15 text-[#9E9484] hover:bg-[#1B2420]/80'
                    }`}
                  >
                    <XCircle size={18} className="text-rose-400" />
                    <span className="text-xs font-bold">Absent</span>
                    <span className="text-[9px] text-rose-300 font-semibold">+200 ETB Penalty</span>
                  </button>
                </div>
              </div>

              {/* Note / Reason inputs */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                    {language === 'am' ? 'ማስታወሻ / ምክንያት' : 'Notes / Reason'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      language === 'am' ? 'ለምሳሌ፦ ሕመም፣ ሥራ፣ ጉዞ...' : 'e.g. Sick, work, travel...'
                    }
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/25 text-xs text-[#F5EFE3] placeholder-[#9E9484]/50 focus:outline-none focus:border-[#B89A5A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                    {language === 'am' ? 'የማስተካከያ ምክንያት (አስፈላጊ ከሆነ)' : 'Correction Reason (if editing)'}
                  </label>
                  <select
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/25 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                  >
                    <option value="">-- No Correction (Initial Roll Call) --</option>
                    <option value="Clerical Error">Clerical / Misclick Correction</option>
                    <option value="Member Arrived Late">Member Arrived Late after Roll Call</option>
                    <option value="Excused After Phone Call">Excused Granted After Phone Verification</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 py-2 rounded-xl bg-[#1B2420] text-[#9E9484] text-xs font-semibold"
                >
                  {language === 'am' ? 'ይቅር' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleApplyMemberStatus}
                  className="flex-1 py-2 rounded-xl bg-[#B89A5A] text-[#0E1210] text-xs font-bold hover:bg-[#C9AB6B]"
                >
                  {language === 'am' ? 'ተግብር' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
