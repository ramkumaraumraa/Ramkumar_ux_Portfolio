"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SECTION_Z_POSITIONS } from '@/lib/scrollConstants';

/**
 * WorksScene: Floating distorted glass spheres for the Works section.
 * Positioned at Z=-15.
 */
export function WorksScene() {
  return (
    <group position={[0, 0, SECTION_Z_POSITIONS[1]]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[-4, 2, -2]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color="#ff00e5"
            speed={2}
            distort={0.4}
            radius={1}
            transparent
            opacity={0.6}
            roughness={0}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={0.5}>
        <mesh position={[4, -2, -1]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <MeshDistortMaterial
            color="#00d7ff"
            speed={3}
            distort={0.5}
            radius={1}
            transparent
            opacity={0.4}
            roughness={0}
          />
        </mesh>
      </Float>

      <pointLight position={[0, 0, 5]} intensity={1.5} color="#ff00e5" />
    </group>
  );
}
