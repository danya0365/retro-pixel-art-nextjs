"use client";

import { RigidBody } from "@react-three/rapier";

interface WellProps {
  position: [number, number, number];
}

export function Well({ position }: WellProps) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group>
        {/* Stone base (circular wall) */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 1, 1, 16]} />
          <meshStandardMaterial
            color="#7a7a7a"
            roughness={0.95}
            metalness={0}
          />
        </mesh>

        {/* Inner well (dark) */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.8, 16]} />
          <meshStandardMaterial color="#1a1a2a" roughness={0.9} />
        </mesh>

        {/* Water surface */}
        <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.65, 16]} />
          <meshStandardMaterial
            color="#2a5090"
            roughness={0.1}
            metalness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Stone rim */}
        <mesh position={[0, 1, 0]}>
          <torusGeometry args={[0.85, 0.15, 8, 16]} />
          <meshStandardMaterial color="#6a6a6a" roughness={0.9} />
        </mesh>

        {/* Wooden support posts */}
        {[
          [-0.7, 0, 0.7],
          [0.7, 0, 0.7],
        ].map(([x, _, z], i) => (
          <mesh key={i} position={[x, 1.5, z]} castShadow>
            <boxGeometry args={[0.15, 2, 0.15]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
        ))}

        {/* Roof beam */}
        <mesh position={[0, 2.5, 0.7]} castShadow>
          <boxGeometry args={[1.8, 0.15, 0.15]} />
          <meshStandardMaterial color="#6B4423" roughness={0.9} />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 2.8, 0.7]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[1.2, 0.8, 4]} />
          <meshStandardMaterial color="#654321" roughness={0.85} />
        </mesh>

        {/* Pulley mechanism */}
        <mesh position={[0, 2.4, 0.7]}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 12]} />
          <meshStandardMaterial
            color="#3a3a3a"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Rope */}
        <mesh position={[0, 1.5, 0.7]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
          <meshStandardMaterial color="#8a7a6a" roughness={0.95} />
        </mesh>

        {/* Bucket */}
        <mesh position={[0, 0.8, 0.7]} castShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.25, 8]} />
          <meshStandardMaterial color="#6B4423" roughness={0.85} />
        </mesh>

        {/* Crank handle */}
        <mesh position={[1, 2.4, 0.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
          <meshStandardMaterial
            color="#3a3a3a"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[1.2, 2.4, 0.7]}>
          <boxGeometry args={[0.08, 0.15, 0.08]} />
          <meshStandardMaterial color="#5B4413" roughness={0.85} />
        </mesh>
      </group>
    </RigidBody>
  );
}
