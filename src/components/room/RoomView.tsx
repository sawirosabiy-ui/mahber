import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { mahberService } from '../../services/mahberService';
import {
  RoomMessage,
  RoomMessageType,
  Announcement,
  PrayerRequest,
  MessageReplyInfo,
} from '../../types';
import { EthiopianCross } from '../common/EthiopianCross';
import {
  Send,
  Bell,
  Plus,
  Pin,
  Flame,
  CheckCircle2,
  Trash2,
  Edit2,
  CornerUpLeft,
  X,
  Lock,
  Globe,
  Check,
  Heart,
  Sparkles,
} from 'lucide-react';

interface RoomViewProps {
  messages: RoomMessage[];
  onSendMessage: (
    text: string,
    type: RoomMessageType,
    replyTo?: MessageReplyInfo,
    attachmentUrl?: string
  ) => void;
  onToggleReaction: (messageId: string, emoji: '🙏' | '❤️' | '✝️') => void;
  onRefreshMessages?: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({
  messages,
  onSendMessage,
  onToggleReaction,
  onRefreshMessages,
}) => {
  const { t, language } = useLanguage();
  const { currentUser, isAdmin } = useAuth();

  // Navigation tab inside Room: 'chat' | 'announcements' | 'prayers'
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements' | 'prayers'>('chat');

  // Chat message input & replying state
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<RoomMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Announcements & Prayer Requests loaded from service
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    mahberService.getAnnouncements()
  );
  const [prayers, setPrayers] = useState<PrayerRequest[]>(() =>
    mahberService.getPrayerRequests(currentUser.id, isAdmin)
  );

