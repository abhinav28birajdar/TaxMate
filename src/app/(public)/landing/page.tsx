import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
