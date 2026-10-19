export type Role = 'admin' | 'member';

export type AdminRole =
  | 'super_admin'
  | 'management_admin'
  | 'finance_admin'
  | 'attendance_admin'
  | 'mezmur_admin';

export type MemberStatus = 'active' | 'temporarily_absent' | 'inactive';

export interface Member {
  id: string;
  name: string;
  amharicName: string;
  baptismalName?: string;
  email?: string;
  role: Role;
  roles?: AdminRole[];
  phone: string;
  avatarUrl: string;
  attendanceRate?: number;
  status?: MemberStatus;
  isDeactivated?: boolean;
  livesAbroad?: boolean;
  participationStatus?: 'in_person' | 'remote';
  remoteSince?: string;
  departedAt?: string;
  offboardingReason?: string;
  phoneVisibilityConsent?: boolean;
  spiritualRole?: string;
  functionalRole?: 'mezmur_leader' | 'bible_teacher';
}

export type AttendanceStatus = 'coming' | 'cant_come' | 'no_response';
export type ActualAttendanceStatus = 'PRESENT' | 'EXCUSED' | 'LATE' | 'ABSENT';
export type AbsenceReasonCategory = 'work' | 'travel' | 'family' | 'personal' | 'health' | 'abroad' | 'other';
export type AdminReviewStatus = 'accepted' | 'needs_review' | 'pending';

export interface GatheringAttendanceEntry {
  memberId: string;
  status: ActualAttendanceStatus;
  arrivalTime?: string;
  isLate?: boolean;
  isExcused?: boolean;
  exemptionReason?: string;
  penaltyAmount?: number;
  correctionReason?: string;
  note?: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  adminName: string;
  action: string;
  actionAm: string;
  targetType: 'member' | 'payment' | 'attendance' | 'gathering' | 'mezmur' | 'announcement' | 'system';
  targetId?: string;
  details?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  gatheringId: string;
  memberId: string;
  status: AttendanceStatus;
  // SENSITIVE: Only visible to authorized administrators
  privateReason?: AbsenceReasonCategory;
  privateNote?: string;
  adminReviewStatus?: AdminReviewStatus;
  updatedAt: string;
}

export interface ProgramItem {
  order: number;
  titleAm: string;
  titleEn: string;
}

export interface Gathering {
  id: string;
  title?: string;
  titleAm?: string;
  ethDate: string; // e.g. "27 መስከረም 2019"
  gregDate: string; // e.g. "October 7, 2026"
  gregDateRaw?: string; // ISO datetime string for client countdown
  time: string; // e.g. "6:00 ከሰዓት" / "6:00 PM"
  location: string; // e.g. "ቦሌ" / "Bole"
  locationDetails?: string;
  assignedHostId?: string;
  scheduledHostId?: string;
  actualLocation?: string;
  startTime?: string;
  biblePassage?: string;
  teachingNotes?: string;
  selectedMezmurIds?: string[];
  daysUntil: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  program: ProgramItem[];
  imageUrl?: string;
  notes?: string;
}

export interface ContributionPeriod {
  id: string;
  name: string;
  nameAm: string;
  ethMonth: string;
  yearEth: string;
  expectedAmount: number;
  status: 'active' | 'closed';
}

export interface PaymentEntry {
  id: string;
  memberId: string;
  periodId: string;
  amount: number;
  paymentDate: string;
  note?: string;
  isVoided?: boolean;
  recordedBy?: string;
  createdAt: string;
}

export interface PaymentMonthRecord {
  id: string;
  monthKey: string;
  monthNameAm: string;
  monthNameEn: string;
  yearEth: string;
  expected: number;
  paid: number;
  status: 'paid' | 'partial' | 'unpaid';
  paidDate?: string;
  note?: string;
  payments?: PaymentEntry[];
}

export interface MemberContribution {
  memberId: string;
  thisMonthExpected: number;
  thisMonthPaid: number;
  totalOutstanding: number;
  history: PaymentMonthRecord[];
}

