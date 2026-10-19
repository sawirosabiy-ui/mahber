import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';
import {
  Camera,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Lock,
} from 'lucide-react';

interface UserProfileViewProps {
  onBack?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const { currentUser, updateUserProfile } = useAuth();

  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl || '');
  const [, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAmharic = language === 'am';

  // Fallback initials if avatar is not available
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(
        isAmharic
          ? 'እባክዎ ትክክለኛ ምስል ይምረጡ (JPEG, PNG, WebP)'
          : 'Invalid image format. Please select a JPEG, PNG, or WebP photo.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(
        isAmharic
          ? 'የምስሉ መጠን ከ 5MB መብለጥ የለበትም።'
          : 'File size exceeds 5MB limit. Please select a smaller photo.'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read file as base64 Data URL for local persistence and immediate preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
        setAvatarFile(file);
        setIsEditing(true);
      }
    };
    reader.onerror = () => {
      setErrorMessage(
        isAmharic ? 'ምስሉን ማንበብ አልተቻለም።' : 'Failed to read image file.'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview('');
    setAvatarFile(null);
    setIsEditing(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate phone number format (allow empty)
    if (phone.trim() !== '') {
      const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
      const validPhoneRegex = /^(\+?[1-9]\d{6,14}|0[79]\d{8})$/;
      if (!validPhoneRegex.test(cleanPhone)) {
        setErrorMessage(
          isAmharic
            ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ (ምሳሌ፡ +251 91 123 4567 ወይም 0911234567)'
            : 'Please enter a valid phone number (e.g. +251 91 123 4567 or 0911234567).'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const res = await updateUserProfile({
        phone: phone.trim(),
        avatarUrl: avatarPreview.trim(),
      });

      if (res.success) {
        setSuccessMessage(
          isAmharic
            ? 'ማኅደርዎ በተሳካ ሁኔታ ተሻሽሏል!'
            : 'Profile updated successfully!'
        );
        setIsEditing(false);
      } else {
        setErrorMessage(
          res.error ||
            (isAmharic
              ? 'ማሻሻል አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
              : 'Failed to update profile. Please try again.')
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPhone(currentUser.phone || '');
    setAvatarPreview(currentUser.avatarUrl || '');
    setAvatarFile(null);
    setIsEditing(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-3">
          <div className="flex items-center gap-2">
            <EthiopianCross size={20} color="#B89A5A" />
            <h2 className="text-sm font-bold text-[#F5EFE3] tracking-wide">
              {isAmharic ? 'የግል ማኅደር' : 'User Profile'}
            </h2>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-[#B89A5A] hover:underline transition"
            >
              {isAmharic ? '← ተመለስ' : '← Back'}
            </button>
          )}
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Avatar Upload & Management */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={currentUser.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#B89A5A] shadow-candle-glow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1B2420] border-2 border-[#B89A5A]/50 flex flex-col items-center justify-center text-[#B89A5A] shadow-candle-glow">
                <EthiopianCross size={24} color="#B89A5A" />
                <span className="text-xs font-bold tracking-wider mt-1">
                  {getInitials(currentUser.name)}
                </span>
              </div>
            )}

            {/* Camera Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#B89A5A] hover:bg-[#C9AA6A] text-[#0E1210] shadow-lg transition transform hover:scale-105 active:scale-95"
              title={isAmharic ? 'ፎቶ ቀይር' : 'Change profile picture'}
            >
              <Camera size={14} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[#B89A5A] hover:text-[#D4B87A] transition"
            >
              {isAmharic ? 'ፎቶ ቀይር / ጫን' : 'Change Photo'}
            </button>
            {avatarPreview && (
              <>
                <span className="text-gray-600">•</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-gray-400 hover:text-rose-400 transition flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  <span>{isAmharic ? 'አስወግድ' : 'Remove'}</span>
                </button>
              </>
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            {isAmharic ? 'JPEG, PNG ወይም WebP (ከ 5MB በታች)' : 'JPEG, PNG, or WebP (max 5MB)'}
          </p>
        </div>

        <SacredDivider className="opacity-40" />

        {/* Profile Details Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          {/* Read-Only Account Identity */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 flex items-center justify-between">
              <span>{isAmharic ? 'ሙሉ ስም (የማኅበር ማንነት)' : 'Full Name (Account Identity)'}</span>
              <Lock size={11} className="text-gray-500" />
            </label>
            <div className="p-2.5 rounded-xl bg-[#0E1210]/60 border border-[#B89A5A]/15 text-xs text-[#F5EFE3] flex items-center justify-between">
              <div>
                <span className="font-semibold block">{currentUser.name}</span>
                <span className="text-[10px] text-gray-400">{currentUser.amharicName}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B89A5A]/15 text-[#B89A5A] border border-[#B89A5A]/30 font-medium">
                {currentUser.role === 'admin'
                  ? isAmharic ? 'አስተዳዳሪ' : 'Admin'
                  : isAmharic ? 'ንቁ አባል' : 'Member'}
              </span>
            </div>
          </div>

          {/* Baptismal Name (የክርስትና ስም) */}
          {currentUser.baptismalName && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400 flex items-center justify-between">
                <span>{isAmharic ? 'የክርስትና ስም' : 'Baptismal Name'}</span>
                <Lock size={11} className="text-gray-500" />
              </label>
              <div className="p-2.5 rounded-xl bg-[#0E1210]/60 border border-[#B89A5A]/15 text-xs text-[#F5EFE3]">
                <span className="font-serif font-bold text-[#B89A5A]">
                  {currentUser.baptismalName}
                </span>
              </div>
            </div>
          )}

          {/* Account Email (Read-Only) */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 flex items-center justify-between">
              <span>{isAmharic ? 'የመለያ ኢሜይል' : 'Account Email'}</span>
              <Lock size={11} className="text-gray-500" />
            </label>
            <div className="p-2.5 rounded-xl bg-[#0E1210]/60 border border-[#B89A5A]/15 text-xs text-gray-300 flex items-center gap-2">
              <Mail size={14} className="text-[#B89A5A] shrink-0" />
              <span className="font-mono text-[11px]">
                {currentUser.email || `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@mahber.org`}
              </span>
            </div>
            <p className="text-[9px] text-gray-500">
              {isAmharic
                ? 'የመለያ ኢሜይል እና ማንነት የሚተዳደረው በዋናው ማረጋገጫ ብቻ ነው።'
                : 'Account identity and email are secured and managed by the auth provider.'}
            </p>
          </div>

          {/* User-Editable Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#F5EFE3] flex items-center justify-between">
              <span>{isAmharic ? 'የስልክ ቁጥር (የሚቀየር)' : 'Phone Number (Editable)'}</span>
              <span className="text-[10px] text-[#B89A5A]">
                {isAmharic ? 'አማራጭ' : 'Optional'}
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#B89A5A]">
                <Phone size={14} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="+251 91 100 0001"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] placeholder-gray-600 focus:outline-none focus:border-[#B89A5A] focus:ring-1 focus:ring-[#B89A5A] transition"
              />
            </div>
            <p className="text-[9px] text-gray-400">
              {isAmharic
                ? 'ምሳሌ፡ +251 91 123 4567 ወይም 0911234567 (የኢትዮጵያ ወይም የውጭ ሀገር ቁጥር)'
                : 'e.g. +251 91 123 4567 or international format.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading || (!isEditing && phone === (currentUser.phone || ''))}
              className="flex-1 py-2.5 rounded-xl bg-[#B89A5A] hover:bg-[#C9AA6A] disabled:opacity-50 disabled:cursor-not-allowed text-[#0E1210] font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isAmharic ? 'በማስቀመጥ ላይ...' : 'Saving Changes...'}</span>
                </>
              ) : (
                <span>{isAmharic ? 'ለውጦችን መዝግብ' : 'Save Changes'}</span>
              )}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition"
              >
                {isAmharic ? 'ሰርዝ' : 'Cancel'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
