"use client";

import { Minus, Square, X } from "lucide-react";
import { type ReactNode } from "react";
import { AddressBar } from "./AddressBar";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  address?: string;
  status?: string;
  connected?: boolean;
}

export function MainLayout({
  children,
  title = "Retro Pixel Garden - Microsoft Internet Explorer",
  address = "http://retro-pixel-garden.local/",
  status = "Done",
  connected = false,
}: MainLayoutProps) {
  return (
    <div className="retro-browser">
      {/* Title Bar */}
      <div className="retro-titlebar">
        <div className="retro-titlebar-icon">
          <img
            src="/icons/ie.png"
            alt="IE"
            width={16}
            height={16}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <span className="retro-titlebar-text">{title}</span>
        <div className="retro-titlebar-controls">
          <button className="retro-titlebar-button" title="Minimize">
            <Minus size={10} />
          </button>
          <button className="retro-titlebar-button" title="Maximize">
            <Square size={8} />
          </button>
          <button
            className="retro-titlebar-button retro-titlebar-close"
            title="Close"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Header with Menu & Toolbar */}
      <Header />

      {/* Address Bar */}
      <AddressBar address={address} />

      {/* Main Content Area */}
      <div className="retro-content">
        <main className="retro-main">{children}</main>
      </div>

      {/* Status Bar / Footer */}
      <Footer status={status} connected={connected} />
    </div>
  );
}
