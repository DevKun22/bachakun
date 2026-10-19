import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Heart,
  Sparkles,
  Eye,
  Feather,
  CheckCircle2,
  CalendarHeart,
  ArrowLeft,
  ArrowRight,
  Images,
  Flame,
  Gift,
} from "lucide-react";
import { WebsiteConfig } from "../types";

interface LoveLetterSectionProps {
  config: WebsiteConfig;
  onOpenPhoto: (index: number) => void;
  onOpenGift: () => void;
  onGoBack: () => void;
}

export const LoveLetterSection: React.FC<LoveLetterSectionProps> = ({
  config,
  onOpenPhoto,
  onOpenGift,
  onGoBack,
}) => {
  const [displayedParagraphs, setDisplayedParagraphs] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [bloomKey, setBloomKey] = useState<number>(0);
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate live days/hours/minutes/seconds of love
  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(config.anniversaryDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.anniversaryDate]);

  // Trigger heart burst celebration when letter opens
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#f43f5e", "#fb7185", "#ec4899", "#fda4af", "#fbbf24"],
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [bloomKey]);

  // Stagger paragraph display for an organic, emotional reading pace
  useEffect(() => {
    if (!isTyping) {
      setDisplayedParagraphs(config.letterContent.length);
      return;
    }

    let current = 0;
    const timer = setInterval(() => {
      current++;
      setDisplayedParagraphs(current);
      if (current >= config.letterContent.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 1800);

    return () => clearInterval(timer);
  }, [config.letterContent, isTyping]);

  // Re-trigger the heart rising animation
  const handleTriggerHeartBurst = () => {
    setBloomKey((prev) => prev + 1);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f43f5e", "#ec4899", "#fda4af"],
    });
  };

  // Heart formation coordinates around the letter container
  // Shapes an iconic heart curvature: top lobes -> outer curve -> inward bottom
  const heartFormation = [
    {
      top: "-25px",
      left: "-20px",
      rot: "-12deg",
      anim: "animate-memory-1",
      delay: 0.15,
    },
    {
      top: "-25px",
      right: "-20px",
      rot: "12deg",
      anim: "animate-memory-2",
      delay: 0.3,
    },
    {
      top: "30%",
      left: "-80px",
      rot: "-8deg",
      anim: "animate-memory-3",
      delay: 0.45,
    },
    {
      top: "30%",
      right: "-80px",
      rot: "8deg",
      anim: "animate-memory-1",
      delay: 0.6,
    },
    {
      top: "65%",
      left: "-40px",
      rot: "6deg",
      anim: "animate-memory-2",
      delay: 0.75,
    },
    {
      top: "65%",
      right: "-40px",
      rot: "-6deg",
      anim: "animate-memory-3",
      delay: 0.9,
    },
  ];

  return (
    <section
      id="love-letter-section"
      className="relative min-h-[92vh] flex flex-col justify-between py-6 sm:py-10 px-3 sm:px-6 max-w-6xl mx-auto z-20 animate-fade-in"
    >
      {/* Top Header & Days in love counter */}
      <div>
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold mb-2 shadow-sm border border-rose-200">
            <Feather size={14} />
            Thư Cho Bà Chã 💌
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif-romantic font-bold text-slate-800">
            {config.letterTitle}
          </h2>
          <p className="mt-1 text-rose-600 font-handwriting text-lg sm:text-2xl">
            Một lá thư nhỏ, gửi người anh thương 💗
          </p>
        </div>

        {/* Days in Love Counter */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/90 backdrop-blur-md px-5 sm:px-8 py-3 rounded-3xl border border-rose-200/90 shadow-xl shadow-rose-200/30 max-w-lg w-full text-center">
            <div className="flex items-center justify-center gap-2 text-rose-600 text-xs sm:text-sm font-medium mb-2">
              <CalendarHeart
                size={16}
                className="text-rose-500 animate-pulse"
              />
              <span>Thời gian 💗</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-slate-800">
              <div className="bg-rose-50/90 rounded-2xl p-2 border border-rose-100 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold font-serif-romantic text-rose-600">
                  {timeTogether.days}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  Ngày
                </span>
              </div>

              <div className="bg-rose-50/90 rounded-2xl p-2 border border-rose-100 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold font-serif-romantic text-rose-600">
                  {timeTogether.hours}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  Giờ
                </span>
              </div>

              <div className="bg-rose-50/90 rounded-2xl p-2 border border-rose-100 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold font-serif-romantic text-rose-600">
                  {timeTogether.minutes}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  Phút
                </span>
              </div>

              <div className="bg-rose-50/90 rounded-2xl p-2 border border-rose-100 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold font-serif-romantic text-rose-600">
                  {timeTogether.seconds}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  Giây
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Letter Container with Heart Formation of Photos Blooming Up */}
      <div className="relative my-auto max-w-3xl mx-auto w-full">
        {/* Heart-Rising Photos Constellation around the letter */}
        <div
          key={bloomKey}
          className="absolute inset-0 pointer-events-none -z-1 overflow-visible"
        >
          {config.photos.map((photo, index) => {
            const pos = heartFormation[index % heartFormation.length];
            return (
              <div
                key={`${bloomKey}-${photo.id || index}`}
                onClick={() => onOpenPhoto(index)}
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: (pos as any).right,
                  ["--rot" as any]: pos.rot,
                  animationDelay: `${pos.delay}s`,
                }}
                className={`hidden lg:block absolute pointer-events-auto cursor-pointer group w-36 xl:w-44 bg-white p-2 pb-4 rounded-2xl shadow-xl hover:shadow-2xl border-2 border-rose-200 transition-all duration-300 hover:scale-115 hover:z-40 hover:rotate-0 hover:border-rose-400 animate-heart-bloom`}
                title="Chạm vào ảnh để phóng to & lật xem lời nhắn bí mật"
              >
                {/* Cute Floating Heart Badge */}
                <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md animate-pulse z-20">
                  <Heart size={12} className="fill-white" />
                </div>

                {/* Washi tape */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-rose-200/90 backdrop-blur-sm border-l border-r border-rose-300 rounded-xs pointer-events-none" />

                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-rose-50 relative">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Hover overlay icon */}
                  <div className="absolute inset-0 bg-rose-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-medium">
                    <Eye size={16} />
                    <span>Xem ảnh</span>
                  </div>
                </div>

                <p className="mt-1.5 text-[11px] font-handwriting font-bold text-slate-700 truncate text-center px-1">
                  {photo.caption}
                </p>
              </div>
            );
          })}
        </div>

        {/* Vintage Parchment Love Letter Paper with Her Translucent Photo Background */}
        <div className="relative bg-[#fffdfa] rounded-3xl p-6 sm:p-9 md:p-11 shadow-2xl border-2 border-rose-200/90 overflow-hidden">
          {/* Subtle Translucent Photo Background */}
          <div
            className="absolute inset-0 opacity-[0.07] bg-cover bg-center pointer-events-none mix-blend-multiply"
            style={{ backgroundImage: `url(${config.bgImageUrl})` }}
          />

          {/* Letter watermark / ornate corners */}
          <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-rose-300/60 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-rose-300/60 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-rose-300/60 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-rose-300/60 rounded-br-xl pointer-events-none" />

          {/* Top action toggles */}
          <div className="absolute top-4 right-6 flex items-center gap-2">
            <button
              onClick={handleTriggerHeartBurst}
              className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
              title="Bắn tim cho ảnh bay lên"
            >
              <Heart
                size={12}
                className="fill-rose-500 text-rose-500 animate-bounce"
              />
              <span>Bắn Tim Ảnh</span>
            </button>

            {isTyping && (
              <button
                onClick={() => setIsTyping(false)}
                className="text-xs text-slate-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 size={12} />
                <span>Hiện hết</span>
              </button>
            )}
          </div>

          {/* Greeting */}
          <div className="mb-4">
            <p className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-800">
              {config.letterGreeting}
            </p>
            <div className="w-16 h-0.5 bg-rose-300 mt-2" />
          </div>

          {/* Letter Paragraphs */}
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base md:text-lg font-sans-vietnam relative z-10 max-h-[42vh] overflow-y-auto pr-2">
            {config.letterContent
              .slice(0, displayedParagraphs)
              .map((paragraph, idx) => (
                <p
                  key={idx}
                  className="animate-fade-in transition-all text-justify indent-6 first-letter:text-xl sm:first-letter:text-2xl first-letter:font-bold first-letter:text-rose-600 first-letter:mr-0.5"
                >
                  {paragraph}
                </p>
              ))}

            {isTyping && displayedParagraphs < config.letterContent.length && (
              <div className="flex items-center gap-2 text-rose-400 text-xs sm:text-sm italic">
                <Heart size={14} className="animate-ping fill-rose-400" />
                <span>Tình yêu đang soạn thư... 💌</span>
              </div>
            )}
          </div>

          {/* Sign-off */}
          <div className="mt-5 sm:mt-7 text-right relative z-10 border-t border-rose-100 pt-3">
            <p className="font-handwriting text-2xl sm:text-3xl text-rose-700 font-semibold">
              {config.letterSignOff}
            </p>
            <p className="font-serif-romantic font-bold text-base sm:text-lg text-slate-800 mt-0.5">
              {config.boyfriendName} ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Screen Navigation Buttons - No scrolling needed */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto w-full pt-3 border-t border-rose-200/60">
        <button
          onClick={onOpenGift}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-300 hover:shadow-rose-400 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer order-1 sm:order-2 animate-pulse"
        >
          <span>Nhắn anh một chút nha 💌</span>
          <Gift size={18} className="text-amber-300 animate-bounce" />
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};
