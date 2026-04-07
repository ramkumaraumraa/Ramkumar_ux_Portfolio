"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

interface BackgroundProps {
  onReady?: () => void;
  currentSection?: string;
}

const Background = ({ onReady, currentSection: currentSectionProp }: BackgroundProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerf, setIsLowPerf] = useState(false);
  const currentSection = currentSectionProp ?? 'home';
  const [visibleComets, setVisibleComets] = useState<any[]>([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const preloadedImages = useRef(new Map<string, string>());

  useEffect(() => {
    const checkCapabilities = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      const lowPerf = mobile || 
                     navigator.hardwareConcurrency <= 2 || 
                     (navigator as any).deviceMemory <= 4 ||
                     window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsLowPerf(lowPerf);
      
      setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    
    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);

  const sectionComets = useMemo(() => ({
    home: [
      'Icon_brush', 'Icon_paint', 'Icon_pencil', 'Icon_illustrator', 'Icon_photoshop',
      'Icon_aftereffects', 'Icon_magicwand', 'Icon_magictool', 'Icon_star', 'Icon_bulb'
    ],
    works: [
      'Icon_dev', 'Icon_laptop', 'Icon_devices', 'Icon_cube', 'Icon_cubesizing',
      'Icon_layer', 'Icon_layout', 'Icon_expand', 'Icon_web', 'Icon_speed'
    ],
    about: [
      'Icon_smiley', 'Icon_hand', 'Icon_brain', 'Icon_crown', 'Icon_guitar',
      'Icon_headphones', 'Icon_yoga', 'Icon_thinking', 'Icon_sing', 'Icon_book'
    ],
    process: [
      'Icon_clock', 'Icon_percentage', 'Icon_microscope', 'Icon_note', 'Icon_bank',
      'Icon_gift', 'Icon_present', 'Icon_planet', 'Icon_satelit', 'Icon_joystick'
    ],
    footer: [
      'Icon_chat', 'Icon_camera', 'Icon_wallet', 'Icon_watch', 'Icon_tablet',
      'Icon_typo', 'Rock 1', 'Rock 2', 'Icon_star', 'Icon_bulb'
    ]
  }), []);

  useEffect(() => {
    const icons = sectionComets[currentSection as keyof typeof sectionComets] || sectionComets.home;
    
    icons.forEach(icon => {
      if (!preloadedImages.current.has(icon)) {
        const img = new Image();
        img.src = `/assets/imgs/icons/comets/${icon}.svg`;
        preloadedImages.current.set(icon, img.src);
      }
    });
  }, [currentSection, sectionComets]);


  useEffect(() => {
    if (isReducedMotion) {
      setVisibleComets([]);
      return;
    }
    
    const baseCount = isMobile ? 8 : 15;
    const icons = sectionComets[currentSection as keyof typeof sectionComets] || sectionComets.home;
    
    const newComets = Array.from({ length: baseCount }, (_, i) => {
      const iconName = icons[i % icons.length];
      return {
        id: `${currentSection}-${i}`,
        icon: iconName,
        size: 12 + Math.random() * 16,
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 10,
        startX: Math.random() * 100,
        startY: Math.random() * 100,
        endX: Math.random() * 100,
        endY: Math.random() * 100
      };
    });
    
    setVisibleComets(newComets);
  }, [currentSection, isMobile, isReducedMotion, sectionComets]);

  useEffect(() => {
    if (isMobile || isReducedMotion || !mountRef.current) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 600);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isLowPerf, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPerf ? 1 : 2));
    
    const threeContainer = document.createElement('div');
    threeContainer.className = 'three-js-starfield';
    threeContainer.style.cssText = `
      position: fixed;
      z-index: -100;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    threeContainer.appendChild(renderer.domElement);
    mountRef.current.appendChild(threeContainer);

    const starVertexShader = `
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const starFragmentShader = `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uLayerCount;

      mat2 Rot(float a) {
          float s = sin(a), c = cos(a);
          return mat2(c, -s, s, c);
      }

      float SubtleStar(vec2 uv, float flare) {
          float d = length(uv);
          float m = 0.06 / d;
          float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 888.0));
          m += rays * flare * 0.1;
          uv *= Rot(3.1415 / 6.0);
          rays = max(0.0, 1.0 - abs(uv.x * uv.y * 888.0));
          m += rays * 0.6 * flare;
          m *= smoothstep(0.95, 0.1, d);
          return m;
      }

      float Hash21(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
      }

      vec3 SubtleStarLayer(vec2 uv) {
          vec3 col = vec3(0.0);
          vec2 gv = fract(uv) - 0.5;
          vec2 id = floor(uv);
          for (int y = -1; y <= 1; y++) {
              for (int x = -1; x <= 1; x++) {
                  vec2 offs = vec2(float(x), float(y));
                  float n = Hash21(id + offs);
                  float size = fract(n * 456.78) * 0.8;
                  float flare = smoothstep(0.4, 0.8, size);
                  flare *= abs(sin(uTime * 1.5));
                  float star = SubtleStar(gv - offs - vec2(n, fract(n * 68.0)) + 0.6, flare);
                  vec3 tint1 = vec3(0.4 + size * 0.2, 0.6, 0.6);
                  vec3 tint2 = vec3(0.4 + size * 0.2, 0.3, 0.3);
                  vec3 color = mix(tint1, tint2, abs(cos(uTime)) + n);
                  color *= fract(n * 1234.5) * 0.6;
                  star *= sin(uTime * 3.0 + n * 6.2821) * 0.3 + 0.6;
                  col += star * size * color;
              }
          }
          return col * 0.8;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
          vec2 M = (uMouse.xy - uResolution.xy * 0.5) / uResolution.y;
          float t = uTime * 0.06;
          uv *= Rot(t);
          vec3 col = vec3(0.0);
          for (float i = 0.0; i < 6.0; i += 1.0) {
              if(i >= uLayerCount) break;
              float depth = fract(i / uLayerCount + t);
              float scale = mix(16.0, 0.5, depth);
              float fade = depth * smoothstep(1.5, 0.9, depth);
              col += SubtleStarLayer(uv * scale + i * 456.45 - M) * fade;
          }
          gl_FragColor = vec4(col, 0.6);
      }
    `;

    const starGeometry = new THREE.PlaneGeometry(6000, 6000);
    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0.0, 0.0) },
        uLayerCount: { value: isLowPerf ? 2 : 3 }
      },
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending
    });

    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    let targetLayerCount = isLowPerf ? 2 : 3;
    let animationId: number;

    const handleScroll = () => {
      if (!isLowPerf) {
        const scrollTop = window.scrollY || window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        targetLayerCount = THREE.MathUtils.clamp(3 + (scrollTop / maxScroll) * 3, 3, 6);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      starMaterial.uniforms.uMouse.value.x = event.clientX;
      starMaterial.uniforms.uMouse.value.y = event.clientY;
    };

    if (!isLowPerf) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = performance.now() * 0.001;

      starMaterial.uniforms.uTime.value = elapsedTime;
      if (!isLowPerf) {
        starMaterial.uniforms.uLayerCount.value += (targetLayerCount - starMaterial.uniforms.uLayerCount.value) * 0.1;
      }

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      starMaterial.uniforms.uResolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (threeContainer && mountRef.current && mountRef.current.contains(threeContainer)) {
        mountRef.current.removeChild(threeContainer);
      }
      
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [isMobile, isReducedMotion, isLowPerf]);

  const CSSLemniscates = useMemo(() => {
    if (isLowPerf || isMobile) return () => null;
    
    return () => (
      <div className="css-lemniscates">
        {Array.from({ length: 20 }, (_, i) => (
          <div 
            key={`lem-${i}`} 
            className={`lemniscate lemniscate-${(i % 3) + 1}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * -10}s`
            }}
          />
        ))}
      </div>
    );
  }, [isLowPerf, isMobile]);

  const CSSComets = useMemo(() => () => (
    <div className="css-comets" data-section={currentSection}>
      {visibleComets.map((comet) => {
        const bgImg = preloadedImages.current.get(comet.icon) || `/assets/imgs/icons/comets/${comet.icon}.svg`;
        return (
          <div 
            key={comet.id} 
            className="css-comet"
            style={{
              backgroundImage: `url('${bgImg}')`,
              '--size': `${comet.size}px`,
              '--duration': `${comet.duration}s`,
              '--delay': `${comet.delay}s`,
              '--start-x': `${comet.startX}vw`,
              '--start-y': `${comet.startY}vh`,
              '--end-x': `${comet.endX}vw`,
              '--end-y': `${comet.endY}vh`
            } as any}
          />
        );
      })}
    </div>
  ), [visibleComets, currentSection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onReady) onReady();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <>
      <div ref={mountRef} />
      <CSSLemniscates />
      <CSSComets />
    </>
  );
};

export default Background;
