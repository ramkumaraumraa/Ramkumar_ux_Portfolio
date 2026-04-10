# Process Section — Orbital Arc Revamp

**Date:** 2026-04-10  
**Status:** Approved  
**Scope:** `Process.tsx`, `ProcessScene.tsx`, `styles.css` (process block)

---

## Context

The Process section was built for a vertical-scroll navigation paradigm. The site now uses a 3D spline camera system where the camera flies to `SPLINE_POINTS[3]` = `[6, 1, -45]` — banking rightward on approach. The old 4-column grid with cycling SVGs has no relationship to the camera movement and contains the same GSAP flicker bug fixed in About (context rebuilt every scroll tick).

This spec revamps the section into an Orbital Arc layout with auto-play step cycling, 3-layer internal parallax during approach, and live sync between the HTML cards and the 3D ProcessScene octahedron nodes.

---

## 1. Layout — Orbital Arc

Cards are rendered `position: absolute` inside a `position: relative; overflow: visible` container. At any moment, 4–5 positions are occupied:

```
[far-left]   [near-left]   [CENTER (active)]   [near-right]   [far-right]
 scale:0.50   scale:0.72       scale:1.0          scale:0.72     scale:0.50
 opacity:0.2  opacity:0.55     opacity:1.0        opacity:0.55   opacity:0.2
 x: -520px   x: -260px         x: 0              x: +260px      x: +520px
```

With 4 cards the positions wrap — when card 1 is active, card 4 sits at far-left and card 2 at near-right.

**Active card only:** description text is fully visible, card height is unrestricted.  
**Side cards:** description collapses (`opacity:0`, `max-height:0`, GSAP-animated). Only step number + title show. This height difference reinforces focus.

Each card keeps its own fixed SVG (card 1 → `1.svg`, card 2 → `2.svg`, etc.). The old 4-SVGs-rotating-through-every-card logic is removed.

---

## 2. Internal Parallax (during camera approach)

During `localProgress` 0 → 1 (camera flying toward Process), each card has 3 internal layers moving at different rates driven by the scrubbed entrance timeline:

| Layer | Parallax rate | Effect |
|---|---|---|
| `.process-svg-wrap` | 0.7× | Illustration appears deeper, recedes |
| `.process-card-title` + `.process-card-subtitle` | 1.0× | Baseline |
| `.process-card-description` | 1.3× | Comes forward toward viewer |

---

## 3. Animation Timelines

Two completely separate GSAP timelines. `localProgress` is never in a `useEffect` dependency array — it is applied imperatively to avoid context rebuild flicker.

### Timeline 1 — Entrance (scroll-scrubbed)

Created once on mount (dep: `[]`). `tlRef.current.progress(localProgress)` called in a separate `useEffect([localProgress])`.

```
localProgress 0.0  →  all cards: opacity:0, scale:0.4, y:80px, filter:blur(12px)
localProgress 0.7  →  cards settle into arc positions, blur clears
localProgress 1.0  →  arc fully formed
```

Stagger: `0.08s` per card, left-far enters first, center enters last (wing-opening feel).  
Easing: `power3.out`.

### Timeline 2 — Auto-play (repeating)

Starts when `localProgress >= 0.92`. Pauses when `localProgress < 0.5`.

```
3.5s hold  →  0.7s transition  →  3.5s hold  →  0.7s transition  →  ... (repeats)
```

Each transition runs 5 simultaneous tweens:

1. **Center → near-left**: `x 0→-260px`, `scale 1.0→0.72`, `opacity 1.0→0.55`, description collapses
2. **Near-right → center**: `x +260→0`, `scale 0.72→1.0`, `opacity 0.55→1.0`, description expands
3. **Far-right → near-right**: `x +520→+260px`, `scale 0.50→0.72`
4. **Near-left → far-left** (or exit): `x -260→-520px`, `scale 0.72→0.50`, `opacity 0.55→0.2`
5. **New card entering far-right**: fades in from `opacity:0, scale:0.4, x:+620px`

Easing: `power3.inOut` for position/scale, `power2.out` for opacity.

