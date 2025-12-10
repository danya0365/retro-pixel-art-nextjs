"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface SeaZoneProps {
  position: [number, number, number];
  size: number;
}

export function SeaZone({ position, size }: SeaZoneProps) {
  const waterRef = useRef<THREE.Mesh>(null);
  const waveOffset = useRef(Math.random() * Math.PI * 2);

  // Animate waves
  useFrame((state) => {
    if (waterRef.current) {
      const time = state.clock.elapsedTime + waveOffset.current;
      waterRef.current.position.y = -0.3 + Math.sin(time * 0.5) * 0.1;
    }
  });

  // Floating debris/seaweed
  const seaweed = useMemo(() => {
    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push({
        id: i,
        x: Math.random() * size,
        z: Math.random() * size,
      });
    }
    return result;
  }, [size]);

  return (
    <group position={position}>
      {/* Deep water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[size / 2, -1, size / 2]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#0a3d62" />
      </mesh>

      {/* Surface water with waves */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, -0.3, size / 2]}
      >
        <planeGeometry args={[size, size, 8, 8]} />
        <meshStandardMaterial
          color="#1a6ea8"
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Foam/waves on surface */}
      <WaveFoam position={[size / 4, -0.2, size / 4]} />
      <WaveFoam position={[(size * 3) / 4, -0.2, size / 2]} />
      <WaveFoam position={[size / 2, -0.2, (size * 3) / 4]} />

      {/* Seaweed patches */}
      {seaweed.map((s) => (
        <Seaweed key={s.id} position={[s.x, -0.8, s.z]} />
      ))}

      {/* Fish (simple swimming) */}
      <SwimmingFish position={[size / 2, -0.5, size / 2]} />
    </group>
  );
}

// Wave foam effect
function WaveFoam({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      ref.current.scale.z = 1 + Math.cos(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.5, 16]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
    </mesh>
  );
}

// Seaweed
function Seaweed({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.2) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position}>
      {[0, 0.1, -0.1].map((offset, i) => (
        <mesh key={i} position={[offset, 0.3, offset]}>
          <cylinderGeometry args={[0.03, 0.05, 0.6, 4]} />
          <meshStandardMaterial color="#2d5a27" />
        </mesh>
      ))}
    </group>
  );
}

// Simple swimming fish
function SwimmingFish({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const initialPos = useRef(position);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime;
      ref.current.position.x = initialPos.current[0] + Math.sin(time * 0.5) * 3;
      ref.current.position.z = initialPos.current[2] + Math.cos(time * 0.3) * 3;
      ref.current.rotation.y = Math.atan2(
        Math.cos(time * 0.5) * 0.5,
        -Math.sin(time * 0.3) * 0.3
      );
    }
  });

  return (
    <group ref={ref} position={position} scale={0.3}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#ff8c5a" />
      </mesh>
    </group>
  );
}
