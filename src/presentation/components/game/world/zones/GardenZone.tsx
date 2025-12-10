"use client";

import { useMemo } from "react";

interface GardenZoneProps {
  position: [number, number, number];
  size: number;
}

export function GardenZone({ position, size }: GardenZoneProps) {
  // Generate garden plots and decorations
  const plots = useMemo(() => {
    const result = [];
    const plotSize = 4;
    const gap = 1;
    const plotsPerRow = Math.floor(size / (plotSize + gap)) - 1;

    for (let z = 0; z < plotsPerRow; z++) {
      for (let x = 0; x < plotsPerRow; x++) {
        result.push({
          id: `plot_${x}_${z}`,
          x: x * (plotSize + gap) + 2,
          z: z * (plotSize + gap) + 2,
        });
      }
    }
    return result;
  }, [size]);

  const flowers = useMemo(() => {
    const result = [];
    for (let i = 0; i < 15; i++) {
      result.push({
        id: i,
        x: Math.random() * (size - 2) + 1,
        z: Math.random() * (size - 2) + 1,
        color: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#FF69B4", "#87CEEB"][
          Math.floor(Math.random() * 5)
        ],
      });
    }
    return result;
  }, [size]);

  return (
    <group position={position}>
      {/* Grass ground - visual only (collision from global ground) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[size / 2, 0, size / 2]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#7cba5f" />
      </mesh>

      {/* Garden plots (farm areas) */}
      {plots.map((plot) => (
        <group key={plot.id} position={[plot.x, 0.01, plot.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[4, 4]} />
            <meshStandardMaterial color="#5c4033" />
          </mesh>
          {/* Plot border */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.8, 2, 4]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
        </group>
      ))}

      {/* Decorative flowers */}
      {flowers.map((flower) => (
        <group key={flower.id} position={[flower.x, 0, flower.z]}>
          {/* Stem */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          {/* Bloom */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={flower.color} />
          </mesh>
        </group>
      ))}

      {/* Garden fence */}
      <GardenFence size={size} />

      {/* Scarecrow */}
      <Scarecrow position={[size / 2, 0, size / 2]} />
    </group>
  );
}

// Garden fence around perimeter
function GardenFence({ size }: { size: number }) {
  const posts = useMemo(() => {
    const result = [];
    const spacing = 4;

    // Four sides
    for (let i = 0; i <= size; i += spacing) {
      // North
      result.push({ x: i, z: 0, rotation: 0 });
      // South
      result.push({ x: i, z: size, rotation: 0 });
      // East
      result.push({ x: size, z: i, rotation: Math.PI / 2 });
      // West
      result.push({ x: 0, z: i, rotation: Math.PI / 2 });
    }
    return result;
  }, [size]);

  return (
    <group>
      {posts.map((post, i) => (
        <group
          key={i}
          position={[post.x, 0, post.z]}
          rotation={[0, post.rotation, 0]}
        >
          {/* Post */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Rail */}
          <mesh position={[1, 0.4, 0]} castShadow>
            <boxGeometry args={[2, 0.08, 0.05]} />
            <meshStandardMaterial color="#A0522D" />
          </mesh>
          <mesh position={[1, 0.7, 0]} castShadow>
            <boxGeometry args={[2, 0.08, 0.05]} />
            <meshStandardMaterial color="#A0522D" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Scarecrow decoration
function Scarecrow({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Arms */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[0.3, 0.4, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Shirt */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshStandardMaterial color="#B22222" />
      </mesh>
    </group>
  );
}
