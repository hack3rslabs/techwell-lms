import type { Metadata } from "next";
import { CityTrainingPage, type CityTrainingContent } from "@/components/seo/CityTrainingPage";
import { createCityTrainingSchema } from "@/lib/city-seo";

const title = "Software Training Institute in Guntur | Techwell";
const description =
  "Join practical online software training for Guntur students. Learn coding, AI and cybersecurity with projects, interview preparation and placement support.";
const path = "/software-training-guntur";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  keywords: [
    "software training institute in Guntur",
    "software courses Guntur",
    "IT training Guntur",
    "coding classes Guntur",
    "computer institute Guntur",
  ],
  openGraph: { title, description, url: path },
};

const content: CityTrainingContent = {
  city: "Guntur",
  eyebrow: "Online software learning for Guntur",
  title: "Practical Software Training for Students in Guntur",
  intro:
    "Techwell supports Guntur learners with structured online software courses, hands-on projects, AI interview practice and tools for building a stronger technology career.",
  sections: [
    {
      heading: "Develop software skills that employers can assess",
      paragraphs: [
        "A useful software training program should help students move from understanding a concept to building with it. Techwell offers online training for Guntur students who want practical exposure to programming, software development, web technologies, artificial intelligence, cybersecurity and related digital skills. Course paths combine guided instruction with exercises and assessments so learners can check their understanding as they progress.",
        "This structure supports college students, recent graduates and working professionals. A beginner can establish programming and computer fundamentals before moving into advanced topics. Learners with prior experience can concentrate on a specific skill gap, complete a project or prepare for recruitment. Because training is available online, students can continue learning alongside college schedules, employment or competitive exam preparation.",
      ],
    },
    {
      heading: "Turn learning into demonstrable project experience",
      paragraphs: [
        "Recruiters often ask candidates to describe what they have built, why they chose a particular approach and how they solved problems during development. Techwell’s project-first ecosystem helps learners prepare for those conversations. Final-year project resources, source-code learning and documentation guidance give students a framework for understanding complete applications rather than isolated code examples.",
        "Learners can also use the resume builder to present skills and projects in an ATS-friendly format. AI mock interviews create a repeatable way to practice technical and behavioral questions, review performance and improve communication. These tools complement the course material and help students prepare for the full recruitment process, not simply the technical test.",
      ],
    },
    {
      heading: "Online career support for Guntur learners",
      paragraphs: [
        "Techwell connects learning with career action through interview preparation, job discovery and placement support. Students can browse opportunities, strengthen their profiles and continue practicing as they apply. The aim is to make the transition from education to employment more structured, especially for freshers entering software and IT roles.",
        "If you are based in Guntur, you can explore the course catalog from anywhere and select a path based on your current skills and career goal. Contact the Techwell team for help comparing options or understanding how projects and interview tools fit into your plan. From a first coding course to preparation for a software interview, the platform is designed to keep learning practical and connected to the next step.",
      ],
    },
  ],
  highlights: [
    "Software development, coding, AI and cybersecurity paths",
    "Practical assignments and project-based learning",
    "Final-year project and documentation support",
    "AI mock interviews and professional resume tools",
    "Placement support for students and graduates in Guntur",
  ],
  relatedLocations: [
    { label: "IT Training in Vizag", href: "/it-training-vizag" },
    { label: "Computer Courses in Vijayawada", href: "/computer-courses-vijayawada" },
    { label: "All Courses", href: "/courses" },
  ],
};

export default function GunturTrainingPage() {
  const schema = createCityTrainingSchema({
    city: content.city,
    pageName: title,
    path,
    description,
  });

  return (
    <>
      <script
        type="application/ld+json"
        // deepcode ignore DOMXSS: Sanitized by React
dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CityTrainingPage content={content} />
    </>
  );
}
