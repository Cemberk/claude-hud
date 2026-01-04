import { cyan, yellow, green, magenta, dim, red } from './colors.js';

// Animation frame timing - derived from Date.now() for stateless operation
const FRAME_DURATION = 150; // ms per frame

/**
 * Get current animation frame index based on time
 */
export function getFrame(frameCount: number, speed: number = 1): number {
  const now = Date.now();
  return Math.floor((now / (FRAME_DURATION / speed)) % frameCount);
}

/**
 * Get frame based on a specific start time (for tool/agent-specific animations)
 */
export function getFrameFromStart(startTime: Date, frameCount: number, speed: number = 1): number {
  const elapsed = Date.now() - startTime.getTime();
  return Math.floor((elapsed / (FRAME_DURATION / speed)) % frameCount);
}

// ============================================================================
// ASCII Art Animations - Different states get different animations
// ============================================================================

// Thinking/Idle animation - brain processing
const THINKING_FRAMES = [
  '(◠‿◠)',
  '(◠‿◠)',
  '(◠_◠)',
  '(◠_◠)',
  '(◠‿◠)',
  '(◠‿◠)',
  '(˘◡˘)',
  '(˘◡˘)',
];

// Reading/Scanning animation - eyes moving
const READING_FRAMES = [
  '◉_◉  📖',
  '◉_◉  📖',
  '◔_◉  📖',
  '◔_◔  📖',
  '◉_◔  📖',
  '◉_◉  📖',
  '◔_◉  📖',
  '◔_◔  📖',
];

// Writing/Editing animation - typing
const WRITING_FRAMES = [
  '✍️ ▁',
  '✍️ ▂',
  '✍️ ▃',
  '✍️ ▄',
  '✍️ ▅',
  '✍️ ▆',
  '✍️ ▇',
  '✍️ █',
];

// Searching/Grep animation - magnifying glass scanning
const SEARCHING_FRAMES = [
  '🔍 ░░░░░░░░',
  '🔍 █░░░░░░░',
  '🔍 ░█░░░░░░',
  '🔍 ░░█░░░░░',
  '🔍 ░░░█░░░░',
  '🔍 ░░░░█░░░',
  '🔍 ░░░░░█░░',
  '🔍 ░░░░░░█░',
  '🔍 ░░░░░░░█',
  '🔍 ░░░░░░░░',
];

// Agent working animation - robot busy
const AGENT_FRAMES = [
  '🤖 ⚡',
  '🤖  ⚡',
  '🤖   ⚡',
  '🤖    ⚡',
  '🤖   ⚡',
  '🤖  ⚡',
  '🤖 ⚡',
  '🤖⚡',
];

// Bash/Command running animation - terminal cursor
const BASH_FRAMES = [
  '▶ ░░░░░░░░ ▮',
  '▶ █░░░░░░░ ▯',
  '▶ ██░░░░░░ ▮',
  '▶ ███░░░░░ ▯',
  '▶ ████░░░░ ▮',
  '▶ █████░░░ ▯',
  '▶ ██████░░ ▮',
  '▶ ███████░ ▯',
  '▶ ████████ ▮',
  '▶ ░████████ ▯',
];

// Web fetch animation - data flowing
const FETCH_FRAMES = [
  '🌐 ·····',
  '🌐 ○····',
  '🌐 ·○···',
  '🌐 ··○··',
  '🌐 ···○·',
  '🌐 ····○',
  '🌐 ·····',
  '🌐 ●····',
];

// High context pressure animation - warning pulse
const PRESSURE_FRAMES = [
  '⚠️  CONTEXT HIGH',
  '⚠️  CONTEXT HIGH',
  '⚡  CONTEXT HIGH',
  '⚡  CONTEXT HIGH',
  '🔥 CONTEXT HIGH',
  '🔥 CONTEXT HIGH',
  '⚡  CONTEXT HIGH',
  '⚡  CONTEXT HIGH',
];

// Todo progress animation - progress indicator
const PROGRESS_FRAMES = [
  '📋 ▱▱▱',
  '📋 ▰▱▱',
  '📋 ▰▰▱',
  '📋 ▰▰▰',
  '📋 ▰▰▱',
  '📋 ▰▱▱',
];

