import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EthiopianCross } from '../common/EthiopianCross';
import { SacredDivider } from '../common/SacredDivider';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { t, language } = useLanguage();
  const { loginWithCredentials, resetPassword, activateAccountWithInvite, allMembers } = useAuth();

  const [mode, setMode] = useState<'login' | 'invite' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'invite') {
        if (!inviteCode.trim()) {
          setErrorMessage(language === 'am' ? 'እባክዎን የግብዣ ኮድዎን ያስገቡ።' : 'Please provide your invitation code.');
          setLoading(false);
          return;
        }
        const res = await activateAccountWithInvite(inviteCode.trim());
        if (res.success) {
          setSuccessMessage(
            language === 'am' ? 'እንኳን ደህና መጡ! መለያዎ በተሳካ ሁኔታ ነቅቷል።' : 'Welcome! Your account has been activated.'
          );
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(res.error || (language === 'am' ? 'ልክ ያልሆነ ወይም ጊዜው ያለፈበት የግብዣ ኮድ' : 'Invalid or expired invitation code'));
        }
      } else if (mode === 'reset') {
        if (!email.trim()) {
          setErrorMessage(language === 'am' ? 'እባክዎን ኢሜይልዎን ያስገቡ።' : 'Please provide your email.');
          setLoading(false);
          return;
        }
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage(
            language === 'am'
              ? 'የይለፍ ቃል መቀየሪያ ማስፈንጠሪያ ወደ ኢሜይልዎ ተልኳል።'
              : 'Password reset link has been dispatched to your email.'
          );
        } else {
          setErrorMessage(res.error || 'Failed to send password reset');
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMessage(
            language === 'am'
              ? 'እባክዎ ኢሜይል እና የይለፍ ቃልዎን ያስገቡ።'
              : 'Please enter both your email and password.'
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
    <div className="min-h-screen w-full flex flex-col justify-between items-center p-5 bg-[#151311] text-[#F5EFE3] select-none animate-fade-in relative overflow-hidden">
      {/* Background sacred atmosphere */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1548625361-195fe61a55c3?w=1200&auto=format&fit=crop&q=80"
          alt="Church Architecture"
          className="w-full h-full object-cover filter brightness-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151311] via-[#151311]/80 to-[#151311]" />
      </div>

      {/* Top Sacred Identity Header */}
      <div className="relative z-10 pt-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#B89A5A]/15 border-2 border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A] shadow-candle-glow mb-3">
          <EthiopianCross size={36} color="#B89A5A" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#F5EFE3]">
          {language === 'am' ? 'መድኃኔዓለም ማኅበር' : 'MEDHANIALEM MAHBER'}
        </h1>
        <p className="text-xs text-[#B89A5A] font-serif tracking-widest uppercase">
          {language === 'am' ? 'የግል አባላት መግቢያ' : 'PRIVATE MEMBER ACCESS'}
        </p>
      </div>

      {/* Login Card Form */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl p-5 bg-[#201D19]/90 backdrop-blur-md border border-[#B89A5A]/30 shadow-sacred space-y-4 my-auto">
        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-[#151311] p-1 border border-[#B89A5A]/20">
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
            onClick={() => { setMode('invite'); setErrorMessage(null); setSuccessMessage(null); }}
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
              ? language === 'am' ? 'በግብዣ ኮድ መለያ ማግበር' : 'Activate with Invite Code'
              : mode === 'reset'
              ? language === 'am' ? 'የይለፍ ቃል መልሶ ማግኛ' : 'Reset Password'
              : language === 'am' ? 'ወደ ማኅበሩ ይግቡ' : 'Sign In to Your Mahber'}
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {mode === 'invite'
              ? language === 'am' ? 'ከአስተዳዳሪ የተሰጠዎትን ባለ 8 ዲጂት የግብዣ ኮድ ያስገቡ' : 'Enter the single-use invite code provided by an admin'
              : mode === 'reset'
              ? language === 'am' ? 'የተመዘገቡበትን ኢሜይል ያስገቡ' : 'Enter your registered email'
              : language === 'am' ? 'ይህ የግል ማኅበር ለአባላት ብቻ የተፈቀደ ነው' : 'Private Mahber for authorized members only'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-[#6F2630]/20 border border-[#6F2630] text-xs text-[#E5DCD0] flex items-center gap-2">
            <AlertCircle size={15} className="text-[#D98A94] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-2.5 rounded-xl bg-[#315C48]/20 border border-[#315C48] text-xs text-[#D8E6DE] flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#315C48] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'invite' ? (
            /* Invite Code Input */
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-400">
                {language === 'am' ? 'የግብዣ ኮድ (e.g. MAH-AB12CD)' : 'Invitation Code'}
              </label>
              <div className="relative">
                <ShieldCheck size={15} className="absolute left-3 top-3 text-[#B89A5A]" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="MAH-XXXXXX"
                  required
                  className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 pl-9 pr-3 py-2 text-xs font-mono uppercase tracking-wider text-white focus:outline-none focus:border-[#B89A5A] transition"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Email field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-400">
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
                    className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#B89A5A] transition"
                  />
                </div>
              </div>

              {/* Password field */}
              {mode === 'login' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-semibold text-gray-400">
                      {language === 'am' ? 'የይለፍ ቃል (Password)' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
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
                      className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/25 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#B89A5A] transition"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] disabled:opacity-50 text-white text-xs font-bold tracking-wide shadow-sacred transition touch-press flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="animate-spin text-sm">❖</span>
            ) : mode === 'invite' ? (
              <>
                <ShieldCheck size={15} />
                <span>{language === 'am' ? 'መለያ አግብር (Activate Account)' : 'Activate Account'}</span>
              </>
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
              onClick={() => setMode('login')}
              className="w-full py-2 text-center text-[11px] text-gray-400 hover:text-white"
            >
              ← {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Sign In'}
            </button>
          )}
        </form>
      </div>

      {/* Bottom Privacy Statement */}
      <div className="relative z-10 pb-6 text-center text-[10px] text-gray-500 max-w-xs leading-relaxed">
        🔒 {language === 'am' ? 'የግል ማኅበር ነው፤ የህዝብ ምዝገባ የለም።' : 'Strictly private Mahber. Public registration is prohibited.'}
      </div>
    </div>
  );
};
