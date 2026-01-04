import type { RenderContext } from '../types.js';
export type MesmericMode = 'IDLE' | 'SCAN' | 'BUILD' | 'CRUNCH' | 'SUCCESS' | 'SLEEP' | 'PRESSURE';
/**
 * Render the full mesmeric visualization
 * Returns multiple lines of colored ASCII art
 */
export declare function renderMesmericFull(ctx: RenderContext): string | null;
/**
 * Render compact mesmeric visualization
 * Single line with animated pattern
 */
export declare function renderMesmericCompact(ctx: RenderContext): string | null;
/**
 * Main mesmeric render function
 * Chooses display mode based on environment
 */
export declare function renderMesmericLine(ctx: RenderContext): string | null;
/**
 * Generate a demo frame for a specific mode
 * Useful for testing the visualizer standalone
 */
export declare function renderMesmericDemo(mode: MesmericMode): string;
//# sourceMappingURL=mesmeric.d.ts.map