import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Send,
  Heart,
  Copy,
  Check,
  Sparkles,
  MessageCircleHeart,
  MessageSquare,
  Camera,
  RotateCw,
  Megaphone,
  Gift,
  BellRing,
  Smile,
} from 'lucide-react';
import { WebsiteConfig, LoveReply } from '../types';
import { uploadPhoto } from '../lib/cloudinary';
import { getSessionId, recordLoveEvent } from '../lib/events';

interface GiftAndReplySectionProps {
  config: WebsiteConfig;
  isOpen: boolean;
  onGoBackToLetter: () => void;
  onGoToIntro?: () => void;
  onClose?: () => void;
  onSendSuccess: (imageUrl: string | null) => void;
}

const DEFAULT_MOODS = [
  'Cảm động xíu nè 🥺',
  'Thương anh nhiều lắm 🥰',
  'Mau về bế Em, dẫn tui đi ăn 🍽️',
  'Nhớ anh 💋',
  'Bà chã này đáng yêu số 1 💖',
];

export const GiftAndReplySection: React.FC<GiftAndReplySectionProps> = ({
  config,
  isOpen,
  onGoBackToLetter,
  onGoToIntro,
  onSendSuccess,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>(DEFAULT_MOODS[1]);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(config.nickname || 'Bà Chã');
  const [attachedPhoto, setAttachedPhoto] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState<string>('Một tấm hình dành riêng cho Bắp 💗');
  const [copied, setCopied] = useState<boolean>(false);
  const [replies, setReplies] = useState<LoveReply[]>([]);
  const [justSent, setJustSent] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);
  type SendStage = 'idle' | 'checking' | 'needs-auth' | 'authorizing' | 'uploading' | 'saving' | 'success';
  const [sendStage, setSendStage] = useState<SendStage>('idle');
  const sendStageText: Record<SendStage, string> = {
    idle: 'Gửi lời nhắn cho anh 💌',
    checking: 'Chibi đang kiểm tra chìa khóa... 🔐',
    'needs-auth': 'Chibi chờ Em xác nhận mật mã 💗',
    authorizing: 'Chibi đang xác nhận mật mã... 🔐',
    uploading: 'Chibi đang gửi ảnh của Em... 📸',
    saving: 'Chibi đang cất lời nhắn... 💌',
    success: 'Bắp nhận được lời nhắn rồi! 💗',
  };
  const [sendError, setSendError] = useState('');
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [submissionId] = useState(() => crypto.randomUUID());
  const [showGiftAuth, setShowGiftAuth] = useState(false);
  const [giftPassword, setGiftPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authorizing, setAuthorizing] = useState(false);

  // Load saved replies from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bap_kunn_love_replies_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setReplies(parsed);
        if (parsed.length > 0) {
          setHasCompleted(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Trigger confetti when section opens
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#ec4899', '#fbbf24', '#a855f7'],
      });
    }
  }, [isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setSendError('em chọn ảnh JPG, PNG hoặc WebP dưới 5MB nha!');
      e.target.value = '';
      return;
    }
    setSendError('');
    setSelectedFile(file);
    setUploadedImageUrl(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAttachedPhoto(result);
        setPhotoCaption('Ảnh Bà Chã gửi riêng cho anh ✨');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCycleAlbumPhoto = () => {
    if (config.photos.length === 0) return;
    const currentIndex = config.photos.findIndex((p) => p.url === attachedPhoto);
    const nextIndex = (currentIndex + 1) % config.photos.length;
    setSelectedFile(null);
    setUploadedImageUrl(null);
    setAttachedPhoto(config.photos[nextIndex].url);
    setPhotoCaption(config.photos[nextIndex].caption || 'Ảnh bà chã gửi anh ❤️');
  };

  // A verified Gift Session is independent from the Memory Session.
  // Keep the form and selected photo intact while asking for permission.
  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || isSending || sendStage === 'checking' || sendStage === 'authorizing') return;
    setSendError('');
    setSendStage('checking');
    try {
      const response = await fetch('/api/gift-auth', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Không kiểm tra được quyền gửi thư');
      const payload = await response.json() as { authenticated?: boolean };
      if (!payload.authenticated) {
        setSendStage('needs-auth');
        setShowGiftAuth(true);
        return;
      }
      await submitGiftReply();
    } catch (error) {
      setSendStage('idle');
      setSendError(error instanceof Error ? error.message : 'Lỗi kết nối');
    }
  };

  const submitGiftReply = async () => {
    if (isSending) return;
    setIsSending(true);
    setSendStage(selectedFile && !uploadedImageUrl ? 'uploading' : 'saving');
    setSendError('');
    let imageUrl: string | null = uploadedImageUrl;
    try {
      if (selectedFile && !imageUrl) {
        imageUrl = await uploadPhoto(selectedFile, 'gift');
        setUploadedImageUrl(imageUrl);
      }
      setSendStage('saving');
      const response = await fetch('/api/gift-reply', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: (senderName.trim() || 'Bà Chã').slice(0, 60),
          message: replyMessage.trim().slice(0, 2000),
          mood: selectedMood.slice(0, 100),
          image_url: imageUrl,
          submission_id: submissionId,
          session_id: getSessionId(),
        }),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({})) as { error?: string };
        if (response.status === 401) { setSendStage('needs-auth'); setShowGiftAuth(true); throw new Error('Phiên gửi thư hết hạn. Em xác nhận lại nha.'); }
        throw new Error(errorPayload.error || 'Gửi lời nhắn chưa thành công');
      }
      setSendStage('success');
      void recordLoveEvent('reply_sent');
      localStorage.setItem('bap_kunn_completed_20102026', 'true');
      confetti({ particleCount: 100, spread: 85, origin: { y: 0.5 } });
      onSendSuccess(imageUrl);
    } catch (error) {
      console.error('Gửi lời nhắn thất bại:', error);
      setSendStage(current => current === 'needs-auth' ? current : 'idle');
      setSendError(error instanceof Error ? `Chưa gửi được: ${error.message}` : 'Lỗi kết nối, Em thử lại nha!');
    } finally {
      setIsSending(false);
    }
  };

  const authorizeAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authorizing) return;
    setAuthorizing(true);
    setSendStage('authorizing');
    setAuthError('');
    try {
      const response = await fetch('/api/gift-auth', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: giftPassword }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error || 'Chưa xác thực được');
      }
      setGiftPassword('');
      setShowGiftAuth(false);
      await submitGiftReply();
    } catch (error) {
      setSendStage('needs-auth');
      setAuthError(error instanceof Error ? error.message : 'Lỗi kết nối');
    } finally {
      setAuthorizing(false);
    }
  };

  // Copy standard reply
  const handleCopyFormattedMessage = () => {
    const text = `💌 Lời nhắn của Em gửi anh:\n${replyMessage.trim() || selectedMood}\n— ${senderName.trim() || 'Bà Chã'} ❤️`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }).catch(() => setSendError('Chưa sao chép được, Em thử lại nha!'));
  };

  if (!isOpen) return null;

  return (
    <section id="gift-and-reply-section" className="py-6 sm:py-10 px-4 sm:px-6 max-w-5xl mx-auto z-20 animate-fade-in">
      {showGiftAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="gift-auth-heading">
          <form onSubmit={authorizeAndSend} className="w-full max-w-sm rounded-3xl border-2 border-rose-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <span className="text-3xl">🔐💌</span>
              <h3 id="gift-auth-heading" className="text-xl font-bold text-rose-700">Cho Chibi xin mật mã nhỏ nha!</h3>
              <p className="text-sm text-slate-600">Xác nhận để gửi lời nhắn và ảnh an toàn đến Anh. Nội dung Em vừa viết vẫn được giữ nguyên.</p>
            </div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="gift-confirm-password">Mật khẩu gửi quà</label>
            <input id="gift-confirm-password" type="password" autoComplete="off" value={giftPassword} onChange={e => setGiftPassword(e.target.value)} required minLength={12} className="w-full rounded-xl border border-rose-200 bg-rose-50 p-3 outline-none focus:border-rose-500" placeholder="Mật khẩu riêng..." />
            {authError && <p role="alert" className="text-sm text-red-600">{authError}</p>}
            <button type="submit" disabled={authorizing} className="w-full rounded-xl bg-rose-500 py-3 font-bold text-white disabled:opacity-60">{authorizing ? sendStageText[sendStage] : 'Xác nhận & Gửi Anh 💗'}</button>
            <button type="button" onClick={() => { setShowGiftAuth(false); setGiftPassword(''); setAuthError(''); setSendStage('idle'); }} className="w-full text-sm text-slate-500 py-2">Quay lại viết lời nhắn</button>
          </form>
        </div>
      )}
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 border border-rose-300/80 shadow-md text-rose-800 text-xs sm:text-sm font-semibold mb-2">
          <MessageSquare size={14} className="text-rose-600" />
          Một lời nhắn gửi anh 💕
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-romantic font-bold text-slate-800">
          Gửi Lời Nhắn Cho {config.boyfriendName}
        </h2>

        <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-lg mx-auto font-light leading-relaxed">
          Bà Chã có gì muốn thủ thỉ với anh hong? 💌
        </p>
      </div>

      {/* Main Container: Attached Photo + Reply Form */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-9 shadow-2xl border-2 border-rose-200 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 text-rose-600 mb-6">
            <MessageCircleHeart size={26} className="fill-rose-100 text-rose-500" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-romantic text-slate-800">
                Nhắn anh một câu nha 💕
              </h3>
              <p className="text-xs text-slate-500">
                Anh ngồi hóng tin em nè! 💌
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left side: Attached Photo Card (5 cols on md) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[260px] bg-white p-3 pb-5 rounded-2xl shadow-xl border-2 border-rose-200/80 group">
                {/* Washi tape */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-rose-200/90 backdrop-blur-sm border-l border-r border-rose-300 rounded-xs pointer-events-none z-10" />

                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 relative">
                  {attachedPhoto ? (
                    <img
                      src={attachedPhoto}
                      alt="Tấm ảnh gửi anh"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-400 bg-rose-50">
                      <Camera size={54} strokeWidth={1.25} />
                      <span className="text-xs mt-3 text-rose-600 font-medium">Ảnh xinh của em 📸</span>
                    </div>
                  )}

                  {/* Photo badge */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-[11px] font-medium text-center flex items-center justify-center gap-1">
                    <Heart size={12} className="fill-rose-400 text-rose-400" />
                    <span>Ảnh gửi tặng anh</span>
                  </div>
                </div>

                <p className="mt-3 text-xs font-handwriting font-bold text-rose-800 text-center truncate px-1 text-base">
                  {photoCaption}
                </p>

                {/* Photo Action Controls */}
                <div className="mt-3 flex items-center justify-center gap-2 pt-2 border-t border-rose-100">
                  <label className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl cursor-pointer text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-rose-200">
                    <Camera size={13} />
                    <span>Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {config.photos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCycleAlbumPhoto}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors border border-rose-200"
                      title="Chọn ảnh khác từ album"
                    >
                      <RotateCw size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Reply Form (7 cols on md) */}
            <div className="md:col-span-7">
              {/* Mood selector buttons */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Chọn một câu trêu anh nè 💗
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_MOODS.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => {
                        setSelectedMood(mood);
                        setReplyMessage(mood);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                        selectedMood === mood
                          ? 'bg-rose-500 text-white font-medium shadow-sm shadow-rose-300'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveReply} className="space-y-3.5">
                {sendError && (
                  <div role="alert" className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl space-y-2">
                    <p>Chibi gửi thư chưa được 🥺 {sendError}</p>
                    <button type="button" onClick={handleCopyFormattedMessage} className="flex items-center gap-1.5 font-semibold underline underline-offset-2">
                      <Copy size={14} /> {copied ? 'Đã sao chép 💗' : 'Sao chép lời nhắn để gửi anh'}
                    </button>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tên của em
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white shadow-xs"
                    placeholder="Bà Chã"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Em muốn nói thêm gì không?
                  </label>
                  <textarea
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:border-rose-500 focus:bg-white resize-none shadow-xs font-sans"
                    placeholder="Chọn câu ở trên hoặc viết gì đó cho anh nè..."
                    required
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSending || sendStage === 'checking' || sendStage === 'authorizing' || showGiftAuth}
                    aria-busy={isSending || sendStage === 'checking' || sendStage === 'authorizing'}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send size={15} />
                    <span>{sendStageText[sendStage]}</span>
                  </button>


                </div>

                {sendStage !== 'idle' && sendStage !== 'success' && (
                  <p role="status" aria-live="polite" className="text-center text-xs text-rose-600">{sendStageText[sendStage]}</p>
                )}
                {justSent && (
                  <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-center flex flex-col items-center justify-center gap-1 animate-fade-in shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles size={15} className="text-amber-500" />
                      <span>Lời nhắn đã được lưu cho Bắp rồi!</span>
                    </div>
                    <span className="text-[11px] text-emerald-700">
                      Lời nhắn đã được gửi về hộp thư của Bắp. 💌
                    </span>
                  </div>
                )}
              </form>

            </div>
          </div>

          {/* Local copy of submitted replies (not a shared inbox) */}
          {replies.length > 0 && (
            <div className="mt-8 pt-6 border-t border-rose-100">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Heart size={13} className="text-rose-500 fill-rose-500" />
                Sổ lưu bút tình yêu ({replies.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {replies.map((item) => (
                  <div
                    key={item.id}
                    className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100 text-xs text-slate-700 shadow-2xs flex gap-3 items-start"
                  >
                    {item.photoUrl && (
                      <div className="w-14 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-rose-200 shadow-xs">
                        <img
                          src={item.photoUrl}
                          alt="Ảnh đính kèm"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] text-rose-700 font-semibold mb-1">
                        <span className="truncate">{item.senderName} ({item.mood})</span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="italic text-slate-800 leading-relaxed font-sans-vietnam line-clamp-3">
                        &ldquo;{item.message}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </section>
  );
};
