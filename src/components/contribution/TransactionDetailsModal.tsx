import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X, CheckCircle2, ShieldCheck, FileText, Download } from 'lucide-react';

export interface DisplayTransaction {
  id: string;
  type: 'contribution' | 'expense' | 'penalty' | 'adjustment';
  title: string;
  amount: number;
  date: string;
  member?: string;
  category: string;
  paymentMethod?: string;
  referenceId: string;
  notes?: string;
  approvedBy?: string;
  createdBy?: string;
}

interface TransactionDetailsModalProps {
  transaction: DisplayTransaction;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  onClose,
}) => {
  const { language } = useLanguage();

  const isPositive = transaction.type === 'contribution' || transaction.amount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#141A17] border border-[#B89A5A]/30 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
          <h3 className="text-sm font-bold text-[#F5EFE3]">
            {language === 'am' ? 'የግብይት ዝርዝር መረጃ' : 'Transaction Details'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#9E9484] hover:text-[#F5EFE3]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount & Status Hero Card matching Photo 9 & 11 Screen 5 */}
        <div className="p-4 rounded-xl bg-[#1B2420] border border-[#B89A5A]/20 text-center space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            {language === 'am' ? 'ተጠናቋል' : 'Completed'}
          </span>
          <h2
            className={`text-2xl font-black ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? `+${transaction.amount.toLocaleString()}` : `-${Math.abs(transaction.amount).toLocaleString()}`}{' '}
            ETB
          </h2>
          <p className="text-xs font-semibold text-[#F5EFE3]">{transaction.title}</p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 text-xs">
          {transaction.member && (
            <div className="flex items-center justify-between py-1 border-b border-[#B89A5A]/10">
              <span className="text-[#9E9484]">{language === 'am' ? 'አባል' : 'Member'}</span>
              <span className="font-semibold text-[#F5EFE3]">{transaction.member}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 border-b border-[#B89A5A]/10">
            <span className="text-[#9E9484]">{language === 'am' ? 'ቀን እና ሰዓት' : 'Date & Time'}</span>
            <span className="text-[#F5EFE3]">{transaction.date}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#B89A5A]/10">
            <span className="text-[#9E9484]">{language === 'am' ? 'ዓይነት' : 'Category'}</span>
            <span className="text-[#F5EFE3]">{transaction.category}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#B89A5A]/10">
            <span className="text-[#9E9484]">{language === 'am' ? 'የመክፈያ ዘዴ' : 'Payment Method'}</span>
            <span className="text-[#F5EFE3]">{transaction.paymentMethod || 'Telebirr'}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#B89A5A]/10">
            <span className="text-[#9E9484]">{language === 'am' ? 'የማጣቀሻ ቁጥር' : 'Reference ID'}</span>
            <span className="font-mono text-[#B89A5A]">{transaction.referenceId}</span>
          </div>

          {transaction.notes && (
            <div className="py-1 border-b border-[#B89A5A]/10">
              <span className="text-[#9E9484] block mb-0.5">{language === 'am' ? 'ማስታወሻ' : 'Notes'}</span>
              <p className="text-[#F5EFE3] italic bg-[#1B2420] p-2 rounded-lg">
                "{transaction.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Audit Trail matching Photo 9 & 11 Screen 5 */}
        <div className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 space-y-1 text-[11px]">
          <span className="font-bold text-[#B89A5A] uppercase tracking-wider block mb-1">
            {language === 'am' ? 'የኦዲት መዝገብ' : 'Audit Trail'}
          </span>
          <div className="flex items-center justify-between text-[#9E9484]">
            <span>{language === 'am' ? 'የመዘገበው:' : 'Created by:'}</span>
            <span className="text-[#F5EFE3]">{transaction.createdBy || 'Selamawit Desta'}</span>
          </div>
          <div className="flex items-center justify-between text-[#9E9484]">
            <span>{language === 'am' ? 'ያረጋገጠው:' : 'Confirmed by:'}</span>
            <span className="text-[#F5EFE3]">{transaction.approvedBy || 'Finance Admin'}</span>
          </div>
        </div>

        {/* Related Files Attachment */}
        <div className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#F5EFE3]">
            <FileText size={16} className="text-[#B89A5A]" />
            <div>
              <p className="font-semibold">Receipt_001.pdf</p>
              <p className="text-[10px] text-[#9E9484]">2.4 MB</p>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-lg bg-[#141A17] text-[#B89A5A] hover:text-[#F5EFE3]"
          >
            <Download size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold hover:opacity-95 shadow-md"
        >
          {language === 'am' ? 'ዝጋ' : 'Close'}
        </button>
      </div>
    </div>
  );
};
