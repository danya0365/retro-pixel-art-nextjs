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
import { Barn, Bridge, SmallHouse, Well, Windmill } from "./buildings";
import { CameraController } from "./CameraController";
import { ParticleManager } from "./effects/ParticleEffects";
import { LocalPlayer } from "./LocalPlayer";
import { Barrel, BarrelStack } from "./objects/Barrel";
import { Bench } from "./objects/Bench";
import { Bush, BushRow } from "./objects/Bush";
import { Crate, CrateStack } from "./objects/Crate";
import { FenceRow } from "./objects/Fence";
import { FlowerBed } from "./objects/Flower";
import { HayBale, Haystack } from "./objects/Haystack";
import { Log, LogPile, TreeStump } from "./objects/Log";
import { PlantedCrops } from "./objects/PlantedCrop";
import { Rock, RockCluster } from "./objects/Rock";
import { StreetLamp } from "./objects/StreetLamp";
import { RemotePlayer } from "./RemotePlayer";
import { DayNightCycle } from "./world/DayNightCycle";
import { Ground, GROUND_SIZE } from "./world/Ground";
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
          position: [20, 20, 20],
          fov: 55,
          near: 0.1,
          far: 500,
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

            {/* ========== FARMLAND ZONE (Center) ========== */}
            {/* Fences around main farm area */}
            <FenceRow start={[-12, 0, -12]} count={12} direction="x" />
            <FenceRow start={[-12, 0, 12]} count={12} direction="x" />
            <FenceRow start={[-12, 0, -12]} count={12} direction="z" />
            <FenceRow start={[12, 0, -12]} count={12} direction="z" />

            {/* Street lamps around farm */}
            <StreetLamp
              position={[-10, 0, -10]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[10, 0, -10]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[-10, 0, 10]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[10, 0, 10]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />

            {/* Benches near farm */}
            <Bench position={[8, 0, 0]} rotation={-Math.PI / 2} />
            <Bench position={[-8, 0, 0]} rotation={Math.PI / 2} />

            {/* ========== VILLAGE ZONE (Right, around x=25) ========== */}
            {/* Buildings */}
            <Barn position={[30, 0, 5]} rotation={-Math.PI / 2} />
            <SmallHouse
              position={[22, 0, -8]}
              rotation={Math.PI / 4}
              variant="cottage"
            />
            <SmallHouse position={[28, 0, -5]} rotation={0} variant="shop" />
            <SmallHouse
              position={[35, 0, -10]}
              rotation={-Math.PI / 6}
              variant="tavern"
            />
            <Well position={[25, 0, 0]} />
            <Windmill position={[35, 0, 12]} />

            {/* Village decorations */}
            <BarrelStack position={[32, 0, 2]} />
            <Barrel position={[23, 0, -3]} />
            <CrateStack position={[28, 0, 8]} layout="pyramid" />
            <Crate position={[20, 0, 5]} size="medium" />
            <HayBale position={[33, 0, 8]} rotation={0.3} />
            <HayBale position={[34, 0, 7]} rotation={-0.2} />
            <Haystack position={[30, 0, -2]} size="large" />

            {/* Village street lamps */}
            <StreetLamp
              position={[22, 0, 3]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[30, 0, -3]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
            <StreetLamp
              position={[26, 0, 10]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />

            {/* Village benches */}
            <Bench position={[24, 0, 5]} rotation={0} />
            <Bench position={[28, 0, -8]} rotation={Math.PI} />

            {/* ========== FOREST ZONE (Left, around x=-25) ========== */}
            {/* Forest decorations */}
            <RockCluster position={[-28, 0, -5]} count={4} spread={3} />
            <RockCluster position={[-22, 0, 8]} count={3} spread={2} />
            <Rock position={[-30, 0, 3]} size="large" />
            <Rock position={[-25, 0, -10]} size="medium" />

            <BushRow
              start={[-35, 0, -8]}
              count={6}
              spacing={2.5}
              direction="z"
            />
            <BushRow start={[-20, 0, -5]} count={4} spacing={2} direction="z" />
            <Bush position={[-26, 0, 12]} variant={1} scale={1.2} />
            <Bush position={[-32, 0, -2]} variant={2} />

            <LogPile position={[-24, 0, 5]} count={6} />
            <Log position={[-30, 0, 10]} rotation={0.5} length={2.5} />
            <Log position={[-27, 0, -8]} rotation={-0.3} />
            <TreeStump position={[-22, 0, -2]} height={0.6} />
            <TreeStump position={[-33, 0, 8]} height={0.4} />

            {/* Forest bench (rest spot) */}
            <Bench position={[-25, 0, 0]} rotation={Math.PI / 2} />

            {/* ========== LAKE ZONE (Top, around z=-28) ========== */}
            {/* Bridge over river */}
            <Bridge
              position={[-10, 0, -28]}
              rotation={Math.PI / 6}
              length={10}
            />

            {/* Lake decorations */}
            <Rock position={[5, 0, -22]} size="large" variant={2} />
            <Rock position={[-5, 0, -24]} size="medium" variant={1} />
            <RockCluster position={[12, 0, -30]} count={3} spread={2} />

            <Bush position={[8, 0, -20]} variant={0} />
            <Bush position={[-8, 0, -22]} variant={1} />
            <BushRow
              start={[-12, 0, -35]}
              count={5}
              spacing={3}
              direction="x"
            />

            {/* Lake benches (fishing spots) */}
            <Bench position={[0, 0, -18]} rotation={0} />
            <Bench position={[10, 0, -25]} rotation={-Math.PI / 4} />

            {/* Lake street lamp */}
            <StreetLamp
              position={[0, 0, -20]}
              lightOn={dayTime < 6 || dayTime >= 18}
            />
          </Physics>

          {/* Decorations without collision (outside physics) */}
          {/* Flower beds - Farmland */}
          <FlowerBed position={[8, 0, 8]} count={10} spread={2} />
          <FlowerBed position={[-8, 0, 8]} count={10} spread={2} />
          <FlowerBed position={[8, 0, -8]} count={8} spread={1.5} />
          <FlowerBed position={[-8, 0, -8]} count={8} spread={1.5} />

          {/* Flower beds - Village */}
          <FlowerBed position={[24, 0, -5]} count={6} spread={1} />
          <FlowerBed position={[20, 0, 8]} count={8} spread={1.5} />

          {/* Flower beds - Lake */}
          <FlowerBed position={[-5, 0, -20]} count={5} spread={1} />
          <FlowerBed position={[5, 0, -20]} count={5} spread={1} />

          {/* Particle Effects */}
          <ParticleManager
            effects={particleEffects}
            onEffectComplete={removeEffect}
          />

          {/* Animals - spread across zones */}
          {/* Farm chickens */}
          <ChickenFlock center={[5, 0, 5]} count={4} spread={6} />
          {/* Village chickens */}
          <ChickenFlock center={[28, 0, 3]} count={3} spread={5} />
          {/* Forest area */}
          <ChickenFlock center={[-20, 0, 5]} count={2} spread={4} />

          {/* Butterflies across the map */}
          <ButterflySwarm center={[0, 0, 0]} count={6} spread={12} />
          <ButterflySwarm center={[-25, 0, 5]} count={4} spread={8} />
          <ButterflySwarm center={[25, 0, 0]} count={3} spread={6} />
          <ButterflySwarm center={[0, 0, -25]} count={4} spread={10} />

          {/* Grid helper - expanded for larger map */}
          <Grid
            args={[GROUND_SIZE, GROUND_SIZE]}
            cellSize={2}
            cellThickness={0.3}
            cellColor="#006400"
            sectionSize={10}
            sectionThickness={0.8}
            sectionColor="#228B22"
            fadeDistance={80}
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
