# Bug Fixes + Scene Quality Upgrades
**Date:** 2026-04-09  
**Taste settings:** DESIGN_VARIANCE: 8 | MOTION_INTENSITY: 6 | VISUAL_DENSITY: 4  
**Status:** Awaiting confirmation

---

## Phase 1 — Critical Bug Fixes (4 items)

### Fix 1: Home invisible on first load
**File:** `src/hooks/useSectionProgress.ts`  
**Problem:** `localProgress` initialises to `0`. No `virtual-scroll` event fires at boot (the tick only runs after the first wheel/touch input). Home `SectionPanel` receives `localProgress=0`, hits the early `return null`, and the home section is **never rendered** until the user scrolls.  
**Fix:** On mount, dispatch a synthetic initial check using the current `scrollProgressRef`. Since the hook can't directly access `scrollProgressRef`, the cleanest fix is to fire one fake `virtual-scroll` event from `page.tsx` immediately after `loaderComplete` becomes true — before the first real wheel input.

```ts
// page.tsx — after loaderComplete useEffect
useEffect(() => {
  if (!loaderComplete) return;
  // Warm up all SectionPanel progress values at progress=0
  window.dispatchEvent(new CustomEvent('virtual-scroll', {
    detail: { progress: 0, scroll: 0, velocity: 0, direction: 1 }
  }));
}, [loaderComplete]);
```

This gives Home `localProgress ≈ 1.0` (camera is AT dock 0) immediately.

---

### Fix 2: Navbar Home click sends NaN
**File:** `src/app/page.tsx` — `handleSetActiveTab`  
**Problem:** `SECTION_THRESHOLDS[idx - 1]` when `idx=0` → `SECTION_THRESHOLDS[-1]` → `undefined` → `undefined * VIRTUAL_MAX = NaN`. Camera teleports to undefined position.  
**Fix:**
```ts
const handleSetActiveTab = useCallback((tab: string) => {
  const idx = SECTION_IDS.indexOf(tab as any);
  if (idx === 0) {
    targetScrollRef.current = 0;
  } else {
    targetScrollRef.current = SECTION_THRESHOLDS[idx - 1] * VIRTUAL_MAX;
  }
  setActiveSection(tab);
}, []);
```

---

### Fix 3: Orchestrator has stale inline constants
**File:** `src/components/themes/Orchestrator.tsx` — lines 56–57  
**Problem:** `SECTION_THRESHOLDS` and `SECTION_IDS` are defined inline, duplicating `scrollConstants.ts`. If thresholds change, Orchestrator's section-name tracking silently diverges from the rest of the system.  
**Fix:** Delete the two inline `const` declarations and import from `@/lib/scrollConstants`.

---

### Fix 4: `ScenePostProcessing` is static
**File:** `src/components/themes/ScenePostProcessing.tsx`  
**Problem:** Bloom `intensity=1.0`, ChromaticAberration `offset=Vector2(0.001,0.001)`, and Vignette (if added) are hardcoded. No variation across the 5 sections. The wormhole at Home needs heavier bloom than the footer.  
**Fix:** Accept `currentSection` prop from Orchestrator and drive values per section:

| Section  | Bloom intensity | CA offset   | Noise opacity |
|----------|-----------------|-------------|---------------|
| home     | 1.8             | 0.0005      | 0.015         |
| works    | 0.9             | 0.001       | 0.02          |
| about    | 0.7             | 0.0008      | 0.02          |
| process  | 1.1             | 0.0015      | 0.025         |
| footer   | 0.5             | 0.003       | 0.03          |

Use `useMemo` to derive these from `currentSection` — no re-render cost. Pass `currentSection` down from Orchestrator into `<ScenePostProcessing currentSection={currentSection} />`.

---

## Phase 2 — Performance Hardening (2 items)

### Perf 1: Companion scenes render regardless of camera distance
**Files:** All 5 companion scenes  
**Problem:** Every scene has `useFrame` running and mesh vertices being uploaded to GPU whether the camera is 1 unit away or 60 units away. With 5 scenes active simultaneously, this is 5× the draw calls at all times.  
**Fix:** Each scene calls `useSectionProgress(index)` internally and gates its own render:

