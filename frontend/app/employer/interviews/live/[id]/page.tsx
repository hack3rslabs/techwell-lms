"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Settings, AlertCircle,
    CheckCircle2, MessageSquare, Zap, Target, UserCheck, BrainCircuit, Activity
} from "lucide-react";

import useSpeechToText from 'react-hook-speech-to-text';
import api from "@/lib/api";

export default function LiveInterviewRoom() {
    const { id } = useParams();
    const router = useRouter();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [transcript, setTranscript] = useState<{ speaker: string, text: string }[]>([]);
    const [suggestions, setSuggestions] = useState<{ type: string, text: string }[]>([]);
    
    const [techScore, setTechScore] = useState(65);
    const [commScore, setCommScore] = useState(70);

    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    // Real-Time Effect: Aggregate transcript from Speech Recognition
    useEffect(() => {
        if (results.length > 0) {
            // Map results to the transcript format
            const newTranscript = results.map(r => ({
                speaker: "Audio Detected",
                text: typeof r === 'string' ? r : r.transcript
            }));
            
            // Only update if it grew
            if (newTranscript.length > transcript.length) {
                setTranscript(newTranscript);
            }
        }
    }, [results, transcript.length]);

    // Live AI Analysis Polling
    useEffect(() => {
        if (!isRecording || transcript.length === 0) return;

        const analyzeAudio = async () => {
            try {
                // Get last 10 lines of transcript to provide context
                const recentText = transcript.slice(-10).map(t => t.text).join(' ');
                
                if (recentText.length > 15) {
                    const res = await api.post('/ats/interviews/live-analysis', { transcript: recentText });
                    if (res.data) {
                        setTechScore(res.data.techScore || techScore);
                        setCommScore(res.data.commScore || commScore);
                        if (res.data.suggestions && res.data.suggestions.length > 0) {
                            setSuggestions(res.data.suggestions);
                        }
                    }
                }
            } catch (err) {
                console.error("Analysis error", err);
            }
        };

        const interval = setInterval(analyzeAudio, 8000); // Analyze every 8 seconds
        return () => clearInterval(interval);
    }, [isRecording, transcript]);

    const toggleMic = () => {
        if (isRecording) {
            stopSpeechToText();
            setIsMuted(true);
        } else {
            startSpeechToText();
            setIsMuted(false);
        }
    };

    // Auto-scroll transcript
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcript]);

    const handleEndCall = () => {
        router.push('/employer/interviews');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600/20 text-indigo-400">
                        <Video className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-100 leading-tight">Live Interview</h1>
                        <p className="text-xs text-slate-400">Candidate: John Doe • Frontend Engineer</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 px-2.5 py-1 flex gap-1.5 items-center">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Recording Active
                    </Badge>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Video Area */}
                <div className="flex-1 p-6 flex flex-col gap-6 relative">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                        {/* Candidate Video */}
                        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
                            {/* Simulated Camera feed placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 z-10"></div>
                            <div className="flex flex-col items-center justify-center text-slate-700">
                                <UserCheck className="h-20 w-20 mb-4 opacity-50" />
                                <p className="font-medium text-slate-500">Candidate Camera</p>
                            </div>
                            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                                <Badge className="bg-black/50 backdrop-blur text-white border-none">John Doe</Badge>
                                <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                            </div>
                        </div>

                        {/* Recruiter Video */}
                        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
                            <div className="flex flex-col items-center justify-center text-slate-700">
                                {isVideoOff ? (
                                    <VideoOff className="h-20 w-20 mb-4 opacity-50 text-red-500/50" />
                                ) : (
                                    <Video className="h-20 w-20 mb-4 opacity-50" />
                                )}
                                <p className="font-medium text-slate-500">Your Camera</p>
                            </div>
                            <div className="absolute bottom-4 left-4 z-20">
                                <Badge className="bg-black/50 backdrop-blur text-white border-none">You (Recruiter)</Badge>
                            </div>
                            {isMuted && (
                                <div className="absolute top-4 right-4 z-20 bg-red-500 text-white p-2 rounded-full">
                                    <MicOff className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Call Controls */}
                    <div className="h-20 flex items-center justify-center gap-4 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-4 mx-auto w-max">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className={`h-12 w-12 rounded-full border-slate-700 hover:bg-slate-800 ${!isRecording ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-slate-800 text-slate-200'}`}
                            onClick={toggleMic}
                        >
                            {!isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className={`h-12 w-12 rounded-full border-slate-700 hover:bg-slate-800 ${isVideoOff ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-slate-800 text-slate-200'}`}
                            onClick={() => setIsVideoOff(!isVideoOff)}
                        >
                            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 rounded-full bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                        >
                            <Settings className="h-5 w-5" />
                        </Button>
                        <div className="w-px h-8 bg-slate-800 mx-2"></div>
                        <Button 
                            variant="destructive" 
                            className="h-12 rounded-full px-6 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                            onClick={handleEndCall}
                        >
                            <PhoneOff className="h-5 w-5 mr-2" /> End Call
                        </Button>
                    </div>
                </div>

                {/* AI Copilot Sidebar */}
                <div className="w-96 border-l border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col relative z-10 shadow-2xl">
                    <div className="p-4 border-b border-slate-800 bg-indigo-950/30 flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-indigo-600/20 flex items-center justify-center">
                            <BrainCircuit className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-indigo-50">AI Copilot</h2>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">Live Analysis Active</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                        
                        {/* Live Performance */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-300 mb-2">
                                <Target className="h-4 w-4 text-emerald-400" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Live Performance</h3>
                            </div>
                            
                            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400 font-medium">Technical Depth</span>
                                        <span className="text-emerald-400 font-bold">{techScore}/100</span>
                                    </div>
                                    <Progress value={techScore} className="h-1.5 bg-slate-800 [&>div]:bg-emerald-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400 font-medium">Communication</span>
                                        <span className="text-blue-400 font-bold">{commScore}/100</span>
                                    </div>
                                    <Progress value={commScore} className="h-1.5 bg-slate-800 [&>div]:bg-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Smart Suggestions */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-300 mb-2">
                                <Zap className="h-4 w-4 text-amber-400" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Smart Suggestions</h3>
                            </div>
                            
                            {suggestions.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">Listening for opportunities to assist...</p>
                            ) : (
                                <div className="space-y-3">
                                    {suggestions.map((sugg, idx) => (
                                        <div key={idx} className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Badge variant="outline" className="text-[9px] bg-indigo-500/10 text-indigo-300 border-indigo-500/20">{sugg.type}</Badge>
                                            </div>
                                            <p className="text-sm text-indigo-100 leading-snug">{sugg.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-800 w-full my-4"></div>

                        {/* Live Transcript */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-slate-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-slate-400" />
                                    <h3 className="text-sm font-semibold uppercase tracking-wider">Live Transcript</h3>
                                </div>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>

                            <div className="space-y-4">
                                {transcript.length === 0 && (
                                    <p className="text-xs text-slate-500 italic">Waiting for speech...</p>
                                )}
                                {transcript.map((line, idx) => (
                                    <div key={idx} className={`flex flex-col items-end animate-in fade-in slide-in-from-bottom-2`}>
                                        <span className="text-[10px] text-slate-500 mb-1">Speaker</span>
                                        <div className="p-3 rounded-2xl max-w-[90%] text-sm bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-tr-sm">
                                            {line.text}
                                        </div>
                                    </div>
                                ))}
                                {interimResult && (
                                    <div className={`flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 opacity-50`}>
                                        <div className="p-3 rounded-2xl max-w-[90%] text-sm bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-tr-sm italic">
                                            {interimResult}
                                        </div>
                                    </div>
                                )}
                                {error && <p className="text-red-400 text-xs">Microphone access denied or error occurred.</p>}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
