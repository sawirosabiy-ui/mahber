import React, { useState } from 'react';
import { EthiopianCross } from '../common/EthiopianCross';
import { useLanguage } from '../../context/LanguageContext';
import { mahberService } from '../../services/mahberService';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const { language } = useLanguage();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError(
        language === 'am'
          ? 'እባክዎን የአስተዳዳሪ ይለፍ ቃል ያስገቡ።'
          : 'Please enter the admin password.'
      );
      return;
    }

    setIsSubmitting(true);

    const isValid = mahberService.verifyAdminPassword(password);
    if (isValid) {
      mahberService.setAdminSessionUnlocked(true);
      setIsSubmitting(false);
      onSuccess();
    } else {
      setIsSubmitting(false);
      setError(
        language === 'am'
          ? 'የተሳሳተ ይለፍ ቃል! እባክዎን ትክክለኛውን የአስተዳዳሪ ይለፍ ቃል ያስገቡ (mahber@27)።'
          : 'Incorrect password! Please enter the authorized admin password.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#1A1714] border-2 border-[#B89A5A]/40 shadow-2xl overflow-hidden text-center relative p-6 space-y-5">
        {/* Sacred Orthodox Emblem */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-b from-[#6F2630] to-[#42141B] border-2 border-[#B89A5A] flex items-center justify-center shadow-lg shadow-[#6F2630]/30 relative">
          <EthiopianCross size={32} color="#F5EFE3" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1A1714] border border-[#B89A5A] flex items-center justify-center">
            <Lock size={12} className="text-[#B89A5A]" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#F5EFE3] flex items-center justify-center gap-2">
            <span>{language === 'am' ? 'የአስተዳዳሪ መግቢያ ማረጋገጫ' : 'Admin Security Verification'}</span>
          </h3>
          <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
            {language === 'am'
              ? 'ወደ ማኅበሩ አስተዳዳሪ ገጽ ለመግባት እባክዎን ሚስጥራዊውን የአስተዳዳሪ ይለፍ ቃል ያስገቡ።'
              : 'Please enter the authorized administrator password to access management controls.'}
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-2xl bg-[#6F2630]/20 border border-[#6F2630] text-[#E598A0] text-xs flex items-center gap-2 text-left animate-shake">
            <AlertCircle size={16} className="shrink-0 text-[#E598A0]" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound size={16} className="text-[#B89A5A]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder={language === 'am' ? 'የአስተዳዳሪ ይለፍ ቃል...' : 'Admin password...'}
              autoFocus
              className="w-full pl-9 pr-10 py-3 rounded-2xl bg-[#201D19] border border-[#B89A5A]/40 text-sm text-[#F5EFE3] placeholder-gray-500 focus:outline-none focus:border-[#B89A5A] focus:ring-1 focus:ring-[#B89A5A]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-[#201D19] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>{language === 'am' ? 'ተመለስ' : 'Cancel'}</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#6F2630] to-[#8A2F3D] border border-[#B89A5A]/50 text-xs font-bold text-white hover:brightness-110 active:scale-95 transition shadow-md shadow-[#6F2630]/40 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={15} />
              <span>{language === 'am' ? 'ግባ' : 'Unlock Admin'}</span>
            </button>
          </div>
        </form>

        <div className="pt-1 border-t border-[#B89A5A]/15 text-[10px] text-[#B89A5A]/80">
          ✝️ መድኃኔዓለም ክርስቶስ ማኅበራችንን ይባርክልን ✝️
        </div>
      </div>
    </div>
  );
};
