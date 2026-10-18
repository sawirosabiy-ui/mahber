import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EthiopianCross } from '../common/EthiopianCross';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ShieldCheck, KeyRound, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { Member } from '../../types';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { t, language } = useLanguage();
  const { loginWithCredentials, resetPassword, validateInviteCode, activateAccountWithInvite } = useAuth();

  const [mode, setMode] = useState<'login' | 'invite' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 2-Step Invite Activation State
  const [inviteCode, setInviteCode] = useState('');
  const [inviteStep, setInviteStep] = useState<1 | 2>(1);
  const [verifiedMember, setVerifiedMember] = useState<Member | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleVerifyInviteCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage(language === 'am' ? 'እባክዎን የግብዣ ኮድዎን ያስገቡ።' : 'Please enter your invitation code.');
      return;
    }

    const verification = validateInviteCode(cleanCode);
    if (!verification.valid || !verification.member) {
      setErrorMessage(verification.error || (language === 'am' ? 'ልክ ያልሆነ ወይም ጊዜው ያለፈበት የግብዣ ኮድ።' : 'Invalid or expired invitation code.'));
      return;
    }

    setVerifiedMember(verification.member);
    setInviteStep(2);
    setSuccessMessage(
      language === 'am'
        ? `የተረጋገጠ አባል፡ ${verification.member.name} (${verification.member.amharicName || ''})። እባክዎ አዲስ የይለፍ ቃል ይምረጡ።`
        : `Verified: ${verification.member.name}. Please set your permanent password.`
    );
  };

  const handleCompleteActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage(
        language === 'am'
          ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት።'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        language === 'am'
          ? 'የይለፍ ቃሎቹ አይመሳሰሉም። እባክዎ እንደገና ያረጋግጡ።'
          : 'Passwords do not match. Please verify.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await activateAccountWithInvite(inviteCode.trim().toUpperCase(), newPassword);
      if (res.success) {
        setSuccessMessage(
          language === 'am'
            ? `እንኳን ደህና መጡ ${res.member?.name || ''}! መለያዎ በተሳካ ሁኔታ ነቅቷል።`
            : `Welcome ${res.member?.name || ''}! Your account is now active.`
        );
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setErrorMessage(res.error || (language === 'am' ? 'ማግበር አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Activation failed. Please try again.'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Activation error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'reset') {
        if (!email.trim()) {
          setErrorMessage(language === 'am' ? 'እባክዎን ኢሜይልዎን ያስገቡ።' : 'Please provide your email.');
          setLoading(false);
          return;
        }
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage(
            language === 'am'
              ? 'የይለፍ ቃል ማስተካከያ መረጃ ተልኳል። እንዲሁም የክብር አባላትን ወይም ዋና አስተዳዳሪን (ሳዊሮስ) ማነጋገር ይችላሉ።'
              : 'Password reset dispatch recorded. You may also contact Super Admin (Sawiros) directly.'
          );
        } else {
          setErrorMessage(res.error || 'Failed to send password reset');
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMessage(
            language === 'am'
              ? 'እባክዎ ኢሜይል/ስልክ እና የይለፍ ቃልዎን ያስገቡ።'
              : 'Please enter both your identifier and password.'
          );
          setLoading(false);
          return;
        }

        const res = await loginWithCredentials(email, password);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else {
          if (res.error === 'INVALID_PASSWORD') {
            setErrorMessage(t.authInvalidCredentials);
          } else if (res.error === 'MEMBER_NOT_FOUND') {
            setErrorMessage(t.authMemberNotFound);
          } else if (res.error?.toLowerCase().includes('failed to fetch') || res.error?.toLowerCase().includes('network')) {
            setErrorMessage(t.authNetworkError);
          } else {
            setErrorMessage(res.error || t.authInvalidCredentials);
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
        setErrorMessage(t.authNetworkError);
      } else {
        setErrorMessage(t.authServerError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center p-5 bg-[#0E1210] text-[#F5EFE3] select-none animate-fade-in relative overflow-hidden">
      {/* Background sacred atmosphere */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=1200&auto=format&fit=crop&q=80"
          alt="Church Architecture"
          className="w-full h-full object-cover filter brightness-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1210] via-[#0E1210]/85 to-[#0E1210]" />
      </div>

      {/* Top Sacred Identity Header */}
      <div className="relative z-10 pt-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-[#B89A5A]/15 border-2 border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A] shadow-candle-glow mb-2.5">
          <EthiopianCross size={32} color="#B89A5A" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#F5EFE3]">
          {language === 'am' ? 'መድኃኔዓለም ማኅበር' : 'MEDHANIALEM MAHBER'}
        </h1>
        <p className="text-[10px] text-[#B89A5A] font-serif tracking-widest uppercase mt-0.5">
          {language === 'am' ? 'የግል 11 አባላት ማኅበረሰብ' : '11-Member Sacred Covenant'}
        </p>
      </div>

      {/* Login / Activation Card Form */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl p-5 bg-[#141A17]/95 backdrop-blur-md border border-[#B89A5A]/30 shadow-sacred space-y-4 my-auto">
        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-[#0E1210] p-1 border border-[#B89A5A]/20">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'login' ? 'bg-[#6F2630] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            {language === 'am' ? 'ግባ (Sign In)' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('invite');
              setInviteStep(1);
              setVerifiedMember(null);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'invite' ? 'bg-[#6F2630] text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            {language === 'am' ? 'የግብዣ ኮድ' : 'Invite Code'}
          </button>
        </div>

        <div className="text-center pb-1">
          <h2 className="text-sm font-bold text-[#F5EFE3]">
            {mode === 'invite'
              ? inviteStep === 1
                ? (language === 'am' ? 'ደረጃ 1፡ የግብዣ ኮድ ማረጋገጥ' : 'Step 1: Verify Invite Code')
                : (language === 'am' ? 'ደረጃ 2፡ የይለፍ ቃል ማዘጋጀት' : 'Step 2: Set New Password')
              : mode === 'reset'
              ? (language === 'am' ? 'የይለፍ ቃል መልሶ ማግኛ' : 'Reset Password')
              : (language === 'am' ? 'ወደ ማኅበሩ ይግቡ' : 'Sign In to Your Mahber')}
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {mode === 'invite'
              ? inviteStep === 1
                ? (language === 'am' ? 'ከአስተዳዳሪ የተሰጠዎትን ባለ 8 ዲጂት የግብዣ ኮድ ያስገቡ' : 'Enter the single-use invite code provided by an admin')
                : (language === 'am' ? 'ለመለያዎ ቋሚ የይለፍ ቃል ይመዝግቡ' : 'Create a secure password for your member profile')
              : mode === 'reset'
              ? (language === 'am' ? 'የተመዘገቡበትን ኢሜይል ወይም ስልክ ያስገቡ' : 'Enter registered email or phone')
              : (language === 'am' ? 'ይህ የግል ማኅበር ለአባላት ብቻ የተፈቀደ ነው' : 'Private Mahber for authorized members only')}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-[#6F2630]/20 border border-[#6F2630] text-xs text-[#E5DCD0] flex items-center gap-2 animate-fade-in">
            <AlertCircle size={15} className="text-[#D98A94] shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-2.5 rounded-xl bg-[#315C48]/20 border border-[#315C48] text-xs text-[#D8E6DE] flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={15} className="text-[#315C48] shrink-0" />
            <span className="leading-tight">{successMessage}</span>
          </div>
        )}

        {/* MODE: INVITE (2 Steps) */}
        {mode === 'invite' && (
          inviteStep === 1 ? (
            <form onSubmit={handleVerifyInviteCode} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-300">
                  {language === 'am' ? 'የግብዣ ኮድ (e.g. MAH-SIMON27)' : 'Single-Use Invite Code'}
                </label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3 top-3 text-[#B89A5A]" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="MAH-SIMON27"
                    required
                    className="w-full rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 pl-9 pr-3 py-2 text-xs font-mono uppercase tracking-widest text-[#F5EFE3] placeholder-gray-600 focus:outline-none focus:border-[#B89A5A] transition"
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {language === 'am' ? '💡 ለሙከራ ኮድ፡ MAH-SIMON27 መጠቀም ይችላሉ' : '💡 Demo seed code: MAH-SIMON27'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold tracking-wide shadow-sacred transition touch-press flex items-center justify-center gap-2 mt-2"
              >
                <span>{language === 'am' ? 'ኮዱን አረጋግጥ' : 'Verify Code'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCompleteActivation} className="space-y-3 animate-fade-in">
              {/* Verified Member Preview Card */}
              {verifiedMember && (
                <div className="p-3 rounded-2xl bg-[#0E1210] border border-[#B89A5A]/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B89A5A]/20 border border-[#B89A5A]/40 flex items-center justify-center font-bold text-sm text-[#B89A5A]">
                    {verifiedMember.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#F5EFE3] truncate">
                      {verifiedMember.name}
                    </div>
                    <div className="text-[10px] text-[#B89A5A]">
                      {verifiedMember.amharicName || verifiedMember.phone}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#315C48]/20 border border-[#315C48] text-[9px] font-semibold text-[#8ED0A8]">
                    <UserCheck size={11} />
                    <span>{language === 'am' ? 'ተረጋግጧል' : 'Matched'}</span>
                  </div>
                </div>
              )}

              {/* Set Password Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-300">
                  {language === 'am' ? 'አዲስ የይለፍ ቃል (New Password)' : 'New Password (min 6 characters)'}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#B89A5A] transition"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-300">
                  {language === 'am' ? 'የይለፍ ቃል ያረጋግጡ (Confirm Password)' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#B89A5A] transition"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setInviteStep(1)}
                  className="px-3 py-2.5 rounded-xl bg-[#0E1210] border border-gray-700 hover:border-gray-500 text-gray-300 text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>{language === 'am' ? 'ተመለስ' : 'Back'}</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] disabled:opacity-50 text-white text-xs font-bold tracking-wide shadow-sacred transition touch-press flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin text-sm">❖</span>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span>{language === 'am' ? 'ማግበር አጠናቅቅ' : 'Complete Activation'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        )}

        {/* MODE: LOGIN or RESET */}
        {mode !== 'invite' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            {/* Identifier input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-300">
                {language === 'am' ? 'ስም ወይም ስልክ (Name or Phone)' : 'Name or Phone / Email'}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Sawiros / 0911000001"
                  required
                  className="w-full rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#B89A5A] transition"
                />
              </div>
            </div>

            {/* Password input */}
            {mode === 'login' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-semibold text-gray-300">
                    {language === 'am' ? 'የይለፍ ቃል (Password)' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setErrorMessage(null); setSuccessMessage(null); }}
                    className="text-[10px] text-[#B89A5A] hover:underline"
                  >
                    {language === 'am' ? 'ረሱት?' : 'Forgot?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#B89A5A] transition"
                  />
                </div>
              </div>
            )}

            {/* Reset policy notice */}
            {mode === 'reset' && (
              <div className="p-2.5 rounded-xl bg-[#0E1210] border border-[#B89A5A]/20 text-[10px] text-gray-400 space-y-1 leading-relaxed">
                <p className="font-semibold text-[#B89A5A]">
                  🔒 {language === 'am' ? 'የደህንነት መመሪያ፡' : 'Security Reset Policy:'}
                </p>
                <p>
                  {language === 'am'
                    ? 'ይህ ዝግ የማኅበር መተግበሪያ በመሆኑ የይለፍ ቃል መልሶ ማግኛ በዋና አስተዳዳሪ ወይም በኢሜይል ማረጋገጫ ብቻ ይከናወናል።'
                    : 'Because this is a closed 11-member covenant, resets require admin verification or authenticated email link dispatch.'}
                </p>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] disabled:opacity-50 text-white text-xs font-bold tracking-wide shadow-sacred transition touch-press flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="animate-spin text-sm">❖</span>
              ) : mode === 'reset' ? (
                <>
                  <KeyRound size={15} />
                  <span>{language === 'am' ? 'ማስፈንጠሪያ ላክ' : 'Send Reset Link'}</span>
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>{language === 'am' ? 'ግባ (Sign In)' : 'Sign In'}</span>
                </>
              )}
            </button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
                className="w-full py-2 text-center text-[11px] text-gray-400 hover:text-white"
              >
                ← {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Sign In'}
              </button>
            )}
          </form>
        )}
      </div>

      {/* Bottom Privacy Statement */}
      <div className="relative z-10 pb-5 text-center text-[10px] text-gray-400 max-w-xs leading-relaxed">
        🔒 {language === 'am' ? 'የግል ማኅበር ነው፤ የህዝብ ምዝገባ የለም።' : 'Strictly private Mahber. Public registration is prohibited.'}
      </div>
    </div>
  );
};

