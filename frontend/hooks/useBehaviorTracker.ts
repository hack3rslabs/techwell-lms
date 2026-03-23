"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Behavior Tracker Hook
 * Tracks user behavior for AI intent detection
 * Features: debouncing, batching, fail-safe error handling
 */

interface BehaviorEvent {
    sessionId: string;
    userId?: string;
    eventType: string;
    eventData: Record<string, unknown>;
}

const FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_BEHAVIOR_AI === 'true';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds

class BehaviorTracker {
    private static instance: BehaviorTracker;
    private eventQueue: BehaviorEvent[] = [];
    private sessionId: string;
    private batchTimer: NodeJS.Timeout | null = null;

    private constructor() {
        this.sessionId = this.getOrCreateSessionId();

        // Send queued events before page unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.flush();
            });
        }
    }

    static getInstance(): BehaviorTracker {
        if (!BehaviorTracker.instance) {
            BehaviorTracker.instance = new BehaviorTracker();
        }
        return BehaviorTracker.instance;
    }

    private getOrCreateSessionId(): string {
        if (typeof window === 'undefined') return '';

        let sessionId = sessionStorage.getItem('behavior_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('behavior_session_id', sessionId);
        }
        return sessionId;
    }

    track(eventType: string, eventData: Record<string, unknown>, userId?: string) {
        if (!FEATURE_ENABLED) return;

        try {
            const event: BehaviorEvent = {
                sessionId: this.sessionId,
                userId,
                eventType,
                eventData
            };

            this.eventQueue.push(event);

            // Send batch if queue is full
            if (this.eventQueue.length >= BATCH_SIZE) {
                this.flush();
            } else {
                // Schedule batch send
                this.scheduleBatchSend();
            }
        } catch (error) {
            // Fail silently - tracking errors should never affect UX
            console.error('[BehaviorTracker] Error tracking event:', error);
        }
    }

    private scheduleBatchSend() {
        if (this.batchTimer) return;

        this.batchTimer = setTimeout(() => {
            this.flush();
        }, BATCH_INTERVAL);
    }

    private flush() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }

        // Send asynchronously, don't wait for response
        this.sendEvents(events).catch(error => {
            console.error('[BehaviorTracker] Error sending events:', error);
        });
    }

    private async sendEvents(events: BehaviorEvent[]) {
        try {
            await fetch(`${API_URL}/api/behavior/events/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events }),
                // Don't wait for response
                keepalive: true
            });
        } catch (error) {
            // Fail silently
            console.error('[BehaviorTracker] Network error:', error);
        }
    }

    getSessionId(): string {
        return this.sessionId;
    }
}

export function useBehaviorTracker(userId?: string) {
    const pathname = usePathname();
    const tracker = BehaviorTracker.getInstance();
    const pageStartTime = useRef<number | null>(null);
    const lastScrollDepth = useRef<number>(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initialize page start time in effect
    useEffect(() => {
        if (pageStartTime.current === null) {
            pageStartTime.current = Date.now();
        }
    }, []);

    // Track page view
    useEffect(() => {
        if (!FEATURE_ENABLED) return;

        tracker.track('PAGE_VIEW', {
            page: pathname,
            timestamp: new Date().toISOString()
        }, userId);

        pageStartTime.current = Date.now();

        // Track time on page when leaving
        return () => {
            if (pageStartTime.current !== null) {
                const duration = Math.floor((Date.now() - pageStartTime.current) / 1000);
                if (duration > 0) {
                    tracker.track('TIME_ON_PAGE', {
                        page: pathname,
                        duration
                    }, userId);
                }
            }
        };
    }, [pathname, userId]);

    // Track scroll depth (debounced)
    useEffect(() => {
        if (!FEATURE_ENABLED || typeof window === 'undefined') return;

        const handleScroll = () => {
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            scrollTimeout.current = setTimeout(() => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = window.scrollY;
                const scrollDepth = scrollHeight > 0 ? Math.round((scrolled / scrollHeight) * 100) : 0;

                // Only track significant changes (every 25%)
                if (scrollDepth >= lastScrollDepth.current + 25) {
                    lastScrollDepth.current = scrollDepth;
                    tracker.track('SCROLL', {
                        page: pathname,
                        scrollDepth
                    }, userId);
                }
            }, 500); // Debounce 500ms
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, [pathname, userId]);

    // Return tracking functions
    const trackCTA = useCallback((ctaId: string, ctaText?: string) => {
        if (!FEATURE_ENABLED) return;

        tracker.track('CTA_CLICK', {
            page: pathname,
            ctaId,
            ctaText,
            timestamp: new Date().toISOString()
        }, userId);
    }, [pathname, userId]);

    const trackCustomEvent = useCallback((eventType: string, eventData: Record<string, unknown>) => {
        if (!FEATURE_ENABLED) return;

        tracker.track(eventType, {
            page: pathname,
            ...eventData
        }, userId);
    }, [pathname, userId]);

    return {
        trackCTA,
        trackCustomEvent,
        sessionId: tracker.getSessionId()
    };
}
