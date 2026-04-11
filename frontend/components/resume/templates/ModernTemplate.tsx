import React from 'react';

interface ResumeProps {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: Array<{ name: string; proficiency: string }>;
  experience?: Array<{
    jobTitle: string;
    companyName: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startYear: string;
    endYear: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
  }>;
}

export default function ModernTemplate(props: ResumeProps) {
  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h1 className="text-3xl font-bold text-blue-700">{props.name}</h1>
      <div className="text-gray-600">{props.email} | {props.phone}</div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Professional Summary</h2>
        <p>{props.summary}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <ul className="list-disc ml-6">
          {(Array.isArray(props.skills) ? props.skills : []).map((skill, idx: number) => (
            <li key={idx}>
              {skill.name}
              {skill.proficiency ? ` (${skill.proficiency})` : ''}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Education</h2>
        <ul className="list-disc ml-6">
          {(Array.isArray(props.education) ? props.education : []).map((edu, idx: number) => (
            <li key={idx}>
              <strong>{edu.degree}</strong> in {edu.fieldOfStudy} - {edu.institution} ({edu.startYear} - {edu.endYear})
              {edu.percentage && <span>, {edu.percentage}</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Experience</h2>
        <ul className="list-disc ml-6">
          {(Array.isArray(props.experience) ? props.experience : []).map((exp, idx: number) => (
            <li key={idx}>
              <strong>{exp.jobTitle}</strong> at {exp.companyName} ({exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate})<br />
              {exp.location && <span>{exp.location}, </span>}{exp.employmentType && <span>{exp.employmentType}</span>}<br />
              {exp.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
