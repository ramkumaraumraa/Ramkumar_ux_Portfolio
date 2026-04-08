"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SECTION_Z_POSITIONS } from '@/lib/scrollConstants';

/**
 * HomeScene: Atmospheric depth for the Hero section.
 * Positioned at Z=0.
 */
export function HomeScene() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create shared random positions for particles
  const [positions] = React.useState(() => {
    const pos = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return pos;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <group position={[0, 0, SECTION_Z_POSITIONS[0]]}>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00d7ff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      <spotLight
        position={[0, 5, 5]}
        angle={0.15}
        penumbra={1}
        intensity={2}
        color="#00d7ff"
      />
    </group>
  );
}
