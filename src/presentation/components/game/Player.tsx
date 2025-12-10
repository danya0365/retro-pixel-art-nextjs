"use client";

import type { User } from "@/src/domain/types/user";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface PlayerProps {
  user: User;
}

// Movement speed
const MOVE_SPEED = 5;

export function Player({ user }: PlayerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          setKeys((prev) => ({ ...prev, forward: true }));
          break;
        case "KeyS":
        case "ArrowDown":
          setKeys((prev) => ({ ...prev, backward: true }));
          break;
        case "KeyA":
        case "ArrowLeft":
          setKeys((prev) => ({ ...prev, left: true }));
          break;
        case "KeyD":
        case "ArrowRight":
          setKeys((prev) => ({ ...prev, right: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          setKeys((prev) => ({ ...prev, forward: false }));
          break;
        case "KeyS":
        case "ArrowDown":
          setKeys((prev) => ({ ...prev, backward: false }));
          break;
        case "KeyA":
        case "ArrowLeft":
          setKeys((prev) => ({ ...prev, left: false }));
          break;
        case "KeyD":
        case "ArrowRight":
          setKeys((prev) => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Update player movement
  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const velocity = { x: 0, y: 0, z: 0 };

    if (keys.forward) velocity.z -= MOVE_SPEED;
    if (keys.backward) velocity.z += MOVE_SPEED;
    if (keys.left) velocity.x -= MOVE_SPEED;
    if (keys.right) velocity.x += MOVE_SPEED;

    // Get current velocity to preserve Y velocity (for gravity)
    const currentVel = rigidBodyRef.current.linvel();

    // Apply movement
    rigidBodyRef.current.setLinvel(
      { x: velocity.x, y: currentVel.y, z: velocity.z },
      true
    );

    // Rotate player to face movement direction
    if (velocity.x !== 0 || velocity.z !== 0) {
      const angle = Math.atan2(velocity.x, velocity.z);
      if (meshRef.current) {
        meshRef.current.rotation.y = angle;
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <CapsuleCollider args={[0.3, 0.3]} />

      {/* Player mesh - simple pixel art style character */}
      <group ref={meshRef}>
        {/* Body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial color="#4a90d9" /> {/* Blue shirt */}
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ffdbac" /> {/* Skin color */}
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.55, 0.2, 0.55]} />
          <meshStandardMaterial color="#8B4513" /> {/* Brown hair */}
        </mesh>

        {/* Legs */}
        <mesh position={[-0.15, -0.1, 0]} castShadow>
          <boxGeometry args={[0.25, 0.4, 0.35]} />
          <meshStandardMaterial color="#2d5a27" /> {/* Green pants */}
        </mesh>
        <mesh position={[0.15, -0.1, 0]} castShadow>
          <boxGeometry args={[0.25, 0.4, 0.35]} />
          <meshStandardMaterial color="#2d5a27" /> {/* Green pants */}
        </mesh>

        {/* Player name tag */}
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {user.nickname}
        </Text>

        {/* Avatar emoji above name */}
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.4}
          anchorX="center"
          anchorY="middle"
        >
          {user.avatar}
        </Text>
      </group>
    </RigidBody>
  );
}
