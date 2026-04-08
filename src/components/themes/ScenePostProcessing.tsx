"use client";

import React from 'react';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise } from '@react-three/postprocessing';
import { Vector2 } from 'three';

/**
 * ScenePostProcessing: Adds premium cinematic qualities to the WebGL scene.
 * Thresholds and intensities are tuned for a deep-space/nebula aesthetic.
 */
export function ScenePostProcessing() {
  return (
    <EffectComposer>
      <Bloom 
        intensity={1.0} 
        luminanceThreshold={0.8} 
        luminanceSmoothing={0.1} 
        mipmapBlur 
      />
      <ChromaticAberration
        offset={new Vector2(0.001, 0.001)}
        radialModulation={false}
        modulationOffset={0}
      />
      <DepthOfField
        focusDistance={0}
        focalLength={0.02}
        bokehScale={2}
        height={480}
      />
      <Noise opacity={0.02} />
    </EffectComposer>
  );
}
