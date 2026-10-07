import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Gathering,
  AttendanceRecord,
  MemberContribution,
  Mezmur,
  MezmurSuggestion,
  Member,
  AdminReviewStatus,
  ContributionPeriod,
  PaymentEntry,
  GatheringPhoto,
} from '../../types';
import { mahberService } from '../../services/mahberService';
import { getNextMahberProjectedDate } from '../../utils/ethiopianCalendar';
import { EthiopianCross } from '../common/EthiopianCross';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Music,
  ShieldAlert,
  Edit3,
  Plus,
  Lock,
  Calendar,
  AlertCircle,
  Check,
  ChevronRight,
  Radio,
  MapPin,
  FileCheck,
  Trash2,
  CalendarPlus,
} from 'lucide-react';

interface AdminDashboardProps {
  gathering: Gathering | null;
  attendance: AttendanceRecord[];
  contributions: Record<string, MemberContribution>;
  mezmurs: Mezmur[];
  onReviewAbsence: (attendanceId: string, status: AdminReviewStatus) => void;
  onRecordPayment: (memberId: string, amount: number, note?: string) => void;
  onSetCurrentMezmur: (mezmurId: string) => void;
  onAddMezmur: (titleAm: string, titleEn: string, categoryAm: string) => void;
  onUpdateGathering: (gathering: Gathering) => void;
  onCreateGathering?: (gathering: Omit<Gathering, 'id'>) => void;
  onCompleteGathering?: (gatheringId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  gathering,
  attendance,
  contributions,
  mezmurs,
  onReviewAbsence,
  onRecordPayment,
  onSetCurrentMezmur,
  onAddMezmur,
  onUpdateGathering,
  onCreateGathering,
  onCompleteGathering,
}) => {
  const { t, language } = useLanguage();
  const { allMembers, updateMemberRole } = useAuth();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'members' | 'attendance' | 'payments' | 'gatherings' | 'mezmur'
  >('overview');

  // Payment Recording Modal State
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('500');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [paymentSavedToast, setPaymentSavedToast] = useState(false);

  // Create Gathering Modal State
  const [showCreateGatheringModal, setShowCreateGatheringModal] = useState(false);
  const [newTitleAm, setNewTitleAm] = useState('ወርሃዊ ማኅበር');
  const [newTitleEn, setNewTitleEn] = useState('Monthly Mahber');
  const [newEthDate, setNewEthDate] = useState('27 ጥቅምት 2019');
  const [newGregDate, setNewGregDate] = useState('November 6, 2026');
  const [newTime, setNewTime] = useState('6:00 ከሰዓት');
  const [newLocation, setNewLocation] = useState('ቦሌ (Bole)');
  const [newLocationDetails, setNewLocationDetails] = useState('የአቶ ዳዊት መኖሪያ ቤት');
  const [newNotes, setNewNotes] = useState('');
  const [gatheringFormError, setGatheringFormError] = useState<string | null>(null);

  // New Mezmur form state
  const [newMezmurTitleAm, setNewMezmurTitleAm] = useState('');
  const [newMezmurTitleEn, setNewMezmurTitleEn] = useState('');
  const [newMezmurCategory, setNewMezmurCategory] = useState('ማርያም');

  // Role error feedback
  const [roleError, setRoleError] = useState<string | null>(null);

  // Complete Gathering Confirmation Modal State
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] = useState(false);
  const [completeMemoryAm, setCompleteMemoryAm] = useState('');
  const [completeMemoryEn, setCompleteMemoryEn] = useState('');
  const [completePhotoUrl, setCompletePhotoUrl] = useState('');

  // Calculate dynamic metrics
  const activeMembers = allMembers.filter((m) => !m.isDeactivated);
  const totalMembers = activeMembers.length;
  const comingCount = attendance.filter((a) => a.status === 'coming').length;
  const cantComeCount = attendance.filter((a) => a.status === 'cant_come').length;
  const noResponseCount = Math.max(0, totalMembers - comingCount - cantComeCount);

  // Dynamically compute financial totals from mahberService ledger
  const financialTotals = mahberService.getAdminFinancialOverview(totalMembers);
  const totalCollected = financialTotals.collectedTotal;
  const totalExpected = financialTotals.expectedTotal;
  const totalOutstanding = financialTotals.outstandingTotal;

  const currentMezmur = mezmurs.find((m) => m.status === 'current_study');

  const handleRoleToggle = (member: Member) => {
    setRoleError(null);
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    const result = updateMemberRole(member.id, newRole);
    if (!result.success && result.error) {
      setRoleError(result.error);
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForPayment) return;
    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) {
      alert(language === 'am' ? 'የክፍያ መጠን ከ 0 በላይ መሆን አለበት።' : 'Payment amount must be greater than 0.');
      return;
    }
    onRecordPayment(selectedMemberForPayment, amount, paymentNote);
    setPaymentSavedToast(true);
    setTimeout(() => {
      setPaymentSavedToast(false);
      setSelectedMemberForPayment(null);
      setPaymentNote('');
    }, 1200);
  };

  const handleCreateGatheringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGatheringFormError(null);

    if (!newEthDate.trim() || !newTime.trim() || !newLocation.trim()) {
      setGatheringFormError(
        language === 'am'
          ? 'እባክዎን ቀን፣ ሰዓት እና ቦታ በትክክል ያስገቡ።'
          : 'Please provide Date, Time, and Location.'
      );
      return;
    }

    const gatheringData: Omit<Gathering, 'id'> = {
      title: newTitleEn,
      titleAm: newTitleAm,
      ethDate: newEthDate,
      gregDate: newGregDate,
      gregDateRaw: '2026-11-06T18:00:00',
      time: newTime,
      location: newLocation,
      locationDetails: newLocationDetails,
      daysUntil: 30,
      status: 'scheduled',
      notes: newNotes,
      program: [
        { order: 1, titleAm: 'የመክፈቻ ጸሎት', titleEn: 'Opening Prayer' },
        { order: 2, titleAm: 'መዝሙር እና ማህሌት', titleEn: 'Mezmur & Chants' },
        { order: 3, titleAm: 'የቅዱስ መጽሐፍ ንባብ', titleEn: 'Scripture Reading' },
        { order: 4, titleAm: 'ትምህርት እና ውይይት', titleEn: 'Teaching & Reflection' },
        { order: 5, titleAm: 'የመዝጊያ ጸሎት እና ቡራኬ', titleEn: 'Closing Prayer & Blessing' },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=800&auto=format&fit=crop&q=80',
    };

    if (onCreateGathering) {
      onCreateGathering(gatheringData);
    } else {
      const created = mahberService.createGathering(gatheringData);
      onUpdateGathering(created);
    }

    setShowCreateGatheringModal(false);
  };

  const handleCreateMezmur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMezmurTitleAm.trim()) return;
    onAddMezmur(newMezmurTitleAm, newMezmurTitleEn || newMezmurTitleAm, newMezmurCategory);
    setNewMezmurTitleAm('');
    setNewMezmurTitleEn('');
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Admin Title Header */}
      <div className="pt-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6F2630]/20 border border-[#6F2630]/40 text-[#D98A94] text-xs font-bold mb-1">
          <Lock size={12} />
          <span>የአስተዳዳሪ ማዕከል (ADMIN ONLY)</span>
        </div>
        <h2 className="text-xl font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
          {language === 'am' ? 'መድኃኔዓለም ማኅበር አስተዳደር' : 'Medhanialem Mahber Admin'}
        </h2>
        <p className="text-xs text-gray-400">
          የተፈቀደላቸው 2 አስተዳዳሪዎች ብቻ (Authorized 2 Admins Only)
        </p>
      </div>

      {/* Role Error Alert if 2-admin ceiling is triggered */}
      {roleError && (
        <div className="p-3 rounded-2xl bg-[#6F2630]/20 border border-[#6F2630] text-xs text-[#E5DCD0] flex items-start gap-2 animate-fade-in">
          <AlertCircle size={18} className="text-[#D98A94] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#D98A94]">የአስተዳዳሪ ደንብ ገደብ</div>
            <p>{roleError}</p>
          </div>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'overview'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          ማጠቃለያ (Overview)
        </button>
        <button
          onClick={() => setActiveSection('gatherings')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'gatherings'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          ማኅበር መርሐግብር (Gatherings)
        </button>
        <button
          onClick={() => setActiveSection('members')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'members'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          አባላት (Members)
        </button>
        <button
          onClick={() => setActiveSection('attendance')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'attendance'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          መገኘት እና ምክንያቶች (Attendance)
        </button>
        <button
          onClick={() => setActiveSection('payments')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'payments'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          ክፍያዎች (Payments)
        </button>
        <button
          onClick={() => setActiveSection('mezmur')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'mezmur'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          መዝሙር (Mezmur)
        </button>
      </div>

      {/* SECTION: OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          {/* Member Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 rounded-2xl bg-[#201D19] border border-[#B89A5A]/20 text-center">
              <div className="text-lg font-bold text-[#F5EFE3]">{totalMembers}</div>
              <div className="text-[10px] text-gray-400">{t.adminMembersCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#201D19] border border-[#315C48]/30 text-center">
              <div className="text-lg font-bold text-[#315C48]">{comingCount}</div>
              <div className="text-[10px] text-gray-400">{t.adminComingCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#201D19] border border-[#6F2630]/30 text-center">
              <div className="text-lg font-bold text-[#6F2630]">{cantComeCount}</div>
              <div className="text-[10px] text-gray-400">{t.adminCantComeCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#201D19] border border-gray-600/30 text-center">
              <div className="text-lg font-bold text-gray-400">{noResponseCount}</div>
              <div className="text-[10px] text-gray-400">{t.adminNoResponseCount}</div>
            </div>
          </div>

          {/* Dynamically Computed Financial Overview Card */}
          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/25 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                የማኅበሩ አጠቃላይ ክፍያ ሁኔታ (Contributions)
              </span>
              <span className="text-xs text-[#B89A5A]">የሚጠበቅ: {totalExpected.toLocaleString()} ብር</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#29251F] border border-[#315C48]/30">
                <div className="text-[11px] text-gray-400">{t.adminCollected}</div>
                <div className="text-lg font-bold text-[#315C48]">
                  {totalCollected.toLocaleString()} {t.currencyEtb}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#29251F] border border-[#6F2630]/30">
                <div className="text-[11px] text-gray-400">{t.adminOutstanding}</div>
                <div className="text-lg font-bold text-[#6F2630]">
                  {totalOutstanding.toLocaleString()} {t.currencyEtb}
                </div>
              </div>
            </div>
          </div>

          {/* Room & Fellowship Activity Summary */}
          {(() => {
            const totalAnnouncements = mahberService.getAnnouncements().length;
            const prayers = mahberService.getPrayerRequests('m1', true);
            const activePrayers = prayers.filter((p) => p.status === 'active').length;
            const answeredPrayers = prayers.filter((p) => p.status === 'answered').length;

            return (
              <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/25 shadow-sacred space-y-3">
                <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    የማኅበር ክፍል እንቅስቃሴ (Room & Prayers)
                  </span>
                  <span className="text-xs text-[#B89A5A]">10 አባላት</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-[#29251F] border border-white/5">
                    <div className="text-sm font-bold text-[#F5EFE3]">{totalAnnouncements}</div>
                    <div className="text-[10px] text-gray-400">ማስታወቂያዎች</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#29251F] border border-[#315C48]/30">
                    <div className="text-sm font-bold text-[#315C48]">{activePrayers}</div>
                    <div className="text-[10px] text-gray-400">ንቁ ጸሎቶች</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#29251F] border border-[#B89A5A]/30">
                    <div className="text-sm font-bold text-[#B89A5A]">{answeredPrayers}</div>
                    <div className="text-[10px] text-gray-400">የተመለሱ ጸሎቶች</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Next Gathering Snippet Card */}
          {gathering ? (
            <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#B89A5A] uppercase tracking-wider">
                  የሚቀጥለው ማኅበር (Next Mahber)
                </div>
                <button
                  onClick={() => setActiveSection('gatherings')}
                  className="text-xs text-[#B89A5A] hover:underline"
                >
                  አስተካክል (Manage)
                </button>
              </div>
              <div className="text-sm font-bold text-[#F5EFE3]">
                {gathering.ethDate} • {gathering.time}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#B89A5A]" />
                <span>{gathering.location} ({gathering.locationDetails || ''})</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/20 text-center space-y-2">
              <p className="text-xs text-gray-400">ቀጣይ ማኅበር አልተመዘገበም።</p>
              <button
                onClick={() => setShowCreateGatheringModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#6F2630] text-white text-xs font-semibold"
              >
                + አዲስ ማኅበር መዝግብ
              </button>
            </div>
          )}

          {/* Current Mezmur Quick Card */}
          {currentMezmur && (
            <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#B89A5A] uppercase tracking-wider font-semibold">
                  የአሁን ጥናት መዝሙር
                </div>
                <div className="text-sm font-bold text-[#F5EFE3]">{currentMezmur.titleAm}</div>
                <div className="text-xs text-gray-400">
                  {comingCount} / {totalMembers} አባላት ተዘጋጅተዋል
                </div>
              </div>
              <button
                onClick={() => setActiveSection('mezmur')}
                className="px-3 py-1.5 rounded-xl bg-[#6F2630] text-white text-xs font-medium"
              >
                አድስ
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION: GATHERINGS MANAGEMENT */}
      {activeSection === 'gatherings' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F5EFE3]">የማኅበር መርሐግብር አስተዳደር</h3>
            <button
              onClick={() => setShowCreateGatheringModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#6F2630] text-white text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <CalendarPlus size={14} />
              <span>+ አዲስ ማኅበር መዝግብ</span>
            </button>
          </div>

          {gathering && (
            <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/25 shadow-sacred space-y-3">
              <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
                <span className="text-xs font-bold text-[#315C48]">
                  ● ንቁ መርሐግብር ({gathering.status.toUpperCase()})
                </span>
                <span className="text-xs text-gray-400">{gathering.ethDate}</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-[#F5EFE3] text-sm">
                  {gathering.titleAm || 'ወርሃዊ ማኅበር'}
                </div>
                <div className="text-gray-400">{gathering.gregDate} • {gathering.time}</div>
                <div className="text-gray-400">ቦታ: {gathering.location} ({gathering.locationDetails || ''})</div>
              </div>

              {/* Action: Mark Completed */}
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setShowCompleteConfirmModal(true)}
                  className="flex-1 py-2 rounded-xl bg-[#315C48] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow hover:bg-[#3d6e57] transition"
                >
                  <FileCheck size={14} />
                  <span>ማኅበሩን አጠናቅቅ (Mark Completed)</span>
                </button>
              </div>
            </div>
          )}

          {/* Create Gathering Modal */}
          {showCreateGatheringModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#201D19] rounded-3xl border border-[#B89A5A]/30 p-5 shadow-sacred space-y-3.5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-[#B89A5A]/15 pb-2">
                  <h4 className="text-sm font-bold text-[#F5EFE3]">አዲስ ማኅበር መዝግብ (Create Gathering)</h4>
                  <button
                    onClick={() => setShowCreateGatheringModal(false)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                {gatheringFormError && (
                  <div className="p-2 rounded-xl bg-[#6F2630]/20 border border-[#6F2630] text-xs text-[#D98A94]">
                    {gatheringFormError}
                  </div>
                )}

                <form onSubmit={handleCreateGatheringSubmit} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">ርዕስ በአማርኛ</label>
                    <input
                      type="text"
                      value={newTitleAm}
                      onChange={(e) => setNewTitleAm(e.target.value)}
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">የኢትዮጵያ ቀን (Ethiopian Date)</label>
                    <input
                      type="text"
                      value={newEthDate}
                      onChange={(e) => setNewEthDate(e.target.value)}
                      placeholder="ምሳሌ: 27 ጥቅምት 2019"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">የፈረንጆች ቀን (Gregorian Date)</label>
                    <input
                      type="text"
                      value={newGregDate}
                      onChange={(e) => setNewGregDate(e.target.value)}
                      placeholder="November 6, 2026"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">ሰዓት (Time)</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="6:00 ከሰዓት"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">ቦታ (Location)</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="ቦሌ (Bole)"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">ዝርዝር አድራሻ (Details)</label>
                    <input
                      type="text"
                      value={newLocationDetails}
                      onChange={(e) => setNewLocationDetails(e.target.value)}
                      placeholder="የአቶ ዳዊት መኖሪያ ቤት"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateGatheringModal(false)}
                      className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400"
                    >
                      ተመለስ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#6F2630] text-white font-bold"
                    >
                      መዝግብ (Create)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Explicit Complete Gathering Confirmation Modal */}
          {showCompleteConfirmModal && gathering && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
              <div className="w-full max-w-sm bg-[#1C1815] rounded-3xl border border-[#B89A5A]/35 p-5 shadow-sacred space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="text-center space-y-1.5 border-b border-[#B89A5A]/15 pb-3">
                  <div className="w-12 h-12 rounded-full bg-[#315C48]/20 border border-[#315C48] flex items-center justify-center text-[#427A60] mx-auto">
                    <FileCheck size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-[#F5EFE3]">
                    ይህን ማኅበር እንደተጠናቀቀ ምልክት ያድርጉ?
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Are you sure you want to mark this Mahber gathering as completed?
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#151311] border border-[#B89A5A]/15 text-xs space-y-1 text-gray-300">
                  <div className="font-semibold text-[#B89A5A]">{gathering.titleAm || 'ወርሃዊ ማኅበር'}</div>
                  <div className="text-[11px] text-gray-400">{gathering.ethDate} ({gathering.gregDate})</div>
                  <div className="text-[11px] text-gray-400">ቦታ: {gathering.location}</div>
                  <div className="text-[10px] text-[#315C48] pt-1">
                    ✓ የተገኙ አባላት ብቻ በክብር ታሪክ መዝገብ ይቀመጣሉ (ምክንያቶች በሚስጥር ይጠበቃሉ)።
                  </div>
                </div>

                {/* Optional Spiritual Memory & Photo */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">
                      የማኅበሩ ትውስታ / ማስታወሻ (በአማርኛ - አማራጭ)
                    </label>
                    <textarea
                      rows={2}
                      value={completeMemoryAm}
                      onChange={(e) => setCompleteMemoryAm(e.target.value)}
                      placeholder="ምሳሌ፡ የመድኃኔዓለም ጸጋ የበዛበት፣ ፍቅርና አንድነት የተገለጸበት የተባረከ ጉባኤ ነበር።"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 p-2 text-white text-xs resize-none placeholder-gray-600 focus:outline-none focus:border-[#B89A5A]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">
                      Spiritual Memory Note (English - Optional)
                    </label>
                    <input
                      type="text"
                      value={completeMemoryEn}
                      onChange={(e) => setCompleteMemoryEn(e.target.value)}
                      placeholder="e.g. Blessed monthly gathering filled with peace and fellowship."
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-2.5 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#B89A5A]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">
                      የትውስታ ፎቶ አድራሻ (Photo URL - አማራጭ)
                    </label>
                    <input
                      type="url"
                      value={completePhotoUrl}
                      onChange={(e) => setCompletePhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-2.5 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#B89A5A]"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompleteConfirmModal(false);
                      setCompleteMemoryAm('');
                      setCompleteMemoryEn('');
                      setCompletePhotoUrl('');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs font-medium hover:text-white transition"
                  >
                    ተመለስ (Cancel)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const photos: GatheringPhoto[] | undefined = completePhotoUrl.trim()
                        ? [
                            {
                              id: `photo-${Date.now()}`,
                              url: completePhotoUrl.trim(),
                              captionAm: 'የማኅበሩ ጉባኤ ትውስታ',
                              caption: 'Mahber fellowship memory',
                              uploadedBy: 'admin',
                              createdAt: new Date().toISOString(),
                            },
                          ]
                        : undefined;

                      if (onCompleteGathering) {
                        onCompleteGathering(gathering.id);
                        if (completeMemoryAm.trim() || completeMemoryEn.trim()) {
                          mahberService.updateGatheringMemory(
                            gathering.id,
                            completeMemoryAm.trim() || 'የተባረከ ጉባኤ',
                            completeMemoryEn.trim() || undefined
                          );
                        }
                        if (photos && photos[0]) {
                          mahberService.addGatheringPhoto(
                            gathering.id,
                            photos[0].url,
                            photos[0].captionAm,
                            photos[0].caption,
                            'admin'
                          );
                        }
                      } else {
                        mahberService.completeGathering(
                          gathering.id,
                          completeMemoryAm.trim() || undefined,
                          completeMemoryEn.trim() || undefined,
                          photos
                        );
                        window.location.reload();
                      }

                      setShowCompleteConfirmModal(false);
                      setCompleteMemoryAm('');
                      setCompleteMemoryEn('');
                      setCompletePhotoUrl('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#315C48] text-white text-xs font-bold hover:bg-[#3d6e57] transition shadow"
                  >
                    አዎ፣ አጠናቅቅ (Confirm)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION: MEMBERS MANAGEMENT */}
      {activeSection === 'members' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3 rounded-2xl bg-[#B89A5A]/10 border border-[#B89A5A]/25 text-xs text-gray-300">
            {t.adminMaxAdminsNotice}
          </div>

          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <h3 className="text-xs font-bold text-[#F5EFE3]">የ 10 አባላት ዝርዝር</h3>
              <span className="text-xs text-[#B89A5A]">
                አስተዳዳሪዎች: {allMembers.filter((m) => m.role === 'admin' && !m.isDeactivated).length} / 2
              </span>
            </div>

            <div className="divide-y divide-[#B89A5A]/10">
              {allMembers.map((member) => {
                const memberAttendance = attendance.find((a) => a.memberId === member.id);
                const memberContribution = contributions[member.id];
                const isPaid = (memberContribution?.totalOutstanding || 0) === 0;

                return (
                  <div key={member.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#B89A5A]/30"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
                          <span>{member.amharicName}</span>
                          {member.role === 'admin' ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#B89A5A]/20 text-[#B89A5A] font-semibold">
                              አስተዳዳሪ
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-gray-400">
                              አባል
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">{member.phone}</div>
                        <div className="flex gap-2 text-[10px] mt-0.5">
                          <span
                            className={
                              memberAttendance?.status === 'coming'
                                ? 'text-[#315C48]'
                                : memberAttendance?.status === 'cant_come'
                                ? 'text-[#6F2630]'
                                : 'text-gray-400'
                            }
                          >
                            ● {memberAttendance?.status === 'coming' ? 'እመጣለሁ' : memberAttendance?.status === 'cant_come' ? 'አይመጡም' : 'አልተመለሰም'}
                          </span>
                          <span className={isPaid ? 'text-[#315C48]' : 'text-[#B89A5A]'}>
                            ● {isPaid ? 'ተከፍሏል' : `${memberContribution?.totalOutstanding || 0} ብር ቀሪ`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRoleToggle(member)}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition ${
                          member.role === 'admin'
                            ? 'bg-[#B89A5A]/20 border-[#B89A5A] text-[#B89A5A]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                        title="Toggle Admin Role (Max 2)"
                      >
                        {member.role === 'admin' ? 'አስተዳዳሪ' : 'አባል'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ATTENDANCE & PRIVATE REASONS (ADMIN ONLY ACCESS) */}
      {activeSection === 'attendance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3 rounded-2xl bg-[#6F2630]/15 border border-[#6F2630]/30 flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-[#D98A94] shrink-0 mt-0.5" />
            <p className="text-xs text-[#E5DCD0]">
              የምስጢራዊነት ዋስትና: የአባላት የመቅረት ምክንያት እና የግል ማስታወሻዎች የሚታዩት እዚህ ለአስተዳዳሪዎች ብቻ ነው።
            </p>
          </div>

          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            <h3 className="text-xs font-bold text-[#F5EFE3] pb-2 border-b border-[#B89A5A]/15">
              የአባላት ምላሽ እና የቀረቡ የግል ምክንያቶች
            </h3>

            <div className="divide-y divide-[#B89A5A]/10">
              {attendance.map((record) => {
                const member = allMembers.find((m) => m.id === record.memberId);
                if (!member) return null;

                return (
                  <div key={record.id} className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#F5EFE3]">
                            {member.amharicName}
                          </div>
                          <div className="text-[10px] text-gray-400">{member.name}</div>
                        </div>
                      </div>

                      <div>
                        {record.status === 'coming' ? (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#315C48]/20 text-[#315C48] font-semibold border border-[#315C48]/30">
                            🟢 እመጣለሁ
                          </span>
                        ) : record.status === 'cant_come' ? (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#6F2630]/20 text-[#D98A94] font-semibold border border-[#6F2630]/30">
                            🔴 አይመጡም
                          </span>
                        ) : (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-500/15 text-gray-400">
                            ⚪ አልተመለሰም
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sensitive Private Reason (Only Admin Viewable) */}
                    {record.status === 'cant_come' && (
                      <div className="ml-10 p-2.5 rounded-xl bg-[#29251F] border border-[#6F2630]/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#B89A5A]">
                            የቀረበ ምክንያት: {record.privateReason || 'አልተገለጸም'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {record.adminReviewStatus === 'accepted' ? (
                              <span className="text-[#315C48]">✓ ተቀባይነት አግኝቷል</span>
                            ) : (
                              <span className="text-[#B89A5A]">⚠ ክትትል ያስፈልገዋል</span>
                            )}
                          </span>
                        </div>

                        {record.privateNote && (
                          <p className="text-[11px] text-gray-300 italic">
                            «{record.privateNote}»
                          </p>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => onReviewAbsence(record.id, 'accepted')}
                            className="px-2.5 py-1 rounded-lg bg-[#315C48]/20 text-[#315C48] text-[10px] font-semibold hover:bg-[#315C48]/30"
                          >
                            ተቀበል (Accept)
                          </button>
                          <button
                            onClick={() => onReviewAbsence(record.id, 'needs_review')}
                            className="px-2.5 py-1 rounded-lg bg-[#B89A5A]/20 text-[#B89A5A] text-[10px] font-semibold hover:bg-[#B89A5A]/30"
                          >
                            ክትትል አድርግ (Review)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: PAYMENTS RECORDING */}
      {activeSection === 'payments' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            <h3 className="text-xs font-bold text-[#F5EFE3] pb-2 border-b border-[#B89A5A]/15">
              የአባላት ወርሃዊ መዋጮ መዝገብ (መስከረም 2019)
            </h3>

            <div className="divide-y divide-[#B89A5A]/10">
              {allMembers.map((m) => {
                const contr = contributions[m.id];
                const paid = contr?.thisMonthPaid || 0;
                const outstanding = contr?.totalOutstanding || 0;

                return (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-[#F5EFE3]">{m.amharicName}</div>
                        <div className="text-[10px] text-gray-400">
                          የተከፈለ: {paid} ብር {outstanding > 0 && `(ቀሪ: ${outstanding} ብር)`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMemberForPayment(m.id);
                        setPaymentAmount(outstanding > 0 ? outstanding.toString() : '500');
                      }}
                      className="px-3 py-1 rounded-xl bg-[#6F2630] text-white text-[11px] font-semibold hover:bg-[#8C3542] transition"
                    >
                      ክፍያ መዝግብ
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Modal */}
          {selectedMemberForPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#201D19] rounded-3xl border border-[#B89A5A]/30 p-5 shadow-sacred space-y-4">
                <h4 className="text-sm font-bold text-[#F5EFE3]">
                  ክፍያ መዝግብ • {allMembers.find((m) => m.id === selectedMemberForPayment)?.amharicName}
                </h4>

                {paymentSavedToast ? (
                  <div className="py-6 text-center text-[#315C48] font-bold text-sm flex flex-col items-center gap-2">
                    <CheckCircle2 size={32} />
                    <span>ክፍያው በተሳካ ሁኔታ ተመዝግቧል!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSavePayment} className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">የተከፈለ መጠን (ብር)</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-sm text-white"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">ማስታወሻ (አማራጭ)</label>
                      <input
                        type="text"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="ለምሳሌ: በጥሬ ገንዘብ የተከፈለ ወይም ከፊል ክፍያ"
                        className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberForPayment(null)}
                        className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-gray-400"
                      >
                        ተመለስ
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-[#315C48] text-white text-xs font-semibold"
                      >
                        መዝግብ (Save)
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION: MEZMUR MANAGEMENT */}
      {activeSection === 'mezmur' && (
        <AdminMezmurSection
          mezmurs={mezmurs}
          onSetCurrentMezmur={onSetCurrentMezmur}
          onAddMezmur={onAddMezmur}
        />
      )}
    </div>
  );
};

// =========================================================================
// SUBCOMPONENT: ADMIN MEZMUR MANAGEMENT (Current, Library, Suggestions, Participation)
// =========================================================================
interface AdminMezmurSectionProps {
  mezmurs: Mezmur[];
  onSetCurrentMezmur: (mezmurId: string) => void;
  onAddMezmur: (titleAm: string, titleEn: string, categoryAm: string) => void;
}

const AdminMezmurSection: React.FC<AdminMezmurSectionProps> = ({
  mezmurs,
  onSetCurrentMezmur,
  onAddMezmur,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  const [subTab, setSubTab] = useState<'current' | 'library' | 'suggestions' | 'participation'>('current');
  const [suggestions, setSuggestions] = useState<MezmurSuggestion[]>(() => mahberService.getSuggestions());

  // Form states
  const [newTitleAm, setNewTitleAm] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newCategory, setNewCategory] = useState('ማርያም');
  const [newLyricsAm, setNewLyricsAm] = useState('');
  const [newLyricsEn, setNewLyricsEn] = useState('');
  const [newDuration, setNewDuration] = useState('03:30');
  const [showAddForm, setShowAddForm] = useState(false);

  // Current study summary
  const currentMezmur = mezmurs.find((m) => m.status === 'current_study') || mezmurs[0];
  const participationSummary = currentMezmur
    ? mahberService.getMezmurParticipationSummary(currentMezmur.id)
    : null;

  const handleReviewSuggestion = (suggestionId: string, decision: 'approved' | 'rejected') => {
    const result = mahberService.reviewSuggestion(suggestionId, currentUser.id, decision);
    setSuggestions([...result.suggestions]);
  };

  const handleAddMezmurSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAm.trim()) return;

    mahberService.addMezmur({
      titleAm: newTitleAm.trim(),
      titleEn: newTitleEn.trim() || newTitleAm.trim(),
      categoryAm: newCategory,
      categoryEn: newCategory,
      lyricsAm: newLyricsAm.trim() || undefined,
      lyricsEn: newLyricsEn.trim() || undefined,
      duration: newDuration || '03:30',
      status: 'library',
      dateAdded: new Date().toISOString().split('T')[0],
      voicesCount: 4,
      stanzas: [
        {
          stanzaNumber: 1,
          titleAm: 'ምዕራፍ 1',
          titleEn: 'Stanza 1',
          textAm: newLyricsAm.trim() || `${newTitleAm}\nስለ ስምህ እንዘምራለን ለዘላለም።`,
        },
      ],
    });

    onAddMezmur(newTitleAm.trim(), newTitleEn.trim() || newTitleAm.trim(), newCategory);
    setNewTitleAm('');
    setNewTitleEn('');
    setNewLyricsAm('');
    setNewLyricsEn('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Sub-tab Navigation */}
      <div className="flex gap-1 bg-[#1c1916] p-1 rounded-2xl border border-[#B89A5A]/20">
        <button
          onClick={() => setSubTab('current')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
            subTab === 'current' ? 'bg-[#6F2630] text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'am' ? 'የአሁኑ' : 'Current'}
        </button>
        <button
          onClick={() => setSubTab('library')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
            subTab === 'library' ? 'bg-[#6F2630] text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'am' ? 'ማከማቻ' : 'Library'}
        </button>
        <button
          onClick={() => setSubTab('suggestions')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition relative ${
            subTab === 'suggestions' ? 'bg-[#6F2630] text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{language === 'am' ? 'ጥቆማዎች' : 'Suggestions'}</span>
          {suggestions.filter((s) => s.status === 'pending').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#B89A5A] text-black text-[10px] font-bold">
              {suggestions.filter((s) => s.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setSubTab('participation')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
            subTab === 'participation' ? 'bg-[#6F2630] text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'am' ? 'ተሳትፎ' : 'Participation'}
        </button>
      </div>

      {/* 1. CURRENT MEZMUR SELECTION */}
      {subTab === 'current' && (
        <div className="space-y-3">
          {currentMezmur && (
            <div className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/30 shadow-sacred space-y-2">
              <div className="text-[10px] text-[#B89A5A] font-bold uppercase tracking-wider">
                {language === 'am' ? '● ንቁ የጥናት መዝሙር' : '● ACTIVE STUDY MEZMUR'}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-[#F5EFE3]">🎵 {currentMezmur.titleAm}</h4>
                  <p className="text-xs text-[#B89A5A]">{currentMezmur.titleEn}</p>
                  <p className="text-[11px] text-gray-400">{currentMezmur.categoryAm} • {currentMezmur.duration}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#315C48]/30 border border-[#315C48] text-[#427A60] text-xs font-bold">
                  ንቁ (Active)
                </span>
              </div>
            </div>
          )}

          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-2.5">
            <h4 className="text-xs font-bold text-[#F5EFE3] pb-1 border-b border-[#B89A5A]/15">
              {language === 'am' ? 'ከማከማቻው የአሁን መዝሙር ይምረጡ' : 'Select Current Study Mezmur from Library'}
            </h4>
            <div className="space-y-2">
              {mezmurs.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-[#191614] border border-[#B89A5A]/15 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#F5EFE3]">{m.titleAm}</div>
                    <div className="text-[10px] text-gray-400">{m.titleEn} • {m.categoryAm}</div>
                  </div>
                  {m.status === 'current_study' ? (
                    <span className="text-xs text-[#315C48] font-bold">የአሁን ጥናት ✓</span>
                  ) : (
                    <button
                      onClick={() => onSetCurrentMezmur(m.id)}
                      className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition"
                    >
                      ምረጥ (Select)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. LIBRARY MANAGEMENT & ADD NEW */}
      {subTab === 'library' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#F5EFE3]">
              {language === 'am' ? 'የመዝሙር ማከማቻ አስተዳደር' : 'Library Management'}
            </h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-xl bg-[#6F2630] text-white text-xs font-semibold flex items-center gap-1 shadow"
            >
              <Plus size={14} />
              <span>{showAddForm ? 'ቅጽ ዝጋ' : '+ አዲስ መዝሙር'}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddMezmurSubmit} className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/30 space-y-2.5 animate-fade-in shadow-sacred">
              <h5 className="text-xs font-bold text-[#B89A5A]">አዲስ መዝሙር መመዝገቢያ</h5>
              <input
                type="text"
                placeholder="ርዕስ በአማርኛ * (ምሳሌ: እመቤታችን ማርያም)"
                value={newTitleAm}
                onChange={(e) => setNewTitleAm(e.target.value)}
                required
                className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Title in English"
                value={newTitleEn}
                onChange={(e) => setNewTitleEn(e.target.value)}
                className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-xs text-white"
                >
                  <option value="ማርያም">ማርያም (Marian)</option>
                  <option value="መድኃኔዓለም">መድኃኔዓለም (Christ)</option>
                  <option value="ምስጋና">ምስጋና (Praise)</option>
                  <option value="ሊቀ መላእክት">ሊቀ መላእክት (Archangels)</option>
                  <option value="ንስሐ">ንስሐ (Repentance)</option>
                  <option value="ቅዱሳን">ቅዱሳን (Saints)</option>
                  <option value="ባሕላዊ">ባሕላዊ (Traditional)</option>
                </select>
                <input
                  type="text"
                  placeholder="ርዝመት (ምሳሌ: 03:45)"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-xs text-white"
                />
              </div>
              <textarea
                rows={3}
                placeholder="የመዝሙር ግጥም በአማርኛ (Lyrics in Amharic)..."
                value={newLyricsAm}
                onChange={(e) => setNewLyricsAm(e.target.value)}
                className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-xs text-white"
              />
              <textarea
                rows={2}
                placeholder="English translation if available..."
                value={newLyricsEn}
                onChange={(e) => setNewLyricsEn(e.target.value)}
                className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 px-3 py-2 text-xs text-white"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#315C48] text-white text-xs font-bold hover:bg-[#427A60] transition"
              >
                + መዝሙር ወደ ማከማቻ አክል (Save to Library)
              </button>
            </form>
          )}

          <div className="space-y-2">
            {mezmurs.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-[#201D19] border border-[#B89A5A]/15 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#F5EFE3]">{m.titleAm}</div>
                  <div className="text-[10px] text-gray-400">{m.titleEn} • {m.categoryAm} • {m.duration}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                    {m.status === 'current_study' ? 'የአሁን ጥናት' : 'በማከማቻ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUGGESTIONS FROM MEMBERS */}
      {subTab === 'suggestions' && (
        <div className="space-y-3">
          <div className="text-xs text-gray-400">
            {language === 'am'
              ? 'በአባላት የተጠቆሙ መዝሙራት (አስተዳዳሪ ብቻ ያጸድቃል)'
              : 'Mezmur suggestions submitted by members'}
          </div>

          {suggestions.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 rounded-2xl bg-[#201D19] border border-white/5">
              ምንም ጥቆማ የለም (No pending suggestions)
            </div>
          ) : (
            <div className="space-y-2.5">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-3.5 rounded-2xl bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#F5EFE3]">{sug.titleAm}</div>
                      <div className="text-[11px] text-[#B89A5A]">{sug.title}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sug.status === 'approved'
                          ? 'bg-[#315C48]/30 text-[#427A60]'
                          : sug.status === 'rejected'
                          ? 'bg-[#6F2630]/30 text-[#D98A94]'
                          : 'bg-[#B89A5A]/20 text-[#D3BA7E]'
                      }`}
                    >
                      {sug.status === 'approved'
                        ? 'ጸድቋል'
                        : sug.status === 'rejected'
                        ? 'ውድቅ ተደርጓል'
                        : 'በመጠባበቅ ላይ'}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-300 bg-[#151311] p-2 rounded-xl">
                    <span className="text-gray-400">ጠቋሚ፡ </span>
                    <span className="font-semibold text-white">{sug.suggestedByAmharicName}</span>
                    {sug.note && <p className="mt-1 italic text-gray-400">"{sug.note}"</p>}
                  </div>

                  {sug.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleReviewSuggestion(sug.id, 'rejected')}
                        className="flex-1 py-1.5 rounded-xl border border-white/10 text-xs text-gray-400 hover:text-white"
                      >
                        ውድቅ አድርግ (Reject)
                      </button>
                      <button
                        onClick={() => handleReviewSuggestion(sug.id, 'approved')}
                        className="flex-1 py-1.5 rounded-xl bg-[#315C48] text-white text-xs font-semibold hover:bg-[#427A60]"
                      >
                        አጽድቅ (Approve)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. DIGNIFIED PARTICIPATION OVERVIEW (No Shaming, No Scores) */}
      {subTab === 'participation' && participationSummary && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/30 shadow-sacred space-y-3">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#B89A5A]">
                የአሁን መዝሙር ተሳትፎ ማጠቃለያ
              </div>
              <h4 className="text-base font-bold text-[#F5EFE3]">
                🎵 {participationSummary.mezmurTitleAm}
              </h4>
            </div>

            {/* Respectful Participation Counter Pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-[#315C48]/20 border border-[#315C48]/40">
                <div className="text-base font-bold text-[#427A60]">{participationSummary.activeCount}</div>
                <div className="text-[10px] text-gray-300">🟢 በንቃት ጥናት</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#B89A5A]/20 border border-[#B89A5A]/40">
                <div className="text-base font-bold text-[#D3BA7E]">{participationSummary.startedCount}</div>
                <div className="text-[10px] text-gray-300">🟡 ተጀምሯል</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-base font-bold text-gray-400">{participationSummary.notStartedCount}</div>
                <div className="text-[10px] text-gray-400">⚪ አልተጀመረም</div>
              </div>
            </div>
          </div>

          {/* Member List with Status & Last Practice Date */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400 px-1">
              የአባላት የልምምድ ደረጃ (የግል ማስታወሻዎች አይታዩም)
            </div>
            {participationSummary.memberParticipations.map((part) => (
              <div
                key={part.memberId}
                className="p-3 rounded-2xl bg-[#201D19] border border-[#B89A5A]/15 flex items-center justify-between shadow-sacred-sm"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={part.avatarUrl}
                    alt={part.memberAmharicName}
                    className="w-8 h-8 rounded-full object-cover border border-[#B89A5A]/30"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#F5EFE3]">{part.memberAmharicName}</div>
                    <div className="text-[10px] text-gray-400">
                      {part.lastPracticedDate
                        ? `የቅርብ ልምምድ: ${part.lastPracticedDate}`
                        : 'እስካሁን አልተለማመደም'}
                    </div>
                  </div>
                </div>

                <div>
                  {part.calculatedStatus === 'active' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#315C48]/30 border border-[#315C48] text-[#427A60] text-[11px] font-semibold">
                      🟢 ንቁ
                    </span>
                  ) : part.calculatedStatus === 'started' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#B89A5A]/20 border border-[#B89A5A]/40 text-[#D3BA7E] text-[11px] font-semibold">
                      🟡 ተጀምሯል
                    </span>
                  ) : part.calculatedStatus === 'completed' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#315C48]/20 border border-[#315C48]/40 text-white text-[11px] font-semibold">
                      ✓ ተጠናቋል
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[11px]">
                      ⚪ አልተጀመረም
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
