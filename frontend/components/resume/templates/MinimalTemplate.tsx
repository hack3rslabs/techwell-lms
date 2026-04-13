import React from "react";

interface ResumeProps {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;

  skills?: Array<{
    name: string;
    proficiency: string;
  }>;

  experience?: Array<{
    jobTitle: string;
    companyName: string;
    location?: string;
    employmentType?: string;
    startDate: string;
    endDate: string;
    currentlyWorking?: boolean;
    description: string;
  }>;

  education?: Array<{
    degree: string;
    fieldOfStudy?: string;
    institution: string;
    location?: string;
    startYear: string;
    endYear: string;
    percentage?: string;
  }>;

  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
  }>;
}

export default function MinimalTemplate(props: ResumeProps) {
  return (
    <div className="p-4 bg-white border-l-4 border-blue-500">

      {/* HEADER */}
      <h1 className="text-xl font-bold">{props.name}</h1>
      <div className="text-gray-500 text-sm">
        {props.email} | {props.phone}
      </div>

      {/* SUMMARY */}
      <div className="mt-3">
        <strong>Summary:</strong>{" "}
        <p className="text-sm text-gray-700">{props.summary}</p>
      </div>

      {/* SKILLS */}
      <div className="mt-3">
        <strong>Skills:</strong>
        <ul className="list-disc ml-6 text-sm">
          {(Array.isArray(props.skills) ? props.skills : []).map(
            (skill, idx) => (
              <li key={idx}>
                {skill.name}
                {skill.proficiency ? ` (${skill.proficiency})` : ""}
              </li>
            )
          )}
        </ul>
      </div>

      {/* EDUCATION */}
      <div className="mt-3">
        <strong>Education:</strong>
        <ul className="list-disc ml-6 text-sm">
          {(Array.isArray(props.education) ? props.education : []).map(
            (edu, idx) => (
              <li key={idx}>
                <strong>{edu.degree}</strong>
                {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} -{" "}
                {edu.institution} ({edu.startYear} - {edu.endYear})
                {edu.percentage ? `, ${edu.percentage}` : ""}
              </li>
            )
          )}
        </ul>
      </div>

      {/* EXPERIENCE */}
      <div className="mt-3">
        <strong>Experience:</strong>
        <ul className="list-disc ml-6 text-sm">
          {(Array.isArray(props.experience) ? props.experience : []).map(
            (exp, idx) => (
              <li key={idx} className="mb-2">
                <strong>{exp.jobTitle}</strong> at {exp.companyName} (
                {exp.startDate} -{" "}
                {exp.currentlyWorking ? "Present" : exp.endDate})
                <br />

                {(exp.location || exp.employmentType) && (
                  <span className="text-gray-600 text-xs">
                    {exp.location ? exp.location : ""}
                    {exp.location && exp.employmentType ? ", " : ""}
                    {exp.employmentType ? exp.employmentType : ""}
                  </span>
                )}

                <p className="text-gray-700 text-sm mt-1">
                  {exp.description}
                </p>
              </li>
            )
          )}
        </ul>
      </div>

    </div>
  );
}