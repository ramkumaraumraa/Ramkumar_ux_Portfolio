"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Loader from '../components/Loader';
import Cursor from '../components/Cursor';
import Navbar from '../components/Navbar';
import SocialSidebar from '../components/StickySidebar';
import Background from '../components/themes/Background';

// Dynamically import heavy WebGL component
const Orchestrator = dynamic(() => import('../components/themes/Orchestrator'), { ssr: false });

const HomeSection = dynamic(() => import('../components/sections/Home'), { ssr: false });
const WorksSection = dynamic(() => import('../components/sections/Works'), { ssr: false });
const AboutSection = dynamic(() => import('../components/sections/About'), { ssr: false });
const ProcessSection = dynamic(() => import('../components/sections/Process'), { ssr: false });
const FooterSection = dynamic(() => import('../components/sections/Footer'), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [preparingExit, setPreparingExit] = useState(false);
  const lenisRef = useRef<any>(null);
  const [responsive, setResponsive] = useState({
    isMobile: false,
    isTablet: false
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    setResponsive({
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth < 1024
    });

    const handleResize = () => {
      setResponsive({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth < 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleLoaderExiting = () => {
      setPreparingExit(true);
    };

    window.addEventListener('loader-exiting', handleLoaderExiting);
    return () => window.removeEventListener('loader-exiting', handleLoaderExiting);
  }, []);

  useEffect(() => {
    if (!loaderComplete) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, [loaderComplete]);

  useEffect(() => {
    if (backgroundReady) {
      (window as any).backgroundReady = true;
    }
  }, [backgroundReady]);

  const handleLoaderComplete = () => {
    gsap.to('.loader', {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        setLoaderComplete(true);
      }
    });
  };

  return (
    <>
      {!loaderComplete && <Loader onComplete={handleLoaderComplete} />}

      {preparingExit && !loaderComplete && (
        <div style={{ 
          position: 'fixed', 
          opacity: 0, 
          pointerEvents: 'none',
          zIndex: -1 
        }}>
          <Background onReady={() => setBackgroundReady(true)} />
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
        <>
          <div style={{
            animation: 'fadeIn 1s ease-out',
            opacity: 1
          }}>
            <Background />
            
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
          </div>
          
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <SocialSidebar />

          <main style={{
            animation: 'slideUp 1s ease-out',
            opacity: 1
          }}>
            {(!responsive.isMobile || activeTab === 'home') && (
              <Suspense fallback={<div className="section-loader">Loading...</div>}>
                <HomeSection />
              </Suspense>
            )}

            {(!responsive.isMobile || activeTab === 'works') && (
              <Suspense fallback={<div className="section-loader">Loading...</div>}>
                <WorksSection />
              </Suspense>
            )}

            {(!responsive.isMobile || activeTab === 'about') && (
              <Suspense fallback={<div className="section-loader">Loading...</div>}>
                <AboutSection />
              </Suspense>
            )}

            {(!responsive.isMobile || activeTab === 'process') && (
              <Suspense fallback={<div className="section-loader">Loading...</div>}>
                <ProcessSection />
              </Suspense>
            )}

            {(!responsive.isMobile || activeTab === 'contact') && (
              <Suspense fallback={<div className="section-loader">Loading...</div>}>
                <FooterSection />
              </Suspense>
            )}
          </main>

          <Cursor />
        </>
      )}
    </>
  );
}
