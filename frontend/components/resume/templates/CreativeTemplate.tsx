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

export default function CreativeTemplate(props: ResumeProps) {
  const displayName = props.fullName || props.name;

  return (
    <div className="bg-white min-h-[11in] font-sans text-slate-800 p-0 overflow-hidden shadow-2xl border border-slate-200 flex">
      {/* SIDE ACCENT BAR */}
      <div className="w-6 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 shrink-0"></div>

      <div className="flex-1 p-12">
        {/* HEADER */}
        <header className="mb-12 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <p className="text-indigo-600 font-black tracking-[0.3em] uppercase text-[10px] mb-3 ml-1">
            {props.targetRole || "Creative Professional"} {props.domain ? `// ${props.domain}` : ""}
          </p>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-[0.8] text-balance">
            {displayName}
          </h1>
          <div className="flex flex-wrap gap-5 text-[10px] font-black text-slate-400 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm w-fit uppercase tracking-widest">
            <span className="text-slate-900 underline decoration-indigo-400 decoration-2 underline-offset-4">{props.email}</span>
            <span className="text-slate-200">|</span>
            <span>{props.phone}</span>
            <span className="text-slate-200">|</span>
            <span>{props.location || "Location"}</span>
            {props.linkedIn && (
                <>
                    <span className="text-slate-200">|</span>
                    <span className="text-indigo-500 lowercase font-bold tracking-tight">{props.linkedIn.replace(/^https?:\/\//, '')}</span>
                </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-12">
          {/* MAIN CONTENT */}
          <div className="col-span-12 space-y-16">
            
            {/* SUMMARY & CORE HIGHLIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                {props.summary && (
                    <section className="md:col-span-12" style={{ pageBreakInside: 'avoid' }}>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                The Profile
                            </h2>
                            <div className="h-px bg-slate-100 flex-grow"></div>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed max-w-3xl italic font-medium">
                            "{props.summary}"
                        </p>
                    </section>
                )}

                {/* COMPETENCIES CHIPS */}
                {(props.technicalSkills?.length || props.toolsPlatforms?.length || props.softSkills?.length) ? (
                    <section className="md:col-span-12" style={{ pageBreakInside: 'avoid' }}>
                         <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                                Core Competencies
                            </h2>
                            <div className="h-px bg-slate-100 flex-grow"></div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {props.technicalSkills?.map((s, i) => (
                                <span key={i} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100 uppercase">
                                    {s}
                                </span>
                            ))}
                            {props.toolsPlatforms?.map((s, i) => (
                                <span key={i} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-slate-100 uppercase">
                                    {s}
                                </span>
                            ))}
                            {props.softSkills?.map((s, i) => (
                                <span key={i} className="px-4 py-2 bg-white text-slate-900 border-2 border-slate-100 text-[10px] font-black rounded-xl uppercase tracking-widest uppercase">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>

            {/* EXPERIENCE JOURNEY */}
            {props.experience && props.experience.length > 0 && (
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-10 flex items-center gap-4">
                        <span className="flex-none p-3 bg-indigo-600 rounded-2xl text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </span>
                        Experience Milestone
                    </h2>
                    <div className="space-y-12">
                        {props.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-12 group" style={{ pageBreakInside: 'avoid' }}>
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100 group-hover:bg-indigo-200 transition-colors"></div>
                            <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-sm shadow-indigo-100 group-hover:scale-125 transition-transform"></div>
                            
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="font-black text-2xl text-slate-900 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">
                                        {exp.jobTitle}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                                        {exp.companyName}{" // "}{exp.location}
                                    </p>
                                </div>
                                <div className="text-[10px] font-black text-white uppercase bg-slate-900 px-4 py-2 rounded-full tracking-widest">
                                    {exp.startDate} - {exp.currentlyWorking ? "NOW" : exp.endDate}
                                </div>
                            </div>
                            
                            <div className="text-slate-600 text-sm leading-relaxed mb-6 max-w-3xl font-medium">
                                <ul className="space-y-3">
                                    {exp.description.split('\n').filter(d => d.trim()).map((bullet, bIdx) => (
                                        <li key={bIdx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full">
                                            {bullet.replace(/^-/,'').trim()}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {(exp.resultsAchieved || exp.toolsUsed) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {exp.resultsAchieved && (
                                        <div className="bg-gradient-to-r from-indigo-50 to-transparent p-5 rounded-3xl border-l-4 border-indigo-500">
                                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-2 underline decoration-2 underline-offset-4">Impact Log</span>
                                            <p className="text-xs font-bold text-slate-900 leading-snug italic">{exp.resultsAchieved}</p>
                                        </div>
                                    )}
                                    {exp.toolsUsed && (
                                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tech Ecosystem</span>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{exp.toolsUsed}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        ))}
                    </div>
                </section>
            )}

            {/* IMPACT PORTFOLIO (Projects) */}
            {props.projects && props.projects.length > 0 && (
                <section>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-8 flex items-center gap-4">
                         <span className="flex-none p-3 bg-pink-500 rounded-2xl text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 01-.586 1.414l-2.828 2.828A2 2 0 0111 15.828V19h2v-3.172a2 2 0 01.586-1.414l2.828-2.828A2 2 0 0117 10.172V5l-1-1z"></path></svg>
                        </span>
                        Project Portfolio
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {props.projects.map((proj, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all group flex flex-col justify-between" style={{ pageBreakInside: 'avoid' }}>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-black text-xl text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tighter">{proj.name}</h4>
                                        <div className="flex gap-4">
                                            {proj.githubUrl && <a href={proj.githubUrl} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg></a>}
                                            {proj.liveUrl && <a href={proj.liveUrl} className="p-2 bg-pink-50 text-pink-500 rounded-xl hover:bg-pink-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-[13px] leading-relaxed mb-6 font-medium italic opacity-70">"{proj.description}"</p>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    {proj.outcome && (
                                        <div className="flex items-start gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-[11px] font-bold ring-1 ring-emerald-100">
                                            <span className="flex-none">📍</span>
                                            <span>{proj.outcome}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {proj.technologies.split(',').map((t, i) => (
                                            <span key={i} className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                {t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* LOWER STRATUM (Edu, Certs, Languages) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-slate-100" style={{ pageBreakInside: 'avoid' }}>
                {/* EDUCATION */}
                {props.education && props.education.length > 0 && (
                    <section>
                         <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">Foundations</h2>
                         <div className="space-y-8">
                             {props.education.map((edu, i) => (
                                 <div key={i} className="relative group">
                                     <div className="h-1 w-8 bg-slate-900 group-hover:w-full transition-all duration-500 mb-4"></div>
                                     <h3 className="font-black text-slate-900 text-lg tracking-tighter uppercase leading-none mb-1">{edu.degree}</h3>
                                     <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-2 leading-none">{edu.fieldOfStudy}</p>
                                     <p className="text-slate-400 text-xs font-bold leading-none italic">{edu.institution}{" // "}{edu.endYear}</p>
                                     {edu.percentage && <span className="inline-block mt-3 px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black rounded-lg uppercase tracking-tighter">{edu.percentage} Excellence</span>}
                                 </div>
                             ))}
                         </div>
                    </section>
                )}

                {/* SKILL STACK (Detailed) */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">Stack Log</h2>
                    <div className="space-y-6">
                        {props.technicalSkills && props.technicalSkills.length > 0 && (
                            <div>
                                <span className="text-[9px] font-black uppercase text-indigo-400 block mb-2">Systems & Syntax</span>
                                <div className="text-[11px] font-bold text-slate-800 flex flex-wrap gap-x-3 gap-y-1">
                                    {props.technicalSkills.map((s, i) => <span key={i} className="after:content-['/'] last:after:content-[''] after:ml-2 after:text-slate-100">{s}</span>)}
                                </div>
                            </div>
                        )}
                        {props.toolsPlatforms && props.toolsPlatforms.length > 0 && (
                            <div>
                                <span className="text-[9px] font-black uppercase text-purple-400 block mb-2">Engines & Ops</span>
                                <div className="text-[11px] font-bold text-slate-800 flex flex-wrap gap-x-3 gap-y-1">
                                    {props.toolsPlatforms.map((s, i) => <span key={i} className="after:content-['/'] last:after:content-[''] after:ml-2 after:text-slate-100">{s}</span>)}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* CERTIFICATIONS & OTHER */}
                <section className="space-y-10">
                    {props.certifications && props.certifications.length > 0 && (
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6">Accreditations</h2>
                            <div className="space-y-4">
                                {props.certifications.map((cert, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group overflow-hidden">
                                        <div className="relative z-10">
                                            <p className="font-black text-slate-900 text-[10px] uppercase leading-tight group-hover:text-indigo-600 transition-colors tracking-tighter">{cert.name}</p>
                                            <p className="text-slate-400 text-[8px] font-bold uppercase mt-1 tracking-tighter italic">{cert.organization}{" // "}{cert.issueDate}</p>
                                        </div>
                                        <div className="absolute right-0 bottom-0 text-slate-100 text-4xl font-black translate-x-4 translate-y-4 group-hover:scale-150 transition-transform">✓</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
