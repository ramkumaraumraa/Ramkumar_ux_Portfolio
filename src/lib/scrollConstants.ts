/**
 * Shared scroll and 3D positioning constants for the portfolio.
 * Centralizing these ensures sync between page.tsx (Virtual Scroll), 
 * R3F CameraRig (3D position), and SectionPanels (CSS Overlays).
 */

export const TOTAL_DEPTH = 60; // Max Z distance from home (0) to footer (-60)
export const VIRTUAL_MAX = 18000; // Total "depth" of the virtual scroll scale

export const SECTION_IDS = ['home', 'works', 'about', 'process', 'footer'] as const;

// Z-positions for each section dock
export const SECTION_Z_POSITIONS = [0, -15, -30, -45, -60] as const;

// Scroll progress (0 to 1) thresholds for each section
export const SECTION_THRESHOLDS = [0, 0.18, 0.36, 0.54, 0.72] as const;

// Proximity threshold for magnetic snapping effect
export const DOCK_THRESHOLD = 2.5;

// Range (in Z units) within which a section starts its transition
export const VISIBLE_RANGE = 8;
