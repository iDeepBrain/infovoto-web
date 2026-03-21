/**
 * Landing page pública — infovoto.pe
 * Rediseñada con componentes modernos y animaciones
 */

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesGrid from "./components/FeaturesGrid";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <Footer />
    </main>
  );
}
