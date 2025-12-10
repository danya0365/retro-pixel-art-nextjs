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
}: CameraControllerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const currentCameraAngle = useRef(Math.PI); // Start behind player
  const isUserRotating = useRef(false);
  const lastUserInteraction = useRef(0);

  // Camera limits (user can adjust when NOT moving)
  const minPolar = Math.PI / 6; // Min tilt
  const maxPolar = Math.PI / 2.5; // Max tilt
  const minDist = 8; // Min zoom
  const maxDist = 25; // Max zoom

  // Store user's camera settings (FIXED values, only update on user interaction end)
  const userDistance = useRef(cameraDistance);
  const userHeight = useRef(cameraHeight);

  // Helper to save current camera settings
  const saveCameraSettings = () => {
    if (!controlsRef.current) return;
    const offset = camera.position.clone().sub(controlsRef.current.target);
    userDistance.current = Math.sqrt(offset.x * offset.x + offset.z * offset.z);
    userHeight.current = offset.y;
    currentCameraAngle.current = Math.atan2(offset.x, offset.z);
  };

  useFrame((_, delta) => {
    if (!target || !controlsRef.current) return;

    // Smooth factor based on delta time (frame-rate independent)
    const lerpFactor = 1 - Math.pow(0.001, delta);

    // Always update OrbitControls target to follow player smoothly
    const playerPos = new THREE.Vector3(target.x, target.y + 1, target.z);
    targetPosition.current.lerp(playerPos, lerpFactor);
    controlsRef.current.target.copy(targetPosition.current);

    // When NOT moving - let OrbitControls handle camera freely
    if (!isMoving) {
      return;
    }

    // When MOVING - control camera position with FIXED distance/height
    const timeSinceInteraction = Date.now() - lastUserInteraction.current;
    const shouldRotateBehind = timeSinceInteraction > 500;

    if (shouldRotateBehind) {
      // Camera should rotate behind player (smooth rotation)
      const desiredAngle = playerRotation + Math.PI;
      let angleDiff = desiredAngle - currentCameraAngle.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      currentCameraAngle.current += angleDiff * lerpFactor * 0.5;
    }

    // Calculate desired camera position with FIXED distance/height
    const desiredX =
      targetPosition.current.x +
      Math.sin(currentCameraAngle.current) * userDistance.current;
    const desiredZ =
      targetPosition.current.z +
      Math.cos(currentCameraAngle.current) * userDistance.current;
    const desiredY = targetPosition.current.y + userHeight.current;

    // Smooth camera movement (prevents jitter)
    camera.position.x += (desiredX - camera.position.x) * lerpFactor;
    camera.position.y += (desiredY - camera.position.y) * lerpFactor;
    camera.position.z += (desiredZ - camera.position.z) * lerpFactor;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minPolarAngle={minPolar}
      maxPolarAngle={maxPolar}
      minDistance={minDist}
      maxDistance={maxDist}
      // Disable zoom/rotate when moving (useFrame controls camera)
      enableZoom={!isMoving}
      enableRotate={!isMoving}
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
        // Save camera settings when user finishes adjusting
        saveCameraSettings();
      }}
    />
  );
}
