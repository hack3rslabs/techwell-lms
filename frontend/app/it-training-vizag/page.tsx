import type { Metadata } from "next";
import { CityTrainingPage, type CityTrainingContent } from "@/components/seo/CityTrainingPage";
import { createCityTrainingSchema } from "@/lib/city-seo";

const title = "IT Training Institute in Vizag | Techwell";
const description =
  "Build job-ready skills with Techwell's online IT training for Vizag students. Explore coding, cybersecurity, AI, projects and placement support.";
const path = "/it-training-vizag";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  keywords: [
    "IT training institute in Vizag",
    "IT courses Visakhapatnam",
    "computer training Vizag",
    "software courses in Visakhapatnam",
    "coding classes Vizag",
  ],
  openGraph: { title, description, url: path },
};

const content: CityTrainingContent = {
  city: "Visakhapatnam",
  eyebrow: "Online training for Visakhapatnam learners",
  title: "Practical IT Training Institute for Students in Vizag",
  intro:
    "Techwell helps learners in Visakhapatnam develop practical technology skills through guided online courses, hands-on projects, AI interview practice and career support.",
  sections: [
    {
      heading: "Industry-focused IT courses for Vizag students",
      paragraphs: [
        "Visakhapatnam is growing as an education, technology and business destination, creating new opportunities for graduates who can demonstrate practical digital skills. Techwell offers online IT training for Vizag students who want structured learning without being limited by travel or classroom schedules. Learners can study software development, programming, cybersecurity, artificial intelligence and other in-demand subjects through a platform designed to connect theory with workplace applications.",
        "Training is centered on active practice. Students work through guided lessons, assessments and portfolio-ready tasks instead of relying only on recorded lectures. Final-year students can also explore project resources that help them understand planning, development, documentation and presentation. This approach supports learners preparing for academic reviews as well as entry-level technical interviews.",
      ],
    },
    {
      heading: "Career preparation beyond the course syllabus",
      paragraphs: [
        "Technical knowledge is only one part of becoming employable. Techwell combines course learning with resume-building tools, AI-powered mock interviews, communication practice and access to job opportunities. Students can rehearse common interview situations, identify areas that need improvement and become more confident before speaking with recruiters. The platform also helps learners present projects and skills in a clearer, more professional way.",
        "Whether you are studying at a college in Vizag, returning to work, or planning a career change, you can choose a learning path that matches your current level. Beginners can establish strong foundations, while experienced learners can focus on specific technologies or interview preparation. Techwell’s support ecosystem is intended to make each stage—from choosing a course to applying for roles—more organized and measurable.",
      ],
    },
    {
      heading: "Learn online from Visakhapatnam with Techwell",
      paragraphs: [
        "Vizag learners can access Techwell online and learn at a practical pace while staying connected to Andhra Pradesh-based support. Browse the current course catalog, compare skill paths and speak with the team before enrolling. If your goal is to become job-ready, complete a strong final-year project or prepare for your next technical interview, Techwell gives you one place to learn, practice and move forward.",
      ],
    },
  ],
  highlights: [
    "Practical software, coding, AI and cybersecurity learning paths",
    "Guided final-year projects and portfolio development",
    "AI mock interviews and resume-building tools",
    "Placement support and access to relevant job opportunities",
    "Flexible online access for learners across Visakhapatnam",
  ],
  relatedLocations: [
    { label: "Computer Courses in Vijayawada", href: "/computer-courses-vijayawada" },
    { label: "Software Training in Guntur", href: "/software-training-guntur" },
    { label: "All Courses", href: "/courses" },
  ],
};

export default function VizagTrainingPage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <CityTrainingPage content={content} />
    </>
  );
}
