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
    percentage?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
    role?: string;
    outcome?: string;
  }>;
}

export default function UsTemplate(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="p-8 bg-white text-black font-serif leading-normal max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-1">{displayName}</h1>
        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-sans font-bold">
          {props.targetRole} {props.domain ? `— ${props.domain}` : ""}
        </p>
        <div className="text-xs flex flex-wrap justify-center gap-x-4 gap-y-0.5 mt-2 font-sans text-gray-700">
          {props.location && <span>{props.location}</span>}
          {props.phone && <span>• {props.phone}</span>}
          {props.email && <span>• {props.email}</span>}
          {props.linkedIn && <span>• {props.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}</span>}
          {props.github && <span>• {props.github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
        </div>
      </div>

      {/* SUMMARY */}
      {props.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">Professional Summary</h2>
          <p className="text-[12px] text-gray-800 text-justify font-serif">{props.summary}</p>
        </div>
      )}

      {/* EXPERIENCE */}
      {props.experience && props.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-3 font-sans">Professional Experience</h2>
          {props.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-[12px] text-gray-900">
                  {exp.jobTitle} — <span className="font-normal text-gray-700">{exp.companyName}</span>
                </h3>
                <span className="text-[10px] font-sans font-bold text-gray-500 uppercase">{exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}</span>
              </div>
              {exp.location && <div className="text-[10px] font-sans text-gray-400 uppercase tracking-wider mb-1.5">{exp.location}</div>}
              <div className="text-[11.5px] text-gray-800">
                <ul className="list-disc ml-5 space-y-1">
                  {exp.description.split('\n').filter(d => d.trim()).map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet.replace(/^-/,'').trim()}</li>
                  ))}
                </ul>
              </div>
              {exp.resultsAchieved && (
                <div className="text-[11px] font-bold text-gray-900 mt-1 ml-5">Result: {exp.resultsAchieved}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SKILLS */}
      {(props.technicalSkills?.length || props.toolsPlatforms?.length || props.softSkills?.length) ? (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">Technical Skills</h2>
          <div className="text-[11.5px] text-gray-800 space-y-1">
            {props.technicalSkills && props.technicalSkills.length > 0 && (
              <div><strong>Core Technologies:</strong> {props.technicalSkills.join(", ")}</div>
            )}
            {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
              <div><strong>Tools & Platforms:</strong> {props.toolsPlatforms.join(", ")}</div>
            )}
            {props.softSkills && props.softSkills.length > 0 && (
              <div><strong>Soft / Functional:</strong> {props.softSkills.join(", ")}</div>
            )}
          </div>
        </div>
      ) : null}

      {/* EDUCATION */}
      {props.education && props.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 font-sans">Education</h2>
          {props.education.map((edu, idx) => (
            <div key={idx} className="flex justify-between items-baseline text-[11.5px] mb-1">
              <div>
                <strong>{edu.degree}</strong> in {edu.fieldOfStudy || "General Studies"} — <span className="text-gray-700">{edu.institution}</span>
              </div>
              <div className="text-[10px] font-bold font-sans text-gray-500 uppercase">{edu.endYear}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
