import { GameView } from "@/src/presentation/components/game/GameView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Game - Retro Pixel Garden",
  description: "Build your pixel art garden in real-time with friends",
};

/**
 * Game Page - Server Component for SEO optimization
 */
export default function GamePage() {
  return <GameView />;
}
