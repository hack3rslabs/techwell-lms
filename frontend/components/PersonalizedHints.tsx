"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_BEHAVIOR_AI === 'true';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface PersonalizedHintsProps {
    sessionId: string;
    children: React.ReactNode;
    ctaId?: string;
}

interface UserIntent {
    primaryIntent: string;
    confidence: number;
}

export function PersonalizedHints({ sessionId, children, ctaId }: PersonalizedHintsProps) {
    const [intent, setIntent] = useState<UserIntent | null>(null);
    const [isRelevant, setIsRelevant] = useState(false);

    useEffect(() => {
        if (!FEATURE_ENABLED || !sessionId) return;

        // Fetch user intent
        fetch(`${API_URL}/api/behavior/intent?sessionId=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                setIntent(data);

                // Check if this CTA is relevant to user's intent
                if (ctaId && data.confidence > 0.5) {
                    const relevant =
                        (data.primaryIntent === 'INTERVIEW_FOCUSED' && ctaId.includes('interview')) ||
                        (data.primaryIntent === 'COURSE_FOCUSED' && ctaId.includes('course')) ||
                        (data.primaryIntent === 'JOB_FOCUSED' && ctaId.includes('job'));

                    setIsRelevant(relevant);
                }
            })
            .catch(error => {
                console.error('[PersonalizedHints] Error fetching intent:', error);
            });
    }, [sessionId, ctaId]);

    if (!FEATURE_ENABLED || !isRelevant) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* Recommended badge */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-3 -right-3 z-10"
            >
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    <span>For You</span>
                </div>
            </motion.div>

            {/* Highlighted wrapper */}
            <motion.div
                initial={{ boxShadow: '0 0 0 0 rgba(var(--primary), 0)' }}
                animate={{
                    boxShadow: [
                        '0 0 0 0 rgba(var(--primary), 0.3)',
                        '0 0 0 8px rgba(var(--primary), 0)',
                        '0 0 0 0 rgba(var(--primary), 0)'
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                }}
                className="intent-highlight rounded-lg"
            >
                {children}
            </motion.div>
        </div>
    );
}

interface RecommendedCardProps {
    intent: string;
    title: string;
    description: string;
    href: string;
}

export function RecommendedCard({ intent, title, description, href }: RecommendedCardProps) {
    if (!FEATURE_ENABLED) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                            Recommended
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {description}
                    </p>
                    <a
                        href={href}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                        Explore now
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
