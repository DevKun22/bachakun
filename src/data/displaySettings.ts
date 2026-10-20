/**
 * Chỉnh tại đây rồi deploy lại Vercel để thay đổi giao diện.
 * 'auto': trước 21/10/2026 là quà, từ đó trở đi là kỷ niệm (giờ VN).
 * 'gift': luôn hiện luồng mở quà; 'memories': luôn hiện góc kỷ niệm.
 */
export const DISPLAY_SETTINGS = {
  mode: 'auto' as 'auto' | 'gift' | 'memories',
  showMemoriesButtonInEnding: false, // bật để test, tắt khi deploy Production
  giftEndAt: '2026-10-21T00:00:00+07:00',
  loveStartAt: '2026-01-08T00:00:00+07:00',
  memories: {
    showLoveClock: true,
    showMessage: true,
    showPhoto: true,
    showPromise: true,
    showChibiNote: true,
    heading: 'Góc nhỏ của Anh & Bà Chã 💗',
    messageHeading: 'Lời nhắn Em gửi anh 💌',
    photoCaption: 'Hoa có chủ rồi nha, anh Bắp nhận trông coi! 🌷❤️',
    chibiNote: 'Chibi cất kỷ niệm đầu tiên cho hai đứa rồi nè! 💌',
    promise: 'Hẹn Em ở những kỷ niệm tiếp theo. Tụi mình sẽ cùng lưu chúng ở đây nha! ❤️',
  },
} as const;
