import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { mahberService } from '../../services/mahberService';
import { MahberHistoryGathering, GatheringPhoto } from '../../types';
import { EthiopianCross } from '../common/EthiopianCross';
import { EmptyView } from '../common/StateViews';
import {
  Calendar,
  MapPin,
  Music,
  Users,
  Camera,
  BookOpen,
  ChevronRight,
  X,
  Plus,
  Edit3,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface HistoryViewProps {
  history: MahberHistoryGathering[];
  onOpenMezmur?: (mezmurId: string) => void;
  onRefreshHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onOpenMezmur,
  onRefreshHistory,
}) => {
  const { language } = useLanguage();
  const { currentUser, isAdmin } = useAuth();

  const [selectedRecord, setSelectedRecord] = useState<MahberHistoryGathering | null>(null);

  // Admin memory editing state
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [memoryAmInput, setMemoryAmInput] = useState('');
  const [memoryEnInput, setMemoryEnInput] = useState('');

  // Admin photo adding state
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [captionAmInput, setCaptionAmInput] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleSelectRecord = (record: MahberHistoryGathering) => {
    setSelectedRecord(record);
    setIsEditingMemory(false);
    setMemoryAmInput(record.memoryAm || '');
    setMemoryEnInput(record.memory || '');
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    const updated = mahberService.updateGatheringMemory(
      selectedRecord.id,
      memoryAmInput.trim(),
      memoryEnInput.trim()
    );
    const refreshed = updated.find((h) => h.id === selectedRecord.id) || null;
    setSelectedRecord(refreshed);
    setIsEditingMemory(false);
    if (onRefreshHistory) onRefreshHistory();
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError(null);
    if (!selectedRecord) return;

    if (!photoUrlInput.trim()) {
      setPhotoError(language === 'am' ? 'እባክዎን የፎቶ አድራሻ (URL) ያስገቡ።' : 'Please provide an image URL.');
      return;
    }

    const updated = mahberService.addGatheringPhoto(
      selectedRecord.id,
      photoUrlInput.trim(),
      captionAmInput.trim() || undefined,
      undefined,
      currentUser.id
    );

    const refreshed = updated.find((h) => h.id === selectedRecord.id) || null;
    setSelectedRecord(refreshed);
    setShowAddPhotoModal(false);
    setPhotoUrlInput('');
    setCaptionAmInput('');
    if (onRefreshHistory) onRefreshHistory();
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Top Header */}
      <div className="pt-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/30 text-[#B89A5A] text-xs font-serif mb-1">
          <BookOpen size={13} />
          <span>የማኅበሩ ታሪክ (DIGITAL MAHBER BOOK)</span>
        </div>
        <h2 className="text-lg font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
          {language === 'am' ? 'የጉዟችን ማስታወሻ' : 'Our Sacred Journey'}
        </h2>
        <p className="text-xs text-gray-400">
          {language === 'am'
            ? 'የተጠናቀቁ ወርሃዊ ስብሰባዎች እና የተጋሩ ትውስታዎች'
            : 'Completed gatherings, attendance records, and shared memories'}
        </p>
      </div>

      {/* "OUR JOURNEY" Summary Timeline */}
      <div className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/25 shadow-sacred space-y-3">
        <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {language === 'am' ? 'የጉዟችን ቅደም ተከተል' : 'OUR JOURNEY TIMELINE'}
          </span>
          <span className="text-xs text-[#B89A5A] font-serif">
            {history.length} {language === 'am' ? 'ስብሰባዎች' : 'Gatherings'}
          </span>
        </div>

        {/* Elegant Vertical Timeline */}
        <div className="space-y-2 py-1">
          {history.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleSelectRecord(item)}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-[#B89A5A]/20"
            >
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/40 text-[#B89A5A] flex items-center justify-center shrink-0">
                  <EthiopianCross size={13} color="#B89A5A" />
                </div>
                {idx < history.length - 1 && <div className="w-0.5 h-4 bg-[#B89A5A]/20 my-0.5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                    {item.monthNameAm || item.ethDate}
                  </span>
                  <span className="text-xs font-semibold text-[#315C48]">
                    {item.attendingCount} / {item.totalCount} {language === 'am' ? 'ተገኙ' : 'attended'}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-2 truncate">
                  <span>{item.ethDate}</span>
                  <span>•</span>
                  <span>📍 {item.location}</span>
                </div>
              </div>

              <ChevronRight size={14} className="text-gray-500 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* HISTORICAL MEMORY CARDS (Mahber Digital Notebook Style) */}
      <div className="space-y-3.5">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
          {language === 'am' ? 'የማኅበሩ ማስታወሻ መዝገብ' : 'Historical Memory Cards'}
        </div>

        {history.length === 0 ? (
          <EmptyView
            title={language === 'am' ? 'የማኅበሩ ጉዞ እዚህ ይጀምራል።' : 'Your Mahber journey will begin here.'}
            subtitle={
              language === 'am'
                ? 'የመጀመሪያው ማኅበር ሲጠናቀቅ ታሪኩ እዚህ በክብር ይመዘገባል።'
                : 'Completed gatherings will be illuminated in this digital memory book.'
            }
          />
        ) : (
          history.map((record) => (
            <div
              key={record.id}
              onClick={() => handleSelectRecord(record)}
              className="rounded-3xl p-4 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/25 shadow-sacred hover:border-[#B89A5A]/50 transition cursor-pointer space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-[#B89A5A]/15 pb-2.5">
                <div>
                  <div className="text-xs font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
                    {record.ethDate}
                  </div>
                  <div className="text-[10px] text-gray-400">{record.gregDate}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#315C48]/20 border border-[#315C48]/30 text-[#427A60] dark:text-[#529575] text-[11px] font-bold">
                  {record.attendingCount} / {record.totalCount} {language === 'am' ? 'ተገኝተዋል' : 'attended'}
                </span>
              </div>

              {/* Location & Hymn Row */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin size={13} className="text-[#B89A5A] shrink-0" />
                  <span className="truncate">{record.location}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate text-[#B89A5A]">
                  <Music size={13} className="shrink-0" />
                  <span className="truncate">🎵 {record.mezmurAm}</span>
                </div>
              </div>

              {/* Memory Note Quote */}
              {record.memoryAm && (
                <div className="p-3 rounded-2xl bg-[#29251F] border border-white/5 text-xs text-gray-300 italic leading-relaxed">
                  « {record.memoryAm} »
                </div>
              )}

              {/* Photo preview indicator if photos exist */}
              {record.photos && record.photos.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#B89A5A] pt-1">
                  <Camera size={13} />
                  <span>{record.photos.length} {language === 'am' ? 'ትውስታ ፎቶዎች' : 'memory photos'}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <span className="text-[11px] text-[#B89A5A] hover:underline font-semibold flex items-center gap-1">
                  <span>{language === 'am' ? 'ዝርዝር መረጃ ተመልከት' : 'View Gathering Memory'}</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===================== GATHERING DETAIL MODAL ===================== */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#1B1815] rounded-t-3xl sm:rounded-3xl border border-[#B89A5A]/35 p-5 shadow-sacred max-h-[90vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#B89A5A]/15 border border-[#B89A5A]/40 flex items-center justify-center text-[#B89A5A]">
                  <EthiopianCross size={16} color="#B89A5A" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5EFE3]">
                    {selectedRecord.ethDate}
                  </h3>
                  <p className="text-[10px] text-gray-400">{selectedRecord.gregDate}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl bg-black/30 border border-white/10 text-gray-400 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {/* Attendance & Location overview */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-[#201D19] border border-[#315C48]/30">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {language === 'am' ? 'የተገኙ አባላት' : 'Members Present'}
                </div>
                <div className="text-base font-bold text-[#315C48]">
                  {selectedRecord.attendingCount} / {selectedRecord.totalCount}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#201D19] border border-[#B89A5A]/20">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                  {language === 'am' ? 'ቦታ' : 'Location'}
                </div>
                <div className="text-xs font-bold text-[#F5EFE3] truncate">
                  {selectedRecord.location}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {selectedRecord.locationDetails || ''}
                </div>
              </div>
            </div>

            {/* Mezmur Connection */}
            <div className="p-3.5 rounded-2xl bg-[#201D19] border border-[#B89A5A]/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6F2630]/20 border border-[#6F2630]/40 flex items-center justify-center text-[#B89A5A]">
                  <Music size={18} />
                </div>
                <div>
                  <div className="text-[10px] text-[#B89A5A] uppercase font-bold">
                    {language === 'am' ? 'የማኅበሩ መዝሙር' : "Gathering's Mezmur"}
                  </div>
                  <div className="text-xs font-bold text-[#F5EFE3]">
                    {selectedRecord.mezmurAm}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {selectedRecord.mezmurEn}
                  </div>
                </div>
              </div>

              {selectedRecord.mezmurId && onOpenMezmur && (
                <button
                  onClick={() => {
                    onOpenMezmur(selectedRecord.mezmurId!);
                    setSelectedRecord(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#B89A5A] text-black text-xs font-bold hover:bg-[#D3BA7E] transition shadow-sm"
                >
                  {language === 'am' ? 'መዝሙር ክፈት' : 'Open Mezmur'}
                </button>
              )}
            </div>

            {/* MEMBERS PRESENT ROSTER (Strictly no absence reasons exposed!) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>{language === 'am' ? 'በስብሰባው የተገኙ አባላት' : 'Members Present'} ({selectedRecord.attendingCount})</span>
                <span className="text-[10px] text-[#315C48]">🔒 የግል ምክንያቶች ተደብቀዋል</span>
              </div>

              {selectedRecord.presentMembers && selectedRecord.presentMembers.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedRecord.presentMembers.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-2 rounded-xl bg-[#201D19] border border-white/5 flex items-center gap-2"
                    >
                      <img
                        src={mem.avatarUrl}
                        alt={mem.name}
                        className="w-6 h-6 rounded-full object-cover border border-[#B89A5A]/30"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F5EFE3] truncate">
                          {mem.amharicName}
                        </div>
                        <div className="text-[9px] text-gray-400 truncate">{mem.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic p-2 bg-[#201D19] rounded-xl text-center">
                  {selectedRecord.attendingCount} {language === 'am' ? 'አባላት ተገኝተዋል' : 'members attended'}
                </div>
              )}
            </div>

            {/* OFFICIAL MAHBER MEMORY (Admin editable) */}
            <div className="space-y-2 pt-1 border-t border-[#B89A5A]/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#B89A5A]">
                  {language === 'am' ? 'የማኅበሩ ማስታወሻ (Memory)' : 'Official Gathering Memory'}
                </span>
                {isAdmin && !isEditingMemory && (
                  <button
                    onClick={() => setIsEditingMemory(true)}
                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Edit3 size={12} />
                    <span>{language === 'am' ? 'አስተካክል' : 'Edit'}</span>
                  </button>
                )}
              </div>

              {isEditingMemory ? (
                <form onSubmit={handleSaveMemory} className="space-y-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">
                      ማስታወሻ በአማርኛ (Amharic Memory) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={memoryAmInput}
                      onChange={(e) => setMemoryAmInput(e.target.value)}
                      placeholder="የተባረከ ምሽት ነበር..."
                      className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 p-2.5 text-xs text-white focus:outline-none focus:border-[#B89A5A]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">
                      ማስታወሻ በእንግሊዝኛ (Optional English)
                    </label>
                    <textarea
                      rows={2}
                      value={memoryEnInput}
                      onChange={(e) => setMemoryEnInput(e.target.value)}
                      placeholder="Beautiful evening together..."
                      className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 p-2 text-xs text-white focus:outline-none focus:border-[#B89A5A]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingMemory(false)}
                      className="px-3 py-1 rounded-xl text-xs bg-gray-800 text-gray-300"
                    >
                      ሰርዝ (Cancel)
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded-xl text-xs font-bold bg-[#315C48] text-white"
                    >
                      አስቀምጥ (Save)
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 rounded-2xl bg-[#201D19] border border-white/5 space-y-1">
                  <p className="text-xs text-gray-300 leading-relaxed italic whitespace-pre-wrap">
                    « {selectedRecord.memoryAm || selectedRecord.notesAm || 'ምንም ማስታወሻ አልተጻፈም።'} »
                  </p>
                  {selectedRecord.memory && (
                    <p className="text-[11px] text-gray-400 border-t border-white/5 pt-1">
                      "{selectedRecord.memory}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* GATHERING PHOTOS (1 to 5 Photos) */}
            <div className="space-y-2 pt-1 border-t border-[#B89A5A]/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5EFE3] flex items-center gap-1.5">
                  <Camera size={14} className="text-[#B89A5A]" />
                  <span>{language === 'am' ? 'የማኅበሩ ፎቶዎች' : 'Gathering Photos'} ({selectedRecord.photos?.length || 0}/5)</span>
                </span>

                {isAdmin && (selectedRecord.photos?.length || 0) < 5 && (
                  <button
                    onClick={() => setShowAddPhotoModal(true)}
                    className="text-[11px] text-[#B89A5A] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus size={12} />
                    <span>{language === 'am' ? 'ፎቶ ጨምር' : 'Add Photo'}</span>
                  </button>
                )}
              </div>

              {selectedRecord.photos && selectedRecord.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedRecord.photos.map((p) => (
                    <div key={p.id} className="rounded-2xl overflow-hidden border border-[#B89A5A]/25 relative group">
                      <img
                        src={p.url}
                        alt={p.caption || 'Gathering'}
                        className="w-full h-28 object-cover"
                      />
                      {p.captionAm && (
                        <div className="p-1.5 bg-black/80 text-[10px] text-gray-300 truncate">
                          {p.captionAm}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[#201D19] border border-white/5 text-center text-xs text-gray-400">
                  {language === 'am' ? 'ምንም ፎቶ አልተጨመረም።' : 'No photos added for this gathering yet.'}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2.5 rounded-2xl bg-[#201D19] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white"
              >
                ዝጋ (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ADD PHOTO MODAL (ADMIN ONLY) ===================== */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#201D19] rounded-3xl border border-[#B89A5A]/35 p-5 shadow-sacred space-y-3.5">
            <div className="flex justify-between items-center border-b border-[#B89A5A]/15 pb-2">
              <div className="flex items-center gap-2 text-[#B89A5A]">
                <Camera size={16} />
                <h4 className="text-xs font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'የማኅበር ፎቶ መዝግብ' : 'Add Gathering Photo'}
                </h4>
              </div>
              <button
                onClick={() => setShowAddPhotoModal(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {photoError && (
              <div className="p-2 rounded-xl bg-[#6F2630]/20 border border-[#6F2630] text-xs text-[#D98A94]">
                {photoError}
              </div>
            )}

            <form onSubmit={handleAddPhotoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  የፎቶ አድራሻ (Photo URL) *
                </label>
                <input
                  type="url"
                  required
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 px-3 py-2 text-white focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  መግለጫ (Caption in Amharic)
                </label>
                <input
                  type="text"
                  value={captionAmInput}
                  onChange={(e) => setCaptionAmInput(e.target.value)}
                  placeholder="ምሳሌ: በማኅበሩ ጸሎት ወቅት"
                  className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 px-3 py-2 text-white focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-gray-400">
                🔒 ፎቶዎች ለማኅበሩ አባላት ብቻ በግል የተያዙ ናቸው።
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-800 text-gray-400"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#6F2630] text-white font-bold"
                >
                  አስቀምጥ (Upload)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
