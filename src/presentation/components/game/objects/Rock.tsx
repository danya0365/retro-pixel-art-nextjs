"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

interface RockProps {
  position: [number, number, number];
  size?: "small" | "medium" | "large";
  variant?: number;
}

const ROCK_COLORS = ["#7a7a7a", "#8a8a8a", "#6a6a6a", "#5a5a5a", "#9a9a9a"];

export function Rock({ position, size = "medium", variant = 0 }: RockProps) {
  const color = ROCK_COLORS[variant % ROCK_COLORS.length];

  const scale = size === "small" ? 0.5 : size === "large" ? 1.5 : 1;
  const baseSize = 0.8 * scale;

  return (
    <RigidBody type="fixed" position={position} colliders="hull">
      <group>
        {/* Main rock body - irregular box */}
        <mesh position={[0, baseSize / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[baseSize * 1.2, baseSize, baseSize]} />
          <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
        </mesh>

        {/* Top irregular piece */}
        <mesh
          position={[0.1, baseSize * 0.9, 0.1]}
          rotation={[0.2, 0.3, 0.1]}
          castShadow
        >
          <boxGeometry
            args={[baseSize * 0.7, baseSize * 0.5, baseSize * 0.6]}
          />
          <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
        </mesh>

        {/* Side piece */}
        {size !== "small" && (
          <mesh
            position={[-0.2, baseSize * 0.3, 0.3]}
            rotation={[0, 0.5, 0]}
            castShadow
          >
            <boxGeometry
              args={[baseSize * 0.4, baseSize * 0.4, baseSize * 0.5]}
            />
            <meshStandardMaterial
              color={ROCK_COLORS[(variant + 1) % ROCK_COLORS.length]}
              roughness={0.9}
              metalness={0}
            />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
}

interface RockClusterProps {
  position: [number, number, number];
  count?: number;
  spread?: number;
}

export function RockCluster({
  position,
  count = 5,
  spread = 3,
}: RockClusterProps) {
  const rocks = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * spread,
      z: (Math.random() - 0.5) * spread,
      size: (["small", "medium", "large"] as const)[
        Math.floor(Math.random() * 3)
      ],
      variant: Math.floor(Math.random() * ROCK_COLORS.length),
    }));
  }, [count, spread]);

  return (
    <group position={position}>
      {rocks.map((rock) => (
        <Rock
          key={rock.id}
          position={[rock.x, 0, rock.z]}
          size={rock.size}
          variant={rock.variant}
        />
      ))}
    </group>
  );
}
