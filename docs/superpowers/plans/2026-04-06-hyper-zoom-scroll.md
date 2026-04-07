# Hyper Zoom Scroll Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CodePen-ported DOM hack (HyperScrollExperience + HyperNav) with scroll-driven section reveals that use the existing wormhole shader and star background as the tunnel — section content fades in automatically as the camera flies through each band, no click required.

**Architecture:** Lenis scroll progress (0–1 over an 18 000 px proxy) is divided into 5 bands. `page.tsx` reads scroll progress from Lenis and sets `activeSection`; `SectionOverlay` fades in the matching section component. `Orchestrator` switches to progress-based section detection so the wormhole color palette stays in sync. `Background` accepts `currentSection` as a prop instead of scanning the DOM.

**Tech Stack:** Next.js 15, React 19, Lenis, GSAP ScrollTrigger, Three.js (existing), no new dependencies.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/components/themes/Orchestrator.tsx` | Progress-based section detection (remove DOM scan) |
| Modify | `src/components/themes/Background.tsx` | Accept `currentSection` prop, remove internal DOM detection |
| **Create** | `src/components/themes/SectionOverlay.tsx` | Fixed overlay, fades in active section content |
| Modify | `src/styles/styles.css` | Delete `.hn-*` + `.hse-*` blocks; add `.section-overlay` |
| Modify | `src/components/Navbar.tsx` | Remove `openHyperNav` prop + NAV button |
| Modify | `src/components/MobileBottomNav.tsx` | Remove Hyper button + `openHyperNav` prop; fix scroll-to |
| Modify | `src/app/page.tsx` | Wire scroll bands → `activeSection`, render `SectionOverlay` |
| Delete | `src/components/HyperScrollExperience.tsx` | — |
| Delete | `src/components/HyperNav.tsx` | — |
| Delete | `src/components/SectionTransition.tsx` | — |

---

## Task 1 — Fix Orchestrator: progress-based section detection

**Files:**
- Modify: `src/components/themes/Orchestrator.tsx`

The Orchestrator currently measures DOM element positions (`getBoundingClientRect`) to detect the current section. Those DOM elements no longer exist in the new architecture. Replace with progress-band detection using the Lenis `progress` field (0–1).

- [ ] **Step 1: Add the section-threshold constants and replace `updateSectionState`**

In `src/components/themes/Orchestrator.tsx`, delete the `sectionRefs` ref, the `measureSections` function and its `useEffect`, and the `updateSectionState` function. Replace them with:

```ts
// Place near the top of the component, after the state declarations
const SECTION_THRESHOLDS = [0.18, 0.36, 0.54, 0.72] as const;
const SECTION_IDS = ['home', 'works', 'about', 'process', 'footer'] as const;

