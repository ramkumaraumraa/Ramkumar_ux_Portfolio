# Section Revamp: R3F Premium Navigation System
**Date:** 2026-04-08  
**Status:** Ready for implementation  
**Tool:** Antigravity

---

## Context

The portfolio uses a **virtual scroll engine** (not real DOM scroll / Lenis). `page.tsx` locks `overflow:hidden` and runs a RAF loop that lerps `virtualScrollRef` toward `targetScrollRef`, emitting a `virtual-scroll` CustomEvent on `window` with `{ progress, scroll, velocity, direction }`.

The R3F camera travels Z from `0` to `-60` (5 sections × 15 units apart) driven by `scrollProgressRef.current` (0→1) in `CameraRig.tsx`.

**Section dock positions:**
| Section | Index | Dock Z | Progress threshold |
|---------|-------|--------|--------------------|
| Home    | 0     | 0      | 0.00               |
| Works   | 1     | -15    | 0.18               |
| About   | 2     | -30    | 0.36               |
| Process | 3     | -45    | 0.54               |
| Footer  | 4     | -60    | 0.72               |

---

## Part 1: Critical Bugs (Fix First)

### Bug 1: ScrollTrigger is dead in all sections
`Works.tsx`, `About.tsx`, `Process.tsx` all use `ScrollTrigger.create({ trigger: sectionRef.current, start: 'top 80%' })`. But `page.tsx` locks native scroll permanently (`overflow:hidden`). `window.scrollY` is always `0`. **All section entrance animations are permanently broken.**

### Bug 2: Navbar anchor links are no-ops
Navbar uses `href="#works"`, `href="#about"`, `href="#process"`. With `overflow:hidden` and virtual scroll, native hash navigation does nothing. Replace with `setActiveTab` button calls.

### Bug 3: Dual Background render
`page.tsx` renders `<Background currentSection={activeSection} />` at the top level. `Orchestrator.tsx` renders another `<Background>` inside itself. Two WebGL starfield contexts run simultaneously on desktop. Remove the one inside Orchestrator (keep the one in page.tsx).

### Bug 4: Double parallax on Home
`Home.tsx` applies `gsap.to(blockRef.current, { x, y })` on every `mousemove`. `CameraRig.tsx` also reads `state.pointer` and rotates the camera. Two competing parallax systems. Remove the `mousemove` handler from `Home.tsx` entirely — CameraRig owns parallax.

### Bug 5: Works cards permanently invisible
Cards start at `opacity:0, scale:0.5`. The `ScrollTrigger onEnter` that would reveal them never fires. Cards are invisible forever on desktop.

### Bug 6: Process SVG animation never starts
`masterTimelineRef.current?.restart()` is gated behind `ScrollTrigger onEnter` — which never fires. All 4 process cards show the same static SVG #1.

---

## Part 2: Architecture Gaps

### Gap 1: No single source of truth for section positions
`SECTION_THRESHOLDS` is defined in both `page.tsx` and `Orchestrator.tsx`. `SECTION_Z_POSITIONS` is defined separately in `CameraRig.tsx` and `SectionPanels.tsx`. They must stay in sync manually.

**Fix:** Create `src/lib/scrollConstants.ts`:
```ts
export const TOTAL_DEPTH = 60;
export const VIRTUAL_MAX = 18_000;
export const SECTION_IDS = ['home', 'works', 'about', 'process', 'footer'] as const;
export const SECTION_Z_POSITIONS = [0, -15, -30, -45, -60] as const;
export const SECTION_THRESHOLDS = [0, 0.18, 0.36, 0.54, 0.72] as const;
export const DOCK_THRESHOLD = 2.5;
export const VISIBLE_RANGE = 8;
```
Import everywhere. Delete inline constants.

### Gap 2: No inter-section ambient content during tunnel travel
Camera travels 15 units between docks — user sees only the raw wormhole. Sections should begin to materialise at ~8 units away.

### Gap 3: `<Html transform distanceFactor={2}>` in SectionPanels has major limitations
- GSAP does not work correctly inside R3F Html portals  
- React event handling is unreliable  
- All 5 section React trees mount immediately on page load (expensive)  
- Portaled to `document.body` — bypasses the normal Z-index stack