// Success/Completion animation - celebration
const SUCCESS_FRAMES = [
  '✨ ᕙ(⇀‸↼‶)ᕗ ✨',
  '✨ ᕙ(⇀‸↼‶)ᕗ  ✨',
  '✨  ᕙ(⇀‸↼‶)ᕗ ✨',
  '✨ ᕙ(⇀‸↼‶)ᕗ ✨',
  '🎉 ᕙ(⇀‸↼‶)ᕗ 🎉',
  '🎉 ᕙ(⇀‸↼‶)ᕗ 🎉',
  '✨ ᕙ(⇀‸↼‶)ᕗ ✨',
  '✨ ᕙ(⇀‸↼‶)ᕗ ✨',
];

// Idle animation - peaceful waiting
const IDLE_FRAMES = [
  '😴 z',
  '😴 zz',
  '😴 zzz',
  '😴 zzzz',
  '😴 zzz',
  '😴 zz',
  '😴 z',
  '😴 ',
];

// Activity state type
export type ActivityState =
  | 'idle'
  | 'thinking'
  | 'reading'
  | 'writing'
  | 'searching'
  | 'agent'
  | 'bash'
  | 'fetch'
  | 'pressure'
  | 'progress'
  | 'success';

// Map states to animations
const ANIMATION_MAP: Record<ActivityState, string[]> = {
  idle: IDLE_FRAMES,
  thinking: THINKING_FRAMES,
  reading: READING_FRAMES,
  writing: WRITING_FRAMES,
  searching: SEARCHING_FRAMES,
  agent: AGENT_FRAMES,
  bash: BASH_FRAMES,
  fetch: FETCH_FRAMES,
  pressure: PRESSURE_FRAMES,
  progress: PROGRESS_FRAMES,
  success: SUCCESS_FRAMES,
};

// Map states to colors
function colorForState(state: ActivityState, text: string): string {
  switch (state) {
    case 'idle':
      return dim(text);
    case 'thinking':
      return cyan(text);
    case 'reading':
      return cyan(text);
    case 'writing':
      return yellow(text);
    case 'searching':
      return magenta(text);
    case 'agent':
      return magenta(text);
    case 'bash':
      return green(text);
    case 'fetch':
      return cyan(text);
    case 'pressure':
      return red(text);
    case 'progress':
      return yellow(text);
    case 'success':
      return green(text);
    default:
      return text;
  }
}

/**
 * Get the current animation frame for a given state
 */
export function getAnimationFrame(state: ActivityState, speed: number = 1): string {
  const frames = ANIMATION_MAP[state];
  const frameIndex = getFrame(frames.length, speed);
  return colorForState(state, frames[frameIndex]);
}

/**
 * Get animated spinner (replaces static ◐)
 */
const SPINNER_FRAMES = ['◐', '◓', '◑', '◒'];
export function getSpinner(startTime?: Date): string {
  if (startTime) {
    return SPINNER_FRAMES[getFrameFromStart(startTime, SPINNER_FRAMES.length, 2)];
  }
  return SPINNER_FRAMES[getFrame(SPINNER_FRAMES.length, 2)];
}

/**
 * Get animated progress bar
 */
const PROGRESS_BAR_FRAMES = ['▱▱▱▱▱', '▰▱▱▱▱', '▰▰▱▱▱', '▰▰▰▱▱', '▰▰▰▰▱', '▰▰▰▰▰', '▰▰▰▰▱', '▰▰▰▱▱', '▰▰▱▱▱', '▰▱▱▱▱'];
export function getProgressAnimation(): string {
  return PROGRESS_BAR_FRAMES[getFrame(PROGRESS_BAR_FRAMES.length)];
}

/**
 * Get a wave animation for context bar enhancement
 */
const WAVE_CHARS = ['░', '▒', '▓', '█', '▓', '▒'];
export function getWaveChar(position: number): string {
  const offset = getFrame(WAVE_CHARS.length);
  return WAVE_CHARS[(position + offset) % WAVE_CHARS.length];
}

/**
 * Create an animated bar (alternative to static coloredBar)
 */
export function animatedBar(percent: number, width: number = 10): string {
  const filled = Math.round((percent / 100) * width);
  let bar = '';

  for (let i = 0; i < width; i++) {
    if (i < filled) {
      bar += '█';
    } else if (i === filled) {
      // Animate the edge
      bar += getWaveChar(i);
    } else {
      bar += '░';
    }
  }

  return bar;
}
