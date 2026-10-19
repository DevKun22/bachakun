export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
  date?: string;
  rotation?: number; // degrees for polaroid tilt
  secretNote?: string; // message on back of polaroid
}

export interface LoveVoucher {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  redeemed?: boolean;
}

export interface LoveReply {
  id: string;
  senderName: string;
  message: string;
  mood: string;
  timestamp: string;
  photoUrl?: string;
}

export interface WebsiteConfig {
  girlfriendName: string;
  boyfriendName: string;
  nickname: string;
  anniversaryDate: string; // YYYY-MM-DD
  anniversaryHint: string;
  heroSubtitle: string;
  letterTitle: string;
  letterGreeting: string;
  letterContent: string[];
  letterSignOff: string;
  bgImageUrl: string;
  qrCodeUrl: string;
  qrTitle: string;
  qrSubtitle: string;
  giftNote: string;
  photos: PhotoMemory[];
  vouchers: LoveVoucher[];
}
