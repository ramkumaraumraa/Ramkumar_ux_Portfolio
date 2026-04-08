"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Loader from '../components/Loader';
import Cursor from '../components/Cursor';
import Navbar from '../components/Navbar';
import Background from '../components/themes/Background';
import { SectionPanel } from '../components/themes/SectionPanel';

const Orchestrator = dynamic(() => import('../components/themes/Orchestrator'), { ssr: false });
const HomeSection    = dynamic(() => import('../components/sections/Home'),    { ssr: false });
const WorksSection   = dynamic(() => import('../components/sections/Works'),   { ssr: false });
const AboutSection   = dynamic(() => import('../components/sections/About'),   { ssr: false });
const ProcessSection = dynamic(() => import('../components/sections/Process'), { ssr: false });
const FooterSection  = dynamic(() => import('../components/sections/Footer'),  { ssr: false });

import { 
  SECTION_THRESHOLDS, 
  SECTION_IDS, 
  VIRTUAL_MAX 
} from '@/lib/scrollConstants';

export default function Page() {
  const [loaderComplete, setLoaderComplete]   = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [preparingExit, setPreparingExit]     = useState(false);
  const [activeSection, setActiveSection]     = useState('home');

  // Virtual scroll state — no proxy div, no window.scrollY
  const virtualScrollRef  = useRef(0);   // smoothed accumulator (px)
  const targetScrollRef   = useRef(0);   // raw target (px)
  const scrollProgressRef = useRef(0);   // 0-1
  const rafIdRef          = useRef<number>(0);
  const touchStartY       = useRef(0);

  const [responsive, setResponsive] = useState({ isMobile: false, isTablet: false });

  // Full event-emitter shim — Orchestrator's lenis.on('scroll') path works normally
  const lenisRef = useRef<any>(
    (() => {
      const listeners: Record<string, Set<Function>> = {};
      return {
        get scroll() { return virtualScrollRef.current; },
        on(event: string, fn: Function)  { (listeners[event] ??= new Set()).add(fn); },
        off(event: string, fn: Function) { listeners[event]?.delete(fn); },
        emit(event: string, data: any)   { listeners[event]?.forEach(fn => fn(data)); },
      };
    })()
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const check = () => setResponsive({
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth < 1024,
    });
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Preload WebGL before loader exits */
  useEffect(() => {
    const onExit = () => setPreparingExit(true);
    window.addEventListener('loader-exiting', onExit);
    return () => window.removeEventListener('loader-exiting', onExit);
  }, []);

  // ── Detect section from virtual progress ──────────────────────
  const updateSection = useCallback((progress: number) => {
    let section = 'home';
    for (let i = 0; i < SECTION_THRESHOLDS.length; i++) {
      if (progress >= SECTION_THRESHOLDS[i]) section = SECTION_IDS[i + 1];
    }
    setActiveSection(prev => prev !== section ? section : prev);
  }, []);

  // ── Virtual scroll engine (wheel + touch) ─────────────────────
  useEffect(() => {
    if (!loaderComplete) return;

    // Lock native scroll completely — no proxy div needed
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const WHEEL_MULT  = 1.4;
    const TOUCH_MULT  = 2.5;
    const EASE        = 0.085; // lerp factor per frame

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Allow infinite growth/shrinkage, we'll modulo in the tick
      targetScrollRef.current += e.deltaY * WHEEL_MULT;
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;
      targetScrollRef.current += dy * TOUCH_MULT;
    };

    // Smooth loop
    let lastVirtual = 0;
    let lastEmitTime = Date.now();
    const tick = () => {
      const prev = virtualScrollRef.current;
      
      // ── Loop/Modulo Target ──
      // Keep target within [0, VIRTUAL_MAX] for stability
      targetScrollRef.current = ((targetScrollRef.current % VIRTUAL_MAX) + VIRTUAL_MAX) % VIRTUAL_MAX;

      // ── Shortest Path Lerp ──
      let diff = targetScrollRef.current - prev;
      // If distance > 50% of the tunnel, it's faster to go around the back
      if (Math.abs(diff) > VIRTUAL_MAX / 2) {
        diff -= Math.sign(diff) * VIRTUAL_MAX;
      }

      // Compute current normalized progress for snapping logic
      const currentProgress = prev / VIRTUAL_MAX;
      
      // Soft Magnetic Snap Logic
      const SNAP_RADIUS = 0.012; 
      let isNearDock = false;
      for (const t of SECTION_THRESHOLDS) {
        // Distance considering wrap-around
        const d = Math.abs(currentProgress - t);
        const wrappedD = Math.min(d, 1 - d); 
        if (wrappedD < SNAP_RADIUS) {
          isNearDock = true;
          break;
        }
      }
      
      const dynamicEase = isNearDock ? 0.025 : 0.07;
      virtualScrollRef.current += diff * dynamicEase;

      // Normalize virtual scroll after movement
      virtualScrollRef.current = ((virtualScrollRef.current % VIRTUAL_MAX) + VIRTUAL_MAX) % VIRTUAL_MAX;

      // Stop jitter
      if (Math.abs(diff) < 0.1) {
        virtualScrollRef.current = targetScrollRef.current;
      }

      const progress = virtualScrollRef.current / VIRTUAL_MAX;
      const rawDelta = virtualScrollRef.current - lastVirtual;

      if (progress !== scrollProgressRef.current || Math.abs(rawDelta) > 0.01) {
        scrollProgressRef.current = progress;
        updateSection(progress);
        ScrollTrigger.update();

        // Fire lenis-compatible scroll event so Orchestrator velocity/idle logic works
        const now = Date.now();
        const dt = Math.max(1, now - lastEmitTime);
        const velocity = rawDelta / dt;   // px/ms
        
        lenisRef.current.emit('scroll', {
          scroll: virtualScrollRef.current,
          progress,
          velocity,
          direction: rawDelta >= 0 ? 1 : -1,
        });

        // Fire global virtual-scroll event for the Background component and other listeners
        window.dispatchEvent(new CustomEvent('virtual-scroll', { 
          detail: { 
            progress,
            scroll: virtualScrollRef.current,
            velocity,
            direction: rawDelta >= 0 ? 1 : -1
          } 
        }));

        lastEmitTime = now;
      }

      lastVirtual = virtualScrollRef.current;
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [loaderComplete, updateSection]);

  // ── Nav-click scroll (jump to section by progress) ───────────
  const handleSetActiveTab = useCallback((tab: string) => {
    const idx = SECTION_IDS.indexOf(tab as any);
    const threshold = SECTION_THRESHOLDS[idx - 1] ?? 0;
    const targetPx = threshold * VIRTUAL_MAX;
    
    // Instead of jumping, we set the target. The tick loop will handle the shortest path.
    targetScrollRef.current = targetPx;
    setActiveSection(tab);
  }, []);

  useEffect(() => {
    if (backgroundReady) (window as any).backgroundReady = true;
  }, [backgroundReady]);

  const handleLoaderComplete = () => {
    gsap.to('.loader', {
      opacity: 0, duration: 0.5,
      onComplete: () => setLoaderComplete(true),
    });
  };

  return (
    <>
      {!loaderComplete && <Loader onComplete={handleLoaderComplete} />}

      {/* Preload WebGL while loader is still showing */}
      {preparingExit && !loaderComplete && (
        <div style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
          <Background onReady={() => setBackgroundReady(true)} currentSection={activeSection} />
          <div className="Background-Animation">
            <Orchestrator
              lenis={lenisRef.current}
              responsive={responsive}
              intensity={0.1}
              enabled={true}
              idleThresholdMs={700}
              fadeLerpSpeed={0.05}
              zoomAmount={1.12}
              modelOffset={2}
              enableMouse={true}
            />
          </div>
        </div>
      )}

      {loaderComplete && (
        <div style={{ animation: 'fadeIn 1s ease-out' }}>
          {/* ── WebGL wormhole background ── */}
          <Background currentSection={activeSection} />
          <div className="Background-Animation">
            <Orchestrator
              lenis={lenisRef.current}
              responsive={responsive}
              intensity={1}
              enabled={true}
              idleThresholdMs={700}
              fadeLerpSpeed={0.05}
              zoomAmount={1.12}
              modelOffset={2}
              enableMouse={true}
              scrollProgressRef={scrollProgressRef}
            />
          </div>

          {/* ── Section overlays: Unified CSS proximity system ── */}
          <SectionPanel sectionIndex={0}><HomeSection /></SectionPanel>
          <SectionPanel sectionIndex={1}><WorksSection /></SectionPanel>
          <SectionPanel sectionIndex={2}><AboutSection /></SectionPanel>
          <SectionPanel sectionIndex={3}><ProcessSection /></SectionPanel>
          <SectionPanel sectionIndex={4}><FooterSection /></SectionPanel>

          {/* ── Navbar ── */}
          <Navbar
            activeTab={activeSection}
            setActiveTab={handleSetActiveTab}
          />

          <Cursor />
        </div>
      )}
    </>
  );
}
