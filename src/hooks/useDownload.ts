import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export const handleDownload = async (format: 'square' | 'story' = 'square') => {
  const element = document.getElementById('fit-check-canvas');
  if (!element) {
    console.error("Canvas element not found");
    return;
  }

  try {
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
      const storyCanvas = document.createElement('canvas');
      const ctx = storyCanvas.getContext('2d');
      if (ctx) {
        const width = 1080;
        const height = 1920;
        storyCanvas.width = width;
        storyCanvas.height = height;

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0052FF');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const padding = 80;
        const targetWidth = width - (padding * 2);
        const scale = targetWidth / canvas.width;
        const targetHeight = canvas.height * scale;

        const x = padding;
        const y = (height - targetHeight) / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 50;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 20;

        ctx.drawImage(canvas, x, y, targetWidth, targetHeight);

        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BASE FIT CHECK', width / 2, y + targetHeight + 100);

        dataUrl = storyCanvas.toDataURL('image/png');
      }
    }

    const link = document.createElement('a');
    link.download = `base-fit-check-${format}-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download failed:", error);
    toast.error('Failed to save image. Please try again.');
  }
};
