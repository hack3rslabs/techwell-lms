"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/lib/api";
import {
    Loader2, Mic, StopCircle, Volume2, Save,
    Clock, CheckCircle2, AlertCircle, Lightbulb,
    ChevronRight, Trophy, SkipForward
} from "lucide-react";
import Webcam from "react-webcam";
import useSpeechToText from 'react-hook-speech-to-text';
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// ─── Avatar Config ─────────────────────────────────────────────────────────
const AVATAR_CONFIG = {
    "hr-manager": { emoji: "👩‍💼", name: "Priya Sharma", title: "HR Manager", color: "from-violet-500 to-purple-700", badge: "bg-violet-100 text-violet-700" },
    "tech-lead":  { emoji: "👨‍💻", name: "Rahul Mehta",  title: "Tech Lead",   color: "from-blue-500 to-indigo-700",  badge: "bg-blue-100 text-blue-700" },
    "cto":        { emoji: "🧠", name: "Arvind Kumar", title: "CTO",         color: "from-orange-500 to-red-700",    badge: "bg-orange-100 text-orange-700" },
    "product_manager": { emoji: "📊", name: "Sneha Patel", title: "Product Manager", color: "from-emerald-500 to-green-700", badge: "bg-emerald-100 text-emerald-700" },
};

const PHASE_LABELS = {
    OPENING: { label: "Opening HR Round", color: "bg-violet-100 text-violet-700", icon: "👋" },
    TECHNICAL: { label: "Technical Round", color: "bg-blue-100 text-blue-700", icon: "💻" },
    CLOSING: { label: "Closing HR Round", color: "bg-green-100 text-green-700", icon: "🏁" },
};

function ElapsedTimer({ startedAt }: { startedAt: string | null }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const base = startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0;
        setSeconds(base);
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, [startedAt]);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return (
        <span className="font-mono text-sm font-bold">
            {h > 0 ? `${h}:` : ""}{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </span>
    );
}

export default function ActiveInterviewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const panelId = searchParams.get("panel") || "tech-lead";
    const duration = parseInt(searchParams.get("duration") || "30");

    const [interviewData, setInterviewData] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [maxQuestions, setMaxQuestions] = useState(10);
    const [isComplete, setIsComplete] = useState(false);
    const [loadingNext, setLoadingNext] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [briefFeedback, setBriefFeedback] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);

    // AI Intelligence Timers
    const [lastSpeechTime, setLastSpeechTime] = useState(() => Date.now());
    const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());
    const [inactivityWarning, setInactivityWarning] = useState(false);

    const avatar = AVATAR_CONFIG[currentQuestion?.avatarId as keyof typeof AVATAR_CONFIG] || AVATAR_CONFIG["tech-lead"];
    const panelAvatar = AVATAR_CONFIG[panelId as keyof typeof AVATAR_CONFIG] || AVATAR_CONFIG["tech-lead"];
    const phase = currentQuestion?.phase || "TECHNICAL";
    const phaseConfig = PHASE_LABELS[phase as keyof typeof PHASE_LABELS] || PHASE_LABELS.TECHNICAL;

    const {
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
    } = useSpeechToText({ continuous: true, useLegacyResults: false });

    // Track when the user last spoke and handle interruptions
    useEffect(() => {
        if (results && results.length > 0) {
            const currentTranscript = results.map((r: any) => typeof r === 'string' ? r : r.transcript).join(' ');
            setUserAnswer(currentTranscript);
            setLastSpeechTime(Date.now());
            setInactivityWarning(false);

            // Phase 3: Conversational Interruption
            // If candidate starts speaking, stop AI speech
            if (isAiSpeaking && currentTranscript.trim().length > 3) {
                window.speechSynthesis.cancel();
                setIsAiSpeaking(false);
                console.log("[AI] Candidate interrupted. Stopping AI speech.");
            }
        }
    }, [results, isAiSpeaking]);

    // AI Intelligence: Silence Detection & Inactivity Timeout
    useEffect(() => {
        if (loadingNext || submitting || isComplete || !currentQuestion) return;

        const checkInterval = setInterval(() => {
            const now = Date.now();

            // 1. Silence Detection: Auto-submit if recording and silent for 5 seconds
            if (isRecording) {
                if (now - lastSpeechTime > 5000 && userAnswer.trim().length >= 10) {
                    console.log("[AI] Silence detected. Auto-submitting...");
                    toast.info("Silence detected. Submitting your answer automatically...");
                    handleSaveResponse();
                }
            } 
            // 2. Inactivity Timeout: If not recording, and haven't started answering for 30s
            else if (!isRecording && !userAnswer) {
                const idleTime = now - questionStartTime;
                
                if (idleTime > 30000) { // 30 seconds without starting
                    console.log("[AI] Inactivity timeout. Auto-skipping...");
                    toast.error("No response detected. Moving to next question...");
                    handleSkip();
                } else if (idleTime > 20000 && !inactivityWarning) { // Warn at 20s
                    setInactivityWarning(true);
                    toast.warning("Are you still there? The interview will continue automatically in 10 seconds.");
                }
            }
        }, 1000);

        return () => clearInterval(checkInterval);
    }, [isRecording, lastSpeechTime, userAnswer, loadingNext, submitting, isComplete, currentQuestion, questionStartTime, inactivityWarning]);

    // Initialize
    useEffect(() => {
        initInterview();
    }, [params.id]);
