import React, { useEffect, useState } from "react";
import { Clock3, Heart } from "lucide-react";

const END = Date.parse("2026-10-21T00:00:00+07:00");

function remaining() {
  const ms = Math.max(0, END - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    expired: ms === 0,
  };
}

export const MemoryTimeline: React.FC<{ archived?: boolean }> = ({
  archived = false,
}) => {
  const [time, setTime] = useState(remaining);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(remaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (archived || time.expired) {
    return (
      <div className="mx-auto my-5 max-w-xl rounded-3xl border border-rose-200 bg-white/90 px-5 py-5 text-center shadow-lg shadow-rose-100">
        <Heart size={22} className="mx-auto mb-2 text-rose-500" />
        <p className="font-bold text-rose-600">
          Chibi cất vào hộp kỷ niệm rồi Dợ ơi! 💌
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Kỷ niệm vẫn ở đây. Hẹn anh và Em ở những ngày vui sắp tới nha! ❤️
        </p>
      </div>
    );
  }

  const units = [
    { label: "NGÀY", value: time.days },
    { label: "GIỜ", value: time.hours },
    { label: "PHÚT", value: time.minutes },
    { label: "GIÂY", value: time.seconds },
  ];

  return (
    <div
      className="mx-auto mt-4 mb-5 max-w-xl rounded-3xl border border-rose-200 bg-white/90 px-4 py-4 sm:px-6 shadow-lg shadow-rose-100 backdrop-blur-sm text-center"
      aria-label="Đếm ngược đến hết ngày 20 tháng 10 năm 2026"
    >
      <p className="flex items-center justify-center gap-2 text-rose-600 font-semibold text-sm mb-3">
        <Clock3 size={17} />
      </p>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-2xl border border-rose-100 bg-rose-50 px-1 py-2.5"
          >
            <div className="text-xl sm:text-2xl font-serif-romantic font-bold text-rose-600 tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-500">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
        Chibi sẽ cất kỷ niệm của anh và Bà Chã vào hộp nhỏ này. 
        Cô Chủ chụp lại để đòi quà Ông Chã nhé.
        Chibi chúc
        Cô Chủ và anh Bắp luôn yêu thương nhau, rồi còn nhiều chuyện vui để kể tiếp nha! 💗
      </p>
    </div>
  );
};
