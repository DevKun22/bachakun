import confetti from 'canvas-confetti';
/** Dùng chung bảng màu, nhịp bắn tim của màn Thư và Góc kỷ niệm. */
export function shootPhotoHearts(intense = false) {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  confetti({
    particleCount: intense ? 82 : 50,
    spread: intense ? 88 : 70,
    origin: { y: 0.6 },
    colors: ['#f43f5e', '#ec4899', '#fda4af'],
    disableForReducedMotion: true,
  });
}
