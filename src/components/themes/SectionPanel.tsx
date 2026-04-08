"use client";

import React from 'react';
import { useSectionProgress } from '@/hooks/useSectionProgress';

interface SectionPanelProps {
  sectionIndex: number;
  children: React.ReactNode;
}

/**
 * SectionPanel: A CSS-based proximity overlay.
 * Replaces the R3F <Html> approach to avoid GSAP/Event limitations.
 * 
 * Drives visibility and scaling based on distance from the section dock.
 */
export function SectionPanel({ sectionIndex, children }: SectionPanelProps) {
  const localProgress = useSectionProgress(sectionIndex);
  
  // interaction is enabled only when we are significantly close to the dock
  const isDocked = localProgress > 0.85;
  
  // Replicates the 'approaching dot' visual: starts small (0.3) and scales to 1.0
  const scale = 0.3 + localProgress * 0.7;

  // Performance: Unmount when completely invisible/far away
  if (localProgress <= 0) return null;

  return (
    <div
      className="section-panel-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        opacity: localProgress,
        transform: `scale(${scale})`,
        pointerEvents: isDocked ? 'auto' : 'none',
        willChange: 'transform, opacity',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
