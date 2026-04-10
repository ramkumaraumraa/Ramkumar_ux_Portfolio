# Process Section — Orbital Arc Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 4-column Process grid with a scroll-synced Orbital Arc that auto-plays through 4 steps, with 3-layer internal parallax on approach and live 3D node sync.

**Architecture:** Two separate GSAP timelines — an entrance TL scrubbed by `localProgress` (created once, never rebuilt), and a timer-driven auto-play sequence that starts on dock. A `window` custom event bridges the HTML card cycle to the R3F `ProcessScene` so the active octahedron node pulses bright in sync with the active card.

**Tech Stack:** GSAP 3 (timeline, context), React Three Fiber, `useSectionProgress` hook, CSS custom properties. Pure GSAP — no Lenis needed because card advancement is timer-driven (not scroll-driven); `power3.inOut` easing provides equivalent smoothness.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/styles/styles.css` | Modify (process block ~line 1453–1596) | Arc container, absolute card, step dots, desc-wrap, remove grid |
| `src/components/sections/Process.tsx` | Full rewrite | Arc JSX, entrance TL, auto-play, event dispatch |
| `src/components/themes/companion-scenes/ProcessScene.tsx` | Targeted changes | Entrance scale fix, active node brightness sync |

---

## Task 1 — CSS: Arc classes + remove grid

**Files:**
- Modify: `src/styles/styles.css` (process block, ~lines 1473–1596)

- [ ] **Step 1: Remove `.process-grid` and `.process-container` rules**

In `src/styles/styles.css`, delete the `.process-grid` block and `.process-container` block entirely (lines ~1474–1484):

```css
/* DELETE these two blocks: */
.process-container {
  width: 100%;
  max-width: none;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
}
```

- [ ] **Step 2: Add arc container, card positioning, desc-wrap, step dots**

After the `.process-section` block (~line 1471), add:

```css
/* ─── Arc container ─────────────────────────────────────── */
.process-arc-container {
  position: relative;
  width: 100%;
  height: 520px;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Cards are placed absolutely by GSAP — only width set here */
.process-arc-card {
  position: absolute;
  width: 280px;
  will-change: transform, opacity;
}

/* Title + subtitle grouped for parallax targeting */
.process-card-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

/* Description: GSAP controls height (0 → auto) */
.process-desc-wrap {
  overflow: hidden;
}

/* ─── Step indicator dots ───────────────────────────────── */
.process-step-indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 28px;
}

.process-step-dot {
  width: 8px;
  height: 8px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  /* GSAP morphs width + background-color on active */
}
```

- [ ] **Step 3: Replace the tablet + mobile breakpoints for the process block**

Remove the old `@media (max-width: 1024px)` and `@media (max-width: 768px)` process-grid overrides (lines ~1577–1596). Replace with:

```css
/* Tablet: narrower cards */
@media (max-width: 1024px) {
  .process-arc-container {
    height: 480px;
  }
  .process-arc-card {
    width: 240px;
  }
}

