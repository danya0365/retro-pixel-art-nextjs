"use client";

import type { GardenPlayer } from "@/src/presentation/hooks/useGardenRoom";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface RemotePlayerProps {
  player: GardenPlayer;
}

export function RemotePlayer({ player }: RemotePlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(
    new THREE.Vector3(player.x, player.y, player.z)
  );

  // Smoothly interpolate to server position
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Update target position from server
    targetPosition.current.set(player.x, player.y, player.z);

    // Lerp current position towards target (faster interpolation)
    const lerpFactor = 1 - Math.pow(0.001, delta); // Smooth time-based lerp
    groupRef.current.position.lerp(targetPosition.current, lerpFactor);

    // Update rotation based on direction
    const directionAngles: Record<string, number> = {
      up: 0,
      down: Math.PI,
      left: Math.PI / 2,
      right: -Math.PI / 2,
    };
    const targetAngle = directionAngles[player.direction] || 0;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetAngle,
      lerpFactor
    );
  });

  return (
    <group ref={groupRef} position={[player.x, player.y, player.z]}>
      {/* Body - Different color for remote players */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#d94a4a" /> {/* Red for other players */}
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.55, 0.2, 0.55]} />
        <meshStandardMaterial color="#2d2d2d" /> {/* Dark hair for variety */}
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, -0.1, 0]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.35]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      <mesh position={[0.15, -0.1, 0]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.35]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      {/* Name tag */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.3}
        color="yellow"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {player.nickname}
      </Text>

      {/* Avatar emoji */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.4}
        anchorX="center"
        anchorY="middle"
      >
        {player.avatar}
      </Text>
    </group>
  );
}
