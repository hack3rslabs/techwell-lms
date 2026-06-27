"use client";

import { Lightbulb, WebcamIcon, Loader2, Clock, Users, CheckCircle, Shield, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// --- Interviewer Panel Data ---
const INTERVIEW_PANELS = [
  {
    id: "hr_manager",
    name: "HR Manager",
    title: "Human Resources",
    focus: "Culture fit, behavioral, HR questions",
    emoji: "👩‍💼",
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-400",
    bgColor: "bg-violet-50",
  },
  {
    id: "tech_lead",
    name: "Tech Lead",
    title: "Engineering Lead",
    focus: "Technical deep-dive, problem solving, code",
    emoji: "👨‍💻",
    color: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-400",
    bgColor: "bg-blue-50",
  },
  {
    id: "cto",
    name: "CTO",
    title: "Chief Technology Officer",
    focus: "System design, architecture, leadership",
    emoji: "🧠",
    color: "from-orange-500 to-red-600",
    borderColor: "border-orange-400",
    bgColor: "bg-orange-50",
  },
  {
    id: "product_manager",
    name: "Product Manager",
    title: "Product & Strategy",
    focus: "Product thinking, impact, collaboration",
    emoji: "📊",
    color: "from-emerald-500 to-green-600",
    borderColor: "border-emerald-400",
    bgColor: "bg-emerald-50",
  },
];

// --- Duration Options ---
const DURATIONS = [
  { value: 15, label: "15 min", desc: "5 questions — Quick Practice" },
  { value: 30, label: "30 min", desc: "10 questions — Standard" },
  { value: 45, label: "45 min", desc: "15 questions — Thorough" },
  { value: 60, label: "60 min", desc: "20 questions — Full Interview" },
];

export default function PreInterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  const [selectedPanel, setSelectedPanel] = useState(INTERVIEW_PANELS[0]);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]);

  useEffect(() => {
    fetchInterviewDetails();
  }, [params.id]);

  const fetchInterviewDetails = async () => {
    try {
      const res = await api.get(`/interviews/${params.id}`);
      setInterviewData(res.data.interview);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setStarting(true);
    try {
      // Update interview with selected duration and panel before starting
      await api.patch(`/interviews/${params.id}`, {
        duration: selectedDuration.value,
        technology: interviewData?.technology
          ? `${interviewData.technology} | Panel: ${selectedPanel.name}`
          : `Panel: ${selectedPanel.name}`,
      });
      router.push(
        `/student/career-hub/mock-interview/${params.id}/start?panel=${selectedPanel.id}&duration=${selectedDuration.value}`
      );
    } catch (err) {
      // Still proceed even if patch fails
      router.push(
        `/student/career-hub/mock-interview/${params.id}/start?panel=${selectedPanel.id}&duration=${selectedDuration.value}`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="my-10 text-center text-red-500 font-semibold">
        Interview not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-10 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="h-4 w-4" /> AI-Powered Real-Time Mock Interview
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Configure Your Interview
          </h1>
          <p className="text-muted-foreground text-lg">
            Role: <span className="font-semibold text-foreground">{interviewData.role}</span>
            {" "}&bull;{" "}
            Domain: <span className="font-semibold text-foreground">{interviewData.domain}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

          {/* ─── Left Column ─── */}
          <div className="space-y-8">

            {/* Step 1: Choose Panel */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Choose Your Interviewer
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTERVIEW_PANELS.map((panel) => (
                  <button
                    key={panel.id}
                    onClick={() => setSelectedPanel(panel)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md",
                      selectedPanel.id === panel.id
                        ? `${panel.borderColor} ${panel.bgColor} shadow-lg ring-2 ring-offset-2 ring-primary/30`
                        : "border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700"
                    )}
                  >
                    {selectedPanel.id === panel.id && (
                      <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                    )}
                    <div className="mb-2 w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 overflow-hidden text-3xl mx-auto md:mx-0">
                      {interviewData?.aiAvatarUrl ? (
                          <img src={interviewData.aiAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          panel.emoji
                      )}
                    </div>
                    <div className="font-bold text-sm">{panel.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{panel.title}</div>
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-2 opacity-80">{panel.focus}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Choose Duration */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Select Duration
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    onClick={() => setSelectedDuration(dur)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all duration-200",
                      selectedDuration.value === dur.value
                        ? "border-primary bg-primary/5 shadow-md ring-2 ring-offset-2 ring-primary/30"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700"
                    )}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-primary">{dur.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{dur.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="p-5 border rounded-xl border-amber-300 bg-amber-50 dark:bg-amber-900/20">
              <h2 className="flex gap-2 items-center text-amber-700 dark:text-amber-400 mb-3 font-bold">
                <Lightbulb className="h-5 w-5" /> Interview Pattern
              </h2>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
                <li className="flex gap-2"><span className="font-bold shrink-0">Start →</span> Self Intro &amp; Opening HR Questions</li>
                <li className="flex gap-2"><span className="font-bold shrink-0">Middle →</span> Technical / Domain / Skills based on your Role &amp; Resume</li>
                <li className="flex gap-2"><span className="font-bold shrink-0">End →</span> Behavioral &amp; Closing HR Questions (Salary, Notice Period)</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p>✅ Enable WebCam &amp; Microphone for a real interview feel.</p>
                <p>✅ Video is NOT stored — it&apos;s only for your simulated environment.</p>
                <p>✅ Click the 🔊 icon to have the question read aloud to you.</p>
              </div>
            </div>
          </div>

          {/* ─── Right Column ─── */}
          <div className="flex flex-col gap-6">
            {/* Interviewer Preview Card */}
            <div className={cn("rounded-2xl p-6 text-white bg-gradient-to-br shadow-xl", selectedPanel.color)}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden text-5xl shrink-0">
                    {interviewData?.aiAvatarUrl ? (
                        <img src={interviewData.aiAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        selectedPanel.emoji
                    )}
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold">{selectedPanel.name}</h3>
                  <p className="opacity-90">{selectedPanel.title}</p>
                  <p className="opacity-75 text-sm mt-1">{selectedPanel.focus}</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/20 rounded-xl text-sm">
                <p className="font-semibold">📋 Your {selectedDuration.label} interview will include:</p>
                <ul className="mt-2 space-y-1 opacity-90">
                  <li>• 5 Opening HR Questions (Self Intro, Strengths, Goals…)</li>
                  <li>• Technical Questions based on your Role &amp; Skills</li>
                  <li>• 5 Closing Questions (Salary, Notice Period, Achievements)</li>
                </ul>
              </div>
            </div>

            {/* Webcam Section */}
            <div className="border-2 rounded-2xl overflow-hidden bg-slate-900 relative min-h-[280px] flex items-center justify-center">
              {webCamEnabled ? (
                <Webcam
                  onUserMedia={() => setWebCamEnabled(true)}
                  onUserMediaError={() => setWebCamEnabled(false)}
                  mirrored={true}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-10">
                  <WebcamIcon className="h-20 w-20 mb-4 text-slate-500" />
                  <p className="text-slate-400 text-sm">Enable your webcam to get into the right mindset.</p>
                </div>
              )}
              {webCamEnabled && (
                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div> Camera Active
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setWebCamEnabled((prev) => !prev)}
            >
              {webCamEnabled ? "🔴 Turn Off Camera" : "📷 Enable WebCam & Microphone"}
            </Button>

            {/* Start Button */}
            <Button
              size="lg"
              className="w-full text-lg h-14 font-bold shadow-lg"
              onClick={handleStartInterview}
              disabled={starting}
            >
              {starting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing Interview...</>
              ) : (
                <>Start Interview with {selectedPanel.name} <ChevronRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