/* Mobile: single-card centered, clip overflow */
@media (max-width: 768px) {
  .process-arc-container {
    height: 460px;
    overflow: hidden;
  }
  .process-arc-card {
    width: min(90vw, 340px);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/styles.css
git commit -m "style(process): replace grid with arc container + step indicators"
```

---

## Task 2 — Process.tsx: Static arc JSX

**Files:**
- Modify: `src/components/sections/Process.tsx`

This task gets the new JSX structure rendering with correct card markup — no animation yet. Confirms the DOM shape before wiring GSAP.

- [ ] **Step 1: Replace the file with new static shell**

```tsx
"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const processSteps = [
  {
    id: 1,
    title: "01. Strategizing",
    subtitle: "Laying the Foundation for Success",
    description:
      "I dive deep into uncovering core challenges and aspirations of clients and stakeholders. Through comprehensive exploration, I create detailed wireframes that align with strategic goals.",
    colorClass: "turquoise",
    accentColor: "#00d7ff",
    svgSrc: "/assets/imgs/Process/1.svg",
  },
  {
    id: 2,
    title: "02. Discovery",
    subtitle: "Transforming Concepts into Prototypes",
    description:
      "Guided by a problem-solving mindset, I transform complex ideas into interactive prototypes. This approach provides a compelling vision of the end product before development begins.",
    colorClass: "pink",
    accentColor: "#d946ef",
    svgSrc: "/assets/imgs/Process/2.svg",
  },
  {
    id: 3,
    title: "03. Creation",
    subtitle: "Orchestrating Seamless Collaboration",
    description:
      "Bridging stakeholders and users is key. I drive collaboration with developers and stakeholders, ensuring a fluid process from inception to post-launch.",
    colorClass: "blue",
    accentColor: "#60a5fa",
    svgSrc: "/assets/imgs/Process/3.svg",
  },
  {
    id: 4,
    title: "04. Optimizing",
    subtitle: "Refining Through Rigorous Testing",
    description:
      "Continuous improvement is at the core of my process. I rigorously test designs through multiple methodologies, ensuring every interaction is purposeful.",
    colorClass: "turquoise",
    accentColor: "#00d7ff",
    svgSrc: "/assets/imgs/Process/4.svg",
  },
];

// Arc position configs by offset from active card (mod 4).
// x is in px, applied by GSAP.
const ARC = [
  { x: 0,    scale: 1.00, opacity: 1.00 }, // offset 0 = center (active)
  { x: 260,  scale: 0.72, opacity: 0.55 }, // offset 1 = near-right
  { x: 520,  scale: 0.50, opacity: 0.20 }, // offset 2 = far-right
  { x: -260, scale: 0.72, opacity: 0.55 }, // offset 3 = near-left
] as const;

const Process = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const dotRefs  = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const entranceTlRef    = useRef<gsap.core.Timeline | null>(null);
  const gsapCtxRef       = useRef<gsap.Context | null>(null);
  const activeIndexRef   = useRef(0);
  const autoPlayRunning  = useRef(false);
  const startAutoPlayRef = useRef<(() => void) | null>(null);
  const stopAutoPlayRef  = useRef<(() => void) | null>(null);

  const localProgress = useSectionProgress(3, 0.7);

  return (
    <section id="process" className="process-section" ref={sectionRef}>
      <div className="process-arc-container">
        {processSteps.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`process-card process-arc-card process-card-${step.id}`}
          >
            <div className="process-svg-wrap" style={{ position: 'relative' }}>
              <Image
                src={step.svgSrc}
                alt=""
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            <div className="process-card-content">
              <div className="process-card-title-group">
                <h3 className={`${step.colorClass} neon body-title-3`}>{step.title}</h3>
                <p className="body-2">{step.subtitle}</p>
              </div>
              <div className="process-desc-wrap">
                <p className="footnote">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="process-step-indicators">
        {processSteps.map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotRefs.current[i] = el; }}
            className="process-step-dot"
          />
        ))}
      </div>
    </section>
  );
};

export default Process;
```

- [ ] **Step 2: Verify in browser**

Navigate to the Process section. You should see 4 cards stacked on top of each other (all at x:0, no GSAP positioning yet) with the new SVG-per-card layout and step dots below.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Process.tsx
git commit -m "feat(process): add orbital arc JSX shell with static card markup"
```

---

## Task 3 — Process.tsx: Entrance timeline (scroll-scrubbed)

**Files:**
- Modify: `src/components/sections/Process.tsx`

Add the mount `useEffect` that creates the entrance timeline once, sets initial GSAP positions, and wires description open/close states. Add the separate `useEffect([localProgress])` that scrubs the timeline — no context rebuild on each tick.

- [ ] **Step 1: Add mount useEffect (entrance TL setup)**

Add this `useEffect` inside the `Process` component, after the `localProgress` line and before the `return`:

