"use client";

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';
import HomeTheme from './Home_theme';
import CameraRig from './CameraRig';
import { Scenes } from './Scenes';
import { ScenePostProcessing } from './ScenePostProcessing';
import { SECTION_THRESHOLDS, SECTION_IDS } from '@/lib/scrollConstants';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    if (canvasRef.current) {
      const timer = setTimeout(() => {
        setCanvasReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [canvasRef.current]);

  useEffect(() => {
    if (canvasReady) {
      window.dispatchEvent(new CustomEvent('orchestrator-ready'));
      document.body.classList.add('effects-ready');
    }
  }, [canvasReady]);

  if (!enabled) return null;

  if (responsive.isMobile) {
    return null; // The background/overlays are handled in page.tsx for mobile
  }

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
        zIndex: 1,
        opacity: canvasReady ? 1 : 0,
        transition: 'opacity 0.6s ease-out'
      }}
    >
      {/* Background is now rendered at the root level in page.tsx */}

      <Canvas
          ref={canvasRef}
          camera={{
            position: [0, 0, 0],
            fov: 75,
            near: 0.1,
            far: 200
          }}
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
            powerPreference: 'high-performance'
          }}
          dpr={[1, responsive.isTablet ? 1.5 : 2]}
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

            <Scenes scrollProgressRef={scrollProgressRef} />

            <ScenePostProcessing currentSection={currentSection} />

            <Preload all />
          </Suspense>
        </Canvas>
    </div>
  );
}
