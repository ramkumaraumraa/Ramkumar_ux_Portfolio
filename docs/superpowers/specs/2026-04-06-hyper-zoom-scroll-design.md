# Hyper Zoom Scroll Navigation — Design Spec
Date: 2026-04-06

## Goal
Replace the CodePen-ported DOM hack (`HyperScrollExperience`, `HyperNav`) with a scroll-driven section reveal system that uses the existing wormhole shader and star background as the tunnel experience. Section content reveals automatically on scroll — no click required.

---

## What Gets Deleted
- `src/components/HyperScrollExperience.tsx`
- `src/components/HyperNav.tsx`
- `src/components/SectionTransition.tsx`
- All `hse-*` CSS rules in `src/styles/styles.css`
- All `hn-*` CSS rules in `src/styles/styles.css`

---

## Architecture

### Layer stack (bottom to top)
1. `Background.tsx` — vanilla Three.js star shader (z-index: -100) + CSS comets + lemniscates
2. `Orchestrator` R3F canvas — `Home_theme` wormhole spiral shader, color shifts per section
3. Fixed section content overlay — fades in/out based on scroll band, no click needed
4. `Navbar` — unchanged

### Scroll proxy
A single `<div aria-hidden="true">` with `height: 18000px`, `position: absolute`, `width: 1px`, `pointer-events: none`, `z-index: -1` placed directly in `page.tsx`. This gives the page its scrollable height without any component wrapper.

---

## Section Bands
Total scroll range divided into 5 equal bands driven by Lenis `scroll` / `PROXY_HEIGHT`:

| Band (scroll %) | Section  | Accent    |
|-----------------|----------|-----------|
| 0 – 18%         | home     | #00f3ff   |
| 18 – 36%        | works    | #ff003c   |
| 36 – 54%        | about    | #ccff00   |
| 54 – 72%        | process  | #ff6600   |
| 72 – 100%       | footer   | #00f3ff   |

`activeSection` state in `page.tsx` is set by comparing `scrollY / PROXY_HEIGHT` against these thresholds.

---

## `page.tsx` Changes

### State removed
- `openPanel` — deleted entirely
- `hyperNavOpen` — deleted entirely

### State kept / added
- `activeSection: string` (replaces `activeTab`, same purpose)
- `loaderComplete`, `backgroundReady`, `preparingExit`, `responsive` — unchanged
- `lenisRef` — unchanged

### Lenis scroll handler (new)
```
lenis.on('scroll', ({ scroll }) => {
  const progress = scroll / PROXY_HEIGHT;
  const thresholds = [0, 0.18, 0.36, 0.54, 0.72];
  const ids = ['home', 'works', 'about', 'process', 'footer'];
  let section = 'footer';
  for (let i = 0; i < thresholds.length; i++) {
    if (progress < thresholds[i + 1] ?? 1) { section = ids[i]; break; }
  }
  setActiveSection(section);
});
```

### JSX removed
- `<HyperScrollExperience>` and its import
- `<HyperNav>` and its import
- `<div className="hse-panel ...">` block and all children
- `renderPanelContent()` function
- `SECTION_LABEL` map
- `Navbar` props `openHyperNav` and related handler

### JSX added
- Scroll proxy `<div>` (one line, see above)
- `<SectionOverlay activeSection={activeSection}>` inline in the return — a fixed full-screen div that renders the matching section component with CSS opacity/transform fade

### `Navbar` interface simplified
- Remove `openHyperNav` prop from `Navbar` and `MobileBottomNav` — HyperNav is gone

---

## `SectionOverlay` (`src/components/themes/SectionOverlay.tsx`)

```tsx
function SectionOverlay({ activeSection }: { activeSection: string }) {
  return (
    <div className={`section-overlay section-overlay--${activeSection}`}>
      <Suspense fallback={null}>
        {activeSection === 'home'    && <HomeSection />}
        {activeSection === 'works'   && <WorksSection />}
        {activeSection === 'about'   && <AboutSection />}
        {activeSection === 'process' && <ProcessSection />}
        {activeSection === 'footer'  && <FooterSection />}
      </Suspense>
    </div>
  );
}
```

CSS:
```css
.section-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  overflow-y: auto;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  pointer-events: none;
}
.section-overlay--works,
.section-overlay--about,
.section-overlay--process,
.section-overlay--footer {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
/* Home content is always behind — the wormhole IS the home section */
.section-overlay--home {
  opacity: 0;
  pointer-events: none;
}
```

---

## `Background.tsx` Changes

Remove the internal scroll listener that calls `getBoundingClientRect` to detect current section. Instead accept `currentSection: string` as a prop and use it directly to set `visibleComets`. The `handleScroll` effect for section detection is deleted; `currentSection` state becomes a prop.

### Updated interface
```ts
interface BackgroundProps {
  onReady?: () => void;
  currentSection?: string;
}
```

The star shader scroll handler (for `uLayerCount`) stays — it reads `window.scrollY` for depth effect, which is unrelated to section detection.

---

## `Orchestrator` / `Home_theme`
No changes. Already receives `lenis` and derives scroll progress internally. Wormhole colors already shift per section index. `currentSection` already flows through via `Orchestrator` props if wired — verify prop chain during implementation.

---

## CSS Cleanup
In `src/styles/styles.css`:
- Delete all rules prefixed `.hse-` (~80 lines)
- Delete all rules prefixed `.hn-` (~60 lines)
- Add `.section-overlay` rules (above)

---

## Files Modified
| File | Change |
|------|--------|
| `src/app/page.tsx` | Remove HyperScrollExperience/HyperNav/panel system, add scroll band detection + import SectionOverlay |
| `src/components/themes/Background.tsx` | Accept `currentSection` prop, remove DOM section detection |
| `src/components/Navbar.tsx` | Remove `openHyperNav` prop |
| `src/components/MobileBottomNav.tsx` | Remove `openHyperNav` prop |
| `src/styles/styles.css` | Delete hse-*/hn-* rules, add section-overlay rules |

## Files Created
| File | Purpose |
|------|---------|
| `src/components/themes/SectionOverlay.tsx` | Scroll-driven section content reveal component |

## Files Deleted
| File |
|------|
| `src/components/HyperScrollExperience.tsx` |
| `src/components/HyperNav.tsx` |
| `src/components/SectionTransition.tsx` |
