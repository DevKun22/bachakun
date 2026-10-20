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
import { MemoryArchive } from './components/MemoryArchive';
import { DISPLAY_SETTINGS } from './data/displaySettings';
import { EndingScreen } from './components/EndingScreen';
import { PetalTransition } from './components/PetalTransition';
import { MemoryLogin } from './components/MemoryLogin';
import { MemoryRoleGate } from './components/MemoryRoleGate';
type MemoryRole = 'anh' | 'em';

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
  const [isArchived, setIsArchived] = React.useState(() => Date.now() >= Date.parse(DISPLAY_SETTINGS.giftEndAt));
  const wasArchived = React.useRef(isArchived);
  React.useEffect(() => {
    const timer = window.setInterval(() => setIsArchived(Date.now() >= Date.parse(DISPLAY_SETTINGS.giftEndAt)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const showMemories = DISPLAY_SETTINGS.mode === 'memories' || (DISPLAY_SETTINGS.mode === 'auto' && isArchived);
  const [transitioning, setTransitioning] = React.useState(false);
  const [enteringMemories, setEnteringMemories] = React.useState(false);
  const hasPassedGiftEnd = Date.now() >= Date.parse(DISPLAY_SETTINGS.giftEndAt);
  const beginArchiveTransition = React.useCallback(() => {
    if (DISPLAY_SETTINGS.mode === 'gift' || hasPassedGiftEnd || transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => { setEnteringMemories(true); setTransitioning(false); window.scrollTo({ top: 0, behavior: 'instant' }); }, 1600);
  }, [hasPassedGiftEnd, transitioning]);
  const archiveVisible = showMemories || enteringMemories;
  const [authState, setAuthState] = React.useState<'checking' | 'locked' | 'unlocked'>('checking');
  const [memoryRole, setMemoryRole] = React.useState<MemoryRole | null>(null);
  const [roleChecking, setRoleChecking] = React.useState(true);
  const [logoutStatus, setLogoutStatus] = React.useState<'idle' | 'locking' | 'success'>('idle');
  const [logoutError, setLogoutError] = React.useState('');
  React.useEffect(() => {
    if (!archiveVisible) return;
    let active = true;
    fetch('/api/memory-auth', { credentials: 'same-origin', cache: 'no-store' })
      .then(r => r.ok ? r.json() : { authenticated: false })
      .then(async v => { if (!active) return; setAuthState(v.authenticated ? 'unlocked' : 'locked'); if(v.authenticated){try { const r=await fetch('/api/memory-role',{credentials:'same-origin',cache:'no-store'}); const d=await r.json(); if(active)setMemoryRole(d.role==='anh'||d.role==='em'?d.role:null); }catch{if(active)setMemoryRole(null);} } if(active)setRoleChecking(false); })
      .catch(() => { if(active){setAuthState('locked');setRoleChecking(false);} });
    return () => { active = false; };
  }, [archiveVisible]);
  const logoutMemory = async () => {
    if (logoutStatus !== 'idle') return;
    setLogoutStatus('locking');
    setLogoutError('');
    try {
      const response = await fetch('/api/memory-auth', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('Đăng xuất thất bại');
      setLogoutStatus('success');
      // Cho Chibi kịp báo đã khóa rồi mới trở về màn nhập mật khẩu.
      window.setTimeout(() => {
        setAuthState('locked');
        setMemoryRole(null);
        sessionStorage.removeItem('bk_archive_visit_v66');
        setLogoutStatus('idle');
      }, 650);
    } catch {
      setLogoutError('Chibi chưa khóa được, thử lại nha 🥺');
      setLogoutStatus('idle');
    }
  };
  React.useEffect(() => {
    if (!wasArchived.current && isArchived && currentStep === 'ending' && DISPLAY_SETTINGS.mode === 'auto') {
      setTransitioning(true);
      const timeout = window.setTimeout(() => setTransitioning(false), 1600);
      wasArchived.current = true;
      return () => window.clearTimeout(timeout);
    }
    wasArchived.current = isArchived;
  }, [isArchived, currentStep]);

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



      {transitioning && <PetalTransition />}
      {archiveVisible ? (
        authState === 'checking' ? <main className="relative z-20 flex min-h-screen items-center justify-center text-rose-500">Chibi đang kiểm tra chìa khóa... 💌</main> : authState === 'locked' ? <MemoryLogin onSuccess={() => {setMemoryRole(null);sessionStorage.removeItem('bk_archive_visit_v66');setAuthState('unlocked');setRoleChecking(false);}} /> : roleChecking ? <main className="relative z-20 min-h-screen flex items-center justify-center">Chibi đang kiểm tra sổ... 💌</main> : !memoryRole ? <MemoryRoleGate onSelected={setMemoryRole}/> : (
          <div className="relative z-20">
            <div className="absolute right-4 top-2 z-30 flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={logoutMemory}
                disabled={logoutStatus !== 'idle'}
                aria-busy={logoutStatus === 'locking'}
                className="flex items-center gap-2 rounded-full border border-rose-200 bg-white/95 px-4 py-2 text-xs font-semibold text-rose-600 shadow-sm disabled:cursor-wait disabled:opacity-75"
              >
                {logoutStatus === 'locking' ? (
                  <><span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" /> Chibi đang cất chìa khóa...</>
                ) : logoutStatus === 'success' ? (
                  '💗 Chibi khóa cửa rồi nha!'
                ) : (
                  '🔒 Khóa góc nhỏ'
                )}
              </button>
              {logoutError && <p role="alert" className="max-w-xs rounded-xl bg-white/95 px-3 py-2 text-xs text-red-600 shadow-sm">{logoutError}</p>}
            </div>
            <MemoryArchive role={memoryRole} />
          </div>
        )
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

        {currentStep === 'ending' && <EndingScreen imageUrl={endingImageUrl} onOpenMemories={DISPLAY_SETTINGS.showMemoriesButtonInEnding ? beginArchiveTransition : undefined} />}

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
      {!archiveVisible && <footer className="relative z-20 py-4 px-4 text-center border-t border-rose-200/60 bg-white/40 backdrop-blur-xs text-xs text-slate-500">
        <div className="flex items-center justify-center gap-1.5 text-rose-600 font-medium mb-0.5">
          <Heart size={13} className="fill-rose-500 text-rose-500" />
          <span>Chúc mừng ngày Phụ Nữ Việt Nam 20/10</span>
          <Heart size={13} className="fill-rose-500 text-rose-500" />
        </div>
        <p className="font-light text-[11px]">
          Anh dành tặng {config.girlfriendName}
        </p>
      </footer>}

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
