"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPLINE_POINTS } from '@/lib/scrollConstants';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const DIAMOND_POSITIONS: [number, number, number][] = [
  [0, 4, 0],   // top
  [4, 0, 0],   // right
  [0, -4, 0],  // bottom
  [-4, 0, 0],  // left
];

// Process step colors — turquoise, pink, blue, turquoise
const NODE_COLORS = ['#00d7ff', '#d946ef', '#60a5fa', '#00d7ff'];

// Phase offsets so nodes pulse independently
const PHASE_OFFSETS = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

/**
 * ProcessScene: Diamond formation + TubeGeometry wire connectors.
 * Nodes pulse in place on independent sin waves — no group rotation.
 * Culls when camera is far.
 */
export function ProcessScene() {
  const localProgress = useSectionProgress(3);
  const nodeRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  // Build 4 tube geometries connecting adjacent diamond nodes
  const tubes = useMemo(() => {
    const pairs: [number, number][] = [[0,1],[1,2],[2,3],[3,0]];
    return pairs.map(([a, b]) => {
      const pA = new THREE.Vector3(...DIAMOND_POSITIONS[a]);
      const pB = new THREE.Vector3(...DIAMOND_POSITIONS[b]);
      const curve = new THREE.CatmullRomCurve3([pA, pB]);
      return new THREE.TubeGeometry(curve, 8, 0.015, 6, false);
    });
  }, []);

  useFrame((state) => {
    nodeRefs.forEach((ref, i) => {
      if (!ref.current) return;
      // Vertical pulse in place — no orbit
      const bob = Math.sin(state.clock.elapsedTime * 1.2 + PHASE_OFFSETS[i]) * 0.3;
      const base = DIAMOND_POSITIONS[i];
      ref.current.position.set(base[0], base[1] + bob, base[2]);
    });
  });

  if (localProgress === 0) return null;

  return (
    <group position={SPLINE_POINTS[3]}>
      {/* Octahedron nodes */}
      {DIAMOND_POSITIONS.map((pos, i) => (
        <mesh key={i} ref={nodeRefs[i]} position={pos}>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial
            color={NODE_COLORS[i]}
            emissive={NODE_COLORS[i]}
            emissiveIntensity={1.8}
          />
        </mesh>
      ))}

      {/* Wire connectors */}
      {tubes.map((geom, i) => (
        <mesh key={`tube-${i}`} geometry={geom}>
          <meshStandardMaterial
            color="#94a3b8"
            emissive="#94a3b8"
            emissiveIntensity={0.4}
            transparent
            opacity={0.5 * localProgress}
          />
        </mesh>
      ))}

      <pointLight position={[4, 4, 2]} intensity={1.5} color="#00d7ff" />
      <pointLight position={[-4, -4, 2]} intensity={1.2} color="#d946ef" />
    </group>
  );
}
