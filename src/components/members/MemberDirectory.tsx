import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Member, AdminRole } from '../../types';
import { mahberService } from '../../services/mahberService';
import { EthiopianCross } from '../common/EthiopianCross';
import {
  Users,
  Search,
  Phone,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Crown,
  BookOpen,
  DollarSign,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

interface MemberDirectoryProps {
  onSelectMember?: (member: Member) => void;
  onNavigateTab?: (tab: any) => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  onSelectMember,
}) => {
  const { t, language } = useLanguage();
  const {
    currentUser,
    allMembers,
    isSuperAdmin,
    assignMemberAdminRoles,
    deactivateMember,
    updateMemberDetails,
  } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'leadership'>('all');

  // Role Assignment Modal State (Photo 16)
  const [roleModalMember, setRoleModalMember] = useState<Member | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AdminRole[]>([]);
  const [roleModalError, setRoleModalError] = useState<string | null>(null);
  const [roleModalSuccess, setRoleModalSuccess] = useState<string | null>(null);

  // Invite Code Modal State
  const [inviteModalMember, setInviteModalMember] = useState<Member | null>(null);
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string | null>(null);
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);

  // Detail Modal State
  const [detailMember, setDetailMember] = useState<Member | null>(null);

  // Outstanding contributions map for badges
  const contributions = mahberService.getAllContributions();

  // Active invitations for status checking
  const invitations = mahberService.getInvitations();

  // Check if member is pending initial activation
  const isPendingActivation = (member: Member): boolean => {
    // If active unredeemed invite exists or password hasn't been set
    const memberInvites = invitations.filter((inv) => inv.memberId === member.id && !inv.isUsed);
    const hasCustomPassword = !!mahberService.getMemberPassword(member.id);
    return memberInvites.length > 0 && !hasCustomPassword;
  };

  // Filtered members list
  const filteredMembers = allMembers.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.amharicName.toLowerCase().includes(q) ||
      (m.baptismalName && m.baptismalName.toLowerCase().includes(q)) ||
      m.phone.includes(q);

    if (!matchesSearch) return false;

    if (filterStatus === 'active') {
      return !m.isDeactivated && !isPendingActivation(m);
    }
    if (filterStatus === 'pending') {
      return isPendingActivation(m);
    }
    if (filterStatus === 'leadership') {
      return (
        m.role === 'admin' ||
        (m.roles && m.roles.length > 0) ||
        m.name.includes('Sawiros')
      );
    }
    return true;
  });

  // Handle open Role Modal (Photo 16)
  const handleOpenRoleModal = (member: Member) => {
    setRoleModalMember(member);
    setSelectedRoles(member.roles || (member.role === 'admin' ? ['management_admin'] : []));
    setRoleModalError(null);
    setRoleModalSuccess(null);
  };

  // Toggle role in modal
  const handleToggleRole = (role: AdminRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  // Save role assignments
  const handleSaveRoles = () => {
    if (!roleModalMember) return;
    setRoleModalError(null);
    setRoleModalSuccess(null);

    const res = assignMemberAdminRoles(roleModalMember.id, selectedRoles);
    if (!res.success) {
      setRoleModalError(res.error || 'Failed to update roles');
      return;
    }

    mahberService.logAuditEvent(
      currentUser.id,
      currentUser.name,
      `Updated administrative roles for ${roleModalMember.name}`,
      `የ${roleModalMember.amharicName} የአስተዳደር ሚና ተቀየረ`,
      'member',
      roleModalMember.id,
      `Assigned: ${selectedRoles.join(', ') || 'Regular Member'}`
    );

    setRoleModalSuccess(
      language === 'am' ? 'የአስተዳደር ሚናዎች በተሳካ ሁኔታ ተመድበዋል!' : 'Roles updated successfully!'
    );
    setTimeout(() => {
      setRoleModalMember(null);
    }, 1200);
  };

  // Generate Invite Code
  const handleGenerateInvite = (member: Member) => {
    const invite = mahberService.createInvitation(member.id, currentUser.id);
    setInviteModalMember(member);
    setGeneratedInviteCode(invite.code);
    setCopiedCodeToast(false);
  };

  const handleCopyCode = () => {
    if (generatedInviteCode) {
      navigator.clipboard.writeText(generatedInviteCode);
      setCopiedCodeToast(true);
      setTimeout(() => setCopiedCodeToast(false), 2000);
    }
  };

  // Toggle Member Status (Active / Deactivated)
  const handleToggleStatus = (member: Member) => {
    const actionText = member.isDeactivated
      ? (language === 'am' ? 'መለያውን ማንቃት ይፈልጋሉ?' : 'Reactivate member?')
      : (language === 'am' ? 'መለያውን ማገድ ይፈልጋሉ?' : 'Deactivate member?');

    if (window.confirm(actionText)) {
      if (member.isDeactivated) {
        updateMemberDetails(member.id, { isDeactivated: false });
        mahberService.logAuditEvent(
          currentUser.id,
          currentUser.name,
          `Reactivated member ${member.name}`,
          `አባል ${member.amharicName} እንደገና እንዲሰራ ተደርጓል`,
          'member',
          member.id
        );
      } else {
        deactivateMember(member.id);
        mahberService.logAuditEvent(
          currentUser.id,
          currentUser.name,
          `Deactivated member ${member.name}`,
          `አባል ${member.amharicName} ታግዷል`,
          'member',
          member.id
        );
      }
    }
  };

  // Render role badges
  const renderRolePill = (member: Member) => {
    const isSawiros = member.name.toLowerCase().includes('sawiros');
    if (isSawiros || (member.roles && member.roles.includes('super_admin'))) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B89A5A]/25 border border-[#B89A5A]/50 text-[10px] font-bold text-[#E5D298]">
          <Crown size={11} className="text-[#B89A5A]" />
          <span>{language === 'am' ? 'ዋና አስተዳዳሪ' : 'Super Admin'}</span>
        </span>
      );
    }

    const hasRoles = member.roles && member.roles.length > 0;
    if (hasRoles) {
      const roleLabels: string[] = [];
      if (member.roles?.includes('finance_admin')) roleLabels.push(language === 'am' ? 'ፋይናንስ' : 'Finance');
      if (member.roles?.includes('attendance_admin')) roleLabels.push(language === 'am' ? 'ስብሰባ' : 'Attendance');
      if (member.roles?.includes('mezmur_admin')) roleLabels.push(language === 'am' ? 'መዝሙር' : 'Mezmur');
      if (member.roles?.includes('management_admin')) roleLabels.push(language === 'am' ? 'ማስተባበር' : 'Admin');

      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#315C48]/25 border border-[#315C48]/50 text-[10px] font-semibold text-[#8ED0A8]">
          <ShieldCheck size={11} className="text-[#427A60]" />
          <span>{roleLabels.join(' • ')}</span>
        </span>
      );
    }

    if (member.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B89A5A]/20 border border-[#B89A5A]/30 text-[10px] font-semibold text-[#B89A5A]">
          <Shield size={11} />
          <span>{language === 'am' ? 'አስተዳዳሪ' : 'Admin'}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400">
        <span>{language === 'am' ? 'አባል' : 'Member'}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-[#F5EFE3]">
      {/* Header Banner matching Photo 13 */}
      <div className="rounded-3xl p-5 bg-[#141A17] border border-[#B89A5A]/25 shadow-sacred relative overflow-hidden">
        <div className="absolute right-3 top-3 opacity-15 pointer-events-none">
          <EthiopianCross size={72} color="#B89A5A" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#315C48] animate-pulse" />
            <span className="text-[10px] tracking-widest uppercase font-mono text-[#B89A5A]">
              {language === 'am' ? 'የማኅበሩ አባላት ማውጫ' : '11-BROTHER ROSTER'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#F5EFE3]">
            {language === 'am' ? 'የአባላት ዝርዝር' : 'Member Directory'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {language === 'am'
              ? '11 ቋሚ ወንድሞች • የግል ማኅበረሰብ'
              : '11 Covenant Members • Private Roster'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search size={15} className="absolute left-3.5 top-3 text-[#B89A5A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'am' ? 'በስም ወይም በስልክ ቁጥር ፈልግ...' : 'Search by name or phone...'}
            className="w-full rounded-2xl bg-[#0E1210] border border-[#B89A5A]/25 pl-10 pr-3 py-2 text-xs text-[#F5EFE3] placeholder-gray-500 focus:outline-none focus:border-[#B89A5A] transition shadow-inner"
          />
        </div>

        {/* Filter Pills matching Photo 13 */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'all'
                ? 'bg-[#6F2630] text-white shadow-sacred'
                : 'bg-[#0E1210] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {language === 'am' ? `ሁሉም (${allMembers.length})` : `All (${allMembers.length})`}
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'active'
                ? 'bg-[#6F2630] text-white shadow-sacred'
                : 'bg-[#0E1210] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {language === 'am' ? 'ንቁ (Active)' : 'Active'}
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'pending'
                ? 'bg-[#6F2630] text-white shadow-sacred'
                : 'bg-[#0E1210] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {language === 'am' ? 'ጥሪ የተላከላቸው' : 'Pending Invite'}
          </button>
          <button
            onClick={() => setFilterStatus('leadership')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === 'leadership'
                ? 'bg-[#6F2630] text-white shadow-sacred'
                : 'bg-[#0E1210] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {language === 'am' ? 'አመራር (Admins)' : 'Leadership'}
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="rounded-3xl p-8 bg-[#141A17] border border-[#B89A5A]/20 text-center space-y-2">
            <Users size={32} className="mx-auto text-gray-500 opacity-60" />
            <p className="text-xs text-gray-400">
              {language === 'am' ? 'ምንም አባል አልተገኘም' : 'No matching members found'}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const memberContribution = contributions[member.id];
            const isPaid = (memberContribution?.totalOutstanding || 0) === 0;
            const pending = isPendingActivation(member);

            return (
              <div
                key={member.id}
                className={`rounded-3xl p-4 bg-[#141A17] border ${
                  member.isDeactivated
                    ? 'border-red-900/40 opacity-60'
                    : 'border-[#B89A5A]/20 hover:border-[#B89A5A]/40'
                } shadow-sacred transition space-y-3`}
              >
                {/* Top Row: Avatar + Name + Roles */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#B89A5A]/40 shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#B89A5A]/20 border-2 border-[#B89A5A]/40 flex items-center justify-center font-bold text-base text-[#B89A5A]">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      {/* Status indicator dot */}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#141A17] ${
                          member.isDeactivated
                            ? 'bg-red-500'
                            : pending
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        title={
                          member.isDeactivated
                            ? 'Deactivated'
                            : pending
                            ? 'Pending Invitation Activation'
                            : 'Active'
                        }
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#F5EFE3]">
                          {member.amharicName}
                        </h3>
                        {renderRolePill(member)}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {member.name}
                        {member.baptismalName && (
                          <span className="text-gray-500 italic ml-1">
                            ({member.baptismalName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Status Badge */}
                  <div className="shrink-0 text-right">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#8ED0A8] bg-[#315C48]/20 px-2 py-0.5 rounded-full border border-[#315C48]/30">
                        <CheckCircle2 size={11} />
                        <span>{language === 'am' ? 'ተከፍሏል' : 'Paid'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <span>{memberContribution?.totalOutstanding || 0} ብር ቀሪ</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Phone & Info */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-300">
                  <a
                    href={`tel:${member.phone}`}
                    className="inline-flex items-center gap-1.5 text-gray-300 hover:text-[#B89A5A] transition"
                  >
                    <Phone size={13} className="text-[#B89A5A]" />
                    <span className="font-mono text-[11px]">{member.phone}</span>
                  </a>

                  {pending && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/40">
                      <Clock size={10} />
                      <span>{language === 'am' ? 'መለያው አልነቃም' : 'Pending Activation'}</span>
                    </span>
                  )}
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setDetailMember(member);
                      if (onSelectMember) onSelectMember(member);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-semibold transition border border-white/5"
                  >
                    {language === 'am' ? 'ዝርዝር መረጃ' : 'View Profile'}
                  </button>

                  {/* Super Admin Actions */}
                  {isSuperAdmin && (
                    <>
                      <button
                        onClick={() => handleGenerateInvite(member)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#B89A5A]/15 hover:bg-[#B89A5A]/25 border border-[#B89A5A]/30 text-[#D3BA7E] text-[11px] font-semibold transition flex items-center gap-1"
                        title={language === 'am' ? 'የግብዣ ኮድ' : 'Invite Code'}
                      >
                        <KeyRound size={12} />
                        <span>{language === 'am' ? 'የግብዣ ኮድ' : 'Invite'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenRoleModal(member)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#6F2630]/30 hover:bg-[#6F2630]/50 border border-[#6F2630]/60 text-white text-[11px] font-semibold transition flex items-center gap-1"
                        title={language === 'am' ? 'ሚና አስተካክል' : 'Manage Roles'}
                      >
                        <ShieldCheck size={12} />
                        <span>{language === 'am' ? 'ሚና' : 'Roles'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`p-1.5 rounded-xl border transition ${
                          member.isDeactivated
                            ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-400 hover:bg-emerald-900/40'
                            : 'bg-red-950/30 border-red-800/40 text-red-400 hover:bg-red-900/40'
                        }`}
                        title={member.isDeactivated ? 'Reactivate' : 'Deactivate'}
                      >
                        {member.isDeactivated ? <UserCheck size={13} /> : <UserX size={13} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ROLE DELEGATION MODAL (Photo 16) */}
      {roleModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#141A17] rounded-3xl border border-[#B89A5A]/40 p-5 shadow-sacred space-y-4">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#B89A5A]/20 border border-[#B89A5A]/40 flex items-center justify-center font-bold text-sm text-[#B89A5A]">
                  {roleModalMember.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F5EFE3]">
                    {language === 'am' ? 'የስልጣን እና ሚና ድልድል' : 'Role Delegation'}
                  </h4>
                  <p className="text-[11px] text-[#B89A5A]">
                    {roleModalMember.amharicName} ({roleModalMember.name})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoleModalMember(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {roleModalError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-700 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{roleModalError}</span>
              </div>
            )}

            {roleModalSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{roleModalSuccess}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <p className="text-[11px] text-gray-400">
                {language === 'am'
                  ? 'ዋና አስተዳዳሪ እንደመሆንዎ መጠን ለእያንዳንዱ አባል ኃላፊነት መመደብ ይችላሉ፡'
                  : 'As Super Admin, delegate specialized administrative responsibilities:'}
              </p>

              {/* Finance Admin */}
              <label
                onClick={() => handleToggleRole('finance_admin')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedRoles.includes('finance_admin')
                    ? 'bg-[#B89A5A]/15 border-[#B89A5A] shadow-candle-glow'
                    : 'bg-[#0E1210] border-white/10 opacity-75'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes('finance_admin')}
                  onChange={() => {}}
                  className="mt-1 accent-[#B89A5A]"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
                    <DollarSign size={13} className="text-[#B89A5A]" />
                    <span>{language === 'am' ? 'የፋይናንስ አስተዳዳሪ (Finance Admin)' : 'Finance Admin'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {language === 'am'
                      ? 'መዋጮ እና ቅጣት መመዝገብ፣ የወጪ ጥያቄዎችን መገምገም እና የሂሳብ መዝገብ ማስተዳደር'
                      : 'Record member contributions, penalty logs, and expense proposal reviews.'}
                  </p>
                </div>
              </label>

              {/* Attendance Admin */}
              <label
                onClick={() => handleToggleRole('attendance_admin')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedRoles.includes('attendance_admin')
                    ? 'bg-[#B89A5A]/15 border-[#B89A5A] shadow-candle-glow'
                    : 'bg-[#0E1210] border-white/10 opacity-75'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes('attendance_admin')}
                  onChange={() => {}}
                  className="mt-1 accent-[#B89A5A]"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#B89A5A]" />
                    <span>{language === 'am' ? 'የስብሰባ አስተዳዳሪ (Attendance Admin)' : 'Attendance Admin'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {language === 'am'
                      ? 'የቀን 27 ስብሰባ ምልአተ ጉባኤ መመዝገብ፣ መዘግየት/መቅረት ማረጋገጥ እና የተረኛ ቅያሬ'
                      : 'Record live gathering roll call, review absence reasons, manage host swaps.'}
                  </p>
                </div>
              </label>

              {/* Mezmur Admin */}
              <label
                onClick={() => handleToggleRole('mezmur_admin')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedRoles.includes('mezmur_admin')
                    ? 'bg-[#B89A5A]/15 border-[#B89A5A] shadow-candle-glow'
                    : 'bg-[#0E1210] border-white/10 opacity-75'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes('mezmur_admin')}
                  onChange={() => {}}
                  className="mt-1 accent-[#B89A5A]"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[#B89A5A]" />
                    <span>{language === 'am' ? 'የመዝሙር አስተዳዳሪ (Mezmur Admin)' : 'Mezmur Admin'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {language === 'am'
                      ? 'መዝሙራት ማከል፣ ግጥሞችን ማስተካከል እና የጥናት መዝሙር መምረጥ'
                      : 'Upload hymns, curate Ge’ez/Amharic lyrics, select study hymns.'}
                  </p>
                </div>
              </label>

              {/* Management Admin */}
              <label
                onClick={() => handleToggleRole('management_admin')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  selectedRoles.includes('management_admin')
                    ? 'bg-[#B89A5A]/15 border-[#B89A5A] shadow-candle-glow'
                    : 'bg-[#0E1210] border-white/10 opacity-75'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes('management_admin')}
                  onChange={() => {}}
                  className="mt-1 accent-[#B89A5A]"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#B89A5A]" />
                    <span>{language === 'am' ? 'የማስተባበር ኃላፊ (Management Admin)' : 'Management Admin'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {language === 'am'
                      ? 'ማስታወቂያዎችን ማስተዳደር፣ አጠቃላይ የማኅበሩን እንቅስቃሴ መከታተል'
                      : 'General communications, announcements, and agenda oversight.'}
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleModalMember(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#0E1210] border border-gray-700 text-gray-300 text-xs font-semibold"
              >
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                className="flex-1 py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold shadow-sacred transition touch-press"
              >
                {language === 'am' ? 'አስቀምጥ' : 'Save Roles'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED INVITE CODE MODAL */}
      {inviteModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#141A17] rounded-3xl border border-[#B89A5A]/40 p-5 shadow-sacred space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#B89A5A]/20 border border-[#B89A5A]/40 text-[#B89A5A] flex items-center justify-center mx-auto shadow-candle-glow">
              <KeyRound size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F5EFE3]">
                {language === 'am' ? 'የመግቢያ ግብዣ ኮድ' : 'Single-Use Invite Code'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {language === 'am'
                  ? `ለ${inviteModalMember.amharicName} (${inviteModalMember.name}) የተዘጋጀ፡`
                  : `Issued for ${inviteModalMember.name}:`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0E1210] border-2 border-dashed border-[#B89A5A]/50 font-mono text-xl font-bold tracking-widest text-[#B89A5A]">
              {generatedInviteCode}
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              {language === 'am'
                ? 'ይህን ባለአንድ ጊዜ ኮድ ለወንድማችን ያጋሩ። በመግቢያ ገጽ ላይ "የግብዣ ኮድ" በሚለው አማራጭ መለያቸውን አግብረው ቋሚ የይለፍ ቃል ይመዘግባሉ።'
                : 'Share this secure code with the member. They will enter it on the sign-in screen under "Invite Code" to activate and choose their password.'}
            </p>

            {copiedCodeToast && (
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-700 text-xs text-emerald-200">
                ✓ {language === 'am' ? 'ኮዱ ተገልብጧል!' : 'Code copied to clipboard!'}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 py-2.5 rounded-xl bg-[#0E1210] border border-[#B89A5A]/30 hover:border-[#B89A5A] text-[#B89A5A] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Copy size={13} />
                <span>{language === 'am' ? 'ኮዱን ገልብጥ' : 'Copy Code'}</span>
              </button>
              <button
                type="button"
                onClick={() => setInviteModalMember(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition"
              >
                {language === 'am' ? 'ጨርስ' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DETAIL VIEW MODAL */}
      {detailMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#141A17] rounded-3xl border border-[#B89A5A]/30 p-5 shadow-sacred space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={detailMember.avatarUrl}
                  alt={detailMember.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#B89A5A]"
                />
                <div>
                  <h3 className="text-base font-bold text-[#F5EFE3]">
                    {detailMember.amharicName}
                  </h3>
                  <p className="text-xs text-gray-400">{detailMember.name}</p>
                  <p className="text-[11px] text-[#B89A5A] font-serif">
                    {detailMember.baptismalName ? `የክርስትና ስም፡ ${detailMember.baptismalName}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailMember(null)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rounded-2xl p-3 bg-[#0E1210] border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">{language === 'am' ? 'ስልክ ቁጥር' : 'Phone'}:</span>
                <a href={`tel:${detailMember.phone}`} className="text-[#B89A5A] font-mono">
                  {detailMember.phone}
                </a>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">{language === 'am' ? 'የአባልነት ሚና' : 'Role'}:</span>
                <div>{renderRolePill(detailMember)}</div>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">{language === 'am' ? 'የምልአተ ጉባኤ ተሳትፎ' : 'Attendance'}:</span>
                <span className="text-emerald-400 font-semibold">{detailMember.attendanceRate || 100}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">{language === 'am' ? 'የማኅበር ቀን' : 'Covenant Day'}:</span>
                <span className="text-gray-200">27 (የመድኃኔዓለም ቀን)</span>
              </div>
            </div>

            <button
              onClick={() => setDetailMember(null)}
              className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white text-xs font-bold transition"
            >
              {language === 'am' ? 'ዝጋ' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
