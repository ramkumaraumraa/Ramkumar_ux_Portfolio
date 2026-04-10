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

    // Visibility radius (units in T-space, total journey is 1.0)
    // 0.2 means it stays visible +/- 20% of the entire scroll
    const renderRange = 0.2; 

    // Wrap-around distance logic for a circular scroll, assuming 0 and 1 connect (they almost do)
    const getDist = (t: number) => {
      const diff = Math.abs(progress - t) % 1.0;
      return Math.min(diff, 1.0 - diff);
    };

    const newActive = [
      getDist(0) < renderRange,
      getDist(0.25) < renderRange,
      getDist(0.5) < renderRange,
      getDist(0.75) < renderRange,
      getDist(1.0) < renderRange,
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
