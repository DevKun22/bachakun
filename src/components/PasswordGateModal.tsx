import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Lock, Heart, KeyRound, Sparkles, HelpCircle, ArrowRight, Smile } from 'lucide-react';
import { WebsiteConfig } from '../types';

interface PasswordGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: WebsiteConfig;
}

export const PasswordGateModal: React.FC<PasswordGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  config,
}) => {
  const [inputDate, setInputDate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  if (!isOpen) return null;

  // Ngày kỷ niệm chuẩn ISO; chỉ hiển thị kiểu Việt Nam dd/MM/yyyy.
  const [targetYear, targetMonth, targetDay] = config.anniversaryDate.split('-').map(Number);
  const formattedTargetDate = `${String(targetDay).padStart(2, '0')}/${String(targetMonth).padStart(2, '0')}/${targetYear}`;

  const checkPassword = () => {
    if (!inputDate.trim()) {
      setErrorMsg('Em nhớ điền ngày kỷ niệm của tụi mình nha!');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // input type=date luôn trả về YYYY-MM-DD, không phụ thuộc locale.
    const parts = inputDate.trim().split('/').map(Number);
    const isMatch = parts.length === 3 && parts[0] === targetDay && parts[1] === targetMonth && parts[2] === targetYear;

    if (isMatch) {
      handleUnlockSuccess();
    } else {
      setErrorMsg('Suýt đúng rồi! Chibi cho Em xem gợi ý nha 💕');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);


    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#fbbf24'],
    });

    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  const handleBypass = () => {
    setInputDate(formattedTargetDate);
    setErrorMsg('');
    setShowHint(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-md bg-gradient-to-b from-white via-rose-50/50 to-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-rose-200/90 transition-all ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Decorative close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm p-1 rounded-full hover:bg-rose-100"
        >
          ✕
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner ${
              isUnlocked
                ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white scale-110 shadow-rose-300'
                : 'bg-rose-100 text-rose-500'
            }`}
          >
            {isUnlocked ? (
              <Heart className="w-8 h-8 fill-white animate-pulse" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Modal Titles */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-100/80 rounded-full mb-2">
            Mật mã của hai đứa 🔐
          </span>
          <h3 className="text-xl sm:text-2xl font-serif-romantic font-bold text-slate-800">
            Ngày Hai Ta Var Nhao
          </h3>
          <p className="text-sm text-slate-600 mt-1.5 font-light">
            Em còn nhớ ngày tụi mình vớ nhau hơm?
          </p>
        </div>

        {/* Date Input / Form */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={inputDate}
              onChange={(e) => {
                setInputDate(e.target.value);
                setErrorMsg('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') checkPassword();
              }}
              className="w-full px-4 py-3 text-center text-lg font-medium tracking-widest text-slate-800 bg-white border-2 border-rose-200 rounded-2xl focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-200/50 shadow-sm"
              placeholder="dd/MM/yyyy"
            />
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 pointer-events-none" />
          </div>

          {/* Quick text input fallback */}
          <div className="text-center">
            <span className="text-xs text-slate-400">
              Ngày / Tháng / Năm (Việt Nam)
            </span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 text-xs sm:text-sm text-rose-700 bg-rose-100/90 rounded-xl border border-rose-300 text-center flex items-center justify-center gap-1.5 animate-pulse">
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              {errorMsg}
            </div>
          )}

          {/* Unlocked Message */}
          {isUnlocked && (
            <div className="p-3 text-sm text-emerald-800 bg-emerald-100/90 rounded-xl border border-emerald-300 text-center font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
              Yêu quá! Mở thư cho bà chã xem nè...
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={checkPassword}
            disabled={isUnlocked}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-medium shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-400/50 transition-all flex items-center justify-center gap-2 text-base active:scale-98 cursor-pointer"
          >
            <span>Mở thư 💌</span>
            <ArrowRight size={18} />
          </button>

          {/* Hint & Sweet Bypass */}
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-rose-100 text-xs">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 py-1"
            >
              <HelpCircle size={14} />
              {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý bí mật 💡'}
            </button>

            {showHint && (
              <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-3 text-slate-700 text-center leading-relaxed animate-fade-in w-full">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-700 mb-1">
                  <span>💡 Gợi ý bí mật:</span>
                </div>
                <p className="italic text-rose-800">
                  &ldquo;{config.anniversaryHint}&rdquo;
                </p>
                <div className="mt-2 text-[11px] text-slate-500">
                  (Theo ngày/tháng/năm đó nha!)
                </div>
              </div>
            )}

            <button
              onClick={handleBypass}
              className="text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 text-[11px] mt-1 cursor-pointer"
            >
              <Smile size={13} className="text-amber-500" />
              <span>Chibi cứu trợ: điền ngày giúp Em 😆</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
