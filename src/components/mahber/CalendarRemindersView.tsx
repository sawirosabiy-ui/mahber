import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Gathering } from '../../types';
import { ETHIOPIAN_MONTHS } from '../../utils/ethiopianCalendar';
import {
  Bell,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CalendarRemindersViewProps {
  currentGathering: Gathering | null;
  onSelectGathering?: (gathering: Gathering) => void;
}

export const CalendarRemindersView: React.FC<CalendarRemindersViewProps> = ({
  currentGathering,
  onSelectGathering,
}) => {
  const { language } = useLanguage();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); // 0 = Meskerem
  const [calendarMode, setCalendarMode] = useState<'ethiopian' | 'gregorian'>('ethiopian');
  const [selectedDay, setSelectedDay] = useState<number>(27);

  const monthObj = ETHIOPIAN_MONTHS[selectedMonthIndex] || ETHIOPIAN_MONTHS[0];
  const monthName = language === 'am' ? monthObj.am : monthObj.en;
  const yearEth = 2018;

  // Calendar days grid: 1 to 30 for regular Ethiopian months
  const daysInMonth = selectedMonthIndex === 12 ? 5 : 30;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Weekday headers
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaysAm = ['እሁድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];
  const weekdays = language === 'am' ? weekdaysAm : weekdaysEn;

  return (
    <div className="space-y-4">
      {/* Calendar System Switcher matching Photo 7 Screen 4 */}
      <div className="flex bg-[#141A17] p-1 rounded-xl border border-[#B89A5A]/20">
        <button
          type="button"
          onClick={() => setCalendarMode('ethiopian')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            calendarMode === 'ethiopian'
              ? 'bg-[#B89A5A] text-[#0E1210] font-bold shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የኢትዮጵያ ዘመን አቆጣጠር' : 'Ethiopian Calendar'}
        </button>
        <button
          type="button"
          onClick={() => setCalendarMode('gregorian')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            calendarMode === 'gregorian'
              ? 'bg-[#B89A5A] text-[#0E1210] font-bold shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የፈረንጆች ቀን (Gregorian)' : 'Gregorian Calendar'}
        </button>
      </div>

      {/* Month Navigation Header */}
      <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : 12))}
            className="p-1.5 rounded-lg bg-[#1B2420] text-[#B89A5A] hover:bg-[#B89A5A]/20 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <h3 className="text-base font-bold text-[#F5EFE3]">
              {monthName} {yearEth}
            </h3>
            <span className="text-[11px] text-[#9E9484]">
              {calendarMode === 'ethiopian'
                ? '(Sep 11 – Oct 10, 2025)'
                : '(Gregorian Equivalent)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMonthIndex((prev) => (prev < 12 ? prev + 1 : 0))}
            className="p-1.5 rounded-lg bg-[#1B2420] text-[#B89A5A] hover:bg-[#B89A5A]/20 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekdays.map((wd, i) => (
            <div key={i} className="text-[10px] font-semibold text-[#9E9484]">
              {wd}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const isGathering = d === 27;
            const isReminder = d === 24 || d === 26;
            const isSelected = selectedDay === d;
            const isPast = d < 24;

            let bgClass = 'bg-[#1B2420]/50 text-[#F5EFE3] hover:bg-[#1B2420]';
            if (isGathering) {
              bgClass =
                'bg-gradient-to-br from-[#6F2630] to-[#8B2E3D] text-[#FFFDF8] font-bold ring-2 ring-[#B89A5A] shadow-lg animate-pulse';
            } else if (isReminder) {
              bgClass = 'bg-[#B89A5A]/20 text-[#B89A5A] font-semibold ring-1 ring-[#B89A5A]/50';
            } else if (isPast) {
              bgClass = 'bg-[#1B2420]/30 text-[#9E9484]/60';
            }

            if (isSelected && !isGathering) {
              bgClass += ' ring-2 ring-[#F5EFE3]';
            }

            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs transition-all relative ${bgClass}`}
              >
                <span>{d}</span>
                {isGathering && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A5A] mt-0.5" />
                )}
                {isReminder && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89A5A] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend matching Mockup Photos 2, 3, 6, 7 */}
        <div className="flex items-center justify-around mt-4 pt-3 border-t border-[#B89A5A]/10 text-[11px] text-[#9E9484]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B2E3D] ring-1 ring-[#B89A5A]" />
            <span>{language === 'am' ? 'የማኅበር ቀን (27)' : 'Gathering day (27th)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B89A5A]" />
            <span>{language === 'am' ? 'ማሳሰቢያ (24 እና 26)' : 'Reminder (24th & 26th)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B2420]" />
            <span>{language === 'am' ? 'ያለፈ ቀን' : 'Past date'}</span>
          </div>
        </div>
      </div>

      {/* Selected Day Info Card */}
      {selectedDay === 27 && (
        <div className="bg-gradient-to-br from-[#1B2420] to-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/40 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#6F2630] border border-[#B89A5A] flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-[10px] font-bold text-[#B89A5A] uppercase tracking-wider">
                  {monthName.slice(0, 3)}
                </span>
                <span className="text-lg font-black text-white leading-none">27</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'የወሩ ማኅበር መሰብሰቢያ' : 'Monthly Mahber Gathering'}
                </h4>
                <p className="text-xs text-[#B89A5A]">
                  {monthName} 27, 2018 (Oct 6, 2025) · 2:00 PM – 5:00 PM
                </p>
                <p className="text-xs text-[#9E9484] flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-[#B89A5A]" />
                  CMC, Addis Ababa · Hosted by Nahom
                </p>
              </div>
            </div>
            {currentGathering && onSelectGathering && (
              <button
                type="button"
                onClick={() => onSelectGathering(currentGathering)}
                className="px-3 py-1.5 rounded-lg bg-[#B89A5A] text-[#0E1210] text-xs font-bold hover:bg-[#C9AB6B] transition-colors"
              >
                {language === 'am' ? 'ዝርዝር እይ →' : 'Details →'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Reminders matching Photos 2, 3, 7 */}
      <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20">
        <h4 className="text-xs font-bold text-[#B89A5A] tracking-wider uppercase flex items-center gap-2 mb-3">
          <Bell size={14} />
          {language === 'am' ? 'የሚመጡ ማሳሰቢያዎች' : 'Upcoming Reminders'}
        </h4>

        <div className="space-y-2.5">
          {/* Day 24 Reminder */}
          <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B89A5A]/20 text-[#B89A5A] font-bold flex items-center justify-center text-xs shrink-0">
              24
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F5EFE3]">
                  {monthName} 24, 2018 (Oct 3, 2025)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B89A5A]/20 text-[#B89A5A] font-medium">
                  {language === 'am' ? '3 ቀናት ቀርተዋል' : '3 days before'}
                </span>
              </div>
              <p className="text-xs text-[#9E9484] mt-0.5">
                {language === 'am'
                  ? 'ለመሰብሰብ ዝግጅት አድርጉ እና ተሳትፎዎን ያረጋግጡ።'
                  : 'Reminder to prepare for gathering and confirm your attendance.'}
              </p>
            </div>
          </div>

          {/* Day 26 Reminder */}
          <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B89A5A]/20 text-[#B89A5A] font-bold flex items-center justify-center text-xs shrink-0">
              26
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F5EFE3]">
                  {monthName} 26, 2018 (Oct 5, 2025)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6F2630]/40 text-rose-300 font-medium">
                  {language === 'am' ? 'ነገ ይሰበሰባል' : 'Final reminder'}
                </span>
              </div>
              <p className="text-xs text-[#9E9484] mt-0.5">
                {language === 'am'
                  ? 'የነገው ማኅበር በሰዓቱ ይጀምራል። መጽሐፍ ቅዱስዎን ይዘው ይምጡ።'
                  : 'Final reminder before the gathering. Gathering begins punctually at 2:00 PM.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
