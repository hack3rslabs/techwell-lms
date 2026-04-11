import React from 'react';

export default function MinimalTemplate(props: any) {
  return (
    <div className="p-4 bg-white border-l-4 border-blue-500">
      <h1 className="text-xl font-bold">{props.name}</h1>
      <div className="text-gray-500 text-sm">{props.email} | {props.phone}</div>
      <div className="mt-2">
        <strong>Summary:</strong> {props.summary}
      </div>
      <div className="mt-2">
        <strong>Skills:</strong>
        <ul className="list-disc ml-6">
          {(Array.isArray(props.skills) ? props.skills : []).map((skill: any, idx: number) => (
            <li key={idx}>
              {skill.name}
              {skill.proficiency ? ` (${skill.proficiency})` : ''}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <strong>Education:</strong>
        <ul className="list-disc ml-6">
          {(Array.isArray(props.education) ? props.education : []).map((edu: any, idx: number) => (
            <li key={idx}>
              <strong>{edu.degree}</strong> in {edu.fieldOfStudy} - {edu.institution} ({edu.startYear} - {edu.endYear})
              {edu.percentage && <span>, {edu.percentage}</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <strong>Experience:</strong>
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
