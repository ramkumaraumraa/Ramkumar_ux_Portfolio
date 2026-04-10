"use client";

import React from 'react';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import { SPLINE_POINTS } from '@/lib/scrollConstants';
import { useSectionProgress } from '@/hooks/useSectionProgress';

/**
 * WorksScene: 3 desaturated orbs in asymmetric triangle.
 * Tailwind 400-500 range colors — no full neon.
 * Culls when camera is far.
 */
export function WorksScene() {
  const localProgress = useSectionProgress(1);
  if (localProgress === 0) return null;

  return (
    <group position={SPLINE_POINTS[1]}>
      {/* fuchsia-500, desaturated */}
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh position={[-5, 2.5, -2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color="#d946ef"
            speed={2}
            distort={0.35}
            radius={1}
            transparent
            opacity={0.55 * localProgress}
            roughness={0}
          />
        </mesh>
      </Float>

      {/* cyan-400 */}
      <Float speed={1.3} rotationIntensity={1.5} floatIntensity={0.7}>
        <mesh position={[5, -1.5, -1]}>
          <sphereGeometry args={[0.85, 32, 32]} />
          <MeshDistortMaterial
            color="#22d3ee"
            speed={2.5}
            distort={0.45}
            radius={1}
            transparent
            opacity={0.45 * localProgress}
            roughness={0}
          />
        </mesh>
      </Float>

      {/* violet-400 */}
      <Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.9}>
        <mesh position={[0, -3, -3]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <MeshDistortMaterial
            color="#a78bfa"
            speed={3}
            distort={0.5}
            radius={1}
            transparent
            opacity={0.4 * localProgress}
            roughness={0}
          />
        </mesh>
      </Float>

      {/* warm near-white lavender fill light */}
      <pointLight position={[0, 0, 5]} intensity={1.2} color="#f0e6ff" />
    </group>
  );
}
