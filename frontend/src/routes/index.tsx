import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "../lib/supabase";
import { Navbar } from "../components/sections/Navbar";
import { Hero } from "../components/sections/Hero";
import { Stats } from "../components/sections/Stats";
import { HowItWorks } from "../components/sections/HowItWorks";
import { Features } from "../components/sections/Features";
import { Comparison } from "../components/sections/Comparison";
import { Pricing } from "../components/sections/Pricing";
import { FAQ } from "../components/sections/FAQ";
import { FinalCTA } from "../components/sections/FinalCTA";
import { Footer } from "../components/sections/Footer";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();

  // Already logged in (e.g. returning visitor) — skip the landing page and go straight to the dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="landing-theme min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Comparison />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
export default LandingPage;
