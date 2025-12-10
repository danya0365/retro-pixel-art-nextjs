"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CityZone } from "./zones/CityZone";
import { GardenZone } from "./zones/GardenZone";
import { RiverZone } from "./zones/RiverZone";
import { RoadZone } from "./zones/RoadZone";
import { SeaZone } from "./zones/SeaZone";

// Debug flag - set to false to disable logs
const DEBUG = false;
function debugLog(...args: unknown[]) {
  if (DEBUG) console.log("[WorldManager]", ...args);
}

// Chunk size in world units
const CHUNK_SIZE = 32;
// How many chunks to render around player (render distance)
const RENDER_DISTANCE = 2;
// Total world size in chunks
const WORLD_SIZE = 8; // 8x8 chunks = 256x256 units

// Zone types for different areas
export type ZoneType =
  | "garden"
  | "city"
  | "river"
  | "sea"
  | "road"
  | "forest"
  | "beach";

interface Chunk {
  id: string;
  x: number;
  z: number;
  zoneType: ZoneType;
}

// World map layout (8x8 chunks)
// Each cell represents a chunk type
const WORLD_MAP: ZoneType[][] = [
  ["sea", "sea", "sea", "beach", "beach", "sea", "sea", "sea"],
  ["sea", "beach", "beach", "forest", "forest", "beach", "beach", "sea"],
  ["beach", "forest", "river", "river", "river", "river", "forest", "beach"],
  ["forest", "garden", "garden", "road", "road", "city", "city", "forest"],
  ["forest", "garden", "garden", "road", "road", "city", "city", "forest"],
  ["beach", "forest", "river", "river", "river", "river", "forest", "beach"],
  ["sea", "beach", "beach", "forest", "forest", "beach", "beach", "sea"],
  ["sea", "sea", "sea", "beach", "beach", "sea", "sea", "sea"],
];

// Get zone type for a specific chunk position
function getZoneType(chunkX: number, chunkZ: number): ZoneType {
  // Normalize to world map indices
  const mapX = Math.floor(chunkX + WORLD_SIZE / 2);
  const mapZ = Math.floor(chunkZ + WORLD_SIZE / 2);

  // Clamp to valid range
  if (mapX < 0 || mapX >= WORLD_SIZE || mapZ < 0 || mapZ >= WORLD_SIZE) {
    return "sea"; // Default to sea for out of bounds
  }

  return WORLD_MAP[mapZ][mapX];
}

// Generate all possible chunks
function generateWorldChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  const halfWorld = WORLD_SIZE / 2;

  for (let z = -halfWorld; z < halfWorld; z++) {
    for (let x = -halfWorld; x < halfWorld; x++) {
      chunks.push({
        id: `chunk_${x}_${z}`,
        x,
        z,
        zoneType: getZoneType(x, z),
      });
    }
  }

  return chunks;
}

interface WorldManagerProps {
  playerPosition: { x: number; y: number; z: number } | null;
}

