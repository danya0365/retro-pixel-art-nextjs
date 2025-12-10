"use client";

import { RigidBody } from "@react-three/rapier";

interface BenchProps {
  position: [number, number, number];
  rotation?: number;
}

export function Bench({ position, rotation = 0 }: BenchProps) {
  const [x, y, z] = position;

  return (
    <RigidBody type="fixed" position={[x, y, z]} rotation={[0, rotation, 0]}>
      <group>
        {/* Seat */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.2, 0.08, 0.4]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Back rest */}
        <mesh position={[0, 0.6, -0.15]} castShadow>
          <boxGeometry args={[1.2, 0.4, 0.06]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.45, 0.15, 0.1]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0.45, 0.15, 0.1]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[-0.45, 0.15, -0.1]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0.45, 0.15, -0.1]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* Arm rests */}
        <mesh position={[-0.55, 0.45, 0]} castShadow>
          <boxGeometry args={[0.06, 0.12, 0.3]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.55, 0.45, 0]} castShadow>
          <boxGeometry args={[0.06, 0.12, 0.3]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
    </RigidBody>
  );
}
