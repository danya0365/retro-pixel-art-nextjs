"use client";

import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface RiverZoneProps {
  position: [number, number, number];
  size: number;
}

export function RiverZone({ position, size }: RiverZoneProps) {
  const waterRef = useRef<THREE.Mesh>(null);

  // Animate water
  useFrame((state) => {
    if (waterRef.current) {
      const material = waterRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // Rocks along the river
  const rocks = useMemo(() => {
    const result = [];
    for (let i = 0; i < 8; i++) {
      result.push({
        id: i,
        x: Math.random() * size,
        z: (i % 2 === 0 ? 0.1 : 0.9) * size + (Math.random() - 0.5) * 3,
        scale: 0.3 + Math.random() * 0.5,
      });
    }
    return result;
  }, [size]);

  // Reeds/plants along the river
  const reeds = useMemo(() => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      result.push({
        id: i,
        x: Math.random() * size,
        z: Math.random() < 0.5 ? Math.random() * 3 : size - Math.random() * 3,
      });
    }
    return result;
  }, [size]);

  return (
    <group position={position}>
      {/* River banks (ground on sides) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[size / 2, 0, 2]}
      >
        <planeGeometry args={[size, 4]} />
        <meshStandardMaterial color="#5c8a4a" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[size / 2, 0, size - 2]}
      >
        <planeGeometry args={[size, 4]} />
        <meshStandardMaterial color="#5c8a4a" />
      </mesh>

      {/* River water */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, -0.2, size / 2]}
        receiveShadow
      >
        <planeGeometry args={[size, size - 8]} />
        <meshStandardMaterial
          color="#2a6ea8"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* River bed (darker below water) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, -0.5, size / 2]}
      >
        <planeGeometry args={[size, size - 8]} />
        <meshStandardMaterial color="#1a3d5c" />
      </mesh>

      {/* Bridge across the river */}
      <Bridge position={[size / 2, 0, size / 2]} length={size - 4} />

      {/* Rocks */}
      {rocks.map((rock) => (
        <RigidBody key={rock.id} type="fixed" colliders="ball">
          <mesh
            position={[rock.x, rock.scale * 0.3, rock.z]}
            castShadow
            scale={rock.scale}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#696969" roughness={0.9} />
          </mesh>
        </RigidBody>
      ))}

      {/* Reeds */}
      {reeds.map((reed) => (
        <Reed key={reed.id} position={[reed.x, 0, reed.z]} />
      ))}

      {/* Water lilies */}
      <WaterLily position={[size / 3, -0.15, size / 2]} />
      <WaterLily position={[(size * 2) / 3, -0.15, size / 2 + 2]} />
      <WaterLily position={[size / 2, -0.15, size / 2 - 1]} />
    </group>
  );
}

// Bridge component
function Bridge({
  position,
  length,
}: {
  position: [number, number, number];
  length: number;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group position={position} rotation={[0, Math.PI / 2, 0]}>
        {/* Main deck */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, 0.3, 3]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Railings */}
        {/* Left railing */}
        <group position={[0, 0.8, 1.3]}>
          {/* Posts */}
          {Array.from({ length: Math.floor(length / 2) }).map((_, i) => (
            <mesh
              key={`left_${i}`}
              position={[-length / 2 + i * 2 + 1, 0.3, 0]}
              castShadow
            >
              <boxGeometry args={[0.15, 0.8, 0.15]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          ))}
          {/* Rail */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[length, 0.1, 0.1]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>

        {/* Right railing */}
        <group position={[0, 0.8, -1.3]}>
          {/* Posts */}
          {Array.from({ length: Math.floor(length / 2) }).map((_, i) => (
            <mesh
              key={`right_${i}`}
              position={[-length / 2 + i * 2 + 1, 0.3, 0]}
              castShadow
            >
              <boxGeometry args={[0.15, 0.8, 0.15]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          ))}
          {/* Rail */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[length, 0.1, 0.1]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>

        {/* Support pillars */}
        <mesh position={[-length / 3, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
        <mesh position={[length / 3, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.5, 8]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      </group>
    </RigidBody>
  );
}

// Reed plant
function Reed({ position }: { position: [number, number, number] }) {
  const height = 0.8 + Math.random() * 0.4;

  return (
    <group position={position}>
      {/* Stems */}
      {[0, 0.05, -0.05].map((offset, i) => (
        <mesh key={i} position={[offset, height / 2, offset]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, height, 4]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
      {/* Fluffy top */}
      <mesh position={[0, height, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.03, 0.2, 6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    </group>
  );
}

// Water lily
function WaterLily({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Lily pad */}
      <mesh rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
        <circleGeometry args={[0.4, 8]} />
        <meshStandardMaterial color="#228B22" side={THREE.DoubleSide} />
      </mesh>
      {/* Flower */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <coneGeometry args={[0.15, 0.2, 8]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
    </group>
  );
}
