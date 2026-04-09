"use client";

import { useState, useEffect } from 'react';
import { SECTION_Z_POSITIONS, TOTAL_DEPTH, VISIBLE_RANGE } from '@/lib/scrollConstants';

/**
 * Returns localProgress: 0 → 1 as the virtual camera approaches a section's dock position.
 * 
 * - 0: Camera is 8+ units away (Section is invisible or a tiny dot).
 * - 0 to 1: Camera is approaching (Section zooms in and fades in).
 * - 1: Camera is exactly docked (Section is fully visible and interactive).
 * 
 * @param sectionIndex The index of the section in SECTION_IDS (0=home, 1=works, etc.)
 */
export function useSectionProgress(sectionIndex: number): number {
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    const dockZ = SECTION_Z_POSITIONS[sectionIndex];

    const onScroll = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      
      const progress = detail.progress as number;
      // Convert 0-1 progress to world Z coordinate
      const cameraZ = -progress * TOTAL_DEPTH;
      
      // Straight linear distance — no wrap-around.
      // cameraZ is always in (-60, 0] so wrap math is not needed and
      // would incorrectly equate home (Z=0) with footer (Z=-60).
      const distance = Math.abs(cameraZ - dockZ);
      
      // Map distance to 0-1 progress (within VISIBLE_RANGE)
      const currentLocal = Math.max(0, 1 - distance / VISIBLE_RANGE);
      
      setLocalProgress(currentLocal);
    };

    window.addEventListener('virtual-scroll', onScroll, { passive: true });
    
    // Initial check in case we're already near a section
    // (Wait for next tick to ensure constants are loaded and DOM is ready)
    const timer = setTimeout(() => {
       // We don't have the initial scroll value here easily, 
       // but the virtual-scroll event will fire immediately on first movement.
    }, 0);

    return () => {
      window.removeEventListener('virtual-scroll', onScroll);
      clearTimeout(timer);
    };
  }, [sectionIndex]);

  return localProgress;
}
