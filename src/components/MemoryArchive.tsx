import React from 'react';
import { Camera, ChevronLeft, ChevronRight, Heart, ImagePlus, LoaderCircle, Mail, Send, Sparkles, X } from 'lucide-react';
import { DISPLAY_SETTINGS } from '../data/displaySettings';
import { uploadPhoto } from '../lib/cloudinary';
import { shootPhotoHearts } from '../lib/heartBurst';

type Role = 'anh' | 'em';
type Like = { photo_key: string; liker_role: Role };
type LoveStamp = { photo_key: string; stamped_at: string };
type Memory = { message: string; image_url: string | null; created_at: string };
type Entry = { id: number; message: string | null; image_urls: string[]; created_at: string; actor_role?: Role | null };
const formatStamp = (value: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)).replace(/(\d{2}:\d{2})/, '· $1');
const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
function durationSince(start: string) { const n = Math.max(0, Math.floor((Date.now() - Date.parse(start)) / 1000)); return [Math.floor(n / 86400), Math.floor(n / 3600) % 24, Math.floor(n / 60) % 60, n % 60]; }

function MemoryPhotoViewer({ images, keys, index, onClose, onChange, renderHeart }: { images: string[]; keys: string[]; index: number; onClose: () => void; onChange: (index: number) => void; renderHeart: (key: string) => React.ReactNode }) {
  React.useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') onChange((index + 1) % images.length); if (e.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length); };
    window.addEventListener('keydown', handle); document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handle); document.body.style.overflow = ''; };
  }, [index, images, onClose, onChange]);
  return <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/85 px-3 py-8 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Xem ảnh kỷ niệm">
    <button type="button" aria-label="Đóng" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/20 p-3 text-white hover:bg-white/30"><X /></button>
    {images.length > 1 && <button type="button" aria-label="Ảnh trước" onClick={() => onChange((index - 1 + images.length) % images.length)} className="absolute left-2 z-10 rounded-full bg-white/20 p-2 text-white sm:left-8"><ChevronLeft /></button>}
    <figure className="max-w-[78vw] rotate-[-1deg] rounded-lg bg-white p-2 pb-9 shadow-2xl sm:p-4 sm:pb-12"><img src={images[index]} alt={`Kỷ niệm ${index + 1}`} className="max-h-[70vh] max-w-full rounded-sm object-contain"/><figcaption className="pt-3 text-center font-handwriting text-lg text-rose-500">Một chút thương, một chút nhớ 💗</figcaption></figure>
    {images.length > 1 && <button type="button" aria-label="Ảnh sau" onClick={() => onChange((index + 1) % images.length)} className="absolute right-2 z-10 rounded-full bg-white/20 p-2 text-white sm:right-8"><ChevronRight /></button>}
    <div className="absolute bottom-3 flex flex-col items-center gap-2 text-sm text-white/80">{renderHeart(keys[index])}<span>{index + 1} / {images.length}</span></div>
  </div>;
}

