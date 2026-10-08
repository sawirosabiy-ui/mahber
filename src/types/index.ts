export type Role = 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  amharicName: string;
  baptismalName?: string;
  role: Role;
  phone: string;
  avatarUrl: string;
  attendanceRate?: number;
  isDeactivated?: boolean;
}

export type AttendanceStatus = 'coming' | 'cant_come' | 'no_response';
export type ActualAttendanceStatus = 'PRESENT' | 'EXCUSED' | 'LATE' | 'ABSENT';
export type AbsenceReasonCategory = 'work' | 'travel' | 'family' | 'personal' | 'health' | 'other';
export type AdminReviewStatus = 'accepted' | 'needs_review' | 'pending';

export interface GatheringAttendanceEntry {
  memberId: string;
  status: ActualAttendanceStatus;
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
