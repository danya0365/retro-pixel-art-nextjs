"use client";

import type { GardenPlayer } from "@/src/presentation/hooks/useGardenRoom";
import { X } from "lucide-react";

interface PlayerProfileModalProps {
  player: GardenPlayer;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerProfileModal({
  player,
  isOpen,
  onClose,
}: PlayerProfileModalProps) {
  if (!isOpen) return null;

  // Use real stats from player (synced from server)
  const stats = {
    characterClass: player.characterClass || "Farmer",
    level: player.level || 1,
    exp: player.exp || 0,
    expToNextLevel: player.expToNextLevel || 100,
    hp: player.hp || 120,
    maxHp: player.maxHp || 120,
    mp: player.mp || 30,
    maxMp: player.maxMp || 30,
    atk: player.atk || 85,
    def: player.def || 75,
    agi: player.agi || 90,
    wis: player.wis || 60,
    gold: player.gold || 100,
    mov: player.mov || 2,
    rng: player.rng || 1,
    highestClearedStage: player.highestClearedStage || 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal - IE5/Win98 Style */}
      <div className="relative retro-window w-[350px] max-w-[90vw] animate-in zoom-in-95 duration-200">
        {/* Title Bar */}
        <div className="retro-window-titlebar flex items-center justify-between">
          <span className="retro-window-title flex items-center gap-2">
            <span className="text-lg">{player.avatar || "👤"}</span>
            <span>โปรไฟล์ผู้เล่น</span>
          </span>
          <button
            onClick={onClose}
            className="retro-button px-1.5 py-0 text-xs leading-none h-[18px]"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="retro-window-content p-0">
          {/* Player Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-4xl border-2 border-white/30">
                {player.avatar || "👤"}
              </div>
              <div>
                <h2 className="text-lg font-bold">{player.nickname}</h2>
                <p className="text-xs opacity-80">
                  Lv.{stats.level} การ์ดเนอร์
                </p>
                <p className="text-xs opacity-60 mt-1">
                  📍 {player.x.toFixed(0)}, {player.z.toFixed(0)}
                  {player.isMoving ? " 🚶 กำลังเดิน" : " 🧍 หยุดอยู่"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-3 space-y-3">
            {/* HP/MP Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-red-600">❤️ HP</span>
                  <span>
                    {stats.hp}/{stats.maxHp}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-300 border border-gray-400 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400"
                    style={{
                      width: `${(stats.hp / stats.maxHp) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-blue-600">💧 MP</span>
                  <span>
                    {stats.mp}/{stats.maxMp}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-300 border border-gray-400 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{
                      width: `${(stats.mp / stats.maxMp) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-green-600">⭐ EXP</span>
                  <span>
                    {stats.exp}/{stats.expToNextLevel}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-300 border border-gray-400 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400"
                    style={{
                      width: `${(stats.exp / stats.expToNextLevel) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="retro-window">
              <div className="retro-window-titlebar py-0.5">
                <span className="retro-window-title text-xs">📊 สถิติ</span>
              </div>
              <div className="retro-window-content p-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-[var(--win98-button-face)] p-1.5 border border-[var(--win98-button-shadow)]">
                    <span>⚔️ ATK</span>
                    <span className="font-bold text-red-600">{stats.atk}</span>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--win98-button-face)] p-1.5 border border-[var(--win98-button-shadow)]">
                    <span>🛡️ DEF</span>
                    <span className="font-bold text-blue-600">{stats.def}</span>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--win98-button-face)] p-1.5 border border-[var(--win98-button-shadow)]">
                    <span>💰 Gold</span>
                    <span className="font-bold text-yellow-600">
                      {stats.gold}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--win98-button-face)] p-1.5 border border-[var(--win98-button-shadow)]">
                    <span>⚡ AGI</span>
                    <span className="font-bold text-green-600">
                      {stats.agi}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--win98-button-face)] p-1.5 border border-[var(--win98-button-shadow)]">
                    <span>✨ WIS</span>
                    <span className="font-bold text-purple-600">
                      {stats.wis}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--win98-button-face)] p-1.5 border border-[var(--win98-button-shadow)]">
                    <span>👟 MOV</span>
                    <span className="font-bold text-cyan-600">{stats.mov}</span>
                  </div>
                  <div className="flex items-center justify-between bg-[var(--win98-button-face)] p-1.5 border border-[var(--win98-button-shadow)]">
                    <span>🎯 RNG</span>
                    <span className="font-bold text-orange-600">
                      {stats.rng}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="retro-window">
              <div className="retro-window-titlebar py-0.5">
                <span className="retro-window-title text-xs">
                  🏆 ความสำเร็จ
                </span>
              </div>
              <div className="retro-window-content p-2">
                <div className="flex flex-wrap gap-1">
                  {stats.level >= 5 && (
                    <span
                      className="px-2 py-0.5 bg-yellow-100 border border-yellow-400 rounded text-xs"
                      title="ผู้เริ่มต้น"
                    >
                      🌟 ผู้เริ่มต้น
                    </span>
                  )}
                  {stats.highestClearedStage >= 3 && (
                    <span
                      className="px-2 py-0.5 bg-green-100 border border-green-400 rounded text-xs"
                      title="นักสำรวจ"
                    >
                      🗺️ นักสำรวจ
                    </span>
                  )}
                  {stats.highestClearedStage >= 10 && (
                    <span
                      className="px-2 py-0.5 bg-red-100 border border-red-400 rounded text-xs"
                      title="นักล่า"
                    >
                      ⚔️ นักล่า
                    </span>
                  )}
                  {stats.gold >= 300 && (
                    <span
                      className="px-2 py-0.5 bg-amber-100 border border-amber-400 rounded text-xs"
                      title="เศรษฐี"
                    >
                      💎 เศรษฐี
                    </span>
                  )}
                  {stats.level < 5 &&
                    stats.highestClearedStage < 3 &&
                    stats.gold < 300 && (
                      <span className="text-xs text-gray-500">
                        ยังไม่มีความสำเร็จ
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--win98-button-shadow)] p-2 bg-[var(--win98-button-face)]">
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="retro-button px-4 py-1 text-xs"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
