"use client";

import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

// Zone-based tree positions for expanded map (80x80)
// Forest Zone (left side, around -25, 0)
const FOREST_TREES: [number, number, number][] = [
  // Dense forest cluster
  [-30, 0, -10],
  [-28, 0, -8],
  [-32, 0, -6],
  [-26, 0, -12],
  [-34, 0, -4],
  [-24, 0, -6],
  [-29, 0, -2],
  [-31, 0, 0],
  [-27, 0, 2],
  [-33, 0, 4],
  [-25, 0, 6],
  [-30, 0, 8],
  [-28, 0, 10],
  [-32, 0, 12],
  [-26, 0, 14],
  [-34, 0, 6],
  [-22, 0, -4],
  [-20, 0, 0],
  [-18, 0, 4],
  [-36, 0, 0],
  [-35, 0, -8],
  [-23, 0, 8],
  [-21, 0, 12],
  [-33, 0, -10],
  [-19, 0, -6],
  [-17, 0, 2],
  [-37, 0, 4],
  [-38, 0, -2],
];

// Scattered trees around farmland
const FARMLAND_TREES: [number, number, number][] = [
  [-12, 0, -12],
  [12, 0, -12],
  [-12, 0, 12],
  [12, 0, 12],
  [-15, 0, 0],
  [15, 0, 0],
  [0, 0, 15],
  [0, 0, -15],
  [-10, 0, 18],
  [10, 0, 18],
  [-18, 0, 10],
  [-18, 0, -10],
];

// Village Zone trees (right side, around 25, 0) - sparser
const VILLAGE_TREES: [number, number, number][] = [
  [20, 0, -15],
  [30, 0, -12],
  [35, 0, -8],
  [22, 0, 15],
  [28, 0, 12],
  [34, 0, 8],
  [38, 0, 0],
  [36, 0, -4],
  [32, 0, 4],
];

// Lake area trees (around 0, -28)
const LAKE_TREES: [number, number, number][] = [
  [-18, 0, -25],
  [18, 0, -25],
  [-15, 0, -35],
  [15, 0, -35],
  [-8, 0, -38],
  [8, 0, -38],
  [0, 0, -40],
  [-20, 0, -32],
  [20, 0, -32],
];

// Map edge trees for boundary feel
const EDGE_TREES: [number, number, number][] = [
  // North edge
  [-35, 0, -35],
  [-25, 0, -36],
  [-15, 0, -35],
  [-5, 0, -36],
  [5, 0, -35],
  [15, 0, -36],
  [25, 0, -35],
  [35, 0, -36],
  // South edge
  [-35, 0, 35],
  [-25, 0, 36],
  [-15, 0, 35],
  [-5, 0, 36],
  [5, 0, 35],
  [15, 0, 36],
  [25, 0, 35],
  [35, 0, 36],
  // East edge
  [36, 0, -25],
  [35, 0, -15],
  [36, 0, -5],
  [35, 0, 5],
  [36, 0, 15],
  [35, 0, 25],
  // West edge
  [-36, 0, -25],
  [-35, 0, -15],
  [-36, 0, -5],
  [-35, 0, 5],
  [-36, 0, 15],
  [-35, 0, 25],
];

export function Trees() {
  // Combine all tree positions with zone info
  const allTrees = useMemo(() => {
    const trees: {
      pos: [number, number, number];
      zone: string;
      idx: number;
    }[] = [];

    FOREST_TREES.forEach((pos, i) =>
      trees.push({ pos, zone: "forest", idx: i })
    );
    FARMLAND_TREES.forEach((pos, i) =>
      trees.push({ pos, zone: "farmland", idx: i })
    );
    VILLAGE_TREES.forEach((pos, i) =>
      trees.push({ pos, zone: "village", idx: i })
    );
    LAKE_TREES.forEach((pos, i) => trees.push({ pos, zone: "lake", idx: i }));
    EDGE_TREES.forEach((pos, i) => trees.push({ pos, zone: "edge", idx: i }));

    return trees;
  }, []);

  return (
    <group>
      {allTrees.map((tree, index) => {
        // Assign tree variant based on zone
        let variant = index % 5; // 5 tree types now
        if (tree.zone === "forest") variant = index % 2; // Oak & Pine in forest
        if (tree.zone === "village") variant = (index % 2) + 3; // Cherry & Apple near village
        if (tree.zone === "lake") variant = index % 2 === 0 ? 0 : 4; // Oak & Dead tree near lake

        return (
          <Tree
            key={index}
            position={tree.pos}
            variant={variant}
            scale={0.8 + (index % 3) * 0.2}
          />
        );
      })}
    </group>
  );
}

interface TreeProps {
  position: [number, number, number];
  variant?: number;
  scale?: number;
}

