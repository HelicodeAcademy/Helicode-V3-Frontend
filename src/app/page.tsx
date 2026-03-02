import Navbar from "@/components/navigation/Navbar";
// import SignupPage from "./signup/page";
import Hero from "@/components/Landing-page/Hero";
import SupporterLogos from "@/components/Landing-page/SupporterLogos";
import ImageFadeSection from "@/components/Landing-page/ImageFadeSection";
import Features from "@/components/Landing-page/Features";
import Testimonial from "@/components/Landing-page/Testimonial";
import HowItWorks from "@/components/Landing-page/HowItWorks";
import FooterCTA from "@/components/Landing-page/FooterCTA";
import Footer from "@/components/Landing-page/Footer";
export default function Home() {
  return (
    <div className="">
      <Navbar />
      <Hero />
      <SupporterLogos />
      <ImageFadeSection />
      <Features />
      <HowItWorks />
      <Testimonial />
      <FooterCTA />
      <Footer />
      {/* <SignupPage /> */}
    </div>
  );
}
