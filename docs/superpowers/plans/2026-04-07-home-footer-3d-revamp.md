# Home + Footer 3D Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Home neon text float in the wormhole tunnel using a CSS 3D Z-approach animation, and revamp the Footer to use a 3D-perspective testimonials grid that blends into the same spatial environment.

**Architecture:** `HomeOverlay` is a persistent fixed layer rendered directly in `page.tsx` — always visible once the loader exits, animating in from Z-depth on mount and animating out when scroll leaves the home band. `SectionOverlay` gets a footer-specific background class. `Footer.tsx` drops the GSAP carousel in favour of a static CSS 3D grid. All depth comes from CSS `perspective` + `transform-style: preserve-3d` — no new libraries.

**Tech Stack:** React 19, GSAP 3, CSS `perspective`/`preserve-3d`, Next.js 15, Lenis (already in project).

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `src/components/themes/HomeOverlay.tsx` | Persistent Home text layer; Z-approach + scroll-out animation |
| Modify | `src/app/page.tsx` | Import + render `HomeOverlay`; pass `activeSection` prop |
| Modify | `src/components/sections/Home.tsx` | Remove old ScrollTrigger scrub; add `perspective` CSS class |
| Modify | `src/components/themes/SectionOverlay.tsx` | Add footer background class |
| Modify | `src/components/sections/Footer.tsx` | Remove GSAP carousel; replace with 3D grid layout |
| Modify | `src/styles/styles.css` | Perspective wrappers, 3D card styles, footer overlay bg |

---

## Task 1 — CSS: add perspective + 3D card styles

Add all new CSS rules first so every subsequent task can reference real class names.

**Files:**
- Modify: `src/styles/styles.css`

- [ ] **Step 1: Append Home perspective rules**

At the end of `src/styles/styles.css`, add:

```css
/* ── Home 3D tunnel perspective ──────────────────────────── */
.cinematic-hero {
  perspective: 1200px;
  transform-style: preserve-3d;
  position: fixed;
  inset: 0;
  z-index: 11;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-block {
  transform-style: preserve-3d;
  will-change: transform, opacity;
  pointer-events: none;
  text-align: center;
}
```

- [ ] **Step 2: Append footer overlay background rule**

```css
/* ── Footer overlay tinted background ────────────────────── */
.section-overlay--footer {
  background: rgba(2, 2, 8, 0.55);
}
```

- [ ] **Step 3: Append testimonials 3D grid rules**

```css
/* ── Testimonials 3D grid ────────────────────────────────── */
.testimonials-3d-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  perspective: 1000px;
  transform-style: preserve-3d;
  padding: 2rem 0;
  width: 100%;
}

.testimonials-3d-grid .testimonial-card {
  transform-style: preserve-3d;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  will-change: transform;
}

.testimonials-3d-grid .testimonial-card:nth-child(odd) {
  transform: rotateX(4deg) rotateY(-3deg) translateZ(20px);
}

.testimonials-3d-grid .testimonial-card:nth-child(even) {
  transform: rotateX(-4deg) rotateY(3deg) translateZ(8px);
}

.testimonials-3d-grid .testimonial-card:hover {
  transform: rotateX(0deg) rotateY(0deg) translateZ(40px);
}

@media (max-width: 1024px) {
  .testimonials-3d-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .testimonials-3d-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Footer content 3D depth ─────────────────────────────── */
.footer-content {
  perspective: 800px;
}

.footer-title {
  transform: translateZ(10px);
  display: inline-block;
}
```

- [ ] **Step 4: Verify dev server starts without CSS errors**

```bash
npm run dev 2>&1 | head -15
```

Expected: `✓ Ready` with no CSS parse errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/styles.css
git commit -m "style: add home perspective, footer overlay bg, 3D testimonials grid CSS"
```

---

## Task 2 — Create `HomeOverlay` component

**Files:**
- Create: `src/components/themes/HomeOverlay.tsx`

This component renders `HomeSection` in a persistent fixed wrapper. On mount it fires a GSAP Z-approach animation. When `activeSection` changes away from `'home'` it animates the hero-block back into the tunnel.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import dynamic from 'next/dynamic';

const HomeSection = dynamic(() => import('../sections/Home'), { ssr: false });

interface HomeOverlayProps {
  activeSection: string;
}

export default function HomeOverlay({ activeSection }: HomeOverlayProps) {
  const hasAnimatedIn = useRef(false);

  // Z-approach on first mount
  useEffect(() => {
    if (hasAnimatedIn.current) return;
    hasAnimatedIn.current = true;

    const block = document.querySelector('.hero-block') as HTMLElement | null;
    if (!block) return;

    gsap.fromTo(
      block,
      { z: -600, scale: 1.8, opacity: 0 },
      { z: 0, scale: 1, opacity: 1, duration: 1.8, ease: 'power3.out', force3D: true }
    );
  }, []);

  // Animate out when leaving home, animate back when returning
  useEffect(() => {
    const block = document.querySelector('.hero-block') as HTMLElement | null;
    if (!block) return;

    if (activeSection !== 'home') {
      gsap.to(block, { z: -300, opacity: 0, duration: 0.6, ease: 'power2.in', force3D: true });
    } else {
      gsap.to(block, { z: 0, opacity: 1, duration: 0.6, ease: 'power2.out', force3D: true });
    }
  }, [activeSection]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 11,
        pointerEvents: 'none',
        perspective: '1200px',
      }}
    >
      <HomeSection />
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep HomeOverlay
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/HomeOverlay.tsx
git commit -m "feat(home-overlay): persistent 3D Z-approach home text layer"
```

