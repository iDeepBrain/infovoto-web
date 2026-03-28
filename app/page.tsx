/**
 * Landing page publica — infovoto.pe
 * Chat-first + Trust-first con Voti (pixel art cyber llama)
 */

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import DemoSection from "./components/DemoSection";
import VotiStorySection from "./components/VotiStorySection";
import FeaturesGrid from "./components/FeaturesGrid";
import DebatesPreviewSection from "./components/DebatesPreviewSection";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0f1a] relative">
      {/* Pixel art background */}
      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_URL || ""}/bg-pixel-mountains.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      <div className="relative z-10">
      <Navbar />
      <HeroSection />
      <VotiStorySection />
      <DemoSection />
      <DebatesPreviewSection />
      <FeaturesGrid />
      <TrustSection />
      <Footer />
      </div>
    </main>
  );
}