```tsx
export function WorksScene() {
  const localProgress = useSectionProgress(1);
  if (localProgress === 0) return null; // full cull when far
  // ...rest of scene
}
```
Scenes beyond `VISIBLE_RANGE=8` units drop to zero draw calls.

---

### Perf 2: FooterScene mutates particle positions in useFrame (CPU-side)
**File:** `src/components/themes/companion-scenes/FooterScene.tsx`  
**Problem:** The `useFrame` loop iterates 500 particles, writes to `Float32Array`, and sets `needsUpdate = true` every frame. This is a CPU→GPU upload every 16ms — expensive and blocks the main thread.  
**Fix:** Replace with a GPU-side GLSL shader approach. Use a `ShaderMaterial` uniform `uTime` to animate Y-position in the vertex shader — zero CPU cost:

```glsl
// vertex shader
uniform float uTime;
attribute float aOffset;
void main() {
  vec3 pos = position;
  pos.y = mod(position.y - uTime * 0.5 + aOffset, 10.0) - 5.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 3.0;
}
```

---

## Phase 3 — Scene Quality Upgrades (taste-skill informed)

Current scenes are functional stubs. With **DESIGN_VARIANCE: 8** and **MOTION_INTENSITY: 6**, each scene should feel like it belongs to the wormhole universe — not default geometry.

---

### Scene 1: HomeScene — Ambient Star Vortex
**Current:** 300 random static points rotating on Y.  
**Problem:** Generic "space particles" look. No relationship to the hero content. No entrance animation. Points just exist.  
**Upgrade (taste-skill: Kinetic, Asymmetric):**
- Double particle count to 600. Keep `PointMaterial` + additive blending.
- Split into two groups: an outer ring (radius ~8) slow-rotating clockwise, inner cluster (radius ~3) rotating counter-clockwise. Creates visual depth tension.
- `useFrame`: add a **breathing scale** — `group.scale.setScalar(1 + Math.sin(time * 0.4) * 0.04)`. Subtle pulse.
- Color: outer ring `#00d7ff` (cyan), inner cluster `#cc44ff` (desaturated violet — not neon purple). Two color temperatures = depth.
- On `localProgress < 1`: scale particles down, fade opacity. Particles "materialise" as camera docks.

---

### Scene 2: WorksScene — Refraction Orbs
**Current:** 2 distorted spheres with `MeshDistortMaterial`, hardcoded `#ff00e5` and `#00d7ff`.  
**Problem:** Saturated neon colors violate taste-skill (oversaturated accents). Only 2 orbs — thin presence. pointLight color `#ff00e5` is too harsh.  
**Upgrade (taste-skill: Materiality, Desaturated Accents):**
- 3 orbs instead of 2: positions `[-5, 2.5, -2]`, `[5, -1.5, -1]`, `[0, -3, -3]`. Asymmetric triangle formation — no center-bias.
- Colors: `#d946ef` (fuchsia-500, desaturated), `#22d3ee` (cyan-400), `#a78bfa` (violet-400). All Tailwind 400-500 range — not full neon.
- Wrap all 3 in separate `<Float>` with different speed/intensity — they drift independently.
- Change `pointLight` to warm `#f0e6ff` (near-white lavender) at intensity 1.2 — fills space without color clash.
- Gate: `if (localProgress === 0) return null`.

---

### Scene 3: AboutScene — Gyroscope Ring Stack
**Current:** Single thin torus ring with `emissiveIntensity={10}` — blown out bloom target.  
**Problem:** `emissiveIntensity=10` with the Bloom effect creates a harsh white flare. Single ring is sparse. Nothing relates to "About / identity / expertise".  
**Upgrade (taste-skill: Layered depth, controlled emissive):**
- 3 concentric torus rings, radii `4`, `2.8`, `1.6`. Each with different axial rotation: ring1 rotates on Z, ring2 on X, ring3 on Y. Classic gyroscope / orrery look.
- `emissiveIntensity: 1.5` max (not 10). Bloom handles the glow — the material doesn't need to.
- Colors: ring1 `#00d7ff` (cyan), ring2 `#ffffff` at 0.6 opacity, ring3 `#d946ef` (fuchsia).
- Ring thickness `args={[R, 0.015, 16, 120]}` — keep them gossamer-thin like the original.
- `useFrame`: rotation speeds `0.008`, `0.012`, `0.006` (different rates = organic feel, not mechanical sync).
- Entrance: on `localProgress → 1`, rings lerp from `scale=0` to `scale=1` via `useFrame`.

