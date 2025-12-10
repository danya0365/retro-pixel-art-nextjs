"use client";

import { RigidBody } from "@react-three/rapier";

interface StreetLampProps {
  position: [number, number, number];
  lightOn?: boolean;
  lightColor?: string;
  lightIntensity?: number;
}

export function StreetLamp({
  position,
  lightOn = true,
  lightColor = "#FFE4B5",
  lightIntensity = 2,
}: StreetLampProps) {
  const [x, y, z] = position;

  return (
    <RigidBody type="fixed" position={[x, y, z]}>
      <group>
        {/* Pole */}
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 2, 8]} />
          <meshStandardMaterial
            color="#2F2F2F"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Pole base */}
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.1, 8]} />
          <meshStandardMaterial
            color="#1F1F1F"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Lamp arm */}
        <mesh position={[0.15, 1.9, 0]} castShadow>
          <boxGeometry args={[0.3, 0.04, 0.04]} />
          <meshStandardMaterial
            color="#2F2F2F"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Lamp housing */}
        <mesh position={[0.25, 1.8, 0]} castShadow>
          <boxGeometry args={[0.2, 0.15, 0.15]} />
          <meshStandardMaterial
            color="#3F3F3F"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Lamp bulb */}
        <mesh position={[0.25, 1.7, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={lightOn ? lightColor : "#444"}
            emissive={lightOn ? lightColor : "#000"}
            emissiveIntensity={lightOn ? 0.5 : 0}
          />
        </mesh>

        {/* Point light */}
        {lightOn && (
          <pointLight
            position={[0.25, 1.6, 0]}
            color={lightColor}
            intensity={lightIntensity}
            distance={8}
            decay={2}
            castShadow
          />
        )}
      </group>
    </RigidBody>
  );
}