---

## Task 3 — Update `Home.tsx`: remove old ScrollTrigger scrub

**Files:**
- Modify: `src/components/sections/Home.tsx`

The ScrollTrigger that scrubbed `scale` and `opacity` on scroll was designed for traditional page scroll and no longer applies. `HomeOverlay` handles scroll-out via GSAP now.

- [ ] **Step 1: Remove the ScrollTrigger `useEffect`**

In `src/components/sections/Home.tsx`, find and delete the entire `useEffect` block that contains `ScrollTrigger.create`. It looks like this (around lines 314–358 in the original):

```tsx
useEffect(() => {
  if (!blockRef.current || !sectionRef.current) return;

  const onMove = (e: MouseEvent) => {
    ...
    gsap.to(blockRef.current, { x: x * 40, y: y * 40, ... });
  };
  
  window.addEventListener('mousemove', onMove, { passive: true });

  const st = ScrollTrigger.create({
    trigger: sectionRef.current,
    start: 'top top',
    end: 'bottom+=500 top',
    scrub: true,
    onUpdate: (self) => {
      gsap.to(blockRef.current, {
        scale: 1 - p * 0.9,
        opacity: 1 - p * 0.8,
        ...
      });
    },
  });

  return () => {
    window.removeEventListener('mousemove', onMove);
    if (st) st.kill();
  };
}, []);
```

**Keep only the mouse parallax part.** Replace the entire block with:

```tsx
useEffect(() => {
  if (!blockRef.current) return;

  const onMove = (e: MouseEvent) => {
    if (isAnimatingRef.current) return;
    const { innerWidth: w, innerHeight: h } = window;
    const x = e.clientX / w - 0.5;
    const y = e.clientY / h - 0.5;
    gsap.to(blockRef.current, {
      x: x * 40,
      y: y * 40,
      duration: 0.6,
      ease: 'power3.out',
      force3D: true,
    });
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  return () => window.removeEventListener('mousemove', onMove);
}, []);
```

- [ ] **Step 2: Remove unused `sectionRef` if it's now only used by the deleted block**

Check if `sectionRef` is still referenced anywhere else in the file. If the only usage was the deleted ScrollTrigger block, remove:
- `const sectionRef = useRef<HTMLSelectElement>(null);`
- `ref={sectionRef as any}` from the `<section>` JSX

If it's still used elsewhere, leave it.

- [ ] **Step 3: Remove unused `ScrollTrigger` import if no longer needed**

Check if `ScrollTrigger` is still imported and used. If the `gsap.registerPlugin(ScrollTrigger)` call in the `useEffect` is the only usage, and no other ScrollTrigger API is called, remove:
```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger';
```
and
```tsx
gsap.registerPlugin(ScrollTrigger);
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "Home.tsx"
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Home.tsx
git commit -m "refactor(home): remove scroll scrub, keep mouse parallax only"
```

---

## Task 4 — Wire `HomeOverlay` into `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/app/page.tsx`, after the existing imports, add:

```tsx
import HomeOverlay from '../components/themes/HomeOverlay';
```

- [ ] **Step 2: Render `HomeOverlay` in the `loaderComplete` block**

Inside the `{loaderComplete && (...)}` block, after `<SectionOverlay activeSection={activeSection} />` and before `<Navbar ...>`, add:

```tsx
{/* ── Persistent Home text — always over wormhole ── */}
<HomeOverlay activeSection={activeSection} />
```

The full block order should be:
```tsx
{loaderComplete && (
  <div style={{ animation: 'fadeIn 1s ease-out' }}>
    {/* scroll proxy */}
    {/* Background */}
    {/* Orchestrator */}
    <SectionOverlay activeSection={activeSection} />
    <HomeOverlay activeSection={activeSection} />
    <Navbar ... />
    <Cursor />
  </div>
)}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "page.tsx"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(page): add persistent HomeOverlay with Z-approach tunnel animation"
```

---

## Task 5 — Update `SectionOverlay`: footer background class

**Files:**
- Modify: `src/components/themes/SectionOverlay.tsx`

- [ ] **Step 1: Add footer class to the overlay div**

Replace the current return:

```tsx
export default function SectionOverlay({ activeSection }: SectionOverlayProps) {
  const visible = activeSection !== 'home';

  return (
    <div className={`section-overlay${visible ? ' section-overlay--visible' : ''}`}>
```