**Fix:** Replace with CSS proximity overlays (see Part 4).

### Gap 4: No post-processing
R3F Canvas has zero post-processing. No Bloom, no Depth of Field, no Vignette. The wormhole shader and starfield look flat without it. `@react-three/postprocessing` is already installed.

### Gap 5: R3F used only as shader quad + camera controller
The entire R3F scene is: `HomeTheme` (screen-space shader), `CameraRig` (null render), `SectionPanels` (Html portals). Zero geometry, zero lights, zero PBR materials, zero physics.

---

## Part 3: `useSectionProgress` Hook

Create `src/hooks/useSectionProgress.ts`. This replaces ScrollTrigger in all section components.

```ts
import { useState, useEffect } from 'react';
import { SECTION_Z_POSITIONS, TOTAL_DEPTH, VISIBLE_RANGE } from '@/lib/scrollConstants';

/**
 * Returns localProgress: 0→1 as camera approaches this section's dock.
 * 0 = camera 8+ units away, 1 = camera exactly docked.
 *
 * @param sectionIndex 0=home, 1=works, 2=about, 3=process, 4=footer
 */
export function useSectionProgress(sectionIndex: number): number {
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    const dockZ = SECTION_Z_POSITIONS[sectionIndex];

    const onScroll = (e: Event) => {
      const progress = (e as CustomEvent).detail.progress as number;
      const cameraZ = -progress * TOTAL_DEPTH;
      const distance = Math.abs(cameraZ - dockZ);
      setLocalProgress(Math.max(0, 1 - distance / VISIBLE_RANGE));
    };

    window.addEventListener('virtual-scroll', onScroll, { passive: true });
    return () => window.removeEventListener('virtual-scroll', onScroll);
  }, [sectionIndex]);

  return localProgress;
}
```

**Usage in any section:**
```ts
const localProgress = useSectionProgress(1); // Works = index 1

useEffect(() => {
  const tl = gsap.timeline({ paused: true });
  tl.fromTo('.works-card', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, stagger: 0.1 });
  tl.progress(localProgress);
}, [localProgress]);
```

---

## Part 4: Replace SectionPanels with CSS Proximity Overlays

**File to replace:** `src/components/themes/SectionPanels.tsx`

Drop `<Html transform distanceFactor={2}>`. Use `position:fixed` sections driven by `localProgress`:

```tsx
// src/components/themes/SectionPanel.tsx
import { useSectionProgress } from '@/hooks/useSectionProgress';

interface SectionPanelProps {
  sectionIndex: number;
  children: React.ReactNode;
}

export function SectionPanel({ sectionIndex, children }: SectionPanelProps) {
  const localProgress = useSectionProgress(sectionIndex);
  const isDocked = localProgress > 0.85;
  const scale = 0.3 + localProgress * 0.7; // 0.3 approaching → 1.0 docked

  if (localProgress === 0) return null; // unmount when far away

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        opacity: localProgress,
        transform: `scale(${scale})`,
        pointerEvents: isDocked ? 'auto' : 'none',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
```

Wrap each section in `page.tsx`:
```tsx
<SectionPanel sectionIndex={0}><HomeSection /></SectionPanel>
<SectionPanel sectionIndex={1}><WorksSection /></SectionPanel>
<SectionPanel sectionIndex={2}><AboutSection /></SectionPanel>
<SectionPanel sectionIndex={3}><ProcessSection /></SectionPanel>
<SectionPanel sectionIndex={4}><FooterSection /></SectionPanel>
```

The visual "approaching dot → full panel" zoom is preserved. GSAP works normally inside each section. Sections unmount when far away (only the active + adjacent section live in DOM).

---

## Part 5: Magnetic Dock Snapping (True Pinning Feel)

Modify the `tick()` loop in `page.tsx` to add magnetic snap near section thresholds:

```ts
// In tick(), after computing progress:
const SNAP_RADIUS = 0.012; // 1.2% of total scroll = ~216px of virtual scroll
let isNearDock = false;
for (const t of SECTION_THRESHOLDS) {
  if (Math.abs(progress - t) < SNAP_RADIUS) {
    isNearDock = true;
    break;
  }
}
const EASE = isNearDock ? 0.035 : 0.085;
virtualScrollRef.current += (targetScrollRef.current - virtualScrollRef.current) * EASE;
```