```tsx
// ── Mount: build entrance timeline once ───────────────────
useEffect(() => {
  if (!sectionRef.current) return;

  gsapCtxRef.current = gsap.context(() => {
    // ── 1. Initial arc positions (invisible) ──────────────
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const pos = ARC[i]; // card 0=center, 1=near-right, 2=far-right, 3=near-left
      gsap.set(el, { x: pos.x, scale: 0.4, opacity: 0, y: 80, filter: 'blur(12px)' });
    });

    // ── 2. Description initial states ─────────────────────
    // Card 0 (active) description open; others collapsed
    const descEls = cardRefs.current.map(el => el?.querySelector<HTMLElement>('.process-desc-wrap'));
    gsap.set(descEls[0], { height: 'auto', opacity: 1 });
    [1, 2, 3].forEach(i => gsap.set(descEls[i], { height: 0, opacity: 0 }));

    // ── 3. Build paused entrance timeline ─────────────────
    const tl = gsap.timeline({ paused: true });

    // Cards emerge from blur/depth into arc positions — staggered 0.08s
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const pos = ARC[i];
      tl.to(el, {
        x: pos.x,
        scale: pos.scale,
        opacity: pos.opacity,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
      }, i * 0.08);
    });

    // Internal parallax: 3 layers at different Y start offsets (deeper = less travel)
    // SVG — slowest, feels deepest
    tl.fromTo('.process-svg-wrap',
      { y: 32 },
      { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 },
      0,
    );
    // Title group — baseline
    tl.fromTo('.process-card-title-group',
      { y: 48 },
      { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 },
      0,
    );
    // Description text travels furthest — feels closest to viewer
    tl.fromTo('.process-desc-wrap',
      { y: 64 },
      { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 },
      0,
    );

    entranceTlRef.current = tl;

    // ── 4. Initial dot state ──────────────────────────────
    const activeDot = dotRefs.current[0];
    if (activeDot) {
      gsap.set(activeDot, { width: 24, backgroundColor: processSteps[0].accentColor });
    }
  }, sectionRef);

  return () => {
    stopAutoPlayRef.current?.();
    gsapCtxRef.current?.revert();
    gsapCtxRef.current = null;
    entranceTlRef.current = null;
  };
}, []); // Mount only — no deps
```

- [ ] **Step 2: Add progress useEffect (scrubs timeline, manages autoplay)**

Add a second `useEffect` that only scrubs the timeline and manages autoplay start/stop. Put it after the mount effect:

```tsx
// ── localProgress: scrub entrance TL + start/stop autoplay ─
useEffect(() => {
  entranceTlRef.current?.progress(localProgress);

  if (localProgress >= 0.92) {
    startAutoPlayRef.current?.();
  } else if (localProgress < 0.5) {
    stopAutoPlayRef.current?.();
  }
}, [localProgress]);
```

- [ ] **Step 3: Verify in browser**

