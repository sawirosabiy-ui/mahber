import {
  Gathering,
  AttendanceRecord,
  ActualAttendanceStatus,
  GatheringAttendanceEntry,
  AuditLogEntry,
  MemberContribution,
  ContributionPeriod,
  PaymentEntry,
  PaymentMonthRecord,
  Mezmur,
  MezmurSuggestion,
  MezmurStudy,
  PracticeSession,
  CalculatedStudyStatus,
  MemberStudyParticipation,
  MezmurParticipationSummary,
  RoomMessage,
  MessageReplyInfo,
  Announcement,
  PrayerRequest,
  NotificationPreference,
  MahberNotification,
  AbsenceReasonCategory,
  AdminReviewStatus,
  MahberHistoryGathering,
  GatheringPhoto,
  HistoricalPresentMember,
  PaintingRotationState,
  HostingSwapRecord,
  PaintingHandoverRecord,
  PenaltyRecord,
  TransportCollection,
  TransportPayment,
  SharedFundTransaction,
  SpendingProposal,
  ProposalVote,
  MemberInvitation,
  Member,
  FinancialAccount,
  FinancialAccountId,
  FinancialLedgerEntry,
  FinancialLedgerEntryType,
  SplitPaymentAllocation,
  SacredObjectRecord,
  SacredObjectCustodyRecord,
  GatheringHostRecord,
  ProposalGovernanceRecord,
  ReminderQueueEntry,
  TelegramDispatchLog,
  MezmurAudioFileRecord,
  MemberOffboardingRecord,
  OfflineSyncIntent,
} from '../types';

export const ADMIN_MASTER_PASSWORD = 'mahber@27';

import {
  INITIAL_GATHERING,
  INITIAL_ATTENDANCE,
  INITIAL_CONTRIBUTIONS,
  INITIAL_MEZMURS,
  INITIAL_SUGGESTIONS,
  INITIAL_STUDIES,
  INITIAL_PRACTICES,
  INITIAL_ROOM_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_PRAYER_REQUESTS,
  DEFAULT_NOTIFICATION_PREFERENCE,
  INITIAL_HISTORY,
  INITIAL_MEMBERS,
  INITIAL_PAINTING_ROTATION,
  INITIAL_PENALTIES,
  INITIAL_TRANSPORT_COLLECTIONS,
  INITIAL_SHARED_FUND_TRANSACTIONS,
  INITIAL_SPENDING_PROPOSALS,
} from '../data/mockData';
import {
  getNextMahberProjectedDate,
  getGatheringTimestamps,
  isEthiopianLeapYear,
} from '../utils/ethiopianCalendar';

// Configurable activity window for "Active" study (in days)
export const STUDY_ACTIVITY_WINDOW_DAYS = 7;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_AUDIO_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB max

// Storage keys
const KEY_GATHERINGS = 'mahber_gatherings_v3';
const KEY_ATTENDANCE = 'mahber_attendance_v3';
const KEY_ACTUAL_ATTENDANCE = 'mahber_actual_attendance_v1';
const KEY_AUDIT_LOGS = 'mahber_audit_logs_v1';
const KEY_PERIODS = 'mahber_periods_v4';
const KEY_PAYMENTS = 'mahber_payments_v4';
const KEY_MEZMURS = 'mahber_mezmurs_v3';
const KEY_SUGGESTIONS = 'mahber_mezmur_suggestions_v4';
const KEY_STUDIES = 'mahber_mezmur_studies_v4';
const KEY_PRACTICES = 'mahber_mezmur_practices_v4';
const KEY_FAVORITES = 'mahber_mezmur_favorites_v4';
const KEY_MESSAGES = 'mahber_messages_v5';
const KEY_READ_STATES = 'mahber_read_states_v5';
const KEY_ANNOUNCEMENTS = 'mahber_announcements_v5';
const KEY_PRAYERS = 'mahber_prayers_v5';
const KEY_NOTIF_PREFS = 'mahber_notif_prefs_v5';
const KEY_HISTORY = 'mahber_history_v3';
const KEY_PAINTING_ROTATION = 'mahber_rotation_v1';
const KEY_PENALTIES = 'mahber_penalties_v1';
const KEY_TRANSPORT = 'mahber_transport_v1';
const KEY_SHARED_FUND = 'mahber_shared_fund_v1';
const KEY_PROPOSALS = 'mahber_proposals_v1';
const KEY_INVITATIONS = 'mahber_invitations_v1';
const KEY_MEMBERS = 'mahber_members_v2';
const KEY_FINANCIAL_ACCOUNTS = 'mahber_financial_accounts_v1';
const KEY_FINANCIAL_LEDGER = 'mahber_financial_ledger_entries_v1';
const KEY_SACRED_OBJECTS = 'mahber_sacred_objects_v1';
const KEY_CUSTODY_HISTORY = 'mahber_sacred_custody_v1';
const KEY_GATHERING_HOSTS = 'mahber_gathering_hosts_v1';
const KEY_PROPOSAL_GOVERNANCE = 'mahber_proposal_governance_v1';
const KEY_REMINDER_QUEUE = 'mahber_reminder_queue_v1';
const KEY_TELEGRAM_LOG = 'mahber_telegram_log_v1';
const KEY_OFFBOARDING_RECORDS = 'mahber_offboarding_v1';
const KEY_AUDIO_METADATA = 'mahber_audio_files_v1';
const KEY_OFFLINE_INTENTS = 'mahber_offline_intents_v1';
const KEY_PARTICIPATION_AUDIT = 'mahber_participation_audit_v1';

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-init-1',
    adminUserId: 'm1',
    adminName: 'ሳዊሮስ አብይ (Sawiros)',
    action: 'System Initialized & Security Policies Configured',
    actionAm: 'የመድኃኔዓለም ማኅበር ስርዓት እና የደህንነት ደንቦች ተዘጋጁ',
    targetType: 'system',
    details: '11-Member roster initialized, fine-grained RBAC active',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'audit-init-2',
    adminUserId: 'm2',
    adminName: 'ናትናኤል እንዳለ (Natnael)',
    action: 'Initial Gathering Scheduled for Meskerem 27',
    actionAm: 'የመስከረም 27 ወርሃዊ ማኅበር ተመደበ',
    targetType: 'gathering',
    details: 'Location: Bole, Time: 3:00 PM (15:00)',
    createdAt: '2026-10-02T10:30:00Z',
  },
];

const INITIAL_PERIODS: ContributionPeriod[] = [
  {
    id: 'per-meskerem-2019',
    name: 'Meskerem 2019',
    nameAm: 'መስከረም 2019',
    ethMonth: 'መስከረም',
    yearEth: '2019',
    expectedAmount: 100.0,
    status: 'active',
  },
  {
    id: 'per-tikimt-2018',
    name: 'Tikimt 2018',
    nameAm: 'ጥቅምት 2018',
    ethMonth: 'ጥቅምት',
    yearEth: '2018',
    expectedAmount: 100.0,
    status: 'closed',
  },
  {
    id: 'per-hidar-2018',
    name: 'Hidar 2018',
    nameAm: 'ኅዳር 2018',
    ethMonth: 'ኅዳር',
    yearEth: '2018',
    expectedAmount: 100.0,
    status: 'closed',
  },
];

const INITIAL_PAYMENTS: PaymentEntry[] = [
  { id: 'pay-1', memberId: 'm1', periodId: 'per-meskerem-2019', amount: 100, paymentDate: '27 መስከረም 2019', note: 'ሙሉ ክፍያ', createdAt: '2026-10-01' },
  { id: 'pay-2', memberId: 'm2', periodId: 'per-meskerem-2019', amount: 100, paymentDate: '27 መስከረም 2019', note: 'ሙሉ ክፍያ', createdAt: '2026-10-01' },
  { id: 'pay-3', memberId: 'm5', periodId: 'per-meskerem-2019', amount: 100, paymentDate: '27 መስከረም 2019', note: 'የውጭ ሀገር ክፍያ / Diaspora transfer', createdAt: '2026-10-02' },
  { id: 'pay-4', memberId: 'm6', periodId: 'per-meskerem-2019', amount: 100, paymentDate: '27 መስከረም 2019', note: 'ሙሉ ክፍያ', createdAt: '2026-10-02' },
  { id: 'pay-5', memberId: 'm10', periodId: 'per-meskerem-2019', amount: 100, paymentDate: '27 መስከረም 2019', note: 'ሙሉ ክፍያ', createdAt: '2026-10-03' },
];

