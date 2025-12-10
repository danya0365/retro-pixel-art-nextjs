"use client";

import { RigidBody } from "@react-three/rapier";

interface FenceProps {
  position: [number, number, number];
  rotation?: number;
  variant?: "horizontal" | "vertical" | "corner";
}

export function Fence({
  position,
  rotation = 0,
  variant = "horizontal",
}: FenceProps) {
  const [x, y, z] = position;

  return (
    <RigidBody type="fixed" position={[x, y, z]} rotation={[0, rotation, 0]}>
      <group>
        {/* Fence posts */}
        <mesh position={[-0.4, 0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.4, 0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Horizontal rails */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.06]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.9, 0.08, 0.06]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>

        {variant === "corner" && (
          <>
            {/* Corner piece - perpendicular rails */}
            <mesh
              position={[0.4, 0.45, 0.4]}
              castShadow
              rotation={[0, Math.PI / 2, 0]}
            >
              <boxGeometry args={[0.8, 0.08, 0.06]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>
            <mesh
              position={[0.4, 0.25, 0.4]}
              castShadow
              rotation={[0, Math.PI / 2, 0]}
            >
              <boxGeometry args={[0.8, 0.08, 0.06]} />
              <meshStandardMaterial color="#A0522D" />
            </mesh>
          </>
        )}
      </group>
    </RigidBody>
  );
}

// Pre-defined fence configurations
export function FenceRow({
  start,
  count,
  direction = "x",
}: {
  start: [number, number, number];
  count: number;
  direction?: "x" | "z";
}) {
  const fences = [];
  const [sx, sy, sz] = start;

  for (let i = 0; i < count; i++) {
    const pos: [number, number, number] =
      direction === "x" ? [sx + i, sy, sz] : [sx, sy, sz + i];

    fences.push(
      <Fence
        key={`fence-${pos.join("-")}`}
        position={pos}
        rotation={direction === "z" ? Math.PI / 2 : 0}
      />
    );
  }

  return <>{fences}</>;
}
