"use client";

import { Globe } from "lucide-react";

interface FooterProps {
  status?: string;
  connected?: boolean;
}

export function Footer({ status = "Done", connected = false }: FooterProps) {
  return (
    <div className="retro-footer">
      {/* Status text */}
      <div className="retro-footer-status">
        <span className="retro-footer-status-text">{status}</span>
      </div>

      {/* Progress bar area (for loading states) */}
      <div className="retro-footer-progress">
        <div className="retro-footer-progress-bar" />
      </div>

      {/* Connection indicator */}
      <div className="retro-footer-zone">
        <div
          className={`retro-footer-zone-indicator ${
            connected ? "connected" : ""
          }`}
        >
          <Globe size={14} />
        </div>
        <span className="retro-footer-zone-text">
          {connected ? "Connected" : "Internet"}
        </span>
      </div>
    </div>
  );
}
