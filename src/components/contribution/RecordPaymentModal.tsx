import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Member } from '../../types';
import { mahberService } from '../../services/mahberService';
import { X, Check, CreditCard } from 'lucide-react';

interface RecordPaymentModalProps {
  allMembers: Member[];
  onClose: () => void;
  onPaymentRecorded?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  allMembers,
  onClose,
  onPaymentRecorded,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedMemberId, setSelectedMemberId] = useState(allMembers[0]?.id || '');
  const [amount, setAmount] = useState<number>(100);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('paid');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<'Telebirr' | 'CBE' | 'Cash' | 'Awash' | 'Other'>('Telebirr');
  const [referenceId, setReferenceId] = useState<string>(
    `TRX-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  );
  const [notes, setNotes] = useState<string>('Monthly regular contribution');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedMember = allMembers.find((m) => m.id === selectedMemberId) || allMembers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || amount <= 0) return;

    const periods = mahberService.getContributionPeriods();
    const activePeriod = periods.find((p) => p.status === 'active') || periods[0];
    const periodId = activePeriod?.id || 'p-2018-01';

    mahberService.recordPayment(
      selectedMemberId,
      periodId,
      amount,
      paymentDate,
      `${paymentMethod} - Ref: ${referenceId}. ${notes}`,
      currentUser?.name || 'Finance Admin'
    );

    setFeedback(
      language === 'am'
        ? 'ክፍያው በተሳካ ሁኔታ ተመዝግቧል!'
        : 'Payment successfully recorded and added to ledger!'
    );

    onPaymentRecorded?.();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141A17] border border-[#B89A5A]/30 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
          <h3 className="text-sm font-bold text-[#F5EFE3] flex items-center gap-2">
            <CreditCard size={16} className="text-[#B89A5A]" />
            {language === 'am' ? 'ክፍያ መዝግብ (Record Payment)' : 'Record Payment'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#9E9484] hover:text-[#F5EFE3]"
          >
            <X size={18} />
          </button>
        </div>

        {feedback ? (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-center text-xs font-bold">
            {feedback}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                {language === 'am' ? 'አባል' : 'Member'}
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
              >
                {allMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.amharicName})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedMember.avatarUrl}
                  alt={selectedMember.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-[#F5EFE3]">{selectedMember.name}</p>
                  <p className="text-[10px] text-[#9E9484]">Meskerem 2018 (Oct 2025)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#B89A5A]">100 ETB / mo</span>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1.5">
                {language === 'am' ? 'የክፍያ ሁኔታ' : 'Payment Status'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['paid', 'pending', 'partial'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPaymentStatus(st)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      paymentStatus === st
                        ? 'bg-[#B89A5A] text-[#0E1210] shadow'
                        : 'bg-[#1B2420] text-[#9E9484] border border-[#B89A5A]/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  {language === 'am' ? 'መጠን (ETB)' : 'Amount (ETB)'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] font-bold focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  {language === 'am' ? 'የተከፈለበት ቀን' : 'Payment Date'}
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                {language === 'am' ? 'የመክፈያ ዘዴ' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
              >
                <option value="Telebirr">Telebirr (ቴሌብር)</option>
                <option value="CBE">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Cash">Cash (በእጅ ጥሬ ገንዘብ)</option>
                <option value="Awash">Awash Bank</option>
                <option value="Other">Other Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                {language === 'am' ? 'የማጣቀሻ ቁጥር (Reference ID)' : 'Reference ID (optional)'}
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g. TRX-7846-9F3A"
                className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] font-mono placeholder-[#9E9484]/50 focus:outline-none focus:border-[#B89A5A]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-[#1B2420] text-[#9E9484] text-xs font-semibold hover:text-[#F5EFE3]"
              >
                {language === 'am' ? 'ይቅር' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                {language === 'am' ? 'ክፍያውን መዝግብ' : 'Save Payment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
