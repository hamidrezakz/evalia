import { HeroSection } from "@/components/sections";
import { ValuePropsSection } from "@/components/sections/landing/value-props-section";
import { ProblemSolutionSection } from "@/components/sections/landing/problem-solution-section";
import { WhyGameSection } from "@/components/sections/landing/why-game-section";
import { PackageStructureSection } from "@/components/sections/landing/package-structure-section";
import { PricingSection } from "@/components/sections/landing/pricing-section";
import { ROISection } from "@/components/sections/landing/roi-section";
import { CTASection } from "@/components/sections/landing/cta-section";
import { ModeToggle } from "@/components/modetoggle";
import { AppPageLayout } from "@/components/layout/app-page-layout";

export const metadata = {
  title: "Playfulife Org | راهکار بازی‌محور سازمانی",
  description:
    "پکیج ۳ ماهه تحول سازمانی مبتنی بر بازی، تحلیل رفتاری و توسعه تیمی",
};

export default function LandingPage() {
  return (
    <AppPageLayout>
      <HeroSection
        fullHeight
        className="w-full"
        highlight="نسخه نمایشی"
        title={
          <span>
            راهکار سازمانی <span className="text-primary">Evalia</span>
          </span>
        }
        description="داشبورد منابع انسانی مدرن با تمرکز بر سادگی، سرعت و یکپارچگی"
        primaryAction={{ label: "شروع کنید", href: "/dashboard" }}
        secondaryAction={{ label: "مشاهده UI", href: "/dashboard/ui" }}
        headerRight={
          <div>
            <div
              className="size-10 md:size-12 rounded-lg bg-primary/20 border border-primary/30"
              aria-label="لوگو"
            />
          </div>
        }
        headerLeft={
          <div>
            <ModeToggle />
          </div>
        }
      />
      <div className="w-[96%] sm:w-[90%] lg:w-[86%] mx-auto">
        <ValuePropsSection />
        <ProblemSolutionSection />
        <WhyGameSection />
        <PackageStructureSection />
        <PricingSection />
        <ROISection />
        <CTASection />
      </div>
    </AppPageLayout>
  );
}
