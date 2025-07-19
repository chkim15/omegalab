import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import UniversityCarousel from "@/components/university-carousel";
import FeaturesSection from "@/components/features-section";
import TestimonialsSection from "@/components/testimonials-section";
import FaqSection from "@/components/faq-section";
import PricingSection from "@/components/pricing-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <UniversityCarousel />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
