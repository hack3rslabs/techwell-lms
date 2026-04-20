"use client";

import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Plus, Trash2, Eye, Download, Save, X } from "lucide-react";

import AtsTemplate1 from "./templates/AtsTemplate1";
import ClassicTemplate2 from "./templates/ClassicTemplate2";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";

type TemplateType = "ats1" | "classic" | "executive" | "creative";

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
  // Consolidated Skills
  technicalSkills: [] as string[], // Core Tech, Languages, Frameworks
  toolsPlatforms: [] as string[], // Tools, Cloud, Platforms
  softSkills: [] as string[],      // Functional & Soft Skills
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

  useEffect(() => {
    const fetchResume = async () => {
      // Temporary bypass for visual audit
      setFetching(false);
    };

    fetchResume();
  }, []);

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
            className="border border-gray-300 p-2.5 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
            className="border border-gray-300 p-2.5 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
        />
    </div>
  );

  const renderTagInput = (label: string, category: keyof typeof initialState, placeholder: string) => (
    <div className="flex flex-col gap-1 w-full">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
            {((form[category] as string[]) || []).map((tag, idx) => (
                <span key={idx} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-black border border-blue-100 group uppercase tracking-tighter">
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
            className="border border-gray-300 p-2.5 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
        />
        <p className="text-[10px] text-gray-400 mt-1 pl-1">Press Enter to add</p>
    </div>
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      await api.post('/resume', form);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save resume");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("resume-preview-export");
    if (!element) return;
    setIsDownloading(true);
    const opt = {
      margin: 0.2,
      filename: `${form.fullName || "Resume"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save().then(() => setIsDownloading(false));
  };

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (false) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-8">Please login to access the Resume Builder and save your progress.</p>
          <button onClick={() => router.push("/login")} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Refined Unified Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                    Recruiter Standard <span className="text-blue-600">Resume Builder</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    AI-Powered • ATS-Optimized • Professional Ready
                </p>
            </div>
            
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
                <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner">
                    <label className="text-[9px] font-black text-gray-400 px-2.5 uppercase tracking-tighter">Layout</label>
                    <select value={form.template} onChange={handleTemplateChange} className="bg-transparent text-xs font-bold text-gray-700 px-2 py-1 outline-none appearance-none cursor-pointer">
                        <option value="ats1">Standard ATS</option>
                        <option value="classic">Classic Corporate</option>
                        <option value="executive">Executive Board</option>
                        <option value="creative">Modern Creative</option>
                    </select>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                <button onClick={() => handleSubmit()} disabled={loading} className="bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50">
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{loading ? "Saving..." : "Save"}</span>
                </button>

                <button onClick={() => setShowPreview(!showPreview)} className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${showPreview ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50"}`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showPreview ? "Edit Mode" : "Live Preview"}</span>
                </button>

                <button onClick={downloadPDF} disabled={isDownloading} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50">
                    {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isDownloading ? "..." : "Download"}</span>
                </button>
            </div>
        </div>
      </div>

      <div className="pt-8">

      <div className={`container mx-auto px-4 pb-20 grid grid-cols-1 ${showPreview ? "lg:grid-cols-2" : "max-w-4xl mx-auto"} gap-10`}>
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 space-y-10">
          
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">1</span>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Personal Information</h3>
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
          <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">2</span>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Target Role & Domain</h3>
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
                  <label className="text-sm font-medium text-gray-700">Experience Level</label>
                  <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className="border border-gray-300 p-2.5 rounded-md outline-none">
                      <option value="">Select Level</option>
                      <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                      <option value="0-2 Years (Junior)">0-2 Years (Junior)</option>
                      <option value="3-5 Years (Mid-Level)">3-5 Years (Mid-Level)</option>
                      <option value="5+ Years (Senior)">5+ Years (Senior)</option>
                  </select>
              </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">3</span>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Professional Summary</h3>
          </div>
          <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700 italic text-gray-500 mb-1">Highlight years of exp, 2-3 major skills, and career focus.</label>
              <textarea name="summary" value={form.summary} onChange={handleChange} className="border border-gray-300 p-4 w-full rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 min-h-[140px] outline-none transition-all" placeholder="e.g. Motivated Cloud Architect with 5+ years of experience in AWS & Azure..." />
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">4</span>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Skills & Core Competencies</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderTagInput("Technical Stack", "technicalSkills", "e.g. Python, React, Next.js")}
              {renderTagInput("Tools & Platforms", "toolsPlatforms", "e.g. AWS, Docker, Jira")}
              {renderTagInput("Soft & Functional", "softSkills", "e.g. Leadership, Agile, Communication")}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex justify-between items-center border-b-2 border-gray-50 pb-4">
             <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">5</span>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Professional Experience</h3>
             </div>
             <button type="button" onClick={() => handleAddItem("experience", { jobTitle: "", companyName: "", location: "", startDate: "", endDate: "", description: "", toolsUsed: "", resultsAchieved: "" })} className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-100">
                <Plus className="w-4 h-4" /> Add Job
             </button>
          </div>
          <div className="space-y-8">
            {form.experience.map((exp: any, idx: number) => (
              <div key={idx} className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm relative group">
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
                        <textarea value={exp.description} onChange={(e) => handleArrayChange("experience", idx, "description", e.target.value)} className="border border-gray-200 p-4 rounded-xl h-32 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700" placeholder="Describe your core role and duties..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-blue-500 uppercase tracking-widest pl-1">Tools & Technologies Used</label>
                            <input value={exp.toolsUsed} onChange={(e) => handleArrayChange("experience", idx, "toolsUsed", e.target.value)} className="border border-blue-100 bg-blue-50/30 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. AWS, Terraform, Docker" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest pl-1">Results & Impact (Numbers)</label>
                            <input value={exp.resultsAchieved} onChange={(e) => handleArrayChange("experience", idx, "resultsAchieved", e.target.value)} className="border border-emerald-100 bg-emerald-50/30 p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g. Reduced latency by 40%, Led team of 10" />
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex justify-between items-center border-b-2 border-gray-50 pb-4">
             <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">6</span>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Key Projects</h3>
             </div>
             <button type="button" onClick={() => handleAddItem("projects", { name: "", technologies: "", githubUrl: "", liveUrl: "", role: "", description: "", outcome: "" })} className="flex items-center gap-2 text-sm bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 font-bold transition-all shadow-lg">
                <Plus className="w-4 h-4" /> Add Project
             </button>
          </div>
          <div className="space-y-6">
            {form.projects.map((proj: any, idx: number) => (
              <div key={idx} className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl relative">
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
                        <textarea value={proj.description} onChange={(e) => handleArrayChange("projects", idx, "description", e.target.value)} className="border border-gray-200 p-4 rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="State the problem you addressed..." />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-pink-500 uppercase tracking-widest pl-1">Outcome / Final Result</label>
                        <input value={proj.outcome} onChange={(e) => handleArrayChange("projects", idx, "outcome", e.target.value)} className="border border-pink-100 bg-pink-50/30 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm" placeholder="e.g. Achieved 95% accuracy, Saved 20 hours/week" />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-8">
                <div className="flex justify-between items-center border-b-2 border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">7</span>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Education</h3>
                    </div>
                    <button type="button" onClick={() => handleAddItem("education", { degree: "", fieldOfStudy: "", institution: "", endYear: "", percentage: "" })} className="text-blue-600 text-xs font-bold hover:underline">+ Add</button>
                </div>
                <div className="space-y-4 md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {form.education.map((edu: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
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
                <div className="flex justify-between items-center border-b-2 border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">8</span>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Certifications</h3>
                    </div>
                    <button type="button" onClick={() => handleAddItem("certifications", { name: "", organization: "", issueDate: "" })} className="text-blue-600 text-xs font-bold hover:underline">+ Add</button>
                </div>
                <div className="space-y-4 md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {form.certifications.map((cert: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
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

        <section className="space-y-10 border-t-2 border-gray-50 pt-10">
            <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-4">
                <span className="bg-gray-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black">9</span>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Additional Information</h3>
            </div>
            <div className="grid grid-cols-1 gap-12">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <label className="font-black text-gray-400 uppercase tracking-widest text-xs block border-b-2 border-gray-50 pb-2">Achievements & Awards</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <p className="text-[10px] font-bold text-gray-300 uppercase pl-1">Key Achievements</p>
                                {form.achievements.map((ach: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 group">
                                         <input value={ach.text} onChange={(e) => handleArrayChange("achievements", idx, "text", e.target.value)} className="border border-gray-100 p-2.5 rounded-lg w-full text-xs shadow-sm" placeholder="Achievement bullet..." />
                                         <button onClick={() => handleRemoveItem("achievements", idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddItem("achievements", { text: "" })} className="text-[10px] text-blue-500 font-bold hover:underline">+ Add Achievement</button>
                             </div>
                             <div className="space-y-3">
                                <p className="text-[10px] font-bold text-gray-300 uppercase pl-1">Honors & Recognitions</p>
                                {form.awards.map((aw: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 group">
                                         <input value={aw.text} onChange={(e) => handleArrayChange("awards", idx, "text", e.target.value)} className="border border-gray-100 p-2.5 rounded-lg w-full text-xs shadow-sm bg-amber-50/20 border-amber-100/50" placeholder="Award description..." />
                                         <button onClick={() => handleRemoveItem("awards", idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddItem("awards", { text: "" })} className="text-[10px] text-amber-600 font-bold hover:underline">+ Add Award</button>
                             </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                         <div className="space-y-4">
                            <label className="font-black text-gray-700 uppercase tracking-widest text-xs border-b border-gray-200 pb-2 block">Languages Known</label>
                            <div className="space-y-2">
                                {form.languages.map((l: any, i: number) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input value={l.name} onChange={(e) => handleArrayChange("languages", i, "name", e.target.value)} className="border border-gray-200 p-2 rounded-lg text-xs w-full bg-white" placeholder="Language" />
                                        <select value={l.proficiency} onChange={(e) => handleArrayChange("languages", i, "proficiency", e.target.value)} className="border border-gray-200 p-2 rounded-lg text-[10px] font-bold bg-white outline-none">
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
                        <button onClick={() => setShowPreview(false)} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all active:scale-95">
                            <X className="w-8 h-8"/>
                        </button>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Full-Screen <span className="text-blue-400">Preview</span></h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] opacity-70">Recruiter-Ready Document</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={downloadPDF} disabled={isDownloading} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl text-base font-black flex items-center gap-3 transition-all shadow-2xl shadow-blue-500/40 active:scale-95 disabled:opacity-70">
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
        <div id="resume-preview-export" className="bg-white text-black w-[794px]" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
            <TemplateComponent {...form} name={form.fullName} />
        </div>
      </div>
    </div>
  );
}
