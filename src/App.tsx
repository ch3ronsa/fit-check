import { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Sparkles, Sun, Moon, Database } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import FrameEditor from './components/FrameEditor';
import HypeOverlay from './components/HypeOverlay';
import BottomNav from './components/BottomNav';
import OnboardingModal from './components/OnboardingModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import FilterControls from './components/FilterControls';
import { useFilters } from './hooks/useFilters';
import { useUserIdentity } from './hooks/useUserIdentity';
import Profile from './pages/Profile';
import HowToUse from './pages/HowToUse';
import { playSuccessSound } from './lib/utils';
import { updateLastActivity, shouldSendStreakReminder, showBrowserNotification, requestBrowserNotificationPermission } from './lib/notifications';
import { uploadToIPFS, shortenUrl } from './lib/pinata';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';
import sdk from '@farcaster/frame-sdk';
import { useTopContacts, FarcasterContact } from './hooks/useTopContacts';

const FRAMES = [
  '/frames/frame1.png',
  '/frames/frame2.png',
  '/frames/frame3.png',
  '/frames/frame4.png',
  '/frames/frame5.png',
  '/frames/frame6.png',
  '/frames/frame7.png',
  '/frames/frame8.png',
  '/frames/frame9.png',
  '/frames/frame10.png',
  '/frames/frame11.png',
  '/frames/frame12.png',
  '/frames/frame13.png',
  '/frames/frame14.png',
  '/frames/frame15.png',
  '/frames/frame16.png',
  '/frames/frame17.png',
  '/frames/frame18.png',
  '/frames/frame19.png',
  '/frames/frame20.png',
  '/frames/frame21.png',
  '/frames/frame22.png',
  '/frames/frame23.png',
  '/frames/frame27.png',
  '/frames/frame28.png',
  '/frames/frame29.png',
  '/frames/frame30.png',
  '/frames/frame31.png',
];

