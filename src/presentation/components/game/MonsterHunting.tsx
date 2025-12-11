"use client";

import {
  generateStage,
  getElementIcon,
  getRankColor,
  MONSTERS,
  type BattleStage,
} from "@/src/domain/data/monsters";
import { useCallback, useMemo, useRef, useState } from "react";

interface MonsterHuntingProps {
  onStartBattle: (stage: BattleStage) => void;
  highestClearedStage: number;
}

// ============================================
// Stage Confirm Modal - Win98 Style Popup
// ============================================
interface StageConfirmModalProps {
  stage: BattleStage;
  onConfirm: () => void;
  onCancel: () => void;
}

function StageConfirmModal({
  stage,
  onConfirm,
  onCancel,
}: StageConfirmModalProps) {
  const monsters = stage.monsters.map((sm) => {
    const monster = MONSTERS[sm.monsterId];
    return {
      ...monster,
      level: sm.level,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="retro-window w-full max-w-md mx-4 shadow-2xl">
        {/* Title Bar */}
        <div className="retro-window-titlebar flex justify-between items-center">
          <span className="retro-window-title">⚔️ {stage.name}</span>
          <button
            onClick={onCancel}
            className="w-5 h-5 flex items-center justify-center bg-gray-200 border border-gray-400 text-xs font-bold hover:bg-red-200"
          >
            ✕
          </button>
        </div>

        <div className="retro-window-content p-4">
          {/* Stage Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-bold">ด่านที่ {stage.id}</div>
                <div className="text-xs text-gray-600">{stage.description}</div>
              </div>
            </div>
          </div>

          {/* Monster List */}
          <div className="mb-4 p-2 bg-gray-100 border-2 border-gray-300">
            <div className="text-xs font-bold mb-2 flex items-center gap-1">
              👹 มอนสเตอร์ในด่าน ({monsters.length} ตัว)
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {monsters.map((monster, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{monster.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{monster.name}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span
                          className={`px-1 rounded ${getRankColor(
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
                  <div className="text-right text-xs">
                    <div>
                      HP:{" "}
                      {Math.floor(
                        monster.baseStats.hp * (1 + (monster.level - 1) * 0.1)
                      )}
                    </div>
                    <div>
                      ATK:{" "}
                      {Math.floor(
                        monster.baseStats.atk * (1 + (monster.level - 1) * 0.1)
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div className="mb-4 p-2 bg-yellow-50 border-2 border-yellow-400">
            <div className="text-xs font-bold mb-2">🎁 รางวัลที่จะได้รับ</div>
            <div className="flex gap-6 justify-center">
              <div className="text-center">
                <div className="text-xl">⭐</div>
                <div className="text-sm font-bold text-green-600">
                  +{Math.floor(stage.rewards.exp)} EXP
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl">💰</div>
                <div className="text-sm font-bold text-yellow-600">
                  +{Math.floor(stage.rewards.gold)} Gold
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 retro-button py-2 bg-gray-200 text-gray-700"
            >
              ❌ ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              disabled={!stage.unlocked}
              className="flex-1 retro-button py-2 bg-red-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚔️ เริ่มต่อสู้!
            </button>
          </div>

          {/* Locked Warning */}
          {!stage.unlocked && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 text-xs text-center">
              🔒 ด่านนี้ยังไม่ปลดล็อค - ต้องผ่านด่านก่อนหน้าก่อน
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const VISIBLE_COUNT = 100; // Always show 100 items
const LOAD_MORE_COUNT = 30; // Load/unload 30 items at a time
const SCROLL_THRESHOLD = 100; // Pixels from edge to trigger load

export function MonsterHunting({
  onStartBattle,
  highestClearedStage,
}: MonsterHuntingProps) {
  // Window start position (first visible level)
  const [windowStart, setWindowStart] = useState(1);
  const [selectedStage, setSelectedStage] = useState<BattleStage | null>(null);
  const [inputLevel, setInputLevel] = useState("");
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [isLoadingBottom, setIsLoadingBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollTop = useRef(0);
  const isScrolling = useRef(false);

  // Generate stages for current window (always 100 items)
  const visibleStages = useMemo(() => {
    const stages: BattleStage[] = [];
    const startLevel = Math.max(1, windowStart);
    const endLevel = startLevel + VISIBLE_COUNT - 1;

    for (let i = startLevel; i <= endLevel; i++) {
      const stage = generateStage(i);
      stage.unlocked = i <= highestClearedStage + 1;
      stage.completed = i <= highestClearedStage;
      if (stage.completed) stage.stars = 3;
      stages.push(stage);
    }

    return stages;
  }, [windowStart, highestClearedStage]);

  // Handle scroll - Discord style loading
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isScrolling.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Scrolling down - near bottom
    if (scrollBottom < SCROLL_THRESHOLD && !isLoadingBottom) {
      setIsLoadingBottom(true);
      isScrolling.current = true;

      // Load 30 more at bottom, remove 30 from top
      setWindowStart((prev) => prev + LOAD_MORE_COUNT);

      // Maintain scroll position
      requestAnimationFrame(() => {
        if (container) {
          // Adjust scroll to compensate for removed items
          container.scrollTop = scrollTop - LOAD_MORE_COUNT * 44; // ~44px per item
        }
        isScrolling.current = false;
        setIsLoadingBottom(false);
      });
    }

    // Scrolling up - near top
    if (scrollTop < SCROLL_THRESHOLD && windowStart > 1 && !isLoadingTop) {
      setIsLoadingTop(true);
      isScrolling.current = true;

      // Load 30 more at top, remove 30 from bottom
      const newStart = Math.max(1, windowStart - LOAD_MORE_COUNT);
      const actualLoaded = windowStart - newStart;
      setWindowStart(newStart);

      // Maintain scroll position
      requestAnimationFrame(() => {
        if (container && actualLoaded > 0) {
          container.scrollTop = scrollTop + actualLoaded * 44;
        }
        isScrolling.current = false;
        setIsLoadingTop(false);
      });
    }

    prevScrollTop.current = scrollTop;
  }, [windowStart, isLoadingTop, isLoadingBottom]);

  // Jump to specific level
  const jumpToLevel = useCallback((level: number) => {
    if (level >= 1) {
      // Center the level in the window
      const newStart = Math.max(1, level - Math.floor(VISIBLE_COUNT / 2));
      setWindowStart(newStart);

      // Scroll to center after render
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        if (container) {
          const itemIndex = level - newStart;
          container.scrollTop = Math.max(
            0,
            itemIndex * 44 - container.clientHeight / 2
          );
        }
      });
    }
  }, []);

  // Quick navigation functions
  const goToStart = useCallback(() => {
    setWindowStart(1);
    requestAnimationFrame(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const goToNext = useCallback(() => {
    jumpToLevel(highestClearedStage + 1);
  }, [highestClearedStage, jumpToLevel]);

  const goToEnd = useCallback(() => {
    // Go to a very high level (infinite)
    const targetLevel = Math.max(highestClearedStage + 100, windowStart + 200);
    jumpToLevel(targetLevel);
  }, [highestClearedStage, windowStart, jumpToLevel]);

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
      {/* Header - Discord Style */}
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

        {/* Quick Navigation */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            onClick={goToStart}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
            title="ไปด่าน 1"
          >
            ⏮️ ด่าน 1
          </button>
          <button
            onClick={goToNext}
            className="px-2 py-1 bg-green-400 text-black hover:bg-green-300 rounded font-bold"
            title="ไปด่านถัดไป"
          >
            🎯 ด่านถัดไป ({highestClearedStage + 1})
          </button>
          <button
            onClick={goToEnd}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded"
            title="ไปด่านไกลๆ"
          >
            ⏭️ ไปไกล
          </button>

          {/* Current Window Info */}
          <div className="flex items-center gap-1 px-2 py-1 bg-black/20 rounded">
            <span>
              📍 แสดงด่าน {windowStart} - {windowStart + VISIBLE_COUNT - 1}
            </span>
          </div>
        </div>

        {/* Jump to Level */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            value={inputLevel}
            onChange={(e) => setInputLevel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const level = parseInt(inputLevel);
                if (!isNaN(level) && level >= 1) {
                  jumpToLevel(level);
                  setInputLevel("");
                }
              }
            }}
            placeholder="กระโดดไปด่าน..."
            className="flex-1 px-2 py-1 text-black text-xs rounded"
            min={1}
          />
          <button
            onClick={() => {
              const level = parseInt(inputLevel);
              if (!isNaN(level) && level >= 1) {
                jumpToLevel(level);
                setInputLevel("");
              }
            }}
            className="px-3 py-1 bg-yellow-400 text-black hover:bg-yellow-300 rounded font-bold"
          >
            GO
          </button>
        </div>
      </div>

      {/* Loading indicator - top */}
      {isLoadingTop && (
        <div className="text-center text-xs text-gray-500 py-1">
          ⏳ กำลังโหลดด่านก่อนหน้า...
        </div>
      )}

      {/* Stage List - Discord Style Virtual Scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-1 pr-1"
        style={{ maxHeight: "320px" }}
      >
        {/* Top boundary indicator */}
        {windowStart > 1 && (
          <div
            className="text-center text-xs text-blue-500 py-2 cursor-pointer hover:bg-blue-50"
            onClick={() => jumpToLevel(Math.max(1, windowStart - 50))}
          >
            ⬆️ เลื่อนขึ้นเพื่อดูด่าน 1-{windowStart - 1} (คลิกเพื่อไป)
          </div>
        )}

        {visibleStages.map((stage) => {
          const isSelected = selectedStage?.id === stage.id;
          const isNextStage = stage.id === highestClearedStage + 1;
          const monsters = getStageMonsterPreview(stage);

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              disabled={!stage.unlocked}
              className={`
                w-full p-2 border text-left transition-all
                ${
                  isNextStage
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
                {/* Next Stage Indicator */}
                {isNextStage && <span className="text-yellow-600">👉</span>}

                {/* Stage Number */}
                <div
                  className={`
                  w-8 h-8 flex items-center justify-center font-bold text-sm rounded
                  ${
                    stage.completed
                      ? "bg-green-500 text-white"
                      : isNextStage
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

        {/* Bottom boundary indicator */}
        <div
          className="text-center text-xs text-blue-500 py-2 cursor-pointer hover:bg-blue-50"
          onClick={() => jumpToLevel(windowStart + VISIBLE_COUNT + 50)}
        >
          ⬇️ เลื่อนลงเพื่อดูด่านถัดไป (คลิกเพื่อไป)
        </div>
      </div>

      {/* Loading indicator - bottom */}
      {isLoadingBottom && (
        <div className="text-center text-xs text-gray-500 py-1">
          ⏳ กำลังโหลดด่านถัดไป...
        </div>
      )}

      {/* Stage Confirm Modal */}
      {selectedStage && (
        <StageConfirmModal
          stage={selectedStage}
          onConfirm={() => {
            onStartBattle(selectedStage);
            setSelectedStage(null);
          }}
          onCancel={() => setSelectedStage(null)}
        />
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
