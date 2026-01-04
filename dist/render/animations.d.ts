/**
 * Get current animation frame index based on time (stateless)
 */
export declare function getFrame(frameCount: number, speedMultiplier?: number): number;
/**
 * Get a secondary offset frame for layered animations
 */
export declare function getOffsetFrame(frameCount: number, offset?: number): number;
export type ActivityState = 'idle' | 'sleeping' | 'thinking' | 'reading' | 'writing' | 'searching' | 'agent' | 'bash' | 'fetch' | 'pressure' | 'success';
/**
 * Get a single-line compact animation for the state
 * (For when vertical space is limited)
 */
export declare function getCompactAnimation(state: ActivityState): string;
/**
 * Get full multi-line animation frame
 * Returns array of lines for the complete character scene
 */
export declare function getFullAnimation(state: ActivityState): string[];
/**
 * Get animation as a single joined string (for simple rendering)
 */
export declare function getAnimationBlock(state: ActivityState): string;
export declare function getAnimationFrame(state: ActivityState, _speed?: number): string;
export declare function getSpinner(startTime?: Date): string;
//# sourceMappingURL=animations.d.ts.map