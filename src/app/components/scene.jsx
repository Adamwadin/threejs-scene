"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, Stars } from "@react-three/drei";
import { useState } from "react";
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  DepthOfField,
} from "@react-three/postprocessing";

export default function Scene() {
  const moonTexture = useLoader(THREE.TextureLoader, "/textures/moon.png");

  return (
    <div style={{ width: "100%", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 2, 15], fov: 60 }}>
        <Suspense fallback={null}>
          <color attach="background" args={["#000"]} />
          <fog attach="fog" args={["#000", 15, 50]} />
          <ambientLight intensity={0.1} />

          <Stars
            radius={100}
            depth={50}
            count={500}
            factor={5}
            saturation={0.5}
            fade={true}
          />

          <group>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[2, 32, 32]} />
              <meshStandardMaterial map={moonTexture} />
            </mesh>

            <Moon
              position={[4, 0, 0]}
              orbitSpeed={0.5}
              distance={4}
              color="gray"
            />
            <Moon
              position={[-4, 0, 0]}
              orbitSpeed={0.3}
              distance={4}
              color="gray"
            />
            <Moon
              position={[2, 2, 4]}
              orbitSpeed={0.7}
              distance={5}
              color="gray"
            />
          </group>

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={1.5}
            />
            <Noise opacity={0.02} />
            <Vignette darkness={0.5} offset={0.1} />
            <DepthOfField
              focusDistance={0.01}
              focalLength={0.2}
              bokehScale={3}
            />
          </EffectComposer>

          <OrbitControls
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={3}
            maxDistance={50}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "rgba(0,10,30,0.7)",
          padding: "10px",
          borderRadius: "10px",
          color: "#8af",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: "18px", marginBottom: "5px" }}>mooooon</div>
      </div>
    </div>
  );
}

function Moon({ position, orbitSpeed, distance, color }) {
  const moonRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const x = Math.sin(t * orbitSpeed) * distance;
    const z = Math.cos(t * orbitSpeed) * distance;

    moonRef.current.position.x = x;
    moonRef.current.position.z = z;
  });

  return (
    <mesh ref={moonRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