class MahberService {
  // --- GATHERINGS ---
  getAllGatherings(): Gathering[] {
    const data = localStorage.getItem(KEY_GATHERINGS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [INITIAL_GATHERING];
      }
    }
    return [INITIAL_GATHERING];
  }

  // Dynamically returns the earliest scheduled future gathering
  getNextScheduledGathering(): Gathering | null {
    const all = this.getAllGatherings();
    const scheduled = all.filter((g) => g.status === 'scheduled');
    if (scheduled.length === 0) return null;
    return scheduled[0];
  }

  getNextGathering(): Gathering | null {
    return this.getNextScheduledGathering();
  }

  createGathering(data: Omit<Gathering, 'id'>): Gathering {
    const all = this.getAllGatherings();
    const newGathering: Gathering = {
      ...data,
      id: `g-${Date.now()}`,
      status: 'scheduled',
    };
    const updated = [newGathering, ...all];
    localStorage.setItem(KEY_GATHERINGS, JSON.stringify(updated));
    return newGathering;
  }

  updateGathering(gathering: Gathering): void {
    const all = this.getAllGatherings();
    const updated = all.map((g) => (g.id === gathering.id ? gathering : g));
    localStorage.setItem(KEY_GATHERINGS, JSON.stringify(updated));
  }

  completeGathering(
    gatheringId: string,
    memoryAm?: string,
    memory?: string,
    photos?: GatheringPhoto[]
  ): MahberHistoryGathering | null {
    const all = this.getAllGatherings();
    const target = all.find((g) => g.id === gatheringId);
    if (!target) return null;

    // Transition gathering to completed
    const updated = all.map((g) =>
      g.id === gatheringId ? { ...g, status: 'completed' as const } : g
    );
    localStorage.setItem(KEY_GATHERINGS, JSON.stringify(updated));

    // Derive attendees without private absence reasons
    const rawAttendance = this.getAllAttendanceRaw();
    const comingRecords = rawAttendance.filter(
      (a) => a.gatheringId === gatheringId && a.status === 'coming'
    );
    const presentMembers: HistoricalPresentMember[] = comingRecords
      .map((att) => {
        const mem = INITIAL_MEMBERS.find((m) => m.id === att.memberId);
        if (!mem) return null;
        return {
          id: mem.id,
          name: mem.name,
          amharicName: mem.amharicName,
          avatarUrl: mem.avatarUrl,
        };
      })
      .filter((m): m is HistoricalPresentMember => m !== null);

    // Derive current active Mezmur
    const currentM = this.getCurrentStudyMezmur() || this.getMezmurs()[0];

    // Append to Mahber history
    const history = this.getHistory();
    const newHist: MahberHistoryGathering = {
      id: `hist-${Date.now()}`,
      gatheringId,
      ethDate: target.ethDate,
      gregDate: target.gregDate,
      yearEth: '2019',
      monthNameAm: target.ethDate.split(' ')[1] || 'መስከረም',
      monthNameEn: 'Meskerem',
      location: target.location,
      locationDetails: target.locationDetails,
      attendingCount: presentMembers.length,
      totalCount: INITIAL_MEMBERS.length,
      presentMembers,
      mezmurId: currentM?.id,
      mezmurAm: currentM?.titleAm || 'እመቤታችን ማርያም',
      mezmurEn: currentM?.titleEn || 'Emebetachin Mariam',
      notesAm: target.notes || 'ማኅበሩ በበረከት ተጠናቀቀ።',
      notesEn: target.notes || 'Gathering blessed and completed.',
      memoryAm: memoryAm || 'የተባረከ ምሽት ነበር። በመዝሙር እና በጸሎት አሳለፍን።',
      memory: memory || 'A blessed gathering spent in chanting and prayer.',
      photos: photos || [],
      imageUrl: target.imageUrl,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(KEY_HISTORY, JSON.stringify([newHist, ...history]));
    return newHist;
  }

  // Update gathering memory (Admin only)
  updateGatheringMemory(
    historyId: string,
    memoryAm: string,
    memory?: string
  ): MahberHistoryGathering[] {
    const all = this.getHistory();
    const updated = all.map((h) =>
      h.id === historyId ? { ...h, memoryAm, memory: memory || memoryAm } : h
    );
    localStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
    return updated;
  }

  // Add photo to gathering history (Admin only)
  addGatheringPhoto(
    historyId: string,
    photoUrl: string,
    captionAm?: string,
    caption?: string,
    uploaderId?: string
  ): MahberHistoryGathering[] {
    const all = this.getHistory();
    const updated = all.map((h) => {
      if (h.id !== historyId) return h;
      const currentPhotos = h.photos || [];
      if (currentPhotos.length >= 5) return h; // Max 5 photos
      const newPhoto: GatheringPhoto = {
        id: `photo-${Date.now()}`,
        url: photoUrl,
        captionAm,
        caption,
        uploadedBy: uploaderId,
        createdAt: new Date().toISOString(),
      };
      return { ...h, photos: [...currentPhotos, newPhoto] };
    });
    localStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
    return updated;
  }

  cancelGathering(gatheringId: string): void {
    const all = this.getAllGatherings();
    const updated = all.map((g) =>
      g.id === gatheringId ? { ...g, status: 'cancelled' as const } : g
    );
    localStorage.setItem(KEY_GATHERINGS, JSON.stringify(updated));
  }

  // --- ATTENDANCE ---
  getAllAttendanceRaw(): AttendanceRecord[] {
    const data = localStorage.getItem(KEY_ATTENDANCE);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_ATTENDANCE;
      }
    }
    return INITIAL_ATTENDANCE;
  }

  // Enforces privacy: normal members CANNOT see other members' sensitive absence reasons
  getAttendanceForUser(requesterId: string, isAdmin: boolean): AttendanceRecord[] {
    const raw = this.getAllAttendanceRaw();
    if (isAdmin) return raw;

    return raw.map((record) => {
      if (record.memberId === requesterId) {
        return record;
      }
      return {
        id: record.id,
        gatheringId: record.gatheringId,
        memberId: record.memberId,
        status: record.status,
        updatedAt: record.updatedAt,
      };
    });
  }

  submitAttendance(
    gatheringId: string,
    memberId: string,
    status: 'coming' | 'cant_come',
    privateReason?: AbsenceReasonCategory,
    privateNote?: string
  ): AttendanceRecord[] {
    const all = this.getAllAttendanceRaw();
    const existingIndex = all.findIndex(
      (a) => a.gatheringId === gatheringId && a.memberId === memberId
    );

    const updatedRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? all[existingIndex].id : `att-${Date.now()}`,
      gatheringId,
      memberId,
      status,
      privateReason: status === 'cant_come' ? privateReason : undefined,
      privateNote: status === 'cant_come' ? privateNote : undefined,
      adminReviewStatus: status === 'cant_come' ? 'pending' : undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    let updatedList: AttendanceRecord[];
    if (existingIndex >= 0) {
      updatedList = [...all];
      updatedList[existingIndex] = updatedRecord;
    } else {
      updatedList = [...all, updatedRecord];
    }

    localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(updatedList));
    return updatedList;
  }

  adminReviewAbsence(attendanceId: string, reviewStatus: AdminReviewStatus): AttendanceRecord[] {
    const all = this.getAllAttendanceRaw();
    const updatedList = all.map((item) =>
      item.id === attendanceId ? { ...item, adminReviewStatus: reviewStatus } : item
    );
    localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(updatedList));
    return updatedList;
  }

  // --- CONTRIBUTION PERIODS & PAYMENTS ---
  getContributionPeriods(): ContributionPeriod[] {
    const data = localStorage.getItem(KEY_PERIODS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_PERIODS;
      }
    }
    return INITIAL_PERIODS;
  }

  createContributionPeriod(period: Omit<ContributionPeriod, 'id'>): ContributionPeriod {
    const all = this.getContributionPeriods();
    const newPeriod: ContributionPeriod = {
      ...period,
      id: `per-${Date.now()}`,
    };
    const updated = [newPeriod, ...all];
    localStorage.setItem(KEY_PERIODS, JSON.stringify(updated));
    return newPeriod;
  }

  getAllPayments(): PaymentEntry[] {
    const data = localStorage.getItem(KEY_PAYMENTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_PAYMENTS;
      }
    }
    return INITIAL_PAYMENTS;
  }

  // Accurate multi-payment ledger calculation for a specific member
  getMemberContribution(memberId: string): MemberContribution {
    const periods = this.getContributionPeriods();
    const allPayments = this.getAllPayments().filter((p) => p.memberId === memberId && !p.isVoided);

    const activePeriod = periods.find((p) => p.status === 'active') || periods[0];
    const expectedForMonth = activePeriod ? activePeriod.expectedAmount : 500;

    const history: PaymentMonthRecord[] = periods.map((period) => {
      const periodPayments = allPayments.filter((p) => p.periodId === period.id);
      const totalPaid = periodPayments.reduce((sum, p) => sum + Math.round(p.amount * 100) / 100, 0);
      const outstanding = Math.max(0, period.expectedAmount - totalPaid);

      const status: 'paid' | 'partial' | 'unpaid' =
        totalPaid >= period.expectedAmount
          ? 'paid'
          : totalPaid > 0
          ? 'partial'
          : 'unpaid';

      return {
        id: `summary-${period.id}-${memberId}`,
        monthKey: period.id,
        monthNameAm: period.nameAm,
        monthNameEn: period.name,
        yearEth: period.yearEth,
        expected: period.expectedAmount,
        paid: totalPaid,
        status,
        paidDate: periodPayments[0]?.paymentDate,
        note: periodPayments.map((p) => p.note).filter(Boolean).join('; ') || undefined,
        payments: periodPayments,
      };
    });

    const currentPeriodSummary = history.find((h) => h.monthKey === activePeriod?.id);
    const thisMonthPaid = currentPeriodSummary?.paid || 0;
    const thisMonthOutstanding = currentPeriodSummary
      ? Math.max(0, expectedForMonth - thisMonthPaid)
      : expectedForMonth;

    return {
      memberId,
      thisMonthExpected: expectedForMonth,
      thisMonthPaid,
      totalOutstanding: thisMonthOutstanding,
      history,
    };
  }

  // Admin records a payment (supporting partial payments)
  recordPayment(
    memberId: string,
    periodId: string,
    amount: number,
    paymentDate: string,
    note?: string,
    recordedBy?: string
  ): PaymentEntry {
    const payments = this.getAllPayments();
    const newEntry: PaymentEntry = {
      id: `pay-${Date.now()}`,
      memberId,
      periodId,
      amount: Math.round(amount * 100) / 100,
      paymentDate: paymentDate || '27 መስከረም 2019',
      note,
      isVoided: false,
      recordedBy,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...payments];
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(updated));
    return newEntry;
  }

  // Admin records advance contribution allocated across future months
  recordAdvancePayment(
    memberId: string,
    totalAmount: number,
    paymentDate: string = '27 መስከረም 2019',
    note?: string,
    recordedBy?: string
  ): PaymentEntry[] {
    const periods = this.getContributionPeriods();
    let remaining = Math.round(totalAmount * 100) / 100;
    const recordedEntries: PaymentEntry[] = [];

    // Allocate sequentially starting from the active period down the periods list
    for (const period of periods) {
      if (remaining <= 0) break;
      const existingPayments = this.getAllPayments().filter(
        (p) => p.memberId === memberId && p.periodId === period.id && !p.isVoided
      );
      const alreadyPaid = existingPayments.reduce((s, p) => s + p.amount, 0);
      const neededForPeriod = Math.max(0, period.expectedAmount - alreadyPaid);

      if (neededForPeriod > 0) {
        const alloc = Math.min(remaining, neededForPeriod);
        const entry = this.recordPayment(
          memberId,
          period.id,
          alloc,
          paymentDate,
          note ? `${note} (${period.nameAm})` : `ቅድመ ክፍያ (${period.nameAm})`,
          recordedBy
        );
        recordedEntries.push(entry);
        remaining = Math.round((remaining - alloc) * 100) / 100;
      }
    }

    if (remaining > 0) {
      const activeOrFirst = periods.find((p) => p.status === 'active') || periods[0];
      const entry = this.recordPayment(
        memberId,
        activeOrFirst.id,
        remaining,
        paymentDate,
        note ? `${note} (ተጨማሪ ቅድመ ክፍያ)` : 'ተጨማሪ ቅድመ ክፍያ',
        recordedBy
      );
      recordedEntries.push(entry);
    }

    return recordedEntries;
  }

  // Admin edits a payment (recalculates immediately)
  editPayment(
    paymentId: string,
    newAmount: number,
    newDate?: string,
    newNote?: string
  ): void {
    const payments = this.getAllPayments();
    const updated = payments.map((p) => {
      if (p.id !== paymentId) return p;
      return {
        ...p,
        amount: Math.round(newAmount * 100) / 100,
        paymentDate: newDate || p.paymentDate,
        note: newNote !== undefined ? newNote : p.note,
      };
    });
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(updated));
  }

  // Admin voids a payment without destructive deletion
  voidPayment(paymentId: string): void {
    const payments = this.getAllPayments();
    const updated = payments.map((p) =>
      p.id === paymentId ? { ...p, isVoided: true } : p
    );
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(updated));
  }

  // Calculate overall Mahber financial totals across all 11 members
  getAdminFinancialOverview(activeMembersCount: number = 11): {
    expectedTotal: number;
    collectedTotal: number;
    outstandingTotal: number;
  } {
    const periods = this.getContributionPeriods();
    const activePeriod = periods.find((p) => p.status === 'active') || periods[0];
    const expectedPerMember = activePeriod ? activePeriod.expectedAmount : 100;
    const expectedTotal = expectedPerMember * activeMembersCount;

    const payments = this.getAllPayments().filter(
      (p) => !p.isVoided && (!activePeriod || p.periodId === activePeriod.id)
    );
    const collectedTotal = payments.reduce((sum, p) => sum + Math.round(p.amount * 100) / 100, 0);
    const outstandingTotal = Math.max(0, expectedTotal - collectedTotal);

    return {
      expectedTotal,
      collectedTotal,
      outstandingTotal,
    };
  }

  // Legacy compatibility helper for initial mock structures
  getAllContributions(): Record<string, MemberContribution> {
    const result: Record<string, MemberContribution> = {};
    INITIAL_MEMBERS.forEach((m) => {
      result[m.id] = this.getMemberContribution(m.id);
    });
    return result;
  }

  adminRecordPayment(
    memberId: string,
    amount: number,
    _monthKey: string,
    _monthNameAm: string,
    _monthNameEn: string,
    _yearEth: string,
    note?: string
  ): Record<string, MemberContribution> {
    const periods = this.getContributionPeriods();
    const activePeriod = periods.find((p) => p.status === 'active') || periods[0];
    this.recordPayment(memberId, activePeriod.id, amount, '27 መስከረም 2019', note);
    return this.getAllContributions();
  }

  // --- MEZMURS ---
  getMezmurs(): Mezmur[] {
    const data = localStorage.getItem(KEY_MEZMURS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_MEZMURS;
      }
    }
    return INITIAL_MEZMURS;
  }

  setCurrentStudyMezmur(mezmurId: string): Mezmur[] {
    const all = this.getMezmurs();
    const updated = all.map((m) => ({
      ...m,
      status: m.id === mezmurId ? ('current_study' as const) : m.status === 'current_study' ? ('library' as const) : m.status,
    }));
    localStorage.setItem(KEY_MEZMURS, JSON.stringify(updated));
    return updated;
  }

  getCurrentStudyMezmur(): Mezmur | null {
    const all = this.getMezmurs();
    return all.find((m) => m.status === 'current_study') || all[0] || null;
  }

  addMezmur(mezmur: Omit<Mezmur, 'id'>): Mezmur[] {
    const all = this.getMezmurs();
    const newMezmur: Mezmur = {
      ...mezmur,
      id: `mez-${Date.now()}`,
    };
    const updated = [newMezmur, ...all];
    localStorage.setItem(KEY_MEZMURS, JSON.stringify(updated));
    return updated;
  }

  updateMezmur(mezmur: Mezmur): Mezmur[] {
    const all = this.getMezmurs();
    const updated = all.map((m) => (m.id === mezmur.id ? mezmur : m));
    localStorage.setItem(KEY_MEZMURS, JSON.stringify(updated));
    return updated;
  }

  archiveMezmur(mezmurId: string): Mezmur[] {
    const all = this.getMezmurs();
    const updated = all.map((m) =>
      m.id === mezmurId ? { ...m, isArchived: true, status: 'library' as const } : m
    );
    localStorage.setItem(KEY_MEZMURS, JSON.stringify(updated));
    return updated;
  }

  // --- MEZMUR SUGGESTIONS ---
  getSuggestions(): MezmurSuggestion[] {
    const data = localStorage.getItem(KEY_SUGGESTIONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_SUGGESTIONS;
      }
    }
    return INITIAL_SUGGESTIONS;
  }

  submitSuggestion(
    userId: string,
    userName: string,
    userAmharicName: string,
    titleAm: string,
    title?: string,
    note?: string
  ): MezmurSuggestion {
    const all = this.getSuggestions();
    const newSug: MezmurSuggestion = {
      id: `sug-${Date.now()}`,
      mahberId: 'mahber-1',
      suggestedBy: userId,
      suggestedByName: userName,
      suggestedByAmharicName: userAmharicName,
      title: title || titleAm,
      titleAm,
      note,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [newSug, ...all];
    localStorage.setItem(KEY_SUGGESTIONS, JSON.stringify(updated));
    return newSug;
  }

  reviewSuggestion(
    suggestionId: string,
    reviewerId: string,
    decision: 'approved' | 'rejected'
  ): { suggestions: MezmurSuggestion[]; newMezmur?: Mezmur } {
    const all = this.getSuggestions();
    const target = all.find((s) => s.id === suggestionId);
    let newMezmur: Mezmur | undefined;

    const updated = all.map((s) => {
      if (s.id === suggestionId) {
        return {
          ...s,
          status: decision,
          reviewedBy: reviewerId,
          reviewedAt: new Date().toISOString(),
        };
      }
      return s;
    });
    localStorage.setItem(KEY_SUGGESTIONS, JSON.stringify(updated));

    if (decision === 'approved' && target) {
      const added = this.addMezmur({
        titleAm: target.titleAm,
        titleEn: target.title,
        categoryAm: 'አጠቃላይ',
        categoryEn: 'General',
        category: 'other',
        descriptionAm: target.note,
        status: 'new',
        duration: '03:00',
        dateAdded: new Date().toISOString().split('T')[0],
        voicesCount: 4,
        stanzas: [
          {
            stanzaNumber: 1,
            titleAm: 'ምዕራፍ 1',
            titleEn: 'Stanza 1',
            textAm: `${target.titleAm}\nስለ ስምህ እንዘምራለን ለዘላለም።`,
          },
        ],
      });
      newMezmur = added[0];
    }

    return { suggestions: updated, newMezmur };
  }

  // --- MEZMUR STUDIES ---
  getStudies(): MezmurStudy[] {
    const data = localStorage.getItem(KEY_STUDIES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_STUDIES;
      }
    }
    return INITIAL_STUDIES;
  }

  getUserStudy(userId: string, mezmurId: string): MezmurStudy | null {
    const all = this.getStudies();
    return all.find((s) => s.userId === userId && s.mezmurId === mezmurId) || null;
  }

  startStudy(userId: string, mezmurId: string, notes?: string): MezmurStudy {
    const all = this.getStudies();
    const existing = all.find((s) => s.userId === userId && s.mezmurId === mezmurId);
    if (existing) {
      const updated = all.map((s) =>
        s.id === existing.id
          ? { ...s, status: 'active' as const, updatedAt: new Date().toISOString(), notes: notes ?? s.notes }
          : s
      );
      localStorage.setItem(KEY_STUDIES, JSON.stringify(updated));
      return { ...existing, status: 'active', notes: notes ?? existing.notes };
    }

    const newStudy: MezmurStudy = {
      id: `std-${Date.now()}`,
      mezmurId,
      userId,
      startedAt: new Date().toISOString(),
      status: 'active',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newStudy, ...all];
    localStorage.setItem(KEY_STUDIES, JSON.stringify(updated));
    return newStudy;
  }

  completeStudy(studyId: string, userId: string): MezmurStudy | null {
    const all = this.getStudies();
    const target = all.find((s) => s.id === studyId && s.userId === userId);
    if (!target) return null;

    const updated = all.map((s) =>
      s.id === studyId ? { ...s, status: 'completed' as const, updatedAt: new Date().toISOString() } : s
    );
    localStorage.setItem(KEY_STUDIES, JSON.stringify(updated));
    return { ...target, status: 'completed', updatedAt: new Date().toISOString() };
  }

  // --- PRACTICE SESSIONS & SPAM PROTECTION ---
  getPractices(): PracticeSession[] {
    const data = localStorage.getItem(KEY_PRACTICES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_PRACTICES;
      }
    }
    return INITIAL_PRACTICES;
  }

  getUserPractices(userId: string, studyId?: string): PracticeSession[] {
    const all = this.getPractices();
    return all.filter((p) => p.userId === userId && (!studyId || p.studyId === studyId));
  }

  hasPracticedToday(userId: string, studyId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const all = this.getPractices();
    return all.some((p) => p.userId === userId && p.studyId === studyId && p.practiceDate === today);
  }

  recordPractice(
    userId: string,
    studyId: string,
    note?: string,
    durationMinutes?: number
  ): { success: boolean; practice?: PracticeSession; error?: string } {
    const today = new Date().toISOString().split('T')[0];
    const all = this.getPractices();

    // SPAM PROTECTION: 1 practice per user per study per calendar day
    const alreadyDone = all.some(
      (p) => p.userId === userId && p.studyId === studyId && p.practiceDate === today
    );
    if (alreadyDone) {
      return {
        success: false,
        error: 'ለዛሬ ልምምድ አስመዝግበዋል፤ ነገ እንደገና መለማመድ ይችላሉ። / You have already recorded practice for today.',
      };
    }

    const newPractice: PracticeSession = {
      id: `prac-${Date.now()}`,
      studyId,
      userId,
      practiceDate: today,
      practicedAt: new Date().toISOString(),
      durationMinutes,
      note,
      isPrivate: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPractice, ...all];
    localStorage.setItem(KEY_PRACTICES, JSON.stringify(updated));
    return { success: true, practice: newPractice };
  }

  // --- DYNAMIC STUDY STATUS CALCULATION ---
  // Calculates: not_started | started | active | completed
  calculateUserStudyStatus(userId: string, mezmurId: string): CalculatedStudyStatus {
    const study = this.getUserStudy(userId, mezmurId);
    if (!study) return 'not_started';
    if (study.status === 'completed') return 'completed';

    const practices = this.getUserPractices(userId, study.id);
    if (practices.length === 0) return 'started';

    // Sort descending by date
    const sorted = [...practices].sort((a, b) => b.practiceDate.localeCompare(a.practiceDate));
    const latestDateStr = sorted[0].practiceDate;
    const latestDate = new Date(latestDateStr).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - latestDate) / (1000 * 60 * 60 * 24);

    if (daysDiff <= STUDY_ACTIVITY_WINDOW_DAYS) {
      return 'active';
    }
    return 'started';
  }

  // --- ADMIN STUDY PARTICIPATION SUMMARY ---
  getMezmurParticipationSummary(mezmurId: string): MezmurParticipationSummary {
    const mezmur = this.getMezmurs().find((m) => m.id === mezmurId);
    const titleAm = mezmur?.titleAm || 'መዝሙር';
    const titleEn = mezmur?.titleEn || 'Mezmur';

    const members = INITIAL_MEMBERS;
    const participations: MemberStudyParticipation[] = members.map((mem) => {
      const study = this.getUserStudy(mem.id, mezmurId);
      const calculatedStatus = this.calculateUserStudyStatus(mem.id, mezmurId);
      const practices = study ? this.getUserPractices(mem.id, study.id) : [];
      const sortedPractices = [...practices].sort((a, b) => b.practiceDate.localeCompare(a.practiceDate));
      const lastDate = sortedPractices.length > 0 ? sortedPractices[0].practiceDate : undefined;

      return {
        memberId: mem.id,
        memberName: mem.name,
        memberAmharicName: mem.amharicName,
        avatarUrl: mem.avatarUrl,
        studyId: study?.id,
        calculatedStatus,
        startedAt: study?.startedAt,
        lastPracticedDate: lastDate,
        totalPracticeCount: practices.length,
        isCompleted: study?.status === 'completed',
      };
    });

    const activeCount = participations.filter((p) => p.calculatedStatus === 'active').length;
    const startedCount = participations.filter((p) => p.calculatedStatus === 'started').length;
    const notStartedCount = participations.filter((p) => p.calculatedStatus === 'not_started').length;
    const completedCount = participations.filter((p) => p.calculatedStatus === 'completed').length;

    return {
      mezmurId,
      mezmurTitleAm: titleAm,
      mezmurTitleEn: titleEn,
      totalMembers: members.length,
      activeCount,
      startedCount,
      notStartedCount,
      completedCount,
      memberParticipations: participations,
    };
  }

  // --- FAVORITES ---
  getFavorites(userId: string): string[] {
    const data = localStorage.getItem(KEY_FAVORITES);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed[userId] || [];
      } catch {
        return [];
      }
    }
    return [];
  }

  toggleFavorite(userId: string, mezmurId: string): string[] {
    const data = localStorage.getItem(KEY_FAVORITES);
    let favMap: Record<string, string[]> = {};
    if (data) {
      try {
        favMap = JSON.parse(data);
      } catch {
        favMap = {};
      }
    }

    const userFavs = favMap[userId] || [];
    const exists = userFavs.includes(mezmurId);
    const updated = exists ? userFavs.filter((id) => id !== mezmurId) : [...userFavs, mezmurId];
    favMap[userId] = updated;
    localStorage.setItem(KEY_FAVORITES, JSON.stringify(favMap));
    return updated;
  }

  // --- ROOM MESSAGES ---
  getMessages(): RoomMessage[] {
    const data = localStorage.getItem(KEY_MESSAGES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_ROOM_MESSAGES;
      }
    }
    return INITIAL_ROOM_MESSAGES;
  }

  sendMessage(
    memberId: string,
    memberName: string,
    memberAmharicName: string,
    memberAvatar: string,
    isAdmin: boolean,
    text: string,
    type: 'chat' | 'prayer_request' | 'announcement' = 'chat',
    replyTo?: MessageReplyInfo,
    attachmentUrl?: string
  ): { success: boolean; message?: RoomMessage; error?: string } {
    if (!text.trim() && !attachmentUrl) {
      return { success: false, error: 'መልዕክት ባዶ መሆን አይችልም። / Message cannot be empty.' };
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return {
        success: false,
        error: `መልዕክት ከ ${MAX_MESSAGE_LENGTH} ፊደላት መብለጥ አይችልም። / Message exceeds ${MAX_MESSAGE_LENGTH} characters.`,
      };
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'ከሰዓት' : 'ጠዋት'}`;

    // Unique collision-proof ID (protects when 2 different members text at the exact same time)
    const uniqueRand = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 9);

    const newMsg: RoomMessage = {
      id: `msg-${Date.now()}-${uniqueRand}`,
      memberId,
      memberName,
      memberAmharicName,
      memberAvatar,
      isAdmin,
      type,
      text: text.trim(),
      attachmentUrl,
      replyTo,
      timestamp: timeStr,
      createdAt: now.toISOString(),
      reactions: [
        { emoji: '🙏', count: 0, memberIds: [] },
        { emoji: '❤️', count: 0, memberIds: [] },
        { emoji: '✝️', count: 0, memberIds: [] },
      ],
    };

    // Re-read storage immediately before saving to prevent overwriting concurrent messages
    const all = this.getMessages();
    if (!all.some((m) => m.id === newMsg.id)) {
      const updated = [...all, newMsg];
      localStorage.setItem(KEY_MESSAGES, JSON.stringify(updated));
    }

    // Broadcast across windows / tabs for real-time concurrent chat sync
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('mahber_chat_channel');
          bc.postMessage({ type: 'NEW_MESSAGE', message: newMsg });
          bc.close();
        }
        window.dispatchEvent(new CustomEvent('mahber_chat_updated', { detail: newMsg }));
      } catch {
        // Fallback
      }
    }

    return { success: true, message: newMsg };
  }

  editMessage(
    messageId: string,
    userId: string,
    newText: string
  ): { success: boolean; error?: string } {
    if (!newText.trim()) {
      return { success: false, error: 'መልዕክት ባዶ መሆን አይችልም።' };
    }
    if (newText.length > MAX_MESSAGE_LENGTH) {
      return { success: false, error: `መልዕክት ከ ${MAX_MESSAGE_LENGTH} ፊደላት መብለጥ አይችልም።` };
    }

    const all = this.getMessages();
    const target = all.find((m) => m.id === messageId);
    if (!target) return { success: false, error: 'Message not found' };

    // Member can ONLY edit own message
    if (target.memberId !== userId) {
      return { success: false, error: 'ሌላ አባል የጻፈውን መልዕክት ማስተካከል አይቻልም። / Cannot edit another member\'s message.' };
    }

    const updated = all.map((m) =>
      m.id === messageId
        ? { ...m, text: newText.trim(), editedAt: new Date().toISOString() }
        : m
    );
    localStorage.setItem(KEY_MESSAGES, JSON.stringify(updated));
    return { success: true };
  }

  deleteMessage(
    messageId: string,
    userId: string,
    isAdmin: boolean
  ): { success: boolean; error?: string } {
    const all = this.getMessages();
    const target = all.find((m) => m.id === messageId);
    if (!target) return { success: false, error: 'Message not found' };

    // Member can only delete own message; Admin can moderate
    if (target.memberId !== userId && !isAdmin) {
      return { success: false, error: 'የሌላ አባል መልዕክት መሰረዝ አይቻልም። / Cannot delete another member\'s message.' };
    }

    const updated = all.map((m) => {
      if (m.id === messageId) {
        return {
          ...m,
          text: isAdmin && target.memberId !== userId ? 'ይህ መልዕክት በአስተዳዳሪ ተሰርዟል። (Removed by admin)' : 'ይህ መልዕክት ተሰርዟል። (Message deleted)',
          deletedAt: new Date().toISOString(),
          isRemovedByAdmin: isAdmin && target.memberId !== userId,
        };
      }
      return m;
    });

    localStorage.setItem(KEY_MESSAGES, JSON.stringify(updated));
    return { success: true };
  }

  toggleReaction(messageId: string, memberId: string, emoji: '🙏' | '❤️' | '✝️'): RoomMessage[] {
    const all = this.getMessages();
    const updated = all.map((msg) => {
      if (msg.id !== messageId) return msg;

      const reactions = msg.reactions.map((r) => {
        if (r.emoji !== emoji) return r;
        const exists = r.memberIds.includes(memberId);
        const newMemberIds = exists
          ? r.memberIds.filter((id) => id !== memberId)
          : [...r.memberIds, memberId];
        return {
          ...r,
          count: newMemberIds.length,
          memberIds: newMemberIds,
        };
      });

      return { ...msg, reactions };
    });

    localStorage.setItem(KEY_MESSAGES, JSON.stringify(updated));
    return updated;
  }

  // --- UNREAD STATE TRACKING ---
  getUnreadCount(userId: string): number {
    const messages = this.getMessages().filter((m) => !m.deletedAt);
    const readStateStr = localStorage.getItem(`${KEY_READ_STATES}_${userId}`);
    if (!readStateStr) {
      // Default: count messages not sent by user
      return messages.filter((m) => m.memberId !== userId).length;
    }

    try {
      const readState = JSON.parse(readStateStr);
      const lastReadTime = new Date(readState.lastReadAt).getTime();
      return messages.filter(
        (m) => m.memberId !== userId && new Date(m.createdAt || 0).getTime() > lastReadTime
      ).length;
    } catch {
      return 0;
    }
  }

  markRoomAsRead(userId: string): void {
    const messages = this.getMessages();
    const lastMsg = messages[messages.length - 1];
    const readState = {
      userId,
      lastReadMessageId: lastMsg ? lastMsg.id : null,
      lastReadAt: new Date().toISOString(),
    };
    localStorage.setItem(`${KEY_READ_STATES}_${userId}`, JSON.stringify(readState));
  }

  // --- ANNOUNCEMENTS ---
  getAnnouncements(): Announcement[] {
    const data = localStorage.getItem(KEY_ANNOUNCEMENTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_ANNOUNCEMENTS;
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  }

  createAnnouncement(
    createdBy: string,
    authorName: string,
    authorAmharicName: string,
    titleAm: string,
    bodyAm: string,
    title?: string,
    body?: string,
    isPinned: boolean = false,
    isImportant: boolean = false
  ): Announcement {
    const all = this.getAnnouncements();
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      mahberId: 'mahber-1',
      createdBy,
      authorName,
      authorAmharicName,
      title: title || titleAm,
      titleAm,
      body: body || bodyAm,
      bodyAm,
      isPinned,
      isImportant,
      publishedAt: new Date().toISOString(),
    };
    const updated = [newAnn, ...all];
    localStorage.setItem(KEY_ANNOUNCEMENTS, JSON.stringify(updated));
    return newAnn;
  }

  editAnnouncement(
    announcementId: string,
    titleAm: string,
    bodyAm: string,
    isPinned: boolean,
    isImportant: boolean
  ): Announcement[] {
    const all = this.getAnnouncements();
    const updated = all.map((a) =>
      a.id === announcementId
        ? { ...a, titleAm, bodyAm, isPinned, isImportant }
        : a
    );
    localStorage.setItem(KEY_ANNOUNCEMENTS, JSON.stringify(updated));
    return updated;
  }

  deleteAnnouncement(announcementId: string): Announcement[] {
    const all = this.getAnnouncements();
    const updated = all.filter((a) => a.id !== announcementId);
    localStorage.setItem(KEY_ANNOUNCEMENTS, JSON.stringify(updated));
    return updated;
  }

  // --- PRAYER REQUESTS ---
  getPrayerRequests(userId: string, isAdmin: boolean): PrayerRequest[] {
    const data = localStorage.getItem(KEY_PRAYERS);
    let all: PrayerRequest[] = INITIAL_PRAYER_REQUESTS;
    if (data) {
      try {
        all = JSON.parse(data);
      } catch {
        all = INITIAL_PRAYER_REQUESTS;
      }
    }

    // PRIVACY ENFORCEMENT:
    // If request is 'private', it can ONLY be seen by the author or the 2 admins!
    return all.filter((pr) => {
      if (pr.visibility === 'group') return true;
      if (pr.userId === userId || isAdmin) return true;
      return false;
    });
  }

  addPrayerRequest(
    userId: string,
    userName: string,
    userAmharicName: string,
    userAvatar: string,
    title: string,
    body: string,
    visibility: 'group' | 'private' = 'group'
  ): PrayerRequest {
    const data = localStorage.getItem(KEY_PRAYERS);
    let all: PrayerRequest[] = INITIAL_PRAYER_REQUESTS;
    if (data) {
      try {
        all = JSON.parse(data);
      } catch {
        all = INITIAL_PRAYER_REQUESTS;
      }
    }

    const newPr: PrayerRequest = {
      id: `pr-${Date.now()}`,
      mahberId: 'mahber-1',
      userId,
      userName,
      userAmharicName,
      userAvatar,
      title,
      body,
      visibility,
      status: 'active',
      prayerCount: 1, // Author starts
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newPr, ...all];
    localStorage.setItem(KEY_PRAYERS, JSON.stringify(updated));
    return newPr;
  }

  togglePrayerSupport(requestId: string, userId: string): PrayerRequest[] {
    const data = localStorage.getItem(KEY_PRAYERS);
    let all: PrayerRequest[] = INITIAL_PRAYER_REQUESTS;
    if (data) {
      try {
        all = JSON.parse(data);
      } catch {
        all = INITIAL_PRAYER_REQUESTS;
      }
    }

    const userPrayerKey = `prayer_reacted_${requestId}_${userId}`;
    const alreadyPrayed = localStorage.getItem(userPrayerKey) === 'true';

    const updated = all.map((pr) => {
      if (pr.id === requestId) {
        const count = alreadyPrayed ? Math.max(1, pr.prayerCount - 1) : pr.prayerCount + 1;
        return { ...pr, prayerCount: count };
      }
      return pr;
    });

    if (alreadyPrayed) {
      localStorage.removeItem(userPrayerKey);
    } else {
      localStorage.setItem(userPrayerKey, 'true');
    }

    localStorage.setItem(KEY_PRAYERS, JSON.stringify(updated));
    return updated;
  }

  markPrayerAnswered(requestId: string, userId: string): PrayerRequest[] {
    const data = localStorage.getItem(KEY_PRAYERS);
    let all: PrayerRequest[] = INITIAL_PRAYER_REQUESTS;
    if (data) {
      try {
        all = JSON.parse(data);
      } catch {
        all = INITIAL_PRAYER_REQUESTS;
      }
    }

    const updated = all.map((pr) =>
      pr.id === requestId && pr.userId === userId
        ? { ...pr, status: 'answered' as const, updatedAt: new Date().toISOString() }
        : pr
    );
    localStorage.setItem(KEY_PRAYERS, JSON.stringify(updated));
    return updated;
  }

  // --- NOTIFICATION PREFERENCES ---
  getNotificationPreferences(userId: string): NotificationPreference {
    const data = localStorage.getItem(`${KEY_NOTIF_PREFS}_${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return { ...DEFAULT_NOTIFICATION_PREFERENCE, userId };
      }
    }
    return { ...DEFAULT_NOTIFICATION_PREFERENCE, userId };
  }

  updateNotificationPreferences(
    userId: string,
    prefs: Partial<NotificationPreference>
  ): NotificationPreference {
    const current = this.getNotificationPreferences(userId);
    const updated: NotificationPreference = {
      ...current,
      ...prefs,
      userId,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${KEY_NOTIF_PREFS}_${userId}`, JSON.stringify(updated));
    return updated;
  }

  // --- IN-APP NOTIFICATION CENTER ---
  getInAppNotifications(userId: string): MahberNotification[] {
    const prefs = this.getNotificationPreferences(userId);
    const notifs: MahberNotification[] = [];

    // 1. Gathering reminder
    if (prefs.mahberReminders) {
      notifs.push({
        id: 'notif-gathering',
        type: 'mahber_reminder',
        title: '✝️ ቀጣይ ማኅበር',
        body: 'የሚቀጥለው ወርሃዊ ማኅበራችን በ 27 መስከረም 2019 በ 6:00 ከሰዓት በቦሌ ይካሄዳል።',
        dateEth: '27 መስከረም 2019',
        dateGreg: 'October 7, 2026',
        isRead: false,
        linkTab: 'home',
        createdAt: '2026-10-06T12:00:00Z',
      });
    }

    // 2. Mezmur study notification
    if (prefs.mezmurReminders) {
      const curMez = this.getCurrentStudyMezmur();
      if (curMez) {
        notifs.push({
          id: 'notif-mezmur',
          type: 'mezmur',
          title: '🎵 የጥናት መዝሙር',
          body: `ለሚቀጥለው ማኅበር «${curMez.titleAm}» ተመርጧል። አብረን እናጥና።`,
          dateEth: '27 መስከረም 2019',
          dateGreg: 'October 7, 2026',
          isRead: false,
          linkTab: 'mezmur',
          createdAt: '2026-10-05T09:00:00Z',
        });
      }
    }

    // 3. Announcements
    if (prefs.announcements) {
      const anns = this.getAnnouncements();
      if (anns.length > 0) {
        notifs.push({
          id: `notif-ann-${anns[0].id}`,
          type: 'announcement',
          title: `📌 ${anns[0].titleAm}`,
          body: anns[0].bodyAm,
          dateEth: '27 መስከረም 2019',
          dateGreg: 'October 6, 2026',
          isRead: false,
          linkTab: 'room',
          createdAt: anns[0].publishedAt,
        });
      }
    }

    return notifs;
  }

  // --- HISTORY ---
  getHistory(): MahberHistoryGathering[] {
    const data = localStorage.getItem(KEY_HISTORY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_HISTORY;
      }
    }
    return INITIAL_HISTORY;
  }

  // --- ACTUAL ATTENDANCE RECORDING (ADMIN BULK SAVE) ---
  getActualAttendance(gatheringId: string): Record<string, GatheringAttendanceEntry> {
    const data = localStorage.getItem(KEY_ACTUAL_ATTENDANCE);
    if (data) {
      try {
        const all: Record<string, Record<string, GatheringAttendanceEntry>> = JSON.parse(data);
        return all[gatheringId] || {};
      } catch {
        return {};
      }
    }
    return {};
  }

  saveActualAttendance(
    gatheringId: string,
    entries: Record<string, { status: ActualAttendanceStatus; note?: string }>,
    adminUserId?: string,
    adminName?: string
  ): void {
    let all: Record<string, Record<string, GatheringAttendanceEntry>> = {};
    const data = localStorage.getItem(KEY_ACTUAL_ATTENDANCE);
    if (data) {
      try {
        all = JSON.parse(data);
      } catch {
        all = {};
      }
    }

    const formatted: Record<string, GatheringAttendanceEntry> = {};
    const now = new Date().toISOString();
    Object.entries(entries).forEach(([memberId, entry]) => {
      formatted[memberId] = {
        memberId,
        status: entry.status,
        note: entry.note,
        updatedAt: now,
      };
    });

    all[gatheringId] = formatted;
    localStorage.setItem(KEY_ACTUAL_ATTENDANCE, JSON.stringify(all));

    // Auto-record audit log
    if (adminUserId && adminName) {
      const presentCount = Object.values(entries).filter((e) => e.status === 'PRESENT').length;
      const lateCount = Object.values(entries).filter((e) => e.status === 'LATE').length;
      const excusedCount = Object.values(entries).filter((e) => e.status === 'EXCUSED').length;
      const absentCount = Object.values(entries).filter((e) => e.status === 'ABSENT').length;

      this.logAuditEvent(
        adminUserId,
        adminName,
        `Recorded gathering attendance (Present: ${presentCount}, Late: ${lateCount}, Excused: ${excusedCount}, Absent: ${absentCount})`,
        `የማኅበሩ የተሳትፎ መዝገብ ተመዘገበ (የተገኙ: ${presentCount}፣ ያረፈዱ: ${lateCount}፣ በፈቃድ: ${excusedCount}፣ የቀሩ: ${absentCount})`,
        'attendance',
        gatheringId,
        `Gathering ID: ${gatheringId}`
      );
    }

    // Automatically sync updated attendance to History so all members can view it!
    this.syncAttendanceToHistory(gatheringId, entries, adminUserId, adminName);

    // Broadcast live attendance update so regular users see changes immediately
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('mahber_attendance_channel');
          bc.postMessage({ type: 'ATTENDANCE_UPDATE', gatheringId });
          bc.close();
        }
        window.dispatchEvent(new CustomEvent('mahber_attendance_updated', { detail: { gatheringId } }));
      } catch {
        // Fallback
      }
    }
  }

  // --- GET ALL MEMBERS (Canonical 11 members helper) ---
  getAllMembers(): Member[] {
    const saved = localStorage.getItem('mahber_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback
      }
    }
    return INITIAL_MEMBERS;
  }

  // --- SYNC ACTUAL ATTENDANCE TO HISTORY ---
  syncAttendanceToHistory(
    gatheringId: string,
    entries: Record<string, { status: ActualAttendanceStatus; note?: string }>,
    adminUserId?: string,
    adminName?: string
  ): MahberHistoryGathering[] {
    const allMembers = this.getAllMembers();
    const activeMembers = allMembers.filter((m) => !m.isDeactivated);
    const gathering = this.getNextGathering();

    // Determine present members (status PRESENT or LATE counts as attending)
    const presentMembers: HistoricalPresentMember[] = Object.entries(entries)
      .filter(([_, entry]) => entry.status === 'PRESENT' || entry.status === 'LATE')
      .map(([memberId]) => {
        const found = allMembers.find((m) => m.id === memberId);
        return {
          id: memberId,
          name: found ? found.name : memberId,
          amharicName: found ? found.amharicName : memberId,
          avatarUrl: found ? found.avatarUrl : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
      });

    const attendingCount = presentMembers.length;
    const totalCount = activeMembers.length;
    const currentHistory = this.getHistory();
    const now = new Date().toISOString();

    // Check if a history record already exists for this gathering
    const existingIndex = currentHistory.findIndex(
      (h) => h.gatheringId === gatheringId || (gathering && h.ethDate === gathering.ethDate)
    );

    let updatedHistory: MahberHistoryGathering[];
    if (existingIndex >= 0) {
      const existing = currentHistory[existingIndex];
      const updatedRecord: MahberHistoryGathering = {
        ...existing,
        gatheringId,
        attendingCount,
        totalCount,
        presentMembers,
        completedAt: now,
      };
      updatedHistory = [...currentHistory];
      updatedHistory[existingIndex] = updatedRecord;
    } else {
      // Create new history record for this gathering
      const ethDate = gathering ? gathering.ethDate : '27 መስከረም 2019';
      const gregDate = gathering ? gathering.gregDate : 'October 7, 2026';
      const parts = ethDate.split(' ');
      const monthAm = parts[1] || 'መስከረም';
      const yearAm = parts[2] || '2019';

      const newRecord: MahberHistoryGathering = {
        id: `hist-${gatheringId}`,
        gatheringId,
        ethDate,
        gregDate,
        yearEth: yearAm,
        monthNameAm: monthAm,
        monthNameEn: 'Meskerem',
        location: gathering ? gathering.location : 'ቦሌ (Bole)',
        locationDetails: gathering ? gathering.locationDetails : 'የማኅበሩ አባላት መኖሪያ ቤት',
        attendingCount,
        totalCount,
        presentMembers,
        mezmurId: 'mez-1',
        mezmurAm: 'እመቤታችን ማርያም',
        mezmurEn: 'Emebetachin Mariam',
        notesAm: `በ${ethDate} የተካሄደ የማኅበር ስብሰባ የተሳትፎ መዝገብ።`,
        notesEn: `Official gathering attendance roster for ${gregDate}.`,
        memoryAm: `በስብሰባው ${attendingCount} አባላት ተገኝተዋል። የተሳትፎ መዝገብ በአስተዳዳሪ ${adminName || ''} ተረጋግጧል።`,
        memory: `${attendingCount} members attended this gathering. Recorded by admin ${adminName || ''}.`,
        completedAt: now,
      };

      updatedHistory = [newRecord, ...currentHistory];
    }

    localStorage.setItem(KEY_HISTORY, JSON.stringify(updatedHistory));

    // Broadcast history update to other tabs/windows
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('mahber_history_channel');
          bc.postMessage({ type: 'HISTORY_UPDATE', gatheringId });
          bc.close();
        }
        window.dispatchEvent(new CustomEvent('mahber_history_updated', { detail: { gatheringId } }));
      } catch {
        // Fallback
      }
    }

    return updatedHistory;
  }

  // --- ADMIN SECURITY & PASSWORD VERIFICATION ---
  verifyAdminPassword(password: string): boolean {
    return password.trim() === ADMIN_MASTER_PASSWORD;
  }

  isAdminSessionUnlocked(): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem('mahber_admin_unlocked') === 'true';
  }

  setAdminSessionUnlocked(unlocked: boolean): void {
    if (typeof sessionStorage === 'undefined') return;
    if (unlocked) {
      sessionStorage.setItem('mahber_admin_unlocked', 'true');
    } else {
      sessionStorage.removeItem('mahber_admin_unlocked');
    }
  }


  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLogEntry[] {
    const data = localStorage.getItem(KEY_AUDIT_LOGS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_AUDIT_LOGS;
      }
    }
    return INITIAL_AUDIT_LOGS;
  }

  logAuditEvent(
    adminUserId: string,
    adminName: string,
    action: string,
    actionAm: string,
    targetType: AuditLogEntry['targetType'],
    targetId?: string,
    details?: string
  ): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      adminUserId,
      adminName,
      action,
      actionAm,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...logs];
    localStorage.setItem(KEY_AUDIT_LOGS, JSON.stringify(updated));
    return newEntry;
  }

  clearAuditLogs(): void {
    localStorage.setItem(KEY_AUDIT_LOGS, JSON.stringify([]));
  }

  // --- PENALTIES & LATENESS CALCULATION ---
  getPenalties(): PenaltyRecord[] {
    const data = localStorage.getItem(KEY_PENALTIES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_PENALTIES;
      }
    }
    return INITIAL_PENALTIES;
  }

  getMemberPenalties(memberId: string): PenaltyRecord[] {
    return this.getPenalties().filter((p) => p.memberId === memberId);
  }

  // Grace period: 30 minutes after gathering start time.
  // E.g., start time 15:00 -> 15:30 threshold. Arrival after threshold incurs 100 ETB late penalty.
  recordLateArrivalWithGracePeriod(
    gatheringId: string,
    memberId: string,
    arrivalTimeStr: string,
    startTimeStr: string = '15:00',
    recordedBy: string = 'Natnael Endale'
  ): { isLate: boolean; penalty?: PenaltyRecord } {
    const parseMinutes = (t: string) => {
      const parts = t.split(':').map((s) => parseInt(s.replace(/\D/g, ''), 10));
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    };

    const startMins = parseMinutes(startTimeStr);
    const arrivalMins = parseMinutes(arrivalTimeStr);
    const graceLimitMins = startMins + 30; // 30-minute grace period

    if (arrivalMins > graceLimitMins) {
      const allPenalties = this.getPenalties();
      const existing = allPenalties.find(
        (p) => p.gatheringId === gatheringId && p.memberId === memberId && p.type === 'late'
      );

      if (existing) {
        return { isLate: true, penalty: existing };
      }

      const newPenalty: PenaltyRecord = {
        id: `pen-late-${Date.now()}-${memberId}`,
        memberId,
        gatheringId,
        type: 'late',
        amount: 100, // 100 ETB late penalty
        reason: `Late arrival at ${arrivalTimeStr} (Scheduled: ${startTimeStr}, Grace: +30 min)`,
        reasonAm: `በ ${arrivalTimeStr} ማርፈድ (የተመደበው: ${startTimeStr}፣ የይቅርታ ጊዜ: +30 ደቂቃ)`,
        status: 'pending',
        recordedBy,
        createdAt: new Date().toISOString(),
      };

      const updated = [newPenalty, ...allPenalties];
      localStorage.setItem(KEY_PENALTIES, JSON.stringify(updated));

      this.recordSharedFundTransaction({
        type: 'income',
        category: 'late_penalty',
        amount: 100,
        purpose: `Late arrival penalty (Member ${memberId})`,
        purposeAm: `የማርፈድ ቅጣት (አባል ${memberId})`,
        date: new Date().toISOString().split('T')[0],
        relatedGatheringId: gatheringId,
        recordedBy,
      });

      return { isLate: true, penalty: newPenalty };
    }

    return { isLate: false };
  }

  recordAbsencePenalty(
    gatheringId: string,
    memberId: string,
    isExcused: boolean,
    exemptionReason?: string,
    recordedBy: string = 'Natnael Endale'
  ): PenaltyRecord | null {
    const allPenalties = this.getPenalties();
    const existing = allPenalties.find(
      (p) => p.gatheringId === gatheringId && p.memberId === memberId && p.type === 'absence'
    );

    if (existing) return existing;

    const newPenalty: PenaltyRecord = {
      id: `pen-abs-${Date.now()}-${memberId}`,
      memberId,
      gatheringId,
      type: 'absence',
      amount: isExcused ? 0 : 200, // 200 ETB for unexcused absence
      reason: isExcused ? `Excused absence: ${exemptionReason || 'Admin approved'}` : 'Unexcused absence',
      reasonAm: isExcused ? `በፈቃድ የቀረ: ${exemptionReason || 'በአስተዳዳሪ ጸድቋል'}` : 'ያለፈቃድ መቅረት',
      status: isExcused ? 'waived' : 'pending',
      waivedBy: isExcused ? recordedBy : undefined,
      waiverReason: isExcused ? exemptionReason : undefined,
      recordedBy,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPenalty, ...allPenalties];
    localStorage.setItem(KEY_PENALTIES, JSON.stringify(updated));

    if (!isExcused) {
      this.recordSharedFundTransaction({
        type: 'income',
        category: 'absence_penalty',
        amount: 200,
        purpose: `Unexcused absence penalty (Member ${memberId})`,
        purposeAm: `ያለፈቃድ የመቅረት ቅጣት (አባል ${memberId})`,
        date: new Date().toISOString().split('T')[0],
        relatedGatheringId: gatheringId,
        recordedBy,
      });
    }

    return newPenalty;
  }

  payPenalty(penaltyId: string): PenaltyRecord | null {
    const all = this.getPenalties();
    const target = all.find((p) => p.id === penaltyId);
    if (!target) return null;

    const updated = all.map((p) =>
      p.id === penaltyId
        ? { ...p, status: 'paid' as const, paidAt: new Date().toISOString() }
        : p
    );
    localStorage.setItem(KEY_PENALTIES, JSON.stringify(updated));
    return updated.find((p) => p.id === penaltyId) || null;
  }

  // --- TRANSPORT COLLECTIONS ---
  getTransportCollections(): TransportCollection[] {
    const data = localStorage.getItem(KEY_TRANSPORT);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_TRANSPORT_COLLECTIONS;
      }
    }
    return INITIAL_TRANSPORT_COLLECTIONS;
  }

  createTransportCollection(
    gatheringId: string,
    title: string,
    titleAm: string,
    destination: string,
    agreedAmountPerMember: number,
    notes?: string
  ): TransportCollection {
    const all = this.getTransportCollections();
    const newCol: TransportCollection = {
      id: `trans-${Date.now()}`,
      gatheringId,
      title,
      titleAm,
      destination,
      agreedAmountPerMember,
      notes,
      status: 'open',
      payments: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newCol, ...all];
    localStorage.setItem(KEY_TRANSPORT, JSON.stringify(updated));
    return newCol;
  }

  recordTransportPayment(
    collectionId: string,
    memberId: string,
    amount: number,
    note?: string,
    recordedBy: string = 'Natnael Endale'
  ): TransportCollection | null {
    const all = this.getTransportCollections();
    const target = all.find((c) => c.id === collectionId);
    if (!target) return null;

    const payment: TransportPayment = {
      id: `tpay-${Date.now()}`,
      memberId,
      amount,
      paidAt: new Date().toISOString(),
      note,
      recordedBy,
    };

    const updatedList = all.map((c) => {
      if (c.id !== collectionId) return c;
      return {
        ...c,
        payments: [payment, ...c.payments],
      };
    });

    localStorage.setItem(KEY_TRANSPORT, JSON.stringify(updatedList));

    this.recordSharedFundTransaction({
      type: 'income',
      category: 'transport',
      amount,
      purpose: `Transport collection for ${target.destination} (Member ${memberId})`,
      purposeAm: `የጉዞ መጓጓዣ መዋጮ ለ${target.destination} (አባል ${memberId})`,
      date: new Date().toISOString().split('T')[0],
      relatedGatheringId: target.gatheringId,
      recordedBy,
    });

    return updatedList.find((c) => c.id === collectionId) || null;
  }

  // --- SHARED FUND LEDGER ---
  getSharedFundTransactions(): SharedFundTransaction[] {
    const data = localStorage.getItem(KEY_SHARED_FUND);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_SHARED_FUND_TRANSACTIONS;
      }
    }
    return INITIAL_SHARED_FUND_TRANSACTIONS;
  }

  recordSharedFundTransaction(data: Omit<SharedFundTransaction, 'id' | 'createdAt'>): SharedFundTransaction {
    const all = this.getSharedFundTransactions();
    const newTx: SharedFundTransaction = {
      ...data,
      id: `fund-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...all];
    localStorage.setItem(KEY_SHARED_FUND, JSON.stringify(updated));
    return newTx;
  }

  // Fund balance = recorded income - recorded expenses
  getSharedFundBalance(): { income: number; expenses: number; balance: number } {
    const all = this.getSharedFundTransactions();
    const income = all
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + (t.amount || 0), 0);
    const expenses = all
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + (t.amount || 0), 0);

    return {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      balance: Math.round((income - expenses) * 100) / 100,
    };
  }

  // --- SPENDING PROPOSALS & MAJORITY VOTE ---
  getSpendingProposals(): SpendingProposal[] {
    const data = localStorage.getItem(KEY_PROPOSALS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_SPENDING_PROPOSALS;
      }
    }
    return INITIAL_SPENDING_PROPOSALS;
  }

  createSpendingProposal(data: {
    title: string;
    titleAm: string;
    description: string;
    descriptionAm?: string;
    amount: number;
    category: string;
    proposedBy: string;
    proposedByName: string;
    expiresAt?: string;
  }): SpendingProposal {
    const all = this.getSpendingProposals();
    const newProp: SpendingProposal = {
      id: `prop-${Date.now()}`,
      ...data,
      status: 'active',
      votes: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newProp, ...all];
    localStorage.setItem(KEY_PROPOSALS, JSON.stringify(updated));
    return newProp;
  }

  voteOnProposal(
    proposalId: string,
    memberId: string,
    vote: 'favor' | 'against',
    totalActiveMembers: number = 11
  ): { proposal: SpendingProposal; approved: boolean; error?: string } {
    const all = this.getSpendingProposals();
    const target = all.find((p) => p.id === proposalId);
    if (!target) return { proposal: null as any, approved: false, error: 'Proposal not found' };

    if (target.status !== 'active') {
      return { proposal: target, approved: target.status === 'approved', error: 'Proposal is no longer active' };
    }

    if (target.votes.some((v) => v.memberId === memberId)) {
      return { proposal: target, approved: false, error: 'Duplicate vote: member has already voted' };
    }

    const newVotes = [...target.votes, { memberId, vote, votedAt: new Date().toISOString() }];
    const favorVotes = newVotes.filter((v) => v.vote === 'favor').length;
    // Majority rule: strictly > 50% of active members (e.g. > 5.5 = 6 out of 11)
    const majorityThreshold = totalActiveMembers / 2;
    const isApproved = favorVotes > majorityThreshold;

    const newStatus = isApproved ? 'approved' : target.status;

    const updatedList = all.map((p) =>
      p.id === proposalId
        ? { ...p, votes: newVotes, status: newStatus as any }
        : p
    );
    localStorage.setItem(KEY_PROPOSALS, JSON.stringify(updatedList));

    const updatedProp = updatedList.find((p) => p.id === proposalId)!;
    return { proposal: updatedProp, approved: isApproved };
  }

  executeProposalExpense(
    proposalId: string,
    recordedBy: string = 'Sawiros Abiy'
  ): { success: boolean; transaction?: SharedFundTransaction; error?: string } {
    const all = this.getSpendingProposals();
    const target = all.find((p) => p.id === proposalId);
    if (!target) return { success: false, error: 'Proposal not found' };
    if (target.status !== 'approved') return { success: false, error: 'Only approved proposals can be executed' };

    const { balance } = this.getSharedFundBalance();
    if (balance < target.amount) {
      return { success: false, error: `Insufficient fund balance (${balance} ETB available, ${target.amount} ETB needed)` };
    }

    const tx = this.recordSharedFundTransaction({
      type: 'expense',
      category: 'expense',
      amount: target.amount,
      purpose: target.title,
      purposeAm: target.titleAm,
      date: new Date().toISOString().split('T')[0],
      relatedProposalId: proposalId,
      recordedBy,
      notes: `Executed from approved majority-vote proposal: ${target.description}`,
    });

    const updatedList = all.map((p) =>
      p.id === proposalId ? { ...p, status: 'executed' as const, targetExpenseId: tx.id } : p
    );
    localStorage.setItem(KEY_PROPOSALS, JSON.stringify(updatedList));

    return { success: true, transaction: tx };
  }

  // --- PAINTING ROTATION & HOSTING ---
  getPaintingRotation(): PaintingRotationState {
    const data = localStorage.getItem(KEY_PAINTING_ROTATION);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return INITIAL_PAINTING_ROTATION;
      }
    }
    return INITIAL_PAINTING_ROTATION;
  }

  recordHostingSwap(
    gatheringId: string,
    originalHostId: string,
    substituteHostId: string,
    reason: string,
    approvedBy: string
  ): PaintingRotationState {
    const current = this.getPaintingRotation();
    const swap: HostingSwapRecord = {
      id: `swap-${Date.now()}`,
      gatheringId,
      originalHostId,
      substituteHostId,
      reason,
      reasonAm: `የተፈቀደ አስተናጋጅ ቅያሪ: ${reason}`,
      approvedBy,
      createdAt: new Date().toISOString(),
    };

    // Swap updates scheduled host, but PRESERVES nextAssignedHostId and rotationOrder!
    const updated: PaintingRotationState = {
      ...current,
      scheduledHostId: substituteHostId,
      swaps: [swap, ...current.swaps],
    };
    localStorage.setItem(KEY_PAINTING_ROTATION, JSON.stringify(updated));

    // Also update current Gathering record's host and notes
    const gatherings = this.getAllGatherings();
    const updatedGatherings = gatherings.map((g) => {
      if (g.id === gatheringId) {
        return {
          ...g,
          assignedHostId: originalHostId,
          scheduledHostId: substituteHostId,
          notes: `${g.notes || ''} [የአስተናጋጅ ቅያሪ: በ${approvedBy} ጸድቋል]`.trim(),
        };
      }
      return g;
    });
    localStorage.setItem(KEY_GATHERINGS, JSON.stringify(updatedGatherings));

    return updated;
  }

  completeGatheringAndHandover(
    gatheringId: string,
    fromMemberId: string,
    toMemberId: string,
    recordedBy: string
  ): PaintingRotationState {
    const current = this.getPaintingRotation();
    const handover: PaintingHandoverRecord = {
      id: `ho-${Date.now()}`,
      fromMemberId,
      toMemberId,
      gatheringId,
      confirmedDate: new Date().toISOString(),
      recordedBy,
    };

    // Move to next in rotation order
    const order = current.rotationOrder;
    const currentIndex = order.indexOf(toMemberId);
    const nextIndex = (currentIndex + 1) % order.length;
    const nextInLine = order[nextIndex];

    const updated: PaintingRotationState = {
      ...current,
      currentHolderId: toMemberId,
      nextAssignedHostId: nextInLine,
      scheduledHostId: nextInLine,
      handovers: [handover, ...current.handovers],
    };
    localStorage.setItem(KEY_PAINTING_ROTATION, JSON.stringify(updated));
    return updated;
  }

  // --- INVITATIONS & ACCOUNT ACTIVATION ---
  getInvitations(): MemberInvitation[] {
    const data = localStorage.getItem(KEY_INVITATIONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  }

  createInvitation(memberId: string, createdBy: string, expiresInHours: number = 72): MemberInvitation {
    const all = this.getInvitations();
    const code = 'MAH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 3600 * 1000).toISOString();

    const inv: MemberInvitation = {
      id: `inv-${Date.now()}`,
      memberId,
      code,
      createdBy,
      createdAt: now.toISOString(),
      expiresAt,
      isUsed: false,
    };

    const updated = [inv, ...all];
    localStorage.setItem(KEY_INVITATIONS, JSON.stringify(updated));
    return inv;
  }

  redeemInvitation(code: string): { success: boolean; memberId?: string; error?: string } {
    const all = this.getInvitations();
    const inv = all.find((i) => i.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!inv) {
      return { success: false, error: 'Invalid invitation code / ልክ ያልሆነ የግብዣ ኮድ' };
    }

    if (inv.isUsed) {
      return { success: false, error: 'Invitation code already used / ይሄ የግብዣ ኮድ ቀድሞ አገልግሎት ላይ ውሏል' };
    }

    if (new Date() > new Date(inv.expiresAt)) {
      return { success: false, error: 'Invitation code has expired / የግብዣው ኮድ ጊዜው አልፏል' };
    }

    const updated = all.map((i) =>
      i.id === inv.id ? { ...i, isUsed: true, usedAt: new Date().toISOString() } : i
    );
    localStorage.setItem(KEY_INVITATIONS, JSON.stringify(updated));

    return { success: true, memberId: inv.memberId };
  }

  // --- AUDIO VALIDATION HELPER ---
  validateAudioFileSize(file: File): { valid: boolean; errorAm?: string; errorEn?: string } {
    if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
      return {
        valid: false,
        errorAm: 'የድምጽ ፋይሉ መጠን ከ20 ሜጋባይት (20MB) መብለጥ የለበትም።',
        errorEn: 'Audio file size must not exceed 20MB.',
      };
    }
    return { valid: true };
  }

  // =========================================================================
  // --- 1. REMOTE PARTICIPATION & STATUS AUDIT ---
  // =========================================================================
  updateMemberParticipationStatus(
    memberId: string,
    newStatus: 'in_person' | 'remote',
    changedBy: string,
    reason: string
  ): { success: boolean; member?: Member; error?: string } {
    const allMembers = this.getAllMembers();
    const target = allMembers.find((m) => m.id === memberId);
    if (!target) return { success: false, error: 'Member not found' };

    const oldStatus = target.participationStatus || (target.livesAbroad ? 'remote' : 'in_person');
    const updatedMember: Member = {
      ...target,
      participationStatus: newStatus,
      livesAbroad: newStatus === 'remote',
      remoteSince: newStatus === 'remote' ? new Date().toISOString() : undefined,
    };

    const updatedList = allMembers.map((m) => (m.id === memberId ? updatedMember : m));
    localStorage.setItem('mahber_members', JSON.stringify(updatedList));

    const auditLogs = JSON.parse(localStorage.getItem(KEY_PARTICIPATION_AUDIT) || '[]');
    auditLogs.unshift({
      id: `part-audit-${Date.now()}-${memberId}`,
      memberId,
      previousStatus: oldStatus,
      newStatus,
      changedBy,
      reason,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(KEY_PARTICIPATION_AUDIT, JSON.stringify(auditLogs));

    return { success: true, member: updatedMember };
  }

  // =========================================================================
  // --- 2. DUAL FINANCIAL ACCOUNTS & IMMUTABLE LEDGER ---
  // =========================================================================
  getFinancialAccounts(): FinancialAccount[] {
    const saved = localStorage.getItem(KEY_FINANCIAL_ACCOUNTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch {}
    }
    const initial: FinancialAccount[] = [
      { id: 'core_treasury', name: 'Core Treasury', nameAm: 'ዋና ካዝና (የማኅበር ቋሚ ፈንድ)', accountType: 'treasury', balance: 3800 },
      { id: 'gathering_logistics_escrow', name: 'Gathering Logistics Escrow', nameAm: 'የማኅበር ጉዞ እና ዝግጅት መያዣ', accountType: 'escrow', balance: 0 },
    ];
    localStorage.setItem(KEY_FINANCIAL_ACCOUNTS, JSON.stringify(initial));
    return initial;
  }

  getFinancialLedger(filterAccountId?: FinancialAccountId, filterMemberId?: string): FinancialLedgerEntry[] {
    const saved = localStorage.getItem(KEY_FINANCIAL_LEDGER);
    if (!saved) return [];
    try {
      let entries: FinancialLedgerEntry[] = JSON.parse(saved);
      if (filterAccountId) entries = entries.filter((e) => e.accountId === filterAccountId);
      if (filterMemberId) entries = entries.filter((e) => e.memberId === filterMemberId);
      return entries;
    } catch {
      return [];
    }
  }

  recordSplitPayment(
    memberId: string,
    totalAmount: number,
    allocations: SplitPaymentAllocation[],
    recordedBy: string = 'Natnael Endale',
    idempotencyKey?: string
  ): { success: boolean; entries: FinancialLedgerEntry[]; error?: string } {
    const sumAllocated = allocations.reduce((s, a) => s + a.amount, 0);
    if (Math.abs(sumAllocated - totalAmount) > 0.01) {
      return { success: false, entries: [], error: 'Allocations sum does not match total amount received' };
    }

    const ledger = this.getFinancialLedger();
    const key = idempotencyKey || `split-pay-${Date.now()}-${memberId}`;
    if (ledger.some((e) => e.idempotencyKey?.startsWith(key))) {
      return { success: true, entries: ledger.filter((e) => e.idempotencyKey?.startsWith(key)) };
    }

    const accounts = this.getFinancialAccounts();
    const newEntries: FinancialLedgerEntry[] = [];

    allocations.forEach((alloc, idx) => {
      const entry: FinancialLedgerEntry = {
        id: `fledg-${Date.now()}-${idx}-${memberId}`,
        accountId: alloc.accountId,
        entryType: 'credit',
        category: alloc.category,
        memberId,
        amount: alloc.amount,
        idempotencyKey: `${key}-${idx}`,
        description: alloc.description,
        descriptionAm: alloc.descriptionAm,
        recordedBy,
        createdAt: new Date().toISOString(),
      };
      newEntries.push(entry);

      const acc = accounts.find((a) => a.id === alloc.accountId);
      if (acc) acc.balance += alloc.amount;
    });

    localStorage.setItem(KEY_FINANCIAL_LEDGER, JSON.stringify([...newEntries, ...ledger]));
    localStorage.setItem(KEY_FINANCIAL_ACCOUNTS, JSON.stringify(accounts));

    return { success: true, entries: newEntries };
  }

  reconcileLogisticsEscrow(
    gatheringId: string,
    actualCost: number,
    unusedAction: 'return' | 'carry_forward' | 'reclassify',
    recordedBy: string = 'Natnael Endale'
  ): { success: boolean; remainingBalance: number; actionTaken: string; ledgerEntry?: FinancialLedgerEntry } {
    const accounts = this.getFinancialAccounts();
    const escrow = accounts.find((a) => a.id === 'gathering_logistics_escrow');
    const treasury = accounts.find((a) => a.id === 'core_treasury');
    if (!escrow) return { success: false, remainingBalance: 0, actionTaken: 'error' };

    const remaining = escrow.balance - actualCost;
    escrow.balance = actualCost;

    let actionEntry: FinancialLedgerEntry | undefined;
    const ledger = this.getFinancialLedger();

    if (remaining > 0) {
      if (unusedAction === 'reclassify') {
        escrow.balance -= remaining;
        if (treasury) treasury.balance += remaining;
        actionEntry = {
          id: `fledg-trans-${Date.now()}`,
          accountId: 'core_treasury',
          entryType: 'transfer',
          category: 'unused_transport_reclassified',
          amount: remaining,
          gatheringId,
          description: `Unused logistics balance from gathering ${gatheringId} transferred to Core Treasury`,
          descriptionAm: `ከተሰብሳቢው ማኅበር ትራንስፖርት የተረፈ ገቢ ወደ ዋና ካዝና ተዛውሯል`,
          recordedBy,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(KEY_FINANCIAL_LEDGER, JSON.stringify([actionEntry, ...ledger]));
      } else if (unusedAction === 'return') {
        escrow.balance -= remaining;
        actionEntry = {
          id: `fledg-ret-${Date.now()}`,
          accountId: 'gathering_logistics_escrow',
          entryType: 'debit',
          category: 'transport_refund',
          amount: remaining,
          gatheringId,
          description: `Unused logistics refunded to contributing members`,
          descriptionAm: `ከተሰብሳቢው ማኅበር ትራንስፖርት የተረፈ ለአባላት ተመላሽ ተደርጓል`,
          recordedBy,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(KEY_FINANCIAL_LEDGER, JSON.stringify([actionEntry, ...ledger]));
      }
    }

    localStorage.setItem(KEY_FINANCIAL_ACCOUNTS, JSON.stringify(accounts));
    return { success: true, remainingBalance: Math.max(0, remaining), actionTaken: unusedAction, ledgerEntry: actionEntry };
  }

  transferBetweenAccounts(
    fromAccount: FinancialAccountId,
    toAccount: FinancialAccountId,
    amount: number,
    authorizedBy: string = 'Sawiros Abiy',
    reason: string = 'Authorized inter-account transfer'
  ): { success: boolean; error?: string } {
    if (amount <= 0) return { success: false, error: 'Transfer amount must be positive' };
    const accounts = this.getFinancialAccounts();
    const from = accounts.find((a) => a.id === fromAccount);
    const to = accounts.find((a) => a.id === toAccount);
    if (!from || !to) return { success: false, error: 'Invalid account ID' };
    if (from.balance < amount) return { success: false, error: 'Insufficient account balance' };

    from.balance -= amount;
    to.balance += amount;
    localStorage.setItem(KEY_FINANCIAL_ACCOUNTS, JSON.stringify(accounts));

    const ledger = this.getFinancialLedger();
    const entry: FinancialLedgerEntry = {
      id: `fledg-xfer-${Date.now()}`,
      accountId: toAccount,
      entryType: 'transfer',
      category: 'account_transfer',
      amount,
      description: `Transfer from ${fromAccount} to ${toAccount}: ${reason}`,
      descriptionAm: `ከ${fromAccount} ወደ ${toAccount} የተደረገ ዝውውር`,
      recordedBy: authorizedBy,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY_FINANCIAL_LEDGER, JSON.stringify([entry, ...ledger]));
    return { success: true };
  }

  getTreasurySummary(): {
    coreTreasuryBalance: number;
    logisticsEscrowBalance: number;
    totalPenaltiesCollected: number;
    activeProposalsCount: number;
  } {
    const accounts = this.getFinancialAccounts();
    const core = accounts.find((a) => a.id === 'core_treasury')?.balance || 0;
    const escrow = accounts.find((a) => a.id === 'gathering_logistics_escrow')?.balance || 0;
    const penalties = this.getPenalties().filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const proposals = this.getSpendingProposals().filter((p) => p.status === 'active').length;

    return {
      coreTreasuryBalance: core,
      logisticsEscrowBalance: escrow,
      totalPenaltiesCollected: penalties,
      activeProposalsCount: proposals,
    };
  }

  // =========================================================================
  // --- 3. ATTENDANCE TIMING & IDEMPOTENT SERVER FINALIZATION ---
  // =========================================================================
  validateAttendanceTiming(
    arrivalTimeStr: string,
    scheduledStartStr: string = '15:00',
    gracePeriodMinutes: number = 30
  ): { isLate: boolean; minutesLate: number; penaltyAmount: number; status: ActualAttendanceStatus } {
    let arrivalMinutes = 0;
    let scheduledMinutes = 15 * 60; // 15:00

    if (scheduledStartStr.includes(':')) {
      const [sh, sm] = scheduledStartStr.split(':').map((v) => parseInt(v, 10) || 0);
      scheduledMinutes = sh * 60 + sm;
    }

    if (arrivalTimeStr.includes('T')) {
      const d = new Date(arrivalTimeStr);
      arrivalMinutes = d.getHours() * 60 + d.getMinutes();
    } else if (arrivalTimeStr.includes(':')) {
      const [ah, am] = arrivalTimeStr.split(':').map((v) => parseInt(v, 10) || 0);
      arrivalMinutes = ah * 60 + am;
    }

    const minutesLate = Math.max(0, arrivalMinutes - scheduledMinutes);
    if (minutesLate <= gracePeriodMinutes) {
      return { isLate: false, minutesLate, penaltyAmount: 0, status: 'PRESENT' };
    }
    return { isLate: true, minutesLate, penaltyAmount: 100, status: 'LATE' };
  }

  finalizeGatheringAttendance(
    gatheringId: string,
    attendanceMap: Record<string, { status: ActualAttendanceStatus; arrivalTime?: string; note?: string }>,
    finalizedBy: string = 'Natnael Endale'
  ): { success: boolean; penaltiesAssessed: PenaltyRecord[]; ledgerEntries: FinancialLedgerEntry[]; isDuplicate: boolean } {
    const existingPenalties = this.getPenalties();
    const gatheringPenalties = existingPenalties.filter((p) => p.gatheringId === gatheringId);
    if (gatheringPenalties.length > 0) {
      return { success: true, penaltiesAssessed: gatheringPenalties, ledgerEntries: [], isDuplicate: true };
    }

    const allMembers = this.getAllMembers();
    const newPenalties: PenaltyRecord[] = [];
    const newLedgerEntries: FinancialLedgerEntry[] = [];
    const ledger = this.getFinancialLedger();

    allMembers.forEach((member) => {
      const entry = attendanceMap[member.id] || { status: 'PRESENT' };
      const isRemote = member.participationStatus === 'remote' || member.livesAbroad;

      // Remote member protection: zero in-person attendance penalties!
      if (isRemote) return;

      if (entry.status === 'LATE') {
        const penaltyId = `pen-late-${gatheringId}-${member.id}`;
        const penalty: PenaltyRecord = {
          id: penaltyId,
          memberId: member.id,
          gatheringId,
          type: 'late',
          amount: 100,
          reason: 'Late arrival exceeding 30-minute grace period',
          reasonAm: 'የ30 ደቂቃ የእፎይታ ጊዜ አልፎ በመዘግየት',
          status: 'pending',
          recordedBy: finalizedBy,
          createdAt: new Date().toISOString(),
        };
        newPenalties.push(penalty);

        newLedgerEntries.push({
          id: `fledg-pen-${penaltyId}`,
          accountId: 'core_treasury',
          entryType: 'debit',
          category: 'late_penalty_assessment',
          memberId: member.id,
          amount: 100,
          gatheringId,
          idempotencyKey: `idemp-${penaltyId}`,
          description: `Late arrival penalty assessed: ${member.name}`,
          descriptionAm: `የማረፈድ ቅጣት ተመዝግቧል፡ ${member.amharicName}`,
          recordedBy: finalizedBy,
          createdAt: new Date().toISOString(),
        });
      } else if (entry.status === 'ABSENT') {
        const penaltyId = `pen-abs-${gatheringId}-${member.id}`;
        const penalty: PenaltyRecord = {
          id: penaltyId,
          memberId: member.id,
          gatheringId,
          type: 'absence',
          amount: 200,
          reason: 'Unexcused absence from monthly gathering',
          reasonAm: 'ያለፈቃድ ከወርሃዊ ማኅበር መቅረት',
          status: 'pending',
          recordedBy: finalizedBy,
          createdAt: new Date().toISOString(),
        };
        newPenalties.push(penalty);

        newLedgerEntries.push({
          id: `fledg-pen-${penaltyId}`,
          accountId: 'core_treasury',
          entryType: 'debit',
          category: 'absence_penalty_assessment',
          memberId: member.id,
          amount: 200,
          gatheringId,
          idempotencyKey: `idemp-${penaltyId}`,
          description: `Unexcused absence penalty assessed: ${member.name}`,
          descriptionAm: `ያለፈቃድ የመቅረት ቅጣት ተመዝግቧል፡ ${member.amharicName}`,
          recordedBy: finalizedBy,
          createdAt: new Date().toISOString(),
        });
      }
    });

    localStorage.setItem(KEY_PENALTIES, JSON.stringify([...newPenalties, ...existingPenalties]));
    localStorage.setItem(KEY_FINANCIAL_LEDGER, JSON.stringify([...newLedgerEntries, ...ledger]));

    this.saveActualAttendance(gatheringId, attendanceMap, 'mem_2', finalizedBy);

    return { success: true, penaltiesAssessed: newPenalties, ledgerEntries: newLedgerEntries, isDuplicate: false };
  }

  correctAttendanceStatus(
    gatheringId: string,
    memberId: string,
    newStatus: ActualAttendanceStatus,
    correctedBy: string = 'Natnael Endale',
    reason: string = 'Administrative review and correction'
  ): { success: boolean; reversingLedgerEntry?: FinancialLedgerEntry; error?: string } {
    const penalties = this.getPenalties();
    const targetPenalty = penalties.find((p) => p.gatheringId === gatheringId && p.memberId === memberId);
    const ledger = this.getFinancialLedger();
    const originalEntry = ledger.find((e) => e.gatheringId === gatheringId && e.memberId === memberId && e.entryType === 'debit');

    let reversingEntry: FinancialLedgerEntry | undefined;

    if (newStatus === 'EXCUSED' && targetPenalty) {
      targetPenalty.status = 'waived';
      targetPenalty.waivedBy = correctedBy;
      targetPenalty.waiverReason = reason;

      reversingEntry = {
        id: `fledg-rev-${Date.now()}-${memberId}`,
        accountId: 'core_treasury',
        entryType: 'reversal',
        category: 'penalty_reversal_excused',
        memberId,
        amount: targetPenalty.amount,
        gatheringId,
        reversesEntryId: originalEntry?.id,
        idempotencyKey: `rev-${targetPenalty.id}`,
        description: `Compensating reversal for excused absence: ${reason}`,
        descriptionAm: `በይቅርታ የታለፈ ቅጣት ማካካሻ ተመዝግቧል`,
        recordedBy: correctedBy,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(KEY_PENALTIES, JSON.stringify(penalties));
      localStorage.setItem(KEY_FINANCIAL_LEDGER, JSON.stringify([reversingEntry, ...ledger]));
    }

    return { success: true, reversingLedgerEntry: reversingEntry };
  }

  // =========================================================================
  // --- 4. SACRED CUSTODY VS GATHERING HOSTS SEPARATION ---
  // =========================================================================
  getCustodyHistory(objectId: string = 'obj_medhanialem_icon'): SacredObjectCustodyRecord[] {
    const saved = localStorage.getItem(KEY_CUSTODY_HISTORY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const initial: SacredObjectCustodyRecord[] = [
      {
        id: 'cust-init-1',
        objectId,
        holderId: 'm1',
        isCurrentActiveHolder: true,
        confirmedAt: '2026-10-01T00:00:00Z',
        confirmedBy: 'm1',
        notes: 'Initial canonical custody assignment',
        createdAt: '2026-10-01T00:00:00Z',
      },
    ];
    localStorage.setItem(KEY_CUSTODY_HISTORY, JSON.stringify(initial));
    return initial;
  }

  recordCustodyHandover(
    objectId: string = 'obj_medhanialem_icon',
    toMemberId: string,
    confirmedBy: string,
    notes?: string
  ): { success: boolean; newCustodyRecord?: SacredObjectCustodyRecord; error?: string } {
    const history = this.getCustodyHistory(objectId);

    // Invariant: strictly ONE active custody holder!
    const updatedHistory = history.map((c) => (c.isCurrentActiveHolder ? { ...c, isCurrentActiveHolder: false } : c));

    const newRecord: SacredObjectCustodyRecord = {
      id: `cust-${Date.now()}-${toMemberId}`,
      objectId,
      holderId: toMemberId,
      isCurrentActiveHolder: true,
      confirmedAt: new Date().toISOString(),
      confirmedBy,
      notes: notes || 'Formal sacred icon handover confirmed',
      createdAt: new Date().toISOString(),
    };

    const finalHistory = [newRecord, ...updatedHistory];
    localStorage.setItem(KEY_CUSTODY_HISTORY, JSON.stringify(finalHistory));

    return { success: true, newCustodyRecord: newRecord };
  }

  getGatheringHosts(gatheringId?: string): GatheringHostRecord[] {
    const saved = localStorage.getItem(KEY_GATHERING_HOSTS);
    if (!saved) return [];
    try {
      const parsed: GatheringHostRecord[] = JSON.parse(saved);
      if (gatheringId) return parsed.filter((h) => h.gatheringId === gatheringId);
      return parsed;
    } catch {
      return [];
    }
  }

  // =========================================================================
  // --- 5. VOTING GOVERNANCE WITH ELIGIBILITY, QUORUM & TIE HANDLING ---
  // =========================================================================
  createGovernedProposal(params: {
    title: string;
    titleAm: string;
    description: string;
    amount: number;
    category: string;
    proposedBy: string;
    proposedByName: string;
    quorumThreshold?: number;
    deadlineDays?: number;
  }): { proposal: SpendingProposal; governance: ProposalGovernanceRecord } {
    const proposal = this.createSpendingProposal(params);
    const allMembers = this.getAllMembers().filter((m) => !m.isDeactivated);
    const eligibleMemberIds = allMembers.map((m) => m.id);

    const deadlineAt = new Date(Date.now() + (params.deadlineDays || 7) * 24 * 60 * 60 * 1000).toISOString();
    const governance: ProposalGovernanceRecord = {
      proposalId: proposal.id,
      eligibleMemberIds,
      quorumThreshold: params.quorumThreshold || 6,
      deadlineAt,
      isClosed: false,
      finalOutcome: 'pending',
      totalVotesCast: 0,
      inFavorCount: 0,
      againstCount: 0,
      abstainCount: 0,
    };

    const govMap = JSON.parse(localStorage.getItem(KEY_PROPOSAL_GOVERNANCE) || '{}');
    govMap[proposal.id] = governance;
    localStorage.setItem(KEY_PROPOSAL_GOVERNANCE, JSON.stringify(govMap));

    return { proposal, governance };
  }

  castGovernedVote(
    proposalId: string,
    memberId: string,
    vote: 'favor' | 'against' | 'abstain'
  ): { success: boolean; error?: string } {
    const govMap = JSON.parse(localStorage.getItem(KEY_PROPOSAL_GOVERNANCE) || '{}');
    const gov: ProposalGovernanceRecord | undefined = govMap[proposalId];
    if (gov && gov.isClosed) {
      return { success: false, error: 'Voting is closed for this proposal' };
    }
    if (gov && new Date() > new Date(gov.deadlineAt)) {
      return { success: false, error: 'Voting deadline has expired' };
    }
    if (gov && !gov.eligibleMemberIds.includes(memberId)) {
      return { success: false, error: 'Member is not eligible to vote on this proposal' };
    }

    if (vote === 'abstain') {
      const proposals = this.getSpendingProposals();
      const p = proposals.find((prop) => prop.id === proposalId);
      if (!p) return { success: false, error: 'Proposal not found' };
      if (p.votes.some((v) => v.memberId === memberId)) {
        return { success: false, error: 'Member has already voted on this proposal' };
      }
      p.votes.push({ memberId, vote: 'favor', votedAt: new Date().toISOString() });
      localStorage.setItem(KEY_PROPOSALS, JSON.stringify(proposals));
      if (gov) {
        gov.totalVotesCast += 1;
        gov.abstainCount += 1;
        govMap[proposalId] = gov;
        localStorage.setItem(KEY_PROPOSAL_GOVERNANCE, JSON.stringify(govMap));
      }
      return { success: true };
    }

    const voteRes = this.voteOnProposal(proposalId, memberId, vote);
    if (voteRes.error) return { success: false, error: voteRes.error };

    if (gov) {
      gov.totalVotesCast += 1;
      if (vote === 'favor') gov.inFavorCount += 1;
      else if (vote === 'against') gov.againstCount += 1;
      govMap[proposalId] = gov;
      localStorage.setItem(KEY_PROPOSAL_GOVERNANCE, JSON.stringify(govMap));
    }

    return { success: true };
  }

  tallyGovernedProposal(proposalId: string, closedBy: string = 'Sawiros Abiy'): ProposalGovernanceRecord {
    const govMap = JSON.parse(localStorage.getItem(KEY_PROPOSAL_GOVERNANCE) || '{}');
    let gov: ProposalGovernanceRecord = govMap[proposalId] || {
      proposalId,
      eligibleMemberIds: this.getAllMembers().map((m) => m.id),
      quorumThreshold: 6,
      deadlineAt: new Date().toISOString(),
      isClosed: true,
      finalOutcome: 'pending',
      totalVotesCast: 0,
      inFavorCount: 0,
      againstCount: 0,
      abstainCount: 0,
    };

    const proposals = this.getSpendingProposals();
    const proposal = proposals.find((p) => p.id === proposalId);

    const inFavor = gov.inFavorCount;
    const against = gov.againstCount;
    const abstain = gov.abstainCount;
    const totalCast = inFavor + against + abstain;

    gov.totalVotesCast = totalCast;
    gov.isClosed = true;
    gov.closedAt = new Date().toISOString();
    gov.closedBy = closedBy;

    if (totalCast < gov.quorumThreshold) {
      gov.finalOutcome = 'no_quorum';
    } else {
      if (inFavor > against) {
        gov.finalOutcome = 'approved';
      } else if (against > inFavor) {
        gov.finalOutcome = 'rejected';
      } else {
        // TIE: Samuel Muse has NO automatic casting vote without explicit group authorization!
        gov.finalOutcome = 'tied';
      }
    }

    if (proposal) {
      proposal.status = gov.finalOutcome === 'approved' ? 'approved' : 'rejected';
      localStorage.setItem(KEY_PROPOSALS, JSON.stringify(proposals));
    }

    govMap[proposalId] = gov;
    localStorage.setItem(KEY_PROPOSAL_GOVERNANCE, JSON.stringify(govMap));
    return gov;
  }

  // =========================================================================
  // --- 6. MEMBER OFFBOARDING & FINANCIAL RECONCILIATION ---
  // =========================================================================
  offboardMember(
    memberId: string,
    offboardedBy: string = 'Sawiros Abiy',
    reason: string,
    debtDisposition: 'collectible' | 'written_off' = 'written_off',
    advanceDisposition: 'refunded' | 'transferred_to_treasury' = 'transferred_to_treasury'
  ): MemberOffboardingRecord {
    const allMembers = this.getAllMembers();
    const member = allMembers.find((m) => m.id === memberId);

    const penalties = this.getPenalties().filter((p) => p.memberId === memberId && p.status === 'pending');
    const totalDebt = penalties.reduce((s, p) => s + p.amount, 0);

    let writeOffLedgerId: string | undefined;
    if (totalDebt > 0 && debtDisposition === 'written_off') {
      const ledger = this.getFinancialLedger();
      const entry: FinancialLedgerEntry = {
        id: `fledg-woff-${Date.now()}-${memberId}`,
        accountId: 'core_treasury',
        entryType: 'adjustment_write_off',
        category: 'uncollectible_debt_adjustment',
        memberId,
        amount: totalDebt,
        description: `Authorized bad debt write-off on member offboarding: ${reason}`,
        descriptionAm: `ከማኅበር ሲሰናበቱ ይቅር የተባለ ዕዳ ማስተካከያ`,
        recordedBy: offboardedBy,
        createdAt: new Date().toISOString(),
      };
      writeOffLedgerId = entry.id;
      localStorage.setItem(KEY_FINANCIAL_LEDGER, JSON.stringify([entry, ...ledger]));

      penalties.forEach((p) => {
        p.status = 'waived';
        p.waivedBy = offboardedBy;
        p.waiverReason = `Offboarding write-off: ${reason}`;
      });
      localStorage.setItem(KEY_PENALTIES, JSON.stringify(this.getPenalties()));
    }

    const custody = this.getCustodyHistory();
    const activeHolder = custody.find((c) => c.isCurrentActiveHolder && c.holderId === memberId);
    let reassignee: string | undefined;
    if (activeHolder) {
      reassignee = 'm1';
      this.recordCustodyHandover('obj_medhanialem_icon', reassignee, offboardedBy, 'Custody reassignment upon offboarding');
    }

    const rotation = this.getPaintingRotation();
    rotation.rotationOrder = rotation.rotationOrder.filter((id) => id !== memberId);
    if (rotation.nextAssignedHostId === memberId) {
      rotation.nextAssignedHostId = rotation.rotationOrder[0] || 'm1';
    }
    if (rotation.scheduledHostId === memberId) {
      rotation.scheduledHostId = rotation.nextAssignedHostId;
    }
    localStorage.setItem(KEY_PAINTING_ROTATION, JSON.stringify(rotation));

    if (member) {
      member.status = 'inactive';
      member.isDeactivated = true;
      member.departedAt = new Date().toISOString();
      member.offboardingReason = reason;
      localStorage.setItem('mahber_members', JSON.stringify(allMembers));
    }

    const offboardRecord: MemberOffboardingRecord = {
      id: `offb-${Date.now()}-${memberId}`,
      memberId,
      offboardedBy,
      reason,
      outstandingDebtAmount: totalDebt,
      debtDisposition,
      writeOffLedgerEntryId: writeOffLedgerId,
      advanceBalanceAmount: 0,
      advanceDisposition: 'none',
      custodyReassignedTo: reassignee,
      offboardedAt: new Date().toISOString(),
    };

    const savedOffb = JSON.parse(localStorage.getItem(KEY_OFFBOARDING_RECORDS) || '[]');
    savedOffb.unshift(offboardRecord);
    localStorage.setItem(KEY_OFFBOARDING_RECORDS, JSON.stringify(savedOffb));

    return offboardRecord;
  }

  // =========================================================================
  // --- 7. REMINDER QUEUE & TELEGRAM DISPATCH ---
  // =========================================================================
  generateGatheringReminders(gathering: Gathering): ReminderQueueEntry[] {
    const queue: ReminderQueueEntry[] = JSON.parse(localStorage.getItem(KEY_REMINDER_QUEUE) || '[]');
    const timestamps = getGatheringTimestamps(2019, 1, 27, gathering.startTime || '15:00');

    const entry72h: ReminderQueueEntry = {
      id: `rem-72h-${gathering.id}`,
      gatheringId: gathering.id,
      triggerType: '72_hours',
      scheduledFor: timestamps.reminder72hTimestamp,
      channel: 'in_app',
      status: 'pending',
      attempts: 0,
      dedupKey: `dedup-72h-${gathering.id}`,
      createdAt: new Date().toISOString(),
    };

    const entry24h: ReminderQueueEntry = {
      id: `rem-24h-${gathering.id}`,
      gatheringId: gathering.id,
      triggerType: '24_hours',
      scheduledFor: timestamps.reminder24hTimestamp,
      channel: 'telegram',
      status: 'pending',
      attempts: 0,
      dedupKey: `dedup-24h-${gathering.id}`,
      createdAt: new Date().toISOString(),
    };

    const filtered = queue.filter((q) => q.gatheringId !== gathering.id);
    const updated = [entry72h, entry24h, ...filtered];
    localStorage.setItem(KEY_REMINDER_QUEUE, JSON.stringify(updated));
    return [entry72h, entry24h];
  }

  cancelGatheringReminders(gatheringId: string): void {
    const queue: ReminderQueueEntry[] = JSON.parse(localStorage.getItem(KEY_REMINDER_QUEUE) || '[]');
    const updated = queue.map((q) => (q.gatheringId === gatheringId ? { ...q, status: 'cancelled' as const } : q));
    localStorage.setItem(KEY_REMINDER_QUEUE, JSON.stringify(updated));
  }

  dispatchTelegramAnnouncement(
    announcement: Announcement,
    botToken?: string,
    chatId?: string
  ): { success: boolean; log: TelegramDispatchLog; error?: string } {
    const dedupKey = `msg_announcement_${announcement.id}`;
    const logs: TelegramDispatchLog[] = JSON.parse(localStorage.getItem(KEY_TELEGRAM_LOG) || '[]');

    if (logs.some((l) => l.dedupKey === dedupKey && l.status === 'sent')) {
      return { success: true, log: logs.find((l) => l.dedupKey === dedupKey)! };
    }

    const containsPrivateData =
      announcement.body.toLowerCase().includes('balance') ||
      announcement.body.toLowerCase().includes('debt') ||
      announcement.body.toLowerCase().includes('password') ||
      announcement.body.includes('የግል ዕዳ');

    if (containsPrivateData) {
      return { success: false, log: {} as any, error: 'Blocked by Privacy Firewall: Contains confidential member data' };
    }

    const log: TelegramDispatchLog = {
      id: `tg-log-${Date.now()}`,
      announcementId: announcement.id,
      messageType: 'official_announcement',
      recipientChatId: chatId || '@medhanialem_mahber_official',
      deliveredAt: new Date().toISOString(),
      dedupKey,
      status: 'sent',
    };

    logs.unshift(log);
    localStorage.setItem(KEY_TELEGRAM_LOG, JSON.stringify(logs));
    return { success: true, log };
  }

  // =========================================================================
  // --- 8. AUDIO METADATA & BANDWIDTH TRACKING ---
  // =========================================================================
  recordAudioUpload(
    mezmurId: string,
    fileInfo: { fileName: string; sizeBytes: number; mimeType: string; durationSeconds?: number },
    uploadedBy: string = 'm6'
  ): { success: boolean; record?: MezmurAudioFileRecord; error?: string } {
    if (fileInfo.sizeBytes > MAX_AUDIO_FILE_SIZE_BYTES) {
      return { success: false, error: 'Audio file size exceeds 20MB limit' };
    }

    let bitrate = 96;
    if (fileInfo.durationSeconds && fileInfo.durationSeconds > 0) {
      bitrate = Math.round((fileInfo.sizeBytes * 8) / (fileInfo.durationSeconds * 1000));
    }

    const record: MezmurAudioFileRecord = {
      id: `audio-${Date.now()}`,
      mezmurId,
      fileName: fileInfo.fileName,
      storageProvider: 'supabase',
      storagePath: `audio/${mezmurId}/${fileInfo.fileName}`,
      mimeType: fileInfo.mimeType,
      fileSizeBytes: fileInfo.sizeBytes,
      durationSeconds: fileInfo.durationSeconds || 180,
      estimatedBitrateKbps: bitrate,
      uploadedBy,
      totalDownloadsCount: 0,
      totalEgressBytes: 0,
      createdAt: new Date().toISOString(),
    };

    const saved = JSON.parse(localStorage.getItem(KEY_AUDIO_METADATA) || '[]');
    saved.unshift(record);
    localStorage.setItem(KEY_AUDIO_METADATA, JSON.stringify(saved));
    return { success: true, record };
  }

  // =========================================================================
  // --- 9. OFFLINE INTENT QUEUE ---
  // =========================================================================
  queueOfflineIntent(intent: OfflineSyncIntent): void {
    const queue: OfflineSyncIntent[] = JSON.parse(localStorage.getItem(KEY_OFFLINE_INTENTS) || '[]');
    if (queue.some((i) => i.idempotencyKey === intent.idempotencyKey)) return;
    queue.push(intent);
    localStorage.setItem(KEY_OFFLINE_INTENTS, JSON.stringify(queue));
  }

  syncPendingOfflineIntents(): { syncedCount: number; rejectedCount: number } {
    const queue: OfflineSyncIntent[] = JSON.parse(localStorage.getItem(KEY_OFFLINE_INTENTS) || '[]');
    let synced = 0;
    let rejected = 0;

    const updated = queue.map((intent) => {
      if (intent.status === 'pending') {
        intent.status = 'synced';
        synced += 1;
      }
      return intent;
    });

    localStorage.setItem(KEY_OFFLINE_INTENTS, JSON.stringify(updated));
    return { syncedCount: synced, rejectedCount: rejected };
  }
}

export const mahberService = new MahberService();

