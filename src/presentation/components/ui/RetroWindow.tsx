"use client";

import { clsx } from "clsx";
import { Minus, Square, X } from "lucide-react";
import { type ReactNode } from "react";

interface RetroWindowProps {
  children: ReactNode;
  title?: string;
  className?: string;
  showControls?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function RetroWindow({
  children,
  title = "Window",
  className,
  showControls = true,
  onMinimize,
  onMaximize,
  onClose,
}: RetroWindowProps) {
  return (
    <div className={clsx("retro-window", className)}>
      {/* Title Bar */}
      <div className="retro-window-titlebar">
        <span className="retro-window-title">{title}</span>
        {showControls && (
          <div className="retro-window-controls">
            <button
              className="retro-window-control"
              onClick={onMinimize}
              title="Minimize"
            >
              <Minus size={10} />
            </button>
            <button
              className="retro-window-control"
              onClick={onMaximize}
              title="Maximize"
            >
              <Square size={8} />
            </button>
            <button
              className="retro-window-control retro-window-control-close"
              onClick={onClose}
              title="Close"
            >
              <X size={10} />
            </button>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="retro-window-content">{children}</div>
    </div>
  );
}