export function MemoryArchive({role}:{role:Role}) {
  const { memories, loveStartAt } = DISPLAY_SETTINGS;
  const [elapsed, setElapsed] = React.useState(() => durationSince(loveStartAt));
  const [memory, setMemory] = React.useState<Memory | null>(null);
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [entriesError, setEntriesError] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [sending, setSending] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const [viewer, setViewer] = React.useState<{ images: string[]; keys: string[]; index: number } | null>(null);
  
  const [likes, setLikes] = React.useState<Like[]>([]);
  const [likesError, setLikesError] = React.useState(false);
  const [stamps, setStamps] = React.useState<LoveStamp[]>([]);
  const stampsRef = React.useRef<LoveStamp[]>([]);
  const [likeBusy, setLikeBusy] = React.useState<string | null>(null);
  const pendingLike = React.useRef<string | null>(null);
  const likesRef = React.useRef<Like[]>([]);
  const [photoBloom, setPhotoBloom] = React.useState(0);
  const bloomTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerPhotoBloom = React.useCallback((intense = false) => {
    shootPhotoHearts(intense);
    setPhotoBloom(v => v + 1);
    if (bloomTimer.current) clearTimeout(bloomTimer.current);
    bloomTimer.current = setTimeout(() => setPhotoBloom(0), 1800);
  }, []);
  const [likeEffect, setLikeEffect] = React.useState<{ key: string; id: number; duet: boolean } | null>(null);
  const [duetCelebration, setDuetCelebration] = React.useState<{ key: string; id: number; stampedAt: string } | null>(null);
  const effectsTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationId = React.useRef(0);
  React.useEffect(() => { likesRef.current = likes; }, [likes]);
  React.useEffect(() => () => { if (effectsTimer.current) clearTimeout(effectsTimer.current); if (bloomTimer.current) clearTimeout(bloomTimer.current); }, []);
  const [chibiLine, setChibiLine] = React.useState(role === 'anh' ? 'Ăm Chã tới rồi! Chibi giữ sổ kỹ lắm á! 👀' : 'Bà Chã tới rồi! Chibi chờ nãy giờ á! 🤭');
  const [chibiOpen, setChibiOpen] = React.useState(false);
  const [sendStage, setSendStage] = React.useState<'idle'|'upload'|'saving'>('idle');
  const visitRecorded = React.useRef(false);
  const [submissionId, setSubmissionId] = React.useState(() => crypto.randomUUID());
  const fileRef = React.useRef<HTMLInputElement>(null);
  const imagePreviews = React.useMemo(() => files.map(file => URL.createObjectURL(file)), [files]);
  React.useEffect(() => () => imagePreviews.forEach(URL.revokeObjectURL), [imagePreviews]);
  React.useEffect(() => { const timer = window.setInterval(() => setElapsed(durationSince(loveStartAt)), 1000); return () => window.clearInterval(timer); }, [loveStartAt]);

  const tellChibi = React.useCallback((line: string) => setChibiLine(line), []);
  const recordActivity = React.useCallback((event_type:'archive_visit'|'photo_view'|'stamp_replay',photo_key?:string) => {
    const event_id = event_type === 'archive_visit' ? (sessionStorage.getItem('bk_archive_visit_v66') || (()=>{const id=crypto.randomUUID();sessionStorage.setItem('bk_archive_visit_v66',id);return id;})()) : crypto.randomUUID();
    void fetch('/api/memory-activity',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_id,event_type,photo_key:photo_key||null})}).catch(()=>{});
  },[]);
  React.useEffect(()=>{if(!visitRecorded.current){visitRecorded.current=true;recordActivity('archive_visit');}},[recordActivity]);
  const loadLikes = React.useCallback(async () => {
    const response = await fetch('/api/memory-likes', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('LIKES_UNAVAILABLE');
    const payload = await response.json() as { likes: Like[]; stamps: LoveStamp[] };
    if (!pendingLike.current) { likesRef.current = payload.likes; setLikes(payload.likes); stampsRef.current = payload.stamps || []; setStamps(payload.stamps || []); } setLikesError(false);
  }, []);
  // V6.3: phản hồi lạc quan ngay khi bấm, rồi đối chiếu server.
  const toggleLike = async (key: string) => {
    // Ref chặn hai cú click trong cùng một frame, trước cả khi React render lại.
    if (pendingLike.current) return;
    setLikesError(false);
    pendingLike.current = key;
    setLikeBusy(key);
    const before = [...likesRef.current];
    const selectedRole = role;
    if (stampsRef.current.some(x => x.photo_key === key)) { pendingLike.current = null; setLikeBusy(null); return; }
    const existed = before.some(x => x.photo_key === key && x.liker_role === selectedRole);
    const liked = !existed;
    const next = liked
      ? [...before, { photo_key: key, liker_role: selectedRole }]
      : before.filter(x => !(x.photo_key === key && x.liker_role === selectedRole));
    likesRef.current = next;
    setLikes(next); // visual xuất hiện ngay lập tức
    if (liked) triggerPhotoBloom();
    const id = ++animationId.current;
    if (effectsTimer.current) clearTimeout(effectsTimer.current);
    setLikeEffect({ key, id, duet: false });
    effectsTimer.current = setTimeout(() => setLikeEffect(v => v?.id === id ? null : v), 900);
    tellChibi(liked ? (selectedRole === 'em' ? 'Á à! Bà Chã vừa thả tim nè! Chibi méc Anh Bắp! 📣💗' : 'Anh Bắp thả tim rồi! Chibi thấy hết nha! 🤭') : 'Ơ kìa, tim đâu mất tiêu rồi Chã ơi? 🥺');
    try {
      const response = await fetch('/api/memory-likes', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_key: key, liked }),
      });
      if (!response.ok) throw new Error('LIKE_FAILED');
      // Một HTTP request: server trả trạng thái đã xác nhận cho chính ảnh này.
      // Không gọi lại toàn bộ /api/memory-likes sau mỗi lần bấm.
      const result = await response.json() as { likes?: Like[]; stamp?: LoveStamp | null; justStamped?: boolean };
      if (!Array.isArray(result.likes)) throw new Error('INVALID_LIKES_RESPONSE');
      const confirmed = result.likes;
      const merged = [...likesRef.current.filter(x => x.photo_key !== key), ...confirmed];
      likesRef.current = merged;
      setLikes(merged);
      if (result.stamp && !stampsRef.current.some(s => s.photo_key === key)) {
        const nextStamps = [...stampsRef.current, result.stamp];
        stampsRef.current = nextStamps;
        setStamps(nextStamps);
      }
      if (result.justStamped && result.stamp) {
        triggerPhotoBloom(true);
        setDuetCelebration({ key, id, stampedAt: result.stamp.stamped_at });
        tellChibi('Chibi đóng dấu rồi nha! 🤭💗');
      }
    } catch {
      // Nếu chưa xác nhận lưu thành công: quay về giá trị server đã biết.
      likesRef.current = before;
      setLikes(before);
      setLikesError(true);
      setLikeEffect(v => v?.id === id ? null : v);
      tellChibi('Úi, Chibi đánh rơi trái tim rồi! Thử lại giúp Chibi nha 🥺');
    } finally {
      pendingLike.current = null;
      setLikeBusy(null);
    }
  };
  const renderHeart = (key: string, compact = false) => {
    const count = likes.filter(x => x.photo_key === key).length;
    const active = likes.some(x => x.photo_key === key && x.liker_role === role);
    const isBurst = likeEffect?.key === key;
    const stamp = stamps.find(x => x.photo_key === key);
    const duet = duetCelebration?.key === key;
    return <span className={`bk-heart-wrap relative inline-flex min-w-0 flex-wrap items-center gap-1.5 ${isBurst ? 'bk-polaroid-love' : ''}`}>
      <button type="button" disabled={!!likeBusy || !!stamp} onClick={() => void toggleLike(key)} aria-label={`${stamp ? 'Đã đóng dấu thương' : active ? 'Bỏ tim' : 'Thả tim'} ảnh cho ${role === 'anh' ? 'Anh Bắp' : 'Bà Chã'}`} aria-pressed={active} aria-busy={likeBusy === key}
        className={`bk-like-button relative inline-flex items-center gap-1.5 overflow-visible min-h-11 rounded-full border px-3 py-2 text-xs font-semibold shadow-sm transition-colors duration-200 disabled:cursor-wait ${active ? 'border-rose-400 bg-rose-500 text-white' : 'border-rose-200 bg-white text-rose-600'}`}>
        <Heart className={isBurst ? 'bk-heart-pop' : ''} size={15} fill={active ? 'currentColor' : 'none'}/>
        <span aria-live="polite">{count} tim</span>
      </button>
      {isBurst && active && <span aria-hidden="true" key={likeEffect?.id} className="bk-heart-particles">{['💗','💕','💖','💓','✨','🌸','💗'].map((shape, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{shape}</span>)}</span>}
      {stamp && !compact && <button type="button" className="bk-stamp-badge" title={`Xem lại dấu thương · ${formatDate(stamp.stamped_at)}`} onClick={() => {recordActivity('stamp_replay',key);setDuetCelebration({key, stampedAt:stamp.stamped_at, id:++animationId.current});}}>
        💞 Cùng thương · {formatStamp(stamp.stamped_at)}
      </button>}
      {duet && <span className="sr-only">Hai đứa cùng thương!</span>}
    </span>;
  };
  const stampSticker = (key: string) => {
    const stamp = stamps.find(x => x.photo_key === key);
    if (!stamp) return null;
    return <button type="button" className="bk-photo-stamp absolute right-2 top-2 z-30 flex min-h-11 items-center gap-1 rounded-full border border-rose-200 bg-white/95 px-2.5 py-2 text-[11px] font-bold text-rose-600 shadow-md backdrop-blur" onClick={e => { e.stopPropagation(); recordActivity('stamp_replay',key); setDuetCelebration({ key, stampedAt:stamp.stamped_at, id:++animationId.current }); }} aria-label={`Xem lại dấu thương ${formatStamp(stamp.stamped_at)}`} title={`Đã cùng thương · ${formatStamp(stamp.stamped_at)}`}>💞 <span className="hidden min-[390px]:inline">Dấu thương</span></button>;
  };
  const reloadEntries = React.useCallback(async () => {
    const response = await fetch('/api/memory-entries', { cache: 'no-store' });
    if (!response.ok) throw new Error('entries unavailable');
    const payload = await response.json() as { entries: Entry[] };
    setEntries(payload.entries);
    setEntriesError(false);
  }, []);
  React.useEffect(() => {
    const controller = new AbortController();
    fetch('/api/memory', { cache: 'no-store', signal: controller.signal })
      .then(async res => { if (!res.ok) throw new Error('memory unavailable'); return res.json() as Promise<{ memory: Memory | null }>; })
      .then(result => { if (!controller.signal.aborted) setMemory(result.memory); })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    reloadEntries().catch(() => { if (!controller.signal.aborted) setEntriesError(true); });
    loadLikes().catch(() => { if (!controller.signal.aborted) setLikesError(true); });
    return () => controller.abort();
  }, [reloadEntries, loadLikes]);

  const selectFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    if (next.length > 6) { setFormError('Mỗi lần chọn tối đa 6 ảnh nha Em.'); return; }
    if (next.some(f => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)) { setFormError('Ảnh phải là JPG, PNG, WebP và không quá 5 MB/tấm nha.'); return; }
    setFiles(next); setFormError(''); setSent(false); tellChibi('Có ảnh mới hả? Đưa Chibi cất vô album nè! 🌷');
    if (fileRef.current) fileRef.current.value = '';
  };
  const sendMemory = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(''); setSent(false);
    if (!message.trim() && files.length === 0) { setFormError(role === 'anh' ? 'Anh để lại vài lời hoặc một tấm ảnh cho Em nha!' : 'Em nhắn vài chữ hoặc chọn một tấm ảnh nha!'); return; }
    setSending(true); setSendStage('upload');
    try {
      // 2 upload song song: nhanh hơn tuần tự, nhưng không làm nghẽn điện thoại.
      const imageUrls: string[] = [];
      for (let start = 0; start < files.length; start += 2) {
        imageUrls.push(...await Promise.all(files.slice(start, start + 2).map((file) => uploadPhoto(file, 'memory'))));
      }
      setSendStage('saving');
      const saved = await fetch('/api/memory-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ message: message.trim() || null, image_urls: imageUrls, submission_id: submissionId }) });
      if (!saved.ok) { const err = await saved.json().catch(() => ({})); throw new Error(err.error || 'Chưa gửi được kỷ niệm'); }
      setMessage(''); setFiles([]); setSubmissionId(crypto.randomUUID()); setSent(true);
      await reloadEntries().catch(() => setEntriesError(true));
      tellChibi(role === 'anh' ? 'Chibi gửi lời Anh tới Bà Chã rồi nè! 💗' : 'Anh Bắp ơiii! Có kỷ niệm mới rồi nè! 💗');
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Gửi chưa thành công, Em thử lại nha.'); tellChibi('Úi, Chibi làm rơi thư rồi. Thử lại giúp Chibi nha! 🥺'); }
    finally { setSending(false); setSendStage('idle'); }
  };
  const openImages = (images: string[], keys: string[], index = 0) => { recordActivity('photo_view',keys[index]); tellChibi('Tấm này Chibi cất kỹ lắm đó nha! 📸'); setViewer({ images, keys, index }); };

  const units = ['NGÀY', 'GIỜ', 'PHÚT', 'GIÂY'];
  return <main className="memory-scrapbook relative z-20 mx-auto w-full max-w-4xl px-3 pb-28 pt-16 sm:px-6 sm:pb-20 sm:pt-20">
    <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-rose-100 bg-white/85 px-4 py-3 text-sm text-rose-600">
      <span>💗 {role==='anh'?'Ăm Chã':'Bà Chã'} đang ghé sổ nè!</span>
      <span className="text-xs text-slate-500">Chibi giữ kỹ lắm đó! 🤭</span>
    </div>
    {likesError && <p role="alert" className="mb-3 text-xs text-red-600">Chibi chưa tải hoặc lưu được tim. Thử lại nha!</p>}
    <section className="relative overflow-hidden rounded-[2rem] border border-rose-200/90 bg-[#fffdfa]/95 px-4 py-8 text-center shadow-[0_20px_70px_rgba(244,114,182,.15)] sm:px-10 sm:py-12">
      <span className="pointer-events-none absolute -left-4 top-8 rotate-[-20deg] text-5xl opacity-50" aria-hidden="true">🌸</span>
      <span className="pointer-events-none absolute right-1 top-12 rotate-[25deg] text-5xl opacity-50" aria-hidden="true">🌷</span>
      <p className="text-[11px] font-semibold tracking-[.2em] text-rose-400">OUR LITTLE MEMORY BOOK · 2026</p>
      <h1 className="mx-auto mt-2 max-w-lg font-serif-romantic text-3xl font-bold leading-tight text-rose-600 sm:text-4xl">{memories.heading}</h1>
      <p className="mt-3 text-sm text-slate-500">Mình bên nhau mỗi ngày như này Em nhé, Anh thêm chút muối, Em thêm chút đường. 💗</p>
      <button type="button" onClick={() => { triggerPhotoBloom(); tellChibi(role === 'anh' ? 'Ăm Chã bắn tim rồi! Chibi méc Bà Chã nha! 🤭' : 'Ú òa, Bà Chã bắn tim tung tóe kìa! 💗'); }} className="relative z-10 mx-auto mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 shadow-sm transition-transform hover:scale-105 active:scale-95" aria-label="Bắn Tim Ảnh"><Heart size={16} fill="currentColor"/> Bắn Tim Ảnh</button>
      {photoBloom > 0 && <div key={photoBloom} className="bk-photo-bloom pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">{['💗','💕','💖','💓','🌸','💗','💕'].map((symbol,i)=><span key={i} style={{'--burst-index':i, '--burst-dx':`${(i-3)*44}px`} as React.CSSProperties}>{symbol}</span>)}</div>}
      {memories.showLoveClock && <div className="mx-auto mt-6 max-w-lg">
        <p className="mb-3 text-xs font-medium text-slate-500">Anh và Em đã thương nhau được...</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">{elapsed.map((value, i) => <div key={units[i]} className="rounded-2xl border border-rose-100 bg-[#fff0f3] px-1 py-3"><span className="block font-serif-romantic text-2xl font-bold tabular-nums text-rose-600 sm:text-3xl">{String(value).padStart(2, '0')}</span><span className="text-[10px] text-slate-500">{units[i]}</span></div>)}</div>
        <p className="mt-2 text-xs text-rose-400">Từ 08/01/2026 · Giờ Việt Nam 💗</p>
      </div>}
      {memories.showChibiNote && <div className="mt-7"><p className="font-handwriting text-xl font-bold text-rose-500">{memories.chibiNote}</p><p className="mt-1 text-xs text-slate-500">Từ giờ, nơi này sẽ giữ lại những điều đáng yêu của anh và Em. 💗</p></div>}
      <div className="memory-card-enter mt-7 grid items-center gap-5 rounded-[1.5rem] border border-rose-100 bg-gradient-to-br from-[#fff6f7] via-white to-[#fff4ef] p-4 text-left sm:grid-cols-[1fr_220px] sm:p-6">
        <div className="self-stretch rounded-2xl border border-rose-100 bg-white/70 p-4">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-rose-600"><Mail size={22}/> {memories.messageHeading}</h2>
          {loading && <p className="text-sm text-slate-500">Chibi đang mở hộp kỷ niệm...</p>}
          {!loading && loadError && <p className="text-sm text-slate-500">Chưa tải được lời nhắn đầu tiên. Em ghé lại chút nha 💗</p>}
          {!loading && !loadError && memory && <><p className="min-h-24 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{memory.message}</p><p className="mt-3 text-right text-xs text-rose-400">{formatDate(memory.created_at)}</p></>}
          {!loading && !loadError && !memory && <p className="text-sm text-slate-500">Chibi vẫn đang giữ chỗ cho kỷ niệm đầu tiên 💌</p>}
        </div>
        {memories.showPhoto && memory?.image_url ? <button type="button" onClick={() => openImages([memory.image_url!], ['first'], 0)} className="mx-auto w-52 rotate-[3deg] rounded-lg border border-rose-100 bg-white p-2 pb-4 text-center shadow-xl transition-transform hover:rotate-0 hover:scale-105" aria-label="Xem ảnh đầu tiên"><img src={memory.image_url} alt="Ảnh đầu tiên Em gửi anh" className="aspect-[3/4] w-full rounded object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async"/><span className="mt-3 block font-handwriting text-sm font-semibold text-rose-600">{memories.photoCaption}</span></button> : <div className="mx-auto flex min-h-48 w-48 rotate-[3deg] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-rose-200 bg-white/70 p-4 text-center text-rose-300"><Camera size={30}/><span className="text-xs">Chỗ dành cho ảnh đầu tiên 💗</span></div>}
      </div>
      {memory?.image_url && <div className="mt-3 flex flex-wrap items-center justify-center gap-2">{renderHeart('first', true)}{stamps.find(x=>x.photo_key==='first') && <button type="button" className="bk-stamp-badge" onClick={()=>{const stamp=stamps.find(x=>x.photo_key==='first');if(stamp){recordActivity('stamp_replay','first');setDuetCelebration({key:'first',stampedAt:stamp.stamped_at,id:++animationId.current});}}}>💞 Dấu thương</button>}</div>}
      <section className="memory-card-enter mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50/70 p-4 text-left sm:p-6" aria-labelledby="memory-form-title">
        <h2 id="memory-form-title" className="flex items-center gap-2 font-serif-romantic text-xl font-bold text-rose-600"><Sparkles size={23}/> Thêm một chút thương 💌</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{role === 'anh' ? 'Hôm nay Anh có gì muốn kể Bà Chã nghe hông?' : 'Hôm nay Em có gì muốn kể Anh nghe hông?'}</p>
        <form onSubmit={sendMemory} className="mt-4 space-y-3">
          <textarea value={message} onChange={e => { setMessage(e.target.value); setSent(false); if (e.target.value.length === 1) tellChibi('Hí hí, Chibi hông đọc trộm đâu... chắc vậy! 🙈'); }} maxLength={500} rows={3} placeholder={role === 'anh' ? 'Anh để lại vài lời cho Em nha... (hoặc chọn ảnh)' : 'Em nhắn Anh vài chữ nha... (hoặc chọn ảnh)'} className="w-full min-h-28 resize-y rounded-xl border border-rose-200 bg-white px-4 py-3 text-base sm:text-sm text-slate-700 outline-none focus:ring-2 focus:ring-rose-300" />
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-400">{message.length}/500 · Tối đa 6 ảnh, 5 MB mỗi ảnh</span><button type="button" onClick={() => fileRef.current?.click()} disabled={sending || files.length >= 6} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 disabled:opacity-50"><ImagePlus size={17}/> Thêm ảnh</button></div>
          <input ref={fileRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" multiple onChange={e => selectFiles(e.currentTarget.files)} aria-label="Chọn ảnh kỷ niệm" />
          {imagePreviews.length > 0 && <div className="flex flex-wrap gap-3">{imagePreviews.map((url, i) => <div key={url} className="relative w-20 rotate-[-2deg] rounded-md bg-white p-1 pb-3 shadow-md"><img src={url} alt={`Ảnh đã chọn ${i + 1}`} className="h-20 w-full rounded-sm object-cover"/><button type="button" disabled={sending} onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white" aria-label={`Bỏ ảnh ${i + 1}`}><X size={12}/></button></div>)}</div>}
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          {sent && <p role="status" className="text-sm font-medium text-green-700">Chibi đã cất kỷ niệm mới rồi nha! 💗</p>}
          <div className="flex justify-stretch sm:justify-end"><button type="submit" disabled={sending} aria-busy={sending} className="inline-flex w-full sm:w-auto min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-200 transition-transform hover:scale-[1.03] disabled:opacity-60">{sending ? <LoaderCircle size={18} className="animate-spin"/> : <Send size={18}/>} {sending ? (sendStage === 'upload' ? 'Chibi đang gửi ảnh xinh... 📸' : 'Chibi đang cất lời thương... 💌') : (role === 'anh' ? 'Gửi Bà Chã 💗' : 'Gửi Anh 💗')}</button></div>
        </form>
      </section>
      <section className="mt-9 text-left" aria-labelledby="more-memories-title">
        <h2 id="more-memories-title" className="font-serif-romantic text-xl font-bold text-rose-600 sm:text-2xl">🌷 Những ngày mình thương nhau 💗</h2>
        {entriesError && <p className="mt-3 text-xs text-rose-500">Chưa tải được album. Kiểm tra bảng memory_entries và API /api/memory-entries nha.</p>}
        {!entriesError && entries.length === 0 && <p className="mt-3 rounded-xl border border-dashed border-rose-200 p-6 text-center text-sm text-slate-500">Trang này còn chờ một chút thương của hai đứa 💗</p>}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">{entries.map((entry, i) => <article key={entry.id} className="memory-card-enter relative min-w-0 rounded-2xl border border-rose-100 bg-white p-3 pb-4 shadow-lg shadow-rose-100 transition-transform hover:-translate-y-1" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
          {entry.image_urls.length > 0 && <button type="button" className="relative block w-full text-left" onClick={() => openImages(entry.image_urls, entry.image_urls.map((_, j) => `entry:${entry.id}:${j}`), 0)} aria-label={`Xem ${entry.image_urls.length} ảnh trong kỷ niệm`}><div className="relative mx-auto aspect-[4/3] max-w-[280px]">{entry.image_urls.slice(0, 3).map((url, j) => <div key={url} className="absolute inset-0 overflow-hidden rounded-md border-4 border-white bg-rose-50 shadow-md" style={{ transform: `rotate(${(j - 1) * 6}deg) translate(${(j - 1) * 4}px, ${(j - 1) * -3}px)`, zIndex: j + 1 }}><img src={url} alt={`Ảnh ${j + 1}`} loading="lazy" className="h-full w-full object-cover"/></div>)}{entry.image_urls.length > 3 && <span className="absolute bottom-2 right-2 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">+{entry.image_urls.length - 3} ảnh</span>}</div></button>}
          {entry.image_urls.length > 0 && stampSticker(`entry:${entry.id}:0`)}
          {entry.image_urls.length === 0 && <div className="flex h-24 items-center justify-center rounded-md bg-rose-50"><Mail className="text-rose-300" size={30}/></div>}
          {entry.actor_role && <p className="mt-3 text-xs font-semibold text-rose-500">{entry.actor_role==='anh'?'Ăm Chã gửi Em 💌':'Bà Chã gửi Anh 💌'}</p>}
          {entry.message && <p className="mt-4 whitespace-pre-wrap break-words font-handwriting text-base leading-6 text-slate-700">{entry.message}</p>}
          <p className="mt-2 text-xs text-rose-400">{formatDate(entry.created_at)}</p>
          {entry.image_urls.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{entry.image_urls.map((_, j) => <div key={j} className="flex min-w-0 flex-wrap items-center gap-1">{entry.image_urls.length > 1 && <span className="text-[10px] text-slate-400">#{j + 1}</span>}{renderHeart(`entry:${entry.id}:${j}`, j === 0)}</div>)}</div>}
        </article>)}</div>
      </section>
      {memories.showPromise && <p className="mx-auto mt-10 max-w-lg font-handwriting text-lg leading-8 text-rose-600">{memories.promise}</p>}
    </section>
    {duetCelebration && <div key={duetCelebration.id} className="bk-duet-overlay fixed inset-0 z-[125] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Cả hai cùng thương ảnh này" onClick={() => setDuetCelebration(null)} onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDuetCelebration(null); } }} tabIndex={0}><div className="bk-duet-card max-w-sm rounded-[2rem] border-2 border-rose-200 bg-white/95 px-6 py-7 text-center shadow-2xl"><div className="bk-duet-hearts" aria-hidden="true"><span>💗</span><span>💞</span><span>💗</span></div><div className="bk-forever-seal mx-auto mt-3 flex h-36 w-36 flex-col items-center justify-center rounded-full border-[5px] border-double border-rose-400 bg-rose-50 text-rose-600 shadow-xl"><span className="text-4xl">💞</span><span className="font-serif-romantic text-lg font-bold">Anh ♡ Em</span><span className="text-[10px]">FOREVER LOVED</span></div><p className="mt-3 text-xs text-rose-600">{formatStamp(duetCelebration.stampedAt)} · Giờ Việt Nam</p><p className="mt-2 text-sm text-rose-500">Chibi đóng dấu rồi nha! 🤭💗</p><button type="button" onClick={e => {e.stopPropagation(); setDuetCelebration(null);}} className="mt-3 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white">Cất dấu thương 💌</button></div></div>}
    {!viewer && !duetCelebration && <aside className="bk-chibi-widget fixed bottom-3 right-3 z-40 flex max-w-[calc(100vw-24px)] flex-col items-end sm:bottom-5 sm:right-6" aria-label="Chibi mách lẻo">
      {chibiOpen && <div className="mb-2 max-w-[min(270px,calc(100vw-40px))] rounded-2xl border border-rose-200 bg-white/95 px-3 py-3 text-sm leading-relaxed text-rose-700 shadow-xl" role="status"><button aria-label="Ẩn lời Chibi" type="button" onClick={()=>setChibiOpen(false)} className="float-right -mr-1 -mt-1 rounded-full p-1 text-rose-500"><X size={16}/></button>{chibiLine}<button type="button" onClick={()=>tellChibi(role==='anh'?'Chibi méc Bà Chã là Ăm Chã lại ngắm ảnh nè! 🤭':'Chibi méc Anh Bắp là Bà Chã ghé thăm nè! 🤭')} className="mt-2 block text-xs font-semibold text-rose-600 underline underline-offset-2">Chibi mách lẻo 📣</button></div>}
      <button type="button" aria-label={chibiOpen?'Thu gọn Chibi':'Trò chuyện với Chibi'} aria-expanded={chibiOpen} onClick={()=>setChibiOpen(v=>!v)} className="flex min-h-12 items-center gap-2 rounded-full border-2 border-white bg-gradient-to-r from-rose-400 to-pink-500 px-3 py-2 text-sm font-semibold text-white shadow-xl ring-1 ring-rose-200 active:scale-95"><span className="text-xl" aria-hidden="true">🥰</span><span className="hidden sm:inline">{chibiOpen?'Thu Chibi lại':'Chibi mách lẻo'}</span></button>
    </aside>}
    {viewer && <MemoryPhotoViewer images={viewer.images} keys={viewer.keys} index={viewer.index} renderHeart={renderHeart} onClose={() => setViewer(null)} onChange={index => {if(viewer.keys[index])recordActivity('photo_view',viewer.keys[index]);setViewer(v => v ? { ...v, index } : v);}}/>} 
  </main>;
}