Each transition dispatches `process-active-card` window event with `{ index: 0..3 }`.

### Step Indicator

4 dot pills at bottom of section. Active pill morphs to a capsule (GSAP `width` tween) in the card's accent colour. Inactive dots are small circles at `opacity:0.35`.

---

## 4. 3D ProcessScene Sync

Node-to-card mapping:

| Node | Position | Colour | Card |
|---|---|---|---|
| 0 | top | `#00d7ff` cyan | 1 — Strategizing |
| 1 | right | `#d946ef` pink | 2 — Discovery |
| 2 | bottom | `#60a5fa` blue | 3 — Creation |
| 3 | left | `#00d7ff` cyan | 4 — Optimizing |

**Sync mechanism** — window custom event bridges HTML and R3F:

```ts
// Process.tsx fires on each card transition:
window.dispatchEvent(new CustomEvent('process-active-card', { detail: { index: 0..3 } }))

// ProcessScene.tsx listens:
const activeNodeRef = useRef(0)
useEffect(() => {
  const handler = (e: Event) => { activeNodeRef.current = (e as CustomEvent).detail.index }
  window.addEventListener('process-active-card', handler)
  return () => window.removeEventListener('process-active-card', handler)
}, [])
```

**In `useFrame`:**

```ts
// Active node: high intensity + sin pulse
// Inactive nodes: dim
nodeRefs.forEach((ref, i) => {
  if (!ref.current) return
  const isActive = i === activeNodeRef.current
  const targetIntensity = isActive ? 3.5 : 0.6
  ref.current.material.emissiveIntensity +=
    (targetIntensity - ref.current.material.emissiveIntensity) * 0.06
  
  // Pulse beat on active node only
  if (isActive) {
    const beat = 1 + Math.sin(state.clock.elapsedTime * 1.5 * Math.PI * 2) * 0.12
    ref.current.scale.setScalar(ref.current.scale.x + (beat - ref.current.scale.x) * 0.1)
  }
})

// Wire connectors adjacent to active node brighten
tubes.forEach((_, i) => {
  const isAdjacent = i === activeNodeRef.current || (i + 1) % 4 === activeNodeRef.current
  const targetOpacity = isAdjacent ? 0.9 : 0.5 * localProgress
  // lerp tube material opacity
})
```

**Entrance fix** (same pattern as AboutScene):
- Remove `if (localProgress === 0) return null`
- Set `scale={0}` on all mesh JSX nodes
- `useFrame` lerp brings them in cleanly from 0

---

## 5. CSS Changes

**Add:**
- `.process-arc-container` — `position:relative; overflow:visible; display:flex; align-items:center; justify-content:center`
- `.process-arc-card` — `position:absolute; will-change:transform,opacity; border-radius:16px`
- `.process-step-indicators` — flex row, centered, gap 8px, margin-top 24px
- `.process-step-dot` — `width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.2)`
- `.process-step-dot--active` — `height:8px; border-radius:20px; background: var(--accent-color)`
- `.process-card-description-wrap` — `overflow:hidden` (enables GSAP height collapse)

**Remove:**
- `.process-grid` (grid layout gone)
- `.process-container` max-width constraints

**Keep unchanged:**
- `.process-card` interior (border, backdrop-blur, gradient stroke, padding)
- `.process-svg-wrap` (height, border-radius, overflow)
- `.process-card-content` flex column
- All responsive breakpoints (simplified — arc becomes single-card stacked on mobile)

---

## 6. Mobile Behaviour

On `max-width: 768px`: arc collapses to a single-card centered view. Only the active card is visible (no side cards). Step indicator dots remain. Auto-play timing unchanged.

---

## 7. Files Changed

| File | Change type |
|---|---|
| `src/components/sections/Process.tsx` | Full rewrite |
| `src/components/themes/companion-scenes/ProcessScene.tsx` | Targeted changes |
| `src/styles/styles.css` (process block only) | Add arc classes, remove grid |

No new npm dependencies. Pure GSAP + existing R3F.
