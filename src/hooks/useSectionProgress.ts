"use client";

import { useState, useEffect } from 'react';
import { SECTION_Z_POSITIONS, TOTAL_DEPTH, VISIBLE_RANGE } from '@/lib/scrollConstants';

/**
 * Returns localProgress: 0 → 1 as the virtual camera moves through a section's influence range.
 * 
 * - 0.0: Section is in the distance (invisible).
 * - 0.0 to 0.5: Approaching (Section zooms in and fades in).
 * - 0.5: Exactly docked (Section is fully visible and interactive).
 * - 0.5 to 1.0: Passing through (Section zooms past the camera and fades out).
 * - 1.0: Section is far behind the camera.
 * 
 * @param sectionIndex The index of the section in SECTION_IDS
 * @param delayRatio Optional ratio (0 to 1) to wait during the approach phase.
 */
export function useSectionProgress(sectionIndex: number, delayRatio: number = 0): number {
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    const dockZ = SECTION_Z_POSITIONS[sectionIndex];

    const onScroll = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      
      const progress = detail.progress as number;
      const cameraZ = -progress * TOTAL_DEPTH;
      
      // Calculate signed distance: + means approaching from front, - means passing behind
      const signedDistance = cameraZ - dockZ;
      
      // Total range of influence is ±VISIBLE_RANGE
      // We map [-VISIBLE_RANGE, +VISIBLE_RANGE] to [1, 0] so 0 is docked
      // Wait, let's map it so 0.5 is docked (signedDistance = 0)
      // If signedDistance = +VISIBLE_RANGE (approaching front): progress = 0
      // If signedDistance = 0 (docked): progress = 0.5
      // If signedDistance = -VISIBLE_RANGE (behind): progress = 1.0
      
      const rawLocal = 0.5 - (signedDistance / (VISIBLE_RANGE * 2));
      const clampedLocal = Math.max(0, Math.min(1, rawLocal));
      
      setLocalProgress(clampedLocal);
    };

    window.addEventListener('virtual-scroll', onScroll, { passive: true });
    return () => window.removeEventListener('virtual-scroll', onScroll);
  }, [sectionIndex]);

  return localProgress;
}