With:

```tsx
export default function SectionOverlay({ activeSection }: SectionOverlayProps) {
  const visible = activeSection !== 'home';
  const footerClass = activeSection === 'footer' ? ' section-overlay--footer' : '';

  return (
    <div className={`section-overlay${visible ? ' section-overlay--visible' : ''}${footerClass}`}>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "SectionOverlay"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/SectionOverlay.tsx
git commit -m "feat(section-overlay): add footer tinted background class"
```

---

## Task 6 — Revamp `Footer.tsx`: 3D grid, no carousel

**Files:**
- Modify: `src/components/sections/Footer.tsx`

- [ ] **Step 1: Remove GSAP carousel imports and refs**

In `src/components/sections/Footer.tsx`:

Remove from the import line:
```tsx
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
```

Remove these refs:
```tsx
const testimonialsRef = useRef<HTMLDivElement>(null);
const sectionRef = useRef<HTMLElement>(null);
const scrollTweenRef = useRef<gsap.core.Tween | null>(null);
```

- [ ] **Step 2: Delete the GSAP carousel `useEffect`**

Delete the entire `useEffect` that contains the GSAP horizontal scroll tween — it starts with:
```tsx
useEffect(() => {
  if (!testimonialsRef.current || !sectionRef.current) return;

  const ctx = gsap.context(() => {
    const container = testimonialsRef.current?.querySelector('.testimonials-grid');
    ...
  });

  return () => ctx.revert();
}, []);
```

- [ ] **Step 3: Remove the time `useEffect` gsap.registerPlugin call**

In the remaining `useEffect` that sets local time, if it contains `gsap.registerPlugin(ScrollTrigger)`, remove just that line. Keep the `setInterval` for local time.

- [ ] **Step 4: Rewrite the JSX**

Replace the entire `return (...)` block with:

```tsx
  return (
    <section id="footer" className="footer-testimonials-section">
      <div className="testimonials-content">
        <h5 className="turquoise h5 neon section-sticky-label section-sticky-label--full" style={{ marginTop: '24px' }}>
          TESTIMONIALS
        </h5>
        <div className="testimonials-3d-grid">
          {testimonialsData.map((testimonial, index) => (
            <div key={`testimonial-${index}`} className="testimonial-card">
              <div className="testimonial-card-header">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={64}
                  height={64}
                  className="testimonial-img"
                />
                <div className="testimonial-card-content">
                  <p className="body-title-2">{testimonial.name}</p>
                </div>
              </div>
              <p className="body-1">{testimonial.role}</p>
              <p className="caption-text">{testimonial.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-content">
        <h6 className="blue h6 neon footer-title">Thanks for stopping by!</h6>

        <div className="footer-sections">
          <div className="footer-left">
            <p className="sub-header-3">Get in Touch</p>
            <p className="sub-header-3">Email: ramkumargd01@gmail.com</p>
            <p className="sub-header-3">Phone: +91-9176750625</p>
          </div>

          <div className="footer-right">
            <p className="body-2" style={{ marginBottom: '16px' }}>
              Feel free to fill out the reach out form, my response back time is 1-3 days
            </p>
            <button onClick={openContactForm} className="card-button body-2">
              Reach out form
              <span></span><span></span><span></span><span></span><span></span>
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-row">
            <p className="footnote">RamKumar © {new Date().getFullYear()} | Powered by ILAKH | All Rights Reserved</p>
            <p className="local-time footnote">Local Time: {localTime} GMT +5:30</p>
          </div>
        </div>
      </div>

      <Form isOpen={isFormOpen} onClose={closeContactForm} />
    </section>
  );
```

- [ ] **Step 5: Remove unused `testimonialsRef` and `sectionRef` from JSX attributes**

Verify the `<section>` tag no longer has `ref={sectionRef}` and the testimonials wrapper no longer has `ref={testimonialsRef}`.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "Footer.tsx"
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/Footer.tsx
git commit -m "feat(footer): replace GSAP carousel with CSS 3D perspective grid"
```

---

## Task 7 — Production build + smoke test

- [ ] **Step 1: Production build**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`. Route `○ /` listed as static.

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:

1. Loader shows progress ring with new copy ("Building your universe…" etc.)
2. After loader, "Ramkumar's World of Design / is ready for you" fades in then auto-dismisses
3. Wormhole appears — neon home text flies in from depth (Z-approach), assembles character by character simultaneously
4. Moving mouse tilts the text (parallax)
5. Scrolling past 18% causes home text to recede into the tunnel (Z-out + fade)
6. Scrolling to footer band (72%+): overlay has a slight dark tint, testimonials appear in 3D grid (not a carousel), cards have subtle tilt
7. Hovering a testimonial card lifts it forward
8. "Reach out form" button opens the contact form

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: home + footer 3D tunnel revamp — Z-approach text, 3D testimonials grid"
```
