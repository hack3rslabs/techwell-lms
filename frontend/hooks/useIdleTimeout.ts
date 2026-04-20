'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;   // 10 minutes
const WARNING_BEFORE_MS = 60 * 1000;       // warn 60 seconds before logout
const WARNING_AT_MS = IDLE_TIMEOUT_MS - WARNING_BEFORE_MS; // 9 minutes

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
    'mousemove',
    'mousedown',
    'keydown',
    'touchstart',
    'scroll',
    'click',
    'wheel',
];

interface UseIdleTimeoutOptions {
    isAuthenticated: boolean;
    onLogout: () => void;
}

interface UseIdleTimeoutReturn {
    isWarning: boolean;
    remainingSeconds: number;
    resetTimer: () => void;
}

export function useIdleTimeout({ isAuthenticated, onLogout }: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
    const router = useRouter();
    const [isWarning, setIsWarning] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(60);

    // Refs to hold mutable values without triggering re-renders
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isAuthRef = useRef(isAuthenticated);
    const warningStartTimeRef = useRef<number | null>(null);

    // Keep isAuthRef in sync
    useEffect(() => {
        isAuthRef.current = isAuthenticated;
    }, [isAuthenticated]);

    const clearAllTimers = useCallback(() => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        warningTimerRef.current = null;
        logoutTimerRef.current = null;
        countdownIntervalRef.current = null;
    }, []);

    const startCountdown = useCallback(() => {
        warningStartTimeRef.current = Date.now();
        setRemainingSeconds(60);
        // Tick every second and compute from actual elapsed time (drift-safe)
        countdownIntervalRef.current = setInterval(() => {
            if (warningStartTimeRef.current === null) return;
            const elapsed = Date.now() - warningStartTimeRef.current;
            const remaining = Math.max(0, Math.ceil((WARNING_BEFORE_MS - elapsed) / 1000));
            setRemainingSeconds(remaining);
        }, 500);
    }, []);

    const triggerLogout = useCallback(() => {
        clearAllTimers();
        setIsWarning(false);
        onLogout();
        router.push('/login?reason=idle');
    }, [clearAllTimers, onLogout, router]);

    const startTimers = useCallback(() => {
        clearAllTimers();
        setIsWarning(false);

        // Warning timer at 9 minutes
        warningTimerRef.current = setTimeout(() => {
            if (!isAuthRef.current) return;
            setIsWarning(true);
            startCountdown();

            // Auto-logout timer at 10 minutes (60 seconds after warning)
            logoutTimerRef.current = setTimeout(() => {
                if (!isAuthRef.current) return;
                triggerLogout();
            }, WARNING_BEFORE_MS);
        }, WARNING_AT_MS);
    }, [clearAllTimers, startCountdown, triggerLogout]);

    const resetTimer = useCallback(() => {
        if (!isAuthRef.current) return;
        setIsWarning(false);
        setRemainingSeconds(60);
        warningStartTimeRef.current = null;
        startTimers();
    }, [startTimers]);

    useEffect(() => {
        if (!isAuthenticated) {
            clearAllTimers();
            setIsWarning(false);
            return;
        }

        startTimers();

        const handleActivity = () => {
            // Only reset if warning is NOT showing (don't reset during warning countdown)
            if (!isWarning) {
                resetTimer();
            }
        };

        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            clearAllTimers();
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isAuthenticated]);

    return { isWarning, remainingSeconds, resetTimer };
}
