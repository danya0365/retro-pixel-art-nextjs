"use client";

import {
  generateStage,
  getElementIcon,
  getRankColor,
  MONSTERS,
  type BattleStage,
} from "@/src/domain/data/monsters";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface MonsterHuntingProps {
  onStartBattle: (stage: BattleStage) => void;
  highestClearedStage: number;
}

const VISIBLE_RANGE = 100; // Show +-100 levels from cursor

export function MonsterHunting({
  onStartBattle,
  highestClearedStage,
}: MonsterHuntingProps) {
  // Cursor position (current focused level)
  const [cursorLevel, setCursorLevel] = useState(
    Math.max(1, highestClearedStage + 1)
  );
  const [selectedStage, setSelectedStage] = useState<BattleStage | null>(null);
  const [inputLevel, setInputLevel] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLButtonElement>(null);

  // Update cursor when highestClearedStage changes
  useEffect(() => {
    setCursorLevel(Math.max(1, highestClearedStage + 1));
  }, [highestClearedStage]);

  // Generate stages based on cursor position (+-100)
  const visibleStages = useMemo(() => {
    const stages: BattleStage[] = [];
    const startLevel = Math.max(1, cursorLevel - VISIBLE_RANGE);
    const endLevel = cursorLevel + VISIBLE_RANGE;

    for (let i = startLevel; i <= endLevel; i++) {
      const stage = generateStage(i);
      stage.unlocked = i <= highestClearedStage + 1;
      stage.completed = i <= highestClearedStage;
      if (stage.completed) stage.stars = 3;
      stages.push(stage);
    }

    return stages;
  }, [cursorLevel, highestClearedStage]);

  // Scroll to cursor when it changes
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [cursorLevel]);

  // Navigate cursor
  const moveCursor = useCallback(
    (direction: "up" | "down" | "pageUp" | "pageDown" | "home" | "next") => {
      setCursorLevel((prev) => {
        switch (direction) {
          case "up":
            return Math.max(1, prev - 1);
          case "down":
            return prev + 1;
          case "pageUp":
            return Math.max(1, prev - 10);
          case "pageDown":
            return prev + 10;
          case "home":
            return 1;
          case "next":
            return highestClearedStage + 1;
          default:
            return prev;
        }
      });
    },
    [highestClearedStage]
  );

  // Jump to specific level
  const jumpToLevel = useCallback(() => {
    const level = parseInt(inputLevel);
    if (!isNaN(level) && level >= 1) {
      setCursorLevel(level);
      setInputLevel("");
    }
  }, [inputLevel]);

  // Get stage monsters info
  const getStageMonsterPreview = useMemo(() => {
    return (stage: BattleStage) => {
      return stage.monsters.map((sm) => {
        const monster = MONSTERS[sm.monsterId];
        return {
          ...monster,
          level: sm.level,
        };
      });
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header with Cursor Controls */}
      <div className="mb-2 p-2 bg-gradient-to-r from-red-700 to-red-500 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <span className="font-bold">ล่ามอนสเตอร์</span>
          </div>
          <div className="text-xs">
            ✅ ผ่านแล้ว:{" "}
            <span className="font-bold">{highestClearedStage}</span>
          </div>
        </div>

        {/* Cursor Navigation */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => moveCursor("home")}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
            title="ไปด่าน 1"
          >
            ⏮️ 1
          </button>
          <button
            onClick={() => moveCursor("pageUp")}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
            title="-10 ด่าน"
          >
            ◀️ -10
          </button>
          <button
            onClick={() => moveCursor("up")}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
            title="-1 ด่าน"
          >
            ▲
          </button>

          {/* Current Cursor Position */}
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-400 text-black rounded font-bold">
            <span>📍</span>
            <span>ด่าน {cursorLevel}</span>
          </div>

          <button
            onClick={() => moveCursor("down")}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
            title="+1 ด่าน"
          >
            ▼
          </button>
          <button
            onClick={() => moveCursor("pageDown")}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
            title="+10 ด่าน"
          >
            +10 ▶️
          </button>
          <button
            onClick={() => moveCursor("next")}
            className="px-2 py-1 bg-green-400 text-black hover:bg-green-300 rounded font-bold"
            title="ไปด่านถัดไป"
          >
            🎯 Next
          </button>
        </div>

        {/* Jump to Level */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            value={inputLevel}
            onChange={(e) => setInputLevel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && jumpToLevel()}
            placeholder="กระโดดไปด่าน..."
            className="flex-1 px-2 py-1 text-black text-xs rounded"
            min={1}
          />
          <button
            onClick={jumpToLevel}
            className="px-3 py-1 bg-yellow-400 text-black hover:bg-yellow-300 rounded font-bold"
          >
            GO
          </button>
        </div>

        {/* Range Info */}
        <div className="text-xs text-white/70 mt-1 text-center">
          แสดงด่าน {Math.max(1, cursorLevel - VISIBLE_RANGE)} -{" "}
          {cursorLevel + VISIBLE_RANGE}
        </div>
      </div>

      {/* Stage List - Cursor Based */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-1 pr-1"
        style={{ maxHeight: "350px" }}
      >
        {visibleStages.map((stage) => {
          const isSelected = selectedStage?.id === stage.id;
          const isCursor = stage.id === cursorLevel;
          const monsters = getStageMonsterPreview(stage);

          return (
            <button
              key={stage.id}
              ref={isCursor ? cursorRef : null}
              onClick={() => {
                setCursorLevel(stage.id);
                setSelectedStage(stage);
              }}
              disabled={!stage.unlocked}
              className={`
                w-full p-2 border text-left transition-all
                ${
                  isCursor
                    ? "bg-yellow-100 border-yellow-500 border-2 ring-2 ring-yellow-400"
                    : isSelected
                    ? "bg-blue-100 border-blue-500"
                    : stage.unlocked
                    ? "bg-white border-gray-300 hover:bg-gray-50"
                    : "bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed"
                }
                ${stage.completed ? "border-l-4 border-l-green-500" : ""}
              `}
            >
              <div className="flex items-center gap-2">
                {/* Cursor Indicator */}
                {isCursor && <span className="text-yellow-600">👉</span>}

                {/* Stage Number */}
                <div
                  className={`
                  w-8 h-8 flex items-center justify-center font-bold text-sm rounded
                  ${
                    stage.completed
                      ? "bg-green-500 text-white"
                      : isCursor
                      ? "bg-yellow-400"
                      : "bg-gray-100"
                  }
                `}
                >
                  {stage.id}
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm truncate">
                      {stage.name}
                    </span>
                    {stage.completed && (
                      <span className="text-yellow-500 text-xs">
                        {"⭐".repeat(stage.stars)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stage.description}
                  </div>
                </div>

                {/* Monster Preview */}
                <div className="flex items-center gap-1">
                  {monsters.slice(0, 3).map((m, idx) => (
                    <span
                      key={idx}
                      className="text-lg"
                      title={`${m.name} Lv.${m.level}`}
                    >
                      {m.icon}
                    </span>
                  ))}
                  {monsters.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{monsters.length - 3}
                    </span>
                  )}
                </div>

                {/* Lock Icon */}
                {!stage.unlocked && (
                  <span className="text-xl text-gray-400">🔒</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Details */}
      {selectedStage && (
        <div className="mt-2 p-3 border-2 border-blue-500 bg-blue-50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">{selectedStage.name}</h3>
              <p className="text-xs text-gray-600">
                {selectedStage.description}
              </p>
            </div>
            <button
              onClick={() => onStartBattle(selectedStage)}
              disabled={!selectedStage.unlocked}
              className="retro-button px-4 py-2 bg-red-500 text-white font-bold disabled:opacity-50"
            >
              ⚔️ ต่อสู้!
            </button>
          </div>

          {/* Monsters in Stage */}
          <div className="mb-2">
            <div className="text-xs font-bold mb-1">มอนสเตอร์:</div>
            <div className="flex flex-wrap gap-2">
              {getStageMonsterPreview(selectedStage).map((monster, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 p-1 bg-white border rounded text-xs"
                >
                  <span className="text-lg">{monster.icon}</span>
                  <div>
                    <div className="font-bold">{monster.name}</div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`px-1 rounded text-xs ${getRankColor(
                          monster.rank
                        )}`}
                      >
                        {monster.rank}
                      </span>
                      <span>Lv.{monster.level}</span>
                      <span>{getElementIcon(monster.element)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span>✨</span>
              <span>EXP: {Math.floor(selectedStage.rewards.exp)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>Gold: {Math.floor(selectedStage.rewards.gold)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini version for preview
export function MonsterHuntingPreview({
  highestClearedStage,
  onOpen,
}: {
  highestClearedStage: number;
  onOpen: () => void;
}) {
  const nextStage = generateStage(highestClearedStage + 1);
  const monsters = nextStage.monsters.map((sm) => MONSTERS[sm.monsterId]);

  return (
    <div className="retro-window">
      <div className="retro-window-titlebar">
        <span className="retro-window-title">⚔️ ล่ามอนสเตอร์</span>
      </div>
      <div className="retro-window-content p-2">
        <div className="text-xs mb-2">
          ด่านถัดไป: <span className="font-bold">{nextStage.name}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          {monsters.slice(0, 3).map((m, idx) => (
            <span key={idx} className="text-2xl" title={m.name}>
              {m.icon}
            </span>
          ))}
        </div>
        <button
          onClick={onOpen}
          className="retro-button w-full text-xs py-1 bg-red-100"
        >
          ⚔️ เปิดรายการด่าน
        </button>
      </div>
    </div>
  );
}
