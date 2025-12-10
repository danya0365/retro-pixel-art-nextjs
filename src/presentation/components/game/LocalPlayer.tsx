"use client";

import type { User } from "@/src/domain/types/user";
import { soundService } from "@/src/infrastructure/audio/soundService";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface LocalPlayerProps {
  user: User;
  serverPosition: { x: number; y: number; z: number };
  onInput: (input: {
    velocityX: number;
    velocityZ: number;
    direction: string;
  }) => void;
  onAction?: (x: number, z: number) => void;
  onStateChange?: (rotation: number, isMoving: boolean) => void;
}

const MOVE_SPEED = 5;
const ROTATION_SPEED = 10; // How fast player rotates to face movement direction

export function LocalPlayer({
  user,
  serverPosition,
  onInput,
  onAction,
  onStateChange,
}: LocalPlayerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Group>(null);
  const playerRotation = useRef(0); // Current player rotation
  const targetRotation = useRef(0); // Target rotation based on movement
  const footstepTimer = useRef(0); // Timer for footstep sounds

  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const [direction, setDirection] = useState("down");

  // Handle E key for action (plant/water/harvest based on selected item)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && onAction && rigidBodyRef.current) {
        const pos = rigidBodyRef.current.translation();
        // Action in front of player based on current rotation
        const offset = 1.5;
        const rotation = playerRotation.current;
        const actionX = pos.x + Math.sin(rotation) * offset;
        const actionZ = pos.z + Math.cos(rotation) * offset;

        onAction(Math.round(actionX), Math.round(actionZ));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onAction]);

  // Sync with server position when it changes significantly
  useEffect(() => {
    if (!rigidBodyRef.current) return;

    const currentPos = rigidBodyRef.current.translation();
    const dx = Math.abs(currentPos.x - serverPosition.x);
    const dz = Math.abs(currentPos.z - serverPosition.z);

    // If server position is too different, teleport to it (reconciliation)
    if (dx > 2 || dz > 2) {
      rigidBodyRef.current.setTranslation(
        { x: serverPosition.x, y: serverPosition.y + 0.5, z: serverPosition.z },
        true
      );
    }
  }, [serverPosition]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          setKeys((prev) => ({ ...prev, forward: true }));
          setDirection("up");
          break;
        case "KeyS":
        case "ArrowDown":
          setKeys((prev) => ({ ...prev, backward: true }));
          setDirection("down");
          break;
        case "KeyA":
        case "ArrowLeft":
          setKeys((prev) => ({ ...prev, left: true }));
          setDirection("left");
          break;
        case "KeyD":
        case "ArrowRight":
          setKeys((prev) => ({ ...prev, right: true }));
          setDirection("right");
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

  // Track previous input to detect changes
  const prevInput = useRef({ velocityX: 0, velocityZ: 0 });
  const inputThrottle = useRef(0);

  // Update player movement and send input to server
  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    // Input for forward/backward movement
    let inputZ = 0;

    // A/D = rotate player left/right
    if (keys.left) {
      targetRotation.current += delta * ROTATION_SPEED * 0.5;
    }
    if (keys.right) {
      targetRotation.current -= delta * ROTATION_SPEED * 0.5;
    }

    // Smoothly rotate player towards target
    if (meshRef.current) {
      const currentRot = playerRotation.current;
      const targetRot = targetRotation.current;

      // Handle angle wrapping
      let diff = targetRot - currentRot;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      // Lerp rotation
      playerRotation.current += diff * Math.min(delta * ROTATION_SPEED, 1);
      meshRef.current.rotation.y = playerRotation.current;
    }

    // W/S = move forward/backward in player's facing direction
    let velocityX = 0;
    let velocityZ = 0;

    if (keys.forward) inputZ = -1;
    if (keys.backward) inputZ = 1;

    if (inputZ !== 0) {
      // Move in the direction the player is facing
      velocityX = Math.sin(playerRotation.current) * -inputZ;
      velocityZ = Math.cos(playerRotation.current) * -inputZ;
    }

    // Send input to server when velocity changes OR throttled updates while moving
    const hasChanged =
      prevInput.current.velocityX !== velocityX ||
      prevInput.current.velocityZ !== velocityZ;

    inputThrottle.current++;

    // Send on change OR every 6 frames (~10Hz) while moving
    if (
      hasChanged ||
      (inputThrottle.current >= 6 && (velocityX !== 0 || velocityZ !== 0))
    ) {
      onInput({ velocityX, velocityZ, direction });
      prevInput.current = { velocityX, velocityZ };
      inputThrottle.current = 0;
    }

    // Apply local movement
    const currentVel = rigidBodyRef.current.linvel();
    rigidBodyRef.current.setLinvel(
      { x: velocityX * MOVE_SPEED, y: currentVel.y, z: velocityZ * MOVE_SPEED },
      true
    );

    // Report state to camera controller
    const isCurrentlyMoving = velocityX !== 0 || velocityZ !== 0;
    onStateChange?.(playerRotation.current, isCurrentlyMoving);

    // Play footstep sounds while moving
    if (isCurrentlyMoving) {
      footstepTimer.current += delta;
      // Play footstep every 0.35 seconds while moving
      if (footstepTimer.current >= 0.35) {
        soundService.play("footstep");
        footstepTimer.current = 0;
      }
    } else {
      footstepTimer.current = 0;
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[serverPosition.x, serverPosition.y + 0.5, serverPosition.z]}
      enabledRotations={[false, false, false]}
      linearDamping={0.5}
      angularDamping={0.5}
    >
      <CapsuleCollider args={[0.3, 0.3]} />

      <group ref={meshRef}>
        {/* Body */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshStandardMaterial color="#4a90d9" />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.55, 0.2, 0.55]} />
          <meshStandardMaterial color="#8B4513" />
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
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {user.nickname}
        </Text>

        {/* Avatar emoji */}
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
