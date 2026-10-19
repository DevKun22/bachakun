import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Heart, Gift } from "lucide-react";
import { MemoryTimeline } from "./MemoryTimeline";
interface EndingScreenProps {
  imageUrl: string | null;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ imageUrl }) => {
  useEffect(() => {
    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.55 },
      colors: ["#fb7185", "#f43f5e", "#fbbf24"],
    });
  }, []);
  return (
    <section className="relative max-w-xl mx-auto text-center px-4 py-16 animate-fade-in">
      <div className="mx-auto mb-5 w-24 h-24 flex items-center justify-center rounded-full bg-rose-100 text-rose-500 shadow-xl animate-bounce">
        <Gift size={52} />
      </div>
      <h1 className="text-3xl font-serif-romantic font-bold text-rose-600 mb-4">
        Chibi nhận được thư rồi Cô Chủ ơi! 💌
      </h1>
      
      {imageUrl && (
        <figure className="mx-auto my-8 w-56 max-w-full rotate-[-3deg] rounded-2xl border border-rose-200 bg-white p-3 pb-5 shadow-xl">
          <img
            src={imageUrl}
            alt="Tấm ảnh Bà Chã gửi anh"
            className="aspect-[3/4] w-full rounded-xl object-cover"
          />
          <figcaption className="mt-4 text-center text-sm font-semibold text-rose-600">
            Hoa có chủ rồi nha, anh Bắp nhận trông coi! 🌷❤️
          </figcaption>
        </figure>
      )}
      {!imageUrl && (
        <p className="mx-auto mt-4 max-w-sm text-sm text-rose-600">
          Chibi cất lời thương của Bà Chã vào hộp kỷ niệm rồi nè! 💌
        </p>
      )}
      <MemoryTimeline />
      <p className="text-sm text-rose-600 mt-6 flex items-center justify-center gap-2">
        <Heart size={16} /> Anh yêu Em! <Heart size={16} />
      </p>
    </section>
  );
};
