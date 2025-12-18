"use client";

import type { User } from "@/src/domain/types/user";
import { gameClient } from "@/src/infrastructure/colyseus/GameClient";
import { useCharacterStore } from "@/src/presentation/stores/characterStore";
import { Room } from "colyseus.js";
import { useCallback, useEffect, useRef, useState } from "react";

// Types matching server schema
export interface GardenPlayer {
  id: string;
  clientId: string;
  nickname: string;
  avatar: string;
  x: number;
  y: number;
  z: number;
  direction: string;
  isMoving: boolean;
  currentAction: string;
  // Character stats
  characterClass: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  agi: number;
  wis: number;
  gold: number;
  mov: number;
  rng: number;
  highestClearedStage: number;
}

export interface PlantedItem {
  id: string;
  type: string;
  x: number;
  z: number;
  growthStage: number;
  plantedBy: string;
}

export interface WorldObject {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
}

export interface GardenState {
  worldId: string;
  worldName: string;
  players: GardenPlayer[];
  plants: Map<string, PlantedItem>;
  objects: Map<string, WorldObject>;
  serverTick: number;
  dayTime: number;
}

interface UseGardenRoomOptions {
  user: User;
  autoConnect?: boolean;
  roomId?: string; // Optional: join specific room by ID
  createNew?: boolean; // Optional: force create new room
}

interface UseGardenRoomReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Game state
  players: GardenPlayer[];
  plants: PlantedItem[];
  objects: WorldObject[];
  localPlayerId: string | null;
  dayTime: number;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendInput: (input: {
    velocityX: number;
    velocityZ: number;
    direction: string;
  }) => void;
  plant: (type: string, x: number, z: number) => void;
  water: (plantId: string) => void;
  harvest: (plantId: string) => void;
  placeObject: (
    type: string,
    x: number,
    y: number,
    z: number,
    rotation?: number
  ) => void;
  removeObject: (objectId: string) => void;
}

