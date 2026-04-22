"use client";

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';
import HomeTheme from './Home_theme';
import CameraRig from './CameraRig';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { SECTION_THRESHOLDS, SECTION_IDS } from '@/lib/scrollConstants';


const SECTION_FX: Record<string, { bloom: number; noise: number }> = {
  home:    { bloom: 1.8,  noise: 0.015 },
  works:   { bloom: 0.9,  noise: 0.02  },
  about:   { bloom: 0.7,  noise: 0.02  },
  process: { bloom: 1.1,  noise: 0.025 },
  footer:  { bloom: 0.5,  noise: 0.03  },
};

interface OrchestratorProps {
  lenis?: any;
  responsive?: any;
  enabled?: boolean;
  intensity?: number;
  idleThresholdMs?: number;
  fadeLerpSpeed?: number;
  enableMouse?: boolean;
  zoomAmount?: number;
  modelOffset?: number;
  scrollProgressRef?: React.MutableRefObject<number>;
}

export default function Orchestrator({
  lenis,
  responsive = {},
  enabled = true,
  intensity = 1,
  idleThresholdMs = 700,
  fadeLerpSpeed = 0.05,
  enableMouse = true,
  scrollProgressRef: externalScrollProgressRef,
  ...props
}: OrchestratorProps) {
  const [scrollData, setScrollData] = useState({
    velocity: 0,
    direction: 0,
    progress: 0,
    isScrolling: false
  });
  const [isIdle, setIsIdle] = useState(true);
  const [currentSection, setCurrentSection] = useState('home');
  const [canvasReady, setCanvasReady] = useState(false);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef(Date.now());
  const rafRef = useRef<number | null>(null);
  const velocityBufferRef = useRef<number[]>([]);
  const intensityRef = useRef(intensity);
  const internalScrollProgressRef = useRef(0);
  const scrollProgressRef = externalScrollProgressRef ?? internalScrollProgressRef;
  
  const updateSectionFromProgress = (progress: number) => {
    let section: string = 'home';
    for (let i = 0; i < SECTION_THRESHOLDS.length; i++) {
      if (progress >= SECTION_THRESHOLDS[i]) section = SECTION_IDS[i + 1];
    }
    setCurrentSection(section);
  };

  const currentFx = SECTION_FX[currentSection] ?? SECTION_FX.home;

  const updateVelocityBuffer = (v: number) => {
    velocityBufferRef.current.push(v);
    if (velocityBufferRef.current.length > 5) velocityBufferRef.current.shift();
    const sum = velocityBufferRef.current.reduce((a, b) => a + b, 0);
    return sum / velocityBufferRef.current.length;
  };


  useEffect(() => {
    if (!lenis) return;

    const handleScroll = (e: any) => {
      const now = Date.now();
      lastScrollTime.current = now;

      const smoothVelocity = updateVelocityBuffer(e.velocity || 0);

      updateSectionFromProgress(e.progress || 0);

      setScrollData({
        velocity: smoothVelocity,
        direction: e.direction || 0,
        progress: e.progress || 0,
        isScrolling: true
      });

      setIsIdle(false);

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
        setScrollData(prev => ({ ...prev, isScrolling: false, velocity: 0 }));
      }, idleThresholdMs);
    };

    lenis.on('scroll', handleScroll);

    return () => {
      lenis.off('scroll', handleScroll);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [lenis, idleThresholdMs]);




  useEffect(() => {
    if (canvasReady) {
      window.dispatchEvent(new CustomEvent('orchestrator-ready'));
      document.body.classList.add('effects-ready');
    }
  }, [canvasReady]);

  if (!enabled) return null;

  return (
    <div 
      className="parallax-canvas-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1500,
        opacity: canvasReady ? 1 : 0,
        transition: 'opacity 0.6s ease-out'
      }}
    >
      {/* Background is now rendered at the root level in page.tsx */}

      <Canvas
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0); // transparent so CSS layers show through
            setTimeout(() => setCanvasReady(true), 100);
          }}
          camera={{
            position: [0, 0, 0],
            fov: 75,
            near: 0.1,
            far: 200
          }}
      gl={{
        alpha: true,
        antialias: true,
        stencil: false,
        depth: true,
        premultipliedAlpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        powerPreference: 'high-performance'
      }}
          dpr={[1, (responsive.isMobile || responsive.isTablet) ? 1.5 : 2]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        >
          <Suspense fallback={null}>
            <HomeTheme
              intensityRef={intensityRef}
              responsive={responsive}
              transitionsEnabled={false}
              scrollData={scrollData}
              isIdle={isIdle}
              currentSection={currentSection}
            />

            <CameraRig
              scrollProgressRef={scrollProgressRef}
              intensityRef={intensityRef}
            />

            <PostEffects currentFx={currentFx} />

            <Preload all />
          </Suspense>
        </Canvas>
    </div>
  );
}

function PostEffects({ currentFx }: { currentFx: any }) {
  // Ensure the composer maintains transparency for the CSS background
  return (
    <EffectComposer 
      multisampling={0} 
      frameBufferType={THREE.HalfFloatType}
      stencilBuffer={false}
    >
      <Bloom
        intensity={currentFx.bloom}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.1}
        mipmapBlur
      />
      <Noise opacity={currentFx.noise} />
    </EffectComposer>
  );
}