---

### Scene 4: ProcessScene — Flow Connectors
**Current:** 4 orbiting octahedrons on a circle path. Group slowly rotates Y.  
**Problem:** Orbiting geometry has no relationship to a "non-linear process" concept. `rectAreaLight` requires `RectAreaLightHelper` workaround in R3F — prone to WebGL warnings. Oversaturated `#ff00e5`.  
**Upgrade (taste-skill: Conceptual geometry, MOTION_INTENSITY 6):**
- Replace circle orbit with a **diamond formation**: 4 octahedrons at top `[0,4]`, right `[4,0]`, bottom `[0,-4]`, left `[-4,0]`.
- Connect them with 4 `TubeGeometry` lines (using `CatmullRomCurve3` for each pair). Tube radius `0.015` — thin wire connections.
- `useFrame`: each octahedron bobs on its own sin wave (different phase offset per node). No group rotation — nodes pulse in place.
- Colors: map to the 4 process step colors in `Process.tsx` — `turquoise`, `pink`, `blue`, `turquoise` = `#00d7ff`, `#d946ef`, `#60a5fa`, `#00d7ff`.
- Replace `rectAreaLight` with 2 `pointLight` at diagonals — standard, no warnings.

---

### Scene 5: FooterScene — GPU Particle Rain (replaces CPU loop)
**Current:** 500 particles with CPU-side `useFrame` mutation → expensive.  
**Already covered in Perf Fix 2 above.**  
**Additional taste-skill upgrade:**
- Reduce count to 300 (quality > quantity).
- Two particle layers: falling rain `opacity=0.3` (white/neutral) + slow drifting mist `opacity=0.1` (cyan, larger `size=0.08`). Depth parallax from two speeds.
- Color: `#e2e8f0` (slate-200, near-white) for rain + `#22d3ee` (cyan-400) for mist. Not full neon.
- Fade in on `localProgress` — particles invisible until camera approaches footer dock.

---

## Phase 4 — SectionPanel Entrance Polish (Optional Enhancement)

**Current:** `scale = 0.3 + localProgress * 0.7` — linear scale-in.  
**Taste-skill (MOTION_INTENSITY: 6 → fluid CSS, spring feel):**

Replace the linear CSS scale with a cubic-bezier eased transform. No new libraries — pure CSS custom property:

```ts
// In SectionPanel.tsx
const eased = cubicBezier(localProgress); // custom ease
// cubic approximation: ease = 1 - (1-t)^3  (ease-out cubic)
const scale = 0.3 + (1 - Math.pow(1 - localProgress, 3)) * 0.7;
```

Also add a **directional Y-translate** — sections approach from slightly below:
```ts
const translateY = (1 - localProgress) * 40; // 40px below → 0px at dock
// style: transform: `scale(${scale}) translateY(${translateY}px)`
```

This gives panels a "rising into frame" entrance instead of a flat zoom — consistent with the Z-approach concept of the camera.

---

## Implementation Order

| # | Fix | File(s) | Risk |
|---|-----|---------|------|
| 1 | Warmup event on loaderComplete | `page.tsx` | Low |
| 2 | handleSetActiveTab Home fix | `page.tsx` | Low |
| 3 | Remove inline constants in Orchestrator | `Orchestrator.tsx` | Low |
| 4 | ScenePostProcessing → accept currentSection | `ScenePostProcessing.tsx` | Low |
| 5 | Add proximity culling to all 5 scenes | All companion scenes | Low |
| 6 | FooterScene CPU→GPU shader rewrite | `FooterScene.tsx` | Medium |
| 7 | HomeScene — vortex upgrade | `HomeScene.tsx` | Low |
| 8 | WorksScene — desaturated orbs | `WorksScene.tsx` | Low |
| 9 | AboutScene — gyroscope rings | `AboutScene.tsx` | Low |
| 10 | ProcessScene — flow connectors | `ProcessScene.tsx` | Medium |
| 11 | SectionPanel — eased + Y-translate entrance | `SectionPanel.tsx` | Low |
