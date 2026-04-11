"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Loader from '../components/Loader';
import Cursor from '../components/Cursor';
import Navbar from '../components/Navbar';
import SectionChrome from '../components/themes/SectionChrome';
import SectionOverlay from '../components/themes/SectionOverlay';

const Orchestrator = dynamic(() => import('../components/themes/Orchestrator'), { ssr: false });
const Background     = dynamic(() => import('../components/themes/Background'),  { ssr: false });
const HomeSection    = dynamic(() => import('../components/sections/Home'),    { ssr: false });
const WorksSection   = dynamic(() => import('../components/sections/Works'),   { ssr: false });
const AboutSection   = dynamic(() => import('../components/sections/About'),   { ssr: false });
const ProcessSection = dynamic(() => import('../components/sections/Process'), { ssr: false });
const FooterSection  = dynamic(() => import('../components/sections/Footer'),  { ssr: false });

import {
  SECTION_THRESHOLDS,
  SECTION_IDS,
  SECTION_DOCK_PROGRESS,
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
  const isNavJumpRef      = useRef(false);
  const [mobileSwipeCue, setMobileSwipeCue] = useState<'up' | 'down' | null>(null);

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
    const onExit = () => {
      setPreparingExit(true);
      setTimeout(() => setBackgroundReady(true), 200);
    };
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

    // On mobile: lock document scroll so the body doesn't drift, but do NOT
    // intercept touch events — native touch scroll inside SectionPanels must work.
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // RAF tick always runs — drives section-transition animations on all devices
    let lastVirtual = 0;
    let lastEmitTime = Date.now();
    const tick = () => {
      const prev = virtualScrollRef.current;

      targetScrollRef.current = ((targetScrollRef.current % VIRTUAL_MAX) + VIRTUAL_MAX) % VIRTUAL_MAX;

      let diff = targetScrollRef.current - prev;
      if (Math.abs(diff) > VIRTUAL_MAX / 2) {
        diff -= Math.sign(diff) * VIRTUAL_MAX;
      }

      const currentProgress = prev / VIRTUAL_MAX;

      const SNAP_RADIUS = 0.012;
      let isNearDock = false;
      for (const t of SECTION_THRESHOLDS) {
        const d = Math.abs(currentProgress - t);
        const wrappedD = Math.min(d, 1 - d);
        if (wrappedD < SNAP_RADIUS) {
          isNearDock = true;
          break;
        }
      }

      const isTargetMet = Math.abs(diff) < 0.1;
      if (isTargetMet && isNavJumpRef.current) {
        isNavJumpRef.current = false;
      }

      // Slower dynamic ease if it's a navigation jump
      const dynamicEase = isNavJumpRef.current ? 0.03 : (isNearDock ? 0.025 : 0.07);
      virtualScrollRef.current += diff * dynamicEase;
      virtualScrollRef.current = ((virtualScrollRef.current % VIRTUAL_MAX) + VIRTUAL_MAX) % VIRTUAL_MAX;

      if (isTargetMet) {
        virtualScrollRef.current = targetScrollRef.current;
      }

      const progress = virtualScrollRef.current / VIRTUAL_MAX;
      const rawDelta = virtualScrollRef.current - lastVirtual;

      if (progress !== scrollProgressRef.current || Math.abs(rawDelta) > 0.01) {
        scrollProgressRef.current = progress;
        
        // Only dynamically track sections if we aren't warping. Warping locks the destination early.
        if (!isNavJumpRef.current) {
          updateSection(progress);
        }
        
        ScrollTrigger.update();

        const now = Date.now();
        const dt = Math.max(1, now - lastEmitTime);
        const velocity = rawDelta / dt;

        lenisRef.current.emit('scroll', {
          scroll: virtualScrollRef.current,
          progress,
          velocity,
          direction: rawDelta >= 0 ? 1 : -1,
        });

        window.dispatchEvent(new CustomEvent('virtual-scroll', {
          detail: {
            progress,
            scroll: virtualScrollRef.current,
            velocity,
            direction: rawDelta >= 0 ? 1 : -1,
            isJumping: isNavJumpRef.current
          }
        }));

        lastEmitTime = now;
      }

      lastVirtual = virtualScrollRef.current;
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    const WHEEL_MULT = 1.4;
    const TOUCH_MULT = 2.5;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    if (!responsive.isMobile) {
      // Desktop: wheel + touch both drive virtual scroll directly.
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        targetScrollRef.current += e.deltaY * WHEEL_MULT;
      };
      const onTouchMoveDesktop = (e: TouchEvent) => {
        e.preventDefault();
        const dy = touchStartY.current - e.touches[0].clientY;
        touchStartY.current = e.touches[0].clientY;
        targetScrollRef.current += dy * TOUCH_MULT;
      };

      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMoveDesktop, { passive: false });

      return () => {
        cancelAnimationFrame(rafIdRef.current);
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMoveDesktop);
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      };
    }

    // Mobile — boundary-aware touch navigation.
    // Swipe inside a scrollable section panel scrolls the content natively.
    // At the top/bottom edge of a panel, or outside any scrollable element,
    // the swipe drives the virtual scroll so users can navigate between sections.
    const getScrollableAncestor = (el: Element | null): Element | null => {
      while (el && el !== document.documentElement) {
        if (el.scrollHeight > el.clientHeight + 1) {
          const { overflowY } = window.getComputedStyle(el);
          if (overflowY === 'auto' || overflowY === 'scroll') return el;
        }
        el = el.parentElement;
      }
      return null;
    };

    const onTouchMoveMobile = (e: TouchEvent) => {
      const dy = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;

      const scrollable = getScrollableAncestor(e.target as Element);

      if (scrollable) {
        const atTop = scrollable.scrollTop <= 0;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

        if ((dy > 0 && atBottom) || (dy < 0 && atTop)) {
          // At a scroll boundary — hand off to virtual section navigation.
          e.preventDefault();
          targetScrollRef.current += dy * TOUCH_MULT;
          
          // Show visual cue for mobile
          setMobileSwipeCue(dy > 0 ? 'down' : 'up');
          setTimeout(() => setMobileSwipeCue(null), 800);
        }
        // else: content not at edge, let native scrolling handle it.
      } else {
        // Not inside any scrollable element — drive virtual navigation.
        e.preventDefault();
        targetScrollRef.current += dy * TOUCH_MULT;
        
        // Show visual cue for mobile
        setMobileSwipeCue(dy > 0 ? 'down' : 'up');
        setTimeout(() => setMobileSwipeCue(null), 800);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMoveMobile, { passive: false });

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMoveMobile);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [loaderComplete, updateSection, responsive.isMobile]);

  // ── Nav-click scroll (jump to section by progress) ───────────
  const handleSetActiveTab = useCallback((tab: string) => {
    const idx = SECTION_IDS.indexOf(tab as any);
    if (idx < 0) return;
    targetScrollRef.current = SECTION_DOCK_PROGRESS[idx] * VIRTUAL_MAX;
    setActiveSection(tab);
    isNavJumpRef.current = true;
  }, []);

  useEffect(() => {
    if (backgroundReady) (window as any).backgroundReady = true;
  }, [backgroundReady]);

  // Fix 1: Warm up SectionPanel progress values immediately after loader exits
  useEffect(() => {
    if (!loaderComplete) return;
    window.dispatchEvent(new CustomEvent('virtual-scroll', {
      detail: { progress: 0, scroll: 0, velocity: 0, direction: 1 }
    }));
  }, [loaderComplete]);

  const handleLoaderComplete = () => {
    gsap.to('.loader', {
      opacity: 0, duration: 0.5,
      onComplete: () => setLoaderComplete(true),
    });
  };

  return (
    <>
      {!loaderComplete && <Loader onComplete={handleLoaderComplete} />}

      {/* Mobile Swipe Edge Cue */}
      {mobileSwipeCue && responsive.isMobile && (
        <div style={{
          position: 'fixed',
          top: mobileSwipeCue === 'up' ? '20px' : 'auto',
          bottom: mobileSwipeCue === 'down' ? '80px' : 'auto',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: '20px',
          color: '#fff',
          fontSize: '12px',
          pointerEvents: 'none',
          zIndex: 9999,
          animation: 'fadeInOut 0.8s ease-out forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {mobileSwipeCue === 'down' ? 'Warping Next ↓' : 'Warping Prev ↑'}
        </div>
      )}

      {/* Preload WebGL while loader is still showing */}
      {preparingExit && !loaderComplete && (
        <div style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
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
          {/* ── CSS starfield + lemniscates + comets ── */}
          <Background activeSection={activeSection} />

          {/* ── WebGL wormhole background ── */}
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
          <SectionOverlay activeSection={activeSection} />

          <SectionChrome activeSection={activeSection} />

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
