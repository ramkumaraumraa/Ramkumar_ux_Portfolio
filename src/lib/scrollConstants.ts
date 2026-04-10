/**
 * Shared scroll and 3D positioning constants for the portfolio.
 * Centralizing these ensures sync between page.tsx (Virtual Scroll), 
 * R3F CameraRig (3D position), and SectionPanels (CSS Overlays).
 */

export const TOTAL_DEPTH = 60; // Max Z distance from home (0) to footer (-60)
export const VIRTUAL_MAX = 18000; // Total "depth" of the virtual scroll scale

export const SECTION_IDS = ['home', 'works', 'about', 'process', 'footer'] as const;

// Legacy Z-positions (keeping for fallback references, though we'll use Spline going forward)
export const SECTION_Z_POSITIONS = [0, -15, -30, -45, -60] as const;

// Spline tracking points mapping to each section exactly (0, 0.25, 0.5, 0.75, 1.0)
// Curve shape: River winding right, then deeply left, then right again
export const SPLINE_POINTS: [number, number, number][] = [
  [0, 0, 0],         // Home
  [12, -2, -15],     // Works (curve right, dip down)
  [-8, -5, -30],     // About (curve sharp left, deeper down)
  [6, 1, -45],       // Process (curve back right, rise slightly)
  [0, 0, -60]        // Footer (return to center)
];

// Scroll progress (0 to 1) transition thresholds between sections (home→works, works→about, …)
export const SECTION_THRESHOLDS = [0.18, 0.36, 0.54, 0.72] as const;

// Exact dock progress values for direct navigation (matches SECTION_Z_POSITIONS / TOTAL_DEPTH).
// Footer uses 0.9999 instead of 1.0 to avoid wrap-around to home in the circular scroll.
export const SECTION_DOCK_PROGRESS = [0, 0.25, 0.5, 0.75, 0.9999] as const;

// Proximity threshold for magnetic snapping effect
export const DOCK_THRESHOLD = 2.5;

// Range (in Z units) within which a section starts its transition
export const VISIBLE_RANGE = 8;
