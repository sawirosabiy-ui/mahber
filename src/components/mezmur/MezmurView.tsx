import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Mezmur, MezmurCategoryKey } from '../../types';
import { mahberService } from '../../services/mahberService';
import {
  Music,
  Search,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  Plus,
  Send,
  AlertCircle,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';

interface MezmurViewProps {
  mezmurs: Mezmur[];
  onSetCurrentStudy?: (mezmurId: string) => void;
  onRefreshMezmurs?: () => void;
}

export const MezmurView: React.FC<MezmurViewProps> = ({
  mezmurs,
  onSetCurrentStudy,
  onRefreshMezmurs,
}) => {
  const { t, language } = useLanguage();
  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'current' | 'library' | 'favorites'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Active selected mezmur for playback / study / lyrics
  const currentStudy = mezmurs.find((m) => m.status === 'current_study') || mezmurs[0];
  const [selectedMezmur, setSelectedMezmur] = useState<Mezmur>(currentStudy);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const totalDurationSec = 222; // 3:42

  // Study & Practice states
  const [favorites, setFavorites] = useState<string[]>(() =>
    mahberService.getFavorites(currentUser.id)
  );
  const [practiceSuccessToast, setPracticeSuccessToast] = useState<string | null>(null);
  const [practiceErrorToast, setPracticeErrorToast] = useState<string | null>(null);
  const [practiceNote, setPracticeNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestionTitleAm, setSuggestionTitleAm] = useState('');
  const [suggestionTitleEn, setSuggestionTitleEn] = useState('');
  const [suggestionNote, setSuggestionNote] = useState('');
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [showStartStudyConfirm, setShowStartStudyConfirm] = useState(false);

  // Audio simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const userStudy = selectedMezmur ? mahberService.getUserStudy(currentUser.id, selectedMezmur.id) : null;
  const studyStatus = selectedMezmur ? mahberService.calculateUserStudyStatus(currentUser.id, selectedMezmur.id) : 'not_started';
  const hasPracticedToday = selectedMezmur && userStudy
    ? mahberService.hasPracticedToday(currentUser.id, userStudy.id)
    : false;
  const userPractices = selectedMezmur && userStudy
    ? mahberService.getUserPractices(currentUser.id, userStudy.id)
    : [];

  const handleToggleFavorite = (mezmurId: string) => {
    const updated = mahberService.toggleFavorite(currentUser.id, mezmurId);
    setFavorites([...updated]);
  };

  const handleStartStudy = () => {
    if (!selectedMezmur) return;
    mahberService.startStudy(currentUser.id, selectedMezmur.id);
    setShowStartStudyConfirm(false);
    if (onRefreshMezmurs) onRefreshMezmurs();
  };

  const handleMarkPracticed = () => {
    if (!selectedMezmur) return;
    let study = userStudy;
    if (!study) {
      study = mahberService.startStudy(currentUser.id, selectedMezmur.id);
    }

    const res = mahberService.recordPractice(
      currentUser.id,
      study.id,
      practiceNote.trim() ? practiceNote.trim() : undefined,
      15
    );

    if (res.success) {
      setPracticeSuccessToast(
        language === 'am' ? '✓ የዛሬ ልምምድዎ በክብር ተመዝግቧል።' : '✓ Practice recorded successfully.'
      );
      setPracticeErrorToast(null);
      setPracticeNote('');
      setShowNoteInput(false);
      setTimeout(() => setPracticeSuccessToast(null), 4000);
      if (onRefreshMezmurs) onRefreshMezmurs();
    } else {
      setPracticeErrorToast(res.error || 'Check-in error');
      setTimeout(() => setPracticeErrorToast(null), 4000);
    }
  };

  const handleCompleteStudy = () => {
    if (!userStudy) return;
    mahberService.completeStudy(userStudy.id, currentUser.id);
    setPracticeSuccessToast(
      language === 'am' ? '✓ ይህን መዝሙር አጠናቅቀዋል። በረከቱ ይደርብን።' : '✓ Marked as completed.'
    );
    setTimeout(() => setPracticeSuccessToast(null), 4000);
    if (onRefreshMezmurs) onRefreshMezmurs();
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionTitleAm.trim()) return;

    mahberService.submitSuggestion(
      currentUser.id,
      currentUser.name,
      currentUser.amharicName,
      suggestionTitleAm.trim(),
      suggestionTitleEn.trim() || undefined,
      suggestionNote.trim() || undefined
    );

    setSuggestSuccess(true);
    setTimeout(() => {
      setSuggestSuccess(false);
      setShowSuggestModal(false);
      setSuggestionTitleAm('');
      setSuggestionTitleEn('');
      setSuggestionNote('');
    }, 2000);
  };

  // Categories list
  const categories: { key: string; labelAm: string; labelEn: string }[] = [
    { key: 'all', labelAm: 'ሁሉም', labelEn: 'All' },
    { key: 'marian', labelAm: 'ማርያም', labelEn: 'Marian' },
    { key: 'christ', labelAm: 'መድኃኔዓለም', labelEn: 'Christ' },
    { key: 'praise', labelAm: 'ምስጋና', labelEn: 'Praise' },
    { key: 'repentance', labelAm: 'ንስሐ', labelEn: 'Repentance' },
    { key: 'saints', labelAm: 'ቅዱሳን', labelEn: 'Saints' },
    { key: 'traditional', labelAm: 'ባሕላዊ/ግዕዝ', labelEn: 'Traditional' },
  ];

  // Filtering
  const filteredMezmurs = mezmurs.filter((m) => {
    if (m.isArchived) return false;
    const matchesSearch =
      m.titleAm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.lyricsAm && m.lyricsAm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.categoryAm.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'favorites') {
      return favorites.includes(m.id);
    }

    if (selectedCategory !== 'all') {
      return m.category === selectedCategory || m.categoryAm.includes(selectedCategory);
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="pt-2 text-center">
        <h2 className="text-xl font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E]">
          {language === 'am' ? 'የመዝሙር ማከማቻ እና ጥናት' : 'Mezmur Library & Study'}
        </h2>
        <p className="text-xs text-gray-400">
          {language === 'am' ? '«ለእግዚአብሔር አዲስ ምስጋና ዘምሩ» (መዝ 33:3)' : '"Sing to the Lord a new song" (Ps 33:3)'}
        </p>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-[#201D19] border border-[#B89A5A]/20">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'current'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'am' ? 'የአሁኑ መዝሙር (Study)' : 'Current Study'}
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'library'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {language === 'am' ? 'ማከማቻ (Library)' : 'All Hymns'}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
            activeTab === 'favorites'
              ? 'bg-[#6F2630] text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart size={12} className={favorites.length > 0 ? 'text-[#D98A94] fill-current' : ''} />
          <span>{language === 'am' ? 'የእኔ ምርጥ' : 'Favorites'}</span>
        </button>
      </div>

      {/* Feedback Toasts */}
      {practiceSuccessToast && (
        <div className="p-3 rounded-2xl bg-[#315C48]/30 border border-[#315C48] text-xs text-[#E5DCD0] flex items-center gap-2 animate-fade-in shadow-md">
          <Check size={16} className="text-[#315C48] shrink-0" />
          <span>{practiceSuccessToast}</span>
        </div>
      )}

      {practiceErrorToast && (
        <div className="p-3 rounded-2xl bg-[#6F2630]/30 border border-[#6F2630] text-xs text-[#E5DCD0] flex items-center gap-2 animate-fade-in shadow-md">
          <AlertCircle size={16} className="text-[#D98A94] shrink-0" />
          <span>{practiceErrorToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CURRENT STUDY / DETAIL VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'current' && selectedMezmur && (
        <div className="space-y-4">
          {/* Main Study Card */}
          <div className="rounded-3xl p-5 bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/30 shadow-sacred space-y-4">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#6F2630]/20 text-[#B89A5A] text-[10px] font-semibold border border-[#6F2630]/40">
                  {selectedMezmur.status === 'current_study'
                    ? (language === 'am' ? 'የዚህ ማኅበር መዝሙር' : "This Mahber's Mezmur")
                    : selectedMezmur.categoryAm}
                </span>
                <span className="text-xs text-gray-400">{selectedMezmur.duration}</span>
              </div>
              <button
                onClick={() => handleToggleFavorite(selectedMezmur.id)}
                className="p-1.5 rounded-full hover:bg-white/5 transition"
                title="Favorite"
              >
                <Heart
                  size={16}
                  className={
                    favorites.includes(selectedMezmur.id)
                      ? 'text-[#D98A94] fill-current'
                      : 'text-gray-400'
                  }
                />
              </button>
            </div>

            {/* Title & Metadata */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6F2630]/40 to-[#29251F] border border-[#B89A5A]/30 flex items-center justify-center text-[#B89A5A] shadow-inner shrink-0">
                <Music size={26} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] truncate">
                  {selectedMezmur.titleAm}
                </h3>
                <p className="text-xs text-[#B89A5A] font-medium">{selectedMezmur.titleEn}</p>
                <p className="text-[11px] text-gray-400">
                  {selectedMezmur.categoryAm} • {selectedMezmur.voicesCount} {t.voicesCount}
                </p>
              </div>
            </div>

            {/* Audio Player Controls */}
            <div className="space-y-2 pt-1 bg-[#191614] rounded-2xl p-3 border border-white/5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{formatTime(currentTimeSec)}</span>
                <span className="text-[#B89A5A]">{selectedMezmur.duration}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 cursor-pointer relative overflow-hidden">
                <div
                  className="bg-[#B89A5A] h-full rounded-full transition-all"
                  style={{ width: `${(currentTimeSec / totalDurationSec) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-6 pt-1">
                <button
                  onClick={() => setCurrentTimeSec(0)}
                  className="p-2 rounded-full text-gray-400 hover:text-white transition"
                  title="Restart"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-[#6F2630] hover:bg-[#8C3542] text-white flex items-center justify-center shadow-candle-glow transition touch-press"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>
              </div>
            </div>

            {/* STUDY ACTION SECTION */}
            <div className="p-3.5 rounded-2xl bg-[#29251F]/70 border border-[#B89A5A]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#F5EFE3]">
                    {language === 'am' ? 'የእኔ ጥናት (My Study)' : 'My Study Plan'}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {studyStatus === 'active'
                      ? '🟢 በንቃት ጥናት ላይ (Active Study)'
                      : studyStatus === 'started'
                      ? '🟡 ተጀምሯል (Started)'
                      : studyStatus === 'completed'
                      ? '✓ ተጠናቋል (Completed)'
                      : '⚪ አልተጀመረም (Not Started)'}
                  </div>
                </div>

                {studyStatus === 'active' && hasPracticedToday && (
                  <span className="px-2.5 py-1 rounded-full bg-[#315C48]/30 border border-[#315C48] text-white text-[11px] font-semibold flex items-center gap-1">
                    <Check size={12} />
                    <span>{language === 'am' ? 'ዛሬ ተለማምደዋል' : 'Practiced Today'}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {studyStatus === 'not_started' ? (
                <button
                  onClick={() => setShowStartStudyConfirm(true)}
                  className="w-full py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-white font-bold text-xs shadow transition touch-press"
                >
                  {language === 'am' ? '+ ማጥናት ጀምር (Start Study)' : '+ Start Study'}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkPracticed}
                      disabled={hasPracticedToday}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        hasPracticedToday
                          ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-white/5'
                          : 'bg-[#315C48] hover:bg-[#427A60] text-white shadow touch-press'
                      }`}
                    >
                      <CheckCircle2 size={15} />
                      <span>{language === 'am' ? '✓ ዛሬ ተለማምጃለሁ' : '✓ I Practiced Today'}</span>
                    </button>

                    <button
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className="px-3 py-2.5 rounded-xl bg-[#201D19] border border-[#B89A5A]/30 text-[#B89A5A] text-xs font-semibold hover:bg-white/5"
                      title="Private Note"
                    >
                      {language === 'am' ? 'የግል ማስታወሻ' : 'Note'}
                    </button>
                  </div>

                  {showNoteInput && (
                    <div className="pt-2 space-y-1.5 animate-fade-in">
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Info size={11} className="text-[#B89A5A]" />
                        <span>{language === 'am' ? 'ይህ ማስታወሻ ለርስዎ ብቻ የሚታይ ነው (ምስጢራዊ)' : 'Private note (only visible to you)'}</span>
                      </div>
                      <input
                        type="text"
                        value={practiceNote}
                        onChange={(e) => setPracticeNote(e.target.value)}
                        placeholder={language === 'am' ? 'ለምሳሌ፡ የመጀመሪያውን ምዕራፍ ተለማመድኩ...' : 'e.g., Practiced verse 1...'}
                        className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                      />
                    </div>
                  )}

                  {studyStatus !== 'completed' && (
                    <button
                      onClick={handleCompleteStudy}
                      className="w-full text-center text-[11px] text-gray-400 hover:text-white pt-1"
                    >
                      {language === 'am' ? 'ጥናቱን አጠናቅቄያለሁ (Mark Finished)' : 'Mark Study Finished'}
                    </button>
                  )}
                </div>
              )}

              {/* Dignified Practice History (No streaks, no shaming) */}
              {userPractices.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <div className="text-[11px] font-semibold text-gray-400">
                    {language === 'am' ? 'የቅርብ ልምምድ ቀናት (Practice History):' : 'Recent Practice Records:'}
                  </div>
                  <div className="space-y-1 text-xs">
                    {userPractices.slice(0, 3).map((prac) => (
                      <div
                        key={prac.id}
                        className="flex items-center justify-between py-1 px-2 rounded-lg bg-[#151311]/50 border border-white/5 text-[11px]"
                      >
                        <span className="text-gray-300">✓ {prac.practiceDate}</span>
                        {prac.note ? (
                          <span className="text-gray-400 truncate max-w-[150px] italic">
                            "{prac.note}"
                          </span>
                        ) : (
                          <span className="text-[#315C48] font-medium">ተለማምዷል</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FULL LYRICS SECTION (Comfortable Reading Experience) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2">
                <h4 className="text-sm font-bold text-[#F5EFE3] flex items-center gap-1.5">
                  <BookOpen size={16} className="text-[#B89A5A]" />
                  <span>{language === 'am' ? 'የመዝሙር ግጥም (Lyrics)' : 'Hymn Lyrics'}</span>
                </h4>
                <span className="text-[11px] text-gray-400">
                  {selectedMezmur.stanzas.length} {language === 'am' ? 'ምዕራፎች' : 'Stanzas'}
                </span>
              </div>

              {selectedMezmur.lyricsAm ? (
                <div className="p-4 rounded-2xl bg-[#191614] border border-[#B89A5A]/15">
                  <p className="text-sm text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] leading-loose whitespace-pre-line font-medium font-sans select-text">
                    {selectedMezmur.lyricsAm}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMezmur.stanzas.map((stanza) => (
                    <div
                      key={stanza.stanzaNumber}
                      className="p-3.5 rounded-2xl bg-[#191614] border border-[#B89A5A]/15 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-[#B89A5A]">
                        {stanza.titleAm} {stanza.titleEn && `(${stanza.titleEn})`}
                      </div>
                      <p className="text-sm text-[#F5EFE3] leading-loose whitespace-pre-line font-medium font-sans select-text">
                        {stanza.textAm}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedMezmur.lyricsEn && (
                <div className="p-3 rounded-2xl bg-[#191614]/50 border border-white/5 space-y-1">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    English Translation:
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed italic whitespace-pre-line select-text">
                    {selectedMezmur.lyricsEn}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2 & 3: LIBRARY BROWSER & FAVORITES */}
      {/* ========================================================================= */}
      {(activeTab === 'library' || activeTab === 'favorites') && (
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'am'
                  ? 'በመዝሙር ርዕስ ወይም ቃል ይፈልጉ (Search...)'
                  : 'Search by title or lyrics...'
              }
              className="w-full rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 pl-10 pr-4 py-2.5 text-xs text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] focus:outline-none focus:border-[#B89A5A] placeholder-gray-500 shadow-sacred-sm"
            />
          </div>

          {/* Category Filter Pills */}
          {activeTab === 'library' && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === c.key
                      ? 'bg-[#6F2630] text-white shadow'
                      : 'bg-[#201D19] border border-[#B89A5A]/20 text-gray-400 hover:text-white'
                  }`}
                >
                  {language === 'am' ? c.labelAm : c.labelEn}
                </button>
              ))}
            </div>
          )}

          {/* Suggest Mezmur Button for Members */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-400">
              {filteredMezmurs.length} {language === 'am' ? 'መዝሙራት ተገኝተዋል' : 'Mezmurs found'}
            </span>
            <button
              onClick={() => setShowSuggestModal(true)}
              className="text-xs text-[#B89A5A] hover:underline font-semibold flex items-center gap-1"
            >
              <Plus size={14} />
              <span>{language === 'am' ? 'መዝሙር ጠቁም (Suggest)' : 'Suggest Mezmur'}</span>
            </button>
          </div>

          {/* Mezmur Cards List */}
          <div className="space-y-2">
            {filteredMezmurs.map((m) => {
              const isFav = favorites.includes(m.id);
              const isCurrent = m.status === 'current_study';
              const mStatus = mahberService.calculateUserStudyStatus(currentUser.id, m.id);

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMezmur(m);
                    setActiveTab('current');
                    setIsPlaying(false);
                    setCurrentTimeSec(0);
                  }}
                  className="p-3.5 rounded-2xl bg-[#201D19] dark:bg-[#201D19] light:bg-[#FFFDF8] border border-[#B89A5A]/20 hover:border-[#B89A5A]/50 transition cursor-pointer flex items-center justify-between shadow-sacred-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-[#6F2630] text-white shadow-candle-glow'
                          : 'bg-[#B89A5A]/15 text-[#B89A5A]'
                      }`}
                    >
                      <Music size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5EFE3] dark:text-[#F5EFE3] light:text-[#2B241E] flex items-center gap-1.5">
                        <span>{m.titleAm}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#315C48]/30 text-[#427A60] font-semibold">
                            ንቁ
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#B89A5A]">{m.titleEn}</div>
                      <div className="text-[10px] text-gray-400">
                        {m.categoryAm} • {m.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {mStatus === 'active' && <span className="text-xs" title="Active Study">🟢</span>}
                    {mStatus === 'started' && <span className="text-xs" title="Started">🟡</span>}
                    {mStatus === 'completed' && <span className="text-xs" title="Completed">✓</span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(m.id);
                      }}
                      className="p-1.5 rounded-full text-gray-400 hover:text-white"
                    >
                      <Heart size={15} className={isFav ? 'text-[#D98A94] fill-current' : ''} />
                    </button>
                    <ChevronRight size={15} className="text-gray-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: START STUDY CONFIRMATION */}
      {/* ========================================================================= */}
      {showStartStudyConfirm && selectedMezmur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#201D19] border border-[#B89A5A]/40 p-5 shadow-sacred space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#6F2630]/20 border border-[#6F2630] flex items-center justify-center text-[#B89A5A] mx-auto">
                <Music size={22} />
              </div>
              <h3 className="text-base font-bold text-[#F5EFE3]">
                {language === 'am' ? 'ይህን መዝሙር ከማኅበራችሁ ጋር ማጥናት ይፈልጋሉ?' : 'Study this Mezmur with the Mahber?'}
              </h3>
              <p className="text-xs text-[#B89A5A] font-semibold">{selectedMezmur.titleAm}</p>
              <p className="text-xs text-gray-400">
                {language === 'am'
                  ? 'ጥናት ሲጀምሩ የዕለት ልምምድዎን መዝግበው ለሚቀጥለው ማኅበር መዘጋጀት ይችላሉ።'
                  : 'Starting study allows you to record voluntary daily practice ahead of our gathering.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowStartStudyConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs text-gray-400 hover:bg-white/5"
              >
                {language === 'am' ? 'ይቅር (Cancel)' : 'Cancel'}
              </button>
              <button
                onClick={handleStartStudy}
                className="flex-1 py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-xs font-bold text-white shadow"
              >
                {language === 'am' ? 'ጀምር (Start)' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUGGEST A NEW MEZMUR (MEMBER ACTION) */}
      {/* ========================================================================= */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#201D19] border border-[#B89A5A]/40 p-5 shadow-sacred space-y-4">
            <div className="flex items-center justify-between border-b border-[#B89A5A]/15 pb-2.5">
              <h3 className="text-sm font-bold text-[#F5EFE3]">
                {language === 'am' ? 'አዲስ መዝሙር ጠቁም' : 'Suggest a Mezmur'}
              </h3>
              <button
                onClick={() => setShowSuggestModal(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {suggestSuccess ? (
              <div className="p-4 text-center space-y-2">
                <CheckCircle2 size={32} className="text-[#315C48] mx-auto" />
                <p className="text-xs font-bold text-[#F5EFE3]">
                  {language === 'am'
                    ? 'ጥቆማዎ ለአስተዳዳሪዎች ተላልፏል። እናመሰግናለን!'
                    : 'Your suggestion was submitted for admin review.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSuggestion} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">
                    {language === 'am' ? 'የመዝሙር ርዕስ በአማርኛ *' : 'Amharic Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestionTitleAm}
                    onChange={(e) => setSuggestionTitleAm(e.target.value)}
                    placeholder="ለምሳሌ፡ ኢየሱስ ክርስቶስ"
                    className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">
                    {language === 'am' ? 'ርዕስ በእንግሊዝኛ (ከተቻለ)' : 'English Title (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={suggestionTitleEn}
                    onChange={(e) => setSuggestionTitleEn(e.target.value)}
                    placeholder="e.g. Eyesus Kristos"
                    className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-gray-400">
                    {language === 'am' ? 'ማስታወሻ ወይም ምክንያት' : 'Optional Note / Context'}
                  </label>
                  <textarea
                    rows={2}
                    value={suggestionNote}
                    onChange={(e) => setSuggestionNote(e.target.value)}
                    placeholder={
                      language === 'am'
                        ? 'ለምሳሌ፡ ለሚቀጥለው ማኅበር ብናጠናው መንፈሳዊ ጥንካሬ ይሰጠናል።'
                        : 'Why do you recommend this hymn for the Mahber?'
                    }
                    className="w-full rounded-xl bg-[#151311] border border-[#B89A5A]/30 px-3 py-2 text-xs text-[#F5EFE3] focus:outline-none focus:border-[#B89A5A]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSuggestModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs text-gray-400 hover:bg-white/5"
                  >
                    {language === 'am' ? 'ይቅር' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#6F2630] hover:bg-[#8C3542] text-xs font-bold text-white shadow"
                  >
                    {language === 'am' ? 'ጠቁም (Submit)' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
