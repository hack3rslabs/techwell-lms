"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Scale, Users, BookOpen, Briefcase, FileSignature, ShieldAlert, Zap, Building, GraduationCap, Server } from "lucide-react";

export default function TermsAndConditionsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const categories = [
    { id: "general", label: "General Terms", icon: FileSignature },
    { id: "training", label: "LMS & Training", icon: BookOpen },
    { id: "consultancy", label: "Consultancy & Recruitment", icon: Users },
    { id: "employers", label: "B2B & Employers", icon: Briefcase },
    { id: "campus", label: "Campus Drives", icon: Building },
    { id: "career", label: "Career Hub & Mentorship", icon: GraduationCap },
    { id: "ai", label: "AI & Data Privacy", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl shadow-inner mb-4">
          <Scale className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Master Terms of Service
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The comprehensive legal framework governing your use of Techwell's AI-Powered Learning Management System, Recruitment Solutions, and Enterprise APIs.
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4 shrink-0">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-4">Categories</h3>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeTab === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left w-full ${
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                  <span className="text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-3/4">
          <Card className="p-8 md:p-12 shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl min-h-[600px]">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-indigo-600 dark:prose-h2:text-indigo-400 text-justify text-sm md:text-base leading-loose">
              
              {activeTab === "general" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h2 className="text-3xl border-b pb-4 mb-6">1. General Master Terms</h2>
                    <p>
                      Welcome to Techwell. These Master Terms of Service govern your access to and use of all Techwell platforms, including our Learning Management System (LMS), Candidate Consultancy pipeline, ATS, Campus Drive software, and all related mobile or web applications.
                    </p>
                  </div>
                  <div>
                    <h3>1.1 Binding Agreement</h3>
                    <p>
                      By creating an account, signing a consultancy agreement, or purchasing a course, you enter into a legally binding contract with Techwell. You represent that you are of legal age to form a binding contract in your jurisdiction.
                    </p>
                  </div>
                  <div>
                    <h3>1.2 Strict Refund & Cancellation Policy</h3>
                    <div className="bg-rose-50 dark:bg-rose-950/30 p-6 rounded-2xl border border-rose-200 dark:border-rose-900 mt-6 shadow-sm">
                      <div className="flex gap-4 items-start">
                        <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
                        <div>
                          <h4 className="text-rose-800 dark:text-rose-200 font-bold text-lg mt-0 mb-2">Non-Refundable Clause</h4>
                          <p className="text-rose-700 dark:text-rose-300 m-0">
                            ALL PAYMENTS, FEES, RETAINERS, AND DEPOSITS MADE TO TECHWELL FOR ANY SERVICE (COURSES, CONSULTANCY, SOFTWARE) ARE STRICTLY AND CATEGORICALLY NON-REFUNDABLE UNDER ANY CIRCUMSTANCES. No pro-rated refunds or credit notes will be issued. Techwell vigorously disputes all unauthorized credit card chargebacks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "training" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h2 className="text-3xl border-b pb-4 mb-6">2. LMS & Training Programs</h2>
                    <p>
                      Techwell offers self-paced, live, and hybrid courses. Access to purchased courses is granted on a per-user basis.
                    </p>
                  </div>
                  <div>
                    <h3>2.1 Intellectual Property & Anti-Piracy</h3>
                    <p>
                      All course materials, videos, PDF guides, and code repositories are the exclusive intellectual property of Techwell. You are granted a limited, non-transferable license to view this content. Downloading (except where explicitly permitted), screen-recording, or distributing course content is strictly prohibited and will result in immediate account termination and legal action.
                    </p>
                  </div>
                  <div>
                    <h3>2.2 Certificate Issuance</h3>
                    <p>
                      Certificates of Completion are issued automatically upon meeting the course requirements (e.g., watching all videos, passing quizzes). Techwell reserves the right to revoke certificates if it is discovered that the candidate bypassed the system or cheated on assessments.
                    </p>
                  </div>
                  <div>
                    <h3>2.3 No Job Guarantee</h3>
                    <p>
                      Unless specifically advertised as a "100% Job Guarantee Program" with a signed explicit contract, enrollment in Techwell courses does not guarantee employment. We provide placement assistance, not placement assurance.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "consultancy" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h2 className="text-3xl border-b pb-4 mb-6">3. Consultancy & Recruitment</h2>
                    <p>
                      Candidates utilizing Techwell's Job Consultancy services agree to be represented by our placement team.
                    </p>
                  </div>
                  <div>
                    <h3>3.1 Digital Onboarding & Contracts</h3>
                    <p>
                      When invited to our consultancy pipeline, candidates must complete an online onboarding wizard. This process may require signing a digital Placement Agreement. This agreement legally binds you to the terms of our recruitment fee structure (if applicable for premium placement services).
                    </p>
                  </div>
                  <div>
                    <h3>3.2 Exclusivity of Representation</h3>
                    <p>
                      If Techwell introduces you to a corporate client, you are strictly prohibited from bypassing Techwell and applying directly to that client for a period of 12 months. Violation of this exclusivity will result in a penalty fee equivalent to the lost placement revenue.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "employers" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h2 className="text-3xl border-b pb-4 mb-6">4. B2B & Employer Services</h2>
                    <p>
                      Employers utilizing the Techwell Employer Portal, ATS, and Candidate Discovery tools agree to the following B2B terms.
                    </p>
                  </div>
                  <div>
                    <h3>4.1 Fair Use of Candidate Data</h3>
                    <p>
                      Employers may access candidate profiles solely for the purpose of recruitment. Data scraping, reselling candidate information, or using the data for direct marketing is a fundamental breach of this agreement.
                    </p>
                  </div>
                  <div>
                    <h3>4.2 Placement Fees</h3>
                    <p>
                      For employers using our "Pay-per-Hire" model, the placement fee is triggered the day the candidate accepts the offer letter. Techwell offers a 60-day replacement guarantee if the candidate absconds, subject to the terms of the Master Service Agreement (MSA) signed offline.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "campus" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h2 className="text-3xl border-b pb-4 mb-6">5. Campus Drives & Institutes</h2>
                    <p>
                      Colleges and Institutes partnering with Techwell for Campus Hiring and Assessments must adhere to these operational guidelines.
                    </p>
                  </div>
                  <div>
                    <h3>5.1 Academic Integrity</h3>
                    <p>
                      Institutes are responsible for ensuring candidates do not engage in malpractice during Techwell-proctored online assessments. Techwell reserves the right to blacklist entire college batches if systemic cheating is detected via our AI Proctoring tools.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "career" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h2 className="text-3xl border-b pb-4 mb-6">6. Career Hub & Resume Builder</h2>
                    <p>
                      Techwell provides tools such as an AI Resume Builder and LinkedIn Profile Analyzer.
                    </p>
                  </div>
                  <div>
                    <h3>6.1 Template Usage</h3>
                    <p>
                      The resume templates provided are for personal use only. Users may not export and resell these templates.
                    </p>
                  </div>
                  <div>
                    <h3>6.2 AI Scoring Accuracy</h3>
                    <p>
                      The "ATS Compatibility Score" provided by our Career Hub is an algorithmic estimate. We do not guarantee that achieving a 100% score will result in an interview call from external companies, as hiring criteria vary wildly across organizations.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h2 className="text-3xl border-b pb-4 mb-6">7. AI, Mock Interviews & Privacy</h2>
                    <p>
                      Techwell extensively utilizes Large Language Models (LLMs) for AI Mock Interviews, Audio processing, and chat assistance.
                    </p>
                  </div>
                  <div>
                    <h3>7.1 Data Processing</h3>
                    <p>
                      By using the AI Mock Interview feature, you consent to your voice and text inputs being processed by third-party providers (e.g., OpenAI, Google Gemini, Twilio) for transcription and analysis. Techwell anonymizes this data where possible and does not permit third parties to train public models on your proprietary answers.
                    </p>
                  </div>
                  <div>
                    <h3>7.2 GDPR & Data Deletion</h3>
                    <p>
                      Techwell complies with global data protection standards. Users may request full account deletion via the GDPR preferences panel in their account settings. Upon request, all PII (Personally Identifiable Information) will be purged within 30 days, except where retention is legally required for financial auditing.
                    </p>
                  </div>
                </div>
              )}



            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
