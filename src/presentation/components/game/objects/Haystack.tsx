"use client";

import { RigidBody } from "@react-three/rapier";

interface HaystackProps {
  position: [number, number, number];
  size?: "small" | "medium" | "large";
}

export function Haystack({ position, size = "medium" }: HaystackProps) {
  const scale = size === "small" ? 0.6 : size === "large" ? 1.4 : 1;

  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <group scale={scale}>
        {/* Main hay body - rounded cone shape */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <coneGeometry args={[1, 1.4, 8]} />
          <meshStandardMaterial
            color="#d4a440"
            roughness={0.95}
            metalness={0}
          />
        </mesh>

        {/* Base layer */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.1, 1.2, 0.3, 8]} />
          <meshStandardMaterial
            color="#c49430"
            roughness={0.95}
            metalness={0}
          />
        </mesh>

        {/* Straw texture details */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.7, 0.5, Math.sin(angle) * 0.7]}
              rotation={[0.3, angle, 0]}
              castShadow
            >
              <boxGeometry args={[0.1, 0.4, 0.02]} />
              <meshStandardMaterial color="#e4b450" roughness={0.9} />
            </mesh>
          );
        })}
      </group>
    </RigidBody>
  );
}

interface HayBaleProps {
  position: [number, number, number];
  rotation?: number;
}

export function HayBale({ position, rotation = 0 }: HayBaleProps) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group rotation={[0, rotation, 0]}>
        {/* Main bale body */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.8, 0.8]} />
          <meshStandardMaterial
            color="#d4a440"
            roughness={0.95}
            metalness={0}
          />
        </mesh>

        {/* Binding ropes */}
        <mesh position={[0.3, 0.4, 0]}>
          <torusGeometry args={[0.42, 0.03, 8, 16]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[-0.3, 0.4, 0]}>
          <torusGeometry args={[0.42, 0.03, 8, 16]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      </group>
    </RigidBody>
  );
}
