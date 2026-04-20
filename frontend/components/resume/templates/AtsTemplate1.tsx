import React from "react";

interface ResumeProps {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;

  // New Domain Info
  domain?: string;
  targetRole?: string;
  experienceLevel?: string;

  summary?: string;

  // Simplified Skills
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

export default function AtsTemplate1(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="p-10 bg-white text-black font-sans leading-snug max-w-4xl mx-auto">
      {/* HEADER SECTION */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-1 text-gray-900">
          {displayName}
        </h1>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            {props.targetRole} {props.domain ? `| ${props.domain}` : ""} {props.experienceLevel ? `(${props.experienceLevel})` : ""}
        </div>
        <div className="text-[11px] text-gray-600 border-t border-b border-gray-100 py-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {props.phone && <span><strong>Phone:</strong> {props.phone}</span>}
          {props.email && <span><strong>Email:</strong> {props.email}</span>}
          {props.location && <span><strong>Location:</strong> {props.location}</span>}
          {props.linkedIn && <span><strong>LinkedIn:</strong> {props.linkedIn.replace(/^https?:\/\//, '')}</span>}
          {props.github && <span><strong>GitHub:</strong> {props.github.replace(/^https?:\/\//, '')}</span>}
        </div>
      </div>

      {/* PROFESSIONAL SUMMARY */}
      {props.summary && (
        <div className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-sm font-black uppercase mb-1.5 border-b-2 border-gray-900 pb-0.5 inline-block">Professional Summary</h2>
          <p className="text-[12px] text-gray-800 text-justify leading-relaxed">
            {props.summary}
          </p>
        </div>
      )}

      {/* SKILLS SECTION */}
      {(props.technicalSkills?.length || props.toolsPlatforms?.length || props.softSkills?.length) ? (
        <div className="mb-6" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-sm font-black uppercase mb-2 border-b-2 border-gray-900 pb-0.5 inline-block">Expertise & Skills</h2>
          <div className="grid grid-cols-1 gap-1.5 text-[12px]">
            {props.technicalSkills && props.technicalSkills.length > 0 && (
                <div><strong>Technical:</strong> {props.technicalSkills.join(" • ")}</div>
            )}
            {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
                <div><strong>Tools & Platforms:</strong> {props.toolsPlatforms.join(" • ")}</div>
            )}
            {props.softSkills && props.softSkills.length > 0 && (
                <div><strong>Professional Skills:</strong> {props.softSkills.join(" • ")}</div>
            )}
          </div>
        </div>
      ) : null}

      {/* PROFESSIONAL EXPERIENCE */}
      {props.experience && props.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-black uppercase mb-3 border-b-2 border-gray-900 pb-0.5 inline-block">Professional Experience</h2>
          {props.experience.map((exp, idx) => (
            <div key={idx} className="mb-5" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-[13px] text-gray-900">
                  {exp.jobTitle}
                </h3>
                <span className="text-[11px] font-bold text-gray-600">
                  {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[12px] font-bold text-gray-700">{exp.companyName} {exp.location ? `| ${exp.location}` : ""}</span>
              </div>
              <div className="text-[12px] text-gray-800 mb-2">
                <ul className="list-disc ml-4 space-y-1">
                  {exp.description.split('\n').filter(d => d.trim()).map((bullet, bIdx) => (
                    <li key={bIdx} className="pl-1">{bullet.replace(/^-/,'').trim()}</li>
                  ))}
                </ul>
              </div>
              {(exp.resultsAchieved || exp.toolsUsed) && (
                  <div className="bg-gray-50 p-2 border-l-2 border-gray-200 ml-4 space-y-1">
                      {exp.resultsAchieved && <p className="text-[11px]"><strong>Key Achievement:</strong> {exp.resultsAchieved}</p>}
                      {exp.toolsUsed && <p className="text-[11px]"><strong>Stack:</strong> {exp.toolsUsed}</p>}
                  </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PROJECTS */}
      {props.projects && props.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-black uppercase mb-3 border-b-2 border-gray-900 pb-0.5 inline-block">Technical Projects</h2>
          {props.projects.map((proj, idx) => (
            <div key={idx} className="mb-4" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-[13px] text-gray-900">
                  {proj.name} {proj.role ? `(${proj.role})` : ""}
                </h3>
                <div className="flex gap-3 text-[10px] font-bold text-blue-600 uppercase">
                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>}
                    {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">Demo</a>}
                </div>
              </div>
              <p className="text-[12px] text-gray-800 mb-1 pl-1 border-l-2 border-gray-100 italic">
                {proj.description}
              </p>
              <div className="text-[11px] pl-1">
                {proj.outcome && <p className="mb-0.5"><strong>Ref. Result:</strong> {proj.outcome}</p>}
                {proj.technologies && <p className="text-gray-500"><strong>Built with:</strong> {proj.technologies}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDUCATION & CERTIFICATIONS */}
      <div className="grid grid-cols-2 gap-10 mb-6">
        {props.education && props.education.length > 0 && (
            <div style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-sm font-black uppercase mb-3 border-b-2 border-gray-900 pb-0.5 inline-block">Education</h2>
                {props.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                        <div className="font-bold text-[12px]">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</div>
                        <div className="text-[11px] text-gray-600">{edu.institution}</div>
                        <div className="text-[10px] italic font-bold text-gray-400 uppercase tracking-tighter">Grad: {edu.endYear} {edu.percentage ? `• ${edu.percentage}` : ""}</div>
                    </div>
                ))}
            </div>
        )}
        {props.certifications && props.certifications.length > 0 && (
            <div style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-sm font-black uppercase mb-3 border-b-2 border-gray-900 pb-0.5 inline-block">Certifications</h2>
                <ul className="space-y-2">
                    {props.certifications.map((cert, idx) => (
                        <li key={idx} className="text-[12px]">
                            <strong>{cert.name}</strong>
                            <div className="text-[11px] text-gray-500">{cert.organization} ({cert.issueDate})</div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>

      {/* ADDITIONAL SECTIONS */}
      {( (props.achievements && props.achievements.length > 0) || (props.awards && props.awards.length > 0) || (props.languages && props.languages.length > 0) ) && (
        <div className="mb-6" style={{ pageBreakInside: 'avoid' }}>
             <h2 className="text-sm font-black uppercase mb-3 border-b-2 border-gray-900 pb-0.5 inline-block">Additional Information</h2>
             <div className="space-y-3">
                {props.achievements && props.achievements.length > 0 && (
                    <div className="text-[11px]">
                        <strong>Key Achievements:</strong> {props.achievements.map(a => a.text).join(" • ")}
                    </div>
                )}
                {props.awards && props.awards.length > 0 && (
                    <div className="text-[11px]">
                        <strong>Honors:</strong> {props.awards.map(a => a.text).join(" • ")}
                    </div>
                )}
                {props.languages && props.languages.length > 0 && (
                    <div className="text-[11px]">
                        <strong>Languages:</strong> {props.languages.map(l => `${l.name} (${l.proficiency})`).join(", ")}
                    </div>
                )}
             </div>
        </div>
      )}
    </div>
  );
}
