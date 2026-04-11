"use client";
import React, { useState } from 'react';
import axios from 'axios';
import ModernTemplate from './templates/ModernTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';
import MinimalTemplate from './templates/MinimalTemplate';



type TemplateType = 'modern' | 'professional' | 'minimal';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

const TEMPLATES: Record<TemplateType, React.FC<{ resumeData: ResumeData }>> = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';


const initialState = {
  // 1. Personal Information
  fullName: '',
  professionalTitle: '',
  phone: '',
  email: '',
  linkedIn: '',
  github: '',
  portfolio: '',
  // 2. Professional Summary
  summary: '',
  // 3. Skills
  skills: [
    { name: '', proficiency: '' }
  ],
  // 4. Work Experience
  experience: [
    {
      jobTitle: '',
      companyName: '',
      location: '',
      employmentType: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: ''
    }
  ],
  // 5. Education
  education: [
    {
      degree: '',
      fieldOfStudy: '',
      institution: '',
      location: '',
      startYear: '',
      endYear: '',
      percentage: ''
    }
  ],
  // 6. Projects
  projects: [
    {
      name: '',
      technologies: '',
      description: '',
      role: '',
      github: '',
      liveUrl: '',
      startDate: '',
      endDate: ''
    }
  ],
  // 7. Certifications
  certifications: [
    {
      name: '',
      organization: '',
      issueDate: ''
    }
  ],
  // 8. Languages
  languages: [
    { name: '', proficiency: '' }
  ],
  // 9. Internships
  internships: [
    {
      companyName: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  ],
  template: 'modern' as TemplateType,
};

export default function ResumeBuilder() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResume, setAiResume] = useState<string | null>(null);
  // AI Resume Generation
  const handleGenerateAIResume = async () => {
    setLoading(true);
    setError('');
    setAiResume(null);
    try {
      // Adjust the endpoint as per your backend route for AI resume generation
      const response = await axios.post(`${API_URL}/interviews/ai-resume`, { ...form });
      if (response.data && response.data.resume) {
        setAiResume(response.data.resume);
      } else {
        setError('AI did not return a resume.');
      }
    } catch (err) {
      setError('Failed to generate resume with AI.');
    } finally {
      setLoading(false);
    }
  };

  const TemplateComponent = TEMPLATES[form.template as TemplateType];


  // For simple fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Type-safe helpers for array fields
  function handleArrayChange<T extends keyof typeof initialState>(section: T, idx: number, field: string, value: string) {
    setForm(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    }));
  }

  function handleAddItem<T extends keyof typeof initialState>(section: T, emptyObj: Record<string, unknown>) {
    setForm(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), emptyObj]
    }));
  }

  function handleRemoveItem<T extends keyof typeof initialState>(section: T, idx: number) {
    setForm(prev => ({
      ...prev,
      [section]: (prev[section] as unknown[]).filter((_, i) => i !== idx)
    }));
  }

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, template: e.target.value as TemplateType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/resume`, { ...form, userId: 1 }); // Replace userId with actual user
      alert('Resume saved!');
    } catch (err) {
      setError('Failed to save resume.');
    } finally {
      setLoading(false);
    }
  };
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

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 w-full">
      {/* Resume Form */}
      <form
        className="w-full md:w-1/2 bg-white rounded-lg shadow p-6 space-y-4 overflow-y-auto max-h-[90vh]"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4">Resume Builder</h2>
        {/* 1. Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Full Name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium">Professional Title</label>
            <input type="text" name="professionalTitle" value={form.professionalTitle} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium">Phone Number</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium">LinkedIn URL</label>
            <input type="text" name="linkedIn" value={form.linkedIn} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium">GitHub URL</label>
            <input type="text" name="github" value={form.github} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium">Portfolio Website</label>
            <input type="text" name="portfolio" value={form.portfolio} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* 2. Professional Summary */}
        <div className="space-y-2">
          <label className="block font-medium">Professional Summary / Objective</label>
          <textarea name="summary" value={form.summary} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
        </div>

        {/* 3. Skills */}
        <div className="space-y-2">
          <label className="block font-medium">Skills</label>
          {(Array.isArray(form.skills) ? form.skills : []).map((skill, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" placeholder="Skill Name" value={skill.name} onChange={e => handleArrayChange('skills', idx, 'name', e.target.value)} className="border rounded px-2 py-1 flex-1" />
              <input type="text" placeholder="Proficiency Level" value={skill.proficiency} onChange={e => handleArrayChange('skills', idx, 'proficiency', e.target.value)} className="border rounded px-2 py-1 flex-1" />
              <button type="button" className="text-red-500" onClick={() => handleRemoveItem('skills', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="text-blue-600" onClick={() => handleAddItem('skills', { name: '', proficiency: '' })}>Add Skill</button>
        </div>

        {/* 4. Work Experience */}
        <div className="space-y-2">
          <label className="block font-medium">Work Experience</label>
          {(Array.isArray(form.experience) ? form.experience : []).map((exp, idx) => (
            <div key={idx} className="border rounded p-2 mb-2">
              <input type="text" placeholder="Job Title" value={exp.jobTitle} onChange={e => handleArrayChange('experience', idx, 'jobTitle', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Company Name" value={exp.companyName} onChange={e => handleArrayChange('experience', idx, 'companyName', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Location" value={exp.location} onChange={e => handleArrayChange('experience', idx, 'location', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Employment Type" value={exp.employmentType} onChange={e => handleArrayChange('experience', idx, 'employmentType', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <div className="flex gap-2 mb-1">
                <input type="date" placeholder="Start Date" value={exp.startDate} onChange={e => handleArrayChange('experience', idx, 'startDate', e.target.value)} className="border rounded px-2 py-1 flex-1" />
                <input type="date" placeholder="End Date" value={exp.endDate} onChange={e => handleArrayChange('experience', idx, 'endDate', e.target.value)} className="border rounded px-2 py-1 flex-1" />
                <label className="flex items-center ml-2">
                  <input type="checkbox" checked={exp.currentlyWorking} onChange={e => handleArrayChange('experience', idx, 'currentlyWorking', e.target.checked)} /> Currently Working
                </label>
              </div>
              <textarea placeholder="Description" value={exp.description} onChange={e => handleArrayChange('experience', idx, 'description', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" rows={2} />
              <button type="button" className="text-red-500" onClick={() => handleRemoveItem('experience', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="text-blue-600" onClick={() => handleAddItem('experience', { jobTitle: '', companyName: '', location: '', employmentType: '', startDate: '', endDate: '', currentlyWorking: false, description: '' })}>Add Experience</button>
        </div>

        {/* 5. Education */}
        <div className="space-y-2">
          <label className="block font-medium">Education</label>
          {(Array.isArray(form.education) ? form.education : []).map((edu, idx) => (
            <div key={idx} className="border rounded p-2 mb-2">
              <input type="text" placeholder="Degree" value={edu.degree} onChange={e => handleArrayChange('education', idx, 'degree', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy} onChange={e => handleArrayChange('education', idx, 'fieldOfStudy', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Institution Name" value={edu.institution} onChange={e => handleArrayChange('education', idx, 'institution', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Location" value={edu.location} onChange={e => handleArrayChange('education', idx, 'location', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <div className="flex gap-2 mb-1">
                <input type="text" placeholder="Start Year" value={edu.startYear} onChange={e => handleArrayChange('education', idx, 'startYear', e.target.value)} className="border rounded px-2 py-1 flex-1" />
                <input type="text" placeholder="End Year" value={edu.endYear} onChange={e => handleArrayChange('education', idx, 'endYear', e.target.value)} className="border rounded px-2 py-1 flex-1" />
                <input type="text" placeholder="Percentage / CGPA" value={edu.percentage} onChange={e => handleArrayChange('education', idx, 'percentage', e.target.value)} className="border rounded px-2 py-1 flex-1" />
              </div>
              <button type="button" className="text-red-500" onClick={() => handleRemoveItem('education', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="text-blue-600" onClick={() => handleAddItem('education', { degree: '', fieldOfStudy: '', institution: '', location: '', startYear: '', endYear: '', percentage: '' })}>Add Education</button>
        </div>

        {/* 6. Projects */}
        <div className="space-y-2">
          <label className="block font-medium">Projects</label>
          {(Array.isArray(form.projects) ? form.projects : []).map((proj, idx) => (
            <div key={idx} className="border rounded p-2 mb-2">
              <input type="text" placeholder="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', idx, 'name', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Technologies Used" value={proj.technologies} onChange={e => handleArrayChange('projects', idx, 'technologies', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <textarea placeholder="Description" value={proj.description} onChange={e => handleArrayChange('projects', idx, 'description', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" rows={2} />
              <input type="text" placeholder="Role" value={proj.role} onChange={e => handleArrayChange('projects', idx, 'role', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="GitHub Link" value={proj.github} onChange={e => handleArrayChange('projects', idx, 'github', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Live URL" value={proj.liveUrl} onChange={e => handleArrayChange('projects', idx, 'liveUrl', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <div className="flex gap-2 mb-1">
                <input type="date" placeholder="Start Date" value={proj.startDate} onChange={e => handleArrayChange('projects', idx, 'startDate', e.target.value)} className="border rounded px-2 py-1 flex-1" />
                <input type="date" placeholder="End Date" value={proj.endDate} onChange={e => handleArrayChange('projects', idx, 'endDate', e.target.value)} className="border rounded px-2 py-1 flex-1" />
              </div>
              <button type="button" className="text-red-500" onClick={() => handleRemoveItem('projects', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="text-blue-600" onClick={() => handleAddItem('projects', { name: '', technologies: '', description: '', role: '', github: '', liveUrl: '', startDate: '', endDate: '' })}>Add Project</button>
        </div>

        {/* 7. Certifications */}
        <div className="space-y-2">
          <label className="block font-medium">Certifications</label>
          {(Array.isArray(form.certifications) ? form.certifications : []).map((cert, idx) => (
            <div key={idx} className="border rounded p-2 mb-2">
              <input type="text" placeholder="Certification Name" value={cert.name} onChange={e => handleArrayChange('certifications', idx, 'name', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Issuing Organization" value={cert.organization} onChange={e => handleArrayChange('certifications', idx, 'organization', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="date" placeholder="Issue Date" value={cert.issueDate} onChange={e => handleArrayChange('certifications', idx, 'issueDate', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <button type="button" className="text-red-500" onClick={() => handleRemoveItem('certifications', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="text-blue-600" onClick={() => handleAddItem('certifications', { name: '', organization: '', issueDate: '' })}>Add Certification</button>
        </div>

        {/* 8. Languages */}
        <div className="space-y-2">
          <label className="block font-medium">Languages</label>
          {(Array.isArray(form.languages) ? form.languages : []).map((lang, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" placeholder="Language" value={lang.name} onChange={e => handleArrayChange('languages', idx, 'name', e.target.value)} className="border rounded px-2 py-1 flex-1" />
              <input type="text" placeholder="Proficiency Level" value={lang.proficiency} onChange={e => handleArrayChange('languages', idx, 'proficiency', e.target.value)} className="border rounded px-2 py-1 flex-1" />
              <button type="button" className="text-red-500" onClick={() => handleRemoveItem('languages', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="text-blue-600" onClick={() => handleAddItem('languages', { name: '', proficiency: '' })}>Add Language</button>
        </div>

        {/* 9. Internships */}
        <div className="space-y-2">
          <label className="block font-medium">Internships</label>
          {(Array.isArray(form.internships) ? form.internships : []).map((intern, idx) => (
            <div key={idx} className="border rounded p-2 mb-2">
              <input type="text" placeholder="Company Name" value={intern.companyName} onChange={e => handleArrayChange('internships', idx, 'companyName', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <input type="text" placeholder="Role" value={intern.role} onChange={e => handleArrayChange('internships', idx, 'role', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" />
              <div className="flex gap-2 mb-1">
                <input type="date" placeholder="Start Date" value={intern.startDate} onChange={e => handleArrayChange('internships', idx, 'startDate', e.target.value)} className="border rounded px-2 py-1 flex-1" />
                <input type="date" placeholder="End Date" value={intern.endDate} onChange={e => handleArrayChange('internships', idx, 'endDate', e.target.value)} className="border rounded px-2 py-1 flex-1" />
              </div>
              <textarea placeholder="Description" value={intern.description} onChange={e => handleArrayChange('internships', idx, 'description', e.target.value)} className="border rounded px-2 py-1 w-full mb-1" rows={2} />
              <button type="button" className="text-red-500" onClick={() => handleRemoveItem('internships', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" className="text-blue-600" onClick={() => handleAddItem('internships', { companyName: '', role: '', startDate: '', endDate: '', description: '' })}>Add Internship</button>
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
          <label className="block font-medium">Template</label>
          <select name="template" value={form.template} onChange={handleTemplateChange} className="w-full border rounded px-3 py-2">
            <option value="modern">Modern</option>
            <option value="professional">Professional</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? 'Saving...' : 'Save Resume'}
        </button>
        <button type="button" className="ml-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleDownload}>
          Download as PDF
        </button>
        <button type="button" className="ml-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onClick={handleGenerateAIResume} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Resume with AI'}
        </button>
      </form>
      {/* Resume Preview */}
      <div className="w-full md:w-1/2 bg-gray-50 rounded-lg shadow p-6 min-h-[600px]">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div id="resume-preview">
          {aiResume ? (
            <div className="whitespace-pre-line p-4 bg-white border rounded">
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
