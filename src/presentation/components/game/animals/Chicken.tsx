"use client";

import { soundService } from "@/src/infrastructure/audio/soundService";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface ChickenProps {
  position: [number, number, number];
  boundarySize?: number;
}

export function Chicken({ position, boundarySize = 8 }: ChickenProps) {
  const groupRef = useRef<THREE.Group>(null);
  // Use refs instead of state to prevent re-renders
  const targetPosition = useRef(
    new THREE.Vector3(position[0], position[1], position[2])
  );
  const currentPosition = useRef(
    new THREE.Vector3(position[0], position[1], position[2])
  );
  const isMoving = useRef(false);
  const bobPhase = useRef(0);
  const waitTime = useRef(0);
  const cluckTimer = useRef(0);

  // Pick new random target
  const pickNewTarget = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 1 + Math.random() * 2;
    const newX = Math.max(
      -boundarySize,
      Math.min(
        boundarySize,
        currentPosition.current.x + Math.cos(angle) * distance
      )
    );
    const newZ = Math.max(
      -boundarySize,
      Math.min(
        boundarySize,
        currentPosition.current.z + Math.sin(angle) * distance
      )
    );
    targetPosition.current.set(newX, position[1], newZ);
    isMoving.current = true;
  };

  // Random clucking
  useEffect(() => {
    const cluckInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        soundService.play("chicken");
      }
    }, 5000 + Math.random() * 10000);

    return () => clearInterval(cluckInterval);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    cluckTimer.current += delta;

    if (isMoving.current) {
      // Move towards target
      const direction = targetPosition.current
        .clone()
        .sub(currentPosition.current);
      const distance = direction.length();

      if (distance < 0.1) {
        // Reached target
        isMoving.current = false;
        waitTime.current = 1 + Math.random() * 3;
      } else {
        // Move
        direction.normalize();
        const speed = 0.8;
        currentPosition.current.add(direction.multiplyScalar(speed * delta));
        groupRef.current.position.copy(currentPosition.current);

        // Rotate to face movement direction
        groupRef.current.rotation.y = Math.atan2(direction.x, direction.z);

        // Bob animation (use ref to avoid re-render)
        bobPhase.current = (bobPhase.current + delta * 15) % (Math.PI * 2);
        groupRef.current.position.y =
          position[1] + Math.abs(Math.sin(bobPhase.current)) * 0.05;
      }
    } else {
      // Waiting
      waitTime.current -= delta;
      if (waitTime.current <= 0) {
        pickNewTarget();
      }

      // Pecking animation while waiting (use ref to avoid re-render)
      if (Math.random() < 0.01) {
        bobPhase.current += 0.5;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#F5DEB3" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.35, 0.15]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#F5DEB3" />
      </mesh>

      {/* Beak */}
      <mesh
        position={[0, 0.33, 0.25]}
        rotation={[Math.PI / 4, 0, 0]}
        castShadow
      >
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#FFA500" />
      </mesh>

      {/* Comb */}
      <mesh position={[0, 0.45, 0.15]} castShadow>
        <boxGeometry args={[0.04, 0.08, 0.08]} />
        <meshStandardMaterial color="#FF4444" />
      </mesh>

      {/* Wattle */}
      <mesh position={[0, 0.28, 0.2]} castShadow>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#FF4444" />
      </mesh>

      {/* Wings */}
      <mesh position={[0.15, 0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      <mesh position={[-0.15, 0.2, 0]} rotation={[0, 0, 0.3]} castShadow>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.25, -0.2]} rotation={[-0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.08, 0.15, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Legs */}
      <mesh position={[0.05, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 4]} />
        <meshStandardMaterial color="#FFA500" />
      </mesh>
      <mesh position={[-0.05, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 4]} />
        <meshStandardMaterial color="#FFA500" />
      </mesh>
    </group>
  );
}

// Multiple chickens
interface ChickenFlockProps {
  center: [number, number, number];
  count?: number;
  spread?: number;
}

export function ChickenFlock({
  center,
  count = 3,
  spread = 3,
}: ChickenFlockProps) {
  // Memoize chicken positions to prevent re-randomizing on every render
  const chickens = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        position: [
          center[0] + (Math.random() - 0.5) * spread,
          center[1],
          center[2] + (Math.random() - 0.5) * spread,
        ] as [number, number, number],
      })),
    [center, count, spread]
  );

  return (
    <>
      {chickens.map((chicken) => (
        <Chicken key={chicken.id} position={chicken.position} />
      ))}
    </>
  );
}
