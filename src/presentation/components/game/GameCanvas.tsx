"use client";

import type { User } from "@/src/domain/types/user";
import { soundService } from "@/src/infrastructure/audio/soundService";
import type {
  GardenPlayer,
  PlantedItem,
} from "@/src/presentation/hooks/useGardenRoom";
import { useHotbarStore } from "@/src/presentation/stores/hotbarStore";
import { Grid } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ButterflySwarm } from "./animals/Butterfly";
import { ChickenFlock } from "./animals/Chicken";
import { CameraController } from "./CameraController";
import { ParticleManager } from "./effects/ParticleEffects";
import { LocalPlayer } from "./LocalPlayer";
import { Bench } from "./objects/Bench";
import { FenceRow } from "./objects/Fence";
import { FlowerBed } from "./objects/Flower";
import { PlantedCrops } from "./objects/PlantedCrop";
import { StreetLamp } from "./objects/StreetLamp";
import { RemotePlayer } from "./RemotePlayer";
import { DayNightCycle } from "./world/DayNightCycle";
import { Ground } from "./world/Ground";
import { Trees } from "./world/Trees";

interface GameCanvasProps {
  user: User;
  players: GardenPlayer[];
  plants: PlantedItem[];
  localPlayerId: string | null;
  dayTime: number; // 0-24 hours
  onPlayerInput: (input: {
    velocityX: number;
    velocityZ: number;
    direction: string;
  }) => void;
  onPlant: (type: string, x: number, z: number) => void;
  onWater: (plantId: string) => void;
  onHarvest: (plantId: string) => void;
}

// Loading fallback for 3D scene
function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#c0c0c0" wireframe />
    </mesh>
  );
}

