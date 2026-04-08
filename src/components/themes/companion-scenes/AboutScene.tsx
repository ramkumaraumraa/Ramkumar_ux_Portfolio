"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';
import * as THREE from 'three';
import { SECTION_Z_POSITIONS } from '@/lib/scrollConstants';

/**
 * AboutScene: A glowing rotating ring for the About section.
 * Positioned at Z=-30.
 */
export function AboutScene() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group position={[0, 0, SECTION_Z_POSITIONS[2]]}>
      <Torus ref={ringRef} args={[4, 0.02, 16, 100]}>
        <meshStandardMaterial
          color="#00d7ff"
          emissive="#00d7ff"
          emissiveIntensity={10}
        />
      </Torus>
      
      {/* Dynamic light reflecting off the ring */}
      <pointLight position={[0, 0, 2]} intensity={2} color="#00d7ff" />
    </group>
  );
}
