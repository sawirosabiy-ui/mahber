import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Gathering,
  AttendanceRecord,
  ActualAttendanceStatus,
  AuditLogEntry,
  MemberContribution,
  Mezmur,
  MezmurSuggestion,
  Member,
  AdminReviewStatus,
  ContributionPeriod,
  PaymentEntry,
  GatheringPhoto,
  AdminRole,
  PaintingRotationState,
  SpendingProposal,
  TransportCollection,
  PenaltyRecord,
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
  Search,
  ShieldCheck,
  UserPlus,
  UserCheck,
  UserX,
  Volume2,
  Upload,
  History,
  LogOut,
} from 'lucide-react';

interface AdminDashboardProps {
  initialSection?: 'overview' | 'gatherings' | 'members' | 'attendance' | 'payments' | 'rotation' | 'fund' | 'mezmur' | 'audit';
  gathering: Gathering | null;
  attendance: AttendanceRecord[];
  contributions: Record<string, MemberContribution>;
  mezmurs: Mezmur[];
  onReviewAbsence: (attendanceId: string, status: AdminReviewStatus) => void;
  onRecordPayment: (memberId: string, amount: number, note?: string) => void;
  onSetCurrentMezmur: (mezmurId: string) => void;
  onAddMezmur: (titleAm: string, titleEn: string, categoryAm: string) => void;
  onArchiveMezmur?: (mezmurId: string) => void;
  onUpdateGathering: (gathering: Gathering) => void;
  onCreateGathering?: (gathering: Omit<Gathering, 'id'>) => void;
  onCompleteGathering?: (gatheringId: string) => void;
  onRefreshHistory?: () => void;
  onLockAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSection,
  gathering,
  attendance,
  contributions,
  mezmurs,
  onReviewAbsence,
  onRecordPayment,
  onSetCurrentMezmur,
  onAddMezmur,
  onArchiveMezmur,
  onUpdateGathering,
  onCreateGathering,
  onCompleteGathering,
  onRefreshHistory,
  onLockAdmin,
}) => {
  const { t, language } = useLanguage();
  const {
    currentUser,
    allMembers,
    signOut,
    updateMemberRole,
    assignMemberAdminRoles,
    addMember,
    updateMemberDetails,
    deactivateMember,
    isSuperAdmin,
    isFinanceAdmin,
    isAttendanceAdmin,
  } = useAuth();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'gatherings' | 'members' | 'attendance' | 'payments' | 'rotation' | 'fund' | 'mezmur' | 'audit'
  >(initialSection || 'overview');

  // Invitation Generation State
  const [generatedInviteMember, setGeneratedInviteMember] = useState<{ memberName: string; code: string } | null>(null);

  // Rotation & Swap Modal State
  const [rotationData, setRotationData] = useState<PaintingRotationState | null>(() => mahberService.getPaintingRotation());
  const [selectedSwapHostId, setSelectedSwapHostId] = useState<string>('');
  const [swapReason, setSwapReason] = useState<string>('');
  const [swapSuccessToast, setSwapSuccessToast] = useState(false);

  // Transport Collection Form State
  const [transportTitle, setTransportTitle] = useState('');
  const [transportCostPerPerson, setTransportCostPerPerson] = useState('50');
  const [transportTargetDate, setTransportTargetDate] = useState('27 ጥቅምት 2019');
  const [transportDescription, setTransportDescription] = useState('');

  // Proposal Creation State
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalAmount, setProposalAmount] = useState('1000');
  const [proposalCategory, setProposalCategory] = useState<'charity' | 'hospitality' | 'sacred_art' | 'bereavement' | 'event' | 'transport_subsidy' | 'other'>('charity');
  const [proposalJustification, setProposalJustification] = useState('');

  // Arrival Time & Lateness State for Live Attendance
  const [memberArrivalTimes, setMemberArrivalTimes] = useState<Record<string, string>>({});
  const [latenessPenaltyToast, setLatenessPenaltyToast] = useState<string | null>(null);

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

  // Role error feedback
  const [roleError, setRoleError] = useState<string | null>(null);

  // Complete Gathering Confirmation Modal State
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] = useState(false);
  const [completeMemoryAm, setCompleteMemoryAm] = useState('');
  const [completeMemoryEn, setCompleteMemoryEn] = useState('');
  const [completePhotoUrl, setCompletePhotoUrl] = useState('');

  // --- ACTUAL ATTENDANCE STATE ---
  const [actualAttendance, setActualAttendance] = useState<
    Record<string, { status: ActualAttendanceStatus; note?: string }>
  >(() => {
    const gId = gathering?.id || 'default';
    const saved = mahberService.getActualAttendance(gId);
    const initial: Record<string, { status: ActualAttendanceStatus; note?: string }> = {};
    allMembers.forEach((m) => {
      initial[m.id] = saved[m.id]
        ? { status: saved[m.id].status, note: saved[m.id].note }
        : { status: 'PRESENT' };
    });
    return initial;
  });
  const [attendanceSavedToast, setAttendanceSavedToast] = useState(false);

  // --- MEMBER MANAGEMENT MODALS STATE ---
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAmharicName, setNewMemberAmharicName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('+251 9');
  const [newMemberBaptismalName, setNewMemberBaptismalName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'admin'>('member');
  const [memberFormError, setMemberFormError] = useState<string | null>(null);

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmharicName, setEditAmharicName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBaptismalName, setEditBaptismalName] = useState('');

  // --- AUDIT LOG FILTER STATE ---
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

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
    } else {
      mahberService.logAuditEvent(
        currentUser.id,
        currentUser.amharicName,
        `Role updated for ${member.name} to ${newRole}`,
        `የ${member.amharicName} ሚና ወደ ${newRole === 'admin' ? 'አስተዳዳሪ' : 'አባል'} ተቀየረ`,
        'member',
        member.id,
        `Role: ${newRole}`
      );
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
    // Use sequentially allocated advance payment if > 100 ETB
    if (amount >= 100) {
      mahberService.recordAdvancePayment(selectedMemberForPayment, amount, paymentNote || 'መዋጮ ክፍያ');
    }
    onRecordPayment(selectedMemberForPayment, amount, paymentNote);
    const targetMember = allMembers.find((m) => m.id === selectedMemberForPayment);
    if (targetMember) {
      mahberService.logAuditEvent(
        currentUser.id,
        currentUser.amharicName,
        `Recorded ETB ${amount} payment for ${targetMember.name}`,
        `ለ${targetMember.amharicName} ${amount} ብር መዋጮ ተመዘገበ`,
        'payment',
        targetMember.id,
        paymentNote ? `Note: ${paymentNote}` : undefined
      );
    }
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

    mahberService.logAuditEvent(
      currentUser.id,
      currentUser.amharicName,
      `Scheduled new gathering on ${newEthDate} at ${newLocation}`,
      `አዲስ የማኅበር መሰብሰቢያ ለ${newEthDate} ተመደበ`,
      'gathering',
      undefined,
      `Location: ${newLocation}`
    );

    setShowCreateGatheringModal(false);
  };

  // --- SAVE ACTUAL ATTENDANCE ---
  const handleSaveActualAttendance = () => {
    if (!gathering) return;
    mahberService.saveActualAttendance(
      gathering.id,
      actualAttendance,
      currentUser.id,
      currentUser.amharicName
    );
    if (onRefreshHistory) {
      onRefreshHistory();
    }
    setAttendanceSavedToast(true);
    setTimeout(() => setAttendanceSavedToast(false), 3000);
  };

  // --- ADD MEMBER SUBMIT ---
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberFormError(null);

    if (!newMemberName.trim() || !newMemberAmharicName.trim()) {
      setMemberFormError(
        language === 'am' ? 'እባክዎን ስም እና የአማርኛ ስም ያስገቡ።' : 'Please provide full name and Amharic name.'
      );
      return;
    }

    const res = addMember({
      name: newMemberName.trim(),
      amharicName: newMemberAmharicName.trim(),
      baptismalName: newMemberBaptismalName.trim() || undefined,
      phone: newMemberPhone.trim() || '+251 90 000 0000',
      role: newMemberRole,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    if (!res.success) {
      setMemberFormError(res.error || 'Failed to add member');
      return;
    }

    mahberService.logAuditEvent(
      currentUser.id,
      currentUser.amharicName,
      `Added new member ${newMemberName} (${newMemberRole})`,
      `አዲስ አባል ${newMemberAmharicName} ተመዘገበ`,
      'member',
      undefined,
      `Phone: ${newMemberPhone}`
    );

    setShowAddMemberModal(false);
    setNewMemberName('');
    setNewMemberAmharicName('');
    setNewMemberPhone('+251 9');
    setNewMemberBaptismalName('');
    setNewMemberRole('member');
  };

  // --- EDIT MEMBER SUBMIT ---
  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMemberDetails(editingMember.id, {
      name: editName.trim() || editingMember.name,
      amharicName: editAmharicName.trim() || editingMember.amharicName,
      phone: editPhone.trim() || editingMember.phone,
      baptismalName: editBaptismalName.trim() || editingMember.baptismalName,
    });

    mahberService.logAuditEvent(
      currentUser.id,
      currentUser.amharicName,
      `Updated details for member ${editingMember.name}`,
      `የ${editingMember.amharicName} መረጃ ተስተካከለ`,
      'member',
      editingMember.id
    );

    setEditingMember(null);
  };

  // --- DEACTIVATE MEMBER TOGGLE ---
  const handleToggleDeactivate = (member: Member) => {
    const res = deactivateMember(member.id);
    if (!res.success && res.error) {
      setRoleError(res.error);
    } else {
      mahberService.logAuditEvent(
        currentUser.id,
        currentUser.amharicName,
        `${member.isDeactivated ? 'Reactivated' : 'Deactivated'} member ${member.name}`,
        `የ${member.amharicName} ሁኔታ ወደ ${member.isDeactivated ? 'ንቁ' : 'የታገደ'} ተቀየረ`,
        'member',
        member.id
      );
    }
  };

  // Attendance metrics from actual attendance state
  const actualPresentCount = Object.values(actualAttendance).filter((a) => a.status === 'PRESENT').length;
  const actualLateCount = Object.values(actualAttendance).filter((a) => a.status === 'LATE').length;
  const actualExcusedCount = Object.values(actualAttendance).filter((a) => a.status === 'EXCUSED').length;
  const actualAbsentCount = Object.values(actualAttendance).filter((a) => a.status === 'ABSENT').length;

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
          <div className="flex-1">
            <div className="font-bold text-[#D98A94]">የአስተዳዳሪ ደንብ ገደብ</div>
            <p>{roleError}</p>
          </div>
          <button
            onClick={() => setRoleError(null)}
            className="text-xs text-gray-400 hover:text-white"
          >
            ✕
          </button>
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
          onClick={() => setActiveSection('rotation')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'rotation'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          የስዕል ተራ እና ዝውውር (Rotation)
        </button>
        <button
          onClick={() => setActiveSection('fund')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'fund'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          የጋራ ፈንድ እና ትራንስፖርት (Fund & Proposals)
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
        <button
          onClick={() => setActiveSection('audit')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSection === 'audit'
              ? 'bg-[#6F2630] text-white shadow'
              : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
          }`}
        >
          ኦዲት መዝገብ (Audit Logs)
        </button>
        {onLockAdmin && (
          <button
            onClick={onLockAdmin}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition bg-[#B89A5A]/20 border border-[#B89A5A]/60 text-[#F5EFE3] hover:bg-[#B89A5A]/40 flex items-center gap-1.5"
          >
            <Lock size={13} />
            <span>{language === 'am' ? 'አስተዳዳሪን ቆልፍ (Lock)' : 'Lock Admin'}</span>
          </button>
        )}
        <button
          onClick={() => {
            if (window.confirm(language === 'am' ? 'በእርግጥ መውጣት ይፈልጋሉ?' : 'Are you sure you want to sign out?')) {
              signOut();
            }
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition bg-[#6F2630]/20 border border-[#6F2630]/60 text-[#D98A94] hover:bg-[#6F2630] hover:text-white flex items-center gap-1.5"
        >
          <LogOut size={13} />
          <span>{language === 'am' ? 'ውጣ (Sign Out)' : 'Sign Out'}</span>
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
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-[#B89A5A]/10 border border-[#B89A5A]/25 text-xs text-gray-300 flex-1 mr-2">
              {t.adminMaxAdminsNotice}
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-3 py-2 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition flex items-center gap-1.5 shadow shrink-0"
            >
              <UserPlus size={14} />
              <span>አዲስ አባል</span>
            </button>
          </div>

          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <h3 className="text-xs font-bold text-[#F5EFE3]">የማኅበሩ አባላት ዝርዝር</h3>
              <span className="text-xs text-[#B89A5A]">
                አስተዳዳሪዎች: {allMembers.filter((m) => m.role === 'admin' && !m.isDeactivated).length} / 2
              </span>
            </div>

            <div className="divide-y divide-[#B89A5A]/10">
              {allMembers.map((member) => {
                const memberContribution = contributions[member.id];
                const isPaid = (memberContribution?.totalOutstanding || 0) === 0;

                return (
                  <div
                    key={member.id}
                    className={`py-3 flex items-center justify-between ${
                      member.isDeactivated ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#B89A5A]/30"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
                          <span>{member.amharicName}</span>
                          {member.baptismalName && (
                            <span className="text-[10px] text-gray-400">({member.baptismalName})</span>
                          )}
                          {member.role === 'admin' ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#B89A5A]/20 text-[#B89A5A] font-semibold border border-[#B89A5A]/30">
                              ⭐ አስተዳዳሪ
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-gray-400">
                              አባል
                            </span>
                          )}
                          {member.isDeactivated && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-semibold">
                              የታገደ
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400">{member.phone}</div>
                        <div className="flex gap-2 text-[10px] mt-0.5">
                          <span className={isPaid ? 'text-[#315C48]' : 'text-[#B89A5A]'}>
                            ● {isPaid ? 'ተከፍሏል' : `${memberContribution?.totalOutstanding || 0} ብር ቀሪ`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setEditName(member.name);
                          setEditAmharicName(member.amharicName);
                          setEditPhone(member.phone);
                          setEditBaptismalName(member.baptismalName || '');
                        }}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                        title="Edit Member"
                      >
                        <Edit3 size={13} />
                      </button>

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

                      <button
                        onClick={() => {
                          const invite = mahberService.createInvitation(member.id, currentUser.id);
                          setGeneratedInviteMember({ memberName: member.amharicName, code: invite.code });
                        }}
                        className="p-1.5 rounded-lg bg-[#B89A5A]/20 border border-[#B89A5A]/40 text-[#D3BA7E] hover:bg-[#B89A5A]/30 transition"
                        title="የመግቢያ ኮድ ፍጠር (Generate Invite Code)"
                      >
                        <Lock size={13} />
                      </button>

                      <button
                        onClick={() => handleToggleDeactivate(member)}
                        className={`p-1.5 rounded-lg border transition ${
                          member.isDeactivated
                            ? 'bg-[#315C48]/20 border-[#315C48] text-[#315C48]'
                            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        }`}
                        title={member.isDeactivated ? 'Reactivate' : 'Deactivate'}
                      >
                        {member.isDeactivated ? <UserCheck size={13} /> : <UserX size={13} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generated Invite Code Popup Modal */}
          {generatedInviteMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#201D19] rounded-3xl border border-[#B89A5A]/40 p-5 shadow-sacred space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#B89A5A]/20 text-[#B89A5A] flex items-center justify-center mx-auto">
                  <Lock size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#F5EFE3]">የመግቢያ ኮድ ተፈጥሯል</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    ለ{generatedInviteMember.memberName} የተዘጋጀ ባለአንድ-ጊዜ የመግቢያ ኮድ:
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#151311] border border-[#B89A5A]/40 font-mono text-lg font-bold tracking-widest text-[#B89A5A]">
                  {generatedInviteMember.code}
                </div>
                <p className="text-[11px] text-gray-400 italic">
                  ይህን ኮድ ለአባሉ ያጋሩ። ኮዱ በመግቢያ ገጽ ላይ "ባለአንድ-ጊዜ ኮድ (Invite Code)" በሚለው አማራጭ መለያቸውን ያነቃቃል።
                </p>
                <button
                  type="button"
                  onClick={() => setGeneratedInviteMember(null)}
                  className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition"
                >
                  ዝጋ (Close)
                </button>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showAddMemberModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#201D19] rounded-3xl border border-[#B89A5A]/30 p-5 shadow-sacred space-y-4">
                <h4 className="text-sm font-bold text-[#F5EFE3]">አዲስ አባል ጨምር</h4>
                {memberFormError && (
                  <div className="p-2.5 rounded-xl bg-[#6F2630]/20 border border-[#6F2630] text-xs text-[#E5DCD0]">
                    {memberFormError}
                  </div>
                )}
                <form onSubmit={handleAddMemberSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ስም (English)</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g. Yohannes Kebede"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ስም (አማርኛ)</label>
                    <input
                      type="text"
                      value={newMemberAmharicName}
                      onChange={(e) => setNewMemberAmharicName(e.target.value)}
                      placeholder="ለምሳሌ: ዮሐንስ ከበደ"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">የክርስትና ስም (አማራጭ)</label>
                    <input
                      type="text"
                      value={newMemberBaptismalName}
                      onChange={(e) => setNewMemberBaptismalName(e.target.value)}
                      placeholder="ለምሳሌ: ወልደ ገብርኤል"
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ስልክ ቁጥር</label>
                    <input
                      type="text"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ሚና (Role)</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                    >
                      <option value="member">አባል (Member)</option>
                      <option value="admin">አስተዳዳሪ (Admin - Max 2)</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberModal(false)}
                      className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-gray-400"
                    >
                      ሰርዝ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#6F2630] text-white text-xs font-semibold"
                    >
                      መዝግብ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Member Modal */}
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm bg-[#201D19] rounded-3xl border border-[#B89A5A]/30 p-5 shadow-sacred space-y-4">
                <h4 className="text-sm font-bold text-[#F5EFE3]">የአባል መረጃ አርትዕ</h4>
                <form onSubmit={handleEditMemberSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ስም (English)</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ስም (አማርኛ)</label>
                    <input
                      type="text"
                      value={editAmharicName}
                      onChange={(e) => setEditAmharicName(e.target.value)}
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">የክርስትና ስም</label>
                    <input
                      type="text"
                      value={editBaptismalName}
                      onChange={(e) => setEditBaptismalName(e.target.value)}
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">ስልክ ቁጥር</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-gray-400"
                    >
                      ሰርዝ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#315C48] text-white text-xs font-semibold"
                    >
                      አስቀምጥ (Save)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION: ATTENDANCE RECORDING & PRIVATE REASONS */}
      {activeSection === 'attendance' && (
        <div className="space-y-4 animate-fade-in">
          {/* Toast Notification */}
          {attendanceSavedToast && (
            <div className="p-3 rounded-2xl bg-[#315C48] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sacred animate-fade-in text-center">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>
                {language === 'am'
                  ? 'የተሳትፎ መዝገብ ተቀምጧል እንዲሁም ወደ ታሪክ መዝገብ ገብቷል! አባላት ማየት ይችላሉ።'
                  : 'Attendance saved and recorded into History! All members can now view it.'}
              </span>
            </div>
          )}

          {latenessPenaltyToast && (
            <div className="p-3 rounded-2xl bg-[#E07A24] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sacred animate-fade-in">
              <AlertCircle size={18} />
              <span>{latenessPenaltyToast}</span>
            </div>
          )}

          {/* Privacy Banner */}
          <div className="p-3 rounded-2xl bg-[#6F2630]/15 border border-[#6F2630]/30 flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-[#D98A94] shrink-0 mt-0.5" />
            <p className="text-xs text-[#E5DCD0]">
              የምስጢራዊነት ዋስትና: የአባላት የመቅረት ምክንያት እና የግል ማስታወሻዎች የሚታዩት እዚህ ለአስተዳዳሪዎች ብቻ ነው።
            </p>
          </div>

          {/* ACTUAL ATTENDANCE RECORDING SHEET */}
          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/30 shadow-sacred space-y-4">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
              <div>
                <h3 className="text-xs font-bold text-[#F5EFE3] uppercase tracking-wider">
                  የተሳትፎ መዝገብ (Live Gathering Attendance)
                </h3>
                <p className="text-[10px] text-gray-400">
                  ለእያንዳንዱ አባል የመገኘት ሁኔታ ይምረጡና «መዝግብ» የሚለውን ይጫኑ
                </p>
              </div>
              <button
                onClick={handleSaveActualAttendance}
                className="px-4 py-2 rounded-xl bg-[#315C48] hover:bg-[#427A60] text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Check size={14} />
                <span>መዝግብ (Save)</span>
              </button>
            </div>

            {/* Attendance Status Summary Bar */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#315C48]/20 border border-[#315C48]/40">
                <div className="text-base font-bold text-[#427A60]">{actualPresentCount}</div>
                <div className="text-[10px] text-gray-300">🟢 ተገኝቷል</div>
              </div>
              <div className="p-2 rounded-xl bg-[#E07A24]/20 border border-[#E07A24]/40">
                <div className="text-base font-bold text-[#E07A24]">{actualLateCount}</div>
                <div className="text-[10px] text-gray-300">🟠 አርፍዷል</div>
              </div>
              <div className="p-2 rounded-xl bg-[#B89A5A]/20 border border-[#B89A5A]/40">
                <div className="text-base font-bold text-[#D3BA7E]">{actualExcusedCount}</div>
                <div className="text-[10px] text-gray-300">🟡 በፈቃድ</div>
              </div>
              <div className="p-2 rounded-xl bg-[#6F2630]/20 border border-[#6F2630]/40">
                <div className="text-base font-bold text-[#D98A94]">{actualAbsentCount}</div>
                <div className="text-[10px] text-gray-300">🔴 ያልተገኘ</div>
              </div>
            </div>

            {/* Members 4-State Toggle List */}
            <div className="divide-y divide-[#B89A5A]/10">
              {allMembers
                .filter((m) => !m.isDeactivated)
                .map((member) => {
                  const currentStatus = actualAttendance[member.id]?.status || 'PRESENT';

                  return (
                    <div key={member.id} className="py-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#B89A5A]/30"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#F5EFE3]">
                              {member.amharicName}
                            </div>
                            <div className="text-[10px] text-gray-400">{member.name}</div>
                          </div>
                        </div>

                        {/* 4 Status Buttons: Present, Excused, Late (Orange), Absent */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setActualAttendance((prev) => ({
                                ...prev,
                                [member.id]: { ...prev[member.id], status: 'PRESENT' },
                              }))
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                              currentStatus === 'PRESENT'
                                ? 'bg-[#315C48] text-white border-[#427A60] shadow-sm'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            🟢 ተገኝቷል
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActualAttendance((prev) => ({
                                ...prev,
                                [member.id]: { ...prev[member.id], status: 'LATE' },
                              }))
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                              currentStatus === 'LATE'
                                ? 'bg-[#E07A24] text-white border-[#D97706] shadow-sm'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-[#E07A24]'
                            }`}
                          >
                            🟠 አርፍዷል
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActualAttendance((prev) => ({
                                ...prev,
                                [member.id]: { ...prev[member.id], status: 'EXCUSED' },
                              }))
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-[#B89A5A] text-black border-[#D4AF37] font-bold shadow-sm'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-[#B89A5A]'
                            }`}
                          >
                            🟡 በፈቃድ
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActualAttendance((prev) => ({
                                ...prev,
                                [member.id]: { ...prev[member.id], status: 'ABSENT' },
                              }))
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                              currentStatus === 'ABSENT'
                                ? 'bg-[#6F2630] text-white border-[#8C3542] shadow-sm'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-400'
                            }`}
                          >
                            🔴 ያልተገኘ
                          </button>
                        </div>
                      </div>

                      {/* 30-Min Lateness Penalty & Absence Trigger Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pl-10 border-t border-white/5 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#B89A5A]" />
                          <span className="text-gray-400">የደረሰበት ሰዓት:</span>
                          <input
                            type="time"
                            value={memberArrivalTimes[member.id] || ''}
                            onChange={(e) => setMemberArrivalTimes(prev => ({ ...prev, [member.id]: e.target.value }))}
                            className="bg-[#151311] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const arrivalTime = memberArrivalTimes[member.id];
                              if (!arrivalTime) {
                                alert(language === 'am' ? 'እባክዎ መጀመሪያ የደረሰበትን ሰዓት ያስገቡ።' : 'Please specify arrival time.');
                                return;
                              }
                              const gDate = gathering?.gregDateRaw ? gathering.gregDateRaw.split('T')[0] : new Date().toISOString().split('T')[0];
                              const arrivalIso = `${gDate}T${arrivalTime}:00`;
                              const schedStart = gathering?.gregDateRaw || `${gDate}T18:00:00`;
                              const penalty = mahberService.recordLateArrivalWithGracePeriod(
                                member.id,
                                gathering?.id || 'default',
                                schedStart,
                                arrivalIso
                              );
                              if (penalty) {
                                setActualAttendance(prev => ({ ...prev, [member.id]: { ...prev[member.id], status: 'LATE' } }));
                                setLatenessPenaltyToast(`${member.amharicName} ከ30 ደቂቃ በላይ አርፍዷል! 100 ብር ቅጣት ተመዝግቧል።`);
                              } else {
                                setActualAttendance(prev => ({ ...prev, [member.id]: { ...prev[member.id], status: 'PRESENT' } }));
                                setLatenessPenaltyToast(`${member.amharicName} በሰዓቱ (ወይም በምህረት ጊዜ ውስጥ) ደርሷል - ምንም ቅጣት የለም።`);
                              }
                              setTimeout(() => setLatenessPenaltyToast(null), 3500);
                            }}
                            className="px-2 py-0.5 rounded bg-[#E07A24]/20 border border-[#E07A24]/40 text-[#E07A24] font-medium hover:bg-[#E07A24]/30 transition"
                          >
                            ማርፈድ ፈትሽ (Check &gt;30m)
                          </button>
                        </div>

                        {currentStatus === 'ABSENT' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                mahberService.recordAbsencePenalty(member.id, gathering?.id || 'default', false);
                                setLatenessPenaltyToast(`ለ${member.amharicName} ያልተፈቀደ መቅረት 200 ብር ቅጣት ተመዝግቧል።`);
                                setTimeout(() => setLatenessPenaltyToast(null), 3500);
                              }}
                              className="px-2 py-0.5 rounded bg-[#6F2630]/30 border border-[#6F2630] text-[#D98A94] font-medium hover:bg-[#6F2630]/50 transition"
                            >
                              200 ብር ቅጣት መዝግብ (Unexcused)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                mahberService.recordAbsencePenalty(member.id, gathering?.id || 'default', true, 'በአስተዳዳሪ የተፈቀደ ይቅርታ');
                                setLatenessPenaltyToast(`ለ${member.amharicName} የቀረበው ይቅርታ ተቀባይነት አግኝቷል (0 ብር)።`);
                                setTimeout(() => setLatenessPenaltyToast(null), 3500);
                              }}
                              className="px-2 py-0.5 rounded bg-[#315C48]/30 border border-[#315C48] text-[#427A60] font-medium hover:bg-[#315C48]/50 transition"
                            >
                              በይቅርታ እለፍ (Excused)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveActualAttendance}
                className="w-full py-2.5 rounded-xl bg-[#315C48] hover:bg-[#427A60] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Check size={16} />
                <span>የተሳትፎ መዝገብ አስቀምጥ (Save Attendance)</span>
              </button>
            </div>
          </div>

          {/* ADVANCE RSVP & PRIVATE ABSENCE REASONS REVIEW */}
          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            <h3 className="text-xs font-bold text-[#F5EFE3] pb-2 border-b border-[#B89A5A]/15">
              የአባላት የቅድሚያ ምላሽ እና የቀረቡ የግል ምክንያቶች
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

      {/* SECTION: SACRED PAINTING ROTATION & HOSTING SWAPS */}
      {activeSection === 'rotation' && (
        <div className="space-y-4 animate-fade-in">
          {swapSuccessToast && (
            <div className="p-3 rounded-2xl bg-[#315C48] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sacred animate-fade-in">
              <CheckCircle2 size={18} />
              <span>የተረኝነት ዝውውር በተሳካ ሁኔታ ተመዝግቧል!</span>
            </div>
          )}

          <div className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/30 shadow-sacred space-y-4">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F5EFE3]">የቅዱሳን ሥዕል ተራ እና ዝውውር (Sacred Painting Rotation)</h3>
                <p className="text-xs text-gray-400">ወቅታዊ ተረኛ፣ ቀጣይ አስተናጋጅ እና የፈቃድ ዝውውር መዝገብ</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-[#B89A5A]/20 text-[#B89A5A] font-semibold border border-[#B89A5A]/30">
                27ኛው ቀን
              </span>
            </div>

            {/* Current State Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[#2A241E] border border-[#B89A5A]/20">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">የአሁን ሥዕል ያዥ (Current Holder)</div>
                <div className="text-sm font-bold text-[#F5EFE3] mt-1">
                  {allMembers.find(m => m.id === rotationData?.currentHolderId)?.amharicName || 'ያልተገለጸ'}
                </div>
                <div className="text-[10px] text-[#B89A5A] mt-0.5">የቅዱሳን ሥዕል በቤታቸው ይገኛል</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#2A241E] border border-[#B89A5A]/20">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">ቀጣይ ተረኛ (Scheduled Host)</div>
                <div className="text-sm font-bold text-[#F5EFE3] mt-1">
                  {allMembers.find(m => m.id === rotationData?.nextAssignedHostId)?.amharicName || 'ያልተገለጸ'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">በመደበኛ ቅደም ተከተል መሠረት</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#2A241E] border border-[#B89A5A]/20">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">የሚቀጥለው ማኅበር አስተናጋጅ</div>
                <div className="text-sm font-bold text-[#315C48] mt-1">
                  {allMembers.find(m => m.id === (rotationData?.swaps?.[0]?.substituteHostId || rotationData?.scheduledHostId || rotationData?.nextAssignedHostId))?.amharicName || 'ያልተገለጸ'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {rotationData?.swaps && rotationData.swaps.length > 0 ? 'በዝውውር የተረከቡ' : 'መደበኛ ተረኛ'}
                </div>
              </div>
            </div>

            {/* Non-destructive Hosting Swap Form */}
            <div className="p-4 rounded-2xl bg-[#1A1714] border border-[#B89A5A]/20 space-y-3">
              <h4 className="text-xs font-bold text-[#B89A5A] uppercase tracking-wide">
                የተረኝነት ጊዜያዊ ዝውውር መዝግብ (Record Hosting Swap)
              </h4>
              <p className="text-[11px] text-gray-400">
                አስተናጋጁ በግል ምክንያት መቀበል በማይችልበት ጊዜ፣ ሥርዓታዊ ቅደም ተከተሉ ሳይዛባ ለሌላ አባል በጊዜያዊነት ማስተላለፍ።
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">ጊዜያዊ ተረካቢ አባል</label>
                  <select
                    value={selectedSwapHostId}
                    onChange={(e) => setSelectedSwapHostId(e.target.value)}
                    className="w-full rounded-xl bg-[#201D19] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                  >
                    <option value="">አባል ይምረጡ...</option>
                    {allMembers
                      .filter(m => !m.isDeactivated && m.id !== rotationData?.nextAssignedHostId)
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.amharicName} ({m.name})</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">የዝውውር ምክንያት</label>
                  <input
                    type="text"
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    placeholder="ለምሳሌ፡ ጉዞ፣ ህመም ወይም አስገዳጅ ሁኔታ"
                    className="w-full rounded-xl bg-[#201D19] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedSwapHostId) {
                      alert(language === 'am' ? 'እባክዎ ጊዜያዊ ተረካቢ አባል ይምረጡ' : 'Please select a temporary host');
                      return;
                    }
                    const updated = mahberService.recordHostingSwap(
                      gathering?.id || 'gathering-current',
                      rotationData?.nextAssignedHostId || 'mem_1',
                      selectedSwapHostId,
                      swapReason || 'በአስተዳዳሪ የተመዘገበ ዝውውር',
                      currentUser.id
                    );
                    setRotationData(updated);
                    setSwapSuccessToast(true);
                    setSelectedSwapHostId('');
                    setSwapReason('');
                    setTimeout(() => setSwapSuccessToast(false), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition shadow"
                >
                  ዝውውሩን አጽድቅ (Confirm Swap)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: SHARED FUND, PROPOSALS & TRANSPORT */}
      {activeSection === 'fund' && (
        <div className="space-y-4 animate-fade-in">
          {/* Fund Balance Summary Banner */}
          {(() => {
            const fundBalance = mahberService.getSharedFundBalance();
            return (
              <div className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/30 shadow-sacred flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">የማኅበሩ የጋራ ፈንድ ቀሪ ሒሳብ</div>
                  <div className="text-2xl font-bold text-[#F5EFE3] mt-1">{fundBalance.toLocaleString()} <span className="text-sm font-normal text-[#B89A5A]">ብር</span></div>
                  <div className="text-[10px] text-gray-400 mt-0.5">የተጣራ ገቢ ሲቀነስ ወጪ (Net Income - Expenses)</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#315C48]/20 border border-[#315C48]/40 text-[#427A60]">
                  <DollarSign size={24} />
                </div>
              </div>
            );
          })()}

          {/* New Spending Proposal Card */}
          <div className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/20 space-y-3">
            <h4 className="text-xs font-bold text-[#F5EFE3] uppercase tracking-wide border-b border-[#B89A5A]/15 pb-2">
              አዲስ የጋራ ወጪ ጥያቄ አቅርብ (Propose Spending with Majority Vote)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">የወጪው ርዕስ</label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የታመመ ወንድም መጠየቂያ"
                  className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">መጠን (ብር)</label>
                <input
                  type="number"
                  value={proposalAmount}
                  onChange={(e) => setProposalAmount(e.target.value)}
                  className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">ምድብ</label>
                <select
                  value={proposalCategory}
                  onChange={(e) => setProposalCategory(e.target.value as any)}
                  className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                >
                  <option value="charity">ምጽዋት እና መረዳጃ (Charity)</option>
                  <option value="bereavement">የሐዘን መጽናኛ (Bereavement)</option>
                  <option value="hospitality">የማኅበር ግብዣ ድጋፍ (Hospitality)</option>
                  <option value="sacred_art">የቅዱሳን ሥዕላት እንክብካቤ (Sacred Art)</option>
                  <option value="event">በዓላት እና ዝግጅቶች (Event)</option>
                  <option value="transport_subsidy">የትራንስፖርት ድጎማ (Transport)</option>
                  <option value="other">ሌሎች (Other)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">ምክንያት እና ማብራሪያ (Justification)</label>
              <textarea
                value={proposalJustification}
                onChange={(e) => setProposalJustification(e.target.value)}
                rows={2}
                placeholder="ይህ ወጪ ለማኅበሩ ለምን አስፈለገ? ዝርዝር ማብራሪያ ይጻፉ..."
                className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!proposalTitle.trim()) {
                    alert(language === 'am' ? 'እባክዎ የጥያቄውን ርዕስ ያስገቡ' : 'Please provide proposal title');
                    return;
                  }
                  mahberService.createSpendingProposal({
                    title: proposalTitle,
                    titleAm: proposalTitle,
                    description: proposalJustification,
                    amount: parseFloat(proposalAmount) || 0,
                    category: proposalCategory,
                    proposedBy: currentUser.id,
                    proposedByName: currentUser.amharicName,
                  });
                  alert(language === 'am' ? 'የወጪ ጥያቄው ለድምጽ አሰጣጥ ቀርቧል!' : 'Proposal created and open for voting!');
                  setProposalTitle('');
                  setProposalJustification('');
                }}
                className="px-4 py-2 rounded-xl bg-[#315C48] hover:bg-[#427A60] text-white text-xs font-bold transition shadow"
              >
                ለአባላት ድምፅ አቅርብ (Submit for Voting)
              </button>
            </div>
          </div>

          {/* Transport Collection Card */}
          <div className="p-4 rounded-3xl bg-[#201D19] border border-[#B89A5A]/20 space-y-3">
            <h4 className="text-xs font-bold text-[#F5EFE3] uppercase tracking-wide border-b border-[#B89A5A]/15 pb-2">
              የትራንስፖርት መዋጮ ማደራጃ (Transport Collections)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">የርዕስ ስም</label>
                <input
                  type="text"
                  value={transportTitle}
                  onChange={(e) => setTransportTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የጥቅምት ማኅበር ታክሲ/ሚኒባስ"
                  className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">የአንድ ሰው ድርሻ (ብር)</label>
                <input
                  type="number"
                  value={transportCostPerPerson}
                  onChange={(e) => setTransportCostPerPerson(e.target.value)}
                  className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">የመሰብሰቢያ ቀን</label>
                <input
                  type="text"
                  value={transportTargetDate}
                  onChange={(e) => setTransportTargetDate(e.target.value)}
                  className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!transportTitle.trim()) {
                    alert(language === 'am' ? 'እባክዎ የትራንስፖርቱን ርዕስ ያስገቡ' : 'Please provide transport title');
                    return;
                  }
                  mahberService.createTransportCollection(
                    gathering?.id || 'gathering-current',
                    transportTitle,
                    transportTitle,
                    gathering?.location || 'ማኅበር መገኛ',
                    parseFloat(transportCostPerPerson) || 50,
                    transportDescription
                  );
                  alert(language === 'am' ? 'የትራንስፖርት መዋጮው ተመዝግቧል!' : 'Transport collection created!');
                  setTransportTitle('');
                  setTransportDescription('');
                }}
                className="px-4 py-2 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition shadow"
              >
                የትራንስፖርት መዋጮ ጀምር (Create Transport Collection)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: MEZMUR MANAGEMENT */}
      {activeSection === 'mezmur' && (
        <AdminMezmurSection
          mezmurs={mezmurs}
          onSetCurrentMezmur={onSetCurrentMezmur}
          onAddMezmur={onAddMezmur}
          onArchiveMezmur={onArchiveMezmur}
        />
      )}

      {/* SECTION: AUDIT LOGS */}
      {activeSection === 'audit' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3 rounded-2xl bg-[#B89A5A]/10 border border-[#B89A5A]/25 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={18} className="text-[#B89A5A]" />
              <div className="text-xs font-bold text-[#F5EFE3]">የአስተዳዳሪ ኦዲት መዝገብ (Audit Trail)</div>
            </div>
            <span className="text-[10px] text-gray-400">ግልጽነት እና ተጠያቂነት</span>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="ኦዲት ፈልግ (Search audit logs)..."
                className="w-full rounded-xl bg-[#201D19] border border-[#B89A5A]/25 pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B89A5A]"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {['all', 'member', 'payment', 'attendance', 'gathering', 'mezmur', 'system'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAuditFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                    auditFilter === cat
                      ? 'bg-[#6F2630] text-white'
                      : 'bg-[#201D19] border border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat === 'all'
                    ? 'ሁሉም (All)'
                    : cat === 'member'
                    ? 'አባላት'
                    : cat === 'payment'
                    ? 'ክፍያ'
                    : cat === 'attendance'
                    ? 'ተሳትፎ'
                    : cat === 'gathering'
                    ? 'ማኅበር'
                    : cat === 'mezmur'
                    ? 'መዝሙር'
                    : 'ስርዓት'}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Logs List */}
          <div className="rounded-3xl p-4 bg-[#201D19] border border-[#B89A5A]/20 shadow-sacred space-y-3">
            {(() => {
              const allLogs = mahberService.getAuditLogs();
              const filtered = allLogs.filter((log) => {
                if (auditFilter !== 'all' && log.targetType !== auditFilter) return false;
                if (auditSearch.trim()) {
                  const q = auditSearch.toLowerCase();
                  return (
                    log.action.toLowerCase().includes(q) ||
                    log.actionAm.toLowerCase().includes(q) ||
                    log.adminName.toLowerCase().includes(q)
                  );
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-8 text-center text-xs text-gray-500">
                    ምንም የኦዲት መዝገብ አልተገኘም (No audit logs match criteria)
                  </div>
                );
              }

              return (
                <div className="divide-y divide-[#B89A5A]/10">
                  {filtered.map((log) => (
                    <div key={log.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-[#F5EFE3]">{log.actionAm}</div>
                        <span
                          className={`text-[9px] px-2 py-0.2 rounded font-semibold uppercase ${
                            log.targetType === 'member'
                              ? 'bg-blue-500/20 text-blue-300'
                              : log.targetType === 'payment'
                              ? 'bg-green-500/20 text-green-300'
                              : log.targetType === 'attendance'
                              ? 'bg-amber-500/20 text-amber-300'
                              : log.targetType === 'gathering'
                              ? 'bg-purple-500/20 text-purple-300'
                              : log.targetType === 'mezmur'
                              ? 'bg-pink-500/20 text-pink-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {log.targetType}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">{log.action}</div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                        <span>አድራጊ፡ {log.adminName}</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
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
  onArchiveMezmur?: (mezmurId: string) => void;
}

const AdminMezmurSection: React.FC<AdminMezmurSectionProps> = ({
  mezmurs,
  onSetCurrentMezmur,
  onAddMezmur,
  onArchiveMezmur,
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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Current study summary
  const currentMezmur = mezmurs.find((m) => m.status === 'current_study') || mezmurs[0];
  const participationSummary = currentMezmur
    ? mahberService.getMezmurParticipationSummary(currentMezmur.id)
    : null;

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = mahberService.validateAudioFileSize(file);
    if (!validation.valid) {
      setAudioError(language === 'am' ? (validation.errorAm || 'የድምጽ ፋይል መጠን ከ 20MB ማለፍ የለበትም') : (validation.errorEn || 'File size exceeds 20MB'));
      setAudioFile(null);
      setAudioFileName('');
    } else {
      setAudioError(null);
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  const handleReviewSuggestion = (suggestionId: string, decision: 'approved' | 'rejected') => {
    const result = mahberService.reviewSuggestion(suggestionId, currentUser.id, decision);
    setSuggestions([...result.suggestions]);
  };

  const handleAddMezmurSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAm.trim()) return;
    if (audioError) return;

    mahberService.addMezmur({
      titleAm: newTitleAm.trim(),
      titleEn: newTitleEn.trim() || newTitleAm.trim(),
      categoryAm: newCategory,
      categoryEn: newCategory,
      lyricsAm: newLyricsAm.trim() || undefined,
      lyricsEn: newLyricsEn.trim() || undefined,
      duration: newDuration || '03:30',
      audioUrl: audioFileName ? `https://example.com/audio/${encodeURIComponent(audioFileName)}` : undefined,
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
    setAudioFile(null);
    setAudioFileName('');
    setAudioError(null);
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

              {/* Audio Upload with <= 20MB validation */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#151311] border border-[#B89A5A]/20">
                <label className="block text-[11px] font-semibold text-[#B89A5A]">
                  የድምጽ ፋይል ይምረጡ (ከ 20MB በታች / Audio File ≤ 20MB)
                </label>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                  onChange={handleAudioFileChange}
                  className="block w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#B89A5A]/20 file:text-[#D3BA7E] hover:file:bg-[#B89A5A]/30 cursor-pointer"
                />
                {audioFileName && (
                  <div className="text-[11px] text-green-400 font-medium">
                    ✓ የተመረጠ ፋይል: {audioFileName}
                  </div>
                )}
                {audioError && (
                  <div className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded-xl border border-red-500/30">
                    ⚠ {audioError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#315C48] text-white text-xs font-bold hover:bg-[#427A60] transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={Boolean(audioError)}
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
                  {m.status !== 'current_study' && onArchiveMezmur && (
                    <button
                      onClick={() => {
                        if (window.confirm(language === 'am' ? `"${m.titleAm}" ከመዝሙር ማከማቻው ይወገድ?` : `Archive "${m.titleEn}" from library?`)) {
                          onArchiveMezmur(m.id);
                        }
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title={language === 'am' ? 'አስወግድ / ሰርዝ' : 'Archive / Remove'}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
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
