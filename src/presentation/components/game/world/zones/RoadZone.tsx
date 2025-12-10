"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

interface RoadZoneProps {
  position: [number, number, number];
  size: number;
}

export function RoadZone({ position, size }: RoadZoneProps) {
  // Road markings (center line)
  const centerLines = useMemo(() => {
    const result = [];
    const lineLength = 3;
    const gap = 2;
    const count = Math.floor(size / (lineLength + gap));

    for (let i = 0; i < count; i++) {
      result.push({
        id: i,
        z: i * (lineLength + gap) + lineLength / 2,
      });
    }
    return result;
  }, [size]);

  // Street lamps along the road
  const lamps = useMemo(() => {
    const result = [];
    const spacing = 8;
    for (let i = 0; i < Math.floor(size / spacing); i++) {
      result.push({
        id: i,
        z: i * spacing + spacing / 2,
        side: i % 2 === 0 ? -1 : 1,
      });
    }
    return result;
  }, [size]);

  return (
    <group position={position}>
      {/* Grass on sides - visual only */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[4, 0, size / 2]}
      >
        <planeGeometry args={[8, size]} />
        <meshStandardMaterial color="#5c8a4a" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[size - 4, 0, size / 2]}
      >
        <planeGeometry args={[8, size]} />
        <meshStandardMaterial color="#5c8a4a" />
      </mesh>

      {/* Road surface - visual only */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[size / 2, 0.01, size / 2]}
      >
        <planeGeometry args={[size - 16, size]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>

      {/* Road edges (curb) */}
      <mesh position={[8, 0.1, size / 2]} castShadow>
        <boxGeometry args={[0.3, 0.2, size]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      <mesh position={[size - 8, 0.1, size / 2]} castShadow>
        <boxGeometry args={[0.3, 0.2, size]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Center line markings */}
      {centerLines.map((line) => (
        <mesh
          key={line.id}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[size / 2, 0.02, line.z]}
        >
          <planeGeometry args={[0.2, 3]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>
      ))}

      {/* Side line markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9, 0.02, size / 2]}>
        <planeGeometry args={[0.15, size]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[size - 9, 0.02, size / 2]}
      >
        <planeGeometry args={[0.15, size]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Street lamps */}
      {lamps.map((lamp) => (
        <RoadStreetLamp
          key={lamp.id}
          position={[lamp.side > 0 ? size - 6 : 6, 0, lamp.z]}
          facing={lamp.side}
        />
      ))}

      {/* Crosswalk */}
      <Crosswalk position={[size / 2, 0.02, size / 2]} width={size - 16} />

      {/* Traffic signs */}
      <TrafficSign position={[7, 0, 4]} type="stop" />
      <TrafficSign position={[size - 7, 0, size - 4]} type="yield" />
    </group>
  );
}

// Road street lamp
function RoadStreetLamp({
  position,
  facing = 1,
}: {
  position: [number, number, number];
  facing?: number;
}) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 5, 8]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
      {/* Arm */}
      <mesh position={[facing * 1, 4.8, 0]} castShadow>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial color="#2f2f2f" />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[facing * 1.8, 4.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.3]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      {/* Light */}
      <pointLight
        position={[facing * 1.8, 4.3, 0]}
        intensity={0.8}
        distance={12}
        color="#ffcc88"
      />
    </group>
  );
}

// Crosswalk
function Crosswalk({
  position,
  width,
}: {
  position: [number, number, number];
  width: number;
}) {
  const stripes = useMemo(() => {
    const result = [];
    const stripeWidth = 0.8;
    const gap = 0.5;
    const count = Math.floor(width / (stripeWidth + gap));

    for (let i = 0; i < count; i++) {
      result.push({
        id: i,
        x: -width / 2 + i * (stripeWidth + gap) + stripeWidth / 2,
      });
    }
    return result;
  }, [width]);

  return (
    <group position={position}>
      {stripes.map((stripe) => (
        <mesh
          key={stripe.id}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[stripe.x, 0, 0]}
        >
          <planeGeometry args={[0.8, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

// Traffic sign
function TrafficSign({
  position,
  type,
}: {
  position: [number, number, number];
  type: "stop" | "yield";
}) {
  const signColor = type === "stop" ? "#ff0000" : "#ffcc00";
  const signShape = type === "stop" ? 8 : 3;

  return (
    <group position={position}>
      {/* Pole with small collision */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.15, 2.4, 0.15]} />
          <meshStandardMaterial color="#808080" />
        </mesh>
      </RigidBody>
      {/* Sign - visual only */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.05, signShape]} />
        <meshStandardMaterial color={signColor} />
      </mesh>
      {/* Sign border - visual only */}
      <mesh position={[0, 2.5, 0.03]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.02, signShape]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
