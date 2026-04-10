"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const localProgressRef = useRef(localProgress);

  useEffect(() => {
    localProgressRef.current = localProgress;
  }, [localProgress]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    
    const handleCameraSync = (e: Event) => {
      if (!overlayRef.current) return;
      const { rotX, rotY, rotZ } = (e as CustomEvent).detail;
      const lp = localProgressRef.current;
      
      // Map progress to distance (-Z means deeper into the screen)
      const translateZ = (lp - 1) * 600; 
      
      // Apply the exact inverse of the camera rotation to simulate 3D presence
      const rx = -rotX;
      const ry = -rotY;
      const rz = -rotZ;

      overlayRef.current.style.transform = `perspective(1000px) translateZ(${translateZ}px) rotateX(${rx}rad) rotateY(${ry}rad) rotateZ(${rz}rad)`;
    };
    
    window.addEventListener('camera-sync', handleCameraSync);
    return () => window.removeEventListener('camera-sync', handleCameraSync);
  }, [isMobile]);

  const isDocked = localProgress > 0.98; // Very close to full stop

  if (localProgress <= 0) return null;

  // ── Mobile: full-screen page, scrollable, fade transition ──────
  if (isMobile) {
    const mobileOverlayStyle: React.CSSProperties = {
      position: 'fixed',
      inset: 0,
      zIndex: 10,
      opacity: isDocked ? 1 : 0,
      transition: 'opacity 0.8s ease-out',
      pointerEvents: isDocked ? 'auto' : 'none',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    };

    return (
      <div
        className="section-panel-overlay"
        style={mobileOverlayStyle}
      >
        <div className="section-panel-viewport section-panel-viewport--mobile">
          {children}
        </div>
      </div>
    );
  }

  // ── Desktop: 3D traveling sliding effect instead of scale zoom ──────
  // The transform is managed dynamically by the camera-sync event above!
  
  return (
    <div
      ref={overlayRef}
      className="section-panel-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        opacity: isDocked ? 1 : 0, 
        transition: 'opacity 0.8s ease-out',
        pointerEvents: isDocked ? 'auto' : 'none',
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="section-panel-viewport">
        {children}
      </div>
    </div>
  );
}