export function useGardenRoom({
  user,
  autoConnect = true,
  roomId,
  createNew = false,
}: UseGardenRoomOptions): UseGardenRoomReturn {
  const roomRef = useRef<Room | null>(null);
  const inputSequenceRef = useRef(0);
  const isConnectingRef = useRef(false); // Ref to prevent double connect from Strict Mode
  const isMountedRef = useRef(true); // Track if component is truly mounted

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game state
  const [players, setPlayers] = useState<GardenPlayer[]>([]);
  const [plants, setPlants] = useState<PlantedItem[]>([]);
  const [objects, setObjects] = useState<WorldObject[]>([]);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [dayTime, setDayTime] = useState(12);

  /**
   * Connect to garden room
   */
  const connect = useCallback(async () => {
    // Use ref to prevent double connect from React Strict Mode
    if (isConnected || isConnecting || isConnectingRef.current) return;

    isConnectingRef.current = true;
    setIsConnecting(true);
    setError(null);

    try {
      let room;
      // Get character stats from store
      const characterState = useCharacterStore.getState().character;
      const options = {
        nickname: user.nickname,
        avatar: user.avatar,
        characterClass: characterState.class,
        stats: {
          level: characterState.totalStats.level,
          exp: characterState.totalStats.exp,
          expToNextLevel: characterState.totalStats.expToNextLevel,
          hp: characterState.totalStats.hp,
          maxHp: characterState.totalStats.maxHp,
          mp: characterState.totalStats.mp,
          maxMp: characterState.totalStats.maxMp,
          atk: characterState.totalStats.atk,
          def: characterState.totalStats.def,
          agi: characterState.totalStats.agi,
          wis: characterState.totalStats.wis,
          gold: characterState.gold,
          mov: characterState.totalStats.mov,
          rng: characterState.totalStats.rng,
          highestClearedStage: characterState.highestClearedStage ?? 0,
        },
      };

      if (roomId) {
        // Join specific room by ID
        room = await gameClient.joinRoomById(roomId, options);
      } else if (createNew) {
        // Create new room
        room = await gameClient.createRoom("garden_room", options);
      } else {
        // Join or create (default behavior)
        room = await gameClient.joinOrCreateRoom("garden_room", options);
      }

      roomRef.current = room;

      // Listen for state changes
      room.onStateChange((state) => {
        // Update players
        if (state.players) {
          const playerList: GardenPlayer[] = [];
          state.players.forEach((p: GardenPlayer) => {
            playerList.push({
              id: p.id,
              clientId: p.clientId,
              nickname: p.nickname,
              avatar: p.avatar,
              x: p.x,
              y: p.y,
              z: p.z,
              direction: p.direction,
              isMoving: p.isMoving,
              currentAction: p.currentAction,
              // Character stats
              characterClass: p.characterClass || "Farmer",
              level: p.level || 1,
              exp: p.exp || 0,
              expToNextLevel: p.expToNextLevel || 100,
              hp: p.hp || 120,
              maxHp: p.maxHp || 120,
              mp: p.mp || 30,
              maxMp: p.maxMp || 30,
              atk: p.atk || 85,
              def: p.def || 75,
              agi: p.agi || 90,
              wis: p.wis || 60,
              gold: p.gold || 100,
              mov: p.mov || 2,
              rng: p.rng || 1,
              highestClearedStage: p.highestClearedStage || 0,
            });
          });
          setPlayers(playerList);
        }

        // Update day time
        if (state.dayTime !== undefined) {
          setDayTime(state.dayTime);
        }
      });

      // Listen for spawn event - use clientId for matching
      room.onMessage("player_spawned", (data) => {
        console.log(
          "🌱 Player spawned:",
          data,
          "Room sessionId:",
          room.sessionId
        );
        setLocalPlayerId(data.clientId); // Use clientId for matching (same as room.sessionId)
      });

      // Listen for plant events
      room.onMessage("plant_added", (data) => {
        console.log("🌱 Plant added:", data);
        setPlants((prev) => [
          ...prev,
          {
            id: data.id,
            type: data.type,
            x: data.x,
            z: data.z,
            growthStage: 0,
            plantedBy: data.plantedBy,
          },
        ]);
      });

      room.onMessage("plant_grew", (data) => {
        setPlants((prev) =>
          prev.map((p) =>
            p.id === data.plantId ? { ...p, growthStage: data.stage } : p
          )
        );
      });

      room.onMessage("plant_harvested", (data) => {
        setPlants((prev) => prev.filter((p) => p.id !== data.plantId));
      });

      // Listen for object events
      room.onMessage("object_placed", (data) => {
        setObjects((prev) => [
          ...prev,
          {
            id: data.id,
            type: data.type,
            x: data.x,
            y: data.y,
            z: data.z,
            rotation: data.rotation,
          },
        ]);
      });

      room.onMessage("object_removed", (data) => {
        setObjects((prev) => prev.filter((o) => o.id !== data.objectId));
      });

      // ✅ รับ stats จาก server แล้ว sync ลง characterStore เพื่อ persist
      room.onMessage("stats_synced", (data) => {
        console.log("📥 Stats synced from server:", data);
        const { syncStatsFromServer } = useCharacterStore.getState();
        syncStatsFromServer(data);
      });

      // ✅ รับ inventory sync จาก server
      room.onMessage("inventory_synced", (data) => {
        console.log("📥 Inventory synced from server:", data);
        const { syncInventoryFromServer } = useCharacterStore.getState();
        syncInventoryFromServer(data);
      });

      // ✅ รับผลเปิดหีบสมบัติ
      room.onMessage("chest_opened", (data) => {
        console.log("📦 Chest opened, got items:", data.items);
        import("@/src/presentation/stores/notificationStore").then(
          ({ showSuccess }) => {
            const itemNames = data.items
              .map(
                (i: { itemId: string; quantity: number }) =>
                  `${i.itemId} x${i.quantity}`
              )
              .join(", ");
            showSuccess(`📦 เปิดหีบได้: ${itemNames}`);
          }
        );
      });

      // ✅ รับผลใช้ consumable
      room.onMessage("consumable_used", (data) => {
        console.log("💊 Consumable used:", data);
        import("@/src/presentation/stores/notificationStore").then(
          ({ showSuccess }) => {
            showSuccess(data.message);
          }
        );
      });

      // รับ error จาก server
      room.onMessage("error", (data) => {
        console.warn(" Server message:", data.message);
        // Show notification to user via store
        import("@/src/presentation/stores/notificationStore").then(
          ({ showError }) => {
            showError(data.message);
          }
        );
      });

      // รับ pets sync จาก server
      room.onMessage("pets_synced", (data) => {
        console.log("🐾 Pets synced from server:", data);
        const { syncPetsFromServer } = useCharacterStore.getState();
        syncPetsFromServer(data);
      });

      // รับ pet action success จาก server
      room.onMessage("pet_action_success", (data) => {
        console.log("✅ Pet action success:", data);
        import("@/src/presentation/stores/notificationStore").then(
          ({ showSuccess }) => {
            showSuccess(data.message);
          }
        );
      });

      // รับ shop action success จาก server
      room.onMessage("shop_action_success", (data) => {
        console.log("🛒 Shop action success:", data);
        import("@/src/presentation/stores/notificationStore").then(
          ({ showSuccess }) => {
            showSuccess(data.message);
          }
        );
      });

      // รับ equipment action success จาก server
      room.onMessage("equipment_action_success", (data) => {
        console.log("⚔️ Equipment action success:", data);
        import("@/src/presentation/stores/notificationStore").then(
          ({ showSuccess }) => {
            showSuccess(data.message);
          }
        );
      });

      // Handle disconnect
      room.onLeave((code) => {
        console.log("👋 Left garden room:", code);
        setIsConnected(false);
        roomRef.current = null;
      });

      setIsConnected(true);
      console.log("✅ Connected to garden room");
    } catch (err) {
      console.error("❌ Failed to connect:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
      isConnectingRef.current = false;
    }
  }, [user, isConnected, isConnecting, roomId, createNew]);

  /**
   * Disconnect from room
   */
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
    }
    setIsConnected(false);
    setLocalPlayerId(null);
    setPlayers([]);
    setPlants([]);
    setObjects([]);
  }, []);

  /**
   * Send player input
   */
  const sendInput = useCallback(
    (input: { velocityX: number; velocityZ: number; direction: string }) => {
      if (!roomRef.current) return;

      roomRef.current.send("player_input", {
        ...input,
        sequenceNumber: inputSequenceRef.current++,
        timestamp: Date.now(),
      });
    },
    []
  );

  /**
   * Plant something
   */
  const plant = useCallback((type: string, x: number, z: number) => {
    if (!roomRef.current) return;
    roomRef.current.send("plant", { type, x, z });
  }, []);

  /**
   * Water a plant
   */
  const water = useCallback((plantId: string) => {
    if (!roomRef.current) return;
    roomRef.current.send("water", { plantId });
  }, []);

  /**
   * Harvest a plant
   */
  const harvest = useCallback((plantId: string) => {
    if (!roomRef.current) return;
    roomRef.current.send("harvest", { plantId });
  }, []);

  /**
   * Place an object
   */
  const placeObject = useCallback(
    (type: string, x: number, y: number, z: number, rotation = 0) => {
      if (!roomRef.current) return;
      roomRef.current.send("place_object", { type, x, y, z, rotation });
    },
    []
  );

  /**
   * Remove an object
   */
  const removeObject = useCallback((objectId: string) => {
    if (!roomRef.current) return;
    roomRef.current.send("remove_object", { objectId });
  }, []);

  // Auto-connect on mount (only once)
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - connect only once on mount

  // Disconnect on unmount (separate effect to avoid reconnection issues)
  useEffect(() => {
    return () => {
      // Only disconnect when component truly unmounts (e.g., leaving the game page)
      // Don't disconnect on every re-render
      if (roomRef.current) {
        console.log("🔌 Component unmounting - disconnecting from room");
        roomRef.current.leave();
        roomRef.current = null;
      }
    };
  }, []); // Empty deps - cleanup only on unmount

  return {
    isConnected,
    isConnecting,
    error,
    players,
    plants,
    objects,
    localPlayerId,
    dayTime,
    connect,
    disconnect,
    sendInput,
    plant,
    water,
    harvest,
    placeObject,
    removeObject,
  };
}
