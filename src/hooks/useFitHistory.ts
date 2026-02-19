import html2canvas from 'html2canvas';
import { saveFit, type SavedFit } from '../lib/db';

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

  await saveFit({
    id: Date.now().toString(),
    image: blob,
    score: finalScore,
    message: finalMessage,
    date: new Date().toISOString(),
  });
};

export { generateImageBlob };
export type { SavedFit };
