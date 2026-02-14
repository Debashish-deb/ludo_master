import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Web Audio API-based sound effects — no external files needed.
 * Each sound is a short synthesized tone or noise burst.
 */

type SoundName =
    | 'diceRoll'
    | 'tokenMove'
    | 'tokenCapture'
    | 'tokenFinish'
    | 'win'
    | 'buttonClick'
    | 'turnChange'
    | 'penalty';

const MUTE_KEY = 'ludo_muted';

export const useSoundEffects = () => {
    const ctxRef = useRef<AudioContext | null>(null);
    const [muted, setMuted] = useState(() => {
        try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
    });

    useEffect(() => {
        try {
            localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
        } catch {
            // Ignore storage errors
        }
    }, [muted]);

    const getCtx = useCallback((): AudioContext | null => {
        if (ctxRef.current) return ctxRef.current;
        try {
            ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            return ctxRef.current;
        } catch {
            return null;
        }
    }, []);

    // ─── Sound generators ─────────────────────────────────────────

    const playTone = useCallback(
        (freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) => {
            if (muted) return;
            const ctx = getCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        },
        [muted, getCtx],
    );

    const playNoise = useCallback(
        (duration: number, vol = 0.15) => {
            if (muted) return;
            const ctx = getCtx();
            if (!ctx) return;
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            source.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        },
        [muted, getCtx],
    );

    // ─── Named sounds ─────────────────────────────────────────────

    const play = useCallback(
        (name: SoundName) => {
            if (muted) return;
            switch (name) {
                case 'diceRoll':
                    playNoise(0.3, 0.2);
                    setTimeout(() => playTone(800, 0.08, 'square', 0.15), 100);
                    setTimeout(() => playTone(900, 0.08, 'square', 0.15), 200);
                    break;
                case 'tokenMove':
                    playTone(500, 0.08, 'sine', 0.2);
                    setTimeout(() => playTone(600, 0.06, 'sine', 0.15), 60);
                    break;
                case 'tokenCapture':
                    playTone(300, 0.15, 'sawtooth', 0.25);
                    setTimeout(() => playTone(200, 0.2, 'sawtooth', 0.2), 80);
                    setTimeout(() => playNoise(0.15, 0.15), 150);
                    break;
                case 'tokenFinish':
                    playTone(523, 0.12, 'sine', 0.25);
                    setTimeout(() => playTone(659, 0.12, 'sine', 0.25), 100);
                    setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
                    break;
                case 'win':
                    [523, 659, 784, 1047].forEach((freq, i) => {
                        setTimeout(() => playTone(freq, 0.25, 'sine', 0.3), i * 150);
                    });
                    break;
                case 'buttonClick':
                    playTone(1200, 0.04, 'sine', 0.15);
                    break;
                case 'turnChange':
                    playTone(440, 0.06, 'triangle', 0.1);
                    break;
                case 'penalty':
                    playTone(200, 0.3, 'sawtooth', 0.3);
                    setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.25), 200);
                    break;
            }
        },
        [muted, playTone, playNoise],
    );

    const toggleMute = useCallback(() => setMuted((m) => !m), []);

    return { play, muted, toggleMute };
};
