"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

const GROUND_SIZE = 32;

export function Ground() {
  // Memoize grass patch positions to prevent re-randomizing on every render
  const grassPatches = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * (GROUND_SIZE - 4),
        z: (Math.random() - 0.5) * (GROUND_SIZE - 4),
        scale: 0.5 + Math.random() * 0.5,
      })),
    []
  );

  return (
    <RigidBody type="fixed" colliders="cuboid">
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE, 32, 32]} />
        <meshStandardMaterial
          color="#7cba5f" // Grass green
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Decorative grass patches */}
      {grassPatches.map((patch) => (
        <GrassPatch
          key={patch.id}
          position={[patch.x, 0.01, patch.z]}
          scale={patch.scale}
        />
      ))}

      {/* Dirt path */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[2, 20]} />
        <meshStandardMaterial
          color="#8B7355" // Dirt brown
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Small pond */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[8, 0.03, -6]}
        receiveShadow
      >
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial
          color="#4a90d9"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </RigidBody>
  );
}

// Simple grass patch decoration
function GrassPatch({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const grassColors = ["#5a9a3a", "#4a8a2a", "#6aba4a", "#3a7a1a"];

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
    [] // eslint-disable-line react-hooks/exhaustive-deps
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
