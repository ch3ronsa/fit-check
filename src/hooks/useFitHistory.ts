import html2canvas from 'html2canvas';

interface SavedFit {
  id: string;
  image: string;
  score: number;
  message: string;
  date: string;
}

const generateImageBlob = async (): Promise<Blob | null> => {
  const element = document.getElementById('fit-check-canvas');
  if (!element) return null;

  const canvas = await html2canvas(element, {
    scale: 2,
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
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
};

export const saveToHistory = async (finalScore: number, finalMessage: string): Promise<void> => {
  const blob = await generateImageBlob();
  if (!blob) return;

  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      try {
        const base64data = reader.result as string;
        const newFit: SavedFit = {
          id: Date.now().toString(),
          image: base64data,
          score: finalScore,
          message: finalMessage,
          date: new Date().toISOString(),
        };

        const existing = localStorage.getItem('fitCheckHistory');
        let history: SavedFit[] = existing ? JSON.parse(existing) : [];
        history.push(newFit);

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
              history.shift();
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
};

export { generateImageBlob };
export type { SavedFit };