export function WorldManager({ playerPosition }: WorldManagerProps) {
  const { camera } = useThree();
  const frustum = useRef(new THREE.Frustum());
  const projScreenMatrix = useRef(new THREE.Matrix4());
  const lastPlayerChunk = useRef({ x: Infinity, z: Infinity }); // Force first update
  const isFirstRender = useRef(true);

  // Generate all chunks once
  const allChunks = useMemo(() => generateWorldChunks(), []);

  // Initialize with chunks around (0,0) - where player spawns
  const [visibleChunks, setVisibleChunks] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
      for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
        initial.add(`chunk_${x}_${z}`);
      }
    }
    debugLog("Initial visible chunks:", initial.size);
    return initial;
  });

  // Log on first render
  useEffect(() => {
    if (isFirstRender.current) {
      debugLog("WorldManager mounted");
      debugLog("All chunks generated:", allChunks.length);
      debugLog("Player position:", playerPosition);
      isFirstRender.current = false;
    }
  }, [allChunks.length, playerPosition]);

  // Update visible chunks based on player position and camera frustum
  useFrame(() => {
    if (!playerPosition) return;

    // Get player's current chunk
    const playerChunkX = Math.floor(playerPosition.x / CHUNK_SIZE);
    const playerChunkZ = Math.floor(playerPosition.z / CHUNK_SIZE);

    // Only update if player moved to a new chunk
    if (
      playerChunkX === lastPlayerChunk.current.x &&
      playerChunkZ === lastPlayerChunk.current.z
    ) {
      return;
    }

    debugLog(
      "Player moved to chunk:",
      playerChunkX,
      playerChunkZ,
      "World pos:",
      playerPosition.x.toFixed(1),
      playerPosition.z.toFixed(1)
    );
    lastPlayerChunk.current = { x: playerChunkX, z: playerChunkZ };

    // Update frustum for culling
    projScreenMatrix.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.current.setFromProjectionMatrix(projScreenMatrix.current);

    // Find chunks within render distance
    const newVisibleChunks = new Set<string>();

    for (
      let z = playerChunkZ - RENDER_DISTANCE;
      z <= playerChunkZ + RENDER_DISTANCE;
      z++
    ) {
      for (
        let x = playerChunkX - RENDER_DISTANCE;
        x <= playerChunkX + RENDER_DISTANCE;
        x++
      ) {
        const chunkId = `chunk_${x}_${z}`;

        // Create bounding box for chunk
        const chunkCenter = new THREE.Vector3(
          x * CHUNK_SIZE + CHUNK_SIZE / 2,
          0,
          z * CHUNK_SIZE + CHUNK_SIZE / 2
        );

        const chunkBox = new THREE.Box3(
          new THREE.Vector3(x * CHUNK_SIZE, -10, z * CHUNK_SIZE),
          new THREE.Vector3((x + 1) * CHUNK_SIZE, 50, (z + 1) * CHUNK_SIZE)
        );

        // Check if chunk is in frustum or within minimum distance
        const distanceToPlayer = Math.sqrt(
          Math.pow(playerChunkX - x, 2) + Math.pow(playerChunkZ - z, 2)
        );

        if (distanceToPlayer <= 1 || frustum.current.intersectsBox(chunkBox)) {
          newVisibleChunks.add(chunkId);
        }
      }
    }

    debugLog("Visible chunks updated:", newVisibleChunks.size);
    setVisibleChunks(newVisibleChunks);
  });

  // Render only visible chunks
  const chunksToRender = useMemo(() => {
    return allChunks.filter((chunk) => visibleChunks.has(chunk.id));
  }, [allChunks, visibleChunks]);

  return (
    <group>
      {/* GLOBAL GROUND COLLISION - covers entire world */}
      {/* Ground top at Y=0, player spawns at Y=1.0, capsule bottom at ~Y=0.4 */}
      <RigidBody type="fixed" colliders="cuboid" name="global-ground">
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry
            args={[WORLD_SIZE * CHUNK_SIZE, 1, WORLD_SIZE * CHUNK_SIZE]}
          />
          <meshStandardMaterial color="#3d3d3d" visible={false} />
        </mesh>
      </RigidBody>

      {/* Render visible zone chunks (visual only - collision from global ground) */}
      {chunksToRender.map((chunk) => (
        <ChunkRenderer key={chunk.id} chunk={chunk} />
      ))}
    </group>
  );
}

// Render a single chunk based on its zone type
function ChunkRenderer({ chunk }: { chunk: Chunk }) {
  const position: [number, number, number] = [
    chunk.x * CHUNK_SIZE,
    0,
    chunk.z * CHUNK_SIZE,
  ];

  switch (chunk.zoneType) {
    case "garden":
      return <GardenZone position={position} size={CHUNK_SIZE} />;
    case "city":
      return <CityZone position={position} size={CHUNK_SIZE} />;
    case "river":
      return <RiverZone position={position} size={CHUNK_SIZE} />;
    case "sea":
      return <SeaZone position={position} size={CHUNK_SIZE} />;
    case "road":
      return <RoadZone position={position} size={CHUNK_SIZE} />;
    case "forest":
      return <ForestZone position={position} size={CHUNK_SIZE} />;
    case "beach":
      return <BeachZone position={position} size={CHUNK_SIZE} />;
    default:
      return <GardenZone position={position} size={CHUNK_SIZE} />;
  }
}

// Simple Forest Zone (visual only - collision handled by global ground)
function ForestZone({
  position,
  size,
}: {
  position: [number, number, number];
  size: number;
}) {
  const trees = useMemo(() => {
    const result = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      result.push({
        id: i,
        x: Math.random() * (size - 4) + 2,
        z: Math.random() * (size - 4) + 2,
        scale: 0.8 + Math.random() * 0.4,
      });
    }
    return result;
  }, [size]);

  return (
    <group position={position}>
      {/* Ground visual */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, 0, size / 2]}
        receiveShadow
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      {/* Trees - visual only for now (no collision to avoid blocking player) */}
      {trees.map((tree) => (
        <group key={tree.id} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 4, 0]} castShadow>
            <coneGeometry args={[2, 4, 8]} />
            <meshStandardMaterial color="#1a4a1a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Simple Beach Zone (visual only - collision handled by global ground)
function BeachZone({
  position,
  size,
}: {
  position: [number, number, number];
  size: number;
}) {
  return (
    <group position={position}>
      {/* Sand ground visual */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, 0, size / 2]}
        receiveShadow
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#f4d59e" />
      </mesh>

      {/* Palm tree - visual only */}
      <group position={[size / 4, 0, size / 4]}>
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 4, 6]} />
          <meshStandardMaterial color="#8b6914" />
        </mesh>
        <mesh position={[0, 4.5, 0]} castShadow>
          <sphereGeometry args={[1.5, 8, 8]} />
          <meshStandardMaterial color="#228b22" />
        </mesh>
      </group>
    </group>
  );
}