function App() {
  const { isConnected, address } = useAccount();
  // Identity Hook
  const identity = useUserIdentity();
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showHype, setShowHype] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalMessage, setFinalMessage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'how-to'>('home');
  const [isMinting, setIsMinting] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false); // Toggle state for identity
  const [selectedContacts, setSelectedContacts] = useState<FarcasterContact[]>([]); // Selected contacts to tag

  // Onboarding modal - show on first visit
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('fitcheck_onboarding_seen');
  });

  const handleCloseOnboarding = () => {
    localStorage.setItem('fitcheck_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  // Filters hook
  const { activeFilter, applyFilter, getFilterStyle } = useFilters();

  // Top contacts for tagging
  const { contacts: topContacts } = useTopContacts();

  // Auto-connect wallet in Frame context
  useEffect(() => {
    const initializeFrame = async () => {
      try {
        // Tell the host app we're ready
        sdk.actions.ready();

        // Check if we're in a frame context
        const context = await sdk.context;

        if (context && !isConnected) {
          // Auto sign-in if in frame context
          try {
            await sdk.actions.signIn({
              nonce: crypto.randomUUID(),
            });
          } catch (signInError) {
            console.log('Auto sign-in not available or user declined:', signInError);
          }
        }
      } catch (err) {
        console.log('Not in frame context:', err);
      }
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      initializeFrame();
    }
  }, [isSDKLoaded, isConnected]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check for streak reminder on app load
  useEffect(() => {
    const checkStreakReminder = async () => {
      // Request notification permission if not already granted
      await requestBrowserNotificationPermission();

      // Check if user should be reminded about streak
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
    // Update activity for streak tracking
    updateLastActivity();
  }, []);

  const generateImageBlob = async (): Promise<Blob | null> => {
    const element = document.getElementById('fit-check-canvas');
    if (element) {
      console.log("Starting html2canvas capture...");
      const canvas = await html2canvas(element, {
        scale: 2, // Increased from 1 for better history quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          const scoreBadge = clonedDoc.getElementById('style-score-badge');
          if (scoreBadge) {
            scoreBadge.style.display = 'none';
          }
        }
      });
      console.log("Canvas captured successfully");
      // Increased quality to 0.8 for better visual fidelity
      return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    }
    return null;
  };

  const saveToHistory = async () => {
    try {
      const blob = await generateImageBlob();
      if (!blob || !finalScore) return;

      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          try {
            const base64data = reader.result as string;
            const newFit = {
              id: Date.now().toString(),
              image: base64data,
              score: finalScore,
              message: finalMessage,
              date: new Date().toISOString(), // Use ISO string for consistent parsing
            };

            const existing = localStorage.getItem('fitCheckHistory');
            let history = existing ? JSON.parse(existing) : [];
            history.push(newFit);

            // Try to save, if quota exceeded, remove oldest and retry
            while (true) {
              try {
                localStorage.setItem('fitCheckHistory', JSON.stringify(history));
                break;
              } catch (e: any) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                  if (history.length <= 1) {
                    throw new Error("Storage full, cannot save new fit.");
                  }
                  console.warn("Storage quota exceeded, removing oldest fit...");
                  history.shift(); // Remove oldest (first item)
                } else {
                  throw e;
                }
              }
            }
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = reject;
      });
    } catch (error) {
      console.error("Error saving to history:", error);
      throw error;
    }
  };

  const handleDownload = async (format: 'square' | 'story' = 'square') => {
    try {
      const element = document.getElementById('fit-check-canvas');
      if (!element) {
        console.error("Canvas element not found");
        return;
      }

      console.log(`Starting download capture (${format})...`);
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          const scoreBadge = clonedDoc.getElementById('style-score-badge');
          if (scoreBadge) {
            scoreBadge.style.display = 'none';
          }
        }
      });

      let dataUrl = canvas.toDataURL('image/png');

      if (format === 'story') {
        // Create a new canvas for 9:16 Story format
        const storyCanvas = document.createElement('canvas');
        const ctx = storyCanvas.getContext('2d');
        if (ctx) {
          // Set dimensions for high-quality story (1080x1920)
          const width = 1080;
          const height = 1920;
          storyCanvas.width = width;
          storyCanvas.height = height;

          // Fill background with a dark gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, '#0052FF'); // Base Blue
          gradient.addColorStop(1, '#000000'); // Black
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);

          // Draw the square image in the center
          // Calculate scaling to fit width with some padding
          const padding = 80;
          const targetWidth = width - (padding * 2);
          const scale = targetWidth / canvas.width;
          const targetHeight = canvas.height * scale;

          const x = padding;
          const y = (height - targetHeight) / 2;

          // Add shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 50;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 20;

          ctx.drawImage(canvas, x, y, targetWidth, targetHeight);

          // Add branding text
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 40px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('BASE FIT CHECK', width / 2, y + targetHeight + 100);

          dataUrl = storyCanvas.toDataURL('image/png');
        }
      }

      // Create temporary link
      const link = document.createElement('a');
      link.download = `base-fit-check-${format}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to save image. Please try again.");
    }
  };

  // Share with image - upload to IPFS first, then open share modal
  const [isUploading, setIsUploading] = useState(false);

  const handleShare = async () => {
    if (!finalScore) return;

    setIsUploading(true);

    try {
      // Generate the image
      const imageBlob = await generateImageBlob();

      if (!imageBlob) {
        alert('Could not generate image. Please try again.');
        setIsUploading(false);
        return;
      }

      // Upload to IPFS
      let imageUrl = 'https://check-fit-two.vercel.app';
      try {
        const uploadResult = await uploadToIPFS(imageBlob, `fit-check-${Date.now()}.png`);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      } catch (uploadErr) {
        console.log('IPFS upload failed, using fallback URL:', uploadErr);
      }

      // Shorten the URL for text display (but use original for embed/preview)
      const shortUrl = await shortenUrl(imageUrl);

      // Build mentions string from selected contacts
      const mentions = selectedContacts.length > 0
        ? selectedContacts.map(c => `@${c.username}`).join(' ') + ' '
        : '';

      const shareText = `${mentions}Checking my fit on Base! 🔵 My Style Score: ${finalScore}/100. "${finalMessage}" Rate this look! 🛡️ #BaseFitCheck\n\n📸 ${shortUrl}`;

      // Open Warpcast compose directly - use original imageUrl for embed (for preview)
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(imageUrl)}`;

      // Check if we're in a Frame context
      try {
        const context = await sdk.context;
        if (context) {
          await sdk.actions.openUrl(warpcastUrl);
        } else {
          window.open(warpcastUrl, '_blank');
        }
      } catch {
        window.open(warpcastUrl, '_blank');
      }

    } catch (err) {
      console.log('Share failed:', err);
      alert('Could not share. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Builder Code for Base attribution (will be used when Builder Code supported in writeContract)
  // const BUILDER_CODE = "bc_t62valcb";

  const { writeContractAsync } = useWriteContract();

  const handleMint = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }
    setIsMinting(true);

    try {
      // 1. Generate and upload image to IPFS first
      const imageBlob = await generateImageBlob();
      if (!imageBlob) {
        alert("Could not generate image. Please try again.");
        setIsMinting(false);
        return;
      }

      // Upload to IPFS
      let tokenURI = "ipfs://placeholder";
      try {
        const uploadResult = await uploadToIPFS(imageBlob, `fit-nft-${Date.now()}.png`);
        if (uploadResult.success && uploadResult.ipfsHash) {
          tokenURI = `ipfs://${uploadResult.ipfsHash}`;
        }
      } catch (uploadErr) {
        console.log('IPFS upload failed:', uploadErr);
      }

      // 2. Send transaction using writeContractAsync
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'safeMint',
        args: [address, tokenURI],
      });

      console.log('Transaction hash:', hash);

      // 3. If we reach here, TX was submitted successfully - save to history
      await saveToHistory();
      playSuccessSound();
      showBrowserNotification('mint_success');
      alert(`Successfully Minted on Base! 🔵\nTX: ${hash}`);
    } catch (error: unknown) {
      console.error("Mint failed", error);
      const err = error as Error;
      // Don't show alert if user rejected the transaction
      if (err.message?.includes('rejected') || err.message?.includes('denied') || err.message?.includes('User denied')) {
        console.log('User rejected transaction');
      } else {
        alert(`Minting failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  if (currentView === 'profile') {
    return (
      <>
        <Profile onBack={() => setCurrentView('home')} />
        <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      </>
    );
  }

  if (currentView === 'how-to') {
    return (
      <>
        <HowToUse onBack={() => setCurrentView('home')} />
        <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      </>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans pb-20">
      {/* Onboarding Modal - First Visit */}
      <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />

      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-800/50 bg-[var(--bg-primary)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <img src="/icon.png" alt="Fit Check" className="w-8 h-8 rounded-lg" />
          <h1 className="font-display font-bold text-xl tracking-tighter">FIT CHECK <span className="text-base-blue">STUDIO</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>

          {/* Custom Connect Button with Identity */}
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="bg-base-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                        >
                          Connect
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                        >
                          Wrong Network
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
                      >
                        {account.ensAvatar ? (
                          <img src={account.ensAvatar} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-base-blue to-purple-500" />
                        )}
                        <span className="font-bold text-sm text-white">
                          {identity?.displayName || account.displayName}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Frame Selector */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-4 w-max">
            {FRAMES.map((frame, index) => (
              <button
                key={index}
                onClick={() => setSelectedFrame(frame)}
                className={`relative w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${selectedFrame === frame ? 'border-base-blue shadow-[0_0_15px_#0052FF]' : 'border-gray-700 hover:border-gray-500'
                  }`}
              >
                <img src={frame} alt={`Frame ${index + 1}`} className="w-full h-full object-contain bg-gray-900" />
                {selectedFrame === frame && (
                  <div className="absolute inset-0 bg-base-blue/20" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls - Always visible */}
        <div className="mb-6">
          <FilterControls activeFilter={activeFilter} onFilterChange={applyFilter} />
        </div>

        {/* Capture Area (Includes Editor + Message) */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] shadow-xl transition-colors duration-300">
          {/* Main Editor Area */}
          <div id="photo-frame-area" className="relative overflow-hidden rounded-xl">
            <FrameEditor
              selectedFrame={selectedFrame}
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

          {/* Identity Toggle - Only when photo uploaded */}
          {photo && identity?.name && (
            <div className="mt-4">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-base-blue text-lg">👤</span>
                  <div>
                    <p className="font-bold text-sm text-white">Signed by {identity.displayName}</p>
                    <p className="text-xs text-gray-400">Add your Basename to the photo</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIdentity(!showIdentity)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${showIdentity ? 'bg-base-blue' : 'bg-gray-600'
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${showIdentity ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Hype Message Display (Below Photo) */}
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
        <div className="mt-8 space-y-4">
          {!finalScore ? (
            <button
              onClick={handleFinalize}
              disabled={!photo}
              className={`w-full py-4 rounded-xl font-bold font-display text-xl flex items-center justify-center gap-2 transition-all ${photo
                ? 'bg-gradient-to-r from-base-blue to-neon-blue text-white shadow-[0_0_20px_rgba(0,82,255,0.5)] hover:scale-[1.02]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
            >
              <Sparkles className={photo ? 'animate-spin-slow' : ''} />
              {photo ? 'RATE MY PHOTO' : 'Upload Photo First'}
            </button>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload('square')}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Download size={18} />
                    Square
                  </button>
                  <button
                    onClick={() => handleDownload('story')}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Download size={18} />
                    Story
                  </button>
                </div>
              </div>

              {/* Tag Friends Section */}
              {topContacts.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2">🏷️ Tag friends (tap to select):</p>
                  <div className="flex flex-wrap gap-2">
                    {topContacts.map((contact) => {
                      const isSelected = selectedContacts.some(c => c.fid === contact.fid);
                      return (
                        <button
                          key={contact.fid}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedContacts(prev => prev.filter(c => c.fid !== contact.fid));
                            } else {
                              setSelectedContacts(prev => [...prev, contact]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${isSelected
                            ? 'bg-base-blue text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                          @{contact.username}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Share button */}
              <button
                onClick={handleShare}
                disabled={isUploading}
                className="w-full bg-[#855DCD] hover:bg-[#7C52C7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(133,93,205,0.4)] disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Share2 size={20} />
                    Share{selectedContacts.length > 0 ? ` (with ${selectedContacts.length} tags)` : ''}
                  </>
                )}
              </button>

              {/* Mint Button */}
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01]"
              >
                {isMinting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Database size={20} />}
                {isMinting ? 'Minting on Base...' : 'Save On-Chain (Mint NFT)'}
              </button>
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}

export default App;
