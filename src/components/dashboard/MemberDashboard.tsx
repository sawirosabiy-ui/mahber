import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';
import { mahberService } from '../../services/mahberService';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Users,
  ChevronRight,
  BookOpen,
  Camera,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface MemberDashboardProps {
  onNavigate: (tab: 'dashboard' | 'profile' | 'members') => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { currentUser, allMembers } = useAuth();
  const isAmharic = language === 'am';

  // Calculate next gathering (Day 27 of the Ethiopian calendar)
  const [paintingRotation] = useState(() => mahberService.getPaintingRotation());
  const scheduledHost = allMembers.find((m) => m.id === paintingRotation.scheduledHostId) || allMembers[1];

  // Fallback initials if avatar is not available
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full space-y-4 animate-fade-in pb-12">
      {/* 1. Welcome Member Card */}
      <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 shadow-xl space-y-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#B89A5A] shadow-candle-glow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#1B2420] border-2 border-[#B89A5A]/50 flex flex-col items-center justify-center text-[#B89A5A] shadow-candle-glow">
                  <EthiopianCross size={18} color="#B89A5A" />
                  <span className="text-[10px] font-bold tracking-wider mt-0.5">
                    {getInitials(currentUser.name)}
                  </span>
                </div>
              )}
              {currentUser.role === 'admin' && (
                <span
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#B89A5A] text-[#0E1210] shadow"
                  title="Administrator"
                >
                  <ShieldCheck size={12} />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold text-[#F5EFE3] truncate">
                  {currentUser.name}
                </h1>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                    currentUser.role === 'admin'
                      ? 'bg-[#B89A5A]/20 text-[#B89A5A] border-[#B89A5A]/40'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {currentUser.role === 'admin'
                    ? isAmharic ? 'ዋና አስተዳዳሪ' : 'Administrator'
                    : isAmharic ? 'ንቁ አባል' : 'Active Member'}
                </span>
              </div>
              <p className="text-xs text-[#9E9484]">{currentUser.amharicName}</p>

              {currentUser.baptismalName && (
                <p className="text-[11px] text-[#B89A5A] font-serif mt-0.5">
                  የክርስትና ስም: <span className="font-bold">{currentUser.baptismalName}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="p-2 rounded-2xl bg-white/5 hover:bg-[#B89A5A]/20 border border-[#B89A5A]/25 text-[#B89A5A] transition flex flex-col items-center gap-0.5 shrink-0"
            title={isAmharic ? 'ማኅደርህን አሻሽል' : 'Edit Profile'}
          >
            <Camera size={15} />
            <span className="text-[9px] font-semibold">
              {isAmharic ? 'ማሻሻያ' : 'Edit'}
            </span>
          </button>
        </div>

        {/* Contact Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-gray-300">
          <div className="px-2.5 py-1 rounded-xl bg-[#0E1210] border border-[#B89A5A]/20 flex items-center gap-1.5">
            <Phone size={11} className="text-[#B89A5A]" />
            <span>{currentUser.phone || (isAmharic ? 'ስልክ አልተመዘገበም' : 'No phone registered')}</span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-[#0E1210] border border-[#B89A5A]/20 flex items-center gap-1.5">
            <Mail size={11} className="text-[#B89A5A]" />
            <span className="font-mono text-[10px]">
              {currentUser.email || `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@mahber.org`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Next Monthly Gathering Card (The Sacred Invariant: Day 27) */}
      <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#B89A5A]" />
            <h2 className="text-xs font-bold text-[#F5EFE3] uppercase tracking-wider">
              {isAmharic ? 'ቀጣይ ወርሃዊ ጉባኤ (በየወሩ 27)' : 'Next Monthly Gathering (Day 27)'}
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#B89A5A]/15 text-[#B89A5A] text-[10px] font-bold border border-[#B89A5A]/30">
            {isAmharic ? '27ኛው ቀን' : 'Day 27'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#1B2420] border border-[#B89A5A]/20 space-y-1">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <Clock size={11} className="text-[#B89A5A]" />
              <span>{isAmharic ? 'ሰዓት' : 'Time'}</span>
            </div>
            <p className="font-bold text-[#F5EFE3]">6:00 ከሰዓት (15:00)</p>
            <p className="text-[9px] text-[#B89A5A]">{isAmharic ? 'ወርሃዊ ቋሚ ሰዓት' : 'Standing Schedule'}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#1B2420] border border-[#B89A5A]/20 space-y-1">
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              <MapPin size={11} className="text-[#B89A5A]" />
              <span>{isAmharic ? 'ቦታና አስተናጋጅ' : 'Location & Host'}</span>
            </div>
            <p className="font-bold text-[#F5EFE3] truncate">{scheduledHost.name}</p>
            <p className="text-[9px] text-gray-400">ቦሌ (Bole)</p>
          </div>
        </div>

        {/* Solemn Verse of the Fellowship */}
        <div className="p-3 rounded-2xl bg-[#0E1210] border border-[#B89A5A]/20 flex items-center gap-2.5">
          <BookOpen size={16} className="text-[#B89A5A] shrink-0" />
          <p className="text-[10px] font-serif text-gray-300 italic leading-snug">
            {isAmharic
              ? '«እኔ የወይን ግንድ ነኝ እናንተም ቅርንጫፎች ናችሁ፤ ያለ እኔ ምንም ልታደርጉ አትችሉም።» (ዮሐንስ 15:5)'
              : '"I am the vine, you are the branches. Whoever abides in me and I in him, he it is that bears much fruit." (John 15:5)'}
          </p>
        </div>
      </div>

      {/* 3. Covenant Fellowship Standing Card */}
      <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#B89A5A]" />
            <h2 className="text-xs font-bold text-[#F5EFE3]">
              {isAmharic ? 'የ11ዱ ቃል ኪዳን አባላት ማኅበር' : 'The 11 Covenant Brethren'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('members')}
            className="text-[11px] text-[#B89A5A] hover:underline flex items-center gap-0.5"
          >
            <span>{isAmharic ? 'ሁሉንም እይ' : 'View All'}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {isAmharic
            ? 'ይህ ማኅበር በ11 የተመረጡ ወንድሞች መካከል የተመሰረተ ዝግ መንፈሳዊ ጉባኤ ነው። ሁሉም 11 አባላት በስርዓቱ ተመዝግበው ንቁ ናቸው።'
            : 'A private fellowship founded among 11 brethren. All 11 members are active and registered in the covenant.'}
        </p>

        {/* Brethren Quick Avatars */}
        <div className="flex items-center -space-x-2 overflow-x-auto py-1">
          {allMembers.slice(0, 11).map((m) => (
            <div
              key={m.id}
              className="relative rounded-full ring-2 ring-[#0E1210] hover:scale-110 transition shrink-0"
              title={`${m.name} (${m.amharicName})`}
            >
              {m.avatarUrl ? (
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1B2420] text-[#B89A5A] border border-[#B89A5A]/40 flex items-center justify-center text-[9px] font-bold">
                  {m.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Fast Action Shortcuts */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="p-4 rounded-3xl bg-[#141A17] hover:bg-[#1B2420] border border-[#B89A5A]/30 text-left transition shadow-md group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <User size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#F5EFE3]">
              {isAmharic ? 'የግል ማኅደር' : 'My Profile'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {isAmharic ? 'ፎቶና ስልክ ቀይር' : 'Edit photo & phone'}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('members')}
          className="p-4 rounded-3xl bg-[#141A17] hover:bg-[#1B2420] border border-[#B89A5A]/30 text-left transition shadow-md group flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#B89A5A]/15 text-[#B89A5A] flex items-center justify-center mb-2 group-hover:scale-105 transition">
            <Users size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#F5EFE3]">
              {isAmharic ? 'የአባላት ዝርዝር' : 'Directory'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {isAmharic ? '11ዱ ወንድሞች' : '11 Covenant Brethren'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