When the user stops scrolling near a section, the camera slows down and eases in magnetically. This is the "pinning" feel — no GSAP ScrollTrigger needed.

---

## Part 6: Fix Each Section

### Works.tsx
- Remove `ScrollTrigger.create({ trigger: sectionRef.current, start: 'top 50%' })`
- Add `const localProgress = useSectionProgress(1);`
- Create a `useEffect` that builds a paused GSAP timeline and drives it: `tl.progress(localProgress)`
- Fan-out animation: `onEnter` → `tl.play()`, `onLeaveBack` → `tl.reverse()` pattern becomes simply `tl.progress(localProgress)`
- Hover interactions stay identical (not scroll-dependent)

### About.tsx
- Remove `ScrollTrigger` entirely from the `useEffect`
- Add `const localProgress = useSectionProgress(2);`
- Replace `scrollTrigger: { trigger, start, toggleActions }` with `tl.progress(localProgress)` in a separate `useEffect([localProgress])`
- Remove `@react-spring/web` — replace `useSpring` stat hover with GSAP `gsap.to(el, { scale: 1.05 })`

### Process.tsx
- Remove `ScrollTrigger.create({ onEnter: () => masterTimelineRef.current?.restart() })`
- Add `const localProgress = useSectionProgress(3);`
- In `useEffect([localProgress])`: `if (localProgress > 0.5 && !masterTimelineRef.current?.isActive()) masterTimelineRef.current?.restart();`
- The master SVG rotation timeline keeps its existing structure — just needs the trigger fixed

### Home.tsx
- Remove the `mousemove` handler entirely (the `window.addEventListener('mousemove', onMove)` block)
- The `gsap.to(blockRef.current, { x, y })` parallax conflicts with CameraRig's `state.pointer` tilt
- All other existing GSAP character animations are fine — they're time-based, not scroll-based

### Footer.tsx
- No ScrollTrigger used — already fine
- Add entrance animation driven by `useSectionProgress(4)` for testimonial cards
- Stagger in testimonial cards when `localProgress > 0.3`

---

## Part 7: Post-Processing Layer

Add inside Orchestrator's Canvas `<Suspense>` block:

```tsx
// src/components/themes/ScenePostProcessing.tsx
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

interface ScenePostProcessingProps {
  currentSection: string;
}

export function ScenePostProcessing({ currentSection }: ScenePostProcessingProps) {
  const isHome    = currentSection === 'home';
  const isFooter  = currentSection === 'footer';
  const isProcess = currentSection === 'process';

  return (
    <EffectComposer>
      {/* Always on — wormhole + starfield need bloom */}
      <Bloom
        intensity={isHome ? 1.8 : 0.7}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Depth of field: focuses on section panel, blurs wormhole tunnel behind */}
      <DepthOfField
        worldFocusDistance={2}
        worldFocusRange={4}
        bokehScale={3}
        height={480}
      />

      {/* Footer: chromatic aberration — cinematic end-of-journey */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={isFooter ? [0.004, 0.004] : [0.0005, 0.0005]}
        radialModulation={false}
        modulationOffset={0}
      />

      {/* Vignette — heavier at footer */}
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={isFooter ? 0.75 : 0.35}
      />
    </EffectComposer>
  );
}
```

Add `<ScenePostProcessing currentSection={currentSection} />` inside the `<Suspense>` in `Orchestrator.tsx`.

---

## Part 8: Per-Section R3F 3D Scene Companions

Each section gets an R3F component that renders 3D geometry visible only when camera is near its dock. Add these inside Orchestrator's Canvas. All use `useSectionProgress` to gate rendering and animate in/out.

### HomeScene (dockZ=0)
```tsx
// src/components/themes/scenes/HomeScene.tsx
// - 600 instanced Points in a random cloud
// - useFrame: rotate slowly, pulse scale with localProgress
// - MeshBasicMaterial with neon cyan color + additive blending
// - When localProgress > 0.8: particles drift toward center (coalesce effect)
// - useTexture('/assets/imgs/icons/comets/Icon_star.svg') for point texture
// libs: useFrame, Points, PointMaterial, useTexture
```

