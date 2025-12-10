"use client";

import { CreateUserModal } from "@/src/presentation/components/user/CreateUserModal";
import { useIsHydrated, useUser } from "@/src/presentation/stores/userStore";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { GameCanvas } from "./GameCanvas";
import { GameUI } from "./GameUI";

export function GameView() {
  const user = useUser();
  const isHydrated = useIsHydrated();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Show loading while hydrating user store
  if (!isHydrated) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[var(--win98-content-bg)]">
        <div className="retro-window p-4">
          <div className="retro-window-titlebar">
            <span className="retro-window-title">⏳ Loading...</span>
          </div>
          <div className="retro-window-content text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--win98-button-text)]" />
            <p className="text-xs text-[var(--win98-button-text)]">
              Loading game data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show create user modal if no user exists
  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[var(--win98-content-bg)]">
        <CreateUserModal isOpen={true} />
      </div>
    );
  }

  // Show connection error
  if (connectionError) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[var(--win98-content-bg)]">
        <div className="retro-window max-w-md">
          <div className="retro-window-titlebar">
            <span className="retro-window-title">⚠️ Connection Error</span>
          </div>
          <div className="retro-window-content text-center py-6">
            <div className="text-4xl mb-4">🔌</div>
            <p className="text-xs text-[var(--win98-button-text)] mb-4">
              {connectionError}
            </p>
            <button
              onClick={() => {
                setConnectionError(null);
                setIsConnecting(true);
              }}
              className="retro-button px-6 py-2"
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-140px)] bg-[var(--win98-content-bg)]">
      {/* 3D Game Canvas */}
      <GameCanvas user={user} />

      {/* Game UI Overlay */}
      <GameUI user={user} />

      {/* Connecting overlay */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">🌐 Connecting...</span>
            </div>
            <div className="retro-window-content text-center py-6 px-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--win98-button-text)]" />
              <p className="text-xs text-[var(--win98-button-text)]">
                Connecting to game server...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
