import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Member, MemberContribution } from '../../types';
import { mahberService } from '../../services/mahberService';
import { RecordPaymentModal } from './RecordPaymentModal';
import { AddExpenseModal } from './AddExpenseModal';
import { TransactionDetailsModal, DisplayTransaction } from './TransactionDetailsModal';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  PieChart,
  FileText,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ContributionViewProps {
  contributions?: MemberContribution[];
  contribution?: MemberContribution;
  allMembers?: Member[];
  onOpenAdminGate?: () => void;
}

export const ContributionView: React.FC<ContributionViewProps> = ({
  contributions,
  contribution,
  allMembers: propMembers,
  onOpenAdminGate,
}) => {
  const { language } = useLanguage();
  const { currentUser, allMembers: contextMembers, isAdmin } = useAuth();
  const allMembers = propMembers && propMembers.length > 0 ? propMembers : contextMembers;

  // Top Section Navigation matching Photos 8, 9, 10, 11, 12
  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'expenses' | 'shared_funds' | 'my_record'>('overview');

  // Modals
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DisplayTransaction | null>(null);

  // Filter & Search
  const [memberSearch, setMemberSearch] = useState('');
  const [expenseFilter, setExpenseFilter] = useState<'all' | 'church' | 'events' | 'maintenance' | 'other'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Live Shared Fund Balance
  const sharedFundBalance = 128450;
  const totalContributions = 482300;
  const totalExpenses = 98750;
  const pendingArrears = 24600;

  // Monthly breakdown mock matching Photo 10: 7 paid (700 ETB), 4 pending (400 ETB)
  const monthlyStatus = [
    { id: 'm1', name: 'Sawiros Abiy', status: 'Paid', amount: 100, date: 'Oct 5, 2025' },
    { id: 'm2', name: 'Natnael Endale', status: 'Paid', amount: 100, date: 'Oct 5, 2025' },
    { id: 'm3', name: 'Bereket Mikre', status: 'Paid', amount: 100, date: 'Oct 4, 2025' },
    { id: 'm4', name: 'Nahom Wondu', status: 'Paid', amount: 100, date: 'Oct 3, 2025' },
    { id: 'm5', name: 'Fisiha', status: 'Paid', amount: 100, date: 'Oct 2, 2025' },
    { id: 'm6', name: 'Elias Roba', status: 'Paid', amount: 100, date: 'Oct 1, 2025' },
    { id: 'm7', name: 'Dawit Kasahun', status: 'Paid', amount: 100, date: 'Sep 30, 2025' },
    { id: 'm8', name: 'Ermias', status: 'Pending', amount: 100, date: 'Due Oct 27' },
    { id: 'm9', name: 'Abel', status: 'Pending', amount: 100, date: 'Due Oct 27' },
    { id: 'm10', name: 'Michael', status: 'Pending', amount: 100, date: 'Due Oct 27' },
    { id: 'm11', name: 'Simon Beyene', status: 'Pending', amount: 100, date: 'Due Oct 27' },
  ];

  const recentTransactions: DisplayTransaction[] = [
    {
      id: 'tx-1',
      type: 'contribution',
      title: 'Member Contribution - Dawit Kasahun',
      amount: 100,
      date: 'Oct 6, 2025 · 9:00 AM',
      member: 'Dawit Kasahun',
      category: 'Monthly Regular Contribution',
      paymentMethod: 'Telebirr',
      referenceId: 'TRX-8246-9F3A',
      notes: 'Paid on time via Telebirr mobile wallet',
      createdBy: 'Natnael Endale',
      approvedBy: 'Sawiros Abiy',
    },
    {
      id: 'tx-2',
      type: 'expense',
      title: 'Church Maintenance & Incense',
      amount: -5000,
      date: 'Oct 5, 2025 · 2:15 PM',
      category: 'Church Maintenance',
      paymentMethod: 'CBE Transfer',
      referenceId: 'EXP-1092-4C1B',
      notes: 'Sanctuary maintenance and sacred items purchase',
      createdBy: 'Natnael Endale',
      approvedBy: 'Sawiros Abiy',
    },
    {
      id: 'tx-3',
      type: 'contribution',
      title: 'Member Contribution - Elias Roba',
      amount: 100,
      date: 'Oct 4, 2025 · 11:30 AM',
      member: 'Elias Roba',
      category: 'Monthly Regular Contribution',
      paymentMethod: 'Telebirr',
      referenceId: 'TRX-7731-8A2D',
      notes: 'Meskerem 2018 regular contribution',
      createdBy: 'Natnael Endale',
      approvedBy: 'Sawiros Abiy',
    },
    {
      id: 'tx-4',
      type: 'expense',
      title: 'Gathering Refreshments & Agape Feast',
      amount: -3500,
      date: 'Oct 2, 2025 · 4:00 PM',
      category: 'Event Supplies',
      paymentMethod: 'Cash',
      referenceId: 'EXP-9831-2F4A',
      notes: 'Refreshments for monthly fellowship gathering',
      createdBy: 'Natnael Endale',
      approvedBy: 'Sawiros Abiy',
    },
  ];

  const filteredMembers = monthlyStatus.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      {/* 5-Pillar Top Tab Navigation matching Photos 8 & 9 */}
      <div className="flex bg-[#141A17] p-1 rounded-2xl border border-[#B89A5A]/20 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'አጠቃላይ' : 'Overview'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contributions')}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'contributions'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'መዋጮዎች' : 'Contributions'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'expenses'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'ወጪዎች' : 'Expenses'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shared_funds')}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'shared_funds'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የጋራ ፈንድ' : 'Shared Funds'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my_record')}
          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'my_record'
              ? 'bg-[#B89A5A] text-[#0E1210] shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የግል ሒሳብ' : 'My Record'}
        </button>
      </div>

      {/* PILLAR 1: FINANCE OVERVIEW (Photo 8 & 9) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Shared Fund Balance Hero Card */}
          <div className="bg-gradient-to-br from-[#1B2420] to-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#9E9484] uppercase tracking-wider">
                {language === 'am' ? 'የጋራ ቋት ሒሳብ (Shared Fund)' : 'Shared Fund Balance'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <ArrowUpRight size={12} />
                +12% this year
              </span>
            </div>

            <div>
              <h2 className="text-3xl font-black text-[#F5EFE3] tracking-tight">
                {sharedFundBalance.toLocaleString()} <span className="text-lg text-[#B89A5A]">ETB</span>
              </h2>
              <p className="text-xs text-[#9E9484] mt-0.5">
                {language === 'am' ? 'በአሁኑ ሰዓት በባንክ እና በካዝና ያለው ጠቅላላ ቀሪ' : 'Reconciled total in treasury & logistics escrow'}
              </p>
            </div>

            {/* 3 Metric Pills matching Photo 8 & 9 */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#B89A5A]/15 text-center">
              <div className="p-2 rounded-xl bg-[#0E1210]">
                <span className="text-xs font-bold text-emerald-400">
                  {totalContributions.toLocaleString()}
                </span>
                <p className="text-[9px] text-[#9E9484]">Total Collected</p>
              </div>
              <div className="p-2 rounded-xl bg-[#0E1210]">
                <span className="text-xs font-bold text-rose-400">
                  {totalExpenses.toLocaleString()}
                </span>
                <p className="text-[9px] text-[#9E9484]">Total Expenses</p>
              </div>
              <div className="p-2 rounded-xl bg-[#0E1210]">
                <span className="text-xs font-bold text-amber-400">
                  {pendingArrears.toLocaleString()}
                </span>
                <p className="text-[9px] text-[#9E9484]">Pending / Arrears</p>
              </div>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsRecordPaymentOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:opacity-95"
            >
              <Plus size={14} />
              {language === 'am' ? 'መዋጮ መዝግብ' : 'Record Contribution'}
            </button>
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-[#1B2420] text-[#F5EFE3] text-xs font-bold border border-[#B89A5A]/30 flex items-center justify-center gap-1.5 hover:bg-[#25322C]"
            >
              <Plus size={14} className="text-[#B89A5A]" />
              {language === 'am' ? 'ወጪ ጨምር' : 'Add Expense'}
            </button>
          </div>

          {/* Recent Transactions Feed matching Photo 8 & 9 */}
          <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F5EFE3] uppercase tracking-wider">
                {language === 'am' ? 'የቅርብ ጊዜ ግብይቶች' : 'Recent Transactions'}
              </h4>
              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                className="text-[11px] text-[#B89A5A] hover:underline"
              >
                {language === 'am' ? 'ሁሉንም እይ' : 'View All →'}
              </button>
            </div>

            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/10 flex items-center justify-between hover:border-[#B89A5A]/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        tx.amount > 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {tx.amount > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#F5EFE3]">{tx.title}</p>
                      <p className="text-[10px] text-[#9E9484]">{tx.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ETB
                    </span>
                    <p className="text-[9px] text-[#9E9484]">{tx.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2: MONTHLY CONTRIBUTIONS (Photo 10) */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          {/* Collection Progress Donut Card matching Photo 10 Screen 1 */}
          <div className="bg-gradient-to-br from-[#1B2420] to-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#B89A5A] uppercase tracking-wider">
                  Meskerem 2018 (Oct 2025)
                </span>
                <h3 className="text-base font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'የወሩ መዋጮ አፈጻጸም' : 'Monthly Contributions Progress'}
                </h3>
              </div>
              <span className="text-xs text-[#9E9484]">Due: 27th</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Donut representation */}
              <div className="relative w-20 h-20 rounded-full bg-[#141A17] border-4 border-[#B89A5A] flex flex-col items-center justify-center text-center shrink-0 shadow-inner">
                <span className="text-base font-black text-white">64%</span>
                <span className="text-[8px] text-[#B89A5A] uppercase font-bold">Collected</span>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#9E9484]">Total Due (11 members):</span>
                  <span className="font-bold text-[#F5EFE3]">1,100 ETB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400">Collected (7 paid):</span>
                  <span className="font-bold text-emerald-400">700 ETB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400">Outstanding (4 pending):</span>
                  <span className="font-bold text-amber-400">400 ETB</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRecordPaymentOpen(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:opacity-95"
            >
              <Plus size={14} />
              {language === 'am' ? 'ክፍያ መዝግብ' : 'Record Member Payment'}
            </button>
          </div>

          {/* Member Payment Table matching Photo 10 Screen 2 */}
          <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F5EFE3] uppercase">
                {language === 'am' ? 'የ11ዱ አባላት ዝርዝር' : '11 Members Roster'}
              </h4>
              <div className="relative w-36">
                <input
                  type="text"
                  placeholder="Search..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg bg-[#1B2420] border border-[#B89A5A]/20 text-[11px] text-[#F5EFE3] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#141A17] border border-[#B89A5A]/30 flex items-center justify-center text-xs font-bold text-[#F5EFE3]">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#F5EFE3]">{m.name}</p>
                      <p className="text-[10px] text-[#9E9484]">{m.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#F5EFE3]">{m.amount} ETB</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        m.status === 'Paid'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-950 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Report Actions matching Photo 10 Screen 5 */}
          <div className="p-4 rounded-2xl bg-[#141A17] border border-[#B89A5A]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText size={18} className="text-[#B89A5A]" />
              <div>
                <p className="text-xs font-bold text-[#F5EFE3]">Monthly Financial Report</p>
                <p className="text-[10px] text-[#9E9484]">Meskerem 2018 Statement</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[#1B2420] text-[#B89A5A] text-xs font-bold border border-[#B89A5A]/30 flex items-center gap-1 hover:bg-[#25322C]"
              >
                <Download size={12} />
                PDF
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[#1B2420] text-[#F5EFE3] text-xs font-bold border border-[#B89A5A]/30 flex items-center gap-1 hover:bg-[#25322C]"
              >
                <Share2 size={12} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 3: EXPENSES (Photo 11) */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#1B2420] to-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/40 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#9E9484] uppercase tracking-wider">
                Total Expenses (This Year)
              </span>
              <h3 className="text-2xl font-black text-rose-400 mt-1">
                {totalExpenses.toLocaleString()} <span className="text-sm text-[#F5EFE3]">ETB</span>
              </h3>
              <p className="text-[11px] text-[#9E9484]">12 logged expense vouchers</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold flex items-center gap-1 shadow-md hover:opacity-95"
            >
              <Plus size={14} />
              Add Expense
            </button>
          </div>

          {/* Category Filter Chips matching Photo 11 Screen 2 */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'church', 'events', 'maintenance', 'other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setExpenseFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                  expenseFilter === cat
                    ? 'bg-[#B89A5A] text-[#0E1210]'
                    : 'bg-[#141A17] text-[#9E9484] border border-[#B89A5A]/15'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expenses List */}
          <div className="space-y-2">
            {recentTransactions
              .filter((tx) => tx.type === 'expense')
              .map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="p-3 rounded-xl bg-[#141A17] border border-[#B89A5A]/15 flex items-center justify-between hover:border-[#B89A5A]/40 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                      <ArrowDownRight size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#F5EFE3]">{tx.title}</p>
                      <p className="text-[10px] text-[#9E9484]">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-400">{tx.amount} ETB</span>
                    <span className="block text-[9px] text-emerald-400 font-semibold">Approved</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* PILLAR 4: SHARED FUNDS (Photo 11 Screen 4) */}
      {activeTab === 'shared_funds' && (
        <div className="space-y-4">
          <div className="bg-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/30 space-y-4 shadow-xl">
            <div>
              <span className="text-xs font-bold text-[#B89A5A] uppercase tracking-wider">
                Total Shared Fund
              </span>
              <h2 className="text-3xl font-black text-[#F5EFE3] mt-1">
                {sharedFundBalance.toLocaleString()} <span className="text-base text-[#B89A5A]">ETB</span>
              </h2>
            </div>

            {/* Purpose Breakdown Progress Bars matching Photo 8 Screen 4 */}
            <div className="space-y-3 pt-2 border-t border-[#B89A5A]/15">
              <h4 className="text-xs font-bold text-[#F5EFE3] uppercase">Funds by Purpose</h4>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#F5EFE3]">Church Operations (45%)</span>
                    <span className="font-bold text-[#B89A5A]">57,803 ETB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1B2420]">
                    <div className="h-full rounded-full bg-[#B89A5A]" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#F5EFE3]">Community Support (20%)</span>
                    <span className="font-bold text-emerald-400">25,690 ETB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1B2420]">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '20%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#F5EFE3]">Events & Gatherings (15%)</span>
                    <span className="font-bold text-rose-400">19,268 ETB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1B2420]">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: '15%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#F5EFE3]">Maintenance & Emergency (20%)</span>
                    <span className="font-bold text-sky-400">25,689 ETB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1B2420]">
                    <div className="h-full rounded-full bg-sky-500" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 5: MY FINANCIAL RECORD (Photo 12) */}
      {activeTab === 'my_record' && (
        <div className="space-y-4">
          {/* Member Profile & Monthly Status Card matching Photo 12 Screen 1 */}
          <div className="bg-gradient-to-br from-[#1B2420] to-[#141A17] rounded-3xl p-5 border border-[#B89A5A]/40 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#B89A5A]"
              />
              <div>
                <h3 className="text-base font-bold text-[#F5EFE3]">{currentUser.name}</h3>
                <p className="text-xs text-[#9E9484]">{currentUser.amharicName}</p>
                <span className="text-[10px] text-[#B89A5A] font-mono">
                  ID: TRX-7846-{currentUser.id.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0E1210] border border-[#B89A5A]/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#9E9484] uppercase font-bold">
                  This Month (Meskerem 2018)
                </span>
                <p className="text-lg font-black text-emerald-400">100 ETB</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Paid
              </span>
            </div>

            {/* Annual Summary Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#141A17]">
                <span className="font-bold text-[#F5EFE3]">1,200 ETB</span>
                <p className="text-[9px] text-[#9E9484]">Expected</p>
              </div>
              <div className="p-2 rounded-xl bg-[#141A17]">
                <span className="font-bold text-emerald-400">1,100 ETB</span>
                <p className="text-[9px] text-[#9E9484]">Total Paid</p>
              </div>
              <div className="p-2 rounded-xl bg-[#141A17]">
                <span className="font-bold text-amber-400">100 ETB</span>
                <p className="text-[9px] text-[#9E9484]">Outstanding</p>
              </div>
            </div>
          </div>

          {/* Penalties & Adjustments Card matching Photo 12 Screen 3 */}
          <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <AlertCircle size={14} />
                Penalties & Adjustments
              </h4>
              <span className="text-xs font-bold text-rose-400">200 ETB (2 records)</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#1B2420] border border-rose-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#F5EFE3]">Absence Penalty</p>
                  <p className="text-[10px] text-[#9E9484]">Nov 15, 2025 · Unexcused Absence</p>
                </div>
                <span className="text-xs font-bold text-rose-400">-200 ETB</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1B2420] border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#F5EFE3]">Late Arrival Penalty</p>
                  <p className="text-[10px] text-[#9E9484]">Sep 27, 2025 · Arrived after 2:30 PM</p>
                </div>
                <span className="text-xs font-bold text-amber-400">-100 ETB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Record Payment */}
      {isRecordPaymentOpen && (
        <RecordPaymentModal
          allMembers={allMembers}
          onClose={() => setIsRecordPaymentOpen(false)}
          onPaymentRecorded={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* MODAL: Add Expense */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          onClose={() => setIsAddExpenseOpen(false)}
          onExpenseAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* MODAL: Transaction Details */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};
