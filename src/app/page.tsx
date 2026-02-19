import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { StatsSection } from "@/components/landing/stats-section";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-linear-to-b from-background to-muted/20">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