Scroll into the Process section. Cards should emerge from blur and settle into the arc positions (center, near-right, far-right, near-left). Scroll away and back — no flicker. Console should be clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Process.tsx
git commit -m "feat(process): entrance timeline with 3-layer parallax, scroll-scrubbed"
```

---

## Task 4 — Process.tsx: Auto-play cycle + step dots + event dispatch

**Files:**
- Modify: `src/components/sections/Process.tsx`

Wire the auto-play: a recursive `setTimeout` that advances the active card every 3.5s, animates arc position changes, collapses/expands descriptions, morphs step dots, and dispatches `process-active-card`.

- [ ] **Step 1: Add the updateDots helper and auto-play logic into the mount useEffect**

Replace the mount `useEffect` body (from Task 3) with the expanded version that includes auto-play:

```tsx
// ── Mount: entrance TL + auto-play ───────────────────────
useEffect(() => {
  if (!sectionRef.current) return;

  gsapCtxRef.current = gsap.context(() => {
    // ── Initial GSAP positions ────────────────────────────
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const pos = ARC[i];
      gsap.set(el, { x: pos.x, scale: 0.4, opacity: 0, y: 80, filter: 'blur(12px)' });
    });

    const descEls = cardRefs.current.map(el => el?.querySelector<HTMLElement>('.process-desc-wrap'));
    gsap.set(descEls[0], { height: 'auto', opacity: 1 });
    [1, 2, 3].forEach(i => gsap.set(descEls[i], { height: 0, opacity: 0 }));

    // ── Entrance timeline ─────────────────────────────────
    const tl = gsap.timeline({ paused: true });

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const pos = ARC[i];
      tl.to(el, {
        x: pos.x, scale: pos.scale, opacity: pos.opacity,
        y: 0, filter: 'blur(0px)',
        duration: 1.2, ease: 'power3.out',
      }, i * 0.08);
    });

    tl.fromTo('.process-svg-wrap',
      { y: 32 }, { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 }, 0);
    tl.fromTo('.process-card-title-group',
      { y: 48 }, { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 }, 0);
    tl.fromTo('.process-desc-wrap',
      { y: 64 }, { y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06 }, 0);

    entranceTlRef.current = tl;

    // ── Step dot updater ──────────────────────────────────
    const updateDots = (idx: number) => {
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        if (i === idx) {
          gsap.to(dot, {
            width: 24,
            backgroundColor: processSteps[idx].accentColor,
            duration: 0.4, ease: 'power2.out',
          });
        } else {
          gsap.to(dot, {
            width: 8,
            backgroundColor: 'rgba(255,255,255,0.2)',
            duration: 0.3, ease: 'power2.out',
          });
        }
      });
    };

    // Set initial dot — card 0 active
    const d0 = dotRefs.current[0];
    if (d0) gsap.set(d0, { width: 24, backgroundColor: processSteps[0].accentColor });

    // ── Auto-play: advance one step ───────────────────────
    let timerHandle: ReturnType<typeof setTimeout> | null = null;

    const advance = () => {
      const prev = activeIndexRef.current;
      const next = (prev + 1) % 4;

      // Transition: animate every card to new arc position
      const transitionTl = gsap.timeline({
        onComplete: () => {
          activeIndexRef.current = next;
          window.dispatchEvent(
            new CustomEvent('process-active-card', { detail: { index: next } })
          );
          updateDots(next);
          schedule(); // queue next cycle
        },
      });

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const diff = ((i - next) % 4 + 4) % 4;
        const pos = ARC[diff];
        transitionTl.to(el, {
          x: pos.x, scale: pos.scale, opacity: pos.opacity,
          duration: 0.7, ease: 'power3.inOut',
        }, 0);
      });

      // Collapse prev description, expand next description
      const prevDesc = descEls[prev];
      const nextDesc = descEls[next];
      if (prevDesc) {
        transitionTl.to(prevDesc, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0);
      }
      if (nextDesc) {
        transitionTl.to(nextDesc, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.3);
      }
    };

    const schedule = () => {
      if (!autoPlayRunning.current) return;
      timerHandle = setTimeout(advance, 3500);
    };

    // ── Expose start / stop via refs ──────────────────────
    startAutoPlayRef.current = () => {
      if (autoPlayRunning.current) return;
      autoPlayRunning.current = true;
      schedule();
    };

    stopAutoPlayRef.current = () => {
      autoPlayRunning.current = false;
      if (timerHandle) { clearTimeout(timerHandle); timerHandle = null; }
    };
  }, sectionRef);

  return () => {
    stopAutoPlayRef.current?.();
    gsapCtxRef.current?.revert();
    gsapCtxRef.current = null;
    entranceTlRef.current = null;
  };
}, []); // mount only
```

The progress `useEffect` from Task 3 remains unchanged:

```tsx
useEffect(() => {
  entranceTlRef.current?.progress(localProgress);
  if (localProgress >= 0.92) startAutoPlayRef.current?.();
  else if (localProgress < 0.5) stopAutoPlayRef.current?.();
}, [localProgress]);
```

- [ ] **Step 2: Verify auto-play in browser**

Scroll to the Process section and dock. Within ~3.5 seconds, card 2 should slide to center, card 1 should recede left, cards move through the arc. The step dot for the active card should stretch to a capsule. Description text should collapse on leaving card and expand on arriving card. After card 4, it should loop back to card 1.

Also verify: scroll away mid-cycle (localProgress drops below 0.5) — auto-play should stop. Return — auto-play resumes from wherever it was.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Process.tsx
git commit -m "feat(process): auto-play arc cycle, step dots, process-active-card event"
```

