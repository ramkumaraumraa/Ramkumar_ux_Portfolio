"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SECTION_Z_POSITIONS } from '@/lib/scrollConstants';

/**
 * FooterScene: A slow rain of particles for the final section.
 * Positioned at Z=-60.
 */
export function FooterScene() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Slow particle rain
      array[i * 3 + 1] -= delta * 0.5;
      if (array[i * 3 + 1] < -5) array[i * 3 + 1] = 5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={[0, 0, SECTION_Z_POSITIONS[4]]}>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00d7ff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </Points>
      
      <ambientLight intensity={0.2} />
      <pointLight position={[0, -5, 2]} intensity={1} color="#ff00e5" />
    </group>
  );
}
