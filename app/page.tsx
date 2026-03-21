/**
 * Landing page pública — infovoto.pe
 * Rediseñada con componentes modernos y animaciones
 */

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesGrid from "./components/FeaturesGrid";
import StatsSection from "./components/StatsSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <Footer />
    </main>
  );
}
