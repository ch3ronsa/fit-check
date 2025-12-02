import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function playSuccessSound() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Simple "Ta-Da" sequence: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const times = [0, 0.1, 0.2, 0.4];
    const durations = [0.1, 0.1, 0.1, 0.4];

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.1, ctx.currentTime + times[i]);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + times[i] + durations[i]);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + times[i]);
        osc.stop(ctx.currentTime + times[i] + durations[i]);
    });
}
