"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import dynamic from 'next/dynamic';

const HomeSection = dynamic(() => import('../sections/Home'), { ssr: false });

interface HomeOverlayProps {
  activeSection: string;
}

export default function HomeOverlay({ activeSection }: HomeOverlayProps) {
  const hasAnimatedIn = useRef(false);

  // Z-approach on first mount
  useEffect(() => {
    if (hasAnimatedIn.current) return;
    hasAnimatedIn.current = true;

    // Small delay to let HomeSection render
    const timer = setTimeout(() => {
      const block = document.querySelector('.hero-block') as HTMLElement | null;
      if (!block) return;

      gsap.fromTo(
        block,
        { z: -600, scale: 1.8, opacity: 0 },
        { z: 0, scale: 1, opacity: 1, duration: 1.8, ease: 'power3.out', force3D: true }
      );
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Animate out when leaving home, back when returning
  useEffect(() => {
    const block = document.querySelector('.hero-block') as HTMLElement | null;
    if (!block || !hasAnimatedIn.current) return;

    if (activeSection !== 'home') {
      gsap.to(block, { z: -300, opacity: 0, duration: 0.6, ease: 'power2.in', force3D: true });
    } else {
      gsap.to(block, { z: 0, opacity: 1, duration: 0.6, ease: 'power2.out', force3D: true });
    }
  }, [activeSection]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 11,
        pointerEvents: 'none',
        perspective: '1200px',
      }}
    >
      <HomeSection />
    </div>
  );
}
