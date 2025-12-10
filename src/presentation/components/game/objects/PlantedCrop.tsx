"use client";

import type { PlantedItem } from "@/src/presentation/hooks/useGardenRoom";

interface PlantedCropProps {
  plant: PlantedItem;
}

// Crop configurations
const CROP_CONFIG: Record<
  string,
  {
    name: string;
    color: string;
    harvestColor: string;
  }
> = {
  carrot: { name: "Carrot", color: "#228B22", harvestColor: "#FF6B35" },
  tomato: { name: "Tomato", color: "#228B22", harvestColor: "#FF6347" },
  corn: { name: "Corn", color: "#228B22", harvestColor: "#FFD700" },
  wheat: { name: "Wheat", color: "#228B22", harvestColor: "#F4A460" },
  pumpkin: { name: "Pumpkin", color: "#228B22", harvestColor: "#FF7518" },
  cabbage: { name: "Cabbage", color: "#228B22", harvestColor: "#90EE90" },
};

export function PlantedCrop({ plant }: PlantedCropProps) {
  const config = CROP_CONFIG[plant.type] || CROP_CONFIG.carrot;
  const stage = plant.growthStage; // 0-4

  return (
    <group position={[plant.x, 0, plant.z]}>
      {/* Soil mound */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.05, 8]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>

      {/* Growth stage 0: Seeds (just soil) */}
      {stage === 0 && (
        <group>
          {/* Small seed dots */}
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 3) * 0.1,
                0.06,
                Math.sin((i * Math.PI * 2) / 3) * 0.1,
              ]}
            >
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          ))}
        </group>
      )}

      {/* Growth stage 1: Sprout */}
      {stage === 1 && (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.02]} />
            <meshStandardMaterial color="#32CD32" />
          </mesh>
        </group>
      )}

      {/* Growth stage 2: Small plant */}
      {stage === 2 && (
        <group>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.25, 6]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Leaves */}
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 3) * 0.06,
                0.2,
                Math.sin((i * Math.PI * 2) / 3) * 0.06,
              ]}
              rotation={[0.3, (i * Math.PI * 2) / 3, 0]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.06, 0.02]} />
              <meshStandardMaterial color="#32CD32" />
            </mesh>
          ))}
        </group>
      )}

      {/* Growth stage 3: Mature plant */}
      {stage === 3 && (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* More leaves */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 5) * 0.08,
                0.25 + (i % 2) * 0.08,
                Math.sin((i * Math.PI * 2) / 5) * 0.08,
              ]}
              rotation={[0.4, (i * Math.PI * 2) / 5, 0]}
              castShadow
            >
              <boxGeometry args={[0.15, 0.08, 0.02]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          ))}
          {/* Small fruit forming */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={config.harvestColor}
              opacity={0.7}
              transparent
            />
          </mesh>
        </group>
      )}

      {/* Growth stage 4: Ready to harvest */}
      {stage >= 4 && (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
            <meshStandardMaterial color={config.color} />
          </mesh>
          {/* Full leaves */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI * 2) / 6) * 0.1,
                0.28 + (i % 2) * 0.1,
                Math.sin((i * Math.PI * 2) / 6) * 0.1,
              ]}
              rotation={[0.5, (i * Math.PI * 2) / 6, 0]}
              castShadow
            >
              <boxGeometry args={[0.18, 0.1, 0.02]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          ))}
          {/* Ripe fruit */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={config.harvestColor} />
          </mesh>
          {/* Sparkle effect for ready crops */}
          <pointLight
            position={[0, 0.5, 0]}
            color="#FFD700"
            intensity={0.3}
            distance={1}
          />
        </group>
      )}
    </group>
  );
}

// Render multiple planted crops
export function PlantedCrops({ plants }: { plants: PlantedItem[] }) {
  return (
    <group>
      {plants.map((plant, index) => (
        <PlantedCrop
          key={`${plant.id}-${plant.x}-${plant.z}-${index}`}
          plant={plant}
        />
      ))}
    </group>
  );
}
