"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';

interface BackgroundProps {
  activeSection?: string;
  onReady?: () => void;
}

// ── Section → comet icon mapping ────────────────────────────────────────────
const SECTION_COMETS: Record<string, string[]> = {
  home: [
    'Icon_brush', 'Icon_paint', 'Icon_pencil', 'Icon_illustrator', 'Icon_photoshop',
    'Icon_aftereffects', 'Icon_magicwand', 'Icon_magictool', 'Icon_star', 'Icon_bulb',
  ],
  works: [
    'Icon_dev', 'Icon_laptop', 'Icon_devices', 'Icon_cube', 'Icon_cubesizing',
    'Icon_layer', 'Icon_layout', 'Icon_expand', 'Icon_web', 'Icon_speed',
  ],
  about: [
    'Icon_smiley', 'Icon_hand', 'Icon_brain', 'Icon_crown', 'Icon_guitar',
    'Icon_headphones', 'Icon_yoga', 'Icon_thinking', 'Icon_sing', 'Icon_book',
  ],
  process: [
    'Icon_clock', 'Icon_percentage', 'Icon_microscope', 'Icon_note', 'Icon_bank',
    'Icon_gift', 'Icon_present', 'Icon_planet', 'Icon_satelit', 'Icon_joystick',
  ],
  footer: [
    'Icon_chat', 'Icon_camera', 'Icon_wallet', 'Icon_watch', 'Icon_tablet',
    'Icon_typo', 'Rock 1', 'Rock 2', 'Icon_star', 'Icon_bulb',
  ],
};

interface CometData {
  id: string;
  icon: string;
  size: number;
  duration: number;
  delay: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// ── Star-field vertex shader ─────────────────────────────────────────────────
const STAR_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Star-field fragment shader ───────────────────────────────────────────────
const STAR_FRAG = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
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
        vec2 offs = vec2(x, y);
        float n    = Hash21(id + offs);
        float size = fract(n * 456.78) * 0.8;
        float flare = smoothstep(0.4, 0.8, size);
        flare *= abs(sin(uTime * 1.5));
        float star = SubtleStar(gv - offs - vec2(n, fract(n * 68.0)) + 0.6, flare);
        vec3 tint1 = vec3(0.4 + size * 0.2, 0.6, 0.6);
        vec3 tint2 = vec3(0.4 + size * 0.2, 0.3, 0.3);
        vec3 color = mix(tint1, tint2, abs(cos(uTime)) + n);
        color *= fract(n * 1234.5) * 0.6;
        star  *= sin(uTime * 3.0 + n * 6.2821) * 0.3 + 0.6;
        col   += star * size * color;
      }
    }
    return col * 0.8;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    vec2 M  = (uMouse.xy - uResolution.xy * 0.5) / uResolution.y;
    float t = uTime * 0.06;
    uv *= Rot(t);
    vec3 col = vec3(0.0);
    for (float i = 0.0; i < uLayerCount; i += 1.0) {
      float depth = fract(i / uLayerCount + t);
      float scale = mix(16.0, 0.5, depth);
      float fade  = depth * smoothstep(1.5, 0.9, depth);
      col += SubtleStarLayer(uv * scale + i * 456.45 - M) * fade;
    }
    gl_FragColor = vec4(col, 0.6);
  }
