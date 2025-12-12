"use client";

import type { BattleStage } from "@/src/domain/data/monsters";
import type { User } from "@/src/domain/types/user";
import type {
  GardenPlayer,
  PlantedItem,
} from "@/src/presentation/hooks/useGardenRoom";
import { useHotbarStore } from "@/src/presentation/stores/hotbarStore";
import { useCallback, useState } from "react";
import { BattleView } from "./BattleView";
import { CharacterMiniStatus, CharacterPanel } from "./CharacterPanel";
import { MonsterHunting } from "./MonsterHunting";
import { PlayerProfileModal } from "./PlayerProfileModal";

interface SimpleGameViewProps {
  user: User;
  players: GardenPlayer[];
  plants: PlantedItem[];
  localPlayerId: string | null;
  dayTime: number;
  onPlant: (type: string, x: number, z: number) => void;
  onWater: (plantId: string) => void;
  onHarvest: (plantId: string) => void;
}

// Plant info database
const PLANT_INFO: Record<
  string,
  { name: string; icon: string; growTime: string }
> = {
  carrot: { name: "แครอท", icon: "🥕", growTime: "3 วัน" },
  tomato: { name: "มะเขือเทศ", icon: "🍅", growTime: "5 วัน" },
  corn: { name: "ข้าวโพด", icon: "🌽", growTime: "7 วัน" },
  potato: { name: "มันฝรั่ง", icon: "🥔", growTime: "4 วัน" },
  strawberry: { name: "สตรอเบอร์รี่", icon: "🍓", growTime: "6 วัน" },
  pumpkin: { name: "ฟักทอง", icon: "🎃", growTime: "10 วัน" },
  sunflower: { name: "ดอกทานตะวัน", icon: "🌻", growTime: "8 วัน" },
  tulip: { name: "ทิวลิป", icon: "🌷", growTime: "5 วัน" },
};

// Growth stage labels
const GROWTH_STAGES = [
  "เมล็ด 🌱",
  "ต้นอ่อน 🌿",
  "เติบโต 🪴",
  "ออกดอก 🌸",
  "เก็บเกี่ยวได้ ✅",
];

// Time of day
function getTimeOfDay(dayTime: number): {
  period: string;
  icon: string;
  bg: string;
} {
  if (dayTime >= 5 && dayTime < 8)
    return { period: "เช้าตรู่", icon: "🌅", bg: "bg-orange-100" };
  if (dayTime >= 8 && dayTime < 12)
    return { period: "เช้า", icon: "☀️", bg: "bg-yellow-50" };
  if (dayTime >= 12 && dayTime < 14)
    return { period: "เที่ยง", icon: "🌞", bg: "bg-yellow-100" };
  if (dayTime >= 14 && dayTime < 17)
    return { period: "บ่าย", icon: "🌤️", bg: "bg-blue-50" };
  if (dayTime >= 17 && dayTime < 19)
    return { period: "เย็น", icon: "🌇", bg: "bg-orange-200" };
  if (dayTime >= 19 && dayTime < 21)
    return { period: "ค่ำ", icon: "🌆", bg: "bg-purple-100" };
  return { period: "กลางคืน", icon: "🌙", bg: "bg-slate-800 text-white" };
}

