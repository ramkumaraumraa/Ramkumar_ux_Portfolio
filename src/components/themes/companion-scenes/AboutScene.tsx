"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SECTION_Z_POSITIONS } from '@/lib/scrollConstants';
import { useSectionProgress } from '@/hooks/useSectionProgress';

/**
 * AboutScene: 3-ring gyroscope / orrery.
 * Ring1 rotates Z, Ring2 rotates X, Ring3 rotates Y — different axes + rates.
 * emissiveIntensity 1.5 (Bloom handles the glow).
 * Culls when camera is far.
 */
export function AboutScene() {
  const localProgress = useSectionProgress(2);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ring1Ref.current || !ring2Ref.current || !ring3Ref.current) return;

    ring1Ref.current.rotation.z += 0.008;
    ring2Ref.current.rotation.x += 0.012;
    ring3Ref.current.rotation.y += 0.006;

    // Entrance: lerp scale from 0 → 1 as localProgress arrives
    const target = localProgress;
    ring1Ref.current.scale.setScalar(ring1Ref.current.scale.x + (target - ring1Ref.current.scale.x) * 0.08);
    ring2Ref.current.scale.setScalar(ring2Ref.current.scale.x + (target - ring2Ref.current.scale.x) * 0.08);
    ring3Ref.current.scale.setScalar(ring3Ref.current.scale.x + (target - ring3Ref.current.scale.x) * 0.08);
  });

  if (localProgress === 0) return null;

  return (
    <group position={[0, 0, SECTION_Z_POSITIONS[2]]}>
      {/* Ring 1 — cyan, outer, rotates Z */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[4, 0.015, 16, 120]} />
        <meshStandardMaterial
          color="#00d7ff"
          emissive="#00d7ff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Ring 2 — near-white, mid, rotates X */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.8, 0.015, 16, 120]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Ring 3 — fuchsia, inner, rotates Y */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.6, 0.015, 16, 120]} />
        <meshStandardMaterial
          color="#d946ef"
          emissive="#d946ef"
          emissiveIntensity={1.5}
        />
      </mesh>

      <pointLight position={[0, 0, 2]} intensity={1.5} color="#00d7ff" />
    </group>
  );
}
