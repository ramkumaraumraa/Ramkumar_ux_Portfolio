# Implementation Plan: Layout Zone Segregation

**Spec:** `docs/superpowers/specs/2026-04-10-layout-zone-segregation-design.md`  
**Date:** 2026-04-10  
**Estimated diff:** ~10 lines across 3 files

---

## Context for each phase

This plan enforces three non-overlapping layout zones using two CSS custom property tokens (`--zone-header`, `--zone-dock`) as single source of truth. No visual changes — purely structural boundary enforcement.

Current problem: `cinematic-hero` is `inset: 0` (ignores chrome/dock), `section-overlay` uses hardcoded padding that mismatches actual zone sizes, and mobile has no separate token override.

---

## Phase 1 — Define layout zone tokens in `globals.css`

**File:** `src/app/globals.css`

**Task:** Add two new tokens to the existing `:root` block and a mobile override block. Then update the existing `--section-shell-top-pad` and `--section-shell-bottom-pad` to derive from the new tokens.

**Exact changes:**

In `:root` (already exists, around line 29):
```css
--zone-header: 72px;
--zone-dock:   96px;
--section-shell-top-pad:    var(--zone-header);
--section-shell-bottom-pad: var(--zone-dock);
```

Add a new mobile override block (after the existing `:root` block):
```css
@media (max-width: 767px) {
  :root {
    --zone-header: 48px;
    --zone-dock:   96px;
  }
}
```

**Verification:**
- Grep for `--section-shell-top-pad` — should resolve to `var(--zone-header)`, not a raw pixel value
- Grep for `--zone-header` — should appear in `:root` and in `@media (max-width: 767px)`

**Anti-patterns:**
- Do NOT remove `--section-shell-top-pad` / `--section-shell-bottom-pad` — they are referenced in `styles.css:2405-2406` and may be referenced elsewhere
- Do NOT add duplicate `@media` blocks if one already exists for `:root` at 767px — check first

---

## Phase 2 — Fix `section-overlay` padding and `cinematic-hero` inset in `styles.css`

**File:** `src/styles/styles.css`

**Task 1 — `.section-overlay` (around line 2396):**

The padding values are hardcoded. Since `--section-shell-top-pad` and `--section-shell-bottom-pad` are now aliases for the zone tokens (fixed in Phase 1), no change needed here IF they already use the CSS variables. Verify:

```css
/* Should already read: */
padding-top: var(--section-shell-top-pad);
padding-bottom: var(--section-shell-bottom-pad);
```

If they are still hardcoded pixel values, update them to use the variables.

**Task 2 — `.cinematic-hero` (around line 2416):**

Change `inset` from full-screen to zone-aware:

```css
/* Before */
inset: 0;

/* After */
inset: var(--zone-header) 0 var(--zone-dock);
```

This keeps the hero horizontally full-width but vertically constrained to the safe zone between header and dock.

**Verification:**
- Grep `cinematic-hero` — `inset` should NOT be `0` or `inset: 0`
- Visually confirm home neon text is not hidden behind SectionChrome or dock at any viewport width
- Check mobile (≤767px): hero text should be within the 48px top / 96px bottom safe zone

**Anti-patterns:**
- Do NOT change any other properties on `.cinematic-hero` (perspective, transform-style, z-index, display, align-items, justify-content)
- Do NOT add padding to `.cinematic-hero` — `inset` is the correct mechanism for fixed elements

---

## Phase 3 — Remove dead import in `page.tsx`

**File:** `src/app/page.tsx`

**Task:** Remove the unused `SectionPanel` import on line 12:

```tsx
// Remove this line:
import { SectionPanel } from '../components/themes/SectionPanel';
```

`SectionPanel` is imported but never appears in the JSX render tree of this file.

**Verification:**
- Grep `SectionPanel` in `page.tsx` — should return zero results
- Confirm `SectionPanel` still exists in `src/components/themes/SectionPanel.tsx` (do not delete the component itself — it may be used elsewhere or needed in future)

**Anti-patterns:**
- Do NOT delete `SectionPanel.tsx` — only remove the import in `page.tsx`

---

## Phase 4 — Final verification

1. **Token propagation check:**
   - Grep `--section-shell-top-pad` and `--section-shell-bottom-pad` across all CSS files — both should resolve via `var(--zone-header)` / `var(--zone-dock)`, not raw pixels

2. **Zone boundary check:**
   - Grep `cinematic-hero` — `inset` must not be `0` or `inset: 0`
   - Grep `section-overlay` — padding values must use CSS variables, not hardcoded px

3. **Dead code check:**
   - Grep `SectionPanel` in `page.tsx` — must return zero results

4. **No visual regression:**
   - Start dev server (`npm run dev`)
   - Check Home section: neon text should not overlap SectionChrome top bar or dock
   - Check Works/About/Process/Footer: section content should have breathing room from top chrome and bottom dock
   - Check mobile viewport (375px wide): header 48px zone, dock 96px zone both clear
