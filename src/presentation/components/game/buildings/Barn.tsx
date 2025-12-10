"use client";

import { RigidBody } from "@react-three/rapier";

interface BarnProps {
  position: [number, number, number];
  rotation?: number;
}

export function Barn({ position, rotation = 0 }: BarnProps) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group rotation={[0, rotation, 0]}>
        {/* Main barn body */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 4, 5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} metalness={0} />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 4.5, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[4.5, 2, 4]} />
          <meshStandardMaterial color="#654321" roughness={0.85} />
        </mesh>

        {/* Roof overhang */}
        <mesh position={[0, 3.9, 0]}>
          <boxGeometry args={[6.5, 0.2, 5.5]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
        </mesh>

        {/* Front door (large barn door) */}
        <mesh position={[0, 1.5, 2.51]} castShadow>
          <boxGeometry args={[2.5, 3, 0.1]} />
          <meshStandardMaterial color="#4a2a0a" roughness={0.85} />
        </mesh>

        {/* Door frame */}
        <mesh position={[0, 1.5, 2.52]}>
          <boxGeometry args={[2.7, 3.2, 0.05]} />
          <meshStandardMaterial color="#3a1a00" roughness={0.9} />
        </mesh>

        {/* Door handle */}
        <mesh position={[0.8, 1.5, 2.6]}>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>

        {/* Windows */}
        {[-1.5, 1.5].map((x, i) => (
          <mesh key={i} position={[x, 2.5, 2.51]} castShadow>
            <boxGeometry args={[0.8, 0.8, 0.1]} />
            <meshStandardMaterial
              color="#87CEEB"
              transparent
              opacity={0.7}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* Window frames */}
        {[-1.5, 1.5].map((x, i) => (
          <group key={`frame-${i}`} position={[x, 2.5, 2.52]}>
            <mesh>
              <boxGeometry args={[0.9, 0.1, 0.05]} />
              <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.1, 0.9, 0.05]} />
              <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Hay loft opening */}
        <mesh position={[0, 3.2, 2.51]}>
          <boxGeometry args={[1.2, 0.8, 0.1]} />
          <meshStandardMaterial color="#2a1a00" roughness={0.9} />
        </mesh>

        {/* Side decorative beams */}
        {[-2.8, 2.8].map((x, i) => (
          <mesh key={`beam-${i}`} position={[x, 2, 0]} castShadow>
            <boxGeometry args={[0.2, 4, 0.2]} />
            <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
          </mesh>
        ))}

        {/* Weathervane on top */}
        <mesh position={[0, 5.7, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <meshStandardMaterial
            color="#3a3a3a"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0.2, 5.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.15, 0.4, 4]} />
          <meshStandardMaterial
            color="#8B4513"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
