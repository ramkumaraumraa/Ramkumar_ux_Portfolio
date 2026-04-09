"use client";

import React, { useMemo } from 'react';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise } from '@react-three/postprocessing';
import { Vector2 } from 'three';

interface ScenePostProcessingProps {
  currentSection?: string;
}

const SECTION_FX: Record<string, { bloom: number; ca: number; noise: number }> = {
  home:    { bloom: 1.8,  ca: 0.0005, noise: 0.015 },
  works:   { bloom: 0.9,  ca: 0.001,  noise: 0.02  },
  about:   { bloom: 0.7,  ca: 0.0008, noise: 0.02  },
  process: { bloom: 1.1,  ca: 0.0015, noise: 0.025 },
  footer:  { bloom: 0.5,  ca: 0.003,  noise: 0.03  },
};

export function ScenePostProcessing({ currentSection = 'home' }: ScenePostProcessingProps) {
  const fx = useMemo(
    () => SECTION_FX[currentSection] ?? SECTION_FX.home,
    [currentSection]
  );

  return (
    <EffectComposer>
      <Bloom
        intensity={fx.bloom}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.1}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new Vector2(fx.ca, fx.ca)}
        radialModulation={false}
        modulationOffset={0}
      />
      <DepthOfField
        focusDistance={0}
        focalLength={0.02}
        bokehScale={2}
        height={480}
      />
      <Noise opacity={fx.noise} />
    </EffectComposer>
  );
}
