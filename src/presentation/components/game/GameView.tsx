"use client";

import { NotificationToast } from "@/src/presentation/components/ui/NotificationToast";
import { CreateUserModal } from "@/src/presentation/components/user/CreateUserModal";
import { useGardenRoom } from "@/src/presentation/hooks/useGardenRoom";
import { useIsHydrated, useUser } from "@/src/presentation/stores/userStore";
import { Gamepad2, Loader2, Monitor } from "lucide-react";
import { useState } from "react";
import { GameCanvas } from "./GameCanvas";
import { GameUI } from "./GameUI";
import { RoomSelector } from "./RoomSelector";
import { SimpleGameView } from "./SimpleGameView";

export function GameView() {
  const user = useUser();
  const isHydrated = useIsHydrated();

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

  // Render game with multiplayer (show room selector first)
  return <GameLobby />;
}

/**
 * Game lobby - shows room selector before connecting
 */
function GameLobby() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [createNewRoom, setCreateNewRoom] = useState(false);
  const [hasSelectedRoom, setHasSelectedRoom] = useState(false);

  const handleSelectRoom = (roomId: string | null, createNew: boolean) => {
    setSelectedRoomId(roomId);
    setCreateNewRoom(createNew);
    setHasSelectedRoom(true);
  };

  // Show room selector if not selected yet
  if (!hasSelectedRoom) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[var(--win98-content-bg)] p-4">
        <RoomSelector onSelectRoom={handleSelectRoom} />
      </div>
    );
  }

  // Render game with selected room
  return (
    <GameWithMultiplayer
      roomId={selectedRoomId}
      createNew={createNewRoom}
      onBack={() => setHasSelectedRoom(false)}
    />
  );
}

interface GameWithMultiplayerProps {
  roomId: string | null;
  createNew: boolean;
  onBack: () => void;
}

/**
 * Game component with Colyseus multiplayer connection
 */
function GameWithMultiplayer({
  roomId,
  createNew,
  onBack,
}: GameWithMultiplayerProps) {
  const user = useUser()!;
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  const {
    isConnected,
    isConnecting,
    error,
    players,
    plants,
    localPlayerId,
    dayTime,
    connect,
    sendInput,
    plant,
    water,
    harvest,
  } = useGardenRoom({
    user,
    autoConnect: true,
    roomId: roomId || undefined,
    createNew,
  });

  // Show connection error
  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[var(--win98-content-bg)]">
        <div className="retro-window max-w-md">
          <div className="retro-window-titlebar">
            <span className="retro-window-title">⚠️ Connection Error</span>
          </div>
          <div className="retro-window-content text-center py-6">
            <div className="text-4xl mb-4">🔌</div>
            <p className="text-xs text-[var(--win98-button-text)] mb-4">
              {error}
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={onBack} className="retro-button px-4 py-2">
                ◀️ กลับ
              </button>
              <button onClick={connect} className="retro-button px-4 py-2">
                🔄 ลองใหม่
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-140px)] bg-[var(--win98-content-bg)]">
      {/* Mode Toggle Button - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-40">
        <button
          onClick={() => setIsSimpleMode(!isSimpleMode)}
          className="retro-button flex items-center gap-2 px-3 py-1.5 text-xs shadow-lg"
          title={isSimpleMode ? "Switch to 3D Mode" : "Switch to Simple Mode"}
        >
          {isSimpleMode ? (
            <>
              <Gamepad2 className="w-4 h-4" />
              <span>🎮 3D Mode</span>
            </>
          ) : (
            <>
              <Monitor className="w-4 h-4" />
              <span>📺 Simple Mode</span>
            </>
          )}
        </button>
      </div>

      {isSimpleMode ? (
        /* Simple Text-Based Mode */
        <SimpleGameView
          user={user}
          players={players}
          plants={plants}
          localPlayerId={localPlayerId}
          dayTime={dayTime}
          onPlant={plant}
          onWater={water}
          onHarvest={harvest}
        />
      ) : (
        /* 3D Game Canvas */
        <>
          <GameCanvas
            user={user}
            players={players}
            plants={plants}
            localPlayerId={localPlayerId}
            dayTime={dayTime}
            onPlayerInput={sendInput}
            onPlant={plant}
            onWater={water}
            onHarvest={harvest}
          />

          {/* Game UI Overlay */}
          <GameUI
            user={user}
            isConnected={isConnected}
            playerCount={players.length}
            dayTime={dayTime}
          />
        </>
      )}

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

      {/* Notification Toast */}
      <NotificationToast />
    </div>
  );
}
