"use client";

import type { User } from "@/src/domain/types/user";
import { gameClient } from "@/src/infrastructure/colyseus/GameClient";
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
}: UseGardenRoomOptions): UseGardenRoomReturn {
  const roomRef = useRef<Room | null>(null);
  const inputSequenceRef = useRef(0);

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
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const room = await gameClient.joinOrCreateRoom("garden_room", {
        nickname: user.nickname,
        avatar: user.avatar,
      });

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
    }
  }, [user, isConnected, isConnecting]);

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

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, user.id]);

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
