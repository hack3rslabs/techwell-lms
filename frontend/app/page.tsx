import { Hero } from "@/components/home/Hero";
import { WhyTrust } from "@/components/home/WhyTrust";
import { CredentialsSection } from "@/components/home/CredentialsSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { PlacementPartners } from "@/components/sections/PlacementPartners";
import { StudentJourney } from "@/components/home/StudentJourney";

export default function Home() {
  return (
    <div className="flex flex-col gap-0 overflow-x-hidden">
      <Hero />
      <div className="mt-8 relative z-20">
        <StudentJourney />
      </div>
      <PricingSection />
      <WhyTrust />
      <CredentialsSection />
      <CTASection />
      <Testimonials />
      <PlacementPartners />
    </div>
  );
}