---

## Task 5 — ProcessScene.tsx: Entrance fix + active node sync

**Files:**
- Modify: `src/components/themes/companion-scenes/ProcessScene.tsx`

Fix the scale-from-1 pop-in bug (same pattern as AboutScene), wire the `process-active-card` event to lerp node brightness, add pulse beat on active node, brighten adjacent wire connectors.

- [ ] **Step 1: Replace ProcessScene.tsx**

```tsx
"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPLINE_POINTS } from '@/lib/scrollConstants';
import { useSectionProgress } from '@/hooks/useSectionProgress';

const DIAMOND_POSITIONS: [number, number, number][] = [
  [0,  4,  0],  // top    → card 1 Strategizing  (cyan)
  [4,  0,  0],  // right  → card 2 Discovery      (pink)
  [0, -4,  0],  // bottom → card 3 Creation        (blue)
  [-4, 0,  0],  // left   → card 4 Optimizing     (cyan)
];

const NODE_COLORS   = ['#00d7ff', '#d946ef', '#60a5fa', '#00d7ff'];
const PHASE_OFFSETS = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

// Wire pairs: [nodeA, nodeB] — indices into DIAMOND_POSITIONS
const WIRE_PAIRS: [number, number][] = [[0,1],[1,2],[2,3],[3,0]];

export function ProcessScene() {
  const localProgress  = useSectionProgress(3);
  const activeNodeRef  = useRef(0);

  const nodeRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);
  const tubeRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);

  // Listen for card transitions from Process.tsx
  useEffect(() => {
    const handler = (e: Event) => {
      activeNodeRef.current = (e as CustomEvent<{ index: number }>).detail.index;
    };
    window.addEventListener('process-active-card', handler);
    return () => window.removeEventListener('process-active-card', handler);
  }, []);

  // Build tube geometries once
  const tubeGeometries = useMemo(() => {
    return WIRE_PAIRS.map(([a, b]) => {
      const pA = new THREE.Vector3(...DIAMOND_POSITIONS[a]);
      const pB = new THREE.Vector3(...DIAMOND_POSITIONS[b]);
      const curve = new THREE.CatmullRomCurve3([pA, pB]);
      return new THREE.TubeGeometry(curve, 8, 0.015, 6, false);
    });
  }, []);

  useFrame((state) => {
    const active = activeNodeRef.current;
    const t = state.clock.elapsedTime;

    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      // Vertical bob — all nodes
      const bob = Math.sin(t * 1.2 + PHASE_OFFSETS[i]) * 0.3;
      mesh.position.set(
        DIAMOND_POSITIONS[i][0],
        DIAMOND_POSITIONS[i][1] + bob,
        DIAMOND_POSITIONS[i][2],
      );

      // Scale: lerp from 0 on approach, plus pulse beat on active node
      const isActive = i === active;
      const targetEmissive = isActive ? 3.5 : 0.6;
      mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.06;

      // Scale: entrance lerp toward localProgress, then active node gets a beat
      const beatScale = isActive
        ? localProgress * (1 + Math.sin(t * 1.5 * Math.PI * 2) * 0.10)
        : localProgress;
      mesh.scale.setScalar(mesh.scale.x + (beatScale - mesh.scale.x) * 0.08);
    });

    // Wire connectors — brighten the two wires adjacent to active node
    tubeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // Wire i connects WIRE_PAIRS[i][0] and WIRE_PAIRS[i][1]
      const isAdjacent =
        WIRE_PAIRS[i][0] === active || WIRE_PAIRS[i][1] === active;
      const targetOpacity = isAdjacent
        ? 0.9 * localProgress
        : 0.4 * localProgress;
      mat.opacity += (targetOpacity - mat.opacity) * 0.06;
    });
  });

  return (
    <group position={SPLINE_POINTS[3]}>
      {/* Octahedron nodes — scale starts at 0, GSAP lerp brings in */}
      {DIAMOND_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { nodeRefs.current[i] = el; }}
          position={pos}
          scale={0}
        >
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial
            color={NODE_COLORS[i]}
            emissive={NODE_COLORS[i]}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* Wire connectors */}
      {tubeGeometries.map((geom, i) => (
        <mesh
          key={`tube-${i}`}
          ref={(el) => { tubeRefs.current[i] = el; }}
          geometry={geom}
        >
          <meshStandardMaterial
            color="#94a3b8"
            emissive="#94a3b8"
            emissiveIntensity={0.4}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      <pointLight position={[4,  4, 2]} intensity={1.5} color="#00d7ff" />
      <pointLight position={[-4, -4, 2]} intensity={1.2} color="#d946ef" />
    </group>
  );
}
```