### WorksScene (dockZ=-15)
```tsx
// src/components/themes/scenes/WorksScene.tsx
// - 5 PlaneGeometry cards (aspect ratio 4:5) with project image textures
// - useTexture([...projectImagePaths]) for 5 project thumbnails
// - MeshPhysicalMaterial: roughness=0.05, transmission=0.1, ior=1.5, thickness=0.5
// - Fan formation: positions/rotations match the HTML card fan layout
// - When localProgress < 0.3: cards at center, scale=0, invisible
// - When localProgress → 1: cards spread to fan positions
// - useFrame: subtle float animation (sin wave on Y)
// - PointLight at [0, 2, -13] — casts soft shadows on cards
// libs: useFrame, useTexture, MeshPhysicalMaterial, PointLight, Physics, RigidBody (optional)
```

### AboutScene (dockZ=-30)
```tsx
// src/components/themes/scenes/AboutScene.tsx
// - Profile image plane: PlaneGeometry(3, 3.6) at position [-4, 0, -30]
// - useTexture('/assets/imgs/About/My Pic 1.png')
// - MeshStandardMaterial: metalness=0.1, roughness=0.3
// - SpotLight at [0, 5, -25], aimed at profile plane, intensity driven by localProgress
// - 3 floating Text3D or PlaneGeometry meshes for "25+" "100+" "500+" stats
//   with neon pink emissive, position [2, 1, -30], [2, 0, -30], [2, -1, -30]
// - Environment preset="night" for ambient PBR reflections
// libs: useTexture, SpotLight, Environment, useFrame
```

### ProcessScene (dockZ=-45)
```tsx
// src/components/themes/scenes/ProcessScene.tsx
// - 4 SphereGeometry nodes at corners of a diamond formation
// - MeshPhysicalMaterial with emissive neon colors (turquoise, pink, blue, turquoise)
// - CatmullRomCurve3 connecting the 4 nodes → TubeGeometry paths
// - 200 Points flowing along tube paths (useFrame: advance offset each frame)
// - When localProgress > 0.5: node emissive pulses (sin wave on intensity)
// - EmissiveIntensity lerps from 0 → 2 with localProgress
// libs: CatmullRomCurve3, TubeGeometry, SphereGeometry, Points, useFrame
```

### FooterScene (dockZ=-60)
```tsx
// src/components/themes/scenes/FooterScene.tsx
// - 6 PlaneGeometry cards for testimonials in a 3×2 grid at z=-62
// - MeshTransmissionMaterial: transmission=0.8, roughness=0.02, ior=1.4, thickness=1
// - When localProgress < 0.5: cards scattered above viewport (y=+10)
// - When localProgress → 1: cards settle into grid via useFrame lerp (no physics needed)
// - Subtle rotation per card (each gets unique random angle that lerps to 0 on dock)
// - PointLight at [0, 3, -58] with warm orange color (#ff6b35)
// libs: useFrame, MeshTransmissionMaterial, useTexture
```

---

## Part 9: Navbar Fix

**File:** `src/components/Navbar.tsx`

Replace anchor tags that use hash-based navigation:
```tsx
// BEFORE (broken):
<li><a href="#works">Works</a></li>
<li><a href="#about">About</a></li>
<li><a href="#process">Process</a></li>

// AFTER (working):
<li><button onClick={() => setActiveTab('works')} className="nav-link body-2">Works</button></li>
<li><button onClick={() => setActiveTab('about')} className="nav-link body-2">About</button></li>
<li><button onClick={() => setActiveTab('process')} className="nav-link body-2">Process</button></li>
```

The `setActiveTab` handler in `page.tsx` already writes `targetScrollRef.current = threshold * VIRTUAL_MAX` — this works correctly and just needs the UI wired to it.

---

## Part 10: Layer Stack (Final)

