import type { Metadata } from "next";
import { CityTrainingPage, type CityTrainingContent } from "@/components/seo/CityTrainingPage";
import { createCityTrainingSchema } from "@/lib/city-seo";

const title = "Computer Courses in Vijayawada | Techwell";
const description =
  "Explore online computer courses for Vijayawada students with coding, software, AI, cybersecurity, projects, interview practice and placement support.";
const path = "/computer-courses-vijayawada";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  keywords: [
    "computer courses in Vijayawada",
    "computer training institute Vijayawada",
    "coding courses Vijayawada",
    "software training Vijayawada",
    "IT courses Vijayawada",
  ],
  openGraph: { title, description, url: path },
};

const content: CityTrainingContent = {
  city: "Vijayawada",
  eyebrow: "Online courses for Vijayawada students",
  title: "Job-Focused Computer Courses for Learners in Vijayawada",
  intro:
    "Learn current computer and software skills through Techwell's practical online ecosystem, with projects, interview preparation and career support for Vijayawada learners.",
  sections: [
    {
      heading: "Computer training built around practical skills",
      paragraphs: [
        "Students and graduates in Vijayawada need more than a certificate to stand out in a competitive hiring market. Employers increasingly look for candidates who can explain concepts, solve problems and show evidence of practical work. Techwell’s online computer courses help Vijayawada learners build those capabilities through structured lessons, exercises, assessments and project-based practice.",
        "Learners can explore coding, software development, web technologies, cybersecurity, artificial intelligence and other career-oriented subjects available in the Techwell course catalog. Each learning path is designed to make complex topics easier to understand and apply. Beginners can start with fundamentals, while students who already know the basics can strengthen specific technical areas or prepare for interviews.",
      ],
    },
    {
      heading: "Projects, resumes and interview preparation",
      paragraphs: [
        "A strong project can turn classroom knowledge into something recruiters can evaluate. Techwell provides access to final-year project resources, source-code learning and documentation support that help students understand how a complete solution is developed and presented. Learners are encouraged to use projects to demonstrate their decision-making, technical contribution and ability to communicate results.",
        "The platform also includes career tools beyond the course itself. Students can create ATS-friendly resumes, practice with AI-driven mock interviews and review feedback before attending real interviews. This combination is particularly useful for fresh graduates who may understand technical subjects but have limited experience presenting themselves to employers. Placement support and job listings provide a clearer next step after skill development.",
      ],
    },
    {
      heading: "Flexible online learning from Vijayawada",
      paragraphs: [
        "Techwell’s online format gives learners in Vijayawada the flexibility to train alongside college, work or exam preparation. You can revisit lessons, practice at your own pace and use one connected ecosystem for learning, projects, interview readiness and job discovery. Andhra Pradesh-based support also makes it easier to discuss local student needs and career goals.",
        "Browse the available courses to find a suitable starting point, or contact Techwell if you need help selecting a path. Whether your immediate goal is a final-year project, a first software role or a transition into a new technology field, the focus remains the same: build useful skills and learn how to demonstrate them with confidence.",
      ],
    },
  ],
  highlights: [
    "Beginner-to-career computer and software courses",
    "Hands-on exercises and portfolio-ready project experience",
    "Final-year project guidance and documentation resources",
    "AI interview practice and ATS-friendly resume support",
    "Online access with placement assistance for Vijayawada learners",
  ],
  relatedLocations: [
    { label: "IT Training in Vizag", href: "/it-training-vizag" },
    { label: "Software Training in Guntur", href: "/software-training-guntur" },
    { label: "All Courses", href: "/courses" },
  ],
};

export default function VijayawadaCoursesPage() {
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
