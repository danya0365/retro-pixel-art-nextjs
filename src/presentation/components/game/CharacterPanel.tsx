"use client";

import {
  useCharacter,
  useCharacterStore,
} from "@/src/presentation/stores/characterStore";
import { useUser } from "@/src/presentation/stores/userStore";
import { useEffect, useState } from "react";

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
  compact?: boolean;
}

export function CharacterPanel({ compact = false }: CharacterPanelProps) {
  const character = useCharacter();
  const user = useUser();
  const initializeCharacter = useCharacterStore(
    (state) => state.initializeCharacter
  );

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize character with user's name on first load
  useEffect(() => {
    if (user && !isInitialized) {
      // Only initialize if character name doesn't match user
      if (character.name === "Adventurer" && user.nickname) {
        initializeCharacter(user.nickname, "Farmer", user.avatar || "👨‍🌾");
      }
      setIsInitialized(true);
    }
  }, [user, character.name, initializeCharacter, isInitialized]);

  const { totalStats, equipment, gold } = character;
  const hpPercent = (totalStats.hp / totalStats.maxHp) * 100;
  const mpPercent = (totalStats.mp / totalStats.maxMp) * 100;
  const expPercent = (totalStats.exp / totalStats.expToNextLevel) * 100;

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
            {character.avatar} {character.name}
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
                {totalStats.hp}/{totalStats.maxHp}
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
                {totalStats.mp}/{totalStats.maxMp}
              </span>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-300">
            <span>Lv.{totalStats.level}</span>
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
          👤 Character Status - {character.name}
        </span>
      </div>
      <div className="retro-window-content p-3">
        {/* Header - Avatar & Basic Info */}
        <div className="flex gap-4 pb-3 border-b-2 border-gray-400">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-gray-400 flex items-center justify-center text-3xl">
            {character.avatar}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{character.name}</span>
              <span className="text-xs bg-blue-100 px-1 border border-blue-300">
                {CLASS_ICONS[character.class]} {character.class}
              </span>
            </div>
            <div className="text-xs mt-1">
              Level{" "}
              <span className="font-bold text-blue-600">
                {totalStats.level}
              </span>
            </div>
            {/* EXP Bar */}
            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>EXP</span>
                <span>
                  {totalStats.exp}/{totalStats.expToNextLevel}
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
                  {totalStats.hp}/{totalStats.maxHp}
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
                  {totalStats.mp}/{totalStats.maxMp}
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
          <div className="grid grid-cols-5 gap-1">
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
                  <div className="text-sm font-bold">{totalStats[stat]}</div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Equipment */}
        <div className="py-3 border-b-2 border-gray-400">
          <div className="text-xs font-bold mb-2">🎒 Equipment</div>
          <div className="grid grid-cols-3 gap-2">
            {/* Weapon */}
            <div className="p-2 bg-gray-100 border border-gray-300 text-center">
              <div className="text-xs text-gray-500">Weapon</div>
              <div className="text-xl">{equipment.weapon?.icon || "⚪"}</div>
              <div className="text-xs truncate">
                {equipment.weapon?.name || "Empty"}
              </div>
            </div>

            {/* Armor */}
            <div className="p-2 bg-gray-100 border border-gray-300 text-center">
              <div className="text-xs text-gray-500">Armor</div>
              <div className="text-xl">{equipment.armor?.icon || "⚪"}</div>
              <div className="text-xs truncate">
                {equipment.armor?.name || "Empty"}
              </div>
            </div>

            {/* Accessory */}
            <div className="p-2 bg-gray-100 border border-gray-300 text-center">
              <div className="text-xs text-gray-500">Accessory</div>
              <div className="text-xl">{equipment.accessory?.icon || "⚪"}</div>
              <div className="text-xs truncate">
                {equipment.accessory?.name || "Empty"}
              </div>
            </div>
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

// Mini version for HUD
export function CharacterMiniStatus() {
  const character = useCharacter();
  const { totalStats, gold } = character;
  const hpPercent = (totalStats.hp / totalStats.maxHp) * 100;
  const mpPercent = (totalStats.mp / totalStats.maxMp) * 100;

  const hpColor =
    hpPercent > 50
      ? "bg-green-500"
      : hpPercent > 25
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="font-bold">Lv.{totalStats.level}</span>
      <div className="flex items-center gap-1">
        <span>❤️</span>
        <div className="w-20 h-2 bg-gray-300 border border-gray-400">
          <div
            className={`h-full ${hpColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <span className="w-10">{totalStats.hp}</span>
      </div>
      <div className="flex items-center gap-1">
        <span>💙</span>
        <div className="w-16 h-2 bg-gray-300 border border-gray-400">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${mpPercent}%` }}
          />
        </div>
        <span className="w-8">{totalStats.mp}</span>
      </div>
      <span className="text-yellow-600">💰{gold}</span>
    </div>
  );
}