```
z: -100  Background WebGL starfield (THREE.js raw — page.tsx, deduplicated)
z: 0     R3F Canvas (Orchestrator):
           ├─ HomeTheme (wormhole tunnel shader — existing)
           ├─ HomeScene (particles)
           ├─ WorksScene (glass cards with textures)
           ├─ AboutScene (profile spotlight + stats)
           ├─ ProcessScene (nodes + flow particles)
           ├─ FooterScene (glass testimonial cards)
           ├─ CameraRig (Z travel + mouse tilt — existing)
           └─ ScenePostProcessing (Bloom, DoF, ChromaticAberration, Vignette)
z: 10    SectionPanel overlays (position:fixed, CSS proximity driven)
           ├─ HomeSection (GSAP char animation, no parallax)
           ├─ WorksSection (fan cards driven by useSectionProgress)
           ├─ AboutSection (layout driven by useSectionProgress)
           ├─ ProcessSection (SVG rotation auto-starts on proximity)
           └─ FooterSection (testimonial + contact)
z: 20    Navbar (button-based nav, no anchor hrefs)
z: 30    Cursor
```

---

## Implementation Priority Order

| # | Task | File(s) | Fixes |
|---|------|---------|-------|
| 1 | Create `scrollConstants.ts` | `src/lib/scrollConstants.ts` (new) | Drift prevention |
| 2 | Create `useSectionProgress` hook | `src/hooks/useSectionProgress.ts` (new) | Unblocks all sections |
| 3 | Fix Works.tsx — replace ScrollTrigger | `src/components/sections/Works.tsx` | Cards visible again |
| 4 | Fix About.tsx — replace ScrollTrigger | `src/components/sections/About.tsx` | About animates in |
| 5 | Fix Process.tsx — replace ScrollTrigger | `src/components/sections/Process.tsx` | SVG animation starts |
| 6 | Fix Navbar hrefs → setActiveTab buttons | `src/components/Navbar.tsx` | Nav works |
| 7 | Remove duplicate Background in Orchestrator | `src/components/themes/Orchestrator.tsx` | Fixes dual WebGL |
| 8 | Remove mouse parallax from Home.tsx | `src/components/sections/Home.tsx` | Fixes double parallax |
| 9 | Add magnetic snap to tick() | `src/app/page.tsx` | Premium pinning feel |
| 10 | Replace SectionPanels with CSS proximity overlays | `src/components/themes/SectionPanels.tsx` | GSAP works in sections |
| 11 | Add ScenePostProcessing to Orchestrator | `src/components/themes/ScenePostProcessing.tsx` (new) | Bloom + DoF + Vignette |
| 12 | Add HomeScene to Orchestrator Canvas | `src/components/themes/scenes/HomeScene.tsx` (new) | Home 3D particles |
| 13 | Add WorksScene to Orchestrator Canvas | `src/components/themes/scenes/WorksScene.tsx` (new) | Works 3D glass cards |
| 14 | Add AboutScene to Orchestrator Canvas | `src/components/themes/scenes/AboutScene.tsx` (new) | About spotlight |
| 15 | Add ProcessScene to Orchestrator Canvas | `src/components/themes/scenes/ProcessScene.tsx` (new) | Process flow nodes |
| 16 | Add FooterScene to Orchestrator Canvas | `src/components/themes/scenes/FooterScene.tsx` (new) | Footer glass cards |

---

## Key Constraints for Implementer

1. **Never use `ScrollTrigger` with a `trigger` element** — DOM scroll is locked. Only use `gsap.timeline({ paused: true })` driven by `tl.progress(localProgress)`.
2. **`virtual-scroll` CustomEvent** fires on `window` from `page.tsx` with `{ progress, scroll, velocity, direction }` — this is the scroll source of truth for all components.
3. **`scrollProgressRef`** (passed through Orchestrator) is the R3F source of truth — `CameraRig` reads it directly in `useFrame`.
4. **SectionPanel unmounts when `localProgress === 0`** — do not render section content when far away.
5. **`distanceFactor` in the old SectionPanels** was 2 — the new CSS `scale(0.3 + localProgress * 0.7)` replicates the same approaching-dot visual without R3F Html.
6. **Do not use `@react-spring/web`** — GSAP is the animation standard throughout. Remove the spring import from About.tsx.
7. **R3F scene companions are additive** — they render behind the HTML section overlays. They are ambient/atmospheric, not interactive.
8. **PostProcessing is inside the Canvas Suspense** — it must be a child of `<Canvas>` inside Orchestrator, not a DOM element.
