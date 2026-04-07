"use client";

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Loader from '../components/Loader';
import Cursor from '../components/Cursor';
import Navbar from '../components/Navbar';
import Background from '../components/themes/Background';
import SectionOverlay from '../components/themes/SectionOverlay';

const Orchestrator = dynamic(() => import('../components/themes/Orchestrator'), { ssr: false });

const PROXY_HEIGHT = 18_000;
const SECTION_THRESHOLDS = [0.18, 0.36, 0.54, 0.72] as const;
const SECTION_IDS = ['home', 'works', 'about', 'process', 'footer'] as const;

export default function Page() {
  const [loaderComplete, setLoaderComplete]   = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [preparingExit, setPreparingExit]     = useState(false);
  const [activeSection, setActiveSection]     = useState('home');
  const lenisRef = useRef<any>(null);
  const [responsive, setResponsive] = useState({ isMobile: false, isTablet: false });

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

  /* Lenis smooth scroll */
  useEffect(() => {
    if (!loaderComplete) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.4,
      touchMultiplier: 2.5,
    });

    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    /* Scroll-band section detection */
    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      const progress = scroll / PROXY_HEIGHT;
      let section: string = 'home';
      for (let i = 0; i < SECTION_THRESHOLDS.length; i++) {
        if (progress >= SECTION_THRESHOLDS[i]) section = SECTION_IDS[i + 1];
      }
      setActiveSection(section);
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, [loaderComplete]);

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
          {/* Scroll proxy — gives the page its scrollable height */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '1px',
              height: `${PROXY_HEIGHT}px`,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />

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
            />
          </div>

          {/* ── Scroll-driven section content overlay ── */}
          <SectionOverlay activeSection={activeSection} />

          {/* ── Navbar ── */}
          <Navbar
            activeTab={activeSection}
            setActiveTab={setActiveSection}
          />

          <Cursor />
        </div>
      )}
    </>
  );
}
