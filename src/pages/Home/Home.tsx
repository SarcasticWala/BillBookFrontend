import React from "react";
import Navbar from "../../components/Home/Navbar";
import Hero from "../../components/Home/Hero";
import Testimonials from "../../components/Home/Testimonials";
import Pricing from "../../components/Home/Pricing";
import Faq from "../../components/Home/Faq";
import FinalCTA from "../../components/Home/FinalCTA";
import LandingFooter from "../../components/Home/LandingFooter";
import { DotBackground } from "../../components/UI/DotBackground";

const Home: React.FC = () => {
  return (
    <div className="relative isolate min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Dot grid spans the whole page, behind every section. */}
      <DotBackground className="-z-10" />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Home;
