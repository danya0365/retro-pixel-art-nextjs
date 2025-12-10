"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

// ขยาย map จาก 32 → 80 units
export const GROUND_SIZE = 80;

// Zone definitions
const ZONES = {
  farmland: { center: [0, 0], radius: 15, color: "#8B7355" }, // ตรงกลาง - ดินทำฟาร์ม
  forest: { center: [-25, 0], radius: 18, color: "#2d5a27" }, // ซ้าย - ป่า
  village: { center: [25, 0], radius: 16, color: "#a08060" }, // ขวา - หมู่บ้าน
  lake: { center: [0, -28], radius: 14, color: "#4a90d9" }, // บน - ทะเลสาบ
};

export function Ground() {
  // Memoize grass patch positions - เพิ่มเป็น 300 patches
  const grassPatches = useMemo(() => {
    const patches = [];
    const halfSize = GROUND_SIZE / 2 - 4;

    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * 2 * halfSize;
      const z = (Math.random() - 0.5) * 2 * halfSize;

      // Skip lake area
      const distToLake = Math.sqrt(
        Math.pow(x - ZONES.lake.center[0], 2) +
          Math.pow(z - ZONES.lake.center[1], 2)
      );
      if (distToLake < ZONES.lake.radius + 2) continue;

      patches.push({
        id: i,
        x,
        z,
        scale: 0.5 + Math.random() * 0.5,
        variant: Math.floor(Math.random() * 3),
      });
    }
    return patches;
  }, []);

  // Random terrain color variations
  const terrainPatches = useMemo(() => {
    const patches = [];
    const halfSize = GROUND_SIZE / 2 - 2;

    for (let i = 0; i < 80; i++) {
      const x = (Math.random() - 0.5) * 2 * halfSize;
      const z = (Math.random() - 0.5) * 2 * halfSize;

      // Skip lake area
      const distToLake = Math.sqrt(
        Math.pow(x - ZONES.lake.center[0], 2) +
          Math.pow(z - ZONES.lake.center[1], 2)
      );
      if (distToLake < ZONES.lake.radius + 3) continue;

      patches.push({
        id: i,
        x,
        z,
        size: 2 + Math.random() * 4,
        color: ["#6aaa4f", "#5a9a3f", "#7cba5f", "#4a8a2f"][
          Math.floor(Math.random() * 4)
        ],
      });
    }
    return patches;
  }, []);

  return (
    <RigidBody type="fixed" colliders="cuboid">
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE, 64, 64]} />
        <meshStandardMaterial
          color="#7cba5f" // Grass green
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Terrain color variations */}
      {terrainPatches.map((patch) => (
        <mesh
          key={`terrain-${patch.id}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[patch.x, 0.005, patch.z]}
          receiveShadow
        >
          <circleGeometry args={[patch.size, 16]} />
          <meshStandardMaterial
            color={patch.color}
            roughness={0.85}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Farmland Zone (center) - tilled soil area */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ZONES.farmland.center[0], 0.01, ZONES.farmland.center[1]]}
        receiveShadow
      >
        <circleGeometry args={[ZONES.farmland.radius, 32]} />
        <meshStandardMaterial
          color={ZONES.farmland.color}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Forest Zone floor (left) - darker grass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ZONES.forest.center[0], 0.008, ZONES.forest.center[1]]}
        receiveShadow
      >
        <circleGeometry args={[ZONES.forest.radius, 32]} />
        <meshStandardMaterial
          color={ZONES.forest.color}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Village Zone floor (right) - dirt/cobblestone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ZONES.village.center[0], 0.01, ZONES.village.center[1]]}
        receiveShadow
      >
        <circleGeometry args={[ZONES.village.radius, 32]} />
        <meshStandardMaterial
          color={ZONES.village.color}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* Decorative grass patches */}
      {grassPatches.map((patch) => (
        <GrassPatch
          key={patch.id}
          position={[patch.x, 0.01, patch.z]}
          scale={patch.scale}
          variant={patch.variant}
        />
      ))}

      {/* === PATHS === */}
      {/* Main North-South road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[3, 50]} />
        <meshStandardMaterial color="#9a8060" roughness={0.9} metalness={0} />
      </mesh>

      {/* East-West road to Village */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[12, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[28, 3]} />
        <meshStandardMaterial color="#9a8060" roughness={0.9} metalness={0} />
      </mesh>

      {/* West road to Forest */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-12, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[28, 2.5]} />
        <meshStandardMaterial color="#6a5a40" roughness={0.95} metalness={0} />
      </mesh>

      {/* Path to Lake */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, -18]}
        receiveShadow
      >
        <planeGeometry args={[2.5, 20]} />
        <meshStandardMaterial color="#7a6a50" roughness={0.9} metalness={0} />
      </mesh>

      {/* === LAKE === */}
      {/* Lake - main body */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ZONES.lake.center[0], 0.03, ZONES.lake.center[1]]}
        receiveShadow
      >
        <circleGeometry args={[ZONES.lake.radius, 48]} />
        <meshStandardMaterial
          color="#4a90d9"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Lake shore (sand ring) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[ZONES.lake.center[0], 0.015, ZONES.lake.center[1]]}
        receiveShadow
      >
        <ringGeometry args={[ZONES.lake.radius, ZONES.lake.radius + 2, 48]} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.9} metalness={0} />
      </mesh>

      {/* Small river from lake */}
      <mesh
        rotation={[-Math.PI / 2, Math.PI / 6, 0]}
        position={[-10, 0.025, -32]}
        receiveShadow
      >
        <planeGeometry args={[4, 20]} />
        <meshStandardMaterial
          color="#4a90d9"
          roughness={0.15}
          metalness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Small pond near forest */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-30, 0.03, 10]}
        receiveShadow
      >
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial
          color="#3a80c9"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </RigidBody>
  );
}

// Grass color palettes for different zones
const GRASS_PALETTES = [
  ["#5a9a3a", "#4a8a2a", "#6aba4a", "#3a7a1a"], // Normal grass
  ["#3a7a2a", "#2a6a1a", "#4a8a3a", "#1a5a0a"], // Forest (darker)
  ["#7aba5a", "#6aaa4a", "#8aca6a", "#5a9a3a"], // Village (lighter)
];

// Simple grass patch decoration
function GrassPatch({
  position,
  scale = 1,
  variant = 0,
}: {
  position: [number, number, number];
  scale?: number;
  variant?: number;
}) {
  const grassColors = GRASS_PALETTES[variant % GRASS_PALETTES.length];

  // Memoize grass blades to prevent re-randomizing
  const blades = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        offsetX: (Math.random() - 0.5) * 0.3,
        offsetZ: (Math.random() - 0.5) * 0.3,
        height: 0.1 + Math.random() * 0.15,
        rotation: Math.random() * Math.PI * 2,
        color: grassColors[Math.floor(Math.random() * grassColors.length)],
      })),
    [grassColors]
  );

  return (
    <group position={position} scale={scale}>
      {/* Multiple grass blades */}
      {blades.map((blade) => (
        <mesh
          key={blade.id}
          position={[blade.offsetX, blade.height / 2, blade.offsetZ]}
          rotation={[0, blade.rotation, 0]}
        >
          <boxGeometry args={[0.05, blade.height, 0.02]} />
          <meshStandardMaterial color={blade.color} />
        </mesh>
      ))}
    </group>
  );
}
