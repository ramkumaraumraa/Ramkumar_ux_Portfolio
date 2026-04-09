"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SECTION_Z_POSITIONS } from '@/lib/scrollConstants';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const RAIN_VERT = `
uniform float uTime;
attribute float aOffset;
void main() {
  vec3 pos = position;
  pos.y = mod(position.y - uTime * 0.5 + aOffset, 10.0) - 5.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 3.0;
}
`;

const MIST_VERT = `
uniform float uTime;
attribute float aOffset;
void main() {
  vec3 pos = position;
  pos.y = mod(position.y - uTime * 0.18 + aOffset, 10.0) - 5.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 5.0;
}
`;

const FRAG = `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  gl_FragColor = vec4(uColor, uOpacity);
}
`;

function buildLayer(count: number) {
  const positions = new Float32Array(count * 3);
  const offsets   = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    offsets[i]            = Math.random() * 10;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aOffset',  new THREE.BufferAttribute(offsets, 1));
  return geo;
}

/**
 * FooterScene: 2-layer GPU particle rain.
 * Rain layer: slate-200, falls fast. Mist layer: cyan-400, drifts slow.
 * Zero CPU position mutation — uTime drives Y in vertex shader.
 * Culls when camera is far.
 */
export function FooterScene() {
  const localProgress = useSectionProgress(4);
  const rainMatRef = useRef<THREE.ShaderMaterial>(null);
  const mistMatRef = useRef<THREE.ShaderMaterial>(null);

  const rainGeo = useMemo(() => buildLayer(200), []);
  const mistGeo = useMemo(() => buildLayer(100), []);

  const rainUniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uColor:   { value: new THREE.Color('#e2e8f0') },
    uOpacity: { value: 0.3 },
  }), []);

  const mistUniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uColor:   { value: new THREE.Color('#22d3ee') },
    uOpacity: { value: 0.1 },
  }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (rainMatRef.current) {
      rainMatRef.current.uniforms.uTime.value = t;
      rainMatRef.current.uniforms.uOpacity.value = 0.3 * localProgress;
    }
    if (mistMatRef.current) {
      mistMatRef.current.uniforms.uTime.value = t;
      mistMatRef.current.uniforms.uOpacity.value = 0.1 * localProgress;
    }
  });

  if (localProgress === 0) return null;

  return (
    <group position={[0, 0, SECTION_Z_POSITIONS[4]]}>
      {/* Rain — slate-200, fast fall */}
      <points geometry={rainGeo}>
        <shaderMaterial
          ref={rainMatRef}
          vertexShader={RAIN_VERT}
          fragmentShader={FRAG}
          uniforms={rainUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Mist — cyan-400, slow drift */}
      <points geometry={mistGeo}>
        <shaderMaterial
          ref={mistMatRef}
          vertexShader={MIST_VERT}
          fragmentShader={FRAG}
          uniforms={mistUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <ambientLight intensity={0.2} />
    </group>
  );
}