- [ ] **Step 2: Verify 3D sync in browser**

Navigate to Process section and dock. The octahedron nodes should emerge from scale 0 as the camera approaches. Once docked and auto-play starts, the active node should pulse noticeably brighter than the others. The two wire connectors touching the active node should be near-opaque; the others dim. As each card advances, the lit node should shift around the diamond.

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/companion-scenes/ProcessScene.tsx
git commit -m "feat(process-scene): entrance scale fix, active node pulse, wire sync"
```

---

## Task 6 — Full integration check

**Files:** none (verification only)

- [ ] **Step 1: Full journey scroll**

Start at Home, scroll through Works → About → Process → Footer. Verify:
- Process section entrance is smooth (no flicker, no pop-in from scale 1)
- Cards emerge from blur in staggered order
- Auto-play starts after ~1s of docking
- Step dots morph correctly
- Description expands on incoming card, collapses on outgoing card
- 3D nodes pulse in sync with HTML card cycle
- Scrolling away mid-cycle stops auto-play; returning resumes it

- [ ] **Step 2: Check console**

No errors. In particular: no "Cannot read property of null" (all refs guarded with `if (!el) return`), no GSAP warnings about targets not found.

- [ ] **Step 3: Check mobile (768px)**

Single-card view at mobile breakpoint. Only center card visible (side cards clipped). Step dots present. Auto-play works.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(process): orbital arc revamp — entrance parallax, auto-play, 3D node sync"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Arc layout (5 position offsets, wrap logic via mod 4) — Task 2
- ✅ 3-layer internal parallax (SVG 0.7×, title 1.0×, desc 1.3×) — Task 3  
- ✅ Entrance timeline (scroll-scrubbed, no dep-array flicker) — Task 3
- ✅ Auto-play (3.5s hold → 0.7s transition → repeat) — Task 4
- ✅ Description expand/collapse — Task 4
- ✅ Step indicator dot morph — Task 4
- ✅ `process-active-card` event dispatch — Task 4
- ✅ 3D node emissiveIntensity lerp (active: 3.5, inactive: 0.6) — Task 5
- ✅ Active node pulse beat (sin at 1.5Hz) — Task 5
- ✅ Adjacent wire brightening — Task 5
- ✅ Entrance scale fix (scale=0 in JSX) — Task 5
- ✅ Mobile single-card view — Task 1 CSS
- ✅ No Lenis (noted in header — GSAP power3.inOut is equivalent for this use case)

**Type consistency:** `ARC` constant used identically in Task 2 (JSX), Task 3 (entrance set), Task 4 (advance fn). `processSteps[idx].accentColor` field defined in Task 2 data and consumed in Task 4 `updateDots`. `activeNodeRef.current` set in Task 5 event listener and read in `useFrame`.

**No placeholders detected.**