export function SimpleGameView({
  user,
  players,
  plants,
  localPlayerId,
  dayTime,
  onPlant,
  onWater,
  onHarvest,
}: SimpleGameViewProps) {
  const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "farm" | "inventory" | "players" | "character" | "battle"
  >("players");
  const [logs, setLogs] = useState<string[]>([
    "🎮 ยินดีต้อนรับสู่ Retro Pixel Garden!",
  ]);
  // ✅ highestClearedStage ใช้จาก server (localPlayer.highestClearedStage)
  const [currentBattle, setCurrentBattle] = useState<BattleStage | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<GardenPlayer | null>(
    null
  );

  const hotbarItems = useHotbarStore((state) => state.items);
  const selectedSlot = useHotbarStore((state) => state.selectedSlot);
  const setSelectedSlot = useHotbarStore((state) => state.setSelectedSlot);

  // Get local player
  const localPlayer = players.find((p) => p.clientId === localPlayerId);
  const timeInfo = getTimeOfDay(dayTime);

  // Add log message
  const addLog = useCallback((message: string) => {
    setLogs((prev) => [
      ...prev.slice(-19),
      `[${new Date().toLocaleTimeString("th-TH")}] ${message}`,
    ]);
  }, []);

  // Farm plots (6x6 grid = 36 plots)
  const FARM_SIZE = 6;
  const farmPlots = Array.from({ length: FARM_SIZE * FARM_SIZE }, (_, i) => {
    const x = (i % FARM_SIZE) - FARM_SIZE / 2;
    const z = Math.floor(i / FARM_SIZE) - FARM_SIZE / 2;
    // Find plant at this position
    const plant = plants.find(
      (p) => Math.round(p.x) === x && Math.round(p.z) === z
    );
    return { index: i, x, z, plant };
  });

  // Handle plot click
  const handlePlotClick = (plot: {
    index: number;
    x: number;
    z: number;
    plant: PlantedItem | undefined;
  }) => {
    setSelectedPlot(plot.index);

    if (plot.plant) {
      // Has plant
      if (plot.plant.growthStage >= 4) {
        // Ready to harvest
        onHarvest(plot.plant.id);
        addLog(
          `🌾 เก็บเกี่ยว ${PLANT_INFO[plot.plant.type]?.icon || "🌱"} ${
            PLANT_INFO[plot.plant.type]?.name || plot.plant.type
          } แล้ว!`
        );
      } else {
        // Water it
        onWater(plot.plant.id);
        addLog(
          `💧 รดน้ำ ${PLANT_INFO[plot.plant.type]?.icon || "🌱"} ${
            PLANT_INFO[plot.plant.type]?.name || plot.plant.type
          }`
        );
      }
    } else {
      // Empty plot - plant if seed selected
      const selectedItem = hotbarItems[selectedSlot];
      if (selectedItem?.type === "seed" && selectedItem.plantType) {
        onPlant(selectedItem.plantType, plot.x, plot.z);
        addLog(
          `🌱 ปลูก ${PLANT_INFO[selectedItem.plantType]?.icon || "🌱"} ${
            PLANT_INFO[selectedItem.plantType]?.name || selectedItem.plantType
          } ที่แปลง ${plot.index + 1}`
        );
      } else {
        addLog(
          `📍 เลือกแปลงที่ ${plot.index + 1} (ว่าง) - เลือกเมล็ดพืชเพื่อปลูก`
        );
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] p-2 overflow-auto">
      {/* Header - Time & Status */}
      <div className="retro-window mb-2">
        <div className="retro-window-titlebar">
          <span className="retro-window-title">
            🌾 Retro Pixel Garden - Simple Mode
          </span>
        </div>
        <div className={`retro-window-content ${timeInfo.bg} p-2`}>
          <div className="flex justify-between items-center text-xs flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span>
                {timeInfo.icon} {timeInfo.period} ({Math.floor(dayTime)}:00)
              </span>
              <span>👥 {players.length}</span>
              <span>🌱 {plants.length}</span>
            </div>
            {/* Character Mini Status - ✅ Server as Single Source of Truth */}
            <CharacterMiniStatus player={localPlayer || null} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Left Panel - Farm Grid */}
        <div className="lg:col-span-2">
          <div className="retro-window h-full">
            <div className="retro-window-titlebar">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("players")}
                  className={`px-2 py-0.5 text-xs ${
                    activeTab === "players"
                      ? "bg-white"
                      : "bg-[var(--win98-button-face)]"
                  }`}
                >
                  👥 ผู้เล่น
                </button>
                <button
                  onClick={() => setActiveTab("character")}
                  className={`px-2 py-0.5 text-xs ${
                    activeTab === "character"
                      ? "bg-white"
                      : "bg-[var(--win98-button-face)]"
                  }`}
                >
                  👤 ตัวละคร
                </button>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className={`px-2 py-0.5 text-xs ${
                    activeTab === "inventory"
                      ? "bg-white"
                      : "bg-[var(--win98-button-face)]"
                  }`}
                >
                  🎒 กระเป๋า
                </button>
                <button
                  onClick={() => setActiveTab("battle")}
                  className={`px-2 py-0.5 text-xs ${
                    activeTab === "battle"
                      ? "bg-white"
                      : "bg-[var(--win98-button-face)]"
                  }`}
                >
                  ⚔️ ล่ามอนสเตอร์
                </button>
                <button
                  onClick={() => setActiveTab("farm")}
                  className={`px-2 py-0.5 text-xs ${
                    activeTab === "farm"
                      ? "bg-white"
                      : "bg-[var(--win98-button-face)]"
                  }`}
                >
                  🌾 ฟาร์ม
                </button>
              </div>
            </div>
            <div className="retro-window-content p-2 min-h-[300px]">
              {activeTab === "farm" && (
                <div>
                  <p className="text-xs mb-2 text-[var(--win98-button-text)]">
                    คลิกที่แปลงเพื่อ: ปลูก (ถ้าว่าง) | รดน้ำ | เก็บเกี่ยว
                    (ถ้าโตเต็มที่)
                  </p>
                  <div
                    className="grid gap-1 mx-auto"
                    style={{
                      gridTemplateColumns: `repeat(${FARM_SIZE}, minmax(0, 1fr))`,
                      maxWidth: "400px",
                    }}
                  >
                    {farmPlots.map((plot) => (
                      <button
                        key={plot.index}
                        onClick={() => handlePlotClick(plot)}
                        className={`
                          aspect-square border-2 text-lg flex items-center justify-center
                          transition-all hover:scale-105 cursor-pointer
                          ${
                            selectedPlot === plot.index
                              ? "border-blue-500 bg-blue-100"
                              : "border-[var(--win98-button-shadow)]"
                          }
                          ${
                            plot.plant
                              ? "bg-green-100"
                              : "bg-[var(--win98-button-face)]"
                          }
                          ${
                            plot.plant?.growthStage === 4
                              ? "animate-pulse bg-yellow-100"
                              : ""
                          }
                        `}
                        title={
                          plot.plant
                            ? `${
                                PLANT_INFO[plot.plant.type]?.name ||
                                plot.plant.type
                              } - ${GROWTH_STAGES[plot.plant.growthStage]}`
                            : "ว่าง - คลิกเพื่อปลูก"
                        }
                      >
                        {plot.plant ? (
                          <span className="text-xl">
                            {plot.plant.growthStage >= 4
                              ? PLANT_INFO[plot.plant.type]?.icon || "🌱"
                              : ["🌱", "🌿", "🪴", "🌸", "✅"][
                                  plot.plant.growthStage
                                ]}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">·</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs mt-2 text-center text-[var(--win98-button-text)]">
                    {selectedPlot !== null && farmPlots[selectedPlot]?.plant
                      ? `🌱 ${
                          PLANT_INFO[farmPlots[selectedPlot].plant!.type]
                            ?.name || "พืช"
                        } - ${
                          GROWTH_STAGES[
                            farmPlots[selectedPlot].plant!.growthStage
                          ]
                        }`
                      : selectedPlot !== null
                      ? "แปลงว่าง - เลือกเมล็ดแล้วคลิกเพื่อปลูก"
                      : "คลิกเลือกแปลง"}
                  </p>
                </div>
              )}

              {activeTab === "inventory" && (
                <div>
                  <p className="text-xs mb-2 text-[var(--win98-button-text)]">
                    เลือกไอเทมเพื่อใช้งาน:
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {hotbarItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(i)}
                        className={`
                          p-2 border-2 text-center
                          ${
                            selectedSlot === i
                              ? "border-blue-500 bg-blue-100"
                              : "border-[var(--win98-button-shadow)] bg-[var(--win98-button-face)]"
                          }
                        `}
                      >
                        <span className="text-2xl block">
                          {item?.icon || "·"}
                        </span>
                        <span className="text-xs block truncate">
                          {item?.name || "ว่าง"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-2 bg-[var(--win98-button-face)] border border-[var(--win98-button-shadow)]">
                    <p className="text-xs font-bold mb-1">📖 คู่มือพืช:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(PLANT_INFO).map(([key, info]) => (
                        <div key={key} className="flex items-center gap-1">
                          <span>{info.icon}</span>
                          <span>{info.name}</span>
                          <span className="text-gray-500">
                            ({info.growTime})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "players" && (
                <div>
                  <p className="text-xs mb-2 text-[var(--win98-button-text)]">
                    ผู้เล่นออนไลน์: (คลิกเพื่อดูโปรไฟล์)
                  </p>
                  <div className="space-y-1">
                    {players.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayer(player)}
                        className={`
                          w-full p-2 border flex items-center gap-2 text-xs text-left
                          transition-all hover:scale-[1.01] cursor-pointer
                          ${
                            player.clientId === localPlayerId
                              ? "bg-blue-100 border-blue-300 hover:bg-blue-200"
                              : "bg-[var(--win98-button-face)] border-[var(--win98-button-shadow)] hover:bg-[var(--win98-button-highlight)]"
                          }
                        `}
                      >
                        <span className="text-lg">{player.avatar || "👤"}</span>
                        <div className="flex-1">
                          <span className="font-bold">{player.nickname}</span>
                          {player.clientId === localPlayerId && (
                            <span className="ml-1 text-blue-600">(คุณ)</span>
                          )}
                        </div>
                        <span className="text-gray-500">
                          📍 {player.x.toFixed(0)}, {player.z.toFixed(0)}
                        </span>
                        <span>{player.isMoving ? "🚶" : "🧍"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "character" && (
                <div>
                  <CharacterPanel player={localPlayer || null} />
                </div>
              )}

              {activeTab === "battle" &&
                (currentBattle ? (
                  <BattleView
                    stage={currentBattle}
                    player={localPlayer || null}
                    onExit={() => {
                      setCurrentBattle(null);
                    }}
                    onVictory={(rewards) => {
                      // ✅ Server จะ update highestClearedStage เอง
                      addLog(
                        `🎉 ชนะ ${currentBattle.name}! +${rewards.exp} EXP, +${rewards.gold} Gold`
                      );
                    }}
                  />
                ) : (
                  <MonsterHunting
                    highestClearedStage={localPlayer?.highestClearedStage ?? 0}
                    onStartBattle={(stage) => {
                      setCurrentBattle(stage);
                      addLog(`⚔️ เริ่มต่อสู้ ${stage.name}!`);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Log & Quick Actions */}
        <div className="space-y-2">
          {/* Quick Actions */}
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">⚡ Quick Actions</span>
            </div>
            <div className="retro-window-content p-2">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    plants.forEach((p) => {
                      if (p.growthStage < 4) onWater(p.id);
                    });
                    addLog("💧 รดน้ำพืชทั้งหมดแล้ว!");
                  }}
                  className="retro-button text-xs py-1"
                >
                  💧 รดน้ำทั้งหมด
                </button>
                <button
                  onClick={() => {
                    plants.forEach((p) => {
                      if (p.growthStage >= 4) onHarvest(p.id);
                    });
                    addLog("🌾 เก็บเกี่ยวพืชที่โตแล้วทั้งหมด!");
                  }}
                  className="retro-button text-xs py-1"
                >
                  🌾 เก็บเกี่ยวทั้งหมด
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">📜 Activity Log</span>
            </div>
            <div className="retro-window-content p-1 h-[200px] overflow-y-auto font-mono">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="text-xs py-0.5 border-b border-green-900"
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Plant Status */}
          <div className="retro-window">
            <div className="retro-window-titlebar">
              <span className="retro-window-title">🌱 สถานะพืช</span>
            </div>
            <div className="retro-window-content p-2 max-h-[150px] overflow-y-auto">
              {plants.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">
                  ยังไม่มีพืชที่ปลูก
                </p>
              ) : (
                <div className="space-y-1">
                  {plants.slice(0, 10).map((plant, index) => (
                    <div
                      key={`${plant.id}-${index}`}
                      className="flex items-center gap-1 text-xs"
                    >
                      <span>{PLANT_INFO[plant.type]?.icon || "🌱"}</span>
                      <span className="flex-1">
                        {PLANT_INFO[plant.type]?.name || plant.type}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className={`h-full ${
                            plant.growthStage >= 4
                              ? "bg-green-500"
                              : "bg-blue-400"
                          }`}
                          style={{ width: `${(plant.growthStage / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-500">
                        {plant.growthStage}/4
                      </span>
                    </div>
                  ))}
                  {plants.length > 10 && (
                    <p className="text-xs text-gray-500">
                      ...และอีก {plants.length - 10} ต้น
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
