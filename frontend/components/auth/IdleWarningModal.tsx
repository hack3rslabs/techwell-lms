'use client';

import * as React from 'react';
import { ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

interface IdleWarningModalProps {
    remainingSeconds: number;
    onStayLoggedIn: () => void;
    onLogoutNow: () => void;
}

export function IdleWarningModal({
    remainingSeconds,
    onStayLoggedIn,
    onLogoutNow,
}: IdleWarningModalProps) {
    const TOTAL = 60;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = remainingSeconds / TOTAL;
    const strokeDashoffset = circumference * (1 - progress);

    // Color interpolation from green → yellow → red
    const getColor = () => {
        if (remainingSeconds > 30) return '#22c55e'; // green
        if (remainingSeconds > 10) return '#f59e0b'; // amber
        return '#ef4444'; // red
    };

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="idle-warning-title"
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)' }}
        >
            <div
                className="relative bg-background border border-border rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-6"
                style={{
                    animation: 'idleModalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
            >
                {/* Warning Icon */}
                <div
                    className="flex items-center justify-center w-16 h-16 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)' }}
                >
                    <ShieldAlert className="h-8 w-8 text-amber-500" />
                </div>

                {/* Title & Message */}
                <div className="text-center space-y-2">
                    <h2 id="idle-warning-title" className="text-xl font-bold tracking-tight text-foreground">
                        Session Expiring Soon
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You&apos;ve been inactive for a while. For your security, you will be
                        automatically logged out in:
                    </p>
                </div>

                {/* SVG Countdown Ring */}
                <div className="relative flex items-center justify-center" style={{ width: 108, height: 108 }}>
                    <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
                        {/* Track */}
                        <circle
                            cx="54"
                            cy="54"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="7"
                            className="text-muted/30"
                        />
                        {/* Progress */}
                        <circle
                            cx="54"
                            cy="54"
                            r={radius}
                            fill="none"
                            stroke={getColor()}
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
                        />
                    </svg>
                    <span
                        className="absolute text-2xl font-bold tabular-nums tracking-tight"
                        style={{ color: getColor(), transition: 'color 0.5s ease' }}
                    >
                        {display}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col w-full gap-3">
                    <button
                        id="idle-stay-logged-in"
                        onClick={onStayLoggedIn}
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)',
                            boxShadow: '0 4px 15px hsl(var(--primary) / 0.35)',
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Stay Logged In
                    </button>
                    <button
                        id="idle-logout-now"
                        onClick={onLogoutNow}
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-medium text-muted-foreground border border-border hover:border-destructive hover:text-destructive transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive bg-background"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out Now
                    </button>
                </div>
            </div>

            {/* Keyframe animation injected inline */}
            <style>{`
                @keyframes idleModalIn {
                    from { opacity: 0; transform: scale(0.85) translateY(16px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
