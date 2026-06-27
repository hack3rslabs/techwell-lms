"use client";

import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Plus, Trash2, Eye, Download, Save, X, Sparkles, CheckCircle2, AlertCircle, Info, FileText } from "lucide-react";
import { toast } from "sonner";

import AtsTemplate1 from "./templates/AtsTemplate1";
import ClassicTemplate2 from "./templates/ClassicTemplate2";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import IndiaTemplate from "./templates/IndiaTemplate";
import UsTemplate from "./templates/UsTemplate";
import UkTemplate from "./templates/UkTemplate";
import GermanyTemplate from "./templates/GermanyTemplate";

type TemplateType = "ats1" | "classic" | "executive" | "creative" | "india" | "us" | "uk" | "germany";

const initialState = {
  fullName: "",
  phone: "",
  email: "",
  location: "",
  linkedIn: "",
  github: "",
  portfolio: "",
  domain: "",
  targetRole: "",
  experienceLevel: "",
  summary: "",
  technicalSkills: [] as string[],
  toolsPlatforms: [] as string[],
  softSkills: [] as string[],
  experience: [
    {
      jobTitle: "",
      companyName: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
      toolsUsed: "",
      resultsAchieved: "",
    },
  ],
  projects: [
    {
      name: "",
      description: "",
      technologies: "",
      role: "",
      outcome: "",
      githubUrl: "",
      liveUrl: "",
      startDate: "",
      endDate: "",
    },
  ],
  education: [
    {
      degree: "",
      fieldOfStudy: "",
      institution: "",
      location: "",
      startYear: "",
      endYear: "",
      percentage: "",
    },
  ],
  certifications: [
    {
      name: "",
      organization: "",
      issueDate: "",
      expiryDate: "",
    },
  ],
  languages: [{ name: "", proficiency: "" }],
  achievements: [{ text: "" }],
  awards: [{ text: "" }],
  interests: [{ name: "" }],
  template: "ats1" as TemplateType,
};

type ResumeFormData = typeof initialState;

const TEMPLATES: Record<TemplateType, React.FC<any>> = {
  ats1: AtsTemplate1,
  classic: ClassicTemplate2,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  india: IndiaTemplate,
  us: UsTemplate,
  uk: UkTemplate,
  germany: GermanyTemplate,
};

