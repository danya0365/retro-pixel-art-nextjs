"use client";

import { RigidBody } from "@react-three/rapier";

const GROUND_SIZE = 32;

export function Ground() {
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
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (Math.random() - 0.5) * (GROUND_SIZE - 4);
        const z = (Math.random() - 0.5) * (GROUND_SIZE - 4);
        const scale = 0.5 + Math.random() * 0.5;
        return <GrassPatch key={i} position={[x, 0.01, z]} scale={scale} />;
      })}

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
  const color = grassColors[Math.floor(Math.random() * grassColors.length)];

  return (
    <group position={position} scale={scale}>
      {/* Multiple grass blades */}
      {Array.from({ length: 5 }).map((_, i) => {
        const offsetX = (Math.random() - 0.5) * 0.3;
        const offsetZ = (Math.random() - 0.5) * 0.3;
        const height = 0.1 + Math.random() * 0.15;
        const rotation = Math.random() * Math.PI * 2;

        return (
          <mesh
            key={i}
            position={[offsetX, height / 2, offsetZ]}
            rotation={[0, rotation, 0]}
          >
            <boxGeometry args={[0.05, height, 0.02]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}