  // Modal states for creating announcements and prayer requests
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [newAnnTitleAm, setNewAnnTitleAm] = useState('');
  const [newAnnTitleEn, setNewAnnTitleEn] = useState('');
  const [newAnnBodyAm, setNewAnnBodyAm] = useState('');
  const [newAnnBodyEn, setNewAnnBodyEn] = useState('');
  const [newAnnPinned, setNewAnnPinned] = useState(false);
  const [newAnnImportant, setNewAnnImportant] = useState(false);

  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerBody, setNewPrayerBody] = useState('');
  const [newPrayerVisibility, setNewPrayerVisibility] = useState<'group' | 'private'>('group');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Mark room as read when user enters room
  useEffect(() => {
    mahberService.markRoomAsRead(currentUser.id);
  }, [currentUser.id]);

  // Refresh data when user changes
  useEffect(() => {
    setPrayers(mahberService.getPrayerRequests(currentUser.id, isAdmin));
    setAnnouncements(mahberService.getAnnouncements());
  }, [currentUser.id, isAdmin]);

  // Real-time synchronization across multiple tabs/windows for concurrent chat
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mahber_messages_v5') {
        onRefreshMessages?.();
      }
    };

    const handleCustomUpdate = () => {
      onRefreshMessages?.();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('mahber_chat_updated', handleCustomUpdate);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('mahber_chat_channel');
      bc.onmessage = () => {
        onRefreshMessages?.();
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mahber_chat_updated', handleCustomUpdate);
      bc?.close();
    };
  }, [onRefreshMessages]);

  // Pinned announcement for chat top banner
  const pinnedAnnouncement = announcements.find((a) => a.isPinned);

  // Send message handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let replyInfo: MessageReplyInfo | undefined;
    if (replyingTo) {
      replyInfo = {
        id: replyingTo.id,
        senderAmharicName: replyingTo.memberAmharicName,
        senderName: replyingTo.memberName,
        text: replyingTo.text,
      };
    }

    onSendMessage(inputText.trim(), 'chat', replyInfo);
    setInputText('');
    setReplyingTo(null);
  };

  // Edit message
  const handleStartEdit = (msg: RoomMessage) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editText.trim()) return;
    const res = mahberService.editMessage(msgId, currentUser.id, editText.trim());
    if (res.success) {
      setEditingMessageId(null);
      setEditText('');
      if (onRefreshMessages) onRefreshMessages();
    } else {
      alert(res.error);
    }
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    const confirmMsg = language === 'am' ? 'መልዕክቱን መሰረዝ ይፈልጋሉ?' : 'Delete this message?';
    if (!window.confirm(confirmMsg)) return;
    const res = mahberService.deleteMessage(msgId, currentUser.id, isAdmin);
    if (res.success) {
      if (onRefreshMessages) onRefreshMessages();
    } else {
      alert(res.error);
    }
  };

  // Prayer actions
  const handleTogglePraying = (prId: string) => {
    const updated = mahberService.togglePrayerSupport(prId, currentUser.id);
    setPrayers(mahberService.getPrayerRequests(currentUser.id, isAdmin));
  };

  const handleMarkAnswered = (prId: string) => {
    const updated = mahberService.markPrayerAnswered(prId, currentUser.id);
    setPrayers(mahberService.getPrayerRequests(currentUser.id, isAdmin));
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerTitle.trim() || !newPrayerBody.trim()) return;

    mahberService.addPrayerRequest(
      currentUser.id,
      currentUser.name,
      currentUser.amharicName,
      currentUser.avatarUrl,
      newPrayerTitle.trim(),
      newPrayerBody.trim(),
      newPrayerVisibility
    );

    setPrayers(mahberService.getPrayerRequests(currentUser.id, isAdmin));
    setShowPrayerModal(false);
    setNewPrayerTitle('');
    setNewPrayerBody('');
    setNewPrayerVisibility('group');
  };

  // Announcement actions
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitleAm.trim() || !newAnnBodyAm.trim()) return;

    mahberService.createAnnouncement(
      currentUser.id,
      currentUser.name,
      currentUser.amharicName,
      newAnnTitleAm.trim(),
      newAnnBodyAm.trim(),
      newAnnTitleEn.trim() || newAnnTitleAm.trim(),
      newAnnBodyEn.trim() || newAnnBodyAm.trim(),
      newAnnPinned,
      newAnnImportant
    );

    setAnnouncements(mahberService.getAnnouncements());
    setShowAnnounceModal(false);
    setNewAnnTitleAm('');
    setNewAnnTitleEn('');
    setNewAnnBodyAm('');
    setNewAnnBodyEn('');
    setNewAnnPinned(false);
    setNewAnnImportant(false);
  };

  const handleDeleteAnnouncement = (annId: string) => {
    if (!isAdmin) return;
    const confirmMsg = language === 'am' ? 'ማስታወቂያውን መሰረዝ ይፈልጋሉ?' : 'Delete this announcement?';
    if (!window.confirm(confirmMsg)) return;
    const updated = mahberService.deleteAnnouncement(annId);
    setAnnouncements(updated);
  };

  return (
    <div className="space-y-3 pb-24 animate-fade-in flex flex-col h-[calc(100vh-130px)]">
      {/* Top Header */}
      <div className="pt-1 text-center shrink-0">
        <h2 className="text-base font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] flex items-center justify-center gap-1.5">
          <EthiopianCross size={16} color="#B89A5A" />
          <span>{t.privateRoomTitle}</span>
        </h2>
        <p className="text-[11px] text-gray-400">
          {language === 'am' ? 'የ 10 አባላት የሰላም እና የወንድማማችነት ክፍል' : 'Sacred fellowship room for ~10 members'}
        </p>
      </div>

      {/* Primary Sub-Tabs: Chat | Announcements | Prayer */}
      <div className="flex p-1 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] rounded-2xl border border-[#B89A5A]/20 shadow-sacred-sm shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition ${
            activeTab === 'chat'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'am' ? 'ውይይት (Chat)' : 'Fellowship Chat'}
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition relative ${
            activeTab === 'announcements'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{language === 'am' ? 'ማስታወቂያ (Notices)' : 'Announcements'}</span>
          {announcements.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-[#B89A5A] text-black font-bold">
              {announcements.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('prayers')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition relative ${
            activeTab === 'prayers'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{language === 'am' ? 'የጸሎት ጥያቄ (Prayer)' : 'Prayer Requests'}</span>
          {prayers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-[#315C48] text-white font-bold">
              {prayers.length}
            </span>
          )}
        </button>
      </div>

      {/* ===================== TAB 1: FELLOWSHIP CHAT ===================== */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Pinned Announcement Banner at Top of Chat */}
          {pinnedAnnouncement && (
            <div
              onClick={() => setActiveTab('announcements')}
              className="mb-2 p-2.5 rounded-2xl bg-[#6F2630]/25 border border-[#8C3542] flex items-center justify-between cursor-pointer hover:bg-[#6F2630]/35 transition shrink-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Pin size={14} className="text-[#B89A5A] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-[#F5EFE3] truncate">
                    {pinnedAnnouncement.titleAm}
                  </div>
                  <div className="text-[10px] text-gray-300 truncate">
                    {pinnedAnnouncement.bodyAm}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-[#B89A5A] shrink-0 font-semibold ml-2">
                {language === 'am' ? 'ክፈት →' : 'View →'}
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {messages.map((msg) => {
              const isOwn = msg.memberId === currentUser.id;
              const isDeleted = Boolean(msg.deletedAt);
              const isEditing = editingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!isOwn && (
                      <img
                        src={msg.memberAvatar}
                        alt={msg.memberName}
                        className="w-5 h-5 rounded-full object-cover border border-[#B89A5A]/30"
                      />
                    )}
                    <span className="text-[11px] font-semibold text-gray-300">
                      {msg.memberAmharicName}
                    </span>
                    {msg.isAdmin && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#B89A5A]/20 text-[#B89A5A] font-semibold">
                        አስተዳዳሪ
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-sacred-sm relative ${
                      isDeleted
                        ? 'bg-black/40 border border-white/5 text-gray-500 italic'
                        : isOwn
                        ? 'bg-[#315C48]/35 border border-[#315C48]/60 text-[#F5EFE3]'
                        : 'bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]'
                    }`}
                  >
                    {/* Reply Quoting Header Snippet (↳ Replying to...) */}
                    {msg.replyTo && !isDeleted && (
                      <div className="mb-2 p-1.5 rounded-lg bg-black/30 border-l-2 border-[#B89A5A] text-[10px] text-gray-400">
                        <div className="font-semibold text-[#B89A5A] flex items-center gap-1">
                          <CornerUpLeft size={10} />
                          <span>{msg.replyTo.senderAmharicName}</span>
                        </div>
                        <div className="truncate text-gray-300">{msg.replyTo.text}</div>
                      </div>
                    )}

                    {/* Inline Editing Form */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          maxLength={2000}
                          rows={2}
                          className="w-full p-2 rounded-xl bg-black/40 border border-[#B89A5A] text-xs text-white focus:outline-none"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-0.5 rounded-lg text-[10px] bg-gray-700 text-gray-300"
                          >
                            ሰርዝ (Cancel)
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-2.5 py-0.5 rounded-lg text-[10px] bg-[#315C48] text-white font-bold"
                          >
                            አስቀምጥ (Save)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        {msg.editedAt && !isDeleted && (
                          <span className="text-[9px] text-gray-400 italic block mt-0.5">
                            (ተስተካክሏል • Edited)
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions & Sacred Reactions Row */}
                  {!isDeleted && (
                    <div className="flex items-center gap-1.5 mt-1 px-1">
                      {/* Sacred Reactions 🙏 ❤️ ✝️ */}
                      {(['🙏', '❤️', '✝️'] as const).map((emoji) => {
                        const reaction = msg.reactions.find((r) => r.emoji === emoji);
                        const count = reaction?.count || 0;
                        const reacted = reaction?.memberIds.includes(currentUser.id);

                        return (
                          <button
                            key={emoji}
                            onClick={() => onToggleReaction(msg.id, emoji)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                              reacted
                                ? 'bg-[#B89A5A]/25 border-[#B89A5A] text-white scale-105 shadow-sm'
                                : 'bg-black/30 border-white/10 text-gray-400 hover:border-[#B89A5A]/30'
                            }`}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span className="text-[10px]">{count}</span>}
                          </button>
                        );
                      })}

                      {/* Reply Button */}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="p-1 rounded-full text-gray-500 hover:text-gray-300 hover:bg-white/5 transition"
                        title="Reply"
                      >
                        <CornerUpLeft size={12} />
                      </button>

                      {/* Edit Button (Own message only) */}
                      {isOwn && !isEditing && (
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="p-1 rounded-full text-gray-500 hover:text-gray-300 hover:bg-white/5 transition"
                          title="Edit"
                        >
                          <Edit2 size={11} />
                        </button>
                      )}

                      {/* Delete Button (Own message or Admin moderation) */}
                      {(isOwn || isAdmin) && !isEditing && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 rounded-full text-gray-500 hover:text-[#D98A94] hover:bg-white/5 transition"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Box */}
          <div className="shrink-0 pt-2 space-y-1.5">
            {/* Replying banner indicator */}
            {replyingTo && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-[#B89A5A]/30 text-xs">
                <div className="flex items-center gap-1.5 text-gray-300 truncate">
                  <CornerUpLeft size={13} className="text-[#B89A5A] shrink-0" />
                  <span className="text-[11px] text-[#B89A5A] font-semibold">
                    {replyingTo.memberAmharicName}፡
                  </span>
                  <span className="text-[11px] truncate text-gray-400">{replyingTo.text}</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-400 hover:text-white p-0.5 ml-2"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={2000}
                placeholder={t.messagePlaceholder}
                className="flex-1 rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/25 px-4 py-2.5 text-xs text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] focus:outline-none focus:border-[#B89A5A]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-11 h-11 rounded-2xl bg-[#6F2630] hover:bg-[#8C3542] disabled:opacity-40 text-white flex items-center justify-center transition shadow-md touch-press shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: ANNOUNCEMENTS ===================== */}
      {activeTab === 'announcements' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* Header Action: Admin Create Announcement */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {announcements.length} {language === 'am' ? 'ማስታወቂያዎች' : 'Announcements'}
            </span>
            {isAdmin && (
              <button
                onClick={() => setShowAnnounceModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#6F2630] text-white text-xs font-semibold hover:bg-[#8C3542] transition flex items-center gap-1 shadow-sm"
              >
                <Plus size={14} />
                <span>{language === 'am' ? 'አዲስ ማስታወቂያ' : 'New Notice'}</span>
              </button>
            )}
          </div>

          {/* Announcements Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {announcements.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Bell size={24} className="mx-auto opacity-30 text-[#B89A5A] mb-2" />
                <p className="text-xs">
                  {language === 'am' ? 'ምንም ማስታወቂያ አልተለጠፈም።' : 'No announcements yet.'}
                </p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-3xl border space-y-2.5 transition relative shadow-sacred-sm ${
                    ann.isPinned
                      ? 'bg-[#29251F] border-[#B89A5A]/50 ring-1 ring-[#B89A5A]/20'
                      : 'bg-[#201D19] border-[#B89A5A]/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ann.isPinned && (
                          <span className="px-2 py-0.5 rounded-full bg-[#B89A5A]/20 text-[#B89A5A] text-[10px] font-bold flex items-center gap-1 border border-[#B89A5A]/30">
                            <Pin size={10} />
                            <span>የተሰካ (Pinned)</span>
                          </span>
                        )}
                        {ann.isImportant && (
                          <span className="px-2 py-0.5 rounded-full bg-[#6F2630]/30 text-[#D98A94] text-[10px] font-bold flex items-center gap-1 border border-[#6F2630]/50">
                            <Flame size={10} />
                            <span>አስፈላጊ (Important)</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#F5EFE3] pt-0.5 leading-snug">
                        {ann.titleAm}
                      </h3>
                      {ann.title && ann.title !== ann.titleAm && (
                        <p className="text-[11px] text-[#B89A5A]">{ann.title}</p>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1 rounded-lg text-gray-500 hover:text-[#D98A94] transition"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {ann.bodyAm}
                  </p>
                  {ann.body && ann.body !== ann.bodyAm && (
                    <p className="text-[11px] text-gray-400 border-t border-white/5 pt-1.5 italic">
                      {ann.body}
                    </p>
                  )}

                  <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1 border-t border-[#B89A5A]/10">
                    <span>
                      {language === 'am' ? 'በአስተዳዳሪ' : 'By'} {ann.authorAmharicName}
                    </span>
                    <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: PRAYER REQUESTS ===================== */}
      {activeTab === 'prayers' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* Header Action: Add Prayer Request */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {prayers.length} {language === 'am' ? 'የጸሎት ጥያቄዎች' : 'Prayer Requests'}
            </span>
            <button
              onClick={() => setShowPrayerModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#315C48] text-white text-xs font-semibold hover:bg-[#427A60] transition flex items-center gap-1 shadow-sm"
            >
              <Plus size={14} />
              <span>{language === 'am' ? 'የጸሎት ጥያቄ አቅርብ' : 'Request Prayer'}</span>
            </button>
          </div>

          {/* Prayer Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {prayers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <EthiopianCross size={24} color="#B89A5A" className="mx-auto opacity-30 mb-2" />
                <p className="text-xs">
                  {language === 'am' ? 'ምንም የጸሎት ጥያቄ የለም።' : 'No prayer requests yet.'}
                </p>
              </div>
            ) : (
              prayers.map((pr) => {
                const isAuthor = pr.userId === currentUser.id;
                const isAnswered = pr.status === 'answered';
                const hasPrayed = localStorage.getItem(`prayer_reacted_${pr.id}_${currentUser.id}`) === 'true';

                return (
                  <div
                    key={pr.id}
                    className={`p-4 rounded-3xl border space-y-3 transition relative shadow-sacred-sm ${
                      isAnswered
                        ? 'bg-[#201D19]/60 border-white/10 opacity-80'
                        : pr.visibility === 'private'
                        ? 'bg-[#29251F] border-[#B89A5A]/50'
                        : 'bg-[#201D19] border-[#B89A5A]/20'
                    }`}
                  >
                    {/* Prayer Card Top */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={pr.userAvatar}
                          alt={pr.userName}
                          className="w-8 h-8 rounded-full object-cover border border-[#B89A5A]/40"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#F5EFE3]">
                              {pr.userAmharicName}
                            </span>
                            {pr.visibility === 'private' && (
                              <span className="px-2 py-0.2 rounded-full bg-[#6F2630]/30 border border-[#6F2630] text-[#D98A94] text-[9px] font-bold flex items-center gap-1">
                                <Lock size={9} />
                                <span>የግል (Private)</span>
                              </span>
                            )}
                            {isAnswered && (
                              <span className="px-2 py-0.2 rounded-full bg-[#315C48]/30 border border-[#315C48] text-[#529575] text-[9px] font-bold flex items-center gap-1">
                                <Check size={9} />
                                <span>ተመልሷል (Answered)</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {new Date(pr.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Author "Mark Answered" Button */}
                      {isAuthor && !isAnswered && (
                        <button
                          onClick={() => handleMarkAnswered(pr.id)}
                          className="text-[10px] px-2 py-1 rounded-xl bg-[#315C48]/20 border border-[#315C48] text-[#529575] font-semibold hover:bg-[#315C48]/40 transition"
                        >
                          ተመልሷል ✓
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 pl-1">
                      <h4 className="text-xs font-bold text-[#B89A5A]">{pr.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {pr.body}
                      </p>
                    </div>

                    {/* Prayer Support Action ("Praying for you") */}
                    <div className="pt-2 border-t border-[#B89A5A]/15 flex items-center justify-between">
                      <button
                        onClick={() => handleTogglePraying(pr.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 touch-press ${
                          hasPrayed
                            ? 'bg-[#B89A5A]/25 border-[#B89A5A] text-white font-bold'
                            : 'bg-black/30 border-white/10 text-gray-400 hover:border-[#B89A5A]/40'
                        }`}
                      >
                        <span>🙏</span>
                        <span>{hasPrayed ? 'ጸልያለሁ (Praying)' : 'እጸልያለሁ (Pray)'}</span>
                        <span className="text-[11px] font-bold text-[#B89A5A] ml-1">
                          {pr.prayerCount}
                        </span>
                      </button>

                      <span className="text-[10px] text-gray-400">
                        {pr.prayerCount} {language === 'am' ? 'አባላት በጸሎት አስበዋቸዋል' : 'prayers'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE ANNOUNCEMENT (ADMIN ONLY) ===================== */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#201D19] rounded-t-3xl sm:rounded-2xl border border-[#B89A5A]/30 p-5 shadow-sacred space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
              <div className="flex items-center gap-2 text-[#D98A94]">
                <Bell size={18} />
                <h3 className="text-sm font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'አዲስ የማኅበር ማስታወቂያ' : 'Publish Announcement'}
                </h3>
              </div>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">
                  ርዕስ በአማርኛ (Title in Amharic) *
                </label>
                <input
                  type="text"
                  required
                  value={newAnnTitleAm}
                  onChange={(e) => setNewAnnTitleAm(e.target.value)}
                  placeholder="ምሳሌ፡ የወርሃዊ ማኅበር ዝግጅት"
                  className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 px-3 py-2 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">
                  ርዕስ በእንግሊዝኛ (Title in English - Optional)
                </label>
                <input
                  type="text"
                  value={newAnnTitleEn}
                  onChange={(e) => setNewAnnTitleEn(e.target.value)}
                  placeholder="e.g. Monthly Gathering Preparation"
                  className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 px-3 py-2 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">
                  ዝርዝር ማስታወቂያ (Announcement Body in Amharic) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newAnnBodyAm}
                  onChange={(e) => setNewAnnBodyAm(e.target.value)}
                  placeholder="የማስታወቂያውን ዝርዝር መልዕክት እዚህ ይጻፉ..."
                  className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 p-3 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              {/* Pin & Important Flags */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label
                  onClick={() => setNewAnnPinned(!newAnnPinned)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs ${
                    newAnnPinned
                      ? 'bg-[#B89A5A]/20 border-[#B89A5A] text-[#B89A5A]'
                      : 'bg-black/30 border-white/5 text-gray-400'
                  }`}
                >
                  <Pin size={14} />
                  <span>ይሰካ (Pin)</span>
                </label>

                <label
                  onClick={() => setNewAnnImportant(!newAnnImportant)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs ${
                    newAnnImportant
                      ? 'bg-[#6F2630]/30 border-[#6F2630] text-[#D98A94]'
                      : 'bg-black/30 border-white/5 text-gray-400'
                  }`}
                >
                  <Flame size={14} />
                  <span>አስፈላጊ (Important)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 text-xs text-gray-300"
                >
                  ይቅር (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6F2630] text-xs font-bold text-white hover:bg-[#8C3542] transition shadow-md"
                >
                  ለጥፍ (Publish)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE PRAYER REQUEST ===================== */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#201D19] rounded-t-3xl sm:rounded-2xl border border-[#B89A5A]/30 p-5 shadow-sacred space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/20 pb-3">
              <div className="flex items-center gap-2 text-[#B89A5A]">
                <EthiopianCross size={18} color="#B89A5A" />
                <h3 className="text-sm font-bold text-[#F5EFE3]">
                  {language === 'am' ? 'አዲስ የጸሎት ጥያቄ' : 'New Prayer Request'}
                </h3>
              </div>
              <button
                onClick={() => setShowPrayerModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">
                  የጸሎቱ ርዕስ (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={newPrayerTitle}
                  onChange={(e) => setNewPrayerTitle(e.target.value)}
                  placeholder="ምሳሌ፡ ለቤተሰቤ ጤንነት"
                  className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 px-3 py-2 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">
                  ዝርዝር የጸሎት ሃሳብ (Prayer Details) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newPrayerBody}
                  onChange={(e) => setNewPrayerBody(e.target.value)}
                  placeholder="ወንድሞች እና እህቶች በጸሎት እንዲያስቡልዎት የሚፈልጉትን ሃሳብ እዚህ ያጋሩ..."
                  className="w-full rounded-xl bg-black/40 border border-[#B89A5A]/30 p-3 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                />
              </div>

              {/* Visibility Choice: Group vs Private (author + 2 admins) */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] text-gray-400 block">የግላዊነት ደረጃ (Visibility):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPrayerVisibility('group')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      newPrayerVisibility === 'group'
                        ? 'bg-[#315C48]/30 border-[#315C48] text-white font-semibold'
                        : 'bg-black/30 border-white/5 text-gray-400'
                    }`}
                  >
                    <Globe size={14} className="text-[#315C48]" />
                    <div className="text-[11px]">
                      <div>ለሁሉም (Group)</div>
                      <div className="text-[9px] text-gray-400">10 አባላት ያዩታል</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPrayerVisibility('private')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      newPrayerVisibility === 'private'
                        ? 'bg-[#6F2630]/30 border-[#6F2630] text-white font-semibold'
                        : 'bg-black/30 border-white/5 text-gray-400'
                    }`}
                  >
                    <Lock size={14} className="text-[#D98A94]" />
                    <div className="text-[11px]">
                      <div>ሚስጥራዊ (Private)</div>
                      <div className="text-[9px] text-[#D98A94]">ለ 2 አስተዳዳሪዎች ብቻ</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrayerModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 text-xs text-gray-300"
                >
                  ይቅር (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#315C48] text-xs font-bold text-white hover:bg-[#427A60] transition shadow-md"
                >
                  ላክ (Submit Request)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
