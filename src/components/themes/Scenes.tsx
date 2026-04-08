"use client";

import React from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  HomeScene, 
  WorksScene, 
  AboutScene, 
  ProcessScene, 
  FooterScene 
} from './companion-scenes';
import { TOTAL_DEPTH } from '@/lib/scrollConstants';

/**
 * Scenes: High-performance container for 3D companions.
 * Unmounts/Hides scenes that are far away from the camera to save GPU cycles.
 */
export function Scenes({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const [activeScenes, setActiveScenes] = React.useState<boolean[]>([true, false, false, false, false]);

  useFrame(() => {
    const progress = scrollProgressRef.current;
    const cameraZ = -progress * TOTAL_DEPTH;

    // Visibility radius (units)
    const renderRange = 12; 

    const getDist = (z: number) => {
      const diff = Math.abs(cameraZ - z) % TOTAL_DEPTH;
      return Math.min(diff, TOTAL_DEPTH - diff);
    };

    const newActive = [
      getDist(0) < renderRange,
      getDist(-15) < renderRange,
      getDist(-30) < renderRange,
      getDist(-45) < renderRange,
      getDist(-60) < renderRange,
    ];

    // Only update state if visibility changes to minimize re-renders
    if (newActive.some((val, i) => val !== activeScenes[i])) {
      setActiveScenes(newActive);
    }
  });

  return (
    <>
      {activeScenes[0] && <HomeScene />}
      {activeScenes[1] && <WorksScene />}
      {activeScenes[2] && <AboutScene />}
      {activeScenes[3] && <ProcessScene />}
      {activeScenes[4] && <FooterScene />}
    </>
  );
}
