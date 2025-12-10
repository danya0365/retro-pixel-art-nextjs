"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CameraControllerProps {
  target?: { x: number; y: number; z: number } | null;
  offset?: [number, number, number];
  smoothness?: number;
}

export function CameraController({
  target,
  offset = [10, 10, 10],
  smoothness = 0.05,
}: CameraControllerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const cameraOffset = useRef(new THREE.Vector3(...offset));

  useFrame(() => {
    if (!target || !controlsRef.current) return;

    // Smoothly interpolate target position
    targetPosition.current.lerp(
      new THREE.Vector3(target.x, target.y + 1, target.z),
      smoothness
    );

    // Update OrbitControls target
    controlsRef.current.target.copy(targetPosition.current);

    // Calculate desired camera position (target + offset)
    const desiredCameraPos = targetPosition.current
      .clone()
      .add(cameraOffset.current);

    // Smoothly move camera
    camera.position.lerp(desiredCameraPos, smoothness * 0.5);
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
      onChange={() => {
        // Update offset when user manually rotates camera
        if (target && controlsRef.current) {
          const newOffset = camera.position
            .clone()
            .sub(new THREE.Vector3(target.x, target.y + 1, target.z));
          cameraOffset.current.copy(newOffset);
        }
      }}
    />
  );
}
