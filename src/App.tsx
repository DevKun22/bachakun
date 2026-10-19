import React, { useState } from 'react';
import { FallingParticlesCanvas } from './components/FallingParticlesCanvas';
import { IntroHero } from './components/IntroHero';
import { PasswordGateModal } from './components/PasswordGateModal';
import { LoveLetterSection } from './components/LoveLetterSection';
import { GiftAndReplySection } from './components/GiftAndReplySection';
import { PhotoViewerModal } from './components/PhotoViewerModal';
import { DEFAULT_CONFIG } from './data/defaultConfig';
import { WebsiteConfig } from './types';
import { Heart } from 'lucide-react';
import { recordMoment } from './lib/moments';
import { MemoryTimeline } from './components/MemoryTimeline';
import { EndingScreen } from './components/EndingScreen';

export type ScreenStep = 'intro' | 'letter' | 'gift' | 'ending';

export default function App() {
  const config: WebsiteConfig = DEFAULT_CONFIG;

  const [endingImageUrl, setEndingImageUrl] = useState<string | null>(() => {
    return localStorage.getItem('bap_kunn_ending_image_url');
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('bap_kunn_2026_unlocked') === 'true';
  });

  // Step-based screen navigation - each screen hides and next screen shows
  const [currentStep, setCurrentStep] = useState<ScreenStep>(() => {
    const wasUnlocked = sessionStorage.getItem('bap_kunn_2026_unlocked') === 'true';
    if (localStorage.getItem('bap_kunn_completed_20102026') === 'true') return 'ending';
    return wasUnlocked ? 'letter' : 'intro';
  });

  // 20/10/2026 runs through 23:59:59 in Viet Nam (UTC+7).
  const [isArchived, setIsArchived] = React.useState(() => Date.now() >= Date.parse('2026-10-21T00:00:00+07:00'));
  React.useEffect(() => {
    const timer = window.setInterval(() => setIsArchived(Date.now() >= Date.parse('2026-10-21T00:00:00+07:00')), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const handleOpenGate = () => {
    if (sessionStorage.getItem('bap_kunn_love_yes') !== 'true') return;
    if (isUnlocked) {
      void recordMoment('letter_opened');
      setCurrentStep('letter');
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    void recordMoment('letter_unlocked');
    setIsPasswordModalOpen(false);
    sessionStorage.setItem('bap_kunn_2026_unlocked', 'true');
    // Hide screen 1 and smoothly transition to screen 2 (Letter)
    setCurrentStep('letter');
    void recordMoment('letter_opened');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsPhotoModalOpen(true);
  };

  const handleOpenGift = () => {
    // Hide screen 2 and transition to screen 3 (Gift)
    setCurrentStep('gift');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="relative min-h-screen bg-gradient-to-b from-rose-50/90 via-[#fff5f6] to-pink-50 text-slate-800 font-sans-vietnam overflow-x-hidden flex flex-col justify-between">
      {/* 60fps Petal & Heart falling particle background with interactive cursor trail */}
      <FallingParticlesCanvas />



      {isArchived ? (
        <main className="relative z-20 flex-1 flex items-center justify-center p-6">
          <MemoryTimeline archived />
        </main>
      ) : (
      <>
      {/* Screen Container: Only active screen is shown, previous screen is hidden */}
      <main className="relative z-20 flex-1 flex flex-col justify-center pt-4 sm:pt-6">
        {/* SCREEN 1: Mở Màn (Intro Screen) */}
        {currentStep === 'intro' && (
          <div className="animate-fade-in w-full">
            <IntroHero
              config={config}
              onOpenGate={handleOpenGate}
              isUnlocked={isUnlocked}
            />
          </div>
        )}

        {/* SCREEN 2: Bức Thư Tình & Album Kỷ Niệm Nền Nổi Bay Lên */}
        {currentStep === 'letter' && (
          <div className="animate-fade-in w-full">
            <LoveLetterSection
              config={config}
              onOpenPhoto={handleOpenPhoto}
              onOpenGift={handleOpenGift}
              onGoBack={() => {}}
            />
          </div>
        )}

        {currentStep === 'ending' && <EndingScreen imageUrl={endingImageUrl} />}

        {/* SCREEN 3: Hộp Quà 20/10 & Phản Hồi Lời Nhắn */}
        {currentStep === 'gift' && (
          <div className="animate-fade-in w-full">
            <GiftAndReplySection
              config={config}
              isOpen={true}
              onGoBackToLetter={() => {}}
              onSendSuccess={(imageUrl) => {
                setEndingImageUrl(imageUrl);
                if (imageUrl) {
                  localStorage.setItem('bap_kunn_ending_image_url', imageUrl);
                } else {
                  localStorage.removeItem('bap_kunn_ending_image_url');
                }
                localStorage.setItem('bap_kunn_completed_20102026', 'true');
                setCurrentStep('ending');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </main>

      </>
      )}
      {/* Footer */}
      <footer className="relative z-20 py-4 px-4 text-center border-t border-rose-200/60 bg-white/40 backdrop-blur-xs text-xs text-slate-500">
        <div className="flex items-center justify-center gap-1.5 text-rose-600 font-medium mb-0.5">
          <Heart size={13} className="fill-rose-500 text-rose-500" />
          <span>Chúc mừng ngày Phụ Nữ Việt Nam 20/10</span>
          <Heart size={13} className="fill-rose-500 text-rose-500" />
        </div>
        <p className="font-light text-[11px]">
          Anh dành tặng {config.girlfriendName}
        </p>
      </footer>

      {/* Password Gate Modal */}
      <PasswordGateModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handleUnlockSuccess}
        config={config}
      />

      {/* 3D Interactive Photo Viewer Modal */}
      <PhotoViewerModal
        photos={config.photos}
        initialIndex={selectedPhotoIndex}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

    </div>
  );
}
