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
  interests?: Array<{ name: string }>;
}

export default function UkTemplate(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="p-10 bg-white text-black font-sans leading-relaxed max-w-4xl mx-auto border-l-8 border-slate-800">
      {/* HEADER */}
      <div className="mb-6 border-b pb-4 border-gray-200">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">{displayName}</h1>
        <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-4">{props.targetRole} {props.domain ? `— ${props.domain}` : ""}</p>
        
        <div className="grid grid-cols-2 gap-x-8 text-[11px] text-gray-600">
          <div>
            {props.location && <div><strong>Address:</strong> {props.location}</div>}
            {props.phone && <div><strong>Telephone:</strong> {props.phone}</div>}
          </div>
          <div className="text-right">
            {props.email && <div><strong>Email:</strong> {props.email}</div>}
            {props.linkedIn && <div><strong>LinkedIn:</strong> {props.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}</div>}
          </div>
        </div>
      </div>

      {/* PERSONAL PROFILE */}
      {props.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1 mb-2">Personal Profile</h2>
          <p className="text-[12px] text-gray-700 text-justify">{props.summary}</p>
        </div>
      )}

      {/* EMPLOYMENT HISTORY */}
      {props.experience && props.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1 mb-3">Employment History</h2>
          {props.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-extrabold text-[12px] text-slate-900">{exp.jobTitle}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-600 mb-1.5">{exp.companyName} {exp.location ? `| ${exp.location}` : ""}</div>
              <div className="text-[11.5px] text-gray-700 space-y-1">
                <ul className="list-disc ml-4 space-y-0.5">
                  {exp.description.split('\n').filter(d => d.trim()).map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet.replace(/^-/,'').trim()}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KEY SKILLS */}
      {(props.technicalSkills?.length || props.toolsPlatforms?.length || props.softSkills?.length) ? (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1 mb-2">Key Skills</h2>
          <div className="grid grid-cols-3 gap-4 text-[11px] text-gray-700">
            {props.technicalSkills && props.technicalSkills.length > 0 && (
              <div>
                <strong className="text-slate-900 block mb-1">Technical Skills</strong>
                <span>{props.technicalSkills.join(", ")}</span>
              </div>
            )}
            {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
              <div>
                <strong className="text-slate-900 block mb-1">Tools & Frameworks</strong>
                <span>{props.toolsPlatforms.join(", ")}</span>
              </div>
            )}
            {props.softSkills && props.softSkills.length > 0 && (
              <div>
                <strong className="text-slate-900 block mb-1">Personal Attributes</strong>
                <span>{props.softSkills.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* EDUCATION */}
      {props.education && props.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1 mb-2">Education & Qualifications</h2>
          <div className="space-y-3">
            {props.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-[11.5px]">
                <div>
                  <span className="font-extrabold text-slate-900">{edu.degree}</span>
                  <div className="text-gray-500">{edu.institution}</div>
                </div>
                <div className="font-bold text-gray-600">{edu.endYear}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REFERENCES */}
      <div className="mt-8 border-t border-gray-100 pt-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1">References</h2>
        <p className="text-[11.5px] text-gray-500 italic">References are available on request.</p>
      </div>
    </div>
  );
}
