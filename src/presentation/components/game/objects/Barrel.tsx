"use client";

import { RigidBody } from "@react-three/rapier";

interface BarrelProps {
  position: [number, number, number];
  variant?: "wood" | "metal";
}

export function Barrel({ position, variant = "wood" }: BarrelProps) {
  const bodyColor = variant === "wood" ? "#8B4513" : "#4a4a5a";
  const bandColor = variant === "wood" ? "#3a3a3a" : "#2a2a3a";

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group>
        {/* Barrel body */}
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.35, 1.2, 12]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.85}
            metalness={variant === "metal" ? 0.3 : 0}
          />
        </mesh>

        {/* Metal bands */}
        {[0.15, 0.6, 1.05].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry
              args={[0.38 - Math.abs(y - 0.6) * 0.05, 0.03, 8, 24]}
            />
            <meshStandardMaterial
              color={bandColor}
              roughness={0.6}
              metalness={0.5}
            />
          </mesh>
        ))}

        {/* Lid */}
        <mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 12]} />
          <meshStandardMaterial
            color={variant === "wood" ? "#6B4423" : "#3a3a4a"}
            roughness={0.8}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}

interface BarrelStackProps {
  position: [number, number, number];
}

export function BarrelStack({ position }: BarrelStackProps) {
  return (
    <group position={position}>
      {/* Bottom row */}
      <Barrel position={[-0.5, 0, 0]} />
      <Barrel position={[0.5, 0, 0]} />

      {/* Top barrel (lying down) */}
      <RigidBody type="fixed" colliders="cuboid">
        <group position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.35, 0.3, 1, 12]} />
            <meshStandardMaterial color="#7B4513" roughness={0.85} />
          </mesh>
          {[0.15, 0.5, 0.85].map((x, i) => (
            <mesh
              key={i}
              position={[x - 0.5, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[0.33, 0.025, 8, 24]} />
              <meshStandardMaterial
                color="#3a3a3a"
                roughness={0.6}
                metalness={0.5}
              />
            </mesh>
          ))}
        </group>
      </RigidBody>
    </group>
  );
}
