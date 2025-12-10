"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
  size: number;
}

interface ParticleEffectProps {
  position: [number, number, number];
  type: "plant" | "water" | "harvest";
  onComplete?: () => void;
}

// Single particle effect instance
export function ParticleEffect({
  position,
  type,
  onComplete,
}: ParticleEffectProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Initialize particles based on effect type
  useEffect(() => {
    const newParticles: Particle[] = [];
    const count = type === "harvest" ? 20 : 12;

    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        id: i,
        position: new THREE.Vector3(
          position[0] + (Math.random() - 0.5) * 0.5,
          position[1] + 0.5,
          position[2] + (Math.random() - 0.5) * 0.5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 2
        ),
        life: 1,
        maxLife: 1,
        color: getParticleColor(type),
        size: type === "water" ? 0.08 : 0.12,
      };
      newParticles.push(particle);
    }

    setParticles(newParticles);
  }, [position, type]);

  useFrame((_, delta) => {
    if (!isActive || particles.length === 0) return;

    let allDead = true;

    setParticles((prev) =>
      prev.map((p) => {
        if (p.life <= 0) return p;

        allDead = false;

        // Apply gravity
        p.velocity.y -= delta * 5;

        // Update position
        p.position.add(p.velocity.clone().multiplyScalar(delta));

        // Decrease life
        p.life -= delta * 1.5;

        return { ...p };
      })
    );

    if (allDead) {
      setIsActive(false);
      onComplete?.();
    }
  });

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    const sizes = new Float32Array(particles.length);

    particles.forEach((p, i) => {
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;

      const alpha = Math.max(0, p.life / p.maxLife);
      colors[i * 3] = p.color.r * alpha;
      colors[i * 3 + 1] = p.color.g * alpha;
      colors[i * 3 + 2] = p.color.b * alpha;

      sizes[i] = p.size * alpha;
    });

    return { positions, colors, sizes };
  }, [particles]);

  if (!isActive || particles.length === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function getParticleColor(type: "plant" | "water" | "harvest"): THREE.Color {
  switch (type) {
    case "plant":
      // Green sparkles for planting
      return new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.8, 0.5);
    case "water":
      // Blue droplets for watering
      return new THREE.Color().setHSL(0.55 + Math.random() * 0.05, 0.8, 0.6);
    case "harvest":
      // Golden sparkles for harvesting
      return new THREE.Color().setHSL(0.12 + Math.random() * 0.08, 0.9, 0.6);
    default:
      return new THREE.Color(1, 1, 1);
  }
}

// Manager for multiple particle effects
interface ParticleEffectData {
  id: number;
  position: [number, number, number];
  type: "plant" | "water" | "harvest";
}

interface ParticleManagerProps {
  effects: ParticleEffectData[];
  onEffectComplete: (id: number) => void;
}

export function ParticleManager({
  effects,
  onEffectComplete,
}: ParticleManagerProps) {
  return (
    <>
      {effects.map((effect) => (
        <ParticleEffect
          key={effect.id}
          position={effect.position}
          type={effect.type}
          onComplete={() => onEffectComplete(effect.id)}
        />
      ))}
    </>
  );
}
