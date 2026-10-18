import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Member, PaintingRotationState, HostingSwapRecord } from '../../types';
import { mahberService } from '../../services/mahberService';
import {
  RotateCcw,
  ArrowRightLeft,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  History,
  AlertCircle,
} from 'lucide-react';

interface HostingRotationViewProps {
  allMembers: Member[];
  gatheringId?: string;
  onRotationUpdated?: () => void;
}

export const HostingRotationView: React.FC<HostingRotationViewProps> = ({
  allMembers,
  gatheringId = 'g-2018-01',
  onRotationUpdated,
}) => {
  const { language } = useLanguage();
  const { currentUser, isAdmin } = useAuth();

  const [rotationState, setRotationState] = useState<PaintingRotationState>(() =>
    mahberService.getPaintingRotation()
  );
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'full_rotation' | 'history'>('current');
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<string>('');
  const [swapReason, setSwapReason] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const refreshRotation = () => {
    const updated = mahberService.getPaintingRotation();
    setRotationState(updated);
    onRotationUpdated?.();
  };

  const currentHost =
    allMembers.find((m) => m.id === rotationState.scheduledHostId) ||
    allMembers.find((m) => m.id === rotationState.currentHolderId) ||
    allMembers[0];

  const rotationSequence = (rotationState.rotationOrder || []).map((id, index) => {
    const member = allMembers.find((m) => m.id === id) || allMembers[index] || allMembers[0];
    const months = [
      { am: 'መስከረም', en: 'Meskerem (Oct 2025)' },
      { am: 'ጥቅምት', en: 'Tikimt (Nov 2025)' },
      { am: 'ኅዳር', en: 'Hidar (Dec 2025)' },
      { am: 'ታኅሣሥ', en: 'Tahsas (Jan 2026)' },
      { am: 'ጥር', en: 'Tir (Feb 2026)' },
      { am: 'የካቲት', en: 'Yekatit (Mar 2026)' },
      { am: 'መጋቢት', en: 'Megabit (Apr 2026)' },
      { am: 'ሚያዝያ', en: 'Miyazya (May 2026)' },
      { am: 'ግንቦት', en: 'Ginbot (Jun 2026)' },
      { am: 'ሰኔ', en: 'Sene (Jul 2026)' },
      { am: 'ሐምሌ', en: 'Hamle (Aug 2026)' },
    ];
    return {
      order: index + 1,
      member,
      month: months[index % months.length],
      isCurrent: member.id === currentHost.id,
    };
  });

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubstituteId) return;

    mahberService.recordHostingSwap(
      gatheringId,
      currentHost.id,
      selectedSubstituteId,
      swapReason || 'Personal / Family schedule adjustment',
      currentUser?.name || 'Administrator'
    );

    refreshRotation();
    setIsSwapModalOpen(false);
    setSelectedSubstituteId('');
    setSwapReason('');
    setFeedbackMessage(
      language === 'am'
        ? 'የአስተናጋጅ ቅያሪ ጥያቄ በተሳካ ሁኔታ ተመዝግቧል!'
        : 'Host swap request successfully recorded and approved!'
    );
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs matching Mockup Photo 6 */}
      <div className="flex bg-[#141A17] p-1 rounded-xl border border-[#B89A5A]/20">
        <button
          type="button"
          onClick={() => setActiveSubTab('current')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeSubTab === 'current'
              ? 'bg-[#B89A5A] text-[#0E1210] font-bold shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የአሁኑ አስተናጋጅ' : 'Current Host'}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('full_rotation')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeSubTab === 'full_rotation'
              ? 'bg-[#B89A5A] text-[#0E1210] font-bold shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'ሙሉ ተራ (11 አባላት)' : 'Full Rotation (11)'}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeSubTab === 'history'
              ? 'bg-[#B89A5A] text-[#0E1210] font-bold shadow'
              : 'text-[#9E9484] hover:text-[#F5EFE3]'
          }`}
        >
          {language === 'am' ? 'የቅያሪ ታሪክ' : 'Swap History'}
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* View 1: Current Host View matching Photo 6 Screen 1 */}
      {activeSubTab === 'current' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#1B2420] to-[#141A17] rounded-2xl p-5 border border-[#B89A5A]/40 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B89A5A]">
                {language === 'am' ? 'የዚህ ወር አስተናጋጅ' : 'Current Month Host'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#B89A5A]/20 text-[#B89A5A] text-[10px] font-bold border border-[#B89A5A]/30">
                {language === 'am' ? 'ይህ ወር' : 'This Month'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={currentHost.avatarUrl}
                alt={currentHost.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#B89A5A]/60 shadow-md"
              />
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#F5EFE3] leading-tight">
                  {currentHost.name}
                </h3>
                <p className="text-xs text-[#9E9484]">{currentHost.amharicName}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#B89A5A]">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Meskerem 27, 2018 (Oct 6, 2025)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    CMC, Addis Ababa
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#B89A5A]/15 flex gap-2">
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(true)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity shadow-md"
              >
                <ArrowRightLeft size={14} />
                {language === 'am' ? 'የአስተናጋጅ ቅያሪ ጠይቅ' : 'Request Host Swap'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('full_rotation')}
                className="px-4 py-2 rounded-xl bg-[#1B2420] text-[#F5EFE3] text-xs font-medium border border-[#B89A5A]/20 hover:border-[#B89A5A]/40 transition-colors"
              >
                {language === 'am' ? 'ሙሉ ተራ እይ →' : 'View Full Rotation →'}
              </button>
            </div>
          </div>

          {/* Next Hosts Preview */}
          <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20">
            <h4 className="text-xs font-bold text-[#B89A5A] uppercase tracking-wider mb-3">
              {language === 'am' ? 'ቀጣይ አስተናጋጆች' : 'Next Upcoming Hosts'}
            </h4>
            <div className="space-y-2">
              {rotationSequence.slice(1, 4).map((item) => (
                <div
                  key={item.order}
                  className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#0E1210] text-[#B89A5A] text-xs font-bold flex items-center justify-center">
                      {item.order}
                    </span>
                    <img
                      src={item.member.avatarUrl}
                      alt={item.member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#F5EFE3]">{item.member.name}</p>
                      <p className="text-[10px] text-[#9E9484]">
                        {language === 'am' ? item.month.am : item.month.en}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#B89A5A]">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: Full Rotation Table (11 members) matching Photo 6 Screen 2 */}
      {activeSubTab === 'full_rotation' && (
        <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20 space-y-3">
          <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
            <div>
              <h4 className="text-xs font-bold text-[#F5EFE3] uppercase">
                {language === 'am' ? 'የማኅበር ቋሚ አስተናጋጅ ተራ' : 'Fixed Hosting Sequence (11 Members)'}
              </h4>
              <p className="text-[10px] text-[#9E9484]">
                {language === 'am'
                  ? 'የአስተናጋጅ ቅያሪ ቢደረግም ዋናው ተራ ተጠብቆ ይቆያል።'
                  : 'Rotation preserves original order even when a swap is granted.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSwapModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#B89A5A]/20 text-[#B89A5A] text-[11px] font-bold border border-[#B89A5A]/30 flex items-center gap-1"
            >
              <ArrowRightLeft size={12} />
              {language === 'am' ? 'ቅያሪ' : 'Swap'}
            </button>
          </div>

          <div className="space-y-2">
            {rotationSequence.map((item) => (
              <div
                key={item.order}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  item.isCurrent
                    ? 'bg-[#1B2420] border-[#B89A5A] shadow'
                    : 'bg-[#1B2420]/50 border-[#B89A5A]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                      item.isCurrent
                        ? 'bg-[#B89A5A] text-[#0E1210]'
                        : 'bg-[#141A17] text-[#9E9484]'
                    }`}
                  >
                    {item.order}
                  </span>
                  <img
                    src={item.member.avatarUrl}
                    alt={item.member.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-[#B89A5A]/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#F5EFE3]">{item.member.name}</p>
                      {item.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#B89A5A] text-[#0E1210] text-[9px] font-black uppercase">
                          {language === 'am' ? 'አሁን' : 'Current'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9E9484]">
                      {language === 'am' ? item.month.am : item.month.en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Rotation Swap History matching Photo 6 Screen 5 */}
      {activeSubTab === 'history' && (
        <div className="bg-[#141A17] rounded-2xl p-4 border border-[#B89A5A]/20 space-y-3">
          <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
            <h4 className="text-xs font-bold text-[#B89A5A] uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} />
              {language === 'am' ? 'የተመዘገቡ ቅያሪዎች' : 'Recorded Swap History'}
            </h4>
            <span className="text-[10px] text-[#9E9484]">
              {rotationState.swaps?.length || 0} {language === 'am' ? 'ቅያሪዎች' : 'records'}
            </span>
          </div>

          {(!rotationState.swaps || rotationState.swaps.length === 0) ? (
            <div className="py-8 text-center text-xs text-[#9E9484]">
              {language === 'am'
                ? 'እስካሁን የተደረገ የአስተናጋጅ ቅያሪ የለም።'
                : 'No host swaps have been recorded yet.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {rotationState.swaps.map((swap) => {
                const orig = allMembers.find((m) => m.id === swap.originalHostId);
                const sub = allMembers.find((m) => m.id === swap.substituteHostId);
                return (
                  <div
                    key={swap.id}
                    className="p-3 rounded-xl bg-[#1B2420] border border-[#B89A5A]/15 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {language === 'am' ? 'ቅያሪ ጸድቋል' : 'Host Swap Approved'}
                      </span>
                      <span className="text-[10px] text-[#9E9484]">
                        {new Date(swap.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-[#F5EFE3]">
                      <span>{orig?.name || 'Original Host'}</span>
                      <ArrowRightLeft size={12} className="text-[#B89A5A]" />
                      <span>{sub?.name || 'Substitute Host'}</span>
                    </div>

                    <p className="text-[11px] text-[#9E9484] italic bg-[#141A17] p-2 rounded-lg">
                      "{swap.reason}"
                    </p>

                    <div className="text-[10px] text-[#B89A5A] flex items-center gap-1">
                      <ShieldCheck size={12} />
                      <span>
                        {language === 'am' ? 'ያጸደቀው አስተዳዳሪ:' : 'Approved by:'} {swap.approvedBy}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Host Swap Request Modal matching Photo 6 Screen 3 */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141A17] border border-[#B89A5A]/40 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
              <h3 className="text-sm font-bold text-[#F5EFE3] flex items-center gap-2">
                <ArrowRightLeft size={16} className="text-[#B89A5A]" />
                {language === 'am' ? 'የአስተናጋጅ ቅያሪ መጠየቂያ' : 'Request Host Swap'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="p-1 rounded-lg text-[#9E9484] hover:text-[#F5EFE3]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="space-y-4">
              {/* Current Host Display */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  {language === 'am' ? 'የአሁኑ አስተናጋጅ' : 'Current Host'}
                </label>
                <div className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/20 flex items-center gap-3">
                  <img
                    src={currentHost.avatarUrl}
                    alt={currentHost.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#F5EFE3]">{currentHost.name}</p>
                    <p className="text-[10px] text-[#B89A5A]">Meskerem 27, 2018 (Oct 6, 2025)</p>
                  </div>
                </div>
              </div>

              {/* Substitute Member Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  {language === 'am' ? 'የሚቀያየርበት አባል' : 'Request Swap With'}
                </label>
                <select
                  required
                  value={selectedSubstituteId}
                  onChange={(e) => setSelectedSubstituteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                >
                  <option value="">
                    {language === 'am' ? '-- አባል ይምረጡ --' : '-- Select Member --'}
                  </option>
                  {allMembers
                    .filter((m) => m.id !== currentHost.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.amharicName})
                      </option>
                    ))}
                </select>
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9E9484] block mb-1">
                  {language === 'am' ? 'የቅያሪው ምክንያት (አስገዳጅ)' : 'Reason for Swap (Required)'}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    language === 'am'
                      ? 'ምክንያትዎን እዚህ ይጻፉ (ለምሳሌ፦ የቤተሰብ ጉዞ፣ የሥራ ጉዳይ...)'
                      : 'e.g. Family event, travel, unexpected commitment...'
                  }
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1B2420] border border-[#B89A5A]/30 text-xs text-[#F5EFE3] placeholder-[#9E9484]/50 focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              {/* Immutable Rotation Notice matching Photo 6 Screen 3 */}
              <div className="p-2.5 rounded-xl bg-[#1B2420] border border-[#B89A5A]/20 flex items-start gap-2 text-[11px] text-[#9E9484]">
                <AlertCircle size={14} className="text-[#B89A5A] shrink-0 mt-0.5" />
                <span>
                  {language === 'am'
                    ? 'ዋናው የማኅበር አስተናጋጅ ተራ አይለወጥም። ይህ ቅያሪ በታሪክ ተመዝግቦ በአስተዳዳሪ ይጸድቃል።'
                    : 'The original 11-member rotation will remain unchanged. This swap will be recorded in the audit trail.'}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#1B2420] text-[#9E9484] text-xs font-semibold hover:text-[#F5EFE3]"
                >
                  {language === 'am' ? 'ይቅር' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#B89A5A] to-[#C9AB6B] text-[#0E1210] text-xs font-bold hover:opacity-95 shadow-md"
                >
                  {language === 'am' ? 'ጥያቄውን መዝግብ' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
