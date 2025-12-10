"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CameraControllerProps {
  target?: { x: number; y: number; z: number } | null;
  playerRotation?: number; // Player's facing direction
  isMoving?: boolean;
  cameraDistance?: number;
  cameraHeight?: number;
  smoothness?: number;
}

export function CameraController({
  target,
  playerRotation = 0,
  isMoving = false,
  cameraDistance = 12,
  cameraHeight = 8,
  smoothness = 0.05,
}: CameraControllerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const currentCameraAngle = useRef(Math.PI); // Start behind player
  const isUserRotating = useRef(false);
  const lastUserInteraction = useRef(0);

  useFrame(() => {
    if (!target || !controlsRef.current) return;

    // Smoothly interpolate target position (player position)
    const playerPos = new THREE.Vector3(target.x, target.y + 1, target.z);
    targetPosition.current.lerp(playerPos, smoothness * 2);

    // Update OrbitControls target
    controlsRef.current.target.copy(targetPosition.current);

    // Calculate desired camera angle
    // When player is moving, rotate camera behind them
    const timeSinceInteraction = Date.now() - lastUserInteraction.current;
    const shouldFollowPlayer = isMoving && timeSinceInteraction > 500;

    if (shouldFollowPlayer) {
      // Camera should be behind player (player rotation + PI)
      const desiredAngle = playerRotation + Math.PI;

      // Smoothly rotate camera angle
      let angleDiff = desiredAngle - currentCameraAngle.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      currentCameraAngle.current += angleDiff * smoothness * 2;
    }

    // Calculate camera position based on angle
    const cameraX =
      targetPosition.current.x +
      Math.sin(currentCameraAngle.current) * cameraDistance;
    const cameraZ =
      targetPosition.current.z +
      Math.cos(currentCameraAngle.current) * cameraDistance;
    const cameraY = targetPosition.current.y + cameraHeight;

    const desiredCameraPos = new THREE.Vector3(cameraX, cameraY, cameraZ);

    // Smoothly move camera
    camera.position.lerp(desiredCameraPos, smoothness);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.5}
      minDistance={5}
      maxDistance={30}
      enablePan={false}
      enableDamping
      dampingFactor={0.1}
      onStart={() => {
        isUserRotating.current = true;
        lastUserInteraction.current = Date.now();
      }}
      onEnd={() => {
        isUserRotating.current = false;
        lastUserInteraction.current = Date.now();
        // Update current angle based on where user rotated to
        if (target) {
          const dx = camera.position.x - target.x;
          const dz = camera.position.z - target.z;
          currentCameraAngle.current = Math.atan2(dx, dz);
        }
      }}
    />
  );
}
