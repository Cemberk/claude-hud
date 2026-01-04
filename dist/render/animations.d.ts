/**
 * Get current animation frame index based on time
 */
export declare function getFrame(frameCount: number, speed?: number): number;
/**
 * Get frame based on a specific start time (for tool/agent-specific animations)
 */
export declare function getFrameFromStart(startTime: Date, frameCount: number, speed?: number): number;
export type ActivityState = 'idle' | 'thinking' | 'reading' | 'writing' | 'searching' | 'agent' | 'bash' | 'fetch' | 'pressure' | 'progress' | 'success';
/**
 * Get the current animation frame for a given state
 */
export declare function getAnimationFrame(state: ActivityState, speed?: number): string;
export declare function getSpinner(startTime?: Date): string;
export declare function getProgressAnimation(): string;
export declare function getWaveChar(position: number): string;
/**
 * Create an animated bar (alternative to static coloredBar)
 */
export declare function animatedBar(percent: number, width?: number): string;
//# sourceMappingURL=animations.d.ts.map