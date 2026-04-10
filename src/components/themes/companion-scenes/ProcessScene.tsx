"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPLINE_POINTS } from '@/lib/scrollConstants';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const DIAMOND_POSITIONS: [number, number, number][] = [
  [0,  4,  0],  // top    → card 1 Strategizing  (cyan)
  [4,  0,  0],  // right  → card 2 Discovery      (pink)
  [0, -4,  0],  // bottom → card 3 Creation        (blue)
  [-4, 0,  0],  // left   → card 4 Optimizing     (cyan)
];

const NODE_COLORS   = ['#00d7ff', '#d946ef', '#60a5fa', '#00d7ff'];
const PHASE_OFFSETS = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

// Wire pairs: [nodeA, nodeB] — indices into DIAMOND_POSITIONS
const WIRE_PAIRS: [number, number][] = [[0,1],[1,2],[2,3],[3,0]];

export function ProcessScene() {
  const localProgress  = useSectionProgress(3);
  const activeNodeRef  = useRef(0);

  const nodeRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);
  const tubeRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);

  // Listen for card transitions from Process.tsx
  useEffect(() => {
    const handler = (e: Event) => {
      activeNodeRef.current = (e as CustomEvent<{ index: number }>).detail.index;
    };
    window.addEventListener('process-active-card', handler);
    return () => window.removeEventListener('process-active-card', handler);
  }, []);

  // Build tube geometries once
  const tubeGeometries = useMemo(() => {
    return WIRE_PAIRS.map(([a, b]) => {
      const pA = new THREE.Vector3(...DIAMOND_POSITIONS[a]);
      const pB = new THREE.Vector3(...DIAMOND_POSITIONS[b]);
      const curve = new THREE.CatmullRomCurve3([pA, pB]);
      return new THREE.TubeGeometry(curve, 8, 0.015, 6, false);
    });
  }, []);

  useFrame((state) => {
    const active = activeNodeRef.current;
    const t = state.clock.elapsedTime;

    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      // Vertical bob — all nodes
      const bob = Math.sin(t * 1.2 + PHASE_OFFSETS[i]) * 0.3;
      mesh.position.set(
        DIAMOND_POSITIONS[i][0],
        DIAMOND_POSITIONS[i][1] + bob,
        DIAMOND_POSITIONS[i][2],
      );

      // Emissive: active node glows bright, others dim
      const isActive = i === active;
      const targetEmissive = isActive ? 3.5 : 0.6;
      mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.06;

      // Scale: entrance lerp toward localProgress, plus pulse beat on active node
      const beatScale = isActive
        ? localProgress * (1 + Math.sin(t * 1.5 * Math.PI * 2) * 0.10)
        : localProgress;
      mesh.scale.setScalar(mesh.scale.x + (beatScale - mesh.scale.x) * 0.08);
    });

    // Wire connectors — brighten the two wires adjacent to active node
    tubeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const isAdjacent =
        WIRE_PAIRS[i][0] === active || WIRE_PAIRS[i][1] === active;
      const targetOpacity = isAdjacent
        ? 0.9 * localProgress
        : 0.4 * localProgress;
      mat.opacity += (targetOpacity - mat.opacity) * 0.06;
    });
  });

  return (
    <group position={SPLINE_POINTS[3]}>
      {/* Octahedron nodes — scale starts at 0, useFrame lerp brings in */}
      {DIAMOND_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { nodeRefs.current[i] = el; }}
          position={pos}
          scale={0}
        >
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial
            color={NODE_COLORS[i]}
            emissive={NODE_COLORS[i]}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Wire connectors */}
      {tubeGeometries.map((geom, i) => (
        <mesh
          key={`tube-${i}`}
          ref={(el) => { tubeRefs.current[i] = el; }}
          geometry={geom}
        >
          <meshStandardMaterial
            color="#94a3b8"
            emissive="#94a3b8"
            emissiveIntensity={0.4}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      <pointLight position={[4,  4, 2]} intensity={1.5} color="#00d7ff" />
      <pointLight position={[-4, -4, 2]} intensity={1.2} color="#d946ef" />
    </group>
  );
}
