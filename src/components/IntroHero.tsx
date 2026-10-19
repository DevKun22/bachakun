import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Mail, Lock, Gift, Smile, ArrowDown } from 'lucide-react';
import { WebsiteConfig } from '../types';
import { recordLoveEvent } from '../lib/events';

interface IntroHeroProps {
  config: WebsiteConfig;
  onOpenGate: () => void;
  isUnlocked: boolean;
}

export const IntroHero: React.FC<IntroHeroProps> = ({
  config,
  onOpenGate,
  isUnlocked,
}) => {
  const [answeredLove, setAnsweredLove] = useState<boolean>(() => sessionStorage.getItem('bap_kunn_love_yes') === 'true');
  const [isRecordingLove, setIsRecordingLove] = useState(false);
  const [loveError, setLoveError] = useState('');
  const [noButtonCount, setNoButtonCount] = useState<number>(0);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // A successful insert is required before showing the envelope's unlock action.
  const handleYesLove = async () => {
    if (answeredLove || isRecordingLove) return;
    setLoveError('');


    setIsRecordingLove(true);
    try {
      const ok = await recordLoveEvent('love_yes_clicked');
      if (!ok) throw new Error('Ghi nhận chưa thành công');

      sessionStorage.setItem('bap_kunn_love_yes', 'true');
      setAnsweredLove(true);
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#ec4899', '#fbbf24', '#fda4af'],
      });
    } catch (error) {
      console.error('Could not record love confirmation:', error);
      setLoveError('Chibi chưa ghi nhận được. em thử lại một lần nữa nha!');
    } finally {
      setIsRecordingLove(false);
    }
  };

  const handleTryOpenGate = () => {
    if (!answeredLove) {
      setLoveError('Trả lời Chibi trước rồi mới mở thư nha! 💗');
      return;
    }
    onOpenGate();
  };

  const handleNoLoveHoverOrClick = () => {
    setNoButtonCount((prev) => prev + 1);
    // Move the 'No' button playfully
    const randomX = (Math.random() - 0.5) * 160;
    const randomY = (Math.random() - 0.5) * 80;
    setNoButtonPos({ x: randomX, y: randomY });
  };

  const noButtonPhrases = [
    'Hông nha 😜',
    'Chắc hong đó? 🥺',
    'Trượt tay rồi 😆',
    'Yêu đi mà 😝',
    'Yêu Ảnh đi Chị 😝',
  ];

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-8 pb-14 z-20 overflow-hidden">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating 20/10 Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-rose-300 shadow-md shadow-rose-100 text-rose-700 text-xs sm:text-sm font-semibold mb-4 animate-float">
        <Sparkles size={15} className="text-amber-500 animate-pulse" />
        <span>Chúc Mừng Ngày Phụ Nữ Việt Nam 20/10 🌸</span>
        <Sparkles size={15} className="text-amber-500 animate-pulse" />
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif-romantic font-bold text-slate-800 tracking-tight max-w-4xl leading-tight">
        Gửi <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500">{config.nickname || config.girlfriendName}</span>
      </h1>

      <p className="mt-2 text-base sm:text-xl font-handwriting text-rose-600 max-w-xl mx-auto">
        &ldquo;{config.heroSubtitle}&rdquo;
      </p>

      {/* CHIBI INTERACTIVE LEADING SECTION: "Bà chã có yêu anh hơm?" + Chibi nhắc sắp có quà */}
      <div className="mt-6 mb-4 max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border-2 border-rose-200/90 relative animate-fade-in">
        {/* Adorable Chibi Character Illustration */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Animated SVG Chibi Boy / Bear holding a heart & gift */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 animate-bounce" style={{ animationDuration: '2s' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Ears */}
              <circle cx="28" cy="28" r="16" fill="#fbcfe8" />
              <circle cx="28" cy="28" r="9" fill="#f472b6" />
              <circle cx="72" cy="28" r="16" fill="#fbcfe8" />
              <circle cx="72" cy="28" r="9" fill="#f472b6" />
              {/* Head */}
              <circle cx="50" cy="50" r="34" fill="#ffffff" stroke="#fb7185" strokeWidth="3" />
              {/* Rosy cheeks */}
              <ellipse cx="32" cy="58" rx="7" ry="4" fill="#fda4af" opacity="0.8" />
              <ellipse cx="68" cy="58" rx="7" ry="4" fill="#fda4af" opacity="0.8" />
              {/* Eyes */}
              <ellipse cx="36" cy="46" rx="4" ry="6" fill="#1e293b" />
              <circle cx="38" cy="44" r="1.5" fill="#ffffff" />
              <ellipse cx="64" cy="46" rx="4" ry="6" fill="#1e293b" />
              <circle cx="66" cy="44" r="1.5" fill="#ffffff" />
              {/* Cute smile / mouth */}
              <path d="M 44 56 Q 50 63 56 56" fill="none" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
              {/* Floating Little Heart near ear */}
              <path
                d="M 76 18 C 76 14, 70 14, 70 18 C 70 23, 76 27, 76 27 C 76 27, 82 23, 82 18 C 82 14, 76 14, 76 18 Z"
                fill="#f43f5e"
              />
            </svg>
            {/* Gift box badge floating next to Chibi */}
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 rounded-full shadow-md text-white animate-pulse">
              <Gift size={13} />
            </div>
          </div>

          {/* Speech Bubble from Chibi */}
          <div className="flex-1 bg-rose-50/90 border border-rose-200 rounded-2xl p-3 text-left relative shadow-xs">
            {/* Bubble arrow */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-rose-200 border-b-6 border-b-transparent" />
            
            {!answeredLove ? (
              <div>
                <p className="text-xs sm:text-sm font-semibold text-rose-800">
                  Chibi có một câu hỏi nhỏ nè! 👀
                </p>
                <p className="text-[11px] text-rose-600/90 mt-0.5">
                  🎁 <i>Trả lời xong mới được mở thư nha!</i>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <span>Chibi biết ngay mà! 🥰</span>
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Thư của Bắp ở ngay bên dưới nè 👇
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Question & Interactive Yes/No Buttons */}
        {!answeredLove ? (
          <div>
            <p className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center justify-center gap-1.5">
              <span>Em có thương anh hong?</span>
              <Heart size={16} className="fill-rose-500 text-rose-500 animate-pulse" />
            </p>

            <div className="flex items-center justify-center gap-3 relative min-h-[44px]">
              {/* YES Button */}
              <button
                onClick={handleYesLove}
                disabled={isRecordingLove}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-300 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{isRecordingLove ? 'Chibi đang ghi nhận... 💌' : 'Yêu ơi là yêu 🥰'}</span>
              </button>

              {/* Playful NO Button (Moves away or changes text) */}
              <button
                onClick={handleNoLoveHoverOrClick}
                onMouseEnter={handleNoLoveHoverOrClick}
                style={{
                  transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px)`,
                  transition: 'transform 0.2s ease',
                }}
                className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer select-none"
              >
                {noButtonPhrases[noButtonCount % noButtonPhrases.length]}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 bg-rose-100/70 py-1.5 px-3 rounded-full animate-pulse">
            <Sparkles size={14} className="text-amber-500 animate-spin" />
            <span>Chibi duyệt rồi, mở thư thôi! 👇</span>
            <Sparkles size={14} className="text-amber-500 animate-spin" />
          </div>
        )}
      </div>

      {loveError && (
        <p role="alert" className="max-w-sm mt-2 text-center text-xs font-medium text-rose-700 bg-white/90 border border-rose-200 rounded-xl px-3 py-2">
          {loveError}
        </p>
      )}

      {/* 3D Love Envelope Interactive Preview */}
      <div className="mt-3 relative cursor-pointer group" onClick={handleTryOpenGate}>
        <div className={`relative w-64 sm:w-72 h-44 bg-gradient-to-br from-rose-100 via-rose-50 to-pink-100 rounded-2xl border-2 border-rose-300/80 shadow-2xl shadow-rose-300/50 flex flex-col items-center justify-center p-4 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-rose-400/60 animate-float ${
          answeredLove ? 'ring-4 ring-rose-400/50 animate-pulse-glow' : ''
        }`}>
          {/* Envelope flap aesthetic */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-rose-200/90 to-transparent clip-path-polygon rounded-t-2xl pointer-events-none" />

          {/* Golden/Rose Wax Seal */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-400 border-2 border-amber-300 z-10 transition-transform duration-300 group-hover:scale-110">
            {isUnlocked ? (
              <Mail className="w-8 h-8 fill-white/20 animate-bounce" />
            ) : (
              <Heart className="w-8 h-8 fill-white animate-pulse" />
            )}
          </div>

          <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-rose-700">
            {answeredLove ? (isUnlocked ? 'Thư Đã Mở Khóa ✨' : 'Thư gửi Bà Chã 💌') : 'Chờ em trả lời Chibi 💗'}
          </span>
          <span className="text-[11px] text-slate-500 font-light mt-0.5">
            {!answeredLove ? 'Yêu ơi là yêu trước nha' : isUnlocked ? 'Bấm để đọc thư' : 'Chạm vào để mở thư'}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleTryOpenGate}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium text-base sm:text-lg shadow-xl shadow-rose-400/40 hover:shadow-rose-500/60 transition-all duration-300 flex items-center gap-3 group cursor-pointer active:scale-95"
        >
          {isUnlocked ? (
            <>
              <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>{answeredLove ? 'Đọc thư anh gửi 💌' : 'Trả lời Chibi trước nha 💗'}</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 text-rose-200 group-hover:text-white transition-colors" />
              <span>{answeredLove ? 'Mở thư bí mật 💌' : 'Trả lời Chibi trước nha 💗'}</span>
            </>
          )}
        </button>


      </div>

      {/* Gentle helper caption */}
      <p className="mt-4 text-xs text-slate-400 flex items-center gap-1 font-light">
        <Heart size={12} className="fill-rose-400 text-rose-400" />
        Anh có món quà nho nhỏ hà cơ mà Tình Yêu siu to cho em ❤️ đó nha!
      </p>
    </div>
  );
};
