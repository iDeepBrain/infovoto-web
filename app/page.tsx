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
    <main className="min-h-screen bg-[#0a0f1a] relative">
      {/* Pixel art background */}
      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: "url('/bg-pixel-mountains.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      <div className="relative z-10">
      <Navbar />
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <Footer />
      </div>
    </main>
  );
}
