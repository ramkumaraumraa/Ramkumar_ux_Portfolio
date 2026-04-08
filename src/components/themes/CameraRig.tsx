"use client";

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const SECTION_Z_POSITIONS = [0, -15, -30, -45, -60];
const DOCK_THRESHOLD = 2.5;
const TOTAL_DEPTH = 60;

interface CameraRigProps {
  scrollProgressRef: React.MutableRefObject<number>;
  intensityRef: React.MutableRefObject<number>;
}

export default function CameraRig({ scrollProgressRef, intensityRef }: CameraRigProps) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  // Listen to mouse moves in world space
  useFrame((state) => {
    targetMouseRef.current.x = state.pointer.x * 0.08;
    targetMouseRef.current.y = state.pointer.y * 0.05;

    // Smooth mouse tilt
    mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

    // Target camera Z from scroll
    const targetZ = -scrollProgressRef.current * TOTAL_DEPTH;

    // Lerp camera position
    (camera as THREE.PerspectiveCamera).position.z +=
      (targetZ - (camera as THREE.PerspectiveCamera).position.z) * 0.07;

    // Subtle mouse tilt
    camera.rotation.y += (mouseRef.current.x - camera.rotation.y) * 0.04;
    camera.rotation.x += (mouseRef.current.y - camera.rotation.x) * 0.04;

    // Compute docked intensity — dim wormhole when near a section
    const currentZ = (camera as THREE.PerspectiveCamera).position.z;
    let minDist = Infinity;
    for (const sz of SECTION_Z_POSITIONS) {
      const d = Math.abs(currentZ - sz);
      if (d < minDist) minDist = d;
    }
    const docked = minDist < DOCK_THRESHOLD;
    const targetIntensity = docked ? 0.35 : 1.0;
    intensityRef.current += (targetIntensity - intensityRef.current) * 0.04;
  });

  return null;
}
