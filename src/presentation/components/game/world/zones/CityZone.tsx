"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

interface CityZoneProps {
  position: [number, number, number];
  size: number;
}

export function CityZone({ position, size }: CityZoneProps) {
  // Generate buildings
  const buildings = useMemo(() => {
    const result = [];
    const buildingCount = 4;
    const spacing = size / (buildingCount + 1);

    for (let i = 0; i < buildingCount; i++) {
      for (let j = 0; j < buildingCount; j++) {
        // Skip some positions for roads/paths
        if ((i === 1 || i === 2) && (j === 1 || j === 2)) continue;

        result.push({
          id: `building_${i}_${j}`,
          x: spacing * (i + 0.5),
          z: spacing * (j + 0.5),
          height: 3 + Math.random() * 5,
          width: 3 + Math.random() * 2,
          color: ["#8B4513", "#A0522D", "#CD853F", "#D2691E", "#BC8F8F"][
            Math.floor(Math.random() * 5)
          ],
          roofColor: ["#8B0000", "#A52A2A", "#B22222", "#DC143C"][
            Math.floor(Math.random() * 4)
          ],
        });
      }
    }
    return result;
  }, [size]);

  // Street lamps
  const streetLamps = useMemo(() => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      result.push({
        id: i,
        x: size / 4 + (i % 2) * (size / 2),
        z: size / 4 + Math.floor(i / 2) * (size / 2),
      });
    }
    return result;
  }, [size]);

  return (
    <group position={position}>
      {/* Cobblestone ground - visual only (collision from global ground) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[size / 2, 0, size / 2]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#696969" />
      </mesh>

      {/* Central plaza */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size / 2, 0.01, size / 2]}
        receiveShadow
      >
        <circleGeometry args={[6, 16]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Fountain in center */}
      <Fountain position={[size / 2, 0, size / 2]} />

      {/* Buildings */}
      {buildings.map((building) => (
        <House
          key={building.id}
          position={[building.x, 0, building.z]}
          height={building.height}
          width={building.width}
          color={building.color}
          roofColor={building.roofColor}
        />
      ))}

      {/* Street lamps */}
      {streetLamps.map((lamp) => (
        <CityStreetLamp key={lamp.id} position={[lamp.x, 0, lamp.z]} />
      ))}

      {/* Benches */}
      <CityBench
        position={[size / 2 + 4, 0, size / 2]}
        rotation={Math.PI / 2}
      />
      <CityBench
        position={[size / 2 - 4, 0, size / 2]}
        rotation={-Math.PI / 2}
      />
    </group>
  );
}

// House/Building component
function House({
  position,
  height,
  width,
  color,
  roofColor,
}: {
  position: [number, number, number];
  height: number;
  width: number;
  color: string;
  roofColor: string;
}) {
  return (
    <group position={position}>
      {/* Main building - WITH collision */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, width]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>

      {/* Roof - visual only */}
      <mesh position={[0, height + 0.8, 0]} castShadow>
        <coneGeometry args={[width * 0.8, 1.6, 4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* Door - visual only */}
      <mesh position={[0, 0.8, width / 2 + 0.01]} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.1]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      {/* Windows - visual only */}
      <mesh position={[width / 4, height / 2, width / 2 + 0.01]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[-width / 4, height / 2, width / 2 + 0.01]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* Chimney - visual only */}
      <mesh position={[width / 4, height + 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

// Fountain
function Fountain({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[2, 2.2, 0.6, 16]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      {/* Water */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.3, 16]} />
        <meshStandardMaterial color="#4a90d9" transparent opacity={0.7} />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
        <meshStandardMaterial color="#a0a0a0" />
      </mesh>
      {/* Top dish */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.5, 0.2, 8]} />
        <meshStandardMaterial color="#a0a0a0" />
      </mesh>
    </group>
  );
}

// City street lamp
function CityStreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
      {/* Lamp head */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
      {/* Light */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.5}
        distance={8}
        color="#ffcc88"
      />
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#ffffcc"
          emissive="#ffcc00"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

// City bench
function CityBench({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.7, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.5, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.6, 0.2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.4]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
      <mesh position={[0.6, 0.2, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.4]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
    </group>
  );
}
