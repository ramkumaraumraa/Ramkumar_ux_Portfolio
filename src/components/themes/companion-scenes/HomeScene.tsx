"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SPLINE_POINTS } from '@/lib/scrollConstants';
import { useSectionProgress } from '@/hooks/useSectionProgress';

/**
 * HomeScene: Dual-ring ambient vortex — outer CW ring + inner CCW cluster.
 * Culls when camera is far (localProgress === 0).
 */
export function HomeScene() {
  const localProgress = useSectionProgress(0);
  const outerRef = useRef<THREE.Points>(null);
  const innerRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const [outerPositions] = React.useState(() => {
    const pos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 7 + (Math.random() - 0.5) * 2; // radius ~8
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  });

  const [innerPositions] = React.useState(() => {
    const pos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.5 + (Math.random() - 0.5) * 1.2; // radius ~3
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  });

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.15;
  });

  if (localProgress === 0) return null;

  const opacity = localProgress;

  return (
    <group ref={groupRef} position={SPLINE_POINTS[0]}>
      <OuterRing
        outerRef={outerRef}
        positions={outerPositions}
        opacity={opacity}
        localProgress={localProgress}
      />
      <InnerCluster
        innerRef={innerRef}
        positions={innerPositions}
        opacity={opacity}
        localProgress={localProgress}
      />
      <spotLight position={[0, 5, 5]} angle={0.15} penumbra={1} intensity={2} color="#00d7ff" />
    </group>
  );
}

function OuterRing({ outerRef, positions, opacity, localProgress }: any) {
  useFrame((state) => {
    if (!outerRef.current) return;
    outerRef.current.rotation.y += 0.0008; // clockwise
    // breathing pulse
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.04;
    outerRef.current.scale.setScalar(localProgress * pulse);
  });
  return (
    <Points ref={outerRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00d7ff"
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={opacity * 0.8}
      />
    </Points>
  );
}

function InnerCluster({ innerRef, positions, opacity, localProgress }: any) {
  useFrame((state) => {
    if (!innerRef.current) return;
    innerRef.current.rotation.y -= 0.0015; // counter-clockwise
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.04;
    innerRef.current.scale.setScalar(localProgress * pulse);
  });
  return (
    <Points ref={innerRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#cc44ff"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={opacity * 0.7}
      />
    </Points>
  );
}
