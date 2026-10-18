import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Gathering, Member, GatheringAttendanceEntry } from '../../types';
import { mahberService } from '../../services/mahberService';
import { EthiopianCross } from '../common/EthiopianCross';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  RotateCcw,
  CheckCircle2,
  X,
  Plus,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface GatheringDetailsModalProps {
  gathering: Gathering;
  allMembers: Member[];
  onClose: () => void;
  onOpenAttendanceRollCall: () => void;
  onOpenRotation: () => void;
}

export const GatheringDetailsModal: React.FC<GatheringDetailsModalProps> = ({
  gathering,
  allMembers,
  onClose,
  onOpenAttendanceRollCall,
  onOpenRotation,
}) => {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'attendance' | 'host' | 'notes'>('details');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, GatheringAttendanceEntry>>(() =>
    mahberService.getActualAttendance(gathering.id)
  );

  const [newNoteText, setNewNoteText] = useState('');
  const [notesList, setNotesList] = useState<string[]>([
    'Please bring your Bible and prayer books. The venue is the same as last month.',
    'The 27th gathering will include a special Mezmur reflection session.',
    'There will be a short fellowship refreshment following the prayer service.',
  ]);

  const assignedHost =
    allMembers.find((m) => m.id === gathering.scheduledHostId) ||
    allMembers.find((m) => m.id === gathering.assignedHostId) ||
    allMembers[0];

  const rotation = mahberService.getPaintingRotation();
  const nextHost =
    allMembers.find((m) => m.id === rotation.nextAssignedHostId) ||
    allMembers[1] ||
    allMembers[0];

  // Live stats
  const stats = {
    present: allMembers.filter((m) => (attendanceMap[m.id]?.status || 'PRESENT') === 'PRESENT').length,
    excused: allMembers.filter((m) => attendanceMap[m.id]?.status === 'EXCUSED').length,
    late: allMembers.filter((m) => attendanceMap[m.id]?.status === 'LATE').length,
    absent: allMembers.filter((m) => attendanceMap[m.id]?.status === 'ABSENT').length,
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotesList((prev) => [newNoteText.trim(), ...prev]);
    setNewNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141A17] border border-[#B89A5A]/30 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header with Church Illustration Banner matching Photo 4 */}
        <div className="relative h-44 shrink-0 overflow-hidden bg-gradient-to-b from-[#6F2630]/60 via-[#1B2420] to-[#141A17] p-4 flex flex-col justify-between border-b border-[#B89A5A]/20">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
              <EthiopianCross size={16} color="#B89A5A" />
              {language === 'am' ? 'የማኅበር ዝርዝር መረጃ' : 'Gathering Details'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#0E1210]/60 text-[#9E9484] hover:text-[#F5EFE3] backdrop-blur-sm"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-end gap-3 z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#6F2630] border-2 border-[#B89A5A] flex flex-col items-center justify-center text-center shadow-xl shrink-0">
              <span className="text-[10px] font-black text-[#B89A5A] tracking-wider uppercase">
                MES
              </span>
              <span className="text-xl font-black text-white leading-none">27</span>
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-[#B89A5A]/20 text-[#B89A5A] text-[10px] font-bold border border-[#B89A5A]/30">
                {language === 'am' ? 'ቀጣይ ማኅበር' : 'Next Gathering'}
              </span>
              <h2 className="text-base font-bold text-[#F5EFE3] mt-1 leading-tight">
                {gathering.ethDate} ({gathering.gregDate})
              </h2>
              <p className="text-xs text-[#9E9484] flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#B89A5A]" />
                  2:00 PM – 5:00 PM
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#B89A5A]" />
                  {gathering.location}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Sub-tabs matching Photo 4: [Details | Attendance | Host | Notes] */}
        <div className="flex bg-[#0E1210] p-1 border-b border-[#B89A5A]/20 shrink-0">
          {(['details', 'attendance', 'host', 'notes'] as const).map((tab) => {
            const labels = {
              details: language === 'am' ? 'ዝርዝር' : 'Details',
              attendance: language === 'am' ? 'ተሳትፎ' : 'Attendance',
              host: language === 'am' ? 'አስተናጋጅ' : 'Host',
              notes: language === 'am' ? 'ማስታወሻዎች' : 'Notes',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSubTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeSubTab === tab
                    ? 'bg-[#B89A5A] text-[#0E1210] shadow'
                    : 'text-[#9E9484] hover:text-[#F5EFE3]'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SubTab 1: Details */}
          {activeSubTab === 'details' && (
            <div className="space-y-4">
              {/* Host Row */}
              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={assignedHost.avatarUrl}
                    alt={assignedHost.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#B89A5A]"
                  />
                  <div>
                    <span className="text-[10px] text-[#9E9484] uppercase font-bold">Host</span>
                    <p className="text-xs font-bold text-[#F5EFE3]">{assignedHost.name}</p>
                    <p className="text-[10px] text-[#B89A5A]">{assignedHost.amharicName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenRotation}
                  className="px-2.5 py-1 rounded-lg bg-[#141A17] text-[#B89A5A] text-[11px] font-bold border border-[#B89A5A]/20 hover:border-[#B89A5A]/50"
                >
                  {language === 'am' ? 'ተራ እይ' : 'Rotation →'}
                </button>
              </div>

              {/* Theme Row */}
              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#B89A5A]/20 text-[#B89A5A] flex items-center justify-center shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-[#9E9484] uppercase font-bold">
                    {language === 'am' ? 'የውይይት ርዕስ' : 'Theme'}
                  </span>
                  <p className="text-xs font-bold text-[#F5EFE3]">
                    {language === 'am' ? 'እምነት እና አንድነት (Faith and Unity)' : 'Faith and Unity'}
                  </p>
                </div>
              </div>

              {/* Attendance Summary Bar (4 Stats) matching Photo 4 */}
              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#F5EFE3] uppercase">
                    {language === 'am' ? 'የተሳትፎ ሁኔታ' : 'Attendance Summary'}
                  </span>
                  <span className="text-[10px] text-[#9E9484]">11 Members</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-[#141A17] border border-emerald-500/30">
                    <span className="text-sm font-bold text-emerald-400">{stats.present}</span>
                    <p className="text-[9px] text-[#9E9484]">Present</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141A17] border border-sky-500/30">
                    <span className="text-sm font-bold text-sky-400">{stats.excused}</span>
                    <p className="text-[9px] text-[#9E9484]">Excused</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141A17] border border-amber-500/30">
                    <span className="text-sm font-bold text-amber-400">{stats.late}</span>
                    <p className="text-[9px] text-[#9E9484]">Late</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#141A17] border border-rose-500/30">
                    <span className="text-sm font-bold text-rose-400">{stats.absent}</span>
                    <p className="text-[9px] text-[#9E9484]">Absent</p>
                  </div>
                </div>
              </div>

              {/* Hosting Rotation Mini Card matching Photo 4 */}
              <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#B89A5A] uppercase flex items-center gap-1.5">
                    <RotateCcw size={13} />
                    {language === 'am' ? 'የአስተናጋጅ ተራ' : 'Hosting Rotation'}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenRotation}
                    className="text-[11px] text-[#B89A5A] hover:underline"
                  >
                    {language === 'am' ? 'ሙሉውን እይ →' : 'View Full Rotation →'}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={assignedHost.avatarUrl}
                      alt={assignedHost.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[#F5EFE3]">{assignedHost.name}</p>
                      <p className="text-[9px] text-[#9E9484]">Current Host (Oct)</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#9E9484]" />
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <p className="font-semibold text-[#F5EFE3]">{nextHost.name}</p>
                      <p className="text-[9px] text-[#9E9484]">Next Host (Nov)</p>
                    </div>
                    <img
                      src={nextHost.avatarUrl}
                      alt={nextHost.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button: Open Attendance */}
              <button
                type="button"
                onClick={onOpenAttendanceRollCall}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
              >
                <Users size={16} />
                {isAdmin
                  ? language === 'am'
                    ? 'ተሳትፎ መዝግብ (Mark Attendance) →'
                    : 'Mark Attendance →'
                  : language === 'am'
                  ? 'የተሳትፎ መዝገብ እይ (View Attendance Records) →'
                  : 'View Attendance Records →'}
              </button>

              {/* Sacred Scripture Card matching Photo 4 */}
              <div className="p-3.5 rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 text-center space-y-1">
                <EthiopianCross size={18} color="#B89A5A" className="mx-auto" />
                <p className="text-xs font-medium text-[#F5EFE3] italic">
                  "For where two or three are gathered in my name, there am I among them."
                </p>
                <p className="text-[10px] font-bold text-[#B89A5A]">Matthew 18:20</p>
              </div>
            </div>
          )}

          {/* SubTab 2: Attendance */}
          {activeSubTab === 'attendance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'የአባላት ተሳትፎ ዝርዝር' : 'Member Roll Call List'}
                </span>
                <button
                  type="button"
                  onClick={onOpenAttendanceRollCall}
                  className="px-2.5 py-1 rounded-lg bg-[#B89A5A] text-[#0E1210] text-[11px] font-bold"
                >
                  {isAdmin ? 'Edit Roll Call' : 'View Details'}
                </button>
              </div>

              <div className="space-y-2">
                {allMembers.map((member) => {
                  const entry = attendanceMap[member.id];
                  const status = entry?.status || 'PRESENT';

                  let badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-500/30';
                  if (status === 'LATE')
                    badgeColor = 'bg-amber-950 text-amber-300 border-amber-500/30';
                  if (status === 'EXCUSED')
                    badgeColor = 'bg-sky-950 text-sky-300 border-sky-500/30';
                  if (status === 'ABSENT')
                    badgeColor = 'bg-rose-950 text-rose-300 border-rose-500/30';

                  return (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold text-[#F5EFE3]">{member.name}</p>
                          {entry?.note && (
                            <p className="text-[10px] text-[#B89A5A] italic">"{entry.note}"</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SubTab 3: Host */}
          {activeSubTab === 'host' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#1B2420] border border-[#B89A5A]/20 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={assignedHost.avatarUrl}
                    alt={assignedHost.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#B89A5A]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#F5EFE3]">{assignedHost.name}</h4>
                    <p className="text-xs text-[#9E9484]">{assignedHost.amharicName}</p>
                    <p className="text-xs text-[#B89A5A] mt-1">{assignedHost.phone}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#B89A5A]/15 text-xs text-[#9E9484] space-y-1">
                  <p className="flex items-center gap-1.5 text-[#F5EFE3]">
                    <MapPin size={13} className="text-[#B89A5A]" />
                    {gathering.location} · {gathering.locationDetails || 'House No. 412, Near St. Michael Church'}
                  </p>
                  <p>Food, refreshments, and prayer setting prepared by host.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenRotation}
                className="w-full py-2.5 rounded-xl bg-[#1B2420] text-[#B89A5A] text-xs font-bold border border-[#B89A5A]/30 flex items-center justify-center gap-2 hover:bg-[#25322C]"
              >
                <RotateCcw size={14} />
                {language === 'am' ? 'የአስተናጋጅ ቅያሪ ጠይቅ (Request Swap)' : 'Request Host Swap'}
              </button>
            </div>
          )}

          {/* SubTab 4: Notes matching Photo 4 Notes & Announcements */}
          {activeSubTab === 'notes' && (
            <div className="space-y-3">
              {isAdmin && (
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      language === 'am' ? 'አዲስ ማስታወሻ ጨምር...' : 'Add a note or announcement...'
                    }
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#1B2420] border border-[#B89A5A]/25 text-xs text-[#F5EFE3] placeholder-[#9E9484]/50 focus:outline-none focus:border-[#B89A5A]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-[#B89A5A] text-[#0E1210] text-xs font-bold flex items-center gap-1 hover:bg-[#C9AB6B]"
                  >
                    <Plus size={14} />
                    {language === 'am' ? 'ጨምር' : 'Add'}
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {notesList.map((note, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B89A5A] uppercase">
                        {index === 0 ? 'Admin Note' : index === 1 ? 'Announcement' : 'General Note'}
                      </span>
                      <span className="text-[10px] text-[#9E9484]">Oct 2025</span>
                    </div>
                    <p className="text-xs text-[#F5EFE3]">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
