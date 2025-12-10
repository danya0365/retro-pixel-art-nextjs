"use client";

import { RigidBody } from "@react-three/rapier";

// Predefined tree positions for the garden
const TREE_POSITIONS: [number, number, number][] = [
  [-8, 0, -8],
  [-10, 0, -5],
  [-6, 0, -10],
  [8, 0, -10],
  [10, 0, -8],
  [12, 0, -5],
  [-12, 0, 5],
  [-10, 0, 8],
  [-8, 0, 10],
  [10, 0, 10],
  [12, 0, 8],
  [8, 0, 12],
  [-5, 0, -12],
  [5, 0, -12],
  [-12, 0, -3],
  [12, 0, 0],
];

export function Trees() {
  return (
    <group>
      {TREE_POSITIONS.map((position, index) => (
        <Tree key={index} position={position} variant={index % 3} />
      ))}
    </group>
  );
}

interface TreeProps {
  position: [number, number, number];
  variant?: number;
}

function Tree({ position, variant = 0 }: TreeProps) {
  // Different tree styles
  const treeStyles = [
    { trunkColor: "#8B4513", leavesColor: "#228B22", height: 3, radius: 1.5 },
    { trunkColor: "#A0522D", leavesColor: "#32CD32", height: 2.5, radius: 1.2 },
    { trunkColor: "#654321", leavesColor: "#006400", height: 3.5, radius: 1.8 },
  ];

  const style = treeStyles[variant % treeStyles.length];

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group>
        {/* Tree trunk */}
        <mesh position={[0, style.height / 4, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, style.height / 2, 8]} />
          <meshStandardMaterial color={style.trunkColor} roughness={0.9} />
        </mesh>

        {/* Tree leaves - stacked layers for pixel art look */}
        <mesh position={[0, style.height / 2 + 0.5, 0]} castShadow>
          <boxGeometry
            args={[style.radius * 1.5, style.radius, style.radius * 1.5]}
          />
          <meshStandardMaterial color={style.leavesColor} roughness={0.8} />
        </mesh>

        <mesh position={[0, style.height / 2 + 1.2, 0]} castShadow>
          <boxGeometry
            args={[style.radius * 1.2, style.radius * 0.8, style.radius * 1.2]}
          />
          <meshStandardMaterial color={style.leavesColor} roughness={0.8} />
        </mesh>

        <mesh position={[0, style.height / 2 + 1.8, 0]} castShadow>
          <boxGeometry
            args={[style.radius * 0.8, style.radius * 0.6, style.radius * 0.8]}
          />
          <meshStandardMaterial color={style.leavesColor} roughness={0.8} />
        </mesh>

        {/* Optional: small fruits/decorations */}
        {variant === 1 && (
          <>
            <mesh position={[0.4, style.height / 2 + 0.3, 0.4]} castShadow>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff6347" /> {/* Tomato red */}
            </mesh>
            <mesh position={[-0.3, style.height / 2 + 0.5, -0.3]} castShadow>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff6347" />
            </mesh>
          </>
        )}
      </group>
    </RigidBody>
  );
}
