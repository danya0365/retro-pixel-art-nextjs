"use client";

import { MONSTERS, type BattleStage } from "@/src/domain/data/monsters";
import { gameClient } from "@/src/infrastructure/colyseus/GameClient";
import type { GardenPlayer } from "@/src/presentation/hooks/useGardenRoom";
import {
  useBattleStore,
  type BattleUnit,
} from "@/src/presentation/stores/battleStore";
import { useCallback, useEffect, useMemo, useState } from "react";

interface BattleViewProps {
  stage: BattleStage;
  player: GardenPlayer | null; // ✅ Server as Single Source of Truth
  onExit: () => void;
  onVictory?: (rewards: { exp: number; gold: number }) => void;
}

// Result screen steps
type ResultStep = "victory" | "exp" | "levelup" | "gold" | "items" | "done";

interface DroppedItem {
  name: string;
  icon: string;
  quantity: number;
}

// ============================================
// Battle Tile Component
// ============================================
interface BattleTileProps {
  x: number;
  y: number;
  unit: BattleUnit | undefined;
  isInMoveRange: boolean;
  isInAttackRange: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

function BattleTile({
  x,
  y,
  unit,
  isInMoveRange,
  isInAttackRange,
  isCurrent,
  onClick,
}: BattleTileProps) {
  // Determine tile style
  let bgClass = "bg-gray-200";
  let borderClass = "border-gray-400";

  if (isCurrent && unit) {
    bgClass = unit.isAlly ? "bg-green-200" : "bg-orange-200";
    borderClass = unit.isAlly ? "border-green-500" : "border-orange-500";
  } else if (isInAttackRange && !unit?.isAlly) {
    bgClass = "bg-red-200";
    borderClass = "border-red-400";
  } else if (isInMoveRange) {
    bgClass = "bg-blue-200";
    borderClass = "border-blue-400";
  } else if (unit) {
    bgClass = unit.isAlly ? "bg-blue-100" : "bg-red-100";
    borderClass = unit.isAlly ? "border-blue-300" : "border-red-300";
  }

  // Checkerboard pattern
  const isLight = (x + y) % 2 === 0;
  if (!unit && !isInMoveRange && !isInAttackRange) {
    bgClass = isLight ? "bg-gray-100" : "bg-gray-200";
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 border-2 ${bgClass} ${borderClass}
        flex items-center justify-center
        hover:brightness-110 transition-all
        ${isCurrent ? "ring-2 ring-yellow-400 ring-offset-1" : ""}
      `}
      title={
        unit
          ? `${unit.name} (HP: ${unit.currentHp}/${unit.maxHp})`
          : `(${x}, ${y})`
      }
    >
      {unit && <span className="text-xl">{unit.icon}</span>}
    </button>
  );
}

// ============================================
// Unit Status Panel
// ============================================
interface UnitStatusProps {
  unit: BattleUnit;
  isCurrentTurn: boolean;
}

function UnitStatus({ unit, isCurrentTurn }: UnitStatusProps) {
  const hpPercent = (unit.currentHp / unit.maxHp) * 100;
  const mpPercent = (unit.currentMp / unit.maxMp) * 100;

  return (
    <div
      className={`
        p-2 border-2 mb-1
        ${
          isCurrentTurn
            ? "border-yellow-500 bg-yellow-50"
            : "border-gray-400 bg-white"
        }
        ${unit.isAlly ? "" : ""}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{unit.icon}</span>
        <span className="font-bold text-xs truncate">{unit.name}</span>
        {isCurrentTurn && <span className="text-xs">👈</span>}
      </div>

      {/* HP Bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[10px]">
          <span>HP</span>
          <span>
            {unit.currentHp}/{unit.maxHp}
          </span>
        </div>
        <div className="h-2 bg-gray-300 border border-gray-400">
          <div
            className={`h-full ${
              hpPercent > 50
                ? "bg-green-500"
                : hpPercent > 25
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* MP Bar */}
      <div>
        <div className="flex justify-between text-[10px]">
          <span>MP</span>
          <span>
            {unit.currentMp}/{unit.maxMp}
          </span>
        </div>
        <div className="h-2 bg-gray-300 border border-gray-400">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${mpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Battle Log Panel
// ============================================
function BattleLogPanel() {
  const battleLogs = useBattleStore((s) => s.battleLogs);

  return (
    <div className="h-full overflow-y-auto text-xs space-y-0.5 p-1 font-mono">
      {battleLogs.slice(-20).map((log) => (
        <div key={log.id} className="leading-tight">
          <span className="text-gray-500">[T{log.turn}]</span> {log.message}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Victory Result Screen - Step by Step
// ============================================
interface VictoryResultScreenProps {
  stage: BattleStage;
  rewards: { exp: number; gold: number } | null;
  onExit: () => void;
  onVictory?: (rewards: { exp: number; gold: number }) => void;
}

function VictoryResultScreen({
  stage,
  rewards,
  onExit,
  onVictory,
}: VictoryResultScreenProps) {
  const [currentStep, setCurrentStep] = useState<ResultStep>("victory");
  const [hasAppliedRewards, setHasAppliedRewards] = useState(false);
  // Note: Level up ถูกคำนวณบน server แล้ว - ไม่ต้องแสดง level up step บน client

  // ✅ Server as Single Source of Truth - ไม่ใช้ local store อีกต่อไป
  // EXP/Gold จะถูก update บน server เมื่อเรียก gameClient.reportBattleVictory()

  // Calculate dropped items from monsters
  const droppedItems = useMemo<DroppedItem[]>(() => {
    const items: DroppedItem[] = [];
    stage.monsters.forEach((sm) => {
      const monster = MONSTERS[sm.monsterId];
      if (monster?.dropItems) {
        monster.dropItems.forEach((drop) => {
          // Simulate drop chance
          if (Math.random() < drop.chance) {
            const existing = items.find((i) => i.name === drop.itemId);
            if (existing) {
              existing.quantity++;
            } else {
              items.push({
                name: drop.itemId,
                icon: "📦", // Default icon
                quantity: 1,
              });
            }
          }
        });
      }
    });
    return items;
  }, [stage.monsters]);

  // ✅ Server as Single Source of Truth
  // เมื่อถึง step "exp" → ส่งผลการต่อสู้ไป server → server จะ update stats ให้
  useEffect(() => {
    if (currentStep === "exp" && rewards && !hasAppliedRewards) {
      setHasAppliedRewards(true);

      // ส่งผลการต่อสู้ไป server - server จะ update EXP/Gold/Level
      if (gameClient.isConnected()) {
        gameClient.reportBattleVictory({
          stageId: stage.id,
          stageName: stage.name,
          rewards: {
            exp: rewards.exp,
            gold: rewards.gold,
          },
          leveledUp: false, // Server จะคำนวณเอง
          newLevel: undefined,
        });
        console.log("📡 Battle result sent to server");
      }

      // Notify parent of victory
      if (onVictory) {
        onVictory(rewards);
      }
    }
  }, [
    currentStep,
    rewards,
    hasAppliedRewards,
    onVictory,
    stage.id,
    stage.name,
  ]);

  const handleNext = () => {
    switch (currentStep) {
      case "victory":
        setCurrentStep("exp");
        break;
      case "exp":
        // ✅ Server จะคำนวณ level up เอง - ข้ามไป gold เลย
        setCurrentStep("gold");
        break;
      case "gold":
        if (droppedItems.length > 0) {
          setCurrentStep("items");
        } else {
          setCurrentStep("done");
        }
        break;
      case "items":
        setCurrentStep("done");
        break;
      case "done":
        onExit();
        break;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case "done":
        return "🚪 กลับหน้าเลือกด่าน";
      default:
        return "⏭️ ถัดไป";
    }
  };

  return (
    <div className="retro-window w-full max-w-md mx-auto">
      <div className="retro-window-titlebar">
        <span className="retro-window-title">
          {currentStep === "victory" && "🎉 Victory!"}
          {currentStep === "exp" && "⭐ EXP"}
          {currentStep === "levelup" && "🆙 Level Up!"}
          {currentStep === "gold" && "💰 Gold"}
          {currentStep === "items" && "🎁 Items"}
          {currentStep === "done" && "📋 สรุปผล"}
        </span>
      </div>
      <div className="retro-window-content p-4">
        {/* Step Content */}
        <div className="text-center min-h-[200px] flex flex-col items-center justify-center">
          {/* Victory Step */}
          {currentStep === "victory" && (
            <>
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-xl font-bold mb-2">ชัยชนะ!</h2>
              <p className="text-sm text-gray-600">คุณชนะ {stage.name}</p>
            </>
          )}

          {/* EXP Step */}
          {currentStep === "exp" && rewards && (
            <>
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-xl font-bold mb-2">ได้รับ EXP!</h2>
              <div className="bg-green-100 border-2 border-green-400 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  +{rewards.exp} EXP
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                (EXP จะถูก update บน server)
              </div>
            </>
          )}

          {/* Level Up - ถูกคำนวณบน server แล้ว */}

          {/* Gold Step */}
          {currentStep === "gold" && rewards && (
            <>
              <div className="text-6xl mb-4">💰</div>
              <h2 className="text-xl font-bold mb-2">ได้รับ Gold!</h2>
              <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  +{rewards.gold} Gold
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                (Gold จะถูก update บน server)
              </div>
            </>
          )}

          {/* Items Step */}
          {currentStep === "items" && (
            <>
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-xl font-bold mb-2">ได้รับไอเท็ม!</h2>
              <div className="bg-purple-100 border-2 border-purple-400 p-4 rounded-lg w-full">
                {droppedItems.length > 0 ? (
                  <div className="space-y-2">
                    {droppedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <span className="font-bold">{item.name}</span>
                        </div>
                        <span className="text-purple-600 font-bold">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">ไม่ได้รับไอเท็มใดๆ</div>
                )}
              </div>
            </>
          )}

          {/* Done Step - Summary */}
          {currentStep === "done" && rewards && (
            <>
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-lg font-bold mb-3">สรุปผลการต่อสู้</h2>
              <div className="w-full bg-gray-100 border-2 border-gray-400 p-3 rounded-lg text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span>ด่าน:</span>
                  <span className="font-bold">{stage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>EXP:</span>
                  <span className="font-bold text-green-600">
                    +{rewards.exp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gold:</span>
                  <span className="font-bold text-yellow-600">
                    +{rewards.gold}
                  </span>
                </div>
                {droppedItems.length > 0 && (
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span className="font-bold text-purple-600">
                      {droppedItems.length} ชิ้น
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Progress Dots - ไม่มี levelup step เพราะ server คำนวณเอง */}
        <div className="flex justify-center gap-2 my-4">
          {(["victory", "exp", "gold", "items", "done"] as ResultStep[])
            .filter((step) => {
              if (step === "items" && droppedItems.length === 0) return false;
              return true;
            })
            .map((step, idx) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  currentStep === step
                    ? "bg-blue-500"
                    : idx <
                      (
                        [
                          "victory",
                          "exp",
                          "gold",
                          "items",
                          "done",
                        ] as ResultStep[]
                      )
                        .filter((s) => {
                          if (s === "items" && droppedItems.length === 0)
                            return false;
                          return true;
                        })
                        .indexOf(currentStep)
                    ? "bg-blue-300"
                    : "bg-gray-300"
                }`}
              />
            ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className={`retro-button w-full py-2 ${
            currentStep === "done" ? "bg-blue-500 text-white" : ""
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Battle View Component
// ============================================
export function BattleView({
  stage,
  player,
  onExit,
  onVictory,
}: BattleViewProps) {
  // ✅ ใช้ player จาก server แทน characterStore

  const {
    phase,
    turn,
    rewards,
    allyUnits,
    enemyUnits,
    currentUnitId,
    initBattle,
    handleTileClick,
    endTurn,
    getCurrentUnit,
    getUnitAtPosition,
    isTileInMovementRange,
    isTileInAttackRange,
    gridWidth,
    gridHeight,
  } = useBattleStore();

  const currentUnit = getCurrentUnit();

  // Initialize battle on mount - ✅ ใช้ข้อมูลจาก server
  useEffect(() => {
    if (!player) return;

    const playerUnit: BattleUnit = {
      id: "player",
      name: player.nickname,
      icon: "🦸",
      position: { x: 1, y: 3 },
      currentHp: player.hp,
      maxHp: player.maxHp,
      currentMp: player.mp,
      maxMp: player.maxMp,
      stats: {
        atk: player.atk,
        def: player.def,
        agi: player.agi,
        wis: player.wis,
        mov: player.mov,
        rng: player.rng,
      },
      isAlly: true,
      hasActed: false,
    };

    initBattle(stage, playerUnit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage.id]);

  // Note: Victory callback is handled by VictoryResultScreen internally
  // Removed duplicate useEffect that was causing infinite loop

  const handleTileClickWrapper = useCallback(
    (x: number, y: number) => {
      handleTileClick(x, y);
    },
    [handleTileClick]
  );

  // ============================================
  // Victory Result Screen - Step by Step
  // ============================================
  if (phase === "victory") {
    return (
      <VictoryResultScreen
        stage={stage}
        rewards={rewards}
        onExit={onExit}
        onVictory={onVictory}
      />
    );
  }

  // Defeat Screen
  if (phase === "defeat") {
    return (
      <div className="retro-window w-full max-w-md mx-auto">
        <div className="retro-window-titlebar">
          <span className="retro-window-title">💀 Defeat</span>
        </div>
        <div className="retro-window-content p-4 text-center">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-xl font-bold mb-2">พ่ายแพ้...</h2>
          <p className="text-sm text-gray-600 mb-4">คุณแพ้ {stage.name}</p>

          <button onClick={onExit} className="retro-button px-6 py-2">
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-window w-full">
      {/* Title Bar */}
      <div className="retro-window-titlebar flex justify-between">
        <span className="retro-window-title">⚔️ {stage.name}</span>
        <span className="text-xs">Turn: {turn}</span>
      </div>

      <div className="retro-window-content p-2">
        <div className="flex gap-2">
          {/* Left Panel - Allies */}
          <div className="w-32 flex-shrink-0">
            <div className="retro-window">
              <div className="retro-window-titlebar">
                <span className="retro-window-title text-xs">🛡️ Allies</span>
              </div>
              <div className="retro-window-content p-1 max-h-48 overflow-y-auto">
                {allyUnits.map((unit) => (
                  <UnitStatus
                    key={unit.id}
                    unit={unit}
                    isCurrentTurn={unit.id === currentUnitId}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center - Battle Grid */}
          <div className="flex-1 flex flex-col items-center">
            {/* Current Turn Info */}
            {currentUnit && (
              <div
                className={`
                  w-full mb-2 p-2 border-2 text-center text-sm
                  ${
                    currentUnit.isAlly
                      ? "bg-blue-100 border-blue-400"
                      : "bg-red-100 border-red-400"
                  }
                `}
              >
                {currentUnit.isAlly ? (
                  <>
                    <strong>🎮 Your Turn</strong> - {currentUnit.name}
                    <br />
                    <span className="text-xs">
                      คลิก
                      <span className="text-blue-600 font-bold">ช่องสีฟ้า</span>
                      เพื่อเดิน หรือ
                      <span className="text-red-600 font-bold">ช่องสีแดง</span>
                      เพื่อโจมตี
                    </span>
                  </>
                ) : (
                  <>
                    <strong>⏳ Enemy Turn</strong> - {currentUnit.name}
                    <br />
                    <span className="text-xs">รอศัตรูเดิน...</span>
                  </>
                )}
              </div>
            )}

            {/* Grid */}
            <div
              className="grid gap-0.5 p-2 bg-gray-400 border-4 border-gray-600"
              style={{
                gridTemplateColumns: `repeat(${gridWidth}, 40px)`,
              }}
            >
              {Array.from({ length: gridHeight }).map((_, y) =>
                Array.from({ length: gridWidth }).map((_, x) => {
                  const unit = getUnitAtPosition(x, y);
                  const isInMoveRange = isTileInMovementRange(x, y);
                  const isInAttackRange = isTileInAttackRange(x, y);
                  const isCurrent = unit?.id === currentUnitId;

                  return (
                    <BattleTile
                      key={`${x}-${y}`}
                      x={x}
                      y={y}
                      unit={unit}
                      isInMoveRange={isInMoveRange}
                      isInAttackRange={isInAttackRange}
                      isCurrent={isCurrent}
                      onClick={() => handleTileClickWrapper(x, y)}
                    />
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="mt-2 flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-200 border border-blue-400" />
                <span>เดินได้</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-200 border border-red-400" />
                <span>โจมตีได้</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-200 border border-green-500" />
                <span>เทิร์นของคุณ</span>
              </div>
            </div>

            {/* Action Buttons */}
            {currentUnit?.isAlly && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={endTurn}
                  className="retro-button px-4 py-1 text-sm"
                >
                  ⏭️ End Turn
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Enemies */}
          <div className="w-32 flex-shrink-0">
            <div className="retro-window">
              <div className="retro-window-titlebar">
                <span className="retro-window-title text-xs">👹 Enemies</span>
              </div>
              <div className="retro-window-content p-1 max-h-48 overflow-y-auto">
                {enemyUnits.map((unit) => (
                  <UnitStatus
                    key={unit.id}
                    unit={unit}
                    isCurrentTurn={unit.id === currentUnitId}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="mt-2">
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title text-xs">📜 Battle Log</span>
            </div>
            <div className="retro-window-content h-24">
              <BattleLogPanel />
            </div>
          </div>
        </div>

        {/* Exit Button */}
        <div className="mt-2 flex justify-end">
          <button onClick={onExit} className="retro-button px-3 py-1 text-xs">
            🚪 หนี (Exit)
          </button>
        </div>
      </div>
    </div>
  );
}
