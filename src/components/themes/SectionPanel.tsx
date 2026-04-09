"use client";

import React, { useState, useEffect } from 'react';
import { useSectionProgress } from '@/hooks/useSectionProgress';

interface SectionPanelProps {
  sectionIndex: number;
  children: React.ReactNode;
}

/**
 * SectionPanel: CSS-based proximity overlay driven by virtual scroll progress.
 *
 * Desktop — scale + Y-translate entrance (camera-approach feel).
 * Mobile  — opacity fade only, overflow-y: auto so section content scrolls natively.
 *           Bottom padding clears the fixed dock nav and safe-area inset.
 */
export function SectionPanel({ sectionIndex, children }: SectionPanelProps) {
  const localProgress = useSectionProgress(sectionIndex);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isDocked = localProgress > 0.85;

  if (localProgress <= 0) return null;

  // ── Mobile: full-screen page, scrollable, fade transition ──────
  if (isMobile) {
    const mobileOverlayStyle: React.CSSProperties = {
      position: 'fixed',
      inset: 0,
      zIndex: 10,
      opacity: localProgress,
      pointerEvents: isDocked ? 'auto' : 'none',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      willChange: 'opacity',
    };

    return (
      <div
        className="section-panel-overlay"
        style={mobileOverlayStyle}
      >
        {/* Padding keeps the last touch targets clear of the fixed dock. */}
        <div style={{ minHeight: '100%', paddingBottom: 112 }}>
          {children}
        </div>
      </div>
    );
  }

  // ── Desktop: scale + Y-translate camera-approach entrance ──────
  const eased = 1 - Math.pow(1 - localProgress, 3);
  const scale = 0.3 + eased * 0.7;
  const translateY = (1 - localProgress) * 40;

  return (
    <div
      className="section-panel-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        opacity: localProgress,
        transform: `translateY(${translateY}px) scale(${scale})`,
        pointerEvents: isDocked ? 'auto' : 'none',
        willChange: 'transform, opacity',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
