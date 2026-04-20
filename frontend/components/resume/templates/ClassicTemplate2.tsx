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

export default function ClassicTemplate2(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="p-10 bg-white text-black font-serif leading-tight max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-4xl font-bold uppercase mb-1 leading-none">{displayName}</h1>
        <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
            {props.targetRole} {props.domain ? `— ${props.domain}` : ""}
        </div>
        <div className="text-xs flex flex-wrap justify-center gap-x-6 gap-y-1 mt-2 italic text-gray-600">
          {props.phone && <span>{props.phone}</span>}
          {props.email && <span>{props.email}</span>}
          {props.location && <span>{props.location}</span>}
          {props.linkedIn && <span className="not-italic font-bold">{props.linkedIn.replace(/^https?:\/\//, '')}</span>}
          {props.github && <span className="not-italic font-bold">{props.github.replace(/^https?:\/\//, '')}</span>}
        </div>
      </div>

      {/* PROFESSIONAL SUMMARY */}
      {props.summary && (
        <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-md font-bold uppercase border-b border-black mb-3 pb-0.5 tracking-wider">Executive Profile</h2>
          <p className="text-[13px] text-gray-800 text-justify leading-relaxed font-serif">
            {props.summary}
          </p>
        </div>
      )}

      {/* CORE COMPETENCIES */}
      {(props.technicalSkills?.length || props.toolsPlatforms?.length || props.softSkills?.length) ? (
        <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-md font-bold uppercase border-b border-black mb-3 pb-0.5 tracking-wider">Expertise & Competencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-[12px] text-gray-800">
             {props.technicalSkills && props.technicalSkills.length > 0 && (
                <div className="flex gap-2">
                    <span className="font-bold uppercase min-w-[100px] text-gray-500">Technical:</span>
                    <span>{props.technicalSkills.join(", ")}</span>
                </div>
             )}
             {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
                <div className="flex gap-2">
                    <span className="font-bold uppercase min-w-[100px] text-gray-500">Tools:</span>
                    <span>{props.toolsPlatforms.join(", ")}</span>
                </div>
             )}
             {props.softSkills && props.softSkills.length > 0 && (
                <div className="flex gap-2">
                    <span className="font-bold uppercase min-w-[100px] text-gray-500">Skills:</span>
                    <span>{props.softSkills.join(", ")}</span>
                </div>
             )}
          </div>
        </div>
      ) : null}

      {/* PROFESSIONAL EXPERIENCE */}
      {props.experience && props.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-md font-bold uppercase border-b border-black mb-4 pb-0.5 tracking-wider">Career History</h2>
          {props.experience.map((exp, idx) => (
            <div key={idx} className="mb-6" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-[14px] text-gray-900 uppercase">
                  {exp.jobTitle}
                </h3>
                <span className="text-xs font-bold uppercase">
                  {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                </span>
              </div>
              <div className="text-[13px] font-bold italic text-gray-700 mb-2">
                {exp.companyName} {exp.location ? `— ${exp.location}` : ""}
              </div>
              <div className="text-[13px] text-gray-800">
                <ul className="list-disc ml-5 space-y-1.5">
                  {exp.description.split('\n').filter(d => d.trim()).map((bullet, bIdx) => (
                    <li key={bIdx} className="pl-1">{bullet.replace(/^-/,'').trim()}</li>
                  ))}
                </ul>
              </div>
              {(exp.resultsAchieved || exp.toolsUsed) && (
                  <div className="mt-2 ml-5 border-l border-gray-300 pl-3 italic text-[12px] text-gray-600 space-y-1">
                      {exp.resultsAchieved && <div><strong>Selected Achievement:</strong> {exp.resultsAchieved}</div>}
                      {exp.toolsUsed && <div><strong>Technologies:</strong> {exp.toolsUsed}</div>}
                  </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PROJECTS & EDUCATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
             {props.projects && props.projects.length > 0 && (
                <div>
                     <h2 className="text-md font-bold uppercase border-b border-black mb-4 pb-0.5 tracking-wider">Significant Projects</h2>
                     {props.projects.map((proj, idx) => (
                        <div key={idx} className="mb-5" style={{ pageBreakInside: 'avoid' }}>
                             <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-[13px] uppercase">{proj.name}</h3>
                                {proj.githubUrl && <a href={proj.githubUrl} className="text-[10px] font-bold text-gray-400 hover:text-black">SOURCE</a>}
                             </div>
                             <p className="text-[12px] text-gray-700 mb-1 italic">{proj.description}</p>
                             {proj.outcome && <p className="text-[12px] font-bold text-gray-900 border-l-2 border-black pl-2">Impact: {proj.outcome}</p>}
                        </div>
                     ))}
                </div>
             )}
          </div>

          <div className="space-y-8">
              {props.education && props.education.length > 0 && (
                  <div>
                      <h2 className="text-md font-bold uppercase border-b border-black mb-4 pb-0.5 tracking-wider">Education</h2>
                      {props.education.map((edu, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="font-bold text-[13px] leading-tight">{edu.degree}</div>
                            <div className="text-[12px] italic text-gray-600">{edu.institution}</div>
                            <div className="text-[11px] font-bold uppercase mt-1">Class of {edu.endYear} {edu.percentage ? `• ${edu.percentage}` : ""}</div>
                        </div>
                      ))}
                  </div>
              )}
              {props.certifications && props.certifications.length > 0 && (
                  <div>
                      <h2 className="text-md font-bold uppercase border-b border-black mb-4 pb-0.5 tracking-wider">Certifications</h2>
                      <ul className="space-y-3">
                        {props.certifications.map((cert, idx) => (
                            <li key={idx} className="text-[12px] leading-tight">
                                <div className="font-bold uppercase tracking-tighter">{cert.name}</div>
                                <div className="text-[11px] text-gray-500 italic">{cert.organization} ({cert.issueDate})</div>
                            </li>
                        ))}
                      </ul>
                  </div>
              )}
          </div>
      </div>

      {/* ADDITIONAL DETAILS FOOTER */}
      {( (props.languages && props.languages.length > 0) || (props.achievements && props.achievements.length > 0) || (props.awards && props.awards.length > 0) ) && (
          <div className="mt-10 border-t border-black pt-6">
              <div className="grid grid-cols-2 gap-8 text-[12px]">
                  <div>
                      {props.languages && props.languages.length > 0 && (
                          <div className="mb-4">
                              <span className="font-bold uppercase tracking-widest text-[10px] text-gray-500 block mb-1">Linguistic Skills</span>
                              {props.languages.map((l, i) => `${l.name} (${l.proficiency})`).join(", ")}
                          </div>
                      )}
                      {props.interests && props.interests.length > 0 && (
                          <div>
                              <span className="font-bold uppercase tracking-widest text-[10px] text-gray-500 block mb-1">Personal Interests</span>
                              {props.interests.map(it => it.name).join(" • ")}
                          </div>
                      )}
                  </div>
                  <div>
                      {(props.achievements?.length || props.awards?.length) && (
                           <div>
                              <span className="font-bold uppercase tracking-widest text-[10px] text-gray-500 block mb-1">Commendations</span>
                              <ul className="list-disc ml-4 space-y-1">
                                {props.achievements?.map((a, i) => <li key={i}>{a.text}</li>)}
                                {props.awards?.map((a, i) => <li key={i} className="font-bold">{a.text}</li>)}
                              </ul>
                           </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
