import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'am' | 'en';

export interface Translations {
  // App Bar & Brand
  appTitle: string;
  appTitleEn: string;
  appMotto: string;
  welcomeInGodsName: string;

  // Nav
  navHome: string;
  navMahber: string;
  navRoom: string;
  navMezmur: string;
  navMore: string;
  navAdmin: string;

  // Member Home
  nextMahber: string;
  daysRemaining: string;
  location: string;
  time: string;
  yourStatus: string;
  statusAttendance: string;
  statusContribution: string;
  statusComing: string;
  statusCantCome: string;
  statusNoResponse: string;
  statusPaid: string;
  statusOutstanding: string;
  btnImComing: string;
  btnCantCome: string;
  currentMezmur: string;
  btnOpenMezmur: string;
  roomActivity: string;
  newMessages: string;

  // Attendance Modal
  cantAttendTitle: string;
  cantAttendSubtitle: string;
  privacyGuarantee: string;
  reasonWork: string;
  reasonTravel: string;
  reasonFamily: string;
  reasonPersonal: string;
  reasonHealth: string;
  reasonOther: string;
  optionalNotePlaceholder: string;
  btnSubmitAbsence: string;
  absenceSubmittedToast: string;
  btnCancel: string;

  // Mahber Screen
  tabDate: string;
  tabProgram: string;
  tabHistory: string;
  todaysProgram: string;
  attendanceRoster: string;
  attendingOutOf: string;
  programOpeningPrayer: string;
  programMezmur: string;
  programScripture: string;
  programDiscussion: string;
  programClosingPrayer: string;
  btnViewDetails: string;
  gatheringAddress: string;

  // Contribution Screen
  myContribution: string;
  thisMonth: string;
  paidAmount: string;
  remainingAmount: string;
  paymentHistory: string;
  currencyEtb: string;
  btnViewFullHistory: string;
  contributionPrivacyNotice: string;

  // Mezmur Screen
  mezmurLibrary: string;
  searchMezmurPlaceholder: string;
  filterCurrent: string;
  filterNew: string;
  filterCompleted: string;
  filterAll: string;
  stanzas: string;
  categoryMary: string;
  categoryMichael: string;
  categoryMedhanialem: string;
  categoryWorship: string;
  btnLyrics: string;
  btnAudio: string;
  btnPracticeReport: string;
  audioDuration: string;
  voicesCount: string;

  // Room Screen
  privateRoomTitle: string;
  roomTagline: string;
  tabAll: string;
  tabReadings: string;
  tabPrayers: string;
  tabAnnouncements: string;
  messagePlaceholder: string;
  prayerRequestLabel: string;
  announcementBadge: string;

  // More / Settings
  moreTitle: string;
  profileTitle: string;
  languageSelect: string;
  themeSelect: string;
  themeDark: string;
  themeLight: string;
  mahberHistory: string;
  aboutMahber: string;
  aboutDescription: string;
  switchUser: string;
  activeRole: string;
  roleAdmin: string;
  roleMember: string;

  // Admin
  adminDashboardTitle: string;
  adminMembersCount: string;
  adminComingCount: string;
  adminCantComeCount: string;
  adminNoResponseCount: string;
  adminCollected: string;
  adminOutstanding: string;
  adminQuickActions: string;
  adminPrivateReason: string;
  adminRecordPayment: string;
  adminMarkPaid: string;
  adminReviewStatus: string;
  adminAcceptReason: string;
  adminNeedsReview: string;
  adminMaxAdminsNotice: string;
  adminAddMember: string;
  adminEditMember: string;
}

