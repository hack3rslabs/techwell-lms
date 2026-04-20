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

export default function ExecutiveTemplate(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="bg-white min-h-[11in] font-serif text-slate-900 flex">
      {/* SIDEBAR */}
      <div className="w-1/3 bg-slate-50 p-10 border-r border-slate-100 flex flex-col space-y-10">
        <header>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">{displayName}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{props.targetRole}</p>
          <div className="h-1 w-20 bg-slate-900 mt-6"></div>
        </header>

        <section className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Contact Matrix</h2>
          <div className="space-y-3 text-[11px] font-medium text-slate-600">
             <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-slate-300 uppercase">Direct</span>
                <span>{props.phone}</span>
             </div>
             <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-slate-300 uppercase">Electronic</span>
                <span className="break-all">{props.email}</span>
             </div>
             <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-slate-300 uppercase">Location</span>
                <span>{props.location}</span>
             </div>
             {props.linkedIn && (
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-slate-300 uppercase">LinkedIn</span>
                    <span className="text-slate-900 underline underline-offset-2 tracking-tight overflow-hidden text-ellipsis">{props.linkedIn.replace(/^https?:\/\//, '')}</span>
                 </div>
             )}
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section className="space-y-8">
            {props.technicalSkills && props.technicalSkills.length > 0 && (
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Core Stack</h2>
                    <ul className="space-y-2">
                        {props.technicalSkills.map((s, i) => (
                            <li key={i} className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full shrink-0"></span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Operations</h2>
                    <div className="flex flex-wrap gap-2">
                        {props.toolsPlatforms.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-black uppercase rounded-lg shadow-sm">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {props.softSkills && props.softSkills.length > 0 && (
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Interpersonal</h2>
                    <div className="text-xs italic text-slate-500 font-medium leading-relaxed">
                        {props.softSkills.join(" • ")}
                    </div>
                </div>
            )}
        </section>

        {/* EDUCATION */}
        {props.education && props.education.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Education</h2>
              <div className="space-y-4">
                {props.education.map((edu, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-black text-slate-900 uppercase tracking-tighter leading-tight">{edu.degree}</div>
                    <div className="text-slate-500 text-[10px] italic font-medium">{edu.institution}</div>
                    <div className="text-slate-900 font-bold text-[9px] mt-1">{edu.endYear}</div>
                  </div>
                ))}
              </div>
            </section>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 space-y-12 overflow-hidden">
        {/* SUMMARY */}
        {props.summary && (
            <section style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-4">
                    Executive Profile <span className="h-px bg-slate-100 flex-grow"></span>
                </h2>
                <p className="text-[13px] text-slate-700 text-justify leading-relaxed italic">
                    "{props.summary}"
                </p>
            </section>
        )}

        {/* EXPERIENCE */}
        {props.experience && props.experience.length > 0 && (
            <section>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-4">
                    Career Milestone <span className="h-px bg-slate-100 flex-grow"></span>
                </h2>
                <div className="space-y-8">
                    {props.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-slate-50" style={{ pageBreakInside: 'avoid' }}>
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-900"></div>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-black text-base text-slate-900 uppercase tracking-tighter">{exp.jobTitle}</h3>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                                </span>
                            </div>
                            <div className="text-[13px] font-bold text-slate-600 mb-2">{exp.companyName} | {exp.location}</div>
                            <div className="text-[13px] text-slate-700">
                                <ul className="space-y-1.5 list-none">
                                    {exp.description.split('\n').filter(d => d.trim()).map((bullet, bIdx) => (
                                        <li key={bIdx} className="relative pl-4 before:content-['→'] before:absolute before:left-0 before:text-slate-300 before:font-bold">
                                            {bullet.replace(/^-/,'').trim()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {(exp.resultsAchieved || exp.toolsUsed) && (
                                <div className="mt-4 bg-slate-50 p-4 rounded-lg flex flex-col gap-2">
                                    {exp.resultsAchieved && (
                                        <div className="text-[12px] leading-snug">
                                            <span className="text-[9px] font-black uppercase text-indigo-400 block mb-0.5">Impact</span>
                                            <span className="font-bold text-slate-800">{exp.resultsAchieved}</span>
                                        </div>
                                    )}
                                    {exp.toolsUsed && (
                                        <div className="text-[10px] text-slate-400">
                                            <strong>Tech:</strong> {exp.toolsUsed}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* PROJECTS */}
        {props.projects && props.projects.length > 0 && (
            <section style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-4">
                    Projects <span className="h-px bg-slate-100 flex-grow"></span>
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    {props.projects.map((proj, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-black text-[12px] text-slate-900 uppercase mb-1">{proj.name}</h4>
                            <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{proj.description}</p>
                            {proj.outcome && <div className="text-[10px] font-black text-indigo-500 underline decoration-indigo-200 uppercase tracking-tighter">Result: {proj.outcome}</div>}
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* ACHIEVEMENTS */}
        {(props.achievements?.length || props.awards?.length) ? (
            <section style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-4">
                    Recognition <span className="h-px bg-slate-100 flex-grow"></span>
                </h2>
                <div className="grid grid-cols-2 gap-8">
                    {props.achievements && props.achievements.length > 0 && (
                        <ul className="space-y-2 text-[12px] text-slate-700">
                            {props.achievements.map((a, i) => <li key={i} className="font-bold">• {a.text}</li>)}
                        </ul>
                    )}
                    {props.awards && props.awards.length > 0 && (
                        <ul className="space-y-2 text-[12px] italic text-slate-500 font-medium leading-relaxed">
                            {props.awards.map((a, i) => <li key={i}>"{a.text}"</li>)}
                        </ul>
                    )}
                </div>
            </section>
        ) : null}
      </div>
    </div>
  );
}
