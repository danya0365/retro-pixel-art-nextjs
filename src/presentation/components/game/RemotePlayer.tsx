"use client";

import type { GardenPlayer } from "@/src/presentation/hooks/useGardenRoom";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface RemotePlayerProps {
  player: GardenPlayer;
}

// Remote player animated character (red/orange theme)
function RemoteAnimatedCharacter({ isMoving }: { isMoving: boolean }) {
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const walkCycle = useRef(0);

  useFrame((_, delta) => {
    if (!leftLegRef.current || !rightLegRef.current) return;
    if (!leftArmRef.current || !rightArmRef.current) return;

    if (isMoving) {
      walkCycle.current += delta * 10;
      const swing = Math.sin(walkCycle.current) * 0.6;

      leftLegRef.current.rotation.x = swing;
      rightLegRef.current.rotation.x = -swing;
      leftArmRef.current.rotation.x = -swing * 0.7;
      rightArmRef.current.rotation.x = swing * 0.7;

      if (bodyRef.current) {
        bodyRef.current.position.y =
          1.0 + Math.abs(Math.sin(walkCycle.current * 2)) * 0.05;
      }
    } else {
      leftLegRef.current.rotation.x *= 0.9;
      rightLegRef.current.rotation.x *= 0.9;
      leftArmRef.current.rotation.x *= 0.9;
      rightArmRef.current.rotation.x *= 0.9;
      if (bodyRef.current) {
        bodyRef.current.position.y += (1.0 - bodyRef.current.position.y) * 0.1;
      }
      walkCycle.current = 0;
    }
  });

  return (
    <group>
      {/* Body */}
      <group ref={bodyRef} position={[0, 1.0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color="#d94a4a" /> {/* Red shirt */}
        </mesh>
        <mesh position={[0, 0.28, 0.05]} castShadow>
          <boxGeometry args={[0.25, 0.08, 0.15]} />
          <meshStandardMaterial color="#c93a3a" />
        </mesh>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.52, 0.08, 0.32]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* Head */}
      <group position={[0, 1.65, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.45, 0.4]} />
          <meshStandardMaterial color="#e0c8a0" />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.44, 0.15, 0.44]} />
          <meshStandardMaterial color="#2a2a2a" /> {/* Dark hair */}
        </mesh>
        <mesh position={[-0.1, 0.02, 0.21]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.1, 0.02, 0.21]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.35, 1.15, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#d94a4a" />
        </mesh>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.25, 0.16]} />
          <meshStandardMaterial color="#e0c8a0" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.35, 1.15, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#d94a4a" />
        </mesh>
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.25, 0.16]} />
          <meshStandardMaterial color="#e0c8a0" />
        </mesh>
      </group>

      {/* Legs */}
      <group ref={leftLegRef} position={[-0.12, 0.45, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.22]} />
          <meshStandardMaterial color="#3a3a3a" /> {/* Dark pants */}
        </mesh>
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[0, -0.72, 0.05]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.28]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.12, 0.45, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.22]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#3a3a3a" />
        </mesh>
        <mesh position={[0, -0.72, 0.05]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.28]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
    </group>
  );
}

export function RemotePlayer({ player }: RemotePlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(
    new THREE.Vector3(player.x, player.y, player.z)
  );
  const prevPosition = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const isMovingRef = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Update target position from server
    targetPosition.current.set(player.x, player.y, player.z);

    // Check if moving (position changed)
    const moved =
      targetPosition.current.distanceTo(prevPosition.current) > 0.01;
    isMovingRef.current = moved || player.isMoving;
    prevPosition.current.copy(targetPosition.current);

    // Lerp current position towards target
    const lerpFactor = 1 - Math.pow(0.001, delta);
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
      <RemoteAnimatedCharacter isMoving={player.isMoving} />

      {/* Name tag */}
      <Text
        position={[0, 2.4, 0]}
        fontSize={0.25}
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
        position={[0, 2.7, 0]}
        fontSize={0.35}
        anchorX="center"
        anchorY="middle"
      >
        {player.avatar}
      </Text>
    </group>
  );
}
