"use client";

import { RigidBody } from "@react-three/rapier";

interface CrateProps {
  position: [number, number, number];
  size?: "small" | "medium" | "large";
  variant?: number;
}

const CRATE_COLORS = ["#a08060", "#8B7355", "#9a8565", "#7a6545"];

export function Crate({ position, size = "medium", variant = 0 }: CrateProps) {
  const scale = size === "small" ? 0.6 : size === "large" ? 1.3 : 1;
  const color = CRATE_COLORS[variant % CRATE_COLORS.length];

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group scale={scale}>
        {/* Main crate body */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
        </mesh>

        {/* Wooden planks (horizontal) */}
        {[-0.25, 0, 0.25].map((y, i) => (
          <mesh key={`h-${i}`} position={[0, 0.15 + y + 0.4, 0.401]} castShadow>
            <boxGeometry args={[0.82, 0.12, 0.02]} />
            <meshStandardMaterial
              color={CRATE_COLORS[(variant + 1) % CRATE_COLORS.length]}
              roughness={0.85}
            />
          </mesh>
        ))}

        {/* Wooden planks (vertical frame) */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={`v-${i}`} position={[x, 0.4, 0.402]} castShadow>
            <boxGeometry args={[0.08, 0.82, 0.02]} />
            <meshStandardMaterial color="#5a4535" roughness={0.85} />
          </mesh>
        ))}

        {/* Corner reinforcements */}
        {[
          [-0.35, -0.35],
          [0.35, -0.35],
          [-0.35, 0.35],
          [0.35, 0.35],
        ].map(([x, z], i) => (
          <mesh key={`corner-${i}`} position={[x, 0.4, z]} castShadow>
            <boxGeometry args={[0.1, 0.82, 0.1]} />
            <meshStandardMaterial color="#6a5545" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

interface CrateStackProps {
  position: [number, number, number];
  layout?: "pyramid" | "tower" | "scattered";
}

export function CrateStack({ position, layout = "pyramid" }: CrateStackProps) {
  if (layout === "pyramid") {
    return (
      <group position={position}>
        {/* Bottom row */}
        <Crate position={[-0.45, 0, -0.45]} variant={0} />
        <Crate position={[0.45, 0, -0.45]} variant={1} />
        <Crate position={[-0.45, 0, 0.45]} variant={2} />
        <Crate position={[0.45, 0, 0.45]} variant={3} />
        {/* Top */}
        <Crate position={[0, 0.8, 0]} variant={0} />
      </group>
    );
  }

  if (layout === "tower") {
    return (
      <group position={position}>
        <Crate position={[0, 0, 0]} variant={0} />
        <Crate position={[0, 0.8, 0]} variant={1} />
        <Crate position={[0, 1.6, 0]} size="small" variant={2} />
      </group>
    );
  }

  // Scattered
  return (
    <group position={position}>
      <Crate position={[0, 0, 0]} variant={0} />
      <Crate position={[1.2, 0, 0.3]} size="small" variant={1} />
      <Crate position={[-0.8, 0, 0.8]} size="large" variant={2} />
    </group>
  );
}
