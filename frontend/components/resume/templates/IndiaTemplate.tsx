import React from "react";

interface ResumeProps {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
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
    location?: string;
    endYear: string;
    percentage?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
    role?: string;
    githubUrl?: string;
    liveUrl?: string;
    outcome?: string;
  }>;
  certifications?: Array<{
    name: string;
    organization: string;
    issueDate: string;
  }>;
  languages?: Array<{ name: string; proficiency: string }>;
  achievements?: Array<{ text: string }>;
  awards?: Array<{ text: string }>;
  interests?: Array<{ name: string }>;
}

export default function IndiaTemplate(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="p-10 bg-white text-black font-sans leading-tight max-w-4xl mx-auto border-t-8 border-indigo-600">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none mb-1">{displayName}</h1>
          <div className="text-sm font-bold text-indigo-600 tracking-wide uppercase">
            {props.targetRole} {props.domain ? `| ${props.domain}` : ""}
          </div>
        </div>
        <div className="text-right text-[11px] text-gray-500 space-y-1">
          {props.phone && <div>📞 {props.phone}</div>}
          {props.email && <div>✉️ {props.email}</div>}
          {props.location && <div>📍 {props.location}</div>}
          {props.linkedIn && (
            <div>
              🔗 <a href={props.linkedIn} className="text-indigo-600 font-bold hover:underline">{props.linkedIn.replace(/^https?:\/\/(www\.)?/, '')}</a>
            </div>
          )}
          {props.github && (
            <div>
              💻 <a href={props.github} className="text-indigo-600 font-bold hover:underline">{props.github.replace(/^https?:\/\/(www\.)?/, '')}</a>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      {props.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2 border-b border-indigo-100 pb-1">Professional Summary</h2>
          <p className="text-[12px] text-gray-700 leading-relaxed text-justify">{props.summary}</p>
        </div>
      )}

      {/* SKILLS */}
      {(props.technicalSkills?.length || props.toolsPlatforms?.length || props.softSkills?.length) ? (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2 border-b border-indigo-100 pb-1">Skills & Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-gray-700">
            {props.technicalSkills && props.technicalSkills.length > 0 && (
              <div>
                <span className="font-bold text-gray-900 block mb-1">Core Tech & Frameworks</span>
                <p>{props.technicalSkills.join(", ")}</p>
              </div>
            )}
            {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
              <div>
                <span className="font-bold text-gray-900 block mb-1">Tools & Infrastructure</span>
                <p>{props.toolsPlatforms.join(", ")}</p>
              </div>
            )}
            {props.softSkills && props.softSkills.length > 0 && (
              <div>
                <span className="font-bold text-gray-900 block mb-1">Functional & Soft Skills</span>
                <p>{props.softSkills.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* EXPERIENCE */}
      {props.experience && props.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-3 border-b border-indigo-100 pb-1">Work Experience</h2>
          {props.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-[12px] text-gray-950">{exp.jobTitle}</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase">{exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}</span>
              </div>
              <div className="text-[11px] font-bold text-indigo-600 mb-1.5">{exp.companyName} {exp.location ? `— ${exp.location}` : ""}</div>
              <div className="text-[11px] text-gray-600">
                <ul className="list-disc ml-4 space-y-1">
                  {exp.description.split('\n').filter(d => d.trim()).map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet.replace(/^-/,'').trim()}</li>
                  ))}
                </ul>
              </div>
              {exp.resultsAchieved && (
                <div className="text-[10px] text-emerald-600 font-bold mt-1 ml-4">🚀 Key Result: {exp.resultsAchieved}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION */}
      {props.education && props.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2 border-b border-indigo-100 pb-1">Education</h2>
          <div className="space-y-3">
            {props.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <div>
                  <span className="font-bold text-gray-900">{edu.degree}</span> in {edu.fieldOfStudy || "General Studies"}
                  <div className="text-gray-500">{edu.institution}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{edu.endYear}</div>
                  {edu.percentage && <div className="text-indigo-600 font-bold">Marks: {edu.percentage}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER MULTI-COLUMN */}
      <div className="grid grid-cols-2 gap-6 text-[11px] border-t border-gray-100 pt-4">
        {props.languages && props.languages.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 uppercase mb-1">Languages</h3>
            <p className="text-gray-600">{props.languages.map(l => `${l.name} (${l.proficiency})`).join(", ")}</p>
          </div>
        )}
        {props.certifications && props.certifications.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 uppercase mb-1">Certifications</h3>
            <ul className="list-disc ml-4 text-gray-600 space-y-0.5">
              {props.certifications.map((c, i) => <li key={i}>{c.name} - {c.organization}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
