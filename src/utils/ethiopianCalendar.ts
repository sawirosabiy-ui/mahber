/**
 * Dedicated Ethiopian Orthodox Calendar & Date Utility
 *
 * Implements standard Julian-Day-based Ethiopian <-> Gregorian calendar conversions,
 * bilingual formatting (Amharic & English), dynamic countdown calculations,
 * and next Mahber gathering date projections.
 */

export interface EthiopianDate {
  year: number;
  month: number; // 1 to 13
  day: number;   // 1 to 30 (or 1 to 6 in Pagumen)
  monthNameAm: string;
  monthNameEn: string;
}

export const ETHIOPIAN_MONTHS: { am: string; en: string }[] = [
  { am: 'መስከረም', en: 'Meskerem' }, // 1
  { am: 'ጥቅምት', en: 'Tikimt' },     // 2
  { am: 'ኅዳር', en: 'Hidar' },       // 3
  { am: 'ታኅሣሥ', en: 'Tahsas' },     // 4
  { am: 'ጥር', en: 'Tir' },           // 5
  { am: 'የካቲት', en: 'Yekatit' },   // 6
  { am: 'መጋቢት', en: 'Megabit' },   // 7
  { am: 'ሚያዝያ', en: 'Miyazya' },   // 8
  { am: 'ግንቦት', en: 'Ginbot' },     // 9
  { am: 'ሰኔ', en: 'Sene' },         // 10
  { am: 'ሐምሌ', en: 'Hamle' },       // 11
  { am: 'ነሐሴ', en: 'Nehase' },     // 12
  { am: 'ጳጉሜን', en: 'Pagumen' },   // 13
];

// Gregorian Month Names for secondary display
const GREGORIAN_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
/**
 * Computes Julian Day Number from an Ethiopian Calendar date.
 * Epoch: Meskerem 1, 1 EC = JDN 1723856.
 * Each 4-year cycle has 1461 days: 365, 365, 366 (leap), 365 days.
 * An Ethiopian year is a leap year (with 6 days in Pagumen) when (year % 4 === 3).
 */
export function ethiopianToJdn(year: number, month: number, day: number): number {
  return (
    1723856 +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
}

/**
 * Converts a Julian Day Number to Ethiopian Calendar representation.
 */
export function jdnToEthiopian(jdn: number): { year: number; month: number; day: number } {
  const daysSinceEpoch = jdn - 1723856;
  const cycle4 = Math.floor(daysSinceEpoch / 1461);
  const dayInCycle = ((daysSinceEpoch % 1461) + 1461) % 1461;

  let yearInCycle = 1;
  let dayInYear = dayInCycle;

  if (dayInCycle < 365) {
    yearInCycle = 1;
    dayInYear = dayInCycle;
  } else if (dayInCycle < 730) {
    yearInCycle = 2;
    dayInYear = dayInCycle - 365;
  } else if (dayInCycle < 1096) {
    // 3rd year in 4-year cycle is leap year (366 days, Pagumen 6)
    yearInCycle = 3;
    dayInYear = dayInCycle - 730;
  } else {
    yearInCycle = 4;
    dayInYear = dayInCycle - 1096;
  }

  const year = cycle4 * 4 + yearInCycle;
  const month = Math.floor(dayInYear / 30) + 1;
  const day = (dayInYear % 30) + 1;
  return { year, month, day };
}

/**
 * Computes Julian Day Number from a Gregorian date.
 */
export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Converts a Julian Day Number to Gregorian date components.
 */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l2 + 1)) / 1461001);
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l3) / 2447);
  const day = l3 - Math.floor((2447 * j) / 80);
  const l4 = Math.floor(j / 11);
  const month = j + 2 - 12 * l4;
  const year = 100 * (n - 49) + i + l4;
  return { year, month, day };
}

/**
 * Checks if an Ethiopian year is a leap year (Pagumen has 6 days).
 */
