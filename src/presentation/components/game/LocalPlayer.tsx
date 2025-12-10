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

// Animated Character with walking animation
function AnimatedCharacter({ isMoving }: { isMoving: boolean }) {
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
      // Walk cycle animation
      walkCycle.current += delta * 10; // Speed of walk cycle
      const swing = Math.sin(walkCycle.current) * 0.6; // Leg swing angle

      // Legs swing opposite to each other
      leftLegRef.current.rotation.x = swing;
      rightLegRef.current.rotation.x = -swing;

      // Arms swing opposite to legs
      leftArmRef.current.rotation.x = -swing * 0.7;
      rightArmRef.current.rotation.x = swing * 0.7;

      // Slight body bob
      if (bodyRef.current) {
        bodyRef.current.position.y =
          1.0 + Math.abs(Math.sin(walkCycle.current * 2)) * 0.05;
      }
    } else {
      // Idle - smoothly return to default pose
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
      {/* === BODY (Torso) === */}
      <group ref={bodyRef} position={[0, 1.0, 0]}>
        {/* Torso */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color="#4a90d9" /> {/* Blue shirt */}
        </mesh>

        {/* Shirt collar */}
        <mesh position={[0, 0.28, 0.05]} castShadow>
          <boxGeometry args={[0.25, 0.08, 0.15]} />
          <meshStandardMaterial color="#3a80c9" />
        </mesh>

        {/* Belt */}
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.52, 0.08, 0.32]} />
          <meshStandardMaterial color="#4a3a2a" /> {/* Brown belt */}
        </mesh>

        {/* Belt buckle */}
        <mesh position={[0, -0.28, 0.17]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.02]} />
          <meshStandardMaterial color="#d4a440" metalness={0.5} /> {/* Gold */}
        </mesh>
      </group>

      {/* === HEAD === */}
      <group position={[0, 1.65, 0]}>
        {/* Head */}
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.45, 0.4]} />
          <meshStandardMaterial color="#ffdbac" /> {/* Skin */}
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.44, 0.15, 0.44]} />
          <meshStandardMaterial color="#4a3020" /> {/* Brown hair */}
        </mesh>

        {/* Hair front */}
        <mesh position={[0, 0.1, 0.18]} castShadow>
          <boxGeometry args={[0.35, 0.1, 0.1]} />
          <meshStandardMaterial color="#4a3020" />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.1, 0.02, 0.21]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.1, 0.02, 0.21]}>
          <boxGeometry args={[0.06, 0.06, 0.02]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.1, 0.21]}>
          <boxGeometry args={[0.12, 0.03, 0.02]} />
          <meshStandardMaterial color="#c47070" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.22, 0, 0]} castShadow>
          <boxGeometry args={[0.06, 0.12, 0.08]} />
          <meshStandardMaterial color="#ffcb9c" />
        </mesh>
        <mesh position={[0.22, 0, 0]} castShadow>
          <boxGeometry args={[0.06, 0.12, 0.08]} />
          <meshStandardMaterial color="#ffcb9c" />
        </mesh>
      </group>

      {/* === LEFT ARM === */}
      <group ref={leftArmRef} position={[-0.35, 1.15, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#4a90d9" /> {/* Shirt sleeve */}
        </mesh>
        {/* Lower arm / hand */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.25, 0.16]} />
          <meshStandardMaterial color="#ffdbac" /> {/* Skin */}
        </mesh>
      </group>

      {/* === RIGHT ARM === */}
      <group ref={rightArmRef} position={[0.35, 1.15, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#4a90d9" />
        </mesh>
        {/* Lower arm / hand */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <boxGeometry args={[0.14, 0.25, 0.16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>

      {/* === LEFT LEG === */}
      <group ref={leftLegRef} position={[-0.12, 0.45, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.22]} />
          <meshStandardMaterial color="#3a5a8a" /> {/* Dark blue jeans */}
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#3a5a8a" />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.72, 0.05]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.28]} />
          <meshStandardMaterial color="#3a2a1a" /> {/* Brown shoe */}
        </mesh>
      </group>

      {/* === RIGHT LEG === */}
      <group ref={rightLegRef} position={[0.12, 0.45, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.22]} />
          <meshStandardMaterial color="#3a5a8a" />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.5, 0]} castShadow>
          <boxGeometry args={[0.18, 0.35, 0.2]} />
          <meshStandardMaterial color="#3a5a8a" />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.72, 0.05]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.28]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      </group>
    </group>
  );
}

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
        <AnimatedCharacter isMoving={keys.forward || keys.backward} />

        {/* Name tag */}
        <Text
          position={[0, 2.4, 0]}
          fontSize={0.25}
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
          position={[0, 2.7, 0]}
          fontSize={0.35}
          anchorX="center"
          anchorY="middle"
        >
          {user.avatar}
        </Text>
      </group>
    </RigidBody>
  );
}
