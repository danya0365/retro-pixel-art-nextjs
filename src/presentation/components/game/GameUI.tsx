"use client";

import type { User } from "@/src/domain/types/user";
import {
  useHotbarItems,
  useSelectedSlot,
  useSetSelectedSlot,
} from "@/src/presentation/stores/hotbarStore";
import { useUserStore } from "@/src/presentation/stores/userStore";
import {
  Backpack,
  HelpCircle,
  LogOut,
  Map,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface GameUIProps {
  user: User;
  isConnected?: boolean;
  playerCount?: number;
  dayTime?: number;
}

export function GameUI({
  user,
  isConnected = false,
  playerCount = 1,
  dayTime = 12,
}: GameUIProps) {
  const [showInventory, setShowInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const deleteUser = useUserStore((state) => state.deleteUser);

  // Hotbar state
  const hotbarItems = useHotbarItems();
  const selectedSlot = useSelectedSlot();
  const setSelectedSlot = useSetSelectedSlot();

  // Keyboard shortcuts for hotbar (1-9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-9
      if (e.key >= "1" && e.key <= "9") {
        setSelectedSlot(parseInt(e.key) - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedSlot]);

  // Format day time
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      {/* Top Left - Player Info */}
      <div className="absolute top-2 left-2 z-40">
        <div className="retro-window w-52">
          <div className="retro-window-titlebar py-1 px-2 flex justify-between">
            <span className="text-[10px] font-bold text-white">
              {user.avatar} {user.nickname}
            </span>
            <span className="text-[10px] text-white/80">
              🕐 {formatTime(dayTime)}
            </span>
          </div>
          <div className="p-2 text-[10px] text-[var(--win98-button-text)]">
            <div className="flex items-center gap-2 mb-1">
              <span>❤️</span>
              <div className="flex-1 h-2 bg-gray-300 retro-inset">
                <div className="h-full bg-red-500 w-full" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span>⚡</span>
              <div className="flex-1 h-2 bg-gray-300 retro-inset">
                <div className="h-full bg-yellow-500 w-4/5" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[9px] mt-2 pt-1 border-t border-gray-300">
              <span className="flex items-center gap-1">
                {isConnected ? (
                  <span className="text-green-600">🟢 Online</span>
                ) : (
                  <span className="text-red-600">🔴 Offline</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Users size={10} /> {playerCount} player
                {playerCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right - Menu Buttons */}
      <div className="absolute top-2 right-2 z-40 flex gap-1">
        <button
          className="retro-button p-2"
          onClick={() => setShowInventory(!showInventory)}
          title="Inventory"
        >
          <Backpack size={14} />
        </button>
        <button className="retro-button p-2" title="Map">
          <Map size={14} />
        </button>
        <button className="retro-button p-2" title="Players">
          <Users size={14} />
        </button>
        <button
          className="retro-button p-2"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings size={14} />
        </button>
        <button
          className="retro-button p-2"
          onClick={() => setShowHelp(!showHelp)}
          title="Help"
        >
          <HelpCircle size={14} />
        </button>
      </div>

      {/* Bottom - Hotbar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40">
        <div className="retro-window">
          <div className="flex gap-1 p-1">
            {hotbarItems.slice(0, 9).map((item, i) => (
              <div
                key={item?.id || i}
                onClick={() => setSelectedSlot(i)}
                className={`w-10 h-10 flex flex-col items-center justify-center text-lg cursor-pointer relative
                  ${
                    selectedSlot === i
                      ? "retro-outset bg-[var(--win98-button-highlight)] ring-2 ring-blue-500"
                      : "retro-inset bg-[var(--win98-button-face)] hover:bg-[var(--win98-button-highlight)]"
                  }`}
                title={item?.name || `Slot ${i + 1}`}
              >
                <span className="text-base">{item?.icon || ""}</span>
                <span className="absolute bottom-0 right-0.5 text-[8px] text-gray-500">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
          {/* Selected item name */}
          <div className="text-center text-[10px] py-1 text-[var(--win98-button-text)] border-t border-gray-400">
            {hotbarItems[selectedSlot]?.name || "Empty"}
            {hotbarItems[selectedSlot]?.type === "seed" &&
              " - Press E to plant"}
          </div>
        </div>
      </div>

      {/* Bottom Left - Controls hint */}
      <div className="absolute bottom-2 left-2 z-40">
        <div className="retro-window text-[9px] p-2 text-[var(--win98-button-text)]">
          <div>WASD / Arrows - Move</div>
          <div>1-9 - Select item</div>
          <div>E - Plant/Use</div>
          <div>Mouse - Look around</div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="retro-window w-80">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">❓ Help</span>
              <button
                className="retro-window-control"
                onClick={() => setShowHelp(false)}
              >
                ✕
              </button>
            </div>
            <div className="retro-window-content text-xs text-[var(--win98-button-text)]">
              <div className="retro-inset p-3 bg-white dark:bg-[#1a1a1a]">
                <h3 className="font-bold mb-2">🎮 Controls</h3>
                <ul className="space-y-1 mb-4">
                  <li>
                    <b>WASD / Arrow Keys</b> - Move character
                  </li>
                  <li>
                    <b>Mouse Drag</b> - Rotate camera
                  </li>
                  <li>
                    <b>Scroll Wheel</b> - Zoom in/out
                  </li>
                  <li>
                    <b>1-9 Keys</b> - Select hotbar items
                  </li>
                </ul>
                <h3 className="font-bold mb-2">🌱 How to Play</h3>
                <p>
                  Explore your garden, plant trees and flowers, and build your
                  dream pixel art paradise!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="retro-window w-72">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">⚙️ Settings</span>
              <button
                className="retro-window-control"
                onClick={() => setShowSettings(false)}
              >
                ✕
              </button>
            </div>
            <div className="retro-window-content text-xs text-[var(--win98-button-text)]">
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 font-bold">
                    🔊 Music Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">🔉 SFX Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="70"
                    className="w-full"
                  />
                </div>
                <hr className="border-[var(--win98-button-shadow)]" />
                <button
                  className="retro-button w-full py-2 text-red-600"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to reset your character? This cannot be undone."
                      )
                    ) {
                      deleteUser();
                      setShowSettings(false);
                    }
                  }}
                >
                  <LogOut size={12} className="inline mr-1" />
                  Reset Character
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="retro-window w-80">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">🎒 Inventory</span>
              <button
                className="retro-window-control"
                onClick={() => setShowInventory(false)}
              >
                ✕
              </button>
            </div>
            <div className="retro-window-content">
              <div className="grid grid-cols-6 gap-1">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 retro-inset bg-[var(--win98-button-face)] flex items-center justify-center text-lg"
                  >
                    {i === 0 && "🌱"}
                    {i === 1 && "🌻"}
                    {i === 2 && "🌳"}
                    {i === 5 && "🪓"}
                    {i === 6 && "⛏️"}
                    {i === 7 && "💧"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