export function isEthiopianLeapYear(ethYear: number): boolean {
  return ((ethYear % 4) + 4) % 4 === 3;
}

/**
 * Converts a Gregorian Date to Ethiopian Calendar representation
 */
export function gregorianToEthiopian(date: Date): EthiopianDate {
  const jdn = gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const eth = jdnToEthiopian(jdn);

  const validMonth = Math.min(Math.max(eth.month, 1), 13);
  const monthInfo = ETHIOPIAN_MONTHS[validMonth - 1] || ETHIOPIAN_MONTHS[0];

  return {
    year: eth.year,
    month: validMonth,
    day: eth.day,
    monthNameAm: monthInfo.am,
    monthNameEn: monthInfo.en,
  };
}

/**
 * Converts an Ethiopian Date (year, month 1-13, day 1-30) to a JavaScript Date (Gregorian)
 */
export function ethiopianToGregorian(ethYear: number, ethMonth: number, ethDay: number): Date {
  const jdn = ethiopianToJdn(ethYear, ethMonth, ethDay);
  const greg = jdnToGregorian(jdn);
  return new Date(greg.year, greg.month - 1, greg.day);
}

/**
 * Formats a Gregorian Date into bilingual primary (Ethiopian) and secondary (Gregorian) strings
 */
export function formatBilingualDate(
  date: Date,
  lang: 'am' | 'en'
): { primary: string; secondary: string; ethDateStr: string; gregDateStr: string } {
  const eth = gregorianToEthiopian(date);
  const monthName = lang === 'am' ? eth.monthNameAm : eth.monthNameEn;

  const ethDateStr = `${eth.day} ${monthName} ${eth.year}`;
  const gregDateStr = `${GREGORIAN_MONTHS_EN[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  return {
    primary: ethDateStr,
    secondary: gregDateStr,
    ethDateStr,
    gregDateStr,
  };
}

/**
 * Calculates a human-readable dynamic countdown from current local time to the target gathering date.
 * Returns formatted labels such as "20 DAYS", "2 DAYS", "5 HOURS", "45 MINUTES".
 */
export function calculateGatheringCountdown(
  targetDate: Date,
  timeStr: string = '18:00'
): {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  labelAm: string;
  labelEn: string;
  isPast: boolean;
} {
  const now = new Date();
  const gatheringDateTime = new Date(targetDate);

  // Parse hours and minutes from time string (e.g. "6:00 PM" or "18:00")
  let hours = 18;
  let minutes = 0;
  if (timeStr) {
    const isPM = timeStr.toLowerCase().includes('pm') || timeStr.includes('ከሰዓት');
    const cleaned = timeStr.replace(/[^0-9:]/g, '');
    const parts = cleaned.split(':');
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      if (isPM && h < 12) h += 12;
      hours = h;
      minutes = parseInt(parts[1], 10) || 0;
    }
  }

  gatheringDateTime.setHours(hours, minutes, 0, 0);

  const diffMs = gatheringDateTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalHours: 0,
      labelAm: 'ዛሬ ይካሄዳል (Today)',
      labelEn: 'Gathering Today',
      isPast: true,
    };
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const remainingHours = diffHours % 24;
  const remainingMinutes = diffMinutes % 60;

  let labelAm = '';
  let labelEn = '';

  if (diffDays >= 1) {
    labelAm = `${diffDays} ቀናት ቀርተዋል`;
    labelEn = `${diffDays} DAYS LEFT`;
  } else if (diffHours >= 1) {
    labelAm = `${diffHours} ሰዓታት ቀርተዋል`;
    labelEn = `${diffHours} HOURS LEFT`;
  } else {
    labelAm = `${Math.max(1, remainingMinutes)} ደቂቃዎች ቀርተዋል`;
    labelEn = `${Math.max(1, remainingMinutes)} MINUTES LEFT`;
  }

  return {
    days: diffDays,
    hours: remainingHours,
    minutes: remainingMinutes,
    totalHours: diffHours,
    labelAm,
    labelEn,
    isPast: false,
  };
}

/**
 * Projects the upcoming Mahber date for a configured Mahber day (e.g. day 27)
 */
export function getNextMahberProjectedDate(configuredMahberDay: number = 27): {
  ethYear: number;
  ethMonth: number;
  ethDay: number;
  gregDate: Date;
  ethDateAm: string;
  ethDateEn: string;
  gregDateStr: string;
} {
  const today = new Date();
  const currentEth = gregorianToEthiopian(today);

  let targetEthMonth = currentEth.month;
  let targetEthYear = currentEth.year;

  // If today's day has already passed the configured Mahber day, advance to next Ethiopian month
  if (currentEth.day >= configuredMahberDay) {
    targetEthMonth += 1;
    if (targetEthMonth > 13) {
      targetEthMonth = 1;
      targetEthYear += 1;
    }
  }

  // Pagumen has only 5 or 6 days, so skip to Meskerem if day 27 exceeds Pagumen days
  if (targetEthMonth === 13 && configuredMahberDay > 6) {
    targetEthMonth = 1;
    targetEthYear += 1;
  }

  const gregDate = ethiopianToGregorian(targetEthYear, targetEthMonth, configuredMahberDay);
  const monthInfo = ETHIOPIAN_MONTHS[targetEthMonth - 1] || ETHIOPIAN_MONTHS[0];

  const ethDateAm = `${configuredMahberDay} ${monthInfo.am} ${targetEthYear}`;
  const ethDateEn = `${configuredMahberDay} ${monthInfo.en} ${targetEthYear}`;
  const gregDateStr = `${GREGORIAN_MONTHS_EN[gregDate.getMonth()]} ${gregDate.getDate()}, ${gregDate.getFullYear()}`;

  return {
    ethYear: targetEthYear,
    ethMonth: targetEthMonth,
    ethDay: configuredMahberDay,
    gregDate,
    ethDateAm,
    ethDateEn,
    gregDateStr,
  };
}

/**
 * Calculates authoritative UTC and local timestamps for an Ethiopian Mahber gathering.
 * Timezone: East Africa Time (EAT = UTC+3). Default start time: 15:00 (3:00 PM).
 */
export function getGatheringTimestamps(
  ethYear: number,
  ethMonth: number,
  ethDay: number = 27,
  localTimeStr: string = '15:00'
): {
  gregorianDate: Date;
  utcGatheringTimestamp: string;
  reminder72hTimestamp: string;
  reminder24hTimestamp: string;
  ethDateAm: string;
  ethDateEn: string;
} {
  const gregDate = ethiopianToGregorian(ethYear, ethMonth, ethDay);
  
  // Parse local hours and minutes (EAT = UTC+3)
  let hours = 15;
  let minutes = 0;
  if (localTimeStr) {
    const parts = localTimeStr.split(':');
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10) || 15;
      minutes = parseInt(parts[1], 10) || 0;
    }
  }

  // Set UTC equivalent: local EAT (UTC+3) -> UTC = localHour - 3
  const utcDate = new Date(Date.UTC(gregDate.getFullYear(), gregDate.getMonth(), gregDate.getDate(), hours - 3, minutes, 0, 0));
  
  const reminder72h = new Date(utcDate.getTime() - 72 * 60 * 60 * 1000);
  const reminder24h = new Date(utcDate.getTime() - 24 * 60 * 60 * 1000);

  const monthInfo = ETHIOPIAN_MONTHS[ethMonth - 1] || ETHIOPIAN_MONTHS[0];

  return {
    gregorianDate: gregDate,
    utcGatheringTimestamp: utcDate.toISOString(),
    reminder72hTimestamp: reminder72h.toISOString(),
    reminder24hTimestamp: reminder24h.toISOString(),
    ethDateAm: `${ethDay} ${monthInfo.am} ${ethYear}`,
    ethDateEn: `${ethDay} ${monthInfo.en} ${ethYear}`,
  };
}
