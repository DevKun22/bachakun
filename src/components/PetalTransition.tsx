import React from 'react';
import { Heart } from 'lucide-react';

export function PetalTransition() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-rose-50/95 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="absolute inset-0 memory-transition-glow" />
      {Array.from({ length: 24 }, (_, i) => (
        <span key={i} className="memory-transition-petal" style={{ left: `${(i * 43 + 13) % 100}%`, animationDelay: `${(i % 7) * .10}s`, animationDuration: `${1.3 + (i % 5) * .16}s` }} aria-hidden="true">
          {i % 4 === 0 ? '💗' : '🌸'}
        </span>
      ))}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center memory-reveal">
        <Heart className="fill-rose-300 text-rose-500" size={44} />
        <p className="font-serif-romantic text-2xl text-rose-600">Chibi mở hộp kỷ niệm nha... 💌</p>
      </div>
    </div>
  );
}
