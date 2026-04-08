"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Octahedron } from '@react-three/drei';
import * as THREE from 'three';
import { SECTION_Z_POSITIONS } from '@/lib/scrollConstants';

/**
 * ProcessScene: Orbiting geometric icons for the Process section.
 * Positioned at Z=-45.
 */
export function ProcessScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[0, 0, SECTION_Z_POSITIONS[3]]}>
      <group ref={groupRef}>
        {[0, 1, 2, 3].map((i) => (
          <Octahedron
            key={i}
            args={[0.5]}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 5,
              Math.sin((i / 4) * Math.PI * 2) * 5,
              0
            ]}
          >
            <meshStandardMaterial
              color={i % 2 === 0 ? "#ff00e5" : "#00d7ff"}
              emissive={i % 2 === 0 ? "#ff00e5" : "#00d7ff"}
              emissiveIntensity={2}
            />
          </Octahedron>
        ))}
      </group>
      <rectAreaLight
        width={10}
        height={10}
        intensity={1}
        color="#ff00e5"
        position={[0, 0, -2]}
      />
    </group>
  );
}
