import type { RenderContext } from '../types.js';
/**
 * Render full multi-line Tamagotchi animation
 * Returns multiple lines joined with newlines
 */
export declare function renderAnimationFull(ctx: RenderContext): string | null;
/**
 * Render compact single-line animation
 * (For when space is limited or user prefers minimal display)
 */
export declare function renderAnimationCompact(ctx: RenderContext): string | null;
/**
 * Main render function - chooses display mode based on environment
 */
export declare function renderAnimationLine(ctx: RenderContext): string | null;
//# sourceMappingURL=animation-line.d.ts.map