import React from "react";

interface ResumeProps {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  domain?: string;
  targetRole?: string;
  experienceLevel?: string;
  summary?: string;
  technicalSkills?: string[];
  toolsPlatforms?: string[];
  softSkills?: string[];
  experience?: Array<{
    jobTitle: string;
    companyName: string;
    location?: string;
    startDate: string;
    endDate: string;
    currentlyWorking?: boolean;
    description: string;
    toolsUsed?: string;
    resultsAchieved?: string;
  }>;
  education?: Array<{
    degree: string;
    fieldOfStudy?: string;
    institution: string;
    endYear: string;
  }>;
  languages?: Array<{ name: string; proficiency: string }>;
}

export default function GermanyTemplate(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="p-10 bg-white text-black font-sans leading-normal max-w-4xl mx-auto border-t-8 border-teal-600">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none mb-1">{displayName}</h1>
          <div className="text-sm font-bold text-teal-600 uppercase tracking-widest">{props.targetRole}</div>
        </div>
        <div className="text-right text-[11px] text-gray-500 space-y-1">
          {props.location && <div>📍 {props.location}</div>}
          {props.phone && <div>📞 {props.phone}</div>}
          {props.email && <div>✉️ {props.email}</div>}
        </div>
      </div>

      {/* LEBENSLAUF GRID */}
      <div className="space-y-8">
        
        {/* SUMMARY / PROFESSIONAL PROFILE */}
        {props.summary && (
          <div>
            <h2 className="text-[12px] font-black uppercase text-teal-600 tracking-wider mb-2 border-b border-teal-100 pb-1">Über Mich (Profile)</h2>
            <p className="text-[11.5px] text-gray-700 text-justify">{props.summary}</p>
          </div>
        )}

        {/* WORK HISTORY */}
        {props.experience && props.experience.length > 0 && (
          <div>
            <h2 className="text-[12px] font-black uppercase text-teal-600 tracking-wider mb-3 border-b border-teal-100 pb-1">Beruflicher Werdegang (Experience)</h2>
            <div className="space-y-4">
              {props.experience.map((exp, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 text-[11.5px]">
                  <div className="col-span-1 font-bold text-gray-500">
                    {exp.startDate} – {exp.currentlyWorking ? "Heute" : exp.endDate}
                  </div>
                  <div className="col-span-3">
                    <div className="font-extrabold text-gray-900">{exp.jobTitle}</div>
                    <div className="text-teal-600 font-bold mb-1">{exp.companyName} {exp.location ? `(${exp.location})` : ""}</div>
                    <p className="text-gray-600">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {props.education && props.education.length > 0 && (
          <div>
            <h2 className="text-[12px] font-black uppercase text-teal-600 tracking-wider mb-3 border-b border-teal-100 pb-1">Ausbildung (Education)</h2>
            <div className="space-y-3">
              {props.education.map((edu, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 text-[11.5px]">
                  <div className="col-span-1 font-bold text-gray-500">
                    bis {edu.endYear}
                  </div>
                  <div className="col-span-3">
                    <div className="font-extrabold text-gray-900">{edu.degree}</div>
                    <div className="text-gray-600">{edu.institution}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKILLS & LANGUAGES */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          <div>
            <h2 className="text-[12px] font-black uppercase text-teal-600 tracking-wider mb-2">Kenntnisse (Skills)</h2>
            <div className="space-y-1 text-[11px] text-gray-700">
              {props.technicalSkills && props.technicalSkills.length > 0 && (
                <div><strong>Tech Stack:</strong> {props.technicalSkills.join(", ")}</div>
              )}
              {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
                <div><strong>Tools:</strong> {props.toolsPlatforms.join(", ")}</div>
              )}
            </div>
          </div>
          {props.languages && props.languages.length > 0 && (
            <div>
              <h2 className="text-[12px] font-black uppercase text-teal-600 tracking-wider mb-2">Sprachen (Languages)</h2>
              <p className="text-[11px] text-gray-700">
                {props.languages.map(l => `${l.name} (${l.proficiency})`).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
