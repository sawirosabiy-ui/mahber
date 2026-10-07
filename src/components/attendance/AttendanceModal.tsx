import React, { useState } from 'react';
import { AbsenceReasonCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X, ShieldAlert, Check } from 'lucide-react';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: AbsenceReasonCategory, note: string) => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const [selectedReason, setSelectedReason] = useState<AbsenceReasonCategory>('work');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const reasons: { key: AbsenceReasonCategory; label: string }[] = [
    { key: 'work', label: t.reasonWork },
    { key: 'travel', label: t.reasonTravel },
    { key: 'family', label: t.reasonFamily },
    { key: 'personal', label: t.reasonPersonal },
    { key: 'health', label: t.reasonHealth },
    { key: 'other', label: t.reasonOther },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedReason, note);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div
        className="w-full max-w-md bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] rounded-t-3xl sm:rounded-2xl border border-[#B89A5A]/25 p-5 shadow-sacred max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#B89A5A]/15">
          <div className="flex items-center gap-2">
            <span className="text-[#6F2630] font-bold text-lg select-none">❖</span>
            <h3 className="text-lg font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {t.cantAttendTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#315C48]/20 border border-[#315C48] flex items-center justify-center text-[#315C48] mb-3">
              <Check size={24} />
            </div>
            <p className="text-sm font-medium text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {t.absenceSubmittedToast}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Privacy Assurance Banner */}
            <div className="p-3 rounded-xl bg-[#6F2630]/10 border border-[#6F2630]/30 flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-[#B89A5A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#E5DCD0] dark:text-[#E5DCD0] light:text-[#4A3F35] leading-relaxed">
                {t.privacyGuarantee}
              </p>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600">
              {t.cantAttendSubtitle}
            </p>

            {/* Reasons Grid */}
            <div className="space-y-2">
              {reasons.map((r) => {
                const isSelected = selectedReason === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedReason(r.key)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#6F2630]/25 border-[#B89A5A] text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] font-medium'
                        : 'bg-[#29251F]/60 dark:bg-[#29251F]/60 light:bg-[#F8F3EA] border-[#B89A5A]/15 text-gray-300 dark:text-gray-300 light:text-[#4A3F35] hover:border-[#B89A5A]/40'
                    }`}
                  >
                    <span>{r.label}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#B89A5A]" />}
                  </button>
                );
              })}
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {t.optionalNotePlaceholder}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={t.optionalNotePlaceholder}
                className="w-full rounded-xl bg-[#151311] dark:bg-[#151311] light:bg-[#F3ECE0] border border-[#B89A5A]/25 px-3 py-2 text-sm text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] focus:outline-none focus:border-[#B89A5A] placeholder-gray-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-[#B89A5A]/25 text-gray-300 dark:text-gray-300 light:text-[#4A3F35] text-sm hover:bg-white/5 transition"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-sm font-medium transition shadow-md touch-press"
              >
                {t.btnSubmitAbsence}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
