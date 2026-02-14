import { useCallback } from 'react';

/**
 * Haptic feedback — uses Capacitor Haptics if available,
 * otherwise falls back to navigator.vibrate or no-op.
 */
export const useHaptics = () => {
    const vibrate = useCallback((pattern: number | number[]) => {
        try {
            if (navigator.vibrate) navigator.vibrate(pattern);
        } catch {
            // Silently ignore vibration errors (e.g. if not supported or disabled)
        }
    }, []);

    const lightTap = useCallback(() => vibrate(10), [vibrate]);
    const mediumTap = useCallback(() => vibrate(25), [vibrate]);
    const heavyTap = useCallback(() => vibrate(50), [vibrate]);
    const success = useCallback(() => vibrate([20, 30, 20]), [vibrate]);
    const error = useCallback(() => vibrate([50, 50, 50]), [vibrate]);

    return { lightTap, mediumTap, heavyTap, success, error };
};
