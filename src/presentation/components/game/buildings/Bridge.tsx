"use client";

import { RigidBody } from "@react-three/rapier";

interface BridgeProps {
  position: [number, number, number];
  rotation?: number;
  length?: number;
}

export function Bridge({ position, rotation = 0, length = 8 }: BridgeProps) {
  const plankCount = Math.floor(length / 0.5);

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group rotation={[0, rotation, 0]}>
        {/* Main bridge deck */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, 0.2, 2.5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} metalness={0} />
        </mesh>

        {/* Bridge planks (visual detail) */}
        {Array.from({ length: plankCount }).map((_, i) => (
          <mesh
            key={i}
            position={[-length / 2 + 0.25 + i * 0.5, 0.41, 0]}
            castShadow
          >
            <boxGeometry args={[0.4, 0.02, 2.4]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#7B4513" : "#6B3503"}
              roughness={0.85}
            />
          </mesh>
        ))}

        {/* Side rails */}
        {[-1.15, 1.15].map((z, i) => (
          <group key={i}>
            {/* Rail posts */}
            {Array.from({ length: Math.floor(length / 2) + 1 }).map((_, j) => (
              <mesh key={j} position={[-length / 2 + j * 2, 0.7, z]} castShadow>
                <boxGeometry args={[0.15, 0.8, 0.15]} />
                <meshStandardMaterial color="#6B4423" roughness={0.9} />
              </mesh>
            ))}

            {/* Top rail */}
            <mesh position={[0, 1, z]} castShadow>
              <boxGeometry args={[length, 0.1, 0.1]} />
              <meshStandardMaterial color="#5B3413" roughness={0.85} />
            </mesh>

            {/* Bottom rail */}
            <mesh position={[0, 0.55, z]}>
              <boxGeometry args={[length, 0.08, 0.08]} />
              <meshStandardMaterial color="#5B3413" roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* Support beams underneath */}
        {[-length / 3, 0, length / 3].map((x, i) => (
          <mesh key={i} position={[x, 0.1, 0]} castShadow>
            <boxGeometry args={[0.3, 0.4, 2.8]} />
            <meshStandardMaterial color="#4a3010" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}
