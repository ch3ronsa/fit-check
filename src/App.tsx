import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import FrameEditor from './components/FrameEditor';
import HypeOverlay from './components/HypeOverlay';
import BottomNav from './components/BottomNav';
import OnboardingModal from './components/OnboardingModal';
import FilterControls from './components/FilterControls';
import Header from './components/Header';
import IdentityToggle from './components/IdentityToggle';
import ActionButtons from './components/ActionButtons';
import { useFilters } from './hooks/useFilters';
import { useUserIdentity } from './hooks/useUserIdentity';
import { useTopContacts, FarcasterContact } from './hooks/useTopContacts';
import { useShare } from './hooks/useShare';
import { useMint } from './hooks/useMint';
import { handleDownload } from './hooks/useDownload';
import Profile from './pages/Profile';
import HowToUse from './pages/HowToUse';
import FrensGenerator from './pages/FrensGenerator';
import FrameMarketplace from './pages/FrameMarketplace';
import CreateFrame from './pages/CreateFrame';
import { updateLastActivity, shouldSendStreakReminder, showBrowserNotification, requestBrowserNotificationPermission } from './lib/notifications';
import { FRAMES, FrameOption } from './data/frames';
import { useCommunityFrames } from './hooks/useCommunityFrames';
import sdk from '@farcaster/frame-sdk';

function Studio() {
  const identity = useUserIdentity();
  const navigate = useNavigate();
  const [selectedFrame, setSelectedFrame] = useState<FrameOption>(FRAMES[1]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showHype, setShowHype] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalMessage, setFinalMessage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<FarcasterContact[]>([]);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('fitcheck_onboarding_seen');
  });

  const handleCloseOnboarding = () => {
    localStorage.setItem('fitcheck_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const { activeFilter, applyFilter, getFilterStyle } = useFilters();
  const { contacts: topContacts } = useTopContacts();
  const { isUploading, handleShare } = useShare();
  const { isMinting, handleMint } = useMint();
  const { frames: communityFrames } = useCommunityFrames();

  // Merge OG frames with installed community frames
  const installedIds: Set<string> = (() => {
    try {
      const saved = localStorage.getItem('fitcheck_installed_frames');
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    } catch {
      return new Set<string>();
    }
  })();

  const installedCommunityFrames: FrameOption[] = communityFrames
    .filter(f => installedIds.has(f.id))
    .map(f => ({ id: f.id, path: f.url, name: f.name }));

  const allFrames = [...FRAMES, ...installedCommunityFrames];

  useEffect(() => {
    const initializeFrame = async () => {
      try {
        sdk.actions.ready();
        const context = await sdk.context;
        if (context) {
          try {
            await sdk.actions.signIn({ nonce: crypto.randomUUID() });
          } catch {
            // Auto sign-in not available or user declined
          }
        }
      } catch {
        // Not in frame context
      }
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      initializeFrame();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkStreakReminder = async () => {
      await requestBrowserNotificationPermission();
      if (shouldSendStreakReminder()) {
        showBrowserNotification('streak_reminder');
        localStorage.setItem('fitcheck_last_streak_reminder', Date.now().toString());
      }
    };
    checkStreakReminder();
  }, []);

  const handlePhotoUpload = (file: File) => {
    setPhoto(file);
    setShowHype(false);
    setFinalScore(null);
    setFinalMessage('');
  };

  const handleFinalize = () => {
    if (!photo) return;
    setShowHype(true);
  };

  const handleHypeComplete = useCallback((score: number, message: string) => {
    setFinalScore(score);
    setFinalMessage(message);
    updateLastActivity();
  }, []);

  const onShare = () => {
    if (finalScore) {
      handleShare(finalScore, finalMessage, selectedContacts);
    }
  };

  const onMint = () => {
    if (finalScore) {
      // Pass frame creator address for revenue sharing (community frames only)
      const frameCreator = communityFrames.find(f => f.id === selectedFrame.id);
      handleMint(finalScore, finalMessage, {
        frameCreatorAddress: frameCreator?.creator.address,
      });
    }
  };

  const handleToggleContact = (contact: FarcasterContact) => {
    setSelectedContacts(prev =>
      prev.some(c => c.fid === contact.fid)
        ? prev.filter(c => c.fid !== contact.fid)
        : [...prev, contact]
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans pb-20">
      <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />

      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onLogoClick={() => navigate('/')}
        identityDisplayName={identity?.displayName}
      />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Frame Selector */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-4 w-max">
            {allFrames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame)}
                className={`relative w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${selectedFrame.id === frame.id ? 'border-base-blue shadow-[0_0_15px_#0052FF]' : 'border-gray-700 hover:border-gray-500'
                  }`}
              >
                {frame.path ? (
                  <img src={frame.path} alt={frame.name} className="w-full h-full object-contain bg-gray-900" />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-400 text-xs font-bold">
                    NONE
                  </div>
                )}
                {selectedFrame.id === frame.id && (
                  <div className="absolute inset-0 bg-base-blue/20" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6">
          <FilterControls activeFilter={activeFilter} onFilterChange={applyFilter} />
        </div>

        {/* Capture Area */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] shadow-xl transition-colors duration-300">
          <div id="photo-frame-area" className="relative overflow-hidden rounded-xl">
            <FrameEditor
              selectedFrame={selectedFrame.path}
              onPhotoUpload={handlePhotoUpload}
              filterStyle={getFilterStyle()}
              identityName={identity?.displayName}
              showIdentity={showIdentity}
            >
              <HypeOverlay
                show={showHype}
                onComplete={handleHypeComplete}
              />
            </FrameEditor>
          </div>

          {/* Identity Toggle */}
          {photo && identity?.name && (
            <IdentityToggle
              displayName={identity.displayName!}
              showIdentity={showIdentity}
              onToggle={() => setShowIdentity(!showIdentity)}
            />
          )}

          {/* Hype Message Display */}
          {finalMessage && (
            <div className="mt-4 text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="inline-block p-4 rounded-xl bg-gradient-to-r from-base-blue/10 to-neon-purple/10 border border-base-blue/20 backdrop-blur-sm">
                <p className="font-display font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-base-blue to-neon-purple">
                  "{finalMessage}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <ActionButtons
          photo={photo}
          finalScore={finalScore}
          isMinting={isMinting}
          isUploading={isUploading}
          topContacts={topContacts}
          selectedContacts={selectedContacts}
          onFinalize={handleFinalize}
          onDownload={handleDownload}
          onShare={onShare}
          onMint={onMint}
          onToggleContact={handleToggleContact}
        />
      </main>
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Studio />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/frens" element={<FrensGenerator />} />
        <Route path="/frames" element={<FrameMarketplace />} />
        <Route path="/frames/create" element={<CreateFrame />} />
        <Route path="/help" element={<HowToUse />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default App;
