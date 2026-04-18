"use client";

import React, { useState } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";

import ModernTemplate from "./templates/ModernTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";

type TemplateType = "modern" | "professional" | "minimal";

/**
 * IMPORTANT:
 * Using unified type for templates to avoid TS mismatch errors
 */
type ResumeFormData = any;

const TEMPLATES: Record<TemplateType, React.FC<ResumeFormData>> = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const initialState = {
  fullName: "",
  professionalTitle: "",
  phone: "",
  email: "",
  linkedIn: "",
  github: "",
  portfolio: "",
  summary: "",

  skills: [{ name: "", proficiency: "" }],

  experience: [
    {
      jobTitle: "",
      companyName: "",
      location: "",
      employmentType: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
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

  projects: [
    {
      name: "",
      technologies: "",
      description: "",
      role: "",
      github: "",
      liveUrl: "",
      startDate: "",
      endDate: "",
    },
  ],

  certifications: [
    {
      name: "",
      organization: "",
      issueDate: "",
    },
  ],

  languages: [{ name: "", proficiency: "" }],

  internships: [
    {
      companyName: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],

  template: "modern" as TemplateType,
};

export default function ResumeBuilder() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResume, setAiResume] = useState<string | null>(null);

  const TemplateComponent =
    TEMPLATES[form.template as TemplateType];

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // -----------------------------
  // BASIC CHANGE HANDLER
  // -----------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -----------------------------
  // ARRAY HANDLERS
  // -----------------------------
  const handleArrayChange = (
    section: keyof typeof initialState,
    idx: number,
    field: string,
    value: any
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: prev[section].map((item: any, i: number) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddItem = (
    section: keyof typeof initialState,
    emptyObj: any
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: [...prev[section], emptyObj],
    }));
  };

  const handleRemoveItem = (
    section: keyof typeof initialState,
    idx: number
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: prev[section].filter(
        (_: any, i: number) => i !== idx
      ),
    }));
  };

  const handleTemplateChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      template: e.target.value as TemplateType,
    });
  };

  // -----------------------------
  // SAVE RESUME
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/resume`, {
        ...form,
        userId: 1,
      });
      alert("Resume saved!");
    } catch {
      setError("Failed to save resume.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // PDF DOWNLOAD
  // -----------------------------
  const handleDownload = () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: "resume.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  // -----------------------------
  // AI RESUME
  // -----------------------------
  const handleGenerateAIResume = async () => {
    setLoading(true);
    setError("");
    setAiResume(null);

    try {
      const response = await axios.post(
        `${API_URL}/interviews/ai-resume`,
        form
      );

      if (response.data?.resume) {
        setAiResume(response.data.resume);
      } else {
        setError("AI did not return a resume.");
      }
    } catch {
      setError("Failed to generate AI resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 w-full">
      {/* FORM */}
      <form
        className="w-full md:w-1/2 bg-white rounded-lg shadow p-6 space-y-4 overflow-y-auto max-h-[90vh]"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4">
          Resume Builder
        </h2>

        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="border p-2 w-full"
        />

        <textarea
          name="summary"
          value={form.summary}
          onChange={handleChange}
          className="border p-2 w-full"
          placeholder="Summary"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2"
        >
          {loading ? "Saving..." : "Save Resume"}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 ml-2"
        >
          Download PDF
        </button>

        <button
          type="button"
          onClick={handleGenerateAIResume}
          className="bg-purple-600 text-white px-4 py-2 ml-2"
        >
          Generate AI Resume
        </button>

        {error && (
          <p className="text-red-500">{error}</p>
        )}
      </form>

      {/* PREVIEW */}
      <div className="w-full md:w-1/2 bg-gray-50 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Live Preview
        </h2>

        <div id="resume-preview">
          {aiResume ? (
            <div className="whitespace-pre-line">
              {aiResume}
            </div>
          ) : (
            <TemplateComponent {...form} />
          )}
        </div>
      </div>
    </div>
  );
}