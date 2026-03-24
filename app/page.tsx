/**
 * Landing page publica — infovoto.pe
 * Chat-first + Trust-first con Voti (pixel art cyber llama)
 */

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import DemoSection from "./components/DemoSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <Footer />
    </main>
  );
}
