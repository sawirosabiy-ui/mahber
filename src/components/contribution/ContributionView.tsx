import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { MemberContribution } from '../../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, Calendar, CircleDollarSign } from 'lucide-react';
import { EmptyView } from '../common/StateViews';

interface ContributionViewProps {
  contribution: MemberContribution;
}

export const ContributionView: React.FC<ContributionViewProps> = ({ contribution }) => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();

  const isFullyPaid = contribution.totalOutstanding === 0;

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Title & Privacy Header */}
      <div className="pt-2 text-center">
        <h2 className="text-lg font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
          {t.myContribution}
        </h2>
        <p className="text-xs text-gray-400">
          {currentUser.amharicName} ({currentUser.name})
        </p>
      </div>

      {/* Strict Privacy Notice */}
      <div className="p-3 rounded-2xl bg-[#315C48]/10 border border-[#315C48]/30 flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-[#315C48] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#D8E6DE] dark:text-[#D8E6DE] light:text-[#2B4B39] leading-relaxed">
          {t.contributionPrivacyNotice}
        </p>
      </div>

      {/* Main Status Card */}
      <div className="rounded-3xl p-5 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/25 shadow-sacred space-y-4">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-3">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{t.thisMonth}</div>
            <div className="text-2xl font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
              {contribution.thisMonthExpected} {t.currencyEtb}
            </div>
          </div>
          <div>
            {isFullyPaid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#315C48]/20 text-[#427A60] dark:text-[#529575] border border-[#315C48]/30 text-xs font-semibold">
                <CheckCircle2 size={15} />
                <span>🟢 ✓ {t.statusPaid}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6F2630]/20 text-[#8C3542] dark:text-[#D98A94] border border-[#6F2630]/30 text-xs font-semibold">
                <AlertTriangle size={15} />
                <span>🟡 ⚠ {contribution.totalOutstanding} {t.currencyEtb} {t.statusOutstanding}</span>
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-[#29251F]/70 dark:bg-[#29251F]/70 light:bg-[#F8F3EA] border border-[#B89A5A]/15">
            <div className="text-[11px] text-gray-400">{t.paidAmount}</div>
            <div className="text-base font-bold text-[#315C48] dark:text-[#529575]">
              {contribution.thisMonthPaid} {t.currencyEtb}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#29251F]/70 dark:bg-[#29251F]/70 light:bg-[#F8F3EA] border border-[#B89A5A]/15">
            <div className="text-[11px] text-gray-400">{t.remainingAmount}</div>
            <div className="text-base font-bold text-[#6F2630] dark:text-[#D98A94]">
              {contribution.totalOutstanding} {t.currencyEtb}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Card */}
      <div className="rounded-3xl p-5 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 shadow-sacred space-y-3">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 light:text-gray-600">
            {t.paymentHistory}
          </h3>
          <span className="text-xs text-[#B89A5A] font-serif">የመዋጮ መዝገብ</span>
        </div>

        {contribution.history.length === 0 ? (
          <EmptyView
            title={language === 'am' ? 'እስካሁን የክፍያ ታሪክ የለም።' : 'No contribution history yet.'}
          />
        ) : (
          <div className="divide-y divide-[#B89A5A]/10">
            {contribution.history.map((record) => (
              <div key={record.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#B89A5A]/10 text-[#B89A5A] flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                      {record.monthNameAm} ({record.yearEth})
                    </div>
                    {record.paidDate && (
                      <div className="text-[10px] text-gray-400">
                        የተከፈለበት: {record.paidDate}
                      </div>
                    )}
                    {record.note && (
                      <div className="text-[10px] text-[#B89A5A]">
                        {record.note}
                      </div>
                    )}
                    {/* Partial payments breakdown if multiple payments */}
                    {record.payments && record.payments.length > 1 && (
                      <div className="text-[9px] text-gray-500 mt-0.5">
                        {record.payments.map((p, idx) => (
                          <span key={p.id}>
                            ክፍያ {idx + 1}: {p.amount} ብር {idx < record.payments!.length - 1 ? ' + ' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                    {record.paid} / {record.expected} {t.currencyEtb}
                  </div>
                  {record.status === 'paid' ? (
                    <span className="text-[10px] text-[#315C48] dark:text-[#529575] flex items-center justify-end gap-1 font-medium">
                      <CheckCircle2 size={11} />
                      <span>✓ ተከፍሏል (Paid)</span>
                    </span>
                  ) : record.status === 'partial' ? (
                    <span className="text-[10px] text-[#B89A5A] flex items-center justify-end gap-1 font-medium">
                      <AlertTriangle size={11} />
                      <span>⚠ {record.expected - record.paid} ብር ቀሪ</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#6F2630] dark:text-[#D98A94] flex items-center justify-end gap-1 font-medium">
                      <span>○ ያልተከፈለ (Not Paid)</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