export interface MezmurStanza {
  stanzaNumber: number;
  titleAm: string;
  titleEn: string;
  textAm: string;
  completed?: boolean;
}

export type MezmurCategoryKey =
  | 'marian'
  | 'christ'
  | 'praise'
  | 'repentance'
  | 'saints'
  | 'traditional'
  | 'other';

export interface Mezmur {
  id: string;
  titleAm: string;
  titleEn: string;
  categoryAm: string;
  categoryEn: string;
  category?: MezmurCategoryKey;
  description?: string;
  descriptionAm?: string;
  lyricsAm?: string;
  lyricsEn?: string;
  status: 'current_study' | 'new' | 'completed' | 'library';
  duration: string;
  audioUrl?: string;
  coverImageUrl?: string;
  stanzas: MezmurStanza[];
  notes?: string;
  dateAdded: string;
  voicesCount: number;
  isArchived?: boolean;
  studyProgress?: {
    currentStanza: number;
    totalStanzas: number;
  };
}

export interface MezmurSuggestion {
  id: string;
  mahberId: string;
  suggestedBy: string;
  suggestedByName: string;
  suggestedByAmharicName: string;
  title: string;
  titleAm: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface MezmurStudy {
  id: string;
  mezmurId: string;
  userId: string;
  gatheringId?: string;
  startedAt: string;
  targetDate?: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string; // Private reflection
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSession {
  id: string;
  studyId: string;
  userId: string;
  practiceDate: string; // YYYY-MM-DD (unique constraint with userId & studyId)
  practicedAt: string;
  durationMinutes?: number;
  note?: string; // Private note
  isPrivate: boolean;
  createdAt: string;
}

export type CalculatedStudyStatus = 'not_started' | 'started' | 'active' | 'completed';

export interface MemberStudyParticipation {
  memberId: string;
  memberName: string;
  memberAmharicName: string;
  avatarUrl: string;
  studyId?: string;
  calculatedStatus: CalculatedStudyStatus;
  startedAt?: string;
  lastPracticedDate?: string; // YYYY-MM-DD
  totalPracticeCount: number;
  isCompleted: boolean;
}

export interface MezmurParticipationSummary {
  mezmurId: string;
  mezmurTitleAm: string;
  mezmurTitleEn: string;
  totalMembers: number;
  activeCount: number;
  startedCount: number;
  notStartedCount: number;
  completedCount: number;
  memberParticipations: MemberStudyParticipation[];
}

export type RoomMessageType = 'chat' | 'prayer_request' | 'announcement';

export interface ReactionRecord {
  emoji: '🙏' | '❤️' | '✝️';
  count: number;
  memberIds: string[];
}

export interface MessageReplyInfo {
  id: string;
  senderAmharicName: string;
  senderName: string;
  text: string;
}

export interface RoomMessage {
  id: string;
  memberId: string;
  memberName: string;
  memberAmharicName: string;
  memberAvatar: string;
  isAdmin: boolean;
  type: RoomMessageType;
  text: string;
  attachmentUrl?: string;
  replyTo?: MessageReplyInfo;
  timestamp: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  isRemovedByAdmin?: boolean;
  reactions: ReactionRecord[];
}

export interface Announcement {
  id: string;
  mahberId: string;
  createdBy: string;
  authorName: string;
  authorAmharicName: string;
  title: string;
  titleAm: string;
  body: string;
  bodyAm: string;
  isPinned: boolean;
  isImportant: boolean;
  publishedAt: string;
  expiresAt?: string;
  deletedAt?: string;
}

export interface PrayerRequest {
  id: string;
  mahberId: string;
  userId: string;
  userName: string;
  userAmharicName: string;
  userAvatar: string;
  title: string;
  body: string;
  visibility: 'group' | 'private';
  status: 'active' | 'answered' | 'archived';
  prayerCount: number;
  hasPrayed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  userId: string;
  mahberId: string;
  mahberReminders: boolean;
  roomMessages: boolean;
  announcements: boolean;
  prayerRequests: boolean;
  contributionReminders: boolean;
  mezmurReminders: boolean;
  updatedAt: string;
}

export interface MahberNotification {
  id: string;
  type: 'mahber_reminder' | 'announcement' | 'room_message' | 'prayer_request' | 'contribution' | 'mezmur';
  title: string;
  body: string;
  dateEth: string;
  dateGreg: string;
  isRead: boolean;
  linkTab: 'home' | 'mahber' | 'room' | 'mezmur' | 'more';
  createdAt: string;
}

export interface GatheringPhoto {
  id: string;
  url: string;
  caption?: string;
  captionAm?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface HistoricalPresentMember {
  id: string;
  name: string;
  amharicName: string;
  avatarUrl: string;
}

export interface MahberHistoryGathering {
  id: string;
  gatheringId?: string;
  ethDate: string;
  gregDate: string;
  yearEth: string;
  monthNameAm?: string;
  monthNameEn?: string;
  location: string;
  locationDetails?: string;
  attendingCount: number;
  totalCount: number;
  presentMembers?: HistoricalPresentMember[];
  mezmurId?: string;
  mezmurAm: string;
  mezmurEn: string;
  notesAm?: string;
  notesEn?: string;
  memory?: string;
  memoryAm?: string;
  photos?: GatheringPhoto[];
  imageUrl?: string;
  completedAt?: string;
}

export type PenaltyType = 'late' | 'absence';
export type PenaltyStatus = 'pending' | 'paid' | 'waived';

export interface PenaltyRecord {
  id: string;
  memberId: string;
  gatheringId?: string;
  type: PenaltyType;
  amount: number; // 100 ETB for late, 200 ETB for absence
  reason?: string;
  reasonAm?: string;
  status: PenaltyStatus;
  waivedBy?: string;
  waiverReason?: string;
  recordedBy: string;
  createdAt: string;
  paidAt?: string;
}

export interface TransportPayment {
  id: string;
  memberId: string;
  amount: number;
  paidAt: string;
  note?: string;
  recordedBy: string;
}

export interface TransportCollection {
  id: string;
  gatheringId: string;
  title: string;
  titleAm: string;
  destination: string;
  agreedAmountPerMember: number;
  notes?: string;
  status: 'open' | 'closed';
  payments: TransportPayment[];
  createdAt: string;
}

export type FundCategory =
  | 'contribution'
  | 'late_penalty'
  | 'absence_penalty'
  | 'transport'
  | 'special_collection'
  | 'donation'
  | 'expense';

export interface SharedFundTransaction {
  id: string;
  type: 'income' | 'expense';
  category: FundCategory;
  amount: number;
  purpose: string;
  purposeAm?: string;
  date: string;
  relatedGatheringId?: string;
  relatedProposalId?: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface ProposalVote {
  memberId: string;
  vote: 'favor' | 'against';
  votedAt: string;
}

export interface SpendingProposal {
  id: string;
  title: string;
  titleAm: string;
  description: string;
  descriptionAm?: string;
  amount: number;
  category: string;
  proposedBy: string;
  proposedByName: string;
  status: 'active' | 'approved' | 'rejected' | 'executed';
  votes: ProposalVote[];
  targetExpenseId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface HostingSwapRecord {
  id: string;
  gatheringId: string;
  originalHostId: string;
  substituteHostId: string;
  reason: string;
  reasonAm?: string;
  approvedBy: string;
  createdAt: string;
}

export interface PaintingHandoverRecord {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  gatheringId: string;
  confirmedDate: string;
  recordedBy: string;
  notes?: string;
}

export interface PaintingRotationState {
  rotationOrder: string[]; // member IDs in scheduled order
  currentHolderId: string;
  nextAssignedHostId: string;
  scheduledHostId: string;
  currentGatheringLocation: string;
  swaps: HostingSwapRecord[];
  handovers: PaintingHandoverRecord[];
}

export interface MemberInvitation {
  id: string;
  memberId: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
}

export type FinancialAccountId = 'core_treasury' | 'gathering_logistics_escrow';

export interface FinancialAccount {
  id: FinancialAccountId;
  name: string;
  nameAm: string;
  accountType: 'treasury' | 'escrow';
  balance: number;
  updatedAt?: string;
}

export type FinancialLedgerEntryType =
  | 'debit'
  | 'credit'
  | 'reversal'
  | 'transfer'
  | 'adjustment_write_off';

export interface FinancialLedgerEntry {
  id: string;
  accountId: FinancialAccountId;
  entryType: FinancialLedgerEntryType;
  category: string;
  memberId?: string;
  amount: number;
  gatheringId?: string;
  relatedAttendanceId?: string;
  relatedPenaltyId?: string;
  reversesEntryId?: string;
  idempotencyKey?: string;
  description: string;
  descriptionAm: string;
  recordedBy: string;
  createdAt: string;
}

export interface SplitPaymentAllocation {
  accountId: FinancialAccountId;
  category: string;
  amount: number;
  description: string;
  descriptionAm: string;
}

export interface SacredObjectRecord {
  id: string;
  name: string;
  nameAm: string;
  description?: string;
}

export interface SacredObjectCustodyRecord {
  id: string;
  objectId: string;
  holderId: string;
  isCurrentActiveHolder: boolean;
  confirmedAt?: string;
  confirmedBy: string;
  notes?: string;
  createdAt: string;
}

export interface GatheringHostRecord {
  id: string;
  gatheringId: string;
  assignedHostId: string;
  actualHostId: string;
  isSwapped: boolean;
  swapReason?: string;
  swapReasonAm?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface ProposalGovernanceRecord {
  proposalId: string;
  eligibleMemberIds: string[];
  quorumThreshold: number;
  deadlineAt: string;
  isClosed: boolean;
  finalOutcome: 'pending' | 'approved' | 'rejected' | 'tied' | 'no_quorum';
  totalVotesCast: number;
  inFavorCount: number;
  againstCount: number;
  abstainCount: number;
  closedAt?: string;
  closedBy?: string;
}

export interface ReminderQueueEntry {
  id: string;
  gatheringId: string;
  triggerType: '72_hours' | '24_hours' | 'custom';
  scheduledFor: string;
  channel: 'in_app' | 'telegram';
  recipientId?: string;
  status: 'pending' | 'delivered' | 'failed' | 'cancelled';
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  dedupKey: string;
  createdAt: string;
}

export interface TelegramDispatchLog {
  id: string;
  gatheringId?: string;
  announcementId?: string;
  messageType: 'gathering_reminder' | 'official_announcement' | 'proposal_approved';
  recipientChatId: string;
  deliveredAt: string;
  dedupKey: string;
  status: 'sent' | 'failed';
}

export interface MezmurAudioFileRecord {
  id: string;
  mezmurId: string;
  fileName: string;
  storageProvider: 'supabase' | 'cloudflare_r2';
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  estimatedBitrateKbps?: number;
  uploadedBy: string;
  totalDownloadsCount: number;
  totalEgressBytes: number;
  createdAt: string;
}

export interface MemberOffboardingRecord {
  id: string;
  memberId: string;
  offboardedBy: string;
  reason: string;
  reasonAm?: string;
  outstandingDebtAmount: number;
  debtDisposition: 'collectible' | 'written_off';
  writeOffLedgerEntryId?: string;
  advanceBalanceAmount: number;
  advanceDisposition: 'refunded' | 'transferred_to_treasury' | 'none';
  advanceLedgerEntryId?: string;
  custodyReassignedTo?: string;
  offboardedAt: string;
}

export interface OfflineSyncIntent {
  id: string;
  actionType: string;
  payload: Record<string, unknown>;
  timestamp: string;
  idempotencyKey: string;
  status: 'pending' | 'synced' | 'rejected' | 'conflict';
  error?: string;
}

