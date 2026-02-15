"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Briefcase, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_BEHAVIOR_AI === 'true';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const TRIGGER_DELAY = 100000; // 100 seconds
const STORAGE_KEY = 'intent_popup_shown';

interface IntentOption {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
}

const intentOptions: IntentOption[] = [
    {
        id: 'interview',
        label: 'Interview Prep',
        icon: <Code className="h-5 w-5" />,
        description: 'AI-powered mock interviews',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'courses',
        label: 'Courses',
        icon: <GraduationCap className="h-5 w-5" />,
        description: 'Learn new skills',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'jobs',
        label: 'Jobs',
        icon: <Briefcase className="h-5 w-5" />,
        description: 'Find opportunities',
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'exploring',
        label: 'Just Exploring',
        icon: <Sparkles className="h-5 w-5" />,
        description: 'Browse around',
        color: 'from-orange-500 to-yellow-500'
    }
];

interface SmartIntentPopupProps {
    sessionId: string;
    userId?: string;
}

export function SmartIntentPopup({ sessionId, userId }: SmartIntentPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

    useEffect(() => {
        if (!FEATURE_ENABLED) return;

        // Don't show popup for logged-in users
        if (userId) return;

        // Check if popup was already shown this session
        const popupShown = sessionStorage.getItem(STORAGE_KEY);
        if (popupShown === 'true') return;

        // Set timer to show popup after delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, TRIGGER_DELAY);

        return () => clearTimeout(timer);
    }, [userId]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem(STORAGE_KEY, 'true');
    };

    const handleSelectIntent = async (intentId: string) => {
        setSelectedIntent(intentId);

        try {
            // Record popup response
            await fetch(`${API_URL}/api/behavior/popup-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    response: intentId
                })
            });
        } catch (error) {
            console.error('[SmartIntentPopup] Error recording response:', error);
        }

        // Close popup after selection
        setTimeout(() => {
            handleClose();
        }, 1000);
    };

    if (!FEATURE_ENABLED) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4"
                    >
                        <Card className="relative p-6 bg-background/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary">
                                        Personalized Experience
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">
                                    What brings you here today?
                                </h2>
                                <p className="text-muted-foreground">
                                    Help us personalize your experience
                                </p>
                            </div>

                            {/* Intent options */}
                            <div className="grid grid-cols-2 gap-3">
                                {intentOptions.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        onClick={() => handleSelectIntent(option.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${selectedIntent === option.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${option.color} opacity-0 hover:opacity-10 transition-opacity`} />
                                        <div className="relative flex flex-col items-center gap-2 text-center">
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${option.color}`}>
                                                <div className="text-white">
                                                    {option.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">
                                                    {option.label}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {option.description}
                                                </div>
                                            </div>
                                            {selectedIntent === option.id && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2 right-2"
                                                >
                                                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleClose}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
