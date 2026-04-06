"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const fullScreenVertex = `
  varying vec2 vUv;
  void main () {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const wormholeFragment = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform float uIntensity;
  uniform float uScrollIntensity;
  uniform vec2  uMouse;
  uniform float uFadeAlpha;
  uniform float uIter;
  uniform float uZoomAmount;
  uniform float uSectionProgress;
  uniform float uScrollDirection;

  float n(vec2 p){
    return sin(p.x*4. + sin(p.y*3.1)) * cos(p.y*1.3 + cos(p.x*2.7));
  }

  void mainImage(out vec4 O, vec2 C) {
    float i, d, z = 0.0, t = uTime;
    vec4 o = vec4(0.0), p;

    t += uScrollIntensity * 0.5 * uScrollDirection;
    C = mix(C, uResolution * 0.5 + (C - uResolution * 0.5) * uZoomAmount, uScrollIntensity);

    vec2 wob = uMouse * 0.02 + vec2(sin(t*0.2), cos(t*0.17)) * 0.01 * uScrollIntensity;
    C += wob * uResolution;

    const int MAX_STEPS = 75;
    for (int k = 0; k < MAX_STEPS; k++) {
      if (float(k) >= uIter) { break; }

      vec3 r  = vec3(uResolution, 0.0);
      vec3 rd = normalize(vec3(C - 0.5 * r.xy, r.y));
      
      float zDirection = mix(1.0, -0.5, (1.0 - uScrollDirection) * 0.5);
      p = vec4(z * rd * zDirection, t);
      p.z += t;

      mat2 R = mat2(cos(p.z * (0.3 + uSectionProgress * 0.1) * uScrollDirection + vec4(0.0, 11.0, 33.0, 0.0)));
      p.xy *= R;

      float N = n(p.xy + t*0.2);
      p = abs(fract(p) - 0.5);

      float tunnelSize = 0.08 + uSectionProgress * 0.02;
      float d1 = length(p.xy) - tunnelSize + N*0.04;
      float d2 = length(p.xz) - (0.12 + uSectionProgress * 0.02) + N*0.03;
      float d3 = max(p.x, p.y) - 0.15 + sin(t + N)*0.1;
      d = min(d1, min(d2, d3));
      d = abs(d) + 0.01;

      vec3 color1 = vec3(0.1, 0.5, 0.9);
      vec3 color2 = vec3(0.9, 0.4, 0.1);
      
      vec3 c = color1 / (length(p.xy + N));
      c += color2 / (length(p.xz + N));
      c *= (1.0 + uScrollIntensity * 0.35);

      o += vec4(c, 1.0) / d;
      
      z += d * 0.6 * mix(1.2, 0.8, (1.0 - uScrollDirection) * 0.5);
    }

    O = tanh(o / 30000.0);

    vec2 uv = vUv * 2.0 - 1.0;
    float vignette = 1.0 - smoothstep(0.9, 1.25, length(uv));

    O.rgb *= uIntensity * vignette;
    O.a = max(max(O.r, O.g), O.b) * uFadeAlpha * vignette;
  }

  void main() {
    vec4 col;
    vec2 C = vUv * uResolution;
    mainImage(col, C);
    gl_FragColor = col;
  }
`;

interface ParallaxProps {
  scrollData?: any;
  isIdle?: boolean;
  transitionsEnabled?: boolean;
  intensity?: number;
  responsive?: any;
  idleThresholdMs?: number;
  fadeLerpSpeed?: number;
  zoomAmount?: number;
  enableMouse?: boolean;
  currentSection?: string;
  sectionProgress?: number;
}

export default function Parallax({
  scrollData = {},
  isIdle = true,
  transitionsEnabled = true,
  intensity = 0.8,
  responsive = {},
  idleThresholdMs = 700,
  fadeLerpSpeed = 0.06,
  zoomAmount = 1.12,
  enableMouse = true,
  currentSection = 'home',
  sectionProgress = 0
}: ParallaxProps) {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const shaderRef = useRef<THREE.Mesh>(null);
  
  const [shaderAlpha, setShaderAlpha] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dynamicZoom, setDynamicZoom] = useState(1);
  const [idleTime, setIdleTime] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(1);
  
  const getIterations = () => {
    if (responsive.isMobile) {
      return currentSection === 'home' ? 30 : 25;
    }
    switch(currentSection) {
      case 'home': return 50;
      case 'works': return 55;
      case 'about': return 60;
      case 'process': return 55;
      case 'footer': return 45;
      default: return 50;
    }
  };

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: fullScreenVertex,
      fragmentShader: wormholeFragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uIntensity: { value: intensity },
        uScrollIntensity: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uFadeAlpha: { value: 1 },
        uIter: { value: getIterations() },
        uZoomAmount: { value: 1 },
        uSectionProgress: { value: 0 },
        uScrollDirection: { value: 1 }
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    });
  }, [intensity, responsive.isMobile]);

  useEffect(() => {
    const onResize = () => {
      if (!shaderRef.current) return;
      (shaderRef.current.material as THREE.ShaderMaterial).uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!enableMouse || responsive.isMobile) return;
    
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [enableMouse, responsive.isMobile]);

  useEffect(() => {
    if (isIdle) {
      const interval = setInterval(() => {
        setIdleTime(prev => prev + 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setIdleTime(0);
    }
  }, [isIdle]);

  useEffect(() => {
    if (shaderRef.current) {
      (shaderRef.current.material as THREE.ShaderMaterial).uniforms.uIter.value = getIterations();
    }
  }, [currentSection, responsive.isMobile]);

  useEffect(() => {
    const scrollVelocity = scrollData.velocity || 0;
    const absVelocity = Math.abs(scrollVelocity);
    
    const direction = scrollVelocity >= 0 ? 1 : -1;
    setScrollDirection(direction);
    
    const MULTIPLIERS: Record<string, number> = {
      home: 1.0,
      works: 1.1,
      about: 1.05,
      process: 1.15,
      footer: 0.95
    };

    const sectionMultiplier = MULTIPLIERS[currentSection] || 1.0;
    
    const scrollZoom = 1 + absVelocity * 0.2;
    const targetZoom = zoomAmount * sectionMultiplier * scrollZoom * (1 + sectionProgress * 0.1);
    
    setDynamicZoom(targetZoom);
  }, [scrollData.velocity, zoomAmount, currentSection, sectionProgress]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (shaderRef.current) {
      const mat = shaderRef.current.material as THREE.ShaderMaterial;
      
      mat.uniforms.uTime.value = elapsed;
      mat.uniforms.uScrollIntensity.value = Math.min(Math.abs(scrollData.velocity || 0) * 0.5, 1.0);
      mat.uniforms.uMouse.value.lerp(new THREE.Vector2(mousePosition.x, mousePosition.y), 0.1);
      mat.uniforms.uIntensity.value = intensity;
      mat.uniforms.uZoomAmount.value = THREE.MathUtils.lerp(
        mat.uniforms.uZoomAmount.value,
        dynamicZoom,
        fadeLerpSpeed
      );
      mat.uniforms.uSectionProgress.value = sectionProgress;
      
      mat.uniforms.uScrollDirection.value = THREE.MathUtils.lerp(
        mat.uniforms.uScrollDirection.value,
        scrollDirection,
        fadeLerpSpeed * 2
      );
      mat.uniforms.uFadeAlpha.value = shaderAlpha;
    }

    const isScrolling = Math.abs(scrollData.velocity || 0) > 0.01;
    const fadeOutAfterMs = idleThresholdMs * 2;
    const shouldFadeOut = idleTime > fadeOutAfterMs;
    
    const targetAlpha = transitionsEnabled && isScrolling ? 1 : 
                       (transitionsEnabled && !shouldFadeOut ? 0.3 : 0);
    
    setShaderAlpha((prev) => THREE.MathUtils.lerp(prev, targetAlpha, fadeLerpSpeed));

    if (groupRef.current && !responsive.isMobile) {
      const idleWobble = Math.sin(elapsed * 0.5) * 0.01 * (idleTime / 1000);
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mousePosition.y * 0.05 + idleWobble,
        0.1
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mousePosition.x * 0.05,
        0.1
      );
      
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        scrollDirection * 0.02 * Math.abs(scrollData.velocity || 0),
        0.1
      );
    }
  });

  const scale = responsive.isMobile ? 0.7 : 1;

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      <mesh
        ref={shaderRef}
        visible={shaderAlpha > 0.01}
        scale={[viewport.width * scale, viewport.height * scale, 1]}
      >
        <planeGeometry args={[2, 2, 1, 1]} />
        <primitive object={shaderMaterial} />
      </mesh>
    </group>
  );
}
