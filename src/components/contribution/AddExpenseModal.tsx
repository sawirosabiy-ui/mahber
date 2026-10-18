import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { mahberService } from '../../services/mahberService';
import { X, Check, UploadCloud, DollarSign } from 'lucide-react';

interface AddExpenseModalProps {
  onClose: () => void;
  onExpenseAdded?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  onClose,
  onExpenseAdded,
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();

  const [amount, setAmount] = useState<number>(2500);
  const [category, setCategory] = useState<string>('Food & Refreshments');
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('Food for monthly church gathering');
  const [paymentMethod, setPaymentMethod] = useState<string>('Telebirr');
  const [referenceId, setReferenceId] = useState<string>(
    `TRX-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  );
  const [fileName, setFileName] = useState<string>('Receipt_001.pdf');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    mahberService.recordSharedFundTransaction({
      type: 'expense',
      category: 'expense',
      amount,
      purpose: `[${category}] ${description}`,
      date: expenseDate,
      recordedBy: currentUser?.name || 'Finance Admin',
      notes: `Method: ${paymentMethod}, Ref: ${referenceId}, File: ${fileName}`,
    });

    setFeedback(
      language === 'am'
        ? 'ወጪው በተሳካ ሁኔታ ተመዝግቧል!'
        : 'Expense successfully recorded to shared ledger!'
    );

    onExpenseAdded?.();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141A17] border border-[#B89A5A]/30 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
          <h3 className="text-sm font-bold text-[#F5EFE3] flex items-center gap-2">
            <DollarSign size={16} className="text-[#B89A5A]" />
            {language === 'am' ? 'ወጪ መዝግብ (Add Expense)' : 'Add Expense'}
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
                {language === 'am' ? 'መጠን (ETB)' : 'Amount (ETB)'}
              </label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] font-bold focus:outline-none focus:border-[#B89A5A]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                {language === 'am' ? 'የወጪው ዓይነት' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
              >
                <option value="Food & Refreshments">Food & Refreshments (የምግብ እና መጠጥ)</option>
                <option value="Church Maintenance">Church Maintenance (የቤተክርስቲያን ጥገና)</option>
                <option value="Community Support">Community Support (የማኅበረሰብ ድጋፍ)</option>
                <option value="Event Supplies">Event Supplies (የዝግጅት ዕቃዎች)</option>
                <option value="Transport">Transport (የትራንስፖርት)</option>
                <option value="Equipment">Equipment (መሳሪያዎች)</option>
                <option value="Other">Other Expenses (ሌሎች)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                {language === 'am' ? 'ቀን' : 'Date'}
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                {language === 'am' ? 'ዝርዝር ማብራሪያ' : 'Description'}
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Food and soft drinks for church gathering"
                className="w-full px-3 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] placeholder-[#9E9484]/50 focus:outline-none focus:border-[#B89A5A]"
              />
            </div>

            {/* Receipt Upload Box matching Photo 11 Screen 3 */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                {language === 'am' ? 'ደረሰኝ (አማራጭ)' : 'Receipt (optional)'}
              </label>
              <div className="p-3 rounded-xl border border-dashed border-[#B89A5A]/30 bg-[#1B2420]/50 text-center flex flex-col items-center justify-center gap-1">
                <UploadCloud size={20} className="text-[#B89A5A]" />
                <span className="text-[11px] text-[#F5EFE3] font-medium">
                  {fileName ? fileName : 'Tap to upload receipt or photo'}
                </span>
                <span className="text-[9px] text-[#9E9484]">(PDF, JPG, PNG)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  {language === 'am' ? 'የመክፈያ ዘዴ' : 'Payment Method'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                >
                  <option value="Telebirr">Telebirr</option>
                  <option value="CBE">CBE</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  {language === 'am' ? 'የማጣቀሻ ቁጥር' : 'Ref ID'}
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] font-mono focus:outline-none focus:border-[#B89A5A]"
                />
              </div>
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
                {language === 'am' ? 'ወጪውን መዝግብ' : 'Save Expense'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