`;

export default function Background({ activeSection = 'home', onReady }: BackgroundProps) {
  const mountRef       = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile]           = useState(false);
  const [isLowPerf, setIsLowPerf]         = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [comets, setComets]               = useState<CometData[]>([]);
  const preloadedImages                   = useRef(new Map<string, string>());

  // ── Device capability detection ──────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const mobile  = window.innerWidth <= 768;
      const lowPerf = mobile
        || (navigator as any).hardwareConcurrency <= 2
        || (navigator as any).deviceMemory <= 4
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setIsMobile(mobile);
      setIsLowPerf(lowPerf);
      setIsReducedMotion(reduced);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Preload comet images for current section ──────────────────────────────
  useEffect(() => {
    const icons = SECTION_COMETS[activeSection] ?? SECTION_COMETS.home;
    icons.forEach(icon => {
      if (!preloadedImages.current.has(icon)) {
        const src = `/assets/imgs/icons/comets/${icon}.svg`;
        preloadedImages.current.set(icon, src);
      }
    });
  }, [activeSection]);

  // ── Drive scroll-level data-attribute from virtual-scroll event ──────────
  useEffect(() => {
    const onVirtualScroll = (e: Event) => {
      const { progress } = (e as CustomEvent).detail;
      const level = Math.min(5, Math.floor(progress * 5));
      document.body.setAttribute('data-scroll-level', String(level));
    };
    window.addEventListener('virtual-scroll', onVirtualScroll);
    return () => window.removeEventListener('virtual-scroll', onVirtualScroll);
  }, []);

  // ── Build comet list when section changes ─────────────────────────────────
  useEffect(() => {
    if (isReducedMotion) { setComets([]); return; }

    const icons    = SECTION_COMETS[activeSection] ?? SECTION_COMETS.home;
    const count    = isMobile ? 8 : 15;

    setComets(
      Array.from({ length: count }, (_, i): CometData => ({
        id:       `${activeSection}-${i}`,
        icon:     icons[i % icons.length],
        size:     12 + Math.random() * 16,
        duration: 10 + Math.random() * 15,
        delay:    Math.random() * 10,
        startX:   Math.random() * 100,
        startY:   Math.random() * 100,
        endX:     Math.random() * 100,
        endY:     Math.random() * 100,
      }))
    );
  }, [activeSection, isMobile, isReducedMotion]);

  // ── Three.js star-field (desktop + WebGL only) ────────────────────────────
  useEffect(() => {
    if (isMobile || isReducedMotion || !mountRef.current) return;

    // Guard: WebGL support check
    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!ctx) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 600);

    const renderer = new THREE.WebGLRenderer({
      antialias:       !isLowPerf,
      alpha:           true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowPerf ? 1 : 2));

    // Mount renderer in a dedicated div so it sits below the WebGL blackhole canvas
    const container = document.createElement('div');
    container.className = 'three-js-starfield';
    Object.assign(container.style, {
      position:      'fixed',
      zIndex:        '-100',
      top:           '0',
      left:          '0',
      width:         '100%',
      height:        '100%',
      pointerEvents: 'none',
    });
    container.appendChild(renderer.domElement);
    mountRef.current.appendChild(container);

    const geo = new THREE.PlaneGeometry(6000, 6000);
    const mat = new THREE.ShaderMaterial({
      vertexShader:   STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uTime:       { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse:      { value: new THREE.Vector2(0, 0) },
        uLayerCount: { value: isLowPerf ? 2 : 3 },
      },
      transparent: true,
      depthTest:   false,
      blending:    THREE.AdditiveBlending,
    });
    scene.add(new THREE.Mesh(geo, mat));

    let targetLayers = isLowPerf ? 2 : 3;
    let animId: number;

    const onScroll = () => {
      if (!isLowPerf) {
        const progress = Number(document.body.getAttribute('data-scroll-level') ?? 0) / 5;
        targetLayers   = THREE.MathUtils.clamp(3 + progress * 3, 3, 6);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mat.uniforms.uMouse.value.set(e.clientX, e.clientY);
    };

    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      mat.uniforms.uResolution.value.set(w, h);
    };

    if (!isLowPerf) {
      window.addEventListener('virtual-scroll', onScroll, { passive: true });
      window.addEventListener('mousemove', onMouseMove,   { passive: true });
    }
    window.addEventListener('resize', onResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      mat.uniforms.uTime.value = performance.now() * 0.001;
      if (!isLowPerf) {
        mat.uniforms.uLayerCount.value +=
          (targetLayers - mat.uniforms.uLayerCount.value) * 0.1;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('virtual-scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.parentNode) container.parentNode.removeChild(container);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [isMobile, isReducedMotion, isLowPerf]);

  // ── Signal ready ──────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => onReady?.(), 100);
    return () => clearTimeout(t);
  }, [onReady]);

  // ── Lemniscates (CSS only, desktop) ──────────────────────────────────────
  const Lemniscates = useMemo(() => {
    if (isLowPerf || isMobile) return null;
    return (
      <div className="css-lemniscates">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={`lem-${i}`}
            className={`lemniscate lemniscate-${(i % 3) + 1}`}
            style={{
              left:           `${Math.random() * 100}%`,
              top:            `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * -10}s`,
            }}
          />
        ))}
      </div>
    );
  }, [isLowPerf, isMobile]);

  // ── Comets ────────────────────────────────────────────────────────────────
  const Comets = useMemo(() => (
    <div className="css-comets" data-section={activeSection}>
      {comets.map(comet => (
        <div
          key={comet.id}
          className="css-comet"
          style={{
            backgroundImage: `url('${
              preloadedImages.current.get(comet.icon)
              ?? `/assets/imgs/icons/comets/${comet.icon}.svg`
            }')`,
            ['--size' as any]:     `${comet.size}px`,
            ['--duration' as any]: `${comet.duration}s`,
            ['--delay' as any]:    `${comet.delay}s`,
            ['--start-x' as any]:  `${comet.startX}vw`,
            ['--start-y' as any]:  `${comet.startY}vh`,
            ['--end-x' as any]:    `${comet.endX}vw`,
            ['--end-y' as any]:    `${comet.endY}vh`,
          }}
        />
      ))}
    </div>
  ), [comets, activeSection]);

  return (
    <>
      {/* Dark fallback before WebGL is ready */}
      <div id="nebula-bg" />

      {/* Three.js starfield mount point */}
      <div ref={mountRef} />

      {/* CSS lemniscate particles */}
      {Lemniscates}

      {/* CSS comet icons */}
      {Comets}
    </>
  );
}
