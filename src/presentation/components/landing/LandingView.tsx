"use client";

import {
  layoutPresets,
  useLayoutSetup,
} from "@/src/presentation/hooks/useLayoutSetup";
import { Gamepad2, Sparkles, TreeDeciduous, Users } from "lucide-react";
import Link from "next/link";

export function LandingView() {
  // Configure layout for landing page - minimal toolbar
  useLayoutSetup(layoutPresets.landing);
  return (
    <div className="min-h-full bg-[var(--win98-content-bg)] p-4 retro-text">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header - Retro Style */}
        <div className="retro-window mb-6">
          <div className="retro-window-titlebar">
            <span className="retro-window-title">
              🌻 Welcome to Retro Pixel Garden
            </span>
          </div>
          <div className="retro-window-content text-center py-8">
            <div className="text-6xl mb-4 pixel-art">🌳🏡🌻</div>
            <h1 className="text-2xl font-bold mb-2 text-[var(--win98-button-text)]">
              Retro Pixel Garden
            </h1>
            <p className="text-sm text-[var(--win98-button-text)] mb-6">
              Open World Builder - Inspired by Stardew Valley
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/game" className="retro-button px-8 py-2">
                <Gamepad2 size={16} className="mr-2 inline" />
                Start New Game
              </Link>
              <button className="retro-button px-8 py-2" disabled>
                <Users size={16} className="mr-2 inline" />
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Feature 1 */}
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">🌳 Build Your Garden</span>
            </div>
            <div className="retro-window-content text-center py-4">
              <TreeDeciduous
                size={48}
                className="mx-auto mb-3 text-green-600"
              />
              <p className="text-xs text-[var(--win98-button-text)]">
                Plant trees, flowers, and create your own pixel art paradise
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">👥 Multiplayer</span>
            </div>
            <div className="retro-window-content text-center py-4">
              <Users size={48} className="mx-auto mb-3 text-blue-600" />
              <p className="text-xs text-[var(--win98-button-text)]">
                Play with friends in real-time using Colyseus server
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">✨ Pixel Art Style</span>
            </div>
            <div className="retro-window-content text-center py-4">
              <Sparkles size={48} className="mx-auto mb-3 text-yellow-500" />
              <p className="text-xs text-[var(--win98-button-text)]">
                Retro aesthetic with modern 3D engine (React Three + Rapier)
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="retro-window">
          <div className="retro-window-titlebar">
            <span className="retro-window-title">📋 About This Project</span>
          </div>
          <div className="retro-window-content">
            <div className="retro-inset p-4 bg-white dark:bg-[#1a1a1a]">
              <h3 className="font-bold mb-2 text-[var(--win98-button-text)]">
                Phase 1: Core Features
              </h3>
              <ul className="text-xs space-y-1 text-[var(--win98-button-text)]">
                <li>✅ Retro IE5 Browser UI (Windows 98 style)</li>
                <li>✅ Dark/Light theme toggle</li>
                <li>⏳ Local user creation with Zustand + localforage</li>
                <li>⏳ Colyseus game server for real-time state</li>
                <li>⏳ 3D world with React Three Fiber + Rapier physics</li>
                <li>⏳ Basic garden building (trees, tiles, paths)</li>
              </ul>
              <hr className="my-3 border-[var(--win98-button-shadow)]" />
              <h3 className="font-bold mb-2 text-[var(--win98-button-text)]">
                Phase 2: Future Features
              </h3>
              <ul className="text-xs space-y-1 text-[var(--win98-button-text)]">
                <li>🔮 Supabase database integration</li>
                <li>🔮 Authentication with Supabase Auth</li>
                <li>🔮 Cloud save/load</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Credits */}
        <div className="text-center mt-6 text-xs text-[var(--win98-button-text)]">
          <p>Made with 💚 using Next.js, React Three Fiber, and Colyseus</p>
          <p className="mt-1">© 2024 Retro Pixel Garden</p>
        </div>
      </div>
    </div>
  );
}
