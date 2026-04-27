"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

// Original blackhole shader by @XorDev (shadertoy.com/view/3csSWB)
// Section color palettes drive the hue as the user scrolls.
// No secondary effects — just the void and the accretion disk.
const fragmentShader = `
  uniform float uTime;
  uniform vec2  uResolution;
  uniform float uIntensity;
  uniform float uScrollProgress;
  uniform float uScrollVelocity;
  uniform float uSectionIndex;
  varying vec2  vUv;

  void main() {
    vec2 F = vUv * uResolution;
    vec2 r = uResolution.xy;

    // ── Section colour palette ────────────────────────────────────────────────
    vec4 currentColor;

    if (uSectionIndex < 1.0) {
      // Home: deep cyan
      vec4 cA = vec4( 0.4, -0.2, -1.2, 0.0);
      vec4 cB = vec4( 0.8, -0.6, -0.8, 0.0);
      vec4 cC = vec4( 1.0, -0.8, -0.4, 0.0);
      float t = uScrollProgress;
      currentColor = t < 0.5 ? mix(cA, cB, t * 2.0) : mix(cB, cC, (t - 0.5) * 2.0);
    }
    else if (uSectionIndex < 2.0) {
      // Works: pink → indigo
      vec4 cA = vec4( 1.0, -0.8, -0.4, 0.0);
      vec4 cB = vec4( 0.2, -0.8, -1.5, 0.0);
      vec4 cC = vec4(-0.3, -0.5, -1.8, 0.0);
      float t = fract(uScrollProgress);
      currentColor = t < 0.5 ? mix(cA, cB, t * 2.0) : mix(cB, cC, (t - 0.5) * 2.0);
    }
    else if (uSectionIndex < 3.0) {
      // About: indigo → green/yellow
      vec4 cA = vec4(-0.3, -0.5, -1.8, 0.0);
      vec4 cB = vec4(-0.5, -1.2,  0.3, 0.0);
      vec4 cC = vec4( 1.5, -1.0,  0.5, 0.0);
      float t = fract(uScrollProgress);
      currentColor = t < 0.5 ? mix(cA, cB, t * 2.0) : mix(cB, cC, (t - 0.5) * 2.0);
    }
    else if (uSectionIndex < 4.0) {
      // Process: yellow → magenta/red
      vec4 cA = vec4( 1.5, -1.0,  0.5, 0.0);
      vec4 cB = vec4( 1.2, -0.3, -0.8, 0.0);
      vec4 cC = vec4( 1.8, -0.1, -0.3, 0.0);
      float t = fract(uScrollProgress);
      currentColor = t < 0.5 ? mix(cA, cB, t * 2.0) : mix(cB, cC, (t - 0.5) * 2.0);
    }
    else {
      // Footer: red → cyan loop
      vec4 cA = vec4( 1.8, -0.1, -0.3, 0.0);
      vec4 cC = vec4( 0.4, -0.2, -1.2, 0.0);
      currentColor = mix(cA, cC, fract(uScrollProgress));
    }

    // ── Blackhole (original @XorDev) ─────────────────────────────────────────
    float i = 0.2, a;
    vec2 p = (F + F - r) / r.y / 0.7;
    vec2 d = vec2(-1.0, 1.0);
    vec2 b = p - i * d;
    vec2 c = p * mat2(1.0, 1.0, d / (0.1 + i / dot(b, b)));

    a = dot(c, c);

    vec2 v = c * mat2(
       cos(0.5 * log(a) + uTime * i), -sin(0.5 * log(a) + uTime * i),
       sin(0.5 * log(a) + uTime * i),  cos(0.5 * log(a) + uTime * i)
    ) / i;

    vec4 w = vec4(0.0);
    for (float j = 1.0; j <= 9.0; j++) {
      v += 0.7 * sin(v.yx * j + uTime) / j + 0.5;
      w += 1.0 + sin(vec4(v.x, v.y, v.y, v.x));
      i += 1.0;
    }

    i = length(sin(v / 0.3) * 0.4 + c * (3.0 + d));

    vec4 O = 1.0 - exp(
      -exp(c.x * currentColor)
       / w.xyyx
       / (2.0 + i * i / 4.0 - i)
       / (0.5 + 1.0 / a)
       / (0.03 + abs(length(p) - 0.7))
    );

    O.rgb *= uIntensity;
    // Alpha: rim brightness drives opacity, but we keep a minimum floor (0.8)
    // so the accretion disk is always visible at rest, not just while scrolling.
    float rimBrightness = clamp(max(max(O.r, O.g), O.b), 0.0, 1.0);
    O.a = mix(0.8, 1.0, rimBrightness);

    gl_FragColor = O;
  }
`;

interface HomeThemeProps {
  intensity?: number;
  intensityRef?: React.MutableRefObject<number>;
  responsive?: any;
  transitionsEnabled?: boolean;
  scrollData?: any;
  currentSection?: string;
  isIdle?: boolean;
}

export default function HomeTheme({
  intensity = 1,
  intensityRef,
  responsive = {},
  transitionsEnabled = true,
  scrollData = {},
  currentSection = 'home'
}: HomeThemeProps) {
  const meshRef   = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const { gl }    = useThree();

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:           { value: 0 },
        uResolution:     { value: new THREE.Vector2(
          gl.domElement.width  || window.innerWidth,
          gl.domElement.height || window.innerHeight
        )},
        uIntensity:      { value: intensity },
        uScrollProgress: { value: 0 },
        uScrollVelocity: { value: 0 },
        uSectionIndex:   { value: 0 }
      },
      transparent: true,
      depthWrite:  false,
      depthTest:   false,
      side: THREE.DoubleSide,
    });
  }, [intensity, gl]);

  useEffect(() => {
    const handleResize = () => {
      const w = gl.domElement.clientWidth;
      const h = gl.domElement.clientHeight;
      shaderMaterial.uniforms.uResolution.value.set(
        w * window.devicePixelRatio,
        h * window.devicePixelRatio
      );
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shaderMaterial, gl]);

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;

    mat.uniforms.uTime.value      = (Date.now() - startTime.current) * 0.001;
    mat.uniforms.uIntensity.value = intensityRef ? intensityRef.current : intensity;

    const sections = ['home', 'works', 'about', 'process', 'footer'];
    const idx = sections.indexOf(currentSection);
    mat.uniforms.uSectionIndex.value = idx >= 0 ? idx : 0;

    mat.uniforms.uScrollProgress.value = scrollData.progress || 0;

    const targetVel = (scrollData.velocity || 0) * 0.035;
    mat.uniforms.uScrollVelocity.value +=
      (targetVel - mat.uniforms.uScrollVelocity.value) * 0.1;

    meshRef.current.visible = !transitionsEnabled;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} />
    </mesh>
  );
}
