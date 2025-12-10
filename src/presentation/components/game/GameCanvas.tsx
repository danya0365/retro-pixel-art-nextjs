"use client";

import type { User } from "@/src/domain/types/user";
import { Environment, Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { Player } from "./Player";
import { Ground } from "./world/Ground";
import { Trees } from "./world/Trees";

interface GameCanvasProps {
  user: User;
}

// Loading fallback for 3D scene
function SceneLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#c0c0c0" wireframe />
    </mesh>
  );
}

export function GameCanvas({ user }: GameCanvasProps) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        shadows
        camera={{
          position: [15, 15, 15],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "#87CEEB" }} // Sky blue background
      >
        <Suspense fallback={<SceneLoader />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          {/* Environment for better lighting */}
          <Environment preset="dawn" />

          {/* Physics World */}
          <Physics gravity={[0, -9.81, 0]}>
            {/* Ground */}
            <Ground />

            {/* Player */}
            <Player user={user} />

            {/* Trees */}
            <Trees />
          </Physics>

          {/* Grid helper (for development) */}
          <Grid
            args={[32, 32]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#006400"
            sectionSize={8}
            sectionThickness={1}
            sectionColor="#228B22"
            fadeDistance={50}
            fadeStrength={1}
            followCamera={false}
            position={[0, 0.01, 0]}
          />

          {/* Camera Controls */}
          <OrbitControls
            makeDefault
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={5}
            maxDistance={30}
            enablePan={true}
            panSpeed={0.5}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
