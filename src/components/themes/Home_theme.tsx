"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform float uScrollProgress;
  uniform float uSectionIndex;
  varying vec2 vUv;

  void main() {
    vec2 F = vUv * uResolution;

    float i = 0.2, a;
    vec2 r = uResolution.xy;
    vec2 p = (F + F - r) / r.y / 0.7;
    vec2 d = vec2(-1.0, 1.0);
    vec2 b = p - i * d;
    vec2 c = p * mat2(1.0, 1.0, d / (0.1 + i / dot(b, b)));

    a = dot(c, c);

    vec2 v = c * mat2(
      cos(0.5 * log(a) + uTime * i), 
      -sin(0.5 * log(a) + uTime * i),
      sin(0.5 * log(a) + uTime * i), 
      cos(0.5 * log(a) + uTime * i)
    ) / i;

    vec4 w = vec4(0.0);
    for(float j = 1.0; j <= 9.0; j++) {
      v += 0.7 * sin(v.yx * j + uTime) / j + 0.5;
      w += 1.0 + sin(vec4(v.x, v.y, v.y, v.x));
      i += 1.0;
    }

    i = length(sin(v / 0.3) * 0.4 + c * (3.0 + d));

    // Section-based color palettes with higher contrast
    vec4 currentColor;
    
    if (uSectionIndex < 1.0) {
      // Home to Works transition - CYAN TO PINK (keep as is)
      vec4 colorStart = vec4(0.4, -0.2, -1.2, 0.0);  // Deep cyan
      vec4 colorMid = vec4(0.8, -0.6, -0.8, 0.0);    // Bright cyan-pink
      vec4 colorEnd = vec4(1.0, -0.8, -0.4, 0.0);    // Intense pink
      
      if (uScrollProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, uScrollProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (uScrollProgress - 0.5) * 2.0);
      }
    } 
    else if (uSectionIndex < 2.0) {
      // Works to About transition - PINK TO DEEP VIOLET/INDIGO
      vec4 colorStart = vec4(1.0, -0.8, -0.4, 0.0);    // From pink
      vec4 colorMid = vec4(0.2, -0.8, -1.5, 0.0);      // Deep violet
      vec4 colorEnd = vec4(-0.3, -0.5, -1.8, 0.0);     // Indigo blue
      
      float localProgress = fract(uScrollProgress);
      if (localProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, localProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (localProgress - 0.5) * 2.0);
      }
    }
    else if (uSectionIndex < 3.0) {
      // About to Process transition - INDIGO TO VIBRANT GREEN/YELLOW
      vec4 colorStart = vec4(-0.3, -0.5, -1.8, 0.0);   // From indigo
      vec4 colorMid = vec4(-0.5, -1.2, 0.3, 0.0);      // Vibrant green
      vec4 colorEnd = vec4(1.5, -1.0, 0.5, 0.0);       // Yellow-green
      
      float localProgress = fract(uScrollProgress);
      if (localProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, localProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (localProgress - 0.5) * 2.0);
      }
    }
    else if (uSectionIndex < 4.0) {
      // Process to Footer transition - YELLOW TO MAGENTA/RED
      vec4 colorStart = vec4(1.5, -1.0, 0.5, 0.0);     // From yellow
      vec4 colorMid = vec4(1.2, -0.3, -0.8, 0.0);      // Magenta
      vec4 colorEnd = vec4(1.8, -0.1, -0.3, 0.0);      // Red-orange
      
      float localProgress = fract(uScrollProgress);
      if (localProgress < 0.5) {
        currentColor = mix(colorStart, colorMid, localProgress * 2.0);
      } else {
        currentColor = mix(colorMid, colorEnd, (localProgress - 0.5) * 2.0);
      }
    }
    else {
      // Footer - RED TO CYAN (complete the circle)
      vec4 colorStart = vec4(1.8, -0.1, -0.3, 0.0);    // From red-orange
      vec4 colorEnd = vec4(0.4, -0.2, -1.2, 0.0);      // Back to deep cyan
      
      float localProgress = fract(uScrollProgress);
      currentColor = mix(colorStart, colorEnd, localProgress);
    }

    vec4 O = 1.0 - exp(
      -exp(c.x * currentColor)
      / w.xyyx
      / (2.0 + i * i / 4.0 - i)
      / (0.5 + 1.0 / a)
      / (0.03 + abs(length(p) - 0.7))
    );

    // Adjust intensity based on scroll for smoother transitions
    float dynamicIntensity = uIntensity * (0.4 + 0.6 * (1.0 - uScrollProgress * 0.5));
    O.rgb *= dynamicIntensity;
    O.a = max(max(O.r, O.g), O.b) * dynamicIntensity;

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
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const { viewport } = useThree();
  const [sectionIndex, setSectionIndex] = useState(0);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uIntensity: { value: intensity },
        uScrollProgress: { value: 0 },
        uSectionIndex: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
  }, [intensity]);

  useEffect(() => {
    const handleResize = () => {
      shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shaderMaterial]);

  useEffect(() => {
    const sections = ['home', 'works', 'about', 'process', 'footer'];
    const index = sections.indexOf(currentSection);
    setSectionIndex(index >= 0 ? index : 0);
  }, [currentSection]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const currentTime = (Date.now() - startTime.current) * 0.001;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = currentTime;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uIntensity.value =
      intensityRef ? intensityRef.current : intensity;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uSectionIndex.value = sectionIndex;
    
    const scrollProgress = scrollData.progress || 0;
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uScrollProgress.value = scrollProgress;

    meshRef.current.visible = !transitionsEnabled;
  });

  const scale = responsive.isMobile ? 0.7 : 1;

  return (
    <mesh ref={meshRef} scale={[viewport.width * scale, viewport.height * scale, 1]} position={[0, 0, -5]}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} />
    </mesh>
  );
}
