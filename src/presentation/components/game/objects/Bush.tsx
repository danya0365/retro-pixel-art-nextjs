"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

interface BushProps {
  position: [number, number, number];
  variant?: number;
  scale?: number;
}

const BUSH_COLORS = [
  "#3a8a2a", // Dark green
  "#4a9a3a", // Medium green
  "#2a7a1a", // Forest green
  "#5aaa4a", // Light green
];

const BERRY_COLORS = ["#ff4040", "#ff6060", "#8040ff", "#4080ff"];

export function Bush({ position, variant = 0, scale = 1 }: BushProps) {
  const color = BUSH_COLORS[variant % BUSH_COLORS.length];
  const hasBerries = variant % 3 === 0;
  const berryColor = BERRY_COLORS[variant % BERRY_COLORS.length];

  return (
    <RigidBody type="fixed" position={position} colliders="ball">
      <group scale={scale}>
        {/* Main bush body - spherical clump */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
        </mesh>

        {/* Additional clumps */}
        <mesh position={[0.3, 0.4, 0.2]} castShadow>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial
            color={BUSH_COLORS[(variant + 1) % BUSH_COLORS.length]}
            roughness={0.8}
            metalness={0}
          />
        </mesh>

        <mesh position={[-0.25, 0.35, 0.15]} castShadow>
          <sphereGeometry args={[0.35, 8, 8]} />
          <meshStandardMaterial
            color={BUSH_COLORS[(variant + 2) % BUSH_COLORS.length]}
            roughness={0.8}
            metalness={0}
          />
        </mesh>

        <mesh position={[0, 0.7, -0.2]} castShadow>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
        </mesh>

        {/* Berries */}
        {hasBerries && (
          <>
            <mesh position={[0.4, 0.6, 0.3]} castShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={berryColor} />
            </mesh>
            <mesh position={[-0.3, 0.5, 0.2]} castShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={berryColor} />
            </mesh>
            <mesh position={[0.1, 0.7, -0.1]} castShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={berryColor} />
            </mesh>
          </>
        )}
      </group>
    </RigidBody>
  );
}

interface BushRowProps {
  start: [number, number, number];
  count?: number;
  spacing?: number;
  direction?: "x" | "z";
}

export function BushRow({
  start,
  count = 5,
  spacing = 2,
  direction = "x",
}: BushRowProps) {
  const bushes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: direction === "x" ? i * spacing : 0,
      z: direction === "z" ? i * spacing : 0,
      variant: Math.floor(Math.random() * BUSH_COLORS.length),
      scale: 0.8 + Math.random() * 0.4,
    }));
  }, [count, spacing, direction]);

  return (
    <group position={start}>
      {bushes.map((bush) => (
        <Bush
          key={bush.id}
          position={[bush.x, 0, bush.z]}
          variant={bush.variant}
          scale={bush.scale}
        />
      ))}
    </group>
  );
}
