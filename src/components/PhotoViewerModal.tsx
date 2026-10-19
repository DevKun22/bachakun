import React, { useState } from 'react';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Heart, Sparkles, MessageSquareHeart } from 'lucide-react';
import { PhotoMemory } from '../types';

interface PhotoViewerModalProps {
  photos: PhotoMemory[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photos,
  initialIndex,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [rotation, setRotation] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Sync index when opening
  React.useEffect(() => {
    setCurrentIndex(initialIndex);
    setRotation(0);
    setScale(1);
    setIsFlipped(false);
  }, [initialIndex, isOpen]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setRotation(0);
    setScale(1);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setRotation(0);
    setScale(1);
    setIsFlipped(false);
  };

  const handleRotateLeft = () => setRotation((r) => r - 45);
  const handleRotateRight = () => setRotation((r) => r + 45);
  const handleZoomIn = () => setScale((s) => Math.min(2.5, s + 0.25));
  const handleZoomOut = () => setScale((s) => Math.max(0.75, s - 0.25));
  const handleToggleFlip = () => setIsFlipped((f) => !f);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      {/* Top action bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-20">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs sm:text-sm">
          <Heart size={14} className="fill-rose-500 text-rose-500" />
          <span>Kỷ niệm {currentIndex + 1} / {photos.length}</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-rose-500 text-white transition-colors"
          title="Đóng (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Chevrons */}
      <button
        onClick={handlePrev}
        className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/50 hover:bg-rose-600 text-white backdrop-blur-sm transition-all"
        title="Ảnh trước"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-rose-600 text-white backdrop-blur-sm transition-all"
        title="Ảnh tiếp theo"
      >
        <ChevronRight size={24} />
      </button>

      {/* Main Photo Container with 3D Flip */}
      <div
        className="relative max-w-lg w-full max-h-[80vh] flex flex-col items-center justify-center"
        style={{ perspective: 1200 }}
      >
        <div
          className="w-full transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
          }}
        >
          {/* Front Side: Polaroid Image */}
          <div
            className="bg-white p-4 pb-6 rounded-2xl shadow-2xl border-4 border-rose-100 flex flex-col items-center mx-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
            }}
          >
            <div className="relative overflow-hidden rounded-xl bg-slate-900 w-full aspect-[4/5] max-h-[55vh] flex items-center justify-center">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="mt-4 text-center w-full px-2">
              <p className="font-handwriting text-2xl text-slate-800 font-bold">
                {currentPhoto.caption}
              </p>
              {currentPhoto.date && (
                <p className="text-xs text-rose-500 font-medium mt-1 flex items-center justify-center gap-1">
                  <Sparkles size={12} />
                  {currentPhoto.date}
                </p>
              )}
            </div>
          </div>

          {/* Back Side: Secret Love Note on Vintage Paper */}
          <div
            className="absolute inset-0 bg-amber-50 rounded-2xl shadow-2xl border-4 border-rose-200 p-8 flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-center">
              <span className="text-xs font-semibold tracking-wider text-rose-500 uppercase flex items-center justify-center gap-1">
                <MessageSquareHeart size={14} />
                Mặt sau ảnh kỷ niệm
              </span>
              <h4 className="font-serif-romantic text-xl font-bold text-slate-800 mt-2">
                Lời Thì Thầm Của Anh
              </h4>
            </div>

            <div className="my-auto py-6 px-4 bg-white/70 rounded-xl border border-amber-200/60 shadow-inner">
              <p className="font-handwriting text-2xl text-rose-900 leading-relaxed text-center">
                &ldquo;{currentPhoto.secretNote || 'Em luôn là nụ cười đẹp nhất trong mắt anh!'}&rdquo;
              </p>
            </div>

            <div className="text-center text-xs text-slate-400">
              Nhấn nút lật bên dưới để quay lại ảnh
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white shadow-xl">
        <button
          onClick={handleRotateLeft}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title="Xoay trái"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={handleRotateRight}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title="Xoay phải"
        >
          <RotateCw size={18} />
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title="Thu nhỏ"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-xs px-1 font-mono">{Math.round(scale * 100)}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title="Phóng to"
        >
          <ZoomIn size={18} />
        </button>
        <div className="w-px h-5 bg-white/20" />
        <button
          onClick={handleToggleFlip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-medium transition-colors"
          title="Lật xem lời thì thầm bí mật"
        >
          <MessageSquareHeart size={14} />
          <span>{isFlipped ? 'Xem Ảnh' : 'Lật Thơ Bí Mật'}</span>
        </button>
      </div>
    </div>
  );
};
