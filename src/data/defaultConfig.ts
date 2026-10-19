import { WebsiteConfig } from "../types";

// M/D/Y: 1/8/2026 = ngày 8 tháng 1 năm 2026.
// ISO YYYY-MM-DD được dùng để input type="date" hoạt động chính xác.
export const DEFAULT_CONFIG: WebsiteConfig = {
  girlfriendName: "Bà Chã",
  boyfriendName: "Bông Hoa Sữa",
  nickname: "Bà Chã",
  anniversaryDate: "2026-01-08",
  anniversaryHint: "Tháng đầu năm ngày thứ 8 - anh và em vớ nhau ❤️",
  heroSubtitle:
    "Xa nhau một chút thôi, còn thương em thì anh thương hơn mỗi ngày.",
  letterTitle: "20/10 — Gửi Bà Chã Của Anh 💌",
  letterGreeting: "Gửi Em, Tình Yêu Của Anh,",

  letterContent: [
    "Nhân ngày 20/10, anh chúc Bà Chã ❤️ của anh luôn vui vẻ, bình an, cười thật nhiều và ngày càng đáng yêu với anh hơn nữa nha Em! ❤️",

    "Em là niềm vui, là động lực và cũng là chỗ dựa tinh thần giúp anh cố gắng mỗi ngày đó, Chã à! 🥰",

    "Anh biết yêu xa không dễ, có những lúc nhớ nhau mà chẳng thể gặp, đôi khi giận hờn hay im lặng khiến cả hai tủi thân. Anh cũng có lúc vụng về, chưa hiểu Em đủ nhiều.",

    "Anh muốn nghe Em kể nhiều hơn về bản thân, về những chuyện vui buồn hay cả mấy chuyện linh tinh trong ngày. Có gì cứ tâm sự với anh nha, đừng giữ một mình. Anh muốn hai đứa hiểu nhau hơn, để dù không ở cạnh, mình vẫn luôn cảm thấy có nhau. ❤️",

    "Cảm ơn Em vì đã ở bên anh. Mong rằng tụi mình sẽ cùng cố gắng, cùng trưởng thành và sớm có những ngày được ở cạnh nhau, không còn phải nhớ nhau qua màn hình nữa.",

    "20/10 thật trọn vẹn Dợ nha, Tình Yêu Siu To Khủng Lồ của anh! Anh yêu Em nhiều lắm! ❤️",
  ],

  letterSignOff: "Bắp của Em 💗",
  bgImageUrl: "",
  qrCodeUrl: "",
  qrTitle: "Em hú hí với anh một câu nha 💌",
  qrSubtitle: "Tình yêu ơi!",
  giftNote: "Anh chuẩn bị một món quà nhỏ dành cho em. ❤️",
  photos: [], // Thêm ảnh thật sau; không dùng ảnh stock làm kỷ niệm giả.
  vouchers: [],
};
