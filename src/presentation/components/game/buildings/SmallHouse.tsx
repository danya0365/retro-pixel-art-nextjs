"use client";

import { RigidBody } from "@react-three/rapier";

interface SmallHouseProps {
  position: [number, number, number];
  rotation?: number;
  variant?: "cottage" | "shop" | "tavern";
}

const HOUSE_COLORS = {
  cottage: {
    walls: "#f5e6d3",
    roof: "#8B4513",
    door: "#5a3a1a",
    trim: "#6B4423",
  },
  shop: { walls: "#e8d4c4", roof: "#654321", door: "#3a2a0a", trim: "#5a4a3a" },
  tavern: {
    walls: "#d4c4b4",
    roof: "#4a3a2a",
    door: "#4a2a0a",
    trim: "#6a5a4a",
  },
};

export function SmallHouse({
  position,
  rotation = 0,
  variant = "cottage",
}: SmallHouseProps) {
  const colors = HOUSE_COLORS[variant];

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group rotation={[0, rotation, 0]}>
        {/* Main house body */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 3, 3.5]} />
          <meshStandardMaterial
            color={colors.walls}
            roughness={0.85}
            metalness={0}
          />
        </mesh>

        {/* Roof */}
        <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[4, 1.8, 4.5]} />
          <meshStandardMaterial color={colors.roof} roughness={0.9} />
        </mesh>

        {/* Roof peak */}
        <mesh position={[0, 4.2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0, 2.3, 4.3, 4, 1]} />
          <meshStandardMaterial color={colors.roof} roughness={0.85} />
        </mesh>

        {/* Chimney */}
        <mesh position={[1.2, 4.5, 0]} castShadow>
          <boxGeometry args={[0.6, 1.5, 0.6]} />
          <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
        </mesh>
        <mesh position={[1.2, 5.3, 0]}>
          <boxGeometry args={[0.7, 0.15, 0.7]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
        </mesh>

        {/* Door */}
        <mesh position={[0, 1, 1.76]} castShadow>
          <boxGeometry args={[1, 2, 0.1]} />
          <meshStandardMaterial color={colors.door} roughness={0.85} />
        </mesh>

        {/* Door frame */}
        <mesh position={[0, 1, 1.77]}>
          <boxGeometry args={[1.2, 2.2, 0.05]} />
          <meshStandardMaterial color={colors.trim} roughness={0.9} />
        </mesh>

        {/* Door handle */}
        <mesh position={[0.35, 1, 1.85]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color="#8a7a2a"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Windows */}
        {[
          [-1.2, 1.8, 1.76],
          [1.2, 1.8, 1.76],
        ].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.8, 0.1]} />
              <meshStandardMaterial
                color="#87CEEB"
                transparent
                opacity={0.7}
                roughness={0.1}
              />
            </mesh>
            {/* Window frame */}
            <mesh position={[0, 0, 0.01]}>
              <boxGeometry args={[0.8, 0.9, 0.03]} />
              <meshStandardMaterial color={colors.trim} roughness={0.9} />
            </mesh>
            {/* Cross bars */}
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[0.05, 0.75, 0.03]} />
              <meshStandardMaterial color={colors.trim} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[0.65, 0.05, 0.03]} />
              <meshStandardMaterial color={colors.trim} roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Side window */}
        <mesh
          position={[2.01, 1.8, 0]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <boxGeometry args={[0.6, 0.6, 0.1]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
        </mesh>

        {/* Front porch/step */}
        <mesh position={[0, 0.1, 2.1]} receiveShadow>
          <boxGeometry args={[1.5, 0.2, 0.6]} />
          <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
        </mesh>

        {/* Flower box under front windows */}
        {variant === "cottage" && (
          <>
            <mesh position={[-1.2, 1.2, 1.9]}>
              <boxGeometry args={[0.8, 0.25, 0.25]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
            </mesh>
            {/* Flowers */}
            {[-1.4, -1.2, -1].map((x, i) => (
              <mesh key={i} position={[x, 1.4, 1.9]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial
                  color={["#ff6b6b", "#ffeb3b", "#ff9800"][i]}
                />
              </mesh>
            ))}
          </>
        )}

        {/* Shop sign for shop variant */}
        {variant === "shop" && (
          <group position={[0, 2.8, 2]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 0.5, 0.1]} />
              <meshStandardMaterial color="#f5e6d3" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[1.6, 0.6, 0.05]} />
              <meshStandardMaterial color={colors.trim} roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* Tavern sign for tavern variant */}
        {variant === "tavern" && (
          <group position={[2.3, 2.5, 0]}>
            {/* Post */}
            <mesh position={[0, -0.8, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
            </mesh>
            {/* Hanging sign */}
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.6, 0.1]} />
              <meshStandardMaterial color="#8B4513" roughness={0.85} />
            </mesh>
            {/* Mug symbol */}
            <mesh position={[0, 0, 0.06]}>
              <cylinderGeometry args={[0.12, 0.1, 0.2, 8]} />
              <meshStandardMaterial
                color="#d4a440"
                metalness={0.4}
                roughness={0.6}
              />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
}
