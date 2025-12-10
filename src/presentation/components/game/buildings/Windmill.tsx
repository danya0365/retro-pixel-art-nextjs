"use client";

import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import type { Group } from "three";

interface WindmillProps {
  position: [number, number, number];
}

export function Windmill({ position }: WindmillProps) {
  const bladesRef = useRef<Group>(null);

  // Animate windmill blades
  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z -= delta * 0.3;
    }
  });

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group>
        {/* Tower base (octagonal) */}
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 3, 6, 8]} />
          <meshStandardMaterial color="#d4c4a0" roughness={0.9} metalness={0} />
        </mesh>

        {/* Tower top section */}
        <mesh position={[0, 6.5, 0]} castShadow>
          <cylinderGeometry args={[2, 2.5, 1, 8]} />
          <meshStandardMaterial color="#c4b490" roughness={0.9} />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 7.8, 0]} castShadow>
          <coneGeometry args={[2.5, 2, 8]} />
          <meshStandardMaterial color="#654321" roughness={0.85} />
        </mesh>

        {/* Door */}
        <mesh position={[0, 1.2, 3.01]} castShadow>
          <boxGeometry args={[1.2, 2.4, 0.1]} />
          <meshStandardMaterial color="#4a2a0a" roughness={0.85} />
        </mesh>

        {/* Door arch */}
        <mesh position={[0, 2.4, 3.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.1, 8, 8, Math.PI]} />
          <meshStandardMaterial color="#3a1a00" roughness={0.9} />
        </mesh>

        {/* Windows */}
        {[3, 5].map((y, i) => (
          <group key={i}>
            <mesh position={[2.4, y, 0.8]} castShadow>
              <boxGeometry args={[0.1, 0.6, 0.6]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-2.4, y, 0.8]} castShadow>
              <boxGeometry args={[0.1, 0.6, 0.6]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
            </mesh>
          </group>
        ))}

        {/* Blade hub */}
        <mesh position={[0, 5.5, 2.8]}>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 12]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
        </mesh>

        {/* Rotating blades */}
        <group ref={bladesRef} position={[0, 5.5, 3]}>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              {/* Blade arm */}
              <mesh position={[0, 2.5, 0]} castShadow>
                <boxGeometry args={[0.3, 5, 0.1]} />
                <meshStandardMaterial color="#8B4513" roughness={0.85} />
              </mesh>
              {/* Blade sail */}
              <mesh position={[0.4, 2.5, 0.05]} castShadow>
                <boxGeometry args={[0.8, 4.5, 0.05]} />
                <meshStandardMaterial
                  color="#f5f5dc"
                  roughness={0.7}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* Decorative stone base */}
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <cylinderGeometry args={[3.5, 3.8, 0.3, 8]} />
          <meshStandardMaterial color="#7a7a7a" roughness={0.95} />
        </mesh>
      </group>
    </RigidBody>
  );
}
