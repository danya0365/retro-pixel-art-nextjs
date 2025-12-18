"use client";

import { useLayoutContext } from "@/src/presentation/contexts/LayoutContext";
import { Minus, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { AddressBar } from "./AddressBar";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  address?: string;
}

export function MainLayout({
  children,
  title = "Retro Pixel Garden - Microsoft Internet Explorer",
  address = "http://retro-pixel-garden.local/",
}: MainLayoutProps) {
  const router = useRouter();
  const { config } = useLayoutContext();
  const { titleBar, status, connected } = config;
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
          {titleBar.showMinimize && (
            <button
              className="retro-titlebar-button"
              title="Minimize"
              onClick={
                titleBar.onMinimize ||
                (() => alert("Minimize not supported in browser"))
              }
            >
              <Minus size={10} />
            </button>
          )}
          {titleBar.showMaximize && (
            <button
              className="retro-titlebar-button"
              title="Maximize"
              onClick={
                titleBar.onMaximize ||
                (() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                })
              }
            >
              <Square size={8} />
            </button>
          )}
          {titleBar.showClose && (
            <button
              className="retro-titlebar-button retro-titlebar-close"
              title="Close"
              onClick={titleBar.onClose || (() => router.push("/"))}
            >
              <X size={10} />
            </button>
          )}
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
      <Footer status={status || "Done"} connected={connected || false} />
    </div>
  );
}
