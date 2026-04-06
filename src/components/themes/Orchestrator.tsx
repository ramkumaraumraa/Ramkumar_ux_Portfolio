"use client";

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';
import HomeTheme from './Home_theme';
import Background from './Background';

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
}

export default function Orchestrator({ 
  lenis,
  responsive = {},
  enabled = true,
  intensity = 1,
  idleThresholdMs = 700,
  fadeLerpSpeed = 0.05,
  enableMouse = true,
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
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef(Date.now());
  const rafRef = useRef<number | null>(null);
  const velocityBufferRef = useRef<number[]>([]);
  
  const sectionRefs = useRef<Record<string, { top: number, bottom: number }>>({
    home: { top: 0, bottom: 0 },
    works: { top: 0, bottom: 0 },
    about: { top: 0, bottom: 0 },
    process: { top: 0, bottom: 0 },
    footer: { top: 0, bottom: 0 }
  });

  const updateVelocityBuffer = (v: number) => {
    velocityBufferRef.current.push(v);
    if (velocityBufferRef.current.length > 5) velocityBufferRef.current.shift();
    const sum = velocityBufferRef.current.reduce((a, b) => a + b, 0);
    return sum / velocityBufferRef.current.length;
  };

  useEffect(() => {
    const measureSections = () => {
      const sections = ['home', 'works', 'about', 'process', 'footer'];
      
      sections.forEach(section => {
        const el = document.getElementById(section === 'home' ? 'hero' : section);
        if (el) {
          const rect = el.getBoundingClientRect();
          sectionRefs.current[section] = {
            top: rect.top + window.scrollY,
            bottom: rect.bottom + window.scrollY
          };
        }
      });
    };
    
    measureSections();
    window.addEventListener('resize', measureSections);
    window.addEventListener('load', measureSections);
    
    setTimeout(measureSections, 1000);
    
    return () => {
      window.removeEventListener('resize', measureSections);
      window.removeEventListener('load', measureSections);
    };
  }, []);

  const updateSectionState = (scrollY: number) => {
    const sections = sectionRefs.current;
    let newSection = 'home';
    
    if (scrollY >= sections.footer.top) {
      newSection = 'footer';
    } else if (scrollY >= sections.process.top) {
      newSection = 'process';
    } else if (scrollY >= sections.about.top) {
      newSection = 'about';
    } else if (scrollY >= sections.works.top) {
      newSection = 'works';
    } else {
      newSection = 'home';
    }
    
    setCurrentSection(newSection);
  };

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = (e: any) => {
      const now = Date.now();
      lastScrollTime.current = now;

      const smoothVelocity = updateVelocityBuffer(e.velocity || 0);
      const y = typeof e.scroll === 'number' ? e.scroll : window.scrollY;

      updateSectionState(y);

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
    if (lenis) return;

    let lastScrollY = window.scrollY;

    const calculateVelocity = () => {
      const currentScrollY = window.scrollY;
      const raw = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      updateSectionState(currentScrollY);

      const smooth = updateVelocityBuffer(raw);

      setScrollData(prev => ({
        ...prev,
        velocity: smooth * 0.5,
        direction: raw > 0 ? 1 : raw < 0 ? -1 : 0,
        progress: (document.body.scrollHeight - window.innerHeight) > 0
          ? currentScrollY / (document.body.scrollHeight - window.innerHeight)
          : 0
      }));

      rafRef.current = requestAnimationFrame(calculateVelocity);
    };

    const handleScroll = () => {
      lastScrollTime.current = Date.now();
      setIsIdle(false);
      setScrollData(prev => ({ ...prev, isScrolling: true }));

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
        setScrollData(prev => ({ ...prev, isScrolling: false, velocity: 0 }));
      }, idleThresholdMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    rafRef.current = requestAnimationFrame(calculateVelocity);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [lenis, idleThresholdMs]);

  const handleBackgroundReady = () => {
    setBackgroundReady(true);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const timer = setTimeout(() => {
        setCanvasReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [canvasRef.current]);

  useEffect(() => {
    if (backgroundReady && canvasReady) {
      window.dispatchEvent(new CustomEvent('orchestrator-ready'));
      document.body.classList.add('effects-ready');
    }
  }, [backgroundReady, canvasReady]);

  if (!enabled) return null;

  if (responsive.isMobile) {
    return (
      <div 
        className="mobile-background-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <Background onReady={handleBackgroundReady} />
      </div>
    );
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
        opacity: backgroundReady ? 1 : 0,
        transition: 'opacity 0.6s ease-out'
      }}
    >
      <Background onReady={handleBackgroundReady} />
      
      {backgroundReady && (
        <Canvas
          ref={canvasRef}
          camera={{ 
            position: [0, 0, 5], 
            fov: 75,
            near: 0.1,
            far: 100
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
              intensity={intensity} 
              responsive={responsive}
              transitionsEnabled={false}
              scrollData={scrollData}
              isIdle={isIdle}
              currentSection={currentSection}
            />
            
            <Preload all />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
