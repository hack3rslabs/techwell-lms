import React from 'react';

export default function ModernTemplate(props: any) {
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
          {(Array.isArray(props.skills) ? props.skills : []).map((skill: any, idx: number) => (
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
          {(Array.isArray(props.education) ? props.education : []).map((edu: any, idx: number) => (
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
          {(Array.isArray(props.experience) ? props.experience : []).map((exp: any, idx: number) => (
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