;

    const autoSpeak = (text: string) => {
        if (!text || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.rate = 0.95;
        speech.pitch = 1;
        
        speech.onstart = () => setIsAiSpeaking(true);
        speech.onend = () => setIsAiSpeaking(false);
        speech.onerror = () => setIsAiSpeaking(false);
        
        window.speechSynthesis.speak(speech);
    };

    const textToSpeech = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(text);
            
            speech.onstart = () => setIsAiSpeaking(true);
            speech.onend = () => setIsAiSpeaking(false);
            speech.onerror = () => setIsAiSpeaking(false);

            window.speechSynthesis.speak(speech);
        }
    };
;

    const loadNextQuestion = async () => {
        try {
            setLoadingNext(true);
            setUserAnswer('');
            setResults([]);

            const qRes = await api.post(`/interviews/${params.id}/next-question`);

            if (qRes.data.completed) {
                window.speechSynthesis.cancel();
                setIsComplete(true);
            } else {
                setCurrentQuestion(qRes.data.question);
                setQuestionNumber(n => n + 1);
                setQuestionStartTime(Date.now());
                setInactivityWarning(false);
                // Auto-read the new question after a brief delay
                setTimeout(() => autoSpeak(qRes.data.question?.question), 800);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load next question.");
        } finally {
            setLoadingNext(false);
        }
    };
;

    async function handleSaveResponse() {
        if (!userAnswer || userAnswer.trim().length < 10) {
            toast.error("Please provide a more detailed answer before submitting.");
            return;
        }
        if (isRecording) {
            stopSpeechToText();
            await new Promise(r => setTimeout(r, 300)); // Brief pause for final transcript
        }

        setSubmitting(true);
        setBriefFeedback('');
        setShowFeedback(false);

        try {
            const res = await api.post(`/interviews/${params.id}/response`, {
                questionId: currentQuestion.id,
                answer: userAnswer
            });

            const fb = res.data?.response?.briefFeedback || res.data?.evaluation?.briefFeedback || '';
            if (fb) {
                setBriefFeedback(fb);
                setShowFeedback(true);
                autoSpeak(`Good. ${fb}`);
            }

            setAnsweredQuestions(prev => [...prev, {
                question: currentQuestion.question,
                answer: userAnswer,
                score: res.data?.evaluation?.score || res.data?.response?.score,
                type: currentQuestion.type,
                phase: currentQuestion.phase,
            }]);

            // Wait for AI feedback display then load next
            await new Promise(r => setTimeout(r, fb ? 2500 : 500));
            setShowFeedback(false);

            // Fetch next question
            await loadNextQuestion();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save answer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSkip() {
        if (submitting || loadingNext) return;
        toast.info("Question skipped.");
        setAnsweredQuestions(prev => [...prev, {
            question: currentQuestion.question,
            answer: "(Skipped)",
            score: 0,
            type: currentQuestion.type,
            phase: currentQuestion.phase,
        }]);
        // Save a blank response so backend tracks the skip
        try {
            await api.post(`/interviews/${params.id}/response`, {
                questionId: currentQuestion.id,
                answer: "(Skipped — no answer provided)"
            });
        } catch {}
        await loadNextQuestion();
    }

    async function initInterview() {
        try {
            setLoadingNext(true);
            await api.patch(`/interviews/${params.id}/start`);
            const [intRes, qRes] = await Promise.all([
                api.get(`/interviews/${params.id}`),
                api.post(`/interviews/${params.id}/next-question`)
            ]);
            setInterviewData(intRes.data.interview);
            // Calculate max from duration
            const dur = intRes.data.interview?.duration || duration;
            const max = dur <= 15 ? 5 : dur <= 30 ? 10 : dur <= 45 ? 15 : 20;
            setMaxQuestions(max);
            setQuestionNumber(1);
            if (qRes.data.completed) { setIsComplete(true); }
            else {
                setCurrentQuestion(qRes.data.question);
                setQuestionStartTime(Date.now());
                setInactivityWarning(false);
                autoSpeak(qRes.data.question?.question);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to start interview");
        } finally {
            setLoadingNext(false);
        }
    }





    // ─── Complete Screen ────────────────────────────────────────────────────
    if (isComplete) {
        const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
        const avgScore = answeredQuestions.length > 0 ? Math.round(totalScore / answeredQuestions.length) : 0;
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-5 bg-green-100 rounded-full">
                        <Trophy className="h-14 w-14 text-green-600" />
                    </div>
                    <h2 className="font-extrabold text-3xl">Interview Completed! 🎉</h2>
                    <p className="text-muted-foreground">
                        Excellent effort! You answered {answeredQuestions.filter(q => q.answer !== "(Skipped)").length} of {answeredQuestions.length} questions.
                    </p>
                    <div className="flex justify-center gap-8 py-4">
                        <div>
                            <p className="text-3xl font-black text-primary">{avgScore}</p>
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                        <div className="h-12 w-px bg-slate-200"></div>
                        <div>
                            <p className="text-3xl font-black text-primary">{answeredQuestions.length}</p>
                            <p className="text-xs text-muted-foreground">Questions</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Your detailed AI feedback report is being generated...
                    </p>
                    <Button size="lg" className="w-full mt-4" asChild>
                        <Link href={`/student/career-hub/mock-interview/${params.id}/feedback`}>
                            View Detailed Feedback Report
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href="/student/career-hub/mock-interview">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // ─── Loading first question ─────────────────────────────────────────────
    if (loadingNext && !currentQuestion) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-6xl mb-6 animate-bounce">{panelAvatar.emoji}</div>
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">AI interviewer is preparing your session...</p>
            </div>
        );
    }

    const progress = maxQuestions > 0 ? Math.round((questionNumber / maxQuestions) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            {/* ─── Top Bar ─── */}
            <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Left: Phase Badge */}
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold", phaseConfig.color)}>
                        <span>{phaseConfig.icon}</span>
                        <span>{phaseConfig.label}</span>
                    </div>

                    {/* Center: Progress */}
                    <div className="flex-1 max-w-sm">
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>Q{questionNumber} of {maxQuestions}</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-white/20" />
                    </div>

                    {/* Right: Timer */}
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                        <Clock className="h-4 w-4 text-white/60" />
                        {interviewData?.startedAt && <ElapsedTimer startedAt={interviewData.startedAt} />}
                        <span className="text-white/60 text-xs">/ {duration}min</span>
                    </div>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* ─── Left: Interviewer + Question ─── */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Interviewer Card */}
                    <div className={cn("rounded-2xl p-5 bg-gradient-to-r text-white shadow-xl flex items-center gap-5 relative overflow-hidden", avatar.color)}>
                        {isAiSpeaking && (
                            <div className="absolute top-1/2 left-8 -translate-y-1/2 w-16 h-16 rounded-full bg-white/30 animate-ping" />
                        )}
                        <div className={cn("shrink-0 bg-white/20 rounded-full w-16 h-16 flex items-center justify-center z-10 relative overflow-hidden", isAiSpeaking && "animate-pulse")}>
                            {interviewData?.aiAvatarUrl ? (
                                <img src={interviewData.aiAvatarUrl} alt="AI Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-5xl">{avatar.emoji}</span>
                            )}
                        </div>
                        <div className="z-10">
                            <h3 className="text-lg font-bold">{avatar.name}</h3>
                            <p className="text-sm opacity-80">{avatar.title}</p>
                            {currentQuestion?.phaseLabel && (
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                                    {currentQuestion.phaseLabel}
                                </span>
                            )}
                        </div>
                        {currentQuestion?.topicArea && (
                            <div className="ml-auto text-right text-xs opacity-75">
                                <p>Topic</p>
                                <p className="font-semibold text-sm">{currentQuestion.topicArea}</p>
                            </div>
                        )}
                    </div>

                    {/* Question Card */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-primary/80 text-white text-xs px-2 py-1 rounded-full font-bold">
                                    {currentQuestion?.type || "QUESTION"}
                                </span>
                                {currentQuestion?.isFollowUp && (
                                    <span className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                        ↳ Follow-up
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => textToSpeech(currentQuestion?.question)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors shrink-0"
                                title="Read question aloud"
                            >
                                <Volume2 className="h-5 w-5 text-white/70 hover:text-white" />
                            </button>
                        </div>

                        {loadingNext ? (
                            <div className="flex items-center gap-3 py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-white/70" />
                                <p className="text-white/70 animate-pulse">{avatar.name} is taking notes and thinking...</p>
                            </div>
                        ) : (
                            <p className="text-xl font-semibold leading-relaxed text-white">
                                {currentQuestion?.question}
                            </p>
                        )}
                    </div>

                    {/* AI Feedback Bubble */}
                    {showFeedback && briefFeedback && (
                        <div className="flex items-start gap-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center shrink-0">
                                {interviewData?.aiAvatarUrl ? (
                                    <img src={interviewData.aiAvatarUrl} alt="AI Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl">{avatar.emoji}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-emerald-300 font-semibold mb-1">{avatar.name} says:</p>
                                <p className="text-white text-sm leading-relaxed">{briefFeedback}</p>
                            </div>
                        </div>
                    )}

                    {/* Tip for HR questions */}
                    {currentQuestion?.type === 'HR' && (
                        <div className="flex gap-3 bg-amber-500/20 border border-amber-400/30 rounded-xl p-4">
                            <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200">
                                <strong>Tip:</strong> Use the STAR method (Situation, Task, Action, Result) for behavioral questions. Keep answers concise and specific — 1 to 2 minutes is ideal.
                            </div>
                        </div>
                    )}
                    {currentQuestion?.type === 'TECHNICAL' && (
                        <div className="flex gap-3 bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                            <Lightbulb className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-200">
                                <strong>Tip:</strong> Think aloud as you solve the problem. Explain your reasoning clearly before jumping to the answer.
                            </div>
                        </div>
                    )}

                    {/* Question Tracker (answered so far) */}
                    {answeredQuestions.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Questions Answered</p>
                            <div className="flex flex-wrap gap-2">
                                {answeredQuestions.map((q, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                            q.answer === "(Skipped)"
                                                ? "bg-slate-600 text-slate-300"
                                                : (q.score || 0) >= 70
                                                ? "bg-green-600 text-white"
                                                : (q.score || 0) >= 40
                                                ? "bg-yellow-600 text-white"
                                                : "bg-red-700 text-white"
                                        )}
                                        title={q.question?.substring(0, 60)}
                                    >
                                        {i + 1}
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-dashed flex items-center justify-center text-xs font-bold text-primary">
                                    {questionNumber}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Right: Webcam + Recording ─── */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Webcam */}
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-white/20 aspect-video shadow-xl">
                        <Webcam
                            mirrored={true}
                            className="object-cover w-full h-full"
                        />
                        {isRecording && (
                            <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-lg">
                                <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
                                RECORDING
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-white/80">
                            You
                        </div>
                        {/* Live Subtitle Overlay */}
                        {isRecording && userAnswer && (
                            <div className="absolute bottom-12 left-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-3 text-center transition-all animate-in slide-in-from-bottom-2">
                                <p className="text-white text-sm font-medium">{userAnswer}</p>
                            </div>
                        )}
                    </div>

                    {/* Answer textarea */}
                    <div className="relative">
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className={cn(
                                "w-full min-h-[140px] p-4 rounded-xl border text-sm resize-y transition-colors",
                                "bg-white/10 border-white/20 text-white placeholder:text-white/40",
                                "focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none",
                                isRecording && "border-red-400/60 bg-red-500/10"
                            )}
                            placeholder={isRecording
                                ? "🎤 Recording your voice... speak clearly..."
                                : "Your answer will appear here from voice recording. You can also type or edit directly..."
                            }
                        />
                        {userAnswer && (
                            <div className="absolute bottom-3 right-3 text-xs text-white/40">
                                {userAnswer.length} chars
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <Button
                            size="lg"
                            variant={isRecording ? "destructive" : "outline"}
                            className={cn(
                                "w-full font-bold",
                                isRecording
                                    ? "bg-red-600 hover:bg-red-700 border-red-500 text-white animate-pulse"
                                    : "border-white/30 text-white hover:bg-white/10"
                            )}
                            onClick={isRecording ? stopSpeechToText : startSpeechToText}
                        >
                            {isRecording
                                ? <><StopCircle className="mr-2 h-5 w-5" /> Stop Recording</>
                                : <><Mic className="mr-2 h-5 w-5" /> Record Answer</>
                            }
                        </Button>

                        <Button
                            size="lg"
                            className="w-full font-bold bg-primary hover:bg-primary/90"
                            disabled={isRecording || submitting || loadingNext || !userAnswer || userAnswer.length < 10}
                            onClick={handleSaveResponse}
                        >
                            {submitting || loadingNext ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                            ) : (
                                <><Save className="mr-2 h-5 w-5" /> Submit Answer &amp; Next</>
                            )}
                        </Button>

                        <button
                            onClick={handleSkip}
                            disabled={submitting || loadingNext}
                            className="text-xs text-white/40 hover:text-white/70 flex items-center justify-center gap-1 transition-colors mt-1"
                        >
                            <SkipForward className="h-3 w-3" /> Skip this question
                        </button>
                    </div>

                    {/* Chat History Log */}
                    {answeredQuestions.length > 0 && (
                        <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                            <h4 className="text-sm font-bold text-white mb-3 sticky top-0 bg-[#262c3d] p-1 -mt-1 rounded z-10">Chat History</h4>
                            <div className="space-y-4">
                                {answeredQuestions.map((q, i) => (
                                    <div key={i} className="text-sm space-y-2 pb-3 border-b border-white/10 last:border-0 last:pb-0">
                                        <div className="flex gap-2 text-white/80">
                                            <span className="font-semibold text-white min-w-[30px]">AI:</span>
                                            <span>{q.question}</span>
                                        </div>
                                        <div className="flex gap-2 text-emerald-300">
                                            <span className="font-semibold text-emerald-400 min-w-[30px]">You:</span>
                                            <span>{q.answer}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