// 5 tree variants: Oak, Pine, Cherry Blossom, Apple, Dead Tree
const TREE_STYLES = [
  // 0: Oak Tree (classic)
  {
    trunkColor: "#8B4513",
    leavesColor: "#228B22",
    height: 3,
    radius: 1.5,
    type: "oak",
  },
  // 1: Pine Tree (conical)
  {
    trunkColor: "#654321",
    leavesColor: "#006400",
    height: 4,
    radius: 1.2,
    type: "pine",
  },
  // 2: Standard Oak variant
  {
    trunkColor: "#A0522D",
    leavesColor: "#32CD32",
    height: 2.5,
    radius: 1.2,
    type: "oak",
  },
  // 3: Cherry Blossom
  {
    trunkColor: "#5a3a2a",
    leavesColor: "#FFB7C5",
    height: 2.8,
    radius: 1.8,
    type: "cherry",
  },
  // 4: Dead Tree
  {
    trunkColor: "#4a3a2a",
    leavesColor: "#3a3a3a",
    height: 3,
    radius: 0.8,
    type: "dead",
  },
];

function Tree({ position, variant = 0, scale = 1 }: TreeProps) {
  const style = TREE_STYLES[variant % TREE_STYLES.length];

  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group scale={scale}>
        {/* Tree trunk */}
        <mesh position={[0, style.height / 4, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, style.height / 2, 8]} />
          <meshStandardMaterial color={style.trunkColor} roughness={0.9} />
        </mesh>

        {/* Pine Tree - conical shape */}
        {style.type === "pine" && (
          <>
            <mesh position={[0, style.height / 2 + 0.3, 0]} castShadow>
              <coneGeometry
                args={[style.radius * 1.2, style.radius * 1.5, 8]}
              />
              <meshStandardMaterial color={style.leavesColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, style.height / 2 + 1.2, 0]} castShadow>
              <coneGeometry
                args={[style.radius * 0.9, style.radius * 1.2, 8]}
              />
              <meshStandardMaterial color="#005500" roughness={0.8} />
            </mesh>
            <mesh position={[0, style.height / 2 + 2, 0]} castShadow>
              <coneGeometry args={[style.radius * 0.6, style.radius, 8]} />
              <meshStandardMaterial color="#004400" roughness={0.8} />
            </mesh>
          </>
        )}

        {/* Oak/Cherry Tree - layered boxes */}
        {(style.type === "oak" || style.type === "cherry") && (
          <>
            <mesh position={[0, style.height / 2 + 0.5, 0]} castShadow>
              <boxGeometry
                args={[style.radius * 1.5, style.radius, style.radius * 1.5]}
              />
              <meshStandardMaterial color={style.leavesColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, style.height / 2 + 1.2, 0]} castShadow>
              <boxGeometry
                args={[
                  style.radius * 1.2,
                  style.radius * 0.8,
                  style.radius * 1.2,
                ]}
              />
              <meshStandardMaterial color={style.leavesColor} roughness={0.8} />
            </mesh>
            <mesh position={[0, style.height / 2 + 1.8, 0]} castShadow>
              <boxGeometry
                args={[
                  style.radius * 0.8,
                  style.radius * 0.6,
                  style.radius * 0.8,
                ]}
              />
              <meshStandardMaterial color={style.leavesColor} roughness={0.8} />
            </mesh>
          </>
        )}

        {/* Dead Tree - bare branches */}
        {style.type === "dead" && (
          <>
            {/* Main branches */}
            <mesh
              position={[0.3, style.height / 2 + 0.3, 0]}
              rotation={[0, 0, 0.5]}
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
              <meshStandardMaterial color={style.trunkColor} roughness={0.95} />
            </mesh>
            <mesh
              position={[-0.3, style.height / 2 + 0.5, 0.2]}
              rotation={[0.2, 0, -0.6]}
              castShadow
            >
              <cylinderGeometry args={[0.06, 0.1, 1, 6]} />
              <meshStandardMaterial color={style.trunkColor} roughness={0.95} />
            </mesh>
            <mesh
              position={[0, style.height / 2 + 0.8, -0.2]}
              rotation={[-0.3, 0, 0.1]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.08, 0.8, 6]} />
              <meshStandardMaterial color={style.trunkColor} roughness={0.95} />
            </mesh>
          </>
        )}

        {/* Cherry Blossom petals falling effect (simple) */}
        {style.type === "cherry" && (
          <>
            {[0.4, -0.3, 0.2, -0.5].map((x, i) => (
              <mesh
                key={i}
                position={[
                  x,
                  style.height / 2 + 0.3 + i * 0.3,
                  (i % 2) * 0.4 - 0.2,
                ]}
                castShadow
              >
                <sphereGeometry args={[0.08, 6, 6]} />
                <meshStandardMaterial color="#FF69B4" />
              </mesh>
            ))}
          </>
        )}

        {/* Apple Tree fruits */}
        {variant === 2 && (
          <>
            <mesh position={[0.4, style.height / 2 + 0.3, 0.4]} castShadow>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#ff4040" />
            </mesh>
            <mesh position={[-0.3, style.height / 2 + 0.5, -0.3]} castShadow>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshStandardMaterial color="#ff5050" />
            </mesh>
            <mesh position={[0.1, style.height / 2 + 0.8, 0.2]} castShadow>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ff3030" />
            </mesh>
          </>
        )}
      </group>
    </RigidBody>
  );
}
