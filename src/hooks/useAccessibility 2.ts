import { useState, useEffect, useCallback } from 'react';

const COLORBLIND_KEY = 'ludo_colorblind';
const REDUCED_MOTION_KEY = 'ludo_reduced_motion';

export interface AccessibilitySettings {
    colorblindMode: boolean;
    reducedMotion: boolean;
    toggleColorblind: () => void;
    toggleReducedMotion: () => void;
}

export const useAccessibility = (): AccessibilitySettings => {
    const [colorblindMode, setColorblindMode] = useState(() => {
        try {
            return localStorage.getItem(COLORBLIND_KEY) === '1';
        } catch {
            return false;
        }
    });

    const [reducedMotion, setReducedMotion] = useState(() => {
        try {
            if (localStorage.getItem(REDUCED_MOTION_KEY) === '1') return true;
            // Respect system preference
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(COLORBLIND_KEY, colorblindMode ? '1' : '0');
        } catch { }
    }, [colorblindMode]);

    useEffect(() => {
        try {
            localStorage.setItem(REDUCED_MOTION_KEY, reducedMotion ? '1' : '0');
        } catch { }
        // Apply global CSS class for reduced motion
        document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    }, [reducedMotion]);

    const toggleColorblind = useCallback(() => setColorblindMode((v) => !v), []);
    const toggleReducedMotion = useCallback(() => setReducedMotion((v) => !v), []);

    return { colorblindMode, reducedMotion, toggleColorblind, toggleReducedMotion };
};
