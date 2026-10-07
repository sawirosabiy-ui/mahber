import {
  Gathering,
  AttendanceRecord,
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
} from '../types';
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
} from '../data/mockData';
import { getNextMahberProjectedDate } from '../utils/ethiopianCalendar';

// Configurable activity window for "Active" study (in days)
export const STUDY_ACTIVITY_WINDOW_DAYS = 7;
export const MAX_MESSAGE_LENGTH = 2000;

// Storage keys
const KEY_GATHERINGS = 'mahber_gatherings_v3';
const KEY_ATTENDANCE = 'mahber_attendance_v3';
const KEY_PERIODS = 'mahber_periods_v3';
const KEY_PAYMENTS = 'mahber_payments_v3';
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

const INITIAL_PERIODS: ContributionPeriod[] = [
  {
    id: 'per-meskerem-2019',
    name: 'Meskerem 2019',
    nameAm: 'መስከረም 2019',
    ethMonth: 'መስከረም',
    yearEth: '2019',
    expectedAmount: 500.0,
    status: 'active',
  },
  {
    id: 'per-tikimt-2018',
    name: 'Tikimt 2018',
    nameAm: 'ጥቅምት 2018',
    ethMonth: 'ጥቅምት',
    yearEth: '2018',
    expectedAmount: 500.0,
    status: 'closed',
  },
  {
    id: 'per-hidar-2018',
    name: 'Hidar 2018',
    nameAm: 'ኅዳር 2018',
    ethMonth: 'ኅዳር',
    yearEth: '2018',
    expectedAmount: 500.0,
    status: 'closed',
  },
];

const INITIAL_PAYMENTS: PaymentEntry[] = [
  { id: 'pay-1', memberId: 'm1', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '27 መስከረም 2019', note: 'ሙሉ ክፍያ', createdAt: '2026-10-01' },
  { id: 'pay-2', memberId: 'm2', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '27 መስከረም 2019', note: 'ሙሉ ክፍያ', createdAt: '2026-10-01' },
  { id: 'pay-3', memberId: 'm3', periodId: 'per-meskerem-2019', amount: 400, paymentDate: '25 መስከረም 2019', note: 'ከፊል ክፍያ (100 ብር ቀሪ)', createdAt: '2026-10-02' },
  { id: 'pay-4', memberId: 'm4', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '27 መስከረም 2019', createdAt: '2026-10-02' },
  { id: 'pay-5', memberId: 'm5', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '27 መስከረም 2019', createdAt: '2026-10-02' },
  { id: 'pay-6', memberId: 'm6', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '26 መስከረም 2019', createdAt: '2026-10-03' },
  { id: 'pay-7', memberId: 'm7', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '27 መስከረም 2019', createdAt: '2026-10-03' },
  { id: 'pay-8', memberId: 'm8', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '27 መስከረም 2019', createdAt: '2026-10-03' },
  { id: 'pay-9', memberId: 'm9', periodId: 'per-meskerem-2019', amount: 500, paymentDate: '27 መስከረም 2019', createdAt: '2026-10-03' },
  { id: 'pay-10', memberId: 'm10', periodId: 'per-meskerem-2019', amount: 100, paymentDate: '20 መስከረም 2019', note: 'ከፊል ክፍያ (400 ብር ቀሪ)', createdAt: '2026-10-04' },
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

  // Calculate overall Mahber financial totals across all 10 members
  getAdminFinancialOverview(activeMembersCount: number = 10): {
    expectedTotal: number;
    collectedTotal: number;
    outstandingTotal: number;
  } {
    const periods = this.getContributionPeriods();
    const activePeriod = periods.find((p) => p.status === 'active') || periods[0];
    const expectedPerMember = activePeriod ? activePeriod.expectedAmount : 500;
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

    const all = this.getMessages();
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'ከሰዓት' : 'ጠዋት'}`;

    const newMsg: RoomMessage = {
      id: `msg-${Date.now()}`,
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

    const updated = [...all, newMsg];
    localStorage.setItem(KEY_MESSAGES, JSON.stringify(updated));
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
}

export const mahberService = new MahberService();
