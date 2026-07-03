import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { WhyTrust } from "@/components/home/WhyTrust";
import { Testimonials } from "@/components/sections/Testimonials";
import { PlacementPartners } from "@/components/sections/PlacementPartners";
import { StudentJourney } from "@/components/home/StudentJourney";
import { RegionalTrainingSection } from "@/components/home/RegionalTrainingSection";

export const metadata: Metadata = {
  title: {
    absolute: "IT Training Institute in Andhra Pradesh | Techwell",
  },
  description:
    "Join Techwell for AI-powered IT training, software courses, cybersecurity, coding, final-year projects and placement support across Andhra Pradesh.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "IT training institute in Andhra Pradesh",
    "computer courses in Andhra Pradesh",
    "software training institute AP",
    "AI training Andhra Pradesh",
    "cybersecurity courses Andhra Pradesh",
    "coding institute Andhra Pradesh",
    "Techwell Srikakulam",
  ],
  openGraph: {
    title: "IT Training Institute in Andhra Pradesh | Techwell",
    description:
      "AI-powered IT courses, practical projects, interview preparation and placement support for students across Andhra Pradesh.",
    url: "https://techwell.co.in",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://techwell.co.in/#organization",
      name: "Techwell IT Solutions",
      alternateName: "Techwell",
      url: "https://techwell.co.in",
      logo: "https://techwell.co.in/logo-light.png",
      description:
        "AI-powered IT training, computer courses, final-year projects, interview preparation and placement support in Andhra Pradesh.",
      telephone: "+91-7997473473",
      email: "support@techwell.co.in",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Srikakulam",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Andhra Pradesh",
      },
      sameAs: [
        "https://www.instagram.com/techwell_official/",
        "https://www.linkedin.com/in/techwell-it",
        "https://www.youtube.com/@techwellInstitutes/featured",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://techwell.co.in/#website",
      url: "https://techwell.co.in",
      name: "Techwell",
      publisher: {
        "@id": "https://techwell.co.in/#organization",
      },
      inLanguage: "en-IN",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="flex flex-col gap-0 overflow-x-hidden">
        <Hero />
        <div className="mt-2 relative z-20">
          <StudentJourney />
        </div>
        <WhyTrust />
        <RegionalTrainingSection />
        <Testimonials />
        <PlacementPartners />
      </div>
    </>
  );
}
