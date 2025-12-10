"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface DayNightCycleProps {
  dayTime: number; // 0-24 hours
}

// Calculate sun/moon position and lighting based on time
function getTimeOfDayInfo(hour: number) {
  // Normalize to 0-1 range for a full day cycle
  const normalizedTime = hour / 24;

  // Sun angle (rises at 6, sets at 18)
  const sunAngle = (normalizedTime - 0.25) * Math.PI * 2;

  // Determine if it's day or night
  const isDay = hour >= 6 && hour < 18;
  const isDawn = hour >= 5 && hour < 7;
  const isDusk = hour >= 17 && hour < 19;

  // Calculate light intensity
  let intensity = 0.2; // Base night intensity
  if (isDay) {
    // Peak at noon (12:00)
    const dayProgress = (hour - 6) / 12;
    intensity = 0.4 + Math.sin(dayProgress * Math.PI) * 0.6;
  } else if (isDawn || isDusk) {
    intensity = 0.4;
  }

  // Sky colors for different times
  let skyColor = new THREE.Color("#0a0a20"); // Night
  let ambientColor = new THREE.Color("#1a1a3a");

  if (hour >= 5 && hour < 7) {
    // Dawn - pink/orange
    skyColor = new THREE.Color("#ff7e5f");
    ambientColor = new THREE.Color("#feb47b");
  } else if (hour >= 7 && hour < 10) {
    // Morning - light blue
    skyColor = new THREE.Color("#87ceeb");
    ambientColor = new THREE.Color("#fffacd");
  } else if (hour >= 10 && hour < 16) {
    // Day - bright blue
    skyColor = new THREE.Color("#4ca6ff");
    ambientColor = new THREE.Color("#ffffff");
  } else if (hour >= 16 && hour < 18) {
    // Afternoon - warm
    skyColor = new THREE.Color("#ffd89b");
    ambientColor = new THREE.Color("#ffecd2");
  } else if (hour >= 18 && hour < 20) {
    // Dusk - purple/orange
    skyColor = new THREE.Color("#ee5a24");
    ambientColor = new THREE.Color("#ff6b6b");
  } else if (hour >= 20 && hour < 22) {
    // Evening - deep blue
    skyColor = new THREE.Color("#1a1a4e");
    ambientColor = new THREE.Color("#2a2a5e");
  }

  return {
    sunAngle,
    intensity,
    skyColor,
    ambientColor,
    isNight: !isDay,
  };
}

export function DayNightCycle({ dayTime }: DayNightCycleProps) {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemisphereRef = useRef<THREE.HemisphereLight>(null);

  const timeInfo = useMemo(() => getTimeOfDayInfo(dayTime), [dayTime]);

  useFrame(() => {
    if (directionalLightRef.current) {
      // Move sun/moon based on time
      const radius = 20;
      directionalLightRef.current.position.set(
        Math.cos(timeInfo.sunAngle) * radius,
        Math.sin(timeInfo.sunAngle) * radius + 5,
        5
      );
      directionalLightRef.current.intensity = timeInfo.intensity;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = timeInfo.intensity * 0.5 + 0.2;
      ambientLightRef.current.color.copy(timeInfo.ambientColor);
    }

    if (hemisphereRef.current) {
      hemisphereRef.current.intensity = timeInfo.intensity * 0.3 + 0.1;
    }
  });

  return (
    <>
      {/* Main directional light (sun/moon) */}
      <directionalLight
        ref={directionalLightRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Ambient light for overall brightness */}
      <ambientLight ref={ambientLightRef} />

      {/* Hemisphere light for sky/ground color */}
      <hemisphereLight
        ref={hemisphereRef}
        args={[timeInfo.skyColor, "#3d5c3d", 0.3]}
      />

      {/* Stars at night */}
      {timeInfo.isNight && <Stars />}
    </>
  );
}

// Simple stars component for night sky
function Stars() {
  const starsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 30 + 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return [positions];
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) {
      // Twinkle effect
      starsRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#ffffff" transparent opacity={0.8} />
    </points>
  );
}
