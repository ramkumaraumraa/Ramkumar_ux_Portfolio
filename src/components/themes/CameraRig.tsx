"use client";

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPLINE_POINTS, SECTION_Z_POSITIONS } from '@/lib/scrollConstants';

const DOCK_THRESHOLD = 2.5;

interface CameraRigProps {
  scrollProgressRef: React.MutableRefObject<number>;
  intensityRef: React.MutableRefObject<number>;
}

export default function CameraRig({ scrollProgressRef, intensityRef }: CameraRigProps) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  const curve = useMemo(() => {
    const points = SPLINE_POINTS.map(p => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  }, []);

  const dummyCamera = useMemo(() => new THREE.PerspectiveCamera(), []);

  // Listen to mouse moves in world space
  useFrame((state) => {
    targetMouseRef.current.x = state.pointer.x * 0.08;
    targetMouseRef.current.y = state.pointer.y * 0.05;

    // Smooth mouse tilt
    mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
    mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;

    // 1. Evaluate Spline Path
    const t = scrollProgressRef.current;
    const trackPoint = curve.getPoint(t);
    
    // Look ahead for camera pointing (0.05 gives a smooth cinematic sweep)
    let lookAheadT = Math.min(1.0, t + 0.05);
    let lookAheadPoint = curve.getPoint(lookAheadT);
    
    // At the very end of the curve, target and lookahead merge. Fix by using tangent.
    if (t > 0.95) {
      const tangent = curve.getTangent(t);
      lookAheadPoint = trackPoint.clone().add(tangent);
    }

    // 2. Linear interpretation of banking (Drone bank)
    // Calculate how much we are turning horizontally by looking at the track trajectory
    const vForward = lookAheadPoint.clone().sub(trackPoint).normalize();
    // vForward.x tells us if we are steering right (+x) or left (-x).
    const targetBank = -vForward.x * 1.2; // Increased banking for dramatic travel feel

    // 3. Apply Transforms Smoothly
    // Position
    camera.position.lerp(trackPoint, 0.08);

    // Rotation
    dummyCamera.position.copy(camera.position);
    dummyCamera.up.set(0, 1, 0);
    dummyCamera.lookAt(lookAheadPoint);
    
    // Apply banking
    dummyCamera.rotateZ(targetBank);
    
    // Apply mouse panning
    dummyCamera.rotateY(-mouseRef.current.x);
    dummyCamera.rotateX(-mouseRef.current.y);

    camera.quaternion.slerp(dummyCamera.quaternion, 0.08);

    // Broadcast camera transform for CSS Overlays
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    window.dispatchEvent(new CustomEvent('camera-sync', {
      detail: {
        rotX: euler.x,
        rotY: euler.y,
        rotZ: euler.z
      }
    }));

    // Compute docked intensity — dim wormhole when near a section
    // Check distance to our actual 3D check points instead of Z positions
    let minDist = Infinity;
    for (const sp of SPLINE_POINTS) {
      const point = new THREE.Vector3(...sp);
      const d = camera.position.distanceTo(point);
      if (d < minDist) minDist = d;
    }
    const docked = minDist < DOCK_THRESHOLD;
    const targetIntensity = docked ? 0.35 : 1.0;
    intensityRef.current += (targetIntensity - intensityRef.current) * 0.04;
  });

  return null;
}