const updateSectionFromProgress = (progress: number) => {
  let section: string = 'home';
  for (let i = 0; i < SECTION_THRESHOLDS.length; i++) {
    if (progress >= SECTION_THRESHOLDS[i]) section = SECTION_IDS[i + 1];
  }
  setCurrentSection(section);
};
```

- [ ] **Step 2: Update the Lenis scroll handler to use progress**

Find the `handleScroll` function inside the `useEffect` that depends on `lenis`. Replace the call to `updateSectionState(y)` with:

```ts
updateSectionFromProgress(e.progress || 0);
```

Remove the line `const y = typeof e.scroll === 'number' ? e.scroll : window.scrollY;` if it is only used for section detection.

- [ ] **Step 3: Update the fallback (no-Lenis) scroll handler**

Find the `calculateVelocity` RAF function inside the second scroll `useEffect` (the one that runs when `lenis` is falsy). Replace the call to `updateSectionState(currentScrollY)` with:

```ts
const maxScroll = (document.body.scrollHeight - window.innerHeight) || 1;
updateSectionFromProgress(currentScrollY / maxScroll);
```

- [ ] **Step 4: Pass `currentSection` to `Background`**

`Orchestrator` already renders `<Background onReady={handleBackgroundReady} />`. Add the `currentSection` prop:

```tsx
<Background onReady={handleBackgroundReady} currentSection={currentSection} />
```

Do this in **both** render paths — the mobile `div` branch and the desktop `Canvas` branch.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/ramkumar.ganesh/Desktop/Ramkumar_ux_Portfolio
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors related to `Orchestrator.tsx`. Ignore unrelated errors for now.

- [ ] **Step 6: Commit**

```bash
git add src/components/themes/Orchestrator.tsx
git commit -m "refactor(orchestrator): replace DOM section detection with scroll-progress bands"
```

---

## Task 2 — Update Background: accept `currentSection` prop

**Files:**
- Modify: `src/components/themes/Background.tsx`

Background currently maintains its own `currentSection` state and detects sections via `getBoundingClientRect`. Replace with a prop.

- [ ] **Step 1: Update the `BackgroundProps` interface**

```ts
interface BackgroundProps {
  onReady?: () => void;
  currentSection?: string;
}
```

- [ ] **Step 2: Accept the prop in the component signature**

```tsx
const Background = ({ onReady, currentSection: currentSectionProp }: BackgroundProps) => {
```

- [ ] **Step 3: Replace the internal `currentSection` state**

Delete:
```ts
const [currentSection, setCurrentSection] = useState('home');
```

Add:
```ts
const currentSection = currentSectionProp ?? 'home';
```

- [ ] **Step 4: Delete the scroll-based section-detection `useEffect`**

Remove the entire `useEffect` block that calls `window.addEventListener('scroll', handleScroll)` and uses `getBoundingClientRect` to detect the current section (approximately lines 75–121 in the original file). The star-shader scroll handler (which updates `uLayerCount` / `targetLayerCount`) is **separate** and must be kept — it reads `window.scrollY` for depth, not section detection.

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors from `Background.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/components/themes/Background.tsx
git commit -m "refactor(background): receive currentSection as prop, drop internal DOM detection"
```

---

## Task 3 — Create `SectionOverlay`

**Files:**
- Create: `src/components/themes/SectionOverlay.tsx`

This component renders the active section's content as a fixed full-screen overlay. `home` is intentionally invisible (the wormhole is the home experience).

- [ ] **Step 1: Create the file**

```tsx
"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const WorksSection   = dynamic(() => import('../sections/Works'),   { ssr: false });
const AboutSection   = dynamic(() => import('../sections/About'),   { ssr: false });
const ProcessSection = dynamic(() => import('../sections/Process'), { ssr: false });
const FooterSection  = dynamic(() => import('../sections/Footer'),  { ssr: false });

interface SectionOverlayProps {
  activeSection: string;
}

export default function SectionOverlay({ activeSection }: SectionOverlayProps) {
  const visible = activeSection !== 'home';

  return (
    <div className={`section-overlay${visible ? ' section-overlay--visible' : ''}`}>
      <Suspense fallback={null}>
        {activeSection === 'works'   && <WorksSection />}
        {activeSection === 'about'   && <AboutSection />}
        {activeSection === 'process' && <ProcessSection />}
        {activeSection === 'footer'  && <FooterSection />}
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors from `SectionOverlay.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/SectionOverlay.tsx
git commit -m "feat(section-overlay): scroll-driven section content reveal component"
```

---

## Task 4 — CSS: delete old blocks, add section-overlay styles

**Files:**
- Modify: `src/styles/styles.css`

- [ ] **Step 1: Delete the `.hn-*` CSS block**

Open `src/styles/styles.css`. Find the line that starts:
```css
.hn-overlay {
```
Select from that line all the way through the closing brace of `.hn-trigger-btn svg { }` (the last `.hn-*` rule). Delete the entire block (~330 lines).

> Tip: in your editor, search for `.hn-overlay {` to find the start, and `.hn-trigger-btn svg {` to find the end of the block.

- [ ] **Step 2: Delete the `.hse-*` CSS block**

In the same file, find the line:
```css
body.hse-active {
```
(or `.hse-viewport {` if `body.hse-active` is absent). Select from that line through the closing brace of the last `.hse-*` rule (`.hse-panel-close:hover {}`). Delete the entire block (~300 lines).

- [ ] **Step 3: Add `section-overlay` styles**

At the end of `src/styles/styles.css`, append:

```css
/* ── Section Overlay ──────────────────────────────────────── */
.section-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
  overflow-y: auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.55s ease;
  background: transparent;
}

.section-overlay--visible {
  opacity: 1;
  pointer-events: auto;
}
```

- [ ] **Step 4: Dev server smoke test**

```bash
npm run dev 2>&1 | head -20
```

Expected: starts without CSS parse errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/styles.css
git commit -m "style: remove hse-*/hn-* blocks, add section-overlay fade styles"
```

---

## Task 5 — Update Navbar: remove HyperNav button + prop

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Remove `openHyperNav` from the interface and destructuring**

In `src/components/Navbar.tsx`:

Delete from the interface:
```ts
openHyperNav?: () => void;
```

Change the component signature from:
```tsx
const Navbar: React.FC<NavbarProps> = ({ activeTab = 'home', setActiveTab = () => {}, openHyperNav = () => {} }) => {
```
To:
```tsx
const Navbar: React.FC<NavbarProps> = ({ activeTab = 'home', setActiveTab = () => {} }) => {
```

- [ ] **Step 2: Remove the NAV trigger button**

Delete the entire `<button className="hn-trigger-btn" ...>` block (approximately lines 247–257 in original):
```tsx
<button className="hn-trigger-btn" onClick={openHyperNav} aria-label="Open hyper navigation">
  <svg viewBox="0 0 16 16" ...>
    ...
  </svg>
  NAV
</button>
```

- [ ] **Step 3: Remove the `openHyperNav` pass-through to `MobileBottomNav`**

In the JSX where `MobileBottomNav` is rendered, remove the `openHyperNav={openHyperNav}` prop.

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "refactor(navbar): remove HyperNav trigger button and openHyperNav prop"
```

---

## Task 6 — Update MobileBottomNav: remove Hyper button, fix scroll

**Files:**
- Modify: `src/components/MobileBottomNav.tsx`

- [ ] **Step 1: Remove `openHyperNav` from the interface and destructuring**

Delete from the interface:
```ts
openHyperNav?: () => void;
```

Change the component signature from:
```tsx
const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, openContactForm, openHyperNav = () => {} }) => {
```
To:
```tsx
const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab, openContactForm }) => {
```

- [ ] **Step 2: Add scroll-position constants and fix `handleTabClick`**

Add the constant above the component:
```ts
const PROXY_HEIGHT = 18_000;
const SECTION_SCROLL: Record<string, number> = {
  home:    0,
  works:   PROXY_HEIGHT * 0.18,
  about:   PROXY_HEIGHT * 0.36,
  process: PROXY_HEIGHT * 0.54,
  contact: PROXY_HEIGHT * 0.72,
};
```

Replace the `handleTabClick` function:
```ts
const handleTabClick = (tab: string) => {
  setActiveTab(tab);
  window.scrollTo({ top: SECTION_SCROLL[tab] ?? 0, behavior: 'smooth' });
};
```

- [ ] **Step 3: Remove the Hyper button**

Delete the entire `<button className="nav-item hn-mobile-trigger" ...>` block:
```tsx
<button className="nav-item hn-mobile-trigger" onClick={openHyperNav} aria-label="Hyper navigation">
  <span className="nav-icon">
    <svg ...>...</svg>
  </span>
  <span className="nav-label">Hyper</span>
</button>
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 5: Commit**

```bash
git add src/components/MobileBottomNav.tsx
git commit -m "refactor(mobile-nav): remove HyperNav button, fix section scroll positions"
```

---

## Task 7 — Rewrite `page.tsx`: wire scroll bands + SectionOverlay

**Files:**
- Modify: `src/app/page.tsx`

This is the main wiring task. Replace the panel/HyperNav system with scroll-band section detection and `SectionOverlay`.

- [ ] **Step 1: Update imports**

Remove:
```ts
import HyperScrollExperience from '../components/HyperScrollExperience';
import HyperNav from '../components/HyperNav';
```

Add:
```ts
import SectionOverlay from '../components/themes/SectionOverlay';
```

Keep all section imports (`WorksSection`, `AboutSection`, etc.) — they are now used by `SectionOverlay`, but `page.tsx` no longer needs them directly. Remove them from `page.tsx`:
```ts
// Remove these — SectionOverlay handles them internally
// const WorksSection   = dynamic(...
// const AboutSection   = dynamic(...
// const ProcessSection = dynamic(...
// const FooterSection  = dynamic(...
// const HomeSection    = dynamic(...
```

- [ ] **Step 2: Replace panel/HyperNav state with `activeSection`**

Remove:
```ts
const [hyperNavOpen, setHyperNavOpen] = useState(false);
const [openPanel, setOpenPanel]       = useState<string | null>(null);
```

Keep `activeTab` but rename it to `activeSection` (or keep `activeTab` for Navbar highlight and add `activeSection` separately — use one state for both):

Replace:
```ts
const [activeTab, setActiveTab] = useState('home');
```
With:
```ts
const [activeSection, setActiveSection] = useState('home');
```

- [ ] **Step 3: Delete helper functions no longer needed**

Remove:
```ts
const SECTION_LABEL: Record<string, string> = { ... };
const renderPanelContent = () => { ... };
```

Remove the ESC key handler that called `setOpenPanel(null)`.

Remove the two `useEffect` blocks that called `lenis.stop()` / `lenis.start()` based on `openPanel`.

- [ ] **Step 4: Add scroll-band detection to the Lenis `useEffect`**

The Lenis `useEffect` (the one that creates `new Lenis(...)`) currently calls `lenis.on('scroll', ScrollTrigger.update)`. After that line, add:

```ts
const PROXY_HEIGHT = 18_000;
const THRESHOLDS   = [0.18, 0.36, 0.54, 0.72] as const;
const SECTION_IDS  = ['home', 'works', 'about', 'process', 'footer'] as const;

lenis.on('scroll', ({ scroll }: { scroll: number }) => {
  const progress = scroll / PROXY_HEIGHT;
  let section: string = 'home';
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (progress >= THRESHOLDS[i]) section = SECTION_IDS[i + 1];
  }
  setActiveSection(section);
});
```

- [ ] **Step 5: Add the scroll proxy `<div>`**

Immediately after the opening `<div style={{ animation: 'fadeIn 1s ease-out' }}>` (the one that wraps all the `loaderComplete` content), add:

```tsx
{/* Scroll proxy — gives the page its 18 000 px of scrollable height */}
<div
  aria-hidden="true"
  style={{
    position: 'absolute',
    top: 0, left: 0,
    width: '1px',
    height: '18000px',
    pointerEvents: 'none',
    zIndex: -1,
  }}
/>
```

- [ ] **Step 6: Replace HyperScrollExperience + panel JSX with SectionOverlay**

Remove the entire `<HyperScrollExperience ... />` JSX element.

Remove the entire `<HyperNav ... />` JSX element.

Remove the entire `<div className={`hse-panel...`}>` block and all its children.

Add after the `<Orchestrator ... />` element:
```tsx
<SectionOverlay activeSection={activeSection} />
```

- [ ] **Step 7: Update `<Navbar>` props**

Change:
```tsx
<Navbar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  openHyperNav={() => setHyperNavOpen(true)}
/>
```
To:
```tsx
<Navbar
  activeTab={activeSection}
  setActiveTab={setActiveSection}
/>
```

- [ ] **Step 8: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -60
```

Expected: zero errors. Fix any type errors before proceeding.

- [ ] **Step 9: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(page): scroll-band section detection + SectionOverlay, remove panel/HyperNav system"
```

---

## Task 8 — Delete old files

**Files:**
- Delete: `src/components/HyperScrollExperience.tsx`
- Delete: `src/components/HyperNav.tsx`
- Delete: `src/components/SectionTransition.tsx`

- [ ] **Step 1: Delete the three files**

```bash
rm src/components/HyperScrollExperience.tsx \
   src/components/HyperNav.tsx \
   src/components/SectionTransition.tsx
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors referencing the deleted files.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete HyperScrollExperience, HyperNav, SectionTransition (replaced by scroll-band overlay)"
```

---

## Task 9 — Production build verification

- [ ] **Step 1: Run the production build**

```bash
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully`. No errors, warnings about missing chunks or undefined imports are acceptable if they are pre-existing.

- [ ] **Step 2: Start production server and smoke test**

```bash
npm run start &
sleep 3
```

Open `http://localhost:3000` in a browser. Verify:
1. The wormhole background renders on load
2. Scrolling past ~18% scroll position causes Works content to fade in over the tunnel
3. Scrolling back to 0–18% causes Works to fade out (home = transparent overlay)
4. Mobile bottom nav tabs scroll to the correct positions
5. The NAV (HyperNav) button is gone from both desktop and mobile
6. No JavaScript console errors

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: hyper zoom scroll navigation — scroll-driven section reveals over wormhole tunnel"
```