const translations: Record<Language, Translations> = {
  am: {
    appTitle: 'መድኃኔዓለም ማኅበር',
    appTitleEn: 'MEDHANIALEM MAHBER',
    appMotto: 'አንድ ማኅበር ፣ አንድ ቤተክርስቲያን',
    welcomeInGodsName: 'በእግዚአብሔር ስም',

    navHome: 'ቤት',
    navMahber: 'ማኅበር',
    navRoom: 'ክፍል',
    navMezmur: 'መዝሙር',
    navMore: 'ተጨማሪ',
    navAdmin: 'አስተዳደር',

    nextMahber: 'የሚቀጥለው ማኅበር',
    daysRemaining: 'ቀናት ቀርተዋል',
    location: 'ቦሌ',
    time: '6:00 ከሰዓት',
    yourStatus: 'የእርስዎ ሁኔታ',
    statusAttendance: 'መገኘት',
    statusContribution: 'ክፍያ',
    statusComing: 'እመጣለሁ',
    statusCantCome: 'አልመጣም',
    statusNoResponse: 'አልተመለሰም',
    statusPaid: 'ተከፍሏል',
    statusOutstanding: 'ቀሪ ክፍያ',
    btnImComing: 'እኔ እመጣለሁ',
    btnCantCome: 'አልመጣም',
    currentMezmur: 'የአሁን መዝሙር',
    btnOpenMezmur: 'መዝሙር ክፈት',
    roomActivity: 'የማኅበር ክፍል',
    newMessages: 'አዳዲስ መልዕክቶች',

    cantAttendTitle: 'መሳተፍ አልችልም?',
    cantAttendSubtitle: 'እባክዎን ምክንያትዎን ይምረጡ። ይህ መረጃ ለአስተዳዳሪዎች ብቻ በምስጢር የተያዘ ነው።',
    privacyGuarantee: '🔒 ይህ ምክንያት ሙሉ በሙሉ ሚስጥራዊ ነው። ሌሎች አባላት ማየት አይችሉም፤ ለሁለቱ አስተዳዳሪዎች ብቻ ይታያል።',
    reasonWork: 'ሥራ / የሥራ ጉዳይ',
    reasonTravel: 'ጉዞ / ከከተማ ውጪ',
    reasonFamily: 'የቤተሰብ ጉዳይ',
    reasonPersonal: 'የግል ጉዳይ',
    reasonHealth: 'የጤና እክል',
    reasonOther: 'ሌላ ምክንያት',
    optionalNotePlaceholder: 'ተጨማሪ ማስታወሻ (አስገዳጅ አይደለም)...',
    btnSubmitAbsence: 'ምክንያት አስገባ',
    absenceSubmittedToast: 'ምክንያትዎ በአስተዳዳሪዎች ዘንድ ተመዝግቧል።',
    btnCancel: 'ተመለስ',

    tabDate: 'ቀን',
    tabProgram: 'መርሐ ግብር',
    tabHistory: 'ታሪክ',
    todaysProgram: 'የዛሬ መርሐ ግብር',
    attendanceRoster: 'የአባላት መገኘት',
    attendingOutOf: 'ተገኝተዋል',
    programOpeningPrayer: 'የመክፈቻ ጸሎት',
    programMezmur: 'መዝሙር እና ማህሌት',
    programScripture: 'የቅዱስ መጽሐፍ ንባብ',
    programDiscussion: 'ትምህርት እና ውይይት',
    programClosingPrayer: 'የመዝጊያ ጸሎት እና ቡራኬ',
    btnViewDetails: 'ዝርዝር መረጃ',
    gatheringAddress: 'የአቶ ዳዊት መኖሪያ ቤት፣ ቦሌ',

    myContribution: 'የእኔ መዋጮ',
    thisMonth: 'ይህ ወር',
    paidAmount: 'የተከፈለ',
    remainingAmount: 'ቀሪ ክፍያ',
    paymentHistory: 'የቅርብ ክፍያ ታሪክ',
    currencyEtb: 'ብር',
    btnViewFullHistory: 'የክፍያ ታሪክ ይመልከቱ',
    contributionPrivacyNotice: '🔒 የእርስዎ የክፍያ ሁኔታ ሙሉ በሙሉ ሚስጥራዊ ነው። ሌሎች አባላት የእርስዎን ቀሪ ሂሳብ ማየት አይችሉም።',

    mezmurLibrary: 'የመዝሙር ቤተ-መጽሐፍት',
    searchMezmurPlaceholder: 'መዝሙር ፈልግ...',
    filterCurrent: 'የአሁን ጥናት',
    filterNew: 'አዳዲስ',
    filterCompleted: 'የተጠናቀቁ',
    filterAll: 'ሁሉም',
    stanzas: 'ምዕራፎች',
    categoryMary: 'ማርያም',
    categoryMichael: 'ሚካኤል',
    categoryMedhanialem: 'መድኃኔዓለም',
    categoryWorship: 'አምልኮ',
    btnLyrics: 'ግጥም',
    btnAudio: 'ድምፅ',
    btnPracticeReport: 'የዛሬ ልምምድ ሪፖርት ላክ',
    audioDuration: 'የድምፅ ርዝመት',
    voicesCount: 'ድምፆች',

    privateRoomTitle: 'የማኅበር ክፍል',
    roomTagline: 'የግል ቅዱስ ኅብረት እና መረዳዳት',
    tabAll: 'ሁሉም',
    tabReadings: 'ንባባት',
    tabPrayers: 'ጸሎት',
    tabAnnouncements: 'ማስታወቂያ',
    messagePlaceholder: 'መልእክት ጻፉ...',
    prayerRequestLabel: 'የጸሎት ጥያቄ',
    announcementBadge: 'የማኅበር ማስታወቂያ',

    moreTitle: 'ቅንብሮች እና መረጃ',
    profileTitle: 'የአባልነት መረጃ',
    languageSelect: 'ቋንቋ (Language)',
    themeSelect: 'ገጽታ (Theme)',
    themeDark: 'ጨለማ (Dark)',
    themeLight: 'ብርሃን (Light)',
    mahberHistory: 'የማኅበር ታሪክ',
    aboutMahber: 'ስለ መድኃኔዓለም ማኅበር',
    aboutDescription: 'በኦርቶዶክሳዊት ተዋሕዶ እምነት እና ወንድማማችነት የተመሰረተ 10 አባላት ያሉት የግል ማኅበር።',
    switchUser: 'አባል ቀይር (ሙከራ)',
    activeRole: 'የአሁን ሚና',
    roleAdmin: 'አስተዳዳሪ (Admin)',
    roleMember: 'አባል (Member)',

    adminDashboardTitle: 'የአስተዳደር ገጽ',
    adminMembersCount: 'አባላት',
    adminComingCount: 'መገኘት',
    adminCantComeCount: 'አይመጡም',
    adminNoResponseCount: 'አልተመለሰም',
    adminCollected: 'የተሰበሰበ',
    adminOutstanding: 'ያልተሰበሰበ',
    adminQuickActions: 'ፈጣን እርምጃዎች',
    adminPrivateReason: 'የቀረበ የግል ምክንያት (ሚስጥራዊ)',
    adminRecordPayment: 'ክፍያ መዝግብ',
    adminMarkPaid: 'እንደ ተከፈለ ምልክት አድርግ',
    adminReviewStatus: 'የአስተዳዳሪ ግምገማ',
    adminAcceptReason: 'ተቀባይነት አግኝቷል',
    adminNeedsReview: 'ክትትል ያስፈልገዋል',
    adminMaxAdminsNotice: 'ደንብ: በማኅበሩ ውስጥ ከ 2 አስተዳዳሪዎች በላይ መኖር አይቻልም።',
    adminAddMember: 'አዲስ አባል አክል',
    adminEditMember: 'አባል አድስ',
  },
  en: {
    appTitle: 'Medhanialem Mahber',
    appTitleEn: 'MEDHANIALEM MAHBER',
    appMotto: 'One Fellowship, One Holy Church',
    welcomeInGodsName: 'In the Name of God',

    navHome: 'Home',
    navMahber: 'Mahber',
    navRoom: 'Room',
    navMezmur: 'Mezmur',
    navMore: 'More',
    navAdmin: 'Admin',

    nextMahber: 'Next Mahber',
    daysRemaining: 'Days Left',
    location: 'Bole',
    time: '6:00 PM',
    yourStatus: 'Your Status',
    statusAttendance: 'Attendance',
    statusContribution: 'Contribution',
    statusComing: 'Coming',
    statusCantCome: "Can't Come",
    statusNoResponse: 'No Response',
    statusPaid: 'Paid',
    statusOutstanding: 'Outstanding',
    btnImComing: "I'm Coming",
    btnCantCome: "I Can't Come",
    currentMezmur: 'Current Mezmur',
    btnOpenMezmur: 'Open Mezmur',
    roomActivity: 'Private Room',
    newMessages: 'New Messages',

    cantAttendTitle: "Can't attend?",
    cantAttendSubtitle: 'Please select your reason. This information remains strictly private with administrators.',
    privacyGuarantee: '🔒 This reason is strictly private. Normal members cannot see it; only the two administrators have access.',
    reasonWork: 'Work commitment',
    reasonTravel: 'Travel / Out of town',
    reasonFamily: 'Family matter',
    reasonPersonal: 'Personal matter',
    reasonHealth: 'Health / Medical',
    reasonOther: 'Other reason',
    optionalNotePlaceholder: 'Optional private note for admins...',
    btnSubmitAbsence: 'Submit Absence',
    absenceSubmittedToast: 'Your absence was recorded privately for administrators.',
    btnCancel: 'Cancel',

    tabDate: 'Date',
    tabProgram: 'Program',
    tabHistory: 'History',
    todaysProgram: "Today's Program",
    attendanceRoster: 'Member Attendance',
    attendingOutOf: 'Attending',
    programOpeningPrayer: 'Opening Prayer',
    programMezmur: 'Mezmur & Chants',
    programScripture: 'Holy Scripture Reading',
    programDiscussion: 'Teaching & Reflection',
    programClosingPrayer: 'Closing Prayer & Blessing',
    btnViewDetails: 'View Details',
    gatheringAddress: 'Brother Dawit Residence, Bole',

    myContribution: 'My Contribution',
    thisMonth: 'This Month',
    paidAmount: 'Paid',
    remainingAmount: 'Remaining',
    paymentHistory: 'Recent Payment History',
    currencyEtb: 'ETB',
    btnViewFullHistory: 'View Full History',
    contributionPrivacyNotice: '🔒 Your contribution details are strictly confidential. Other members cannot see your financial standing.',

    mezmurLibrary: 'Mezmur Library',
    searchMezmurPlaceholder: 'Search Mezmur...',
    filterCurrent: 'Current Study',
    filterNew: 'New',
    filterCompleted: 'Completed',
    filterAll: 'All',
    stanzas: 'Stanzas',
    categoryMary: 'Saint Mary',
    categoryMichael: 'Saint Michael',
    categoryMedhanialem: 'Medhanialem',
    categoryWorship: 'Worship',
    btnLyrics: 'Lyrics',
    btnAudio: 'Audio',
    btnPracticeReport: 'Send Practice Report',
    audioDuration: 'Duration',
    voicesCount: 'Parts',

    privateRoomTitle: 'Mahber Room',
    roomTagline: 'Private sacred fellowship & prayers',
    tabAll: 'All',
    tabReadings: 'Readings',
    tabPrayers: 'Prayers',
    tabAnnouncements: 'Announcements',
    messagePlaceholder: 'Write a message...',
    prayerRequestLabel: 'Prayer Request',
    announcementBadge: 'Mahber Announcement',

    moreTitle: 'Settings & Info',
    profileTitle: 'Member Profile',
    languageSelect: 'Language (ቋንቋ)',
    themeSelect: 'Theme (ገጽታ)',
    themeDark: 'Dark (ጨለማ)',
    themeLight: 'Light (ብርሃን)',
    mahberHistory: 'Mahber History',
    aboutMahber: 'About Medhanialem Mahber',
    aboutDescription: 'A private fellowship of 10 Ethiopian Orthodox Christians gathered in unity and faith.',
    switchUser: 'Switch Active Member (Demo)',
    activeRole: 'Active Role',
    roleAdmin: 'Administrator (Admin)',
    roleMember: 'Member',

    adminDashboardTitle: 'Admin Dashboard',
    adminMembersCount: 'Members',
    adminComingCount: 'Coming',
    adminCantComeCount: "Can't Attend",
    adminNoResponseCount: 'No Response',
    adminCollected: 'Collected',
    adminOutstanding: 'Outstanding',
    adminQuickActions: 'Quick Actions',
    adminPrivateReason: 'Submitted Private Reason',
    adminRecordPayment: 'Record Payment',
    adminMarkPaid: 'Mark as Paid',
    adminReviewStatus: 'Admin Review',
    adminAcceptReason: 'Accepted',
    adminNeedsReview: 'Needs Review',
    adminMaxAdminsNotice: 'Rule: The Mahber cannot have more than 2 active administrators.',
    adminAddMember: 'Add Member',
    adminEditMember: 'Edit Member',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mahber_lang');
    return (saved === 'en' || saved === 'am') ? saved : 'am';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mahber_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
