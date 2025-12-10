"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface ButterflyProps {
  position: [number, number, number];
  color?: string;
  speed?: number;
}

export function Butterfly({
  position,
  color = "#FFB6C1",
  speed = 1,
}: ButterflyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  // Random flight pattern parameters
  const flightParams = useMemo(
    () => ({
      radiusX: 2 + Math.random() * 3,
      radiusZ: 2 + Math.random() * 3,
      heightVariation: 0.5 + Math.random() * 1,
      phaseOffset: Math.random() * Math.PI * 2,
      speedMultiplier: 0.5 + Math.random() * 0.5,
    }),
    []
  );

  // Use ref instead of state to avoid re-renders every frame
  const time = useRef(flightParams.phaseOffset);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Update time (using ref to avoid re-render)
    time.current += delta * speed * flightParams.speedMultiplier;

    // Figure-8 flight pattern with vertical bobbing
    const x = position[0] + Math.sin(time.current * 0.5) * flightParams.radiusX;
    const z =
      position[2] +
      Math.sin(time.current * 0.5) *
        Math.cos(time.current * 0.5) *
        flightParams.radiusZ;
    const y =
      position[1] +
      1.5 +
      Math.sin(time.current * 2) * flightParams.heightVariation;

    groupRef.current.position.set(x, y, z);

    // Face movement direction
    const dx = Math.cos(time.current * 0.5) * flightParams.radiusX * 0.5;
    const dz =
      (Math.cos(time.current * 0.5) * Math.cos(time.current * 0.5) -
        Math.sin(time.current * 0.5) * Math.sin(time.current * 0.5)) *
      flightParams.radiusZ *
      0.5;
    groupRef.current.rotation.y = Math.atan2(dx, dz);

    // Wing flapping
    if (leftWingRef.current && rightWingRef.current) {
      const wingAngle = Math.sin(time.current * 15) * 0.6 + 0.3;
      leftWingRef.current.rotation.z = wingAngle;
      rightWingRef.current.rotation.z = -wingAngle;
    }
  });

  // Generate random wing color variation
  const wingColor = useMemo(() => {
    const baseColor = new THREE.Color(color);
    return baseColor;
  }, [color]);

  const spotColor = useMemo(() => {
    const colors = ["#FFFFFF", "#FFD700", "#FF69B4", "#4169E1"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <group ref={groupRef} position={position} scale={0.3}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0, 0.18]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>

      {/* Antennae */}
      <mesh position={[0.03, 0.02, 0.22]} rotation={[0.5, 0.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.15, 4]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>
      <mesh position={[-0.03, 0.02, 0.22]} rotation={[0.5, -0.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.15, 4]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>

      {/* Left Wing */}
      <group position={[0.05, 0, 0]}>
        <mesh ref={leftWingRef} rotation={[0.2, 0, 0.3]}>
          {/* Upper wing */}
          <group position={[0.15, 0.05, 0]}>
            <mesh>
              <planeGeometry args={[0.35, 0.25]} />
              <meshStandardMaterial
                color={wingColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Wing spot */}
            <mesh position={[0.05, 0, 0.01]}>
              <circleGeometry args={[0.05, 8]} />
              <meshStandardMaterial color={spotColor} side={THREE.DoubleSide} />
            </mesh>
          </group>
          {/* Lower wing */}
          <group position={[0.12, -0.1, 0]}>
            <mesh>
              <planeGeometry args={[0.25, 0.18]} />
              <meshStandardMaterial
                color={wingColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        </mesh>
      </group>

      {/* Right Wing */}
      <group position={[-0.05, 0, 0]}>
        <mesh ref={rightWingRef} rotation={[0.2, 0, -0.3]}>
          {/* Upper wing */}
          <group position={[-0.15, 0.05, 0]}>
            <mesh>
              <planeGeometry args={[0.35, 0.25]} />
              <meshStandardMaterial
                color={wingColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
            {/* Wing spot */}
            <mesh position={[-0.05, 0, 0.01]}>
              <circleGeometry args={[0.05, 8]} />
              <meshStandardMaterial color={spotColor} side={THREE.DoubleSide} />
            </mesh>
          </group>
          {/* Lower wing */}
          <group position={[-0.12, -0.1, 0]}>
            <mesh>
              <planeGeometry args={[0.25, 0.18]} />
              <meshStandardMaterial
                color={wingColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        </mesh>
      </group>
    </group>
  );
}

// Multiple butterflies
interface ButterflySwarmProps {
  center: [number, number, number];
  count?: number;
  spread?: number;
}

export function ButterflySwarm({
  center,
  count = 5,
  spread = 5,
}: ButterflySwarmProps) {
  const butterflies = useMemo(() => {
    const colors = [
      "#FFB6C1", // Light pink
      "#87CEEB", // Sky blue
      "#DDA0DD", // Plum
      "#F0E68C", // Khaki
      "#98FB98", // Pale green
      "#FFA07A", // Light salmon
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        center[0] + (Math.random() - 0.5) * spread,
        center[1],
        center[2] + (Math.random() - 0.5) * spread,
      ] as [number, number, number],
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 0.5 + Math.random() * 1,
    }));
  }, [center, count, spread]);

  return (
    <>
      {butterflies.map((butterfly) => (
        <Butterfly
          key={butterfly.id}
          position={butterfly.position}
          color={butterfly.color}
          speed={butterfly.speed}
        />
      ))}
    </>
  );
}