export function GameCanvas({
  user,
  players,
  plants,
  localPlayerId,
  dayTime,
  onPlayerInput,
  onPlant,
  onWater,
  onHarvest,
}: GameCanvasProps) {
  // Find local player from server state (match by clientId)
  const localPlayer = players.find((p) => p.clientId === localPlayerId);
  // Get remote players (everyone except local player)
  const remotePlayers = players.filter((p) => p.clientId !== localPlayerId);

  // Track player rotation and movement for camera
  const [playerRotation, setPlayerRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  // Start BGM based on day/night
  useEffect(() => {
    const bgmType = dayTime >= 6 && dayTime < 18 ? "day" : "night";
    if (!soundService.isBgmPlaying()) {
      soundService.startBgm(bgmType);
    }
    return () => {
      soundService.stopBgm();
    };
  }, []);

  // Particle effects state
  const [particleEffects, setParticleEffects] = useState<
    {
      id: number;
      position: [number, number, number];
      type: "plant" | "water" | "harvest";
    }[]
  >([]);
  const particleIdRef = { current: 0 };

  // Spawn particle effect
  const spawnEffect = useCallback(
    (x: number, z: number, type: "plant" | "water" | "harvest") => {
      const id = particleIdRef.current++;
      setParticleEffects((prev) => [
        ...prev,
        { id, position: [x, 0, z], type },
      ]);
    },
    []
  );

  // Remove completed effect
  const removeEffect = useCallback((id: number) => {
    setParticleEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Callback for LocalPlayer to report its state
  const handlePlayerStateChange = useCallback(
    (rotation: number, moving: boolean) => {
      setPlayerRotation(rotation);
      setIsMoving(moving);
    },
    []
  );

  // Get selected item from hotbar
  const getSelectedItem = useHotbarStore((state) => state.getSelectedItem);

  // Find nearest plant to position
  const findNearestPlant = (x: number, z: number) => {
    let nearest: PlantedItem | null = null;
    let minDist = 2; // Max interaction distance

    for (const plant of plants) {
      const dist = Math.sqrt(
        Math.pow(plant.x - x, 2) + Math.pow(plant.z - z, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = plant;
      }
    }
    return nearest;
  };

  // Handle action based on selected item
  const handleAction = (x: number, z: number) => {
    const selectedItem = getSelectedItem();
    if (!selectedItem) return;

    // Planting with seeds
    if (selectedItem.type === "seed" && selectedItem.plantType) {
      onPlant(selectedItem.plantType, x, z);
      spawnEffect(x, z, "plant");
      soundService.play("plant");
      return;
    }

    // Watering with watering can
    if (selectedItem.id === "watering_can") {
      const plant = findNearestPlant(x, z);
      if (plant) {
        onWater(plant.id);
        spawnEffect(plant.x, plant.z, "water");
        soundService.play("water");
      }
      return;
    }

    // Harvesting with hand (mature plants only)
    if (selectedItem.id === "hand") {
      const plant = findNearestPlant(x, z);
      if (plant && plant.growthStage >= 4) {
        onHarvest(plant.id);
        spawnEffect(plant.x, plant.z, "harvest");
        soundService.play("harvest");
      }
      return;
    }
  };

  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        camera={{
          position: [15, 15, 15],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "#87CEEB" }} // Sky blue background
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Day/Night Cycle - dynamic lighting based on time */}
          <DayNightCycle dayTime={dayTime} />

          {/* Physics World */}
          <Physics gravity={[0, -9.81, 0]}>
            {/* Ground */}
            <Ground />

            {/* Local Player (controlled by this client) */}
            {localPlayer && (
              <LocalPlayer
                user={user}
                serverPosition={{
                  x: localPlayer.x,
                  y: localPlayer.y,
                  z: localPlayer.z,
                }}
                onInput={onPlayerInput}
                onAction={handleAction}
                onStateChange={handlePlayerStateChange}
              />
            )}

            {/* Remote Players (synced from server) */}
            {remotePlayers.map((player) => (
              <RemotePlayer key={player.id} player={player} />
            ))}

            {/* Trees */}
            <Trees />

            {/* Planted Crops (from server) */}
            <PlantedCrops plants={plants} />

            {/* Decorations with collision */}
            {/* Fences around garden area */}
            <FenceRow start={[-8, 0, -8]} count={8} direction="x" />
            <FenceRow start={[-8, 0, 8]} count={8} direction="x" />
            <FenceRow start={[-8, 0, -8]} count={8} direction="z" />
            <FenceRow start={[8, 0, -8]} count={8} direction="z" />

            {/* Street lamps - turn on at night */}
            <StreetLamp
              position={[-6, 0, -6]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[6, 0, -6]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[-6, 0, 6]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[6, 0, 6]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />

            {/* Benches */}
            <Bench position={[4, 0, 0]} rotation={-Math.PI / 2} />
            <Bench position={[-4, 0, 0]} rotation={Math.PI / 2} />
          </Physics>

          {/* Decorations without collision (outside physics) */}
          {/* Flower beds */}
          <FlowerBed position={[5, 0, 5]} count={8} spread={1.5} />
          <FlowerBed position={[-5, 0, 5]} count={8} spread={1.5} />
          <FlowerBed position={[5, 0, -5]} count={6} spread={1} />
          <FlowerBed position={[-5, 0, -5]} count={6} spread={1} />

          {/* Particle Effects */}
          <ParticleManager
            effects={particleEffects}
            onEffectComplete={removeEffect}
          />

          {/* Animals */}
          <ChickenFlock center={[3, 0, 3]} count={3} spread={4} />
          <ButterflySwarm center={[0, 0, 0]} count={5} spread={8} />

          {/* Grid helper (for development) */}
          <Grid
            args={[32, 32]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#006400"
            sectionSize={8}
            sectionThickness={1}
            sectionColor="#228B22"
            fadeDistance={50}
            fadeStrength={1}
            followCamera={false}
            position={[0, 0.01, 0]}
          />

          {/* Camera Controller - follows local player */}
          <CameraController
            target={
              localPlayer
                ? { x: localPlayer.x, y: localPlayer.y, z: localPlayer.z }
                : null
            }
            playerRotation={playerRotation}
            isMoving={isMoving}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
