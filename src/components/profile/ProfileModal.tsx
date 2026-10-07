import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Member, MemberContribution } from '../../types';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';
import {
  X,
  Phone,
  ShieldCheck,
  Calendar,
  CreditCard,
  Music,
} from 'lucide-react';

interface ProfileModalProps {
  member: Member;
  contribution?: MemberContribution;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  member,
  contribution,
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const isSelf = member.id === currentUser.id;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#1B1815] dark:bg-[#1B1815] light:bg-[#FFFDF8] rounded-t-3xl sm:rounded-3xl border border-[#B89A5A]/30 p-5 shadow-sacred max-h-[90vh] overflow-y-auto space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-3">
          <div className="flex items-center gap-2">
            <EthiopianCross size={18} color="#B89A5A" />
            <h3 className="text-sm font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {language === 'am' ? 'የአባል ማኅደር' : 'Member Profile'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Member Identity Card */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
          <div className="relative">
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#B89A5A] shadow-lg"
            />
            {member.role === 'admin' && (
              <span
                className="absolute bottom-0 right-0 p-1 rounded-full bg-[#B89A5A] text-black"
                title="Admin"
              >
                <ShieldCheck size={14} />
              </span>
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {member.amharicName}
            </h2>
            <p className="text-xs text-gray-400">{member.name}</p>
          </div>

          {/* Christian Baptismal Name (የክርስትና ስም) */}
          {member.baptismalName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 text-[#B89A5A] text-xs font-serif">
              <span>የክርስትና ስም:</span>
              <span className="font-bold">{member.baptismalName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                member.role === 'admin'
                  ? 'bg-[#B89A5A]/25 text-[#B89A5A] border border-[#B89A5A]/40'
                  : 'bg-[#315C48]/25 text-[#427A60] dark:text-[#529575] border border-[#315C48]/40'
              }`}
            >
              {member.role === 'admin' ? t.roleAdmin : t.roleMember}
            </span>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <Phone size={12} className="text-[#B89A5A]" />
              <span>{member.phone}</span>
            </span>
          </div>
        </div>

        <SacredDivider className="opacity-70" />

        {/* Member Mahber Journey Info */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {language === 'am' ? 'የማኅበር ተሳትፎ' : 'Mahber Standing'}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#F3ECE0] border border-[#B89A5A]/15 space-y-1">
              <div className="text-gray-400 flex items-center gap-1 text-[10px]">
                <Calendar size={12} className="text-[#B89A5A]" />
                <span>{language === 'am' ? 'የስብሰባ ተሳትፎ' : 'Attendance'}</span>
              </div>
              <div className="font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {member.attendanceRate ? `${member.attendanceRate}%` : '100%'}
              </div>
              <div className="text-[9px] text-[#315C48]">
                {language === 'am' ? 'ንቁ ተሳታፊ' : 'Active participant'}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#F3ECE0] border border-[#B89A5A]/15 space-y-1">
              <div className="text-gray-400 flex items-center gap-1 text-[10px]">
                <CreditCard size={12} className="text-[#B89A5A]" />
                <span>{language === 'am' ? 'የወር መዋጮ' : 'Contribution'}</span>
              </div>
              <div className="font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                {isSelf && contribution ? (
                  contribution.totalOutstanding <= 0 ? (
                    <span className="text-[#315C48]">{t.statusPaid}</span>
                  ) : contribution.thisMonthPaid > 0 ? (
                    <span className="text-[#B89A5A]">{language === 'am' ? 'ከፊል የተከፈለ' : 'Partial'}</span>
                  ) : (
                    <span className="text-[#D98A94]">{t.statusOutstanding}</span>
                  )
                ) : (
                  <span className="text-gray-400 font-serif">የተስተካከለ</span>
                )}
              </div>
              <div className="text-[9px] text-gray-400">
                {isSelf && contribution ? (
                  <span>ቀሪ: {contribution.totalOutstanding} ብር</span>
                ) : (
                  <span>{language === 'am' ? 'የግል መዝገብ' : 'Confidential'}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Favorite / Chosen Mezmurs */}
        <div className="p-3 rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#F3ECE0] border border-[#B89A5A]/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
            <Music size={14} className="text-[#B89A5A]" />
            <span>{language === 'am' ? 'የሚወደዱ መዝሙራት' : 'Favorite Mezmurs'}</span>
          </div>
          <div className="text-[11px] text-gray-300 space-y-1">
            <p className="flex items-center gap-1.5">
              <span className="text-[#B89A5A]">✝</span>
              <span>መድኃኔዓለም አዳነን (Medhanialem Adanen)</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-[#B89A5A]">✝</span>
              <span>ማኅበረ ቅዱሳን (Mahbere Kidusan)</span>
            </p>
          </div>
        </div>

        {/* Scripture Blessing Footer */}
        <div className="pt-1 text-center">
          <p className="text-[10px] text-gray-400 font-serif italic">
            «በሰላምና በፍቅር፥ በሃይማኖትና በምግባር አጽናን።»
          </p>
        </div>
      </div>
    </div>
  );
};
