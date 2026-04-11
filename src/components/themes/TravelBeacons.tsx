"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TOTAL_DEPTH } from '@/lib/scrollConstants';

interface TravelBeaconsProps {
  scrollProgress?: number;
  scrollVelocity?: number;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uCameraPos;
  uniform vec4  uCameraQuat; // [x, y, z, w]
  uniform float uScrollProgress;
  uniform float uScrollVelocity;

  varying vec2 vUv;

  #define RAYMARCH_ITERATIONS 40.0
  #define FADE_DISTANCE 30.0
  #define LINE_LENGTH 1.0
  #define LINE_SPACE 1.3
  #define LINE_WIDTH 0.008
  #define BOUNDING_CYLINDER 2.2
  #define INSIDE_CYLINDER 0.4
  #define FOG_DISTANCE 35.0

  #define FIRST_COLOR vec3(1.2, 0.5, 0.2) * 1.5
  #define SECOND_COLOR vec3(0.1, 0.7, 1.2) * 1.2

  // Helper: Rotate vector by quaternion
  vec3 rotateVector(vec4 q, vec3 v) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
  }

  float hash12(vec2 x) {
    return fract(sin(dot(x, vec2(42.2347, 43.4271))) * 342.324234);   
  }

  vec3 hash33(vec3 x) {
    return fract(sin(x * mat3(
      23.421, 24.4217, 25.3271, 
      27.2412, 32.21731, 21.27641, 
      20.421, 27.4217, 22.3271
    )) * 342.324234);   
  }

  float boxSDF(vec3 point, vec3 bounds) {
    vec3 q = abs(point) - bounds;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }

  vec3 spaceBounding(vec3 point) {
    return vec3(sin(point.z * 0.15) * 4.0, cos(point.z * 0.131) * 4.0, 0.0); 
  }

  vec4 repeatBoxSDF(vec3 point) {
    vec3 rootPoint = floor(vec3(point.x / LINE_SPACE, point.y / LINE_SPACE, point.z / LINE_LENGTH)); 
    rootPoint.z *= LINE_LENGTH;
    rootPoint.xy *= LINE_SPACE;
    float minSDF = 1000.0;
    vec3 mainColor = vec3(0.0);
    
    for (float x = -1.0; x <= 1.0; x++) {
      for (float y = -1.0; y <= 1.0; y++) {
        for (float z = -1.0; z <= 1.0; z++) {
          vec3 tempRootPoint = rootPoint + vec3(x * LINE_SPACE, y * LINE_SPACE, z * LINE_LENGTH);
          vec3 lineHash = hash33(tempRootPoint);
          lineHash.z = pow(lineHash.z, 8.0);
          
          float hash = hash12(tempRootPoint.xy) - 0.5;
          tempRootPoint.z += hash * LINE_LENGTH;
          
          vec3 boxCenter = tempRootPoint + vec3(0.5 * LINE_SPACE, 0.5 * LINE_SPACE, 0.5 * LINE_LENGTH);
          boxCenter.xy += (lineHash.xy - 0.5) * LINE_SPACE;
          vec3 boxSize = vec3(LINE_WIDTH, LINE_WIDTH, LINE_LENGTH * (1.0 - lineHash.z));
          
          vec3 color = FIRST_COLOR;
          if(lineHash.x < 0.5) color = SECOND_COLOR;
          
          float sdf = boxSDF(point - boxCenter, boxSize);
          if (sdf < minSDF) {
            mainColor = color;
            minSDF = sdf;
          }
        }
      }
    }
    return vec4(mainColor, minSDF);
  }

  float cylinderSDF(vec3 point, float radius) {
    return length(point.xy) - radius;
  }

  vec4 objectSDF(vec3 point) {
    point += spaceBounding(point);
    vec4 lines = repeatBoxSDF(point);
    float cylinder = length(point.xy) - BOUNDING_CYLINDER;
    float insideCylinder = -(length(point.xy) - INSIDE_CYLINDER);
    float object = max(lines.a, max(cylinder, insideCylinder));
    return vec4(lines.rgb, object);
  }

  void main() {
    vec2 fragCoord = vUv * uResolution;
    vec2 uv = (2.0 * fragCoord - uResolution.xy) / uResolution.x;
    
    // Ray origin and direction from CameraRig
    vec3 rd = rotateVector(uCameraQuat, normalize(vec3(uv.x, uv.y, -1.0)));
    vec3 ro = uCameraPos;
    
    // Offset ray origin by our spaceBounding curve for consistency
    ro -= spaceBounding(ro);

    vec3 color = vec3(0.0);
    float dist = 0.0;
    vec3 marchPos = ro;
    
    for (float i = 0.0; i < RAYMARCH_ITERATIONS; i++) {
        vec4 sdfData = objectSDF(marchPos);
        float bloomFactor = 0.15 + (uScrollVelocity * 0.1);
        color += sdfData.rgb * sqrt(smoothstep(0.7, 0.0, sdfData.a)) * pow(smoothstep(FOG_DISTANCE * 0.7, 0.0, dist), 3.0) * bloomFactor;
        
        marchPos += rd * sdfData.a * 0.8;
        dist += sdfData.a;
        if (dist > FADE_DISTANCE || length(marchPos.xy) > BOUNDING_CYLINDER + 5.0) break;
    }

    float fog = sqrt(smoothstep(FOG_DISTANCE, 0.0, dist));
    // Boost bloom based on velocity
    float velocityGlow = uScrollVelocity * 0.5;
    vec3 finalColor = color * 0.08 * fog + (color * velocityGlow);
    
    finalColor = smoothstep(-0.02, 1.4, finalColor * (1.1 + uScrollVelocity * 0.2));
    
    // Set alpha based on brightness so we stay transparent in empty areas
    float brightness = max(max(finalColor.r, finalColor.g), finalColor.b);
    float alpha = smoothstep(0.01, 0.1, brightness); 
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function TravelBeacons({ scrollProgress = 0, scrollVelocity = 0 }: TravelBeaconsProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, gl } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(gl.domElement.width, gl.domElement.height) },
    uCameraPos: { value: new THREE.Vector3() },
    uCameraQuat: { value: new THREE.Vector4() },
    uScrollProgress: { value: 0 },
    uScrollVelocity: { value: 0 }
  }), [gl]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    mat.uniforms.uResolution.value.set(gl.domElement.width, gl.domElement.height);
    
    // Sync with Camera
    mat.uniforms.uCameraPos.value.copy(state.camera.position);
    mat.uniforms.uCameraQuat.value.set(
      state.camera.quaternion.x,
      state.camera.quaternion.y,
      state.camera.quaternion.z,
      state.camera.quaternion.w
    );
    
    mat.uniforms.uScrollProgress.value = scrollProgress;
    
    // Smooth scroll velocity
    mat.uniforms.uScrollVelocity.value += (scrollVelocity - mat.uniforms.uScrollVelocity.value) * 0.1;

    // The plane should always be in front of the camera but at the background level
    meshRef.current.position.copy(state.camera.position);
    meshRef.current.quaternion.copy(state.camera.quaternion);
    // Push it back slightly so it doesn't clip UI but stays behind center effects
    meshRef.current.translateZ(-0.1); 
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-5}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
