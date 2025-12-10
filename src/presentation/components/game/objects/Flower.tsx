"use client";

interface FlowerProps {
  position: [number, number, number];
  color?: string;
  variant?: "tulip" | "daisy" | "rose";
}

const FLOWER_COLORS = {
  tulip: ["#FF6B6B", "#FF8E8E", "#FFB3B3"],
  daisy: ["#FFFFFF", "#FFFF99", "#FFE4B5"],
  rose: ["#C41E3A", "#DC143C", "#FF69B4"],
};

export function Flower({ position, color, variant = "tulip" }: FlowerProps) {
  const [x, y, z] = position;
  const colors = FLOWER_COLORS[variant];
  const flowerColor =
    color || colors[Math.floor(Math.random() * colors.length)];

  return (
    <group position={[x, y, z]}>
      {/* Stem */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Leaf */}
      <mesh position={[0.05, 0.1, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.05]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>

      {variant === "tulip" && (
        <>
          {/* Tulip petals */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <coneGeometry args={[0.08, 0.15, 6]} />
            <meshStandardMaterial color={flowerColor} />
          </mesh>
        </>
      )}

      {variant === "daisy" && (
        <>
          {/* Daisy center */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          {/* Daisy petals */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI) / 3) * 0.06,
                0.32,
                Math.sin((i * Math.PI) / 3) * 0.06,
              ]}
              rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}
              castShadow
            >
              <boxGeometry args={[0.04, 0.08, 0.02]} />
              <meshStandardMaterial color={flowerColor} />
            </mesh>
          ))}
        </>
      )}

      {variant === "rose" && (
        <>
          {/* Rose bloom */}
          <mesh position={[0, 0.33, 0]} castShadow>
            <dodecahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={flowerColor} />
          </mesh>
          {/* Rose petals outer */}
          <mesh position={[0, 0.33, 0]} castShadow>
            <dodecahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial
              color={flowerColor}
              transparent
              opacity={0.7}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// Flower bed with multiple flowers
export function FlowerBed({
  position,
  count = 5,
  spread = 0.8,
}: {
  position: [number, number, number];
  count?: number;
  spread?: number;
}) {
  const [x, y, z] = position;
  const variants: Array<"tulip" | "daisy" | "rose"> = [
    "tulip",
    "daisy",
    "rose",
  ];

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const offsetX = (Math.random() - 0.5) * spread;
        const offsetZ = (Math.random() - 0.5) * spread;
        const variant = variants[Math.floor(Math.random() * variants.length)];

        return (
          <Flower
            key={i}
            position={[x + offsetX, y, z + offsetZ]}
            variant={variant}
          />
        );
      })}
    </group>
  );
}