export default function ResumeBuilder() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ResumeFormData>(initialState);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  // Access and Paywall states
  const [hasAccess, setHasAccess] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isPaidCourseAccess, setIsPaidCourseAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // AI input states
  const [jdInput, setJdInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");
  const [enhancing, setEnhancing] = useState(false);

  const checkAccess = async () => {
    if (!isAuthenticated) {
      setHasAccess(false);
      return;
    }
    setCheckingAccess(true);
    try {
      const res = await api.get('/resume/check-access');
      setHasAccess(res.data.hasAccess);
      setDaysRemaining(res.data.daysRemaining || 0);
      setIsPaidCourseAccess(res.data.hasPaidCourse || false);
    } catch (err) {
      console.error("Error checking access status:", err);
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        await checkAccess();
        try {
          const res = await api.get('/resume');
          if (res.data && res.data.exists) {
            setForm(res.data.resume);
          }
        } catch (err) {
          console.error("Failed to fetch resume:", err);
        }
      }
      setFetching(false);
    };

    init();
  }, [isAuthenticated]);

  const TemplateComponent = TEMPLATES[form.template as TemplateType] || AtsTemplate1;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (section: keyof typeof initialState, idx: number, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any, i: number) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = (section: keyof typeof initialState, emptyObj: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: [...(prev[section] as any[]), emptyObj],
    }));
  };

  const handleRemoveItem = (section: keyof typeof initialState, idx: number) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_: any, i: number) => i !== idx),
    }));
  };

  const handleAddTag = (category: keyof typeof initialState, e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    const value = tagInputs[category as string]?.trim();
    if (!value) return;
    const currentTags = (form[category] as string[]) || [];
    if (!currentTags.find(t => t.toLowerCase() === value.toLowerCase())) {
        setForm({ ...form, [category]: [...currentTags, value] });
    }
    setTagInputs({ ...tagInputs, [category as string]: "" });
  };

  const handleRemoveTag = (category: keyof typeof initialState, idx: number) => {
    setForm({ ...form, [category]: ((form[category] as string[]) || []).filter((_, i) => i !== idx) });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, template: e.target.value as TemplateType });
  };

  const renderTextInput = (label: string, name: string, placeholder?: string) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            name={name}
            value={(form as any)[name] || ""}
            onChange={handleChange}
            placeholder={placeholder || label}
            className="border border-gray-300 p-2 w-full rounded-sm shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm"
        />
    </div>
  );

  const renderArrayTextInput = (label: string, section: keyof typeof initialState, idx: number, field: string, placeholder?: string) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            value={((form[section] as any[])[idx] as any)?.[field] || ""}
            onChange={(e) => handleArrayChange(section, idx, field, e.target.value)}
            placeholder={placeholder || label}
            className="border border-gray-300 p-2 w-full rounded-sm shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm"
        />
    </div>
  );

  const renderTagInput = (label: string, category: keyof typeof initialState, placeholder: string) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
            {((form[category] as string[]) || []).map((tag, idx) => (
                <span key={idx} className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-sm text-xs border border-gray-200 group">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(category, idx)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
        </div>
        <input
            value={tagInputs[category as string] || ""}
            onChange={(e) => setTagInputs({ ...tagInputs, [category as string]: e.target.value })}
            onKeyDown={(e) => handleAddTag(category, e)}
            placeholder={placeholder}
            className="border border-gray-300 p-2 w-full rounded-sm shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-sm"
        />
        <p className="text-[10px] text-gray-400 mt-1 pl-1">Press Enter to add</p>
    </div>
  );

  const executeWithAccess = async (action: () => void | Promise<void>) => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed.");
      router.push("/login?redirect=/resume-builder");
      return;
    }
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }
    await action();
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUnlockResume = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to unlock the Resume Builder.");
      router.push("/login?redirect=/resume-builder");
      return;
    }
    setLoading(true);
    try {
      const { data: order } = await api.post("/payments/create-order", {
        courseId: "resume-builder",
        amount: 59,
        currency: "INR",
      });

      if (order.gateway === "FREE") {
        toast.success("Unlocked successfully!");
        setHasAccess(true);
        setShowPaywall(false);
        return;
      }

      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Techwell LMS",
        description: "Unlock ATS Resume Builder (3 Months Access)",
        order_id: order.orderId || order.id,
        handler: async function (response: any) {
          try {
             await api.post("/payments/verify-payment", {
               razorpay_order_id: order.orderId || order.id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature,
             });
             toast.success("Payment verified! Resume builder unlocked for 3 months.");
             setHasAccess(true);
             setShowPaywall(false);
             await checkAccess();
          } catch (err) {
             toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Unlock Error:", err);
      toast.error(err.response?.data?.error || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const res = await api.post('/resume/enhance', {
        resumeData: form,
        jd: jdInput,
        designation: designationInput
      });
      if (res.data && res.data.enhancedResume) {
        setForm(res.data.enhancedResume);
        toast.success("Resume optimized and tailored for ATS!");
      } else {
        toast.error("Failed to enhance resume");
      }
    } catch (err: any) {
      console.error("AI Enhance Error:", err);
      toast.error(err.response?.data?.message || "Failed to enhance resume");
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post('/resume', form);
      toast.success("Progress saved successfully!");
    } catch (err: any) {
      if (err.response?.status === 403) {
        setShowPaywall(true);
      } else {
        setError(err.response?.data?.message || "Failed to save resume");
        toast.error("Failed to save resume");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("resume-preview-export");
    if (!element) return;
    setIsDownloading(true);

    const opt = {
      margin: [0, 0] as [number, number],
      filename: `${form.fullName || "Resume"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        allowTaint: true,
        logging: true,
        onclone: (clonedDoc: Document) => {
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el: any) => {
            const style = window.getComputedStyle(el);
            
            ["color", "backgroundColor", "borderColor", "fill", "stroke"].forEach(prop => {
              const val = (style as any)[prop];
              if (typeof val === 'string' && (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab('))) {
                if (prop === 'color' && !el.closest('header')) {
                  el.style[prop] = '#111827'; 
                } else if (prop === 'backgroundColor' && (val.includes('indigo') || val.includes('blue'))) {
                  el.style[prop] = '#1469E2';
                } else {
                  el.style[prop] = '#334155';
                }
              }
            });
          });

          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const css = styleTags[i].innerHTML;
            if (css.includes('lab(') || css.includes('oklch(') || css.includes('oklab(')) {
              styleTags[i].innerHTML = css
                .replace(/lab\([^)]+\)/g, '#334155')
                .replace(/oklch\([^)]+\)/g, '#1469E2')
                .replace(/oklab\([^)]+\)/g, '#334155');
            }
          }
        }
      },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    };

    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (el, pseudo) => {
        const style = originalGetComputedStyle(el, pseudo);
        return new Proxy(style, {
            get(target, prop) {
                const val = (target as any)[prop];
                if (typeof prop === 'string' && typeof val === 'string') {
                    if (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab(')) {
                        return '#1469E2';
                    }
                }
                return typeof val === 'function' ? val.bind(target) : val;
            }
        });
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        window.getComputedStyle = originalGetComputedStyle;
        setIsDownloading(false);
      })
      .catch(err => {
        window.getComputedStyle = originalGetComputedStyle;
        console.error("PDF Error:", err);
        setIsDownloading(false);
      });
  };

  if (authLoading || fetching || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-gray-100 to-white flex flex-col font-sans">
      {/* Dynamic Glassmorphism Header */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 tracking-tight flex items-center gap-2">
                        Resume Builder
                        {hasAccess && (
                          <span className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-emerald-200/50 shadow-sm uppercase tracking-wider">PRO</span>
                        )}
                    </h1>
                    <p className="text-[12px] text-gray-500 font-medium">
                        Craft your professional story
                    </p>
                  </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap justify-center bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100/80 shadow-inner">
                <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider pr-2 border-r border-gray-100">Layout</label>
                    <select value={form.template} onChange={handleTemplateChange} className="bg-transparent text-sm font-semibold text-gray-700 px-2 outline-none appearance-none cursor-pointer">
                        <option value="ats1">Standard ATS</option>
                        <option value="classic">Classic Corporate</option>
                        <option value="executive">Executive Board</option>
                        <option value="creative">Modern Creative</option>
                        <option value="india">India Standard</option>
                        <option value="us">US Standard (ATS Pro)</option>
                        <option value="uk">UK Standard (References)</option>
                        <option value="germany">Germany Standard (Lebenslauf)</option>
                    </select>
                </div>

                <div className="h-8 w-px bg-gray-200/50 mx-1 hidden md:block"></div>

                <button onClick={() => executeWithAccess(handleSubmit)} disabled={loading} className="bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 hover:text-gray-900 border border-gray-200 transition-all shadow-sm active:scale-95 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Save className="w-4 h-4 text-indigo-500" />}
                    <span className="hidden sm:inline">{loading ? "Saving..." : "Save"}</span>
                </button>

                <button onClick={() => setShowPreview(!showPreview)} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 ${showPreview ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}>
                    <Eye className={`w-4 h-4 ${showPreview ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="hidden sm:inline">{showPreview ? "Edit Mode" : "Preview"}</span>
                </button>

                <button onClick={() => executeWithAccess(downloadPDF)} disabled={isDownloading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50">
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isDownloading ? "Generating..." : "Download"}</span>
                </button>
            </div>
        </div>
      </div>

      {/* Access Information Banner */}
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4 animate-in slide-in-from-top duration-300">
        {hasAccess ? (
          isPaidCourseAccess ? (
            <div className="bg-green-50 border border-green-200 rounded-sm p-3 flex items-center gap-2 text-green-900 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
              <div>
                <strong>Student Pro Access Active:</strong> Free, unlimited access to resume tailoring and downloads via your Techwell course enrollment.
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-center gap-2 text-blue-900 text-sm">
              <Info className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <strong>Pro Access Active:</strong> Unlimited access is active (<strong>{daysRemaining} days remaining</strong>).
              </div>
            </div>
          )
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3 flex items-center gap-2 text-yellow-900 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-700 shrink-0" />
            <div>
              <strong>Preview Mode:</strong> Build your resume below. <strong>Unlock Pro Access</strong> or enroll in a course to save, optimize, and download.
            </div>
          </div>
        )}
      </div>

      {/* Paywall Overlay Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-md max-w-md w-full text-center border border-gray-200 shadow-xl relative">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Lock className="w-5 h-5 text-gray-700" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Pro Access Required</h2>
            <p className="text-gray-600 text-sm mb-6">
              Unlock PDF downloads, cloud saving, and AI ATS optimization.
            </p>

            <div className="bg-gray-50 rounded-sm p-4 border border-gray-200 mb-6 text-left space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>₹59 for 3 Months Unlimited Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>FREE with any course enrollment</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleUnlockResume} 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Unlock for ₹59
              </button>
              <button 
                onClick={() => {
                  setShowPaywall(false);
                  router.push("/courses");
                }}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2.5 rounded-sm transition-all text-sm"
              >
                Explore Courses
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-8">

      <div className={`container mx-auto px-4 pb-20 grid grid-cols-1 ${showPreview ? "lg:grid-cols-2" : "max-w-4xl mx-auto"} gap-10`}>
        <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-200 space-y-8">
          
        {/* AI ATS Optimization Panel */}
        <section className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sparkles className="w-4 h-4 text-gray-700" />
            <h3 className="text-base font-bold text-gray-900 tracking-tight">AI Resume Optimization</h3>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-gray-600 uppercase">Target Designation</label>
              <input
                value={designationInput}
                onChange={(e) => setDesignationInput(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="border border-gray-300 p-2 w-full rounded-sm outline-none text-sm focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs font-semibold text-gray-600 uppercase">Job Description (JD)</label>
              <textarea
                value={jdInput}
                onChange={(e) => setJdInput(e.target.value)}
                placeholder="Paste the target job description here..."
                className="border border-gray-300 p-2 w-full rounded-sm min-h-[80px] outline-none text-sm focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              type="button"
              onClick={() => executeWithAccess(handleEnhance)}
              disabled={enhancing}
              className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm"
            >
              {enhancing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimize for ATS</span>
                </>
              )}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderTextInput("Full Name", "fullName", "e.g. John Doe")}
              {renderTextInput("Phone Number", "phone", "e.g. +1 234 567 8900")}
              {renderTextInput("Email Address", "email", "e.g. john.doe@techwell.com")}
              {renderTextInput("Current Location", "location", "e.g. New York, NY, USA")}
              {renderTextInput("LinkedIn Profile URL", "linkedIn", "https://linkedin.com/in/...")}
              {renderTextInput("Portfolio / GitHub URL", "github", "https://github.com/...")}
          </div>
        </section>

        <section className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Target Role & Domain</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium text-gray-700">Domain / Industry</label>
                  <select name="domain" value={form.domain} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-md outline-none">
                      <option value="">Select Domain</option>
                      <option value="IT & Software">IT & Software</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Others">Others</option>
                  </select>
              </div>
              {renderTextInput("Target Job Role", "targetRole", "e.g. DevOps Engineer")}
              <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium text-gray-700">Experience </label>
                  <input name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-md outline-none">
                      </input>
                  
              </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Professional Summary</h3>
          </div>
          <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700 italic text-gray-500 mb-1">Highlight years of exp, 2-3 major skills, and career focus.</label>
              <textarea name="summary" value={form.summary} onChange={handleChange} className="border border-gray-300 p-4 w-full rounded-sm shadow-sm focus:ring-2 focus:ring-blue-500 min-h-[140px] outline-none transition-all" placeholder="e.g. Motivated Cloud Architect with 5+ years of experience in AWS & Azure..." />
          </div>
        </section>

        <section className="space-y-8">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Skills & Core Competencies</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderTagInput("Technical Stack", "technicalSkills", "e.g. Python, React, Next.js")}
              {renderTagInput("Tools & Platforms", "toolsPlatforms", "e.g. AWS, Docker, Jira")}
              {renderTagInput("Soft & Functional", "softSkills", "e.g. Leadership, Agile, Communication")}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
             <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Professional Experience</h3>
             </div>
             <button type="button" onClick={() => handleAddItem("experience", { jobTitle: "", companyName: "", location: "", startDate: "", endDate: "", description: "", toolsUsed: "", resultsAchieved: "" })} className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-100">
                <Plus className="w-4 h-4" /> Add Job
             </button>
          </div>
          <div className="space-y-8">
            {form.experience.map((exp: any, idx: number) => (
              <div key={idx} className="p-8 bg-white border border-gray-100 rounded-sm shadow-sm relative group">
                <button onClick={() => handleRemoveItem("experience", idx)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5"/>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-8 mb-6">
                   {renderArrayTextInput("Job Title", "experience", idx, "jobTitle", "e.g. Senior Software Engineer")}
                   {renderArrayTextInput("Company Name", "experience", idx, "companyName", "e.g. Google")}
                   {renderArrayTextInput("Location", "experience", idx, "location", "e.g. Remote / London")}
                   <div className="grid grid-cols-2 gap-4">
                        {renderArrayTextInput("Start Date", "experience", idx, "startDate", "MM/YYYY")}
                        {renderArrayTextInput("End Date", "experience", idx, "endDate", "MM/YYYY (or Present)")}
                   </div>
                </div>
                <div className="space-y-6 mr-8">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Responsibilities</label>
                        <textarea value={exp.description} onChange={(e) => handleArrayChange("experience", idx, "description", e.target.value)} className="border border-gray-200 p-4 rounded-sm h-32 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700" placeholder="Describe your core role and duties..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-blue-500 uppercase tracking-widest pl-1">Tools & Technologies Used</label>
                            <input value={exp.toolsUsed} onChange={(e) => handleArrayChange("experience", idx, "toolsUsed", e.target.value)} className="border border-blue-100 bg-blue-50/30 p-3 rounded-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. AWS, Terraform, Docker" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest pl-1">Results & Impact (Numbers)</label>
                            <input value={exp.resultsAchieved} onChange={(e) => handleArrayChange("experience", idx, "resultsAchieved", e.target.value)} className="border border-emerald-100 bg-emerald-50/30 p-3 rounded-sm outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g. Reduced latency by 40%, Led team of 10" />
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
             <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Key Projects</h3>
             </div>
             <button type="button" onClick={() => handleAddItem("projects", { name: "", technologies: "", githubUrl: "", liveUrl: "", role: "", description: "", outcome: "" })} className="flex items-center gap-2 text-sm bg-gray-900 text-white px-4 py-2 rounded-sm hover:bg-gray-850 font-bold transition-all shadow-lg">
                <Plus className="w-4 h-4" /> Add Project
             </button>
          </div>
          <div className="space-y-6">
            {form.projects.map((proj: any, idx: number) => (
              <div key={idx} className="p-8 bg-gray-50/50 border border-gray-100 rounded-sm relative">
                <button onClick={() => handleRemoveItem("projects", idx)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5"/>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-8 mb-6">
                   {renderArrayTextInput("Project Title", "projects", idx, "name", "e.g. AI-Powered LMS")}
                   {renderArrayTextInput("Technologies Used", "projects", idx, "technologies", "e.g. Next.js, OpenAI, Python")}
                   {renderArrayTextInput("GitHub URL", "projects", idx, "githubUrl", "https://github.com/...")}
                   {renderArrayTextInput("Live Demo URL", "projects", idx, "liveUrl", "https://...")}
                   {renderArrayTextInput("Your Role", "projects", idx, "role", "e.g. Frontend Architecture Lead")}
                </div>
                <div className="space-y-4 mr-8">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Project Description (Problem Solved)</label>
                        <textarea value={proj.description} onChange={(e) => handleArrayChange("projects", idx, "description", e.target.value)} className="border border-gray-200 p-4 rounded-sm h-24 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="State the problem you addressed..." />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-pink-500 uppercase tracking-widest pl-1">Outcome / Final Result</label>
                        <input value={proj.outcome} onChange={(e) => handleArrayChange("projects", idx, "outcome", e.target.value)} className="border border-pink-100 bg-pink-50/30 p-3 rounded-sm outline-none focus:ring-2 focus:ring-pink-500 text-sm" placeholder="e.g. Achieved 95% accuracy, Saved 20 hours/week" />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Education</h3>
                    </div>
                    <button type="button" onClick={() => handleAddItem("education", { degree: "", fieldOfStudy: "", institution: "", endYear: "", percentage: "" })} className="text-gray-600 text-xs font-bold hover:text-gray-900 transition-colors">+ Add</button>
                </div>
                <div className="space-y-4 md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {form.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-sm border border-gray-200 relative group">
                            <button onClick={() => handleRemoveItem("education", idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                            <div className="space-y-3">
                                {renderArrayTextInput("Degree", "education", idx, "degree", "e.g. B.Tech")}
                                {renderArrayTextInput("Specialization", "education", idx, "fieldOfStudy", "e.g. Computer Science")}
                                {renderArrayTextInput("Institution", "education", idx, "institution", "College Name")}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                     {renderArrayTextInput("Year of Graduation", "education", idx, "endYear", "YYYY")}
                                     {renderArrayTextInput("CGPA / Percentage", "education", idx, "percentage", "e.g. 8.5 or 85%")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="space-y-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Certifications</h3>
                    </div>
                    <button type="button" onClick={() => handleAddItem("certifications", { name: "", organization: "", issueDate: "" })} className="text-gray-600 text-xs font-bold hover:text-gray-900 transition-colors">+ Add</button>
                </div>
                <div className="space-y-4 md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {form.certifications.map((cert: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-sm border border-gray-200 relative group">
                            <button onClick={() => handleRemoveItem("certifications", idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                            <div className="space-y-3">
                                {renderArrayTextInput("Cert Name", "certifications", idx, "name", "e.g. AWS CCP")}
                                {renderArrayTextInput("Organization", "certifications", idx, "organization", "e.g. Amazon")}
                                {renderArrayTextInput("Year / Date", "certifications", idx, "issueDate", "YYYY or MM/YYYY")}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        <section className="space-y-10 border-t border-gray-200 pt-10">
            <div className="border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Additional Information</h3>
          </div>
            <div className="grid grid-cols-1 gap-12">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <label className="font-bold text-gray-600 uppercase tracking-widest text-xs block border-b border-gray-200 pb-2">Achievements & Awards</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase pl-1">Key Achievements</p>
                                {form.achievements.map((ach: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 group">
                                         <input value={ach.text} onChange={(e) => handleArrayChange("achievements", idx, "text", e.target.value)} className="border border-gray-100 p-2.5 rounded-sm w-full text-xs shadow-sm" placeholder="Achievement bullet..." />
                                         <button onClick={() => handleRemoveItem("achievements", idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddItem("achievements", { text: "" })} className="text-[10px] text-blue-500 font-bold hover:underline">+ Add Achievement</button>
                             </div>
                             <div className="space-y-3">
                                <p className="text-[10px] font-bold text-gray-300 uppercase pl-1">Honors & Recognitions</p>
                                {form.awards.map((aw: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 group">
                                         <input value={aw.text} onChange={(e) => handleArrayChange("awards", idx, "text", e.target.value)} className="border border-gray-100 p-2.5 rounded-sm w-full text-xs shadow-sm bg-amber-50/20 border-amber-100/50" placeholder="Award description..." />
                                         <button onClick={() => handleRemoveItem("awards", idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddItem("awards", { text: "" })} className="text-[10px] text-amber-600 font-bold hover:underline">+ Add Award</button>
                             </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-sm border border-gray-100">
                         <div className="space-y-4">
                            <label className="font-black text-gray-700 uppercase tracking-widest text-xs border-b border-gray-200 pb-2 block">Languages Known</label>
                            <div className="space-y-2">
                                {form.languages.map((l: any, i: number) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input value={l.name} onChange={(e) => handleArrayChange("languages", i, "name", e.target.value)} className="border border-gray-200 p-2 rounded-sm text-xs w-full bg-white" placeholder="Language" />
                                        <select value={l.proficiency} onChange={(e) => handleArrayChange("languages", i, "proficiency", e.target.value)} className="border border-gray-200 p-2 rounded-sm text-[10px] font-bold bg-white outline-none">
                                            <option value="">Level</option>
                                            <option value="Native">Native</option>
                                            <option value="Fluent">Fluent</option>
                                            <option value="Professional">Professional</option>
                                            <option value="Elementary">Elementary</option>
                                        </select>
                                        <button onClick={() => handleRemoveItem("languages", i)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddItem("languages", { name: "", proficiency: "" })} className="text-[10px] text-blue-500 font-bold">+ New Language</button>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="font-black text-gray-700 uppercase tracking-widest text-xs border-b border-gray-200 pb-2 block">Hobbies & Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {form.interests.map((it: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                                         <input value={it.name} onChange={(e) => handleArrayChange("interests", i, "name", e.target.value)} className="bg-transparent text-[10px] font-bold w-20 outline-none" placeholder="Interest" />
                                         <button onClick={() => handleRemoveItem("interests", i)} className="text-gray-300 hover:text-red-500"><X className="w-3 h-3"/></button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddItem("interests", { name: "" })} className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500">+</button>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  </div>

      {showPreview && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in fade-in duration-300">
            <div className="h-full w-full flex flex-col">
                <div className="bg-gray-900 border-b border-gray-800 px-10 py-5 flex justify-between items-center shrink-0 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowPreview(false)} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-sm transition-all active:scale-95">
                            <X className="w-8 h-8"/>
                        </button>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Full-Screen <span className="text-blue-400">Preview</span></h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] opacity-70">Recruiter-Ready Document</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => executeWithAccess(downloadPDF)} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-sm text-base font-black flex items-center gap-3 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 disabled:opacity-70">
                            {isDownloading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6"/>}
                            {isDownloading ? "Generating PDF..." : "Download Now"}
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-20 flex justify-center bg-gray-50 custom-scrollbar">
                    <div className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] mb-20">
                        <TemplateComponent {...form} name={form.fullName} />
                    </div>
                </div>
            </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: '-10000px', top: '0', pointerEvents: 'none', color: '#000000' }}>
        <div id="resume-preview-export" className="bg-white text-black w-[794px] pdf-safe-colors" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
            <TemplateComponent {...form} name={form.fullName} />
        </div>
      </div>
    </div>
  );
}
