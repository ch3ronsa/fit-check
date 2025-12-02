import { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Sparkles, Sun, Moon, User as UserIcon, Database, HelpCircle } from 'lucide-react';
import { useAccount, useWriteContract } from 'wagmi';
import FrameEditor from './components/FrameEditor';
import HypeOverlay from './components/HypeOverlay';
import WalletConnect from './components/WalletConnect';
import Profile from './pages/Profile';
import HowToUse from './pages/HowToUse';
import { playSuccessSound } from './lib/utils';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';
import sdk from '@farcaster/frame-sdk';

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
];

function App() {
  const { isConnected, address } = useAccount();
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showHype, setShowHype] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalMessage, setFinalMessage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'how-to'>('home');
  const [isMinting, setIsMinting] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const handleDownload = async () => {
    try {
      const element = document.getElementById('fit-check-canvas');
      if (!element) {
        console.error("Canvas element not found");
        return;
      }

      console.log("Starting download capture...");
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: null,
        logging: true,
        onclone: (clonedDoc) => {
          const scoreBadge = clonedDoc.getElementById('style-score-badge');
          if (scoreBadge) {
            scoreBadge.style.display = 'none';
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/png');

      // Create temporary link
      const link = document.createElement('a');
      link.download = `base-fit-check-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to save image. Please try again.");
    }
  };

  const handleShare = async () => {
    if (!finalScore) return;
    const text = `Checking my fit on Base! 🔵 My Style Score: ${finalScore}/100. "${finalMessage}" Rate this look! 🛡️ #BaseFitCheck @base`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;

    // Use Farcaster SDK for native sharing in Mini Apps
    if (sdk && sdk.actions && sdk.actions.openUrl) {
      sdk.actions.openUrl(url);
    } else {
      // Fallback for non-Farcaster environments
      window.open(url, '_blank');
    }

    // Auto-save to history on share
    await saveToHistory();
  };

  const { writeContractAsync } = useWriteContract();

  const handleMint = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }
    setIsMinting(true);

    try {
      // 1. Upload image to IPFS (Simulation for now, using a placeholder URI)
      // In a real app, we would upload the blob to Pinata/IPFS here.
      const tokenURI = "ipfs://bafkreic653o454654654654";

      // 2. Write to Smart Contract
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'safeMint',
        args: [address!, tokenURI],
      });

      console.log("Transaction Hash:", hash);

      // 3. Save to Local History
      await saveToHistory();

      playSuccessSound(); // Play victory sound! 🎵
      alert(`Successfully Minted on Base! 🔵\nTx: ${hash}`);
    } catch (error) {
      console.error("Mint failed", error);
      alert("Minting failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  if (currentView === 'profile') {
    return <Profile onBack={() => setCurrentView('home')} />;
  }

  if (currentView === 'how-to') {
    return <HowToUse onBack={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans pb-20">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-800/50 bg-[var(--bg-primary)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2" onClick={() => setCurrentView('home')}>
          <div className="w-8 h-8 bg-base-blue rounded-full flex items-center justify-center animate-pulse-fast cursor-pointer">
            <span className="font-bold text-white">B</span>
          </div>
          <h1 className="font-display font-bold text-xl tracking-tighter cursor-pointer">FIT CHECK <span className="text-base-blue">STUDIO</span></h1>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={() => setCurrentView('profile')}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <UserIcon size={20} className="text-base-blue" />
            </button>
          )}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>
          <button
            onClick={() => setCurrentView('how-to')}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="How to Use"
          >
            <HelpCircle size={20} className="text-gray-500 hover:text-base-blue transition-colors" />
          </button>
          <WalletConnect />
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

        {/* Capture Area (Includes Editor + Message) */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] shadow-xl transition-colors duration-300">
          {/* Main Editor Area */}
          <div id="photo-frame-area" className="relative overflow-hidden rounded-xl">
            <FrameEditor
              selectedFrame={selectedFrame}
              onPhotoUpload={handlePhotoUpload}
            >
              <HypeOverlay
                show={showHype}
                onComplete={handleHypeComplete}
              />
            </FrameEditor>
          </div>

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
                <button
                  onClick={handleDownload}
                  className="bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={20} />
                  Save in my phone
                </button>
                <button
                  onClick={handleShare}
                  className="bg-[#855DCD] hover:bg-[#7C52C7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(133,93,205,0.4)]"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>

              {/* Mint Button */}
              <button
                onClick={handleMint}
                disabled={isMinting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-5"
              >
                {isMinting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Database size={20} />}
                {isMinting ? 'Minting on Base...' : 'Save On-Chain (Mint NFT)'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
