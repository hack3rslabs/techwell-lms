"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * Behavior Tracker Hook
 */

interface BehaviorEvent {
    sessionId: string;
    userId?: string;
    eventType: string;
    eventData: Record<string, unknown>;
}

const FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_BEHAVIOR_AI === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000;

class BehaviorTracker {
    private static instance: BehaviorTracker;
    private eventQueue: BehaviorEvent[] = [];
    private sessionId: string;
    private batchTimer: NodeJS.Timeout | null = null;

    private constructor() {
        this.sessionId = this.getOrCreateSessionId();

        if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => {
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
        if (typeof window === "undefined") return "";

        let sessionId = sessionStorage.getItem("behavior_session_id");

        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem("behavior_session_id", sessionId);
        }

        return sessionId;
    }

    track(eventType: string, eventData: Record<string, unknown>, userId?: string) {
        if (!FEATURE_ENABLED) return;

        const event: BehaviorEvent = {
            sessionId: this.sessionId,
            userId,
            eventType,
            eventData,
        };

        this.eventQueue.push(event);

        if (this.eventQueue.length >= BATCH_SIZE) {
            this.flush();
        } else {
            this.scheduleBatchSend();
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

        this.sendEvents(events).catch(console.error);
    }

    private async sendEvents(events: BehaviorEvent[]) {
        await fetch(`${API_URL}/api/behavior/events/batch`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ events }),
            keepalive: true,
        });
    }

    getSessionId() {
        return this.sessionId;
    }
}

export function useBehaviorTracker(userId?: string) {
    const pathname = usePathname();
    const tracker = BehaviorTracker.getInstance();
    const pageStartTime = useRef<number | null>(null);
    const lastScrollDepth = useRef<number>(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (pageStartTime.current === null) {
            pageStartTime.current = Date.now();
        }
    }, []);

    // PAGE VIEW + TIME ON PAGE
    useEffect(() => {
        if (!FEATURE_ENABLED) return;

        tracker.track("PAGE_VIEW", {
            page: pathname,
            timestamp: new Date().toISOString(),
        }, userId);

        pageStartTime.current = Date.now();

        return () => {
            if (pageStartTime.current !== null) {
                const duration = Math.floor(
                    (Date.now() - pageStartTime.current) / 1000
                );

                tracker.track("TIME_ON_PAGE", {
                    page: pathname,
                    duration,
                }, userId);
            }
        };
    }, [pathname, userId, tracker]);

    // SCROLL TRACKING
    useEffect(() => {
        if (!FEATURE_ENABLED || typeof window === "undefined") return;

        const handleScroll = () => {
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            scrollTimeout.current = setTimeout(() => {
                const scrollHeight =
                    document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = window.scrollY;

                const scrollDepth =
                    scrollHeight > 0
                        ? Math.round((scrolled / scrollHeight) * 100)
                        : 0;

                if (scrollDepth >= lastScrollDepth.current + 25) {
                    lastScrollDepth.current = scrollDepth;

                    tracker.track("SCROLL", {
                        page: pathname,
                        scrollDepth,
                    }, userId);
                }
            }, 500);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);

            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, [pathname, userId, tracker]);

    // ✅ FIXED CTA TRACKING
    const trackCTA = useCallback(
        (ctaId: string, ctaText?: string) => {
            if (!FEATURE_ENABLED) return;

            tracker.track(
                "CTA_CLICK",
                {
                    page: pathname,
                    ctaId,
                    ctaText,
                    timestamp: new Date().toISOString(),
                },
                userId // ✅ FIXED (was wrong array before)
            );
        },
        [pathname, userId, tracker]
    );

    const trackCustomEvent = useCallback(
        (eventType: string, eventData: Record<string, unknown>) => {
            if (!FEATURE_ENABLED) return;

            tracker.track(eventType, {
                page: pathname,
                ...eventData,
            }, userId);
        },
        [pathname, userId, tracker]
    );

    return {
        trackCTA,
        trackCustomEvent,
        sessionId: tracker.getSessionId(),
    };
}