import React from "react";
import Navbar from "../../components/Home/Navbar";
import Hero from "../../components/Home/Hero";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <Hero />
      </div>
    </div>
  );
};

export default Home;
