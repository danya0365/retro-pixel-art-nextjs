import { LandingView } from "@/src/presentation/components/landing/LandingView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retro Pixel Garden - Open World Builder",
  description:
    "Build your own pixel art garden in this retro-styled open world game inspired by Stardew Valley",
};

/**
 * Landing Page - Server Component for SEO optimization
 */
export default function HomePage() {
  return <LandingView />;
}
