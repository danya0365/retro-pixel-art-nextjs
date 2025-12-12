"use client";

import type { GardenPlayer } from "@/src/presentation/hooks/useGardenRoom";

// Stat icons and colors - Dragon Quest Tact Style
const STAT_CONFIG = {
  atk: { icon: "⚔️", name: "ATK", color: "text-red-600", desc: "พลังโจมตี" },
  def: { icon: "🛡️", name: "DEF", color: "text-blue-600", desc: "พลังป้องกัน" },
  agi: { icon: "💨", name: "AGL", color: "text-green-600", desc: "ความเร็ว" },
  wis: { icon: "✨", name: "WIS", color: "text-purple-600", desc: "พลังเวทย์" },
  mov: {
    icon: "👟",
    name: "MOV",
    color: "text-orange-600",
    desc: "ระยะเคลื่อนที่",
  },
  rng: { icon: "🎯", name: "RNG", color: "text-cyan-600", desc: "ระยะโจมตี" },
};

const CLASS_ICONS: Record<string, string> = {
  Farmer: "👨‍🌾",
  Warrior: "⚔️",
  Mage: "🧙",
};

interface CharacterPanelProps {
  player: GardenPlayer | null; // ✅ รับข้อมูลจาก server
  compact?: boolean;
}

export function CharacterPanel({
  player,
  compact = false,
}: CharacterPanelProps) {
  // ✅ ใช้ข้อมูลจาก server (Single Source of Truth)
  if (!player) {
    return (
      <div className="retro-window">
        <div className="retro-window-titlebar">
          <span className="retro-window-title">👤 Loading...</span>
        </div>
        <div className="retro-window-content p-3 text-center text-xs">
          กำลังโหลดข้อมูลตัวละคร...
        </div>
      </div>
    );
  }

  // Map server player data to display format
  const stats = {
    level: player.level,
    exp: player.exp,
    expToNextLevel: player.expToNextLevel,
    hp: player.hp,
    maxHp: player.maxHp,
    mp: player.mp,
    maxMp: player.maxMp,
    atk: player.atk,
    def: player.def,
    agi: player.agi,
    wis: player.wis,
    mov: player.mov,
    rng: player.rng,
  };
  const gold = player.gold;
  const hpPercent = (stats.hp / stats.maxHp) * 100;
  const mpPercent = (stats.mp / stats.maxMp) * 100;
  const expPercent = (stats.exp / stats.expToNextLevel) * 100;

  // HP bar color based on percentage
  const hpColor =
    hpPercent > 50
      ? "bg-green-500"
      : hpPercent > 25
      ? "bg-yellow-500"
      : "bg-red-500";

  if (compact) {
    return (
      <div className="retro-window">
        <div className="retro-window-titlebar">
          <span className="retro-window-title">
            {player.avatar} {player.nickname}
          </span>
        </div>
        <div className="retro-window-content p-2 text-xs">
          {/* HP/MP Bars */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8">❤️</span>
              <div className="flex-1 h-3 bg-gray-300 border border-gray-400">
                <div
                  className={`h-full ${hpColor} transition-all`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="w-16 text-right">
                {stats.hp}/{stats.maxHp}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8">💙</span>
              <div className="flex-1 h-3 bg-gray-300 border border-gray-400">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${mpPercent}%` }}
                />
              </div>
              <span className="w-16 text-right">
                {stats.mp}/{stats.maxMp}
              </span>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-300">
            <span>Lv.{stats.level}</span>
            <span>💰 {gold}G</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-window">
      <div className="retro-window-titlebar">
        <span className="retro-window-title">
          👤 Character Status - {player.nickname}
        </span>
      </div>
      <div className="retro-window-content p-3">
        {/* Header - Avatar & Basic Info */}
        <div className="flex gap-4 pb-3 border-b-2 border-gray-400">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-gray-400 flex items-center justify-center text-3xl">
            {player.avatar}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{player.nickname}</span>
              <span className="text-xs bg-blue-100 px-1 border border-blue-300">
                {CLASS_ICONS[player.characterClass] || "👨‍🌾"}{" "}
                {player.characterClass}
              </span>
            </div>
            <div className="text-xs mt-1">
              Level{" "}
              <span className="font-bold text-blue-600">{stats.level}</span>
            </div>
            {/* EXP Bar */}
            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>EXP</span>
                <span>
                  {stats.exp}/{stats.expToNextLevel}
                </span>
              </div>
              <div className="h-2 bg-gray-300 border border-gray-400">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* HP / MP Bars */}
        <div className="py-3 border-b-2 border-gray-400">
          <div className="grid grid-cols-2 gap-4">
            {/* HP */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-red-600">❤️ HP</span>
                <span>
                  {stats.hp}/{stats.maxHp}
                </span>
              </div>
              <div className="h-4 bg-gray-300 border-2 border-gray-400">
                <div
                  className={`h-full ${hpColor} transition-all`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* MP */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-blue-600">💙 MP</span>
                <span>
                  {stats.mp}/{stats.maxMp}
                </span>
              </div>
              <div className="h-4 bg-gray-300 border-2 border-gray-400">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${mpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="py-3 border-b-2 border-gray-400">
          <div className="text-xs font-bold mb-2">📊 Stats</div>
          <div className="grid grid-cols-6 gap-1">
            {(Object.keys(STAT_CONFIG) as Array<keyof typeof STAT_CONFIG>).map(
              (stat) => (
                <div
                  key={stat}
                  className="text-center p-1 bg-gray-100 border border-gray-300"
                  title={STAT_CONFIG[stat].desc}
                >
                  <div className="text-sm">{STAT_CONFIG[stat].icon}</div>
                  <div
                    className={`text-xs font-bold ${STAT_CONFIG[stat].color}`}
                  >
                    {STAT_CONFIG[stat].name}
                  </div>
                  <div className="text-sm font-bold">{stats[stat]}</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Gold */}
        <div className="pt-3 flex justify-between items-center">
          <span className="text-xs font-bold">💰 Gold</span>
          <span className="font-bold text-yellow-600">
            {gold.toLocaleString()} G
          </span>
        </div>
      </div>
    </div>
  );
}

// Mini version for HUD - ✅ Server as Single Source of Truth
interface CharacterMiniStatusProps {
  player: GardenPlayer | null;
}

export function CharacterMiniStatus({ player }: CharacterMiniStatusProps) {
  if (!player) {
    return <div className="text-xs">Loading...</div>;
  }

  const hpPercent = (player.hp / player.maxHp) * 100;
  const mpPercent = (player.mp / player.maxMp) * 100;

  const hpColor =
    hpPercent > 50
      ? "bg-green-500"
      : hpPercent > 25
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="font-bold">Lv.{player.level}</span>
      <div className="flex items-center gap-1">
        <span>❤️</span>
        <div className="w-20 h-2 bg-gray-300 border border-gray-400">
          <div
            className={`h-full ${hpColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <span className="w-10">{player.hp}</span>
      </div>
      <div className="flex items-center gap-1">
        <span>💙</span>
        <div className="w-16 h-2 bg-gray-300 border border-gray-400">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${mpPercent}%` }}
          />
        </div>
        <span className="w-8">{player.mp}</span>
      </div>
      <span className="text-yellow-600">💰{player.gold}</span>
    </div>
  );
}
