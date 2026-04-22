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
import SocialSidebar from '../components/StickySidebar';

const Orchestrator = dynamic(() => import('../components/themes/Orchestrator'), { ssr: false });
const Background     = dynamic(() => import('../components/themes/Background'),  { ssr: false });

import {
  SECTION_THRESHOLDS,
  SECTION_IDS,
  SECTION_DOCK_PROGRESS,
  VIRTUAL_MAX
} from '@/lib/scrollConstants';

type LenisScrollPayload = {
  scroll: number;
  progress: number;
  velocity: number;
  direction: 1 | -1;
};

type LenisListener = (payload: LenisScrollPayload) => void;

type LenisShim = {
  readonly scroll: number;
  on(event: 'scroll', fn: LenisListener): void;
  off(event: 'scroll', fn: LenisListener): void;
  emit(event: 'scroll', data: LenisScrollPayload): void;
};

export default function Page() {
  const [loaderComplete, setLoaderComplete]   = useState(false);
  const [preparingExit, setPreparingExit]     = useState(false);
  const [orchestratorReady, setOrchestratorReady] = useState(false);
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
  const lenisRef = useRef<LenisShim>(
    (() => {
      const listeners: Record<'scroll', Set<LenisListener>> = {
        scroll: new Set<LenisListener>(),
      };

      return {
        get scroll() { return virtualScrollRef.current; },
        on(event: 'scroll', fn: LenisListener)  { listeners[event].add(fn); },
        off(event: 'scroll', fn: LenisListener) { listeners[event].delete(fn); },
        emit(event: 'scroll', data: LenisScrollPayload) {
          listeners[event].forEach((fn) => fn(data));
        },
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
    };

    const onOrchestratorReady = () => {
      setOrchestratorReady(true);
    };

    window.addEventListener('loader-exiting', onExit);
    window.addEventListener('orchestrator-ready', onOrchestratorReady);

    return () => {
      window.removeEventListener('loader-exiting', onExit);
      window.removeEventListener('orchestrator-ready', onOrchestratorReady);
    };
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

      targetScrollRef.current = Math.max(0, Math.min(VIRTUAL_MAX, targetScrollRef.current));
      const diff = targetScrollRef.current - prev;

      const currentProgress = prev / VIRTUAL_MAX;

      const SNAP_RADIUS = 0.012;
      let isNearDock = false;
      for (const t of SECTION_THRESHOLDS) {
        const d = Math.abs(currentProgress - t);
        if (d < SNAP_RADIUS) {
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
      virtualScrollRef.current = Math.max(0, Math.min(VIRTUAL_MAX, virtualScrollRef.current));

      if (isTargetMet) {
        virtualScrollRef.current = targetScrollRef.current;
      }

      // ── MAGNETIC PINNING LOGIC ──
      // Map raw virtual progress to a stepped curve with plateaus at each section dock
      const rawProgress = virtualScrollRef.current / VIRTUAL_MAX;
      
      const getMappedProgress = (raw: number) => {
        const docks = [0, 0.25, 0.5, 0.75, 1.0];
        const plateauWidth = 0.12; // 12% of each segment is a locked plateau
        
        for (let i = 0; i < docks.length - 1; i++) {
          const start = docks[i];
          const end = docks[i+1];
          if (raw >= start && raw <= end) {
            const seg = (raw - start) / (end - start);
            if (seg < plateauWidth) return start;
            if (seg > 1 - plateauWidth) return end;
            const t = (seg - plateauWidth) / (1 - 2 * plateauWidth);
            const smoothT = t * t * (3 - 2 * t);
            return start + smoothT * (end - start);
          }
        }
        return raw;
      };

      const progress = getMappedProgress(rawProgress);
      const rawDelta = virtualScrollRef.current - lastVirtual;

      if (progress !== scrollProgressRef.current || Math.abs(rawDelta) > 0.01) {
        scrollProgressRef.current = progress;
        
        // Update active section based on the MAPPED progress
        updateSection(progress);
        
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

    const cooldownMs = 1000; // Time locked out after a jump
    let lastJumpTime = 0;

    const triggerJump = (direction: 'next' | 'prev') => {
      const now = Date.now();
      if (now - lastJumpTime < cooldownMs) return;

      const currentProgress = scrollProgressRef.current;
      let currentIndex = 0;
      let minDiff = Infinity;
      SECTION_DOCK_PROGRESS.forEach((dock, idx) => {
        const d = Math.abs(currentProgress - dock);
        if (d < minDiff) {
          minDiff = d;
          currentIndex = idx;
        }
      });

      const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      
      // Enforce hard stops at the beginning and end
      if (nextIndex >= SECTION_DOCK_PROGRESS.length) {
         return; // Hard stop at the bottom (Footer)
      } else if (nextIndex < 0) {
         return; // Hard stop at the top (Home)
      }

      targetScrollRef.current = SECTION_DOCK_PROGRESS[nextIndex] * VIRTUAL_MAX;
      isNavJumpRef.current = true;
      lastJumpTime = now;
      
      setMobileSwipeCue(direction === 'next' ? 'down' : 'up');
      setTimeout(() => setMobileSwipeCue(null), 800);
    };

    let wheelTimeout: NodeJS.Timeout;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    if (!responsive.isMobile) {
      // Desktop: wheel + touch trigger discrete jumps
      const WHEEL_THRESHOLD = 30; 
      const TOUCH_THRESHOLD = 40; 
      let cumulativeWheel = 0;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        cumulativeWheel += e.deltaY;
        
        if (cumulativeWheel > WHEEL_THRESHOLD) {
          triggerJump('next');
          cumulativeWheel = 0;
        } else if (cumulativeWheel < -WHEEL_THRESHOLD) {
          triggerJump('prev');
          cumulativeWheel = 0;
        }
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => { cumulativeWheel = 0; }, 150);
      };

      const onTouchMoveDesktop = (e: TouchEvent) => {
        e.preventDefault();
        const dy = touchStartY.current - e.touches[0].clientY;
        if (dy > TOUCH_THRESHOLD) {
          triggerJump('next');
          touchStartY.current = e.touches[0].clientY;
        } else if (dy < -TOUCH_THRESHOLD) {
          triggerJump('prev');
          touchStartY.current = e.touches[0].clientY;
        }
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
        clearTimeout(wheelTimeout);
      };
    }

    // Mobile — boundary-aware touch navigation.
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

    const TOUCH_THRESHOLD_MOBILE = 30;

    const onTouchMoveMobile = (e: TouchEvent) => {
      const dy = touchStartY.current - e.touches[0].clientY;
      const scrollable = getScrollableAncestor(e.target as Element);

      if (scrollable) {
        const atTop = scrollable.scrollTop <= 0;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

        if ((dy > TOUCH_THRESHOLD_MOBILE && atBottom) || (dy < -TOUCH_THRESHOLD_MOBILE && atTop)) {
          e.preventDefault();
          triggerJump(dy > 0 ? 'next' : 'prev');
          touchStartY.current = e.touches[0].clientY;
        }
      } else {
        if (Math.abs(dy) > TOUCH_THRESHOLD_MOBILE) {
          e.preventDefault();
          triggerJump(dy > 0 ? 'next' : 'prev');
          touchStartY.current = e.touches[0].clientY;
        }
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
    const section = SECTION_IDS.find((id) => id === tab);
    if (!section) return;

    const idx = SECTION_IDS.indexOf(section);
    if (idx < 0) return;
    targetScrollRef.current = SECTION_DOCK_PROGRESS[idx] * VIRTUAL_MAX;
    setActiveSection(tab);
    isNavJumpRef.current = true;
  }, []);

  // Fix 1: Warm up SectionPanel progress values immediately after loader exits
  useEffect(() => {
    if (!loaderComplete) return;
    window.dispatchEvent(new CustomEvent('virtual-scroll', {
      detail: { progress: 0, scroll: 0, velocity: 0, direction: 1 }
    }));
  }, [loaderComplete]);

  const handleLoaderComplete = () => {
    setLoaderComplete(true);
  };

  return (
    <>
      {!loaderComplete && (
        <Loader
          sceneReady={orchestratorReady}
          onComplete={handleLoaderComplete}
        />
      )}

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

      {(preparingExit || loaderComplete) && (
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
        </div>
      )}

      {loaderComplete && <SocialSidebar />}
      {loaderComplete && <Cursor />}
    </>
  );
}
