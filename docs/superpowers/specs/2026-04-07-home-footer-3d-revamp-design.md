# Home + Footer 3D Revamp — Design Spec
Date: 2026-04-07

## Goal
Make Home text and Footer content feel spatially embedded in the wormhole tunnel using CSS 3D perspective — not flat overlays. The user should feel like they are travelling through Ramkumar's 3D world, with content floating in the same space as the wormhole shader.

## Approach
CSS `perspective` + `transform-style: preserve-3d` on section wrappers. No new dependencies. Wormhole bleeds through transparent backgrounds. Existing GSAP neon animations preserved exactly.

---

## Loader
Already done in a prior task:
- Progress labels updated to "Building your universe…" / "Loading the world of design…" / "Almost there…" / "Stepping in"
- Welcome copy: "Ramkumar's World of Design / is ready for you"
- Enter button removed — auto-dismisses after welcome animation

---

## Home Section

### Placement
`<HomeOverlay>` is extracted from `SectionOverlay` and rendered as a **persistent fixed layer** directly in `page.tsx`, always visible once the loader exits. It is NOT gated behind the `activeSection === 'home'` check. This means the neon text is visible immediately on load and fades out naturally as the user scrolls past the 18% band.

### Mount animation (Z-approach)
On mount, the `hero-block` starts at:
```css
transform: translateZ(-600px) scale(1.8);
opacity: 0;
```
GSAP animates it to:
```css
transform: translateZ(0px) scale(1);
opacity: 1;
```
Duration: 1.8s, ease: `power3.out`. This fires after `loaderComplete` becomes true.

The `section.home` wrapper gets:
```css
perspective: 1200px;
transform-style: preserve-3d;
```

### Existing animations preserved
- Per-character blur-in stagger: unchanged, plays simultaneously with Z-approach
- Text cycling (7s interval): unchanged
- Mouse parallax (`x: x * 40, y: y * 40`): unchanged

### Scroll-out (leaving home band)
`page.tsx` scroll listener: when `scroll / PROXY_HEIGHT` crosses 0.18, GSAP animates `hero-block` to `translateZ(-300px) opacity(0)` over 0.6s. When returning below 0.18, animates back to `translateZ(0) opacity(1)`.

This replaces the old ScrollTrigger inside `Home.tsx` that scaled/faded on scroll (that was designed for a traditional scroll layout and no longer applies).

### What to remove from Home.tsx
- The `ScrollTrigger.create` block that scrubs `scale` and `opacity` on scroll (lines ~335–358 in original). The scroll-out is now handled in `page.tsx` via Lenis.

---

## Footer Section

### Background
`section-overlay` for footer band gets `background: rgba(2, 2, 8, 0.55)` — enough for readability, lets the wormhole show through.

### Testimonials — carousel removed
GSAP horizontal scroll tween removed. Replace with a **CSS grid**:
- Desktop: 3 columns
- Tablet (≤1024px): 2 columns  
- Mobile (≤768px): 1 column

Container:
```css
.testimonials-3d-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  perspective: 1000px;
  transform-style: preserve-3d;
}
```

### Card 3D tilt
Static CSS transforms applied per nth-child — no JS needed:
```css
/* Odd cards tilt one way */
.testimonial-card:nth-child(odd) {
  transform: rotateX(4deg) rotateY(-3deg) translateZ(20px);
}
/* Even cards tilt the other way */
.testimonial-card:nth-child(even) {
  transform: rotateX(-4deg) rotateY(3deg) translateZ(8px);
}
/* Hover: lift forward */
.testimonial-card:hover {
  transform: rotateX(0deg) rotateY(0deg) translateZ(40px);
  transition: transform 0.35s ease;
}
```

Cards keep their existing content (avatar, name, role, description). No content changes.

### Contact section
Keep same content, simplified layout:
- Remove emoji `👋` from heading
- Single `footer-contact` div: left = name/email/phone, right = "Reach out" button
- `perspective: 800px` on the footer-content wrapper, `translateZ(10px)` on the heading — very subtle, just enough to feel grounded in the same space

### Footer bottom bar
Unchanged — copyright + local time.

---

## page.tsx Changes

### HomeOverlay (new persistent layer)
```tsx
{loaderComplete && (
  <>
    {/* ... wormhole ... */}
    <HomeOverlay loaderComplete={loaderComplete} activeSection={activeSection} />
    <SectionOverlay activeSection={activeSection} />
    {/* ... navbar ... */}
  </>
)}
```

`HomeOverlay` is a small inline component (or in `themes/`) that:
- Renders `<HomeSection />` in a fixed full-screen wrapper
- On `loaderComplete`, fires GSAP Z-approach animation on `.hero-block`
- Listens to `activeSection` prop: when it changes away from `'home'`, animates hero-block to `translateZ(-300px) opacity(0)`; when it returns to `'home'`, animates back

### SectionOverlay
Home is already excluded from SectionOverlay (renders nothing for `'home'`). No change needed.

---

## CSS Changes (`src/styles/styles.css`)

### Home
```css
.cinematic-hero {
  perspective: 1200px;
  transform-style: preserve-3d;
}

.hero-block {
  transform-style: preserve-3d;
  will-change: transform, opacity;
}
```

### Footer overlay background
```css
.section-overlay--visible.footer-active {
  background: rgba(2, 2, 8, 0.55);
}
```
OR simpler: add to `SectionOverlay` component — when `activeSection === 'footer'`, add a class that sets the background.

### Testimonials grid
```css
.testimonials-3d-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  perspective: 1000px;
  transform-style: preserve-3d;
  padding: 2rem 0;
}

.testimonial-card {
  transform-style: preserve-3d;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  will-change: transform;
}

.testimonial-card:nth-child(odd) {
  transform: rotateX(4deg) rotateY(-3deg) translateZ(20px);
}

.testimonial-card:nth-child(even) {
  transform: rotateX(-4deg) rotateY(3deg) translateZ(8px);
}

.testimonial-card:hover {
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
```

---

## Files Modified
| File | Change |
|------|--------|
| `src/app/page.tsx` | Add `HomeOverlay` persistent layer with Z-approach + scroll-out logic |
| `src/components/sections/Home.tsx` | Remove ScrollTrigger scrub; add perspective CSS; Z-approach fires from page.tsx |
| `src/components/sections/Footer.tsx` | Remove GSAP carousel; replace with 3D grid; update footer-content structure |
| `src/components/themes/SectionOverlay.tsx` | Pass `activeSection` class for footer background |
| `src/styles/styles.css` | Add perspective rules, 3D card styles, footer overlay background |

## Files Created
| File | Purpose |
|------|---------|
| `src/components/themes/HomeOverlay.tsx` | Persistent Home text layer with Z-approach animation |
