"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

interface LogProps {
  position: [number, number, number];
  rotation?: number;
  length?: number;
}

const LOG_COLORS = ["#8B4513", "#A0522D", "#6B4423", "#7B5533"];

export function Log({ position, rotation = 0, length = 2 }: LogProps) {
  const colorIndex =
    Math.floor(Math.abs(position[0] + position[2])) % LOG_COLORS.length;

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group rotation={[0, rotation, 0]}>
        {/* Main log body */}
        <mesh
          position={[0, 0.25, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.25, 0.28, length, 12]} />
          <meshStandardMaterial
            color={LOG_COLORS[colorIndex]}
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* End rings (tree ring texture look) */}
        <mesh position={[length / 2, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 12]} />
          <meshStandardMaterial color="#d4b896" roughness={0.8} />
        </mesh>

        <mesh position={[-length / 2, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 12]} />
          <meshStandardMaterial color="#d4b896" roughness={0.8} />
        </mesh>
      </group>
    </RigidBody>
  );
}

interface TreeStumpProps {
  position: [number, number, number];
  height?: number;
}

export function TreeStump({ position, height = 0.5 }: TreeStumpProps) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group>
        {/* Stump body */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.5, height, 10]} />
          <meshStandardMaterial
            color="#6B4423"
            roughness={0.95}
            metalness={0}
          />
        </mesh>

        {/* Top surface (tree rings) */}
        <mesh position={[0, height, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 16]} />
          <meshStandardMaterial color="#c4a876" roughness={0.8} />
        </mesh>

        {/* Bark texture rings */}
        {[0.15, 0.35].map((y, i) => (
          <mesh key={i} position={[0, y * height + 0.1, 0]}>
            <torusGeometry args={[0.45 - y * 0.1, 0.03, 8, 16]} />
            <meshStandardMaterial color="#5a3a13" roughness={0.95} />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

interface LogPileProps {
  position: [number, number, number];
  count?: number;
}

export function LogPile({ position, count = 4 }: LogPileProps) {
  const logs = useMemo(() => {
    const result = [];
    let y = 0;
    let logsInRow = Math.min(count, 3);

    while (result.length < count && logsInRow > 0) {
      for (let i = 0; i < logsInRow && result.length < count; i++) {
        result.push({
          id: result.length,
          x: (i - (logsInRow - 1) / 2) * 0.55,
          y: y * 0.45,
          rotation: y % 2 === 0 ? 0 : Math.PI / 2,
        });
      }
      y++;
      logsInRow = Math.max(1, logsInRow - 1);
    }
    return result;
  }, [count]);

  return (
    <group position={position}>
      {logs.map((log) => (
        <RigidBody key={log.id} type="fixed" colliders="cuboid">
          <mesh
            position={[log.x, log.y + 0.2, 0]}
            rotation={[0, log.rotation, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.2, 0.22, 1.2, 8]} />
            <meshStandardMaterial
              color={LOG_COLORS[log.id % LOG_COLORS.length]}
              roughness={0.9}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
