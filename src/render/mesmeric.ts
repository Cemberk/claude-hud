// =============================================================================
// MESMERIC WAVE VISUALIZER
// =============================================================================
// A mesmerizing ASCII art visualizer inspired by music visualizers like Winamp.
// Uses mathematical wave interference patterns that respond to Claude's activity.
// Like watching a fire or synthesizer - continuous, hypnotic, and entertaining.
// =============================================================================

import type { RenderContext, ToolEntry } from '../types.js';
import { cyan, yellow, green, magenta, dim, red } from './colors.js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const WIDTH = 60;  // Grid width in characters
const HEIGHT = 12; // Grid height in lines

// Character palette for value-to-ASCII mapping (dark to bright)
const CHARS = ' .·:;=+*#%@';
// Alternative palettes for different moods
const CHARS_WATER = ' ·~≈≋∿∾≀≁○';
const CHARS_FIRE = ' ·░▒▓█▓▒░·';
const CHARS_MATRIX = ' ·.:;!|=+#@';
// Smooth gradient for gentle animations
const CHARS_GENTLE = ' ·.:-=+*○●';

// =============================================================================
// ACTIVITY STATES AND PARAMETER CONFIGURATIONS
// =============================================================================

export type MesmericMode =
  | 'IDLE'      // Calm, gentle waves
  | 'SCAN'      // Rippling search patterns
  | 'BUILD'     // Constructive rising patterns
  | 'CRUNCH'    // Intense processing
  | 'SUCCESS'   // Celebratory burst
  | 'SLEEP'     // Almost still, gentle breathing
  | 'PRESSURE'; // Warning - chaotic

interface ModeParams {
  entropy: number;     // Randomness/noise (0-1)
  gravity: number;     // Pull toward center (-1 to 1)
  velocity: number;    // Time speed multiplier
  resonance: number;   // Wave interference strength
  zoom: number;        // Field scale
  waveCount: number;   // Number of wave layers
  palette: string;     // Character palette to use
  colorFn: (s: string) => string; // Color function
}

const MODE_CONFIGS: Record<MesmericMode, ModeParams> = {
  IDLE: {
    entropy: 0.05,
    gravity: 0.4,
    velocity: 0.03,
    resonance: 1.5,
    zoom: 1.0,
    waveCount: 3,
    palette: CHARS,
    colorFn: dim,
  },
  SCAN: {
    entropy: 0.12,
    gravity: 0.8,
    velocity: 0.1,
    resonance: 2.5,
    zoom: 1.3,
    waveCount: 5,
    palette: CHARS_MATRIX,
    colorFn: cyan,
  },
  BUILD: {
    entropy: 0.08,
    gravity: -0.3,
    velocity: 0.12,
    resonance: 2.0,
    zoom: 1.4,
    waveCount: 5,
    palette: CHARS,
    colorFn: yellow,
  },
  CRUNCH: {
    entropy: 0.5,
    gravity: 1.2,
    velocity: 0.22,
    resonance: 3.8,
    zoom: 1.9,
    waveCount: 6,
    palette: CHARS_FIRE,
    colorFn: magenta,
  },
  SUCCESS: {
    entropy: 0.04,
    gravity: -0.6,
    velocity: 0.08,
    resonance: 1.2,
    zoom: 0.8,
    waveCount: 4,
    palette: CHARS,
    colorFn: green,
  },
  SLEEP: {
    entropy: 0.02,
    gravity: 0.3,
    velocity: 0.02,
    resonance: 1.2,
    zoom: 0.9,
    waveCount: 3,
    palette: CHARS_WATER,
    colorFn: dim,
  },
  PRESSURE: {
    entropy: 0.65,
    gravity: 1.4,
    velocity: 0.28,
    resonance: 4.2,
    zoom: 2.1,
    waveCount: 7,
    palette: CHARS_FIRE,
    colorFn: red,
  },
};

// =============================================================================
// CHARACTER FACES FOR OVERLAY
// =============================================================================

interface FaceConfig {
  eyes: string[];
  mouth: string[];
  blinkChance: number;
}

const FACES: Record<MesmericMode, FaceConfig> = {
  IDLE: {
    eyes: ['o', 'o'],
    mouth: ['v'],
    blinkChance: 0.05,
  },
  SCAN: {
    eyes: ['◉', '◉'],
    mouth: ['─'],
    blinkChance: 0.02,
  },
  BUILD: {
    eyes: ['•', '•'],
    mouth: ['O'],
    blinkChance: 0.03,
  },
  CRUNCH: {
    eyes: ['×', '×'],
    mouth: ['w'],
    blinkChance: 0.1,
  },
  SUCCESS: {
    eyes: ['★', '★'],
    mouth: ['∀'],
    blinkChance: 0.0,
  },
  SLEEP: {
    eyes: ['－', '－'],
    mouth: ['z'],
    blinkChance: 0.0,
  },
  PRESSURE: {
    eyes: ['◎', '◎'],
    mouth: ['△'],
    blinkChance: 0.2,
  },
};

// =============================================================================
// WAVE MATHEMATICS
// =============================================================================

/**
 * Core wave field generator
 * Creates multi-layered interference patterns
 */
function computeWaveValue(
  x: number,
  y: number,
  time: number,
  params: ModeParams
): number {
  const { resonance, gravity, waveCount, zoom, entropy } = params;

  // Normalize coordinates to [-1, 1] range
  const nx = ((x / WIDTH) * 2 - 1) * zoom;
  const ny = ((y / HEIGHT) * 2 - 1) * zoom * 2; // Aspect ratio correction

  // Distance from center
  const dist = Math.sqrt(nx * nx + ny * ny);
  const angle = Math.atan2(ny, nx);

  let value = 0;

  // Layer 1: Radial waves (ripples from center)
  value += Math.sin(dist * resonance * 4 - time * 2) * gravity;

  // Layer 2: Horizontal waves
  value += Math.sin(nx * resonance + time);

  // Layer 3: Vertical waves
  value += Math.sin(ny * resonance + time * 0.7);

  // Layer 4: Diagonal interference
  value += Math.sin((nx + ny) * resonance * 0.5 + time * 1.3);

  // Layer 5: Rotational pattern
  if (waveCount >= 5) {
    value += Math.sin(angle * 3 + dist * resonance - time) * 0.5;
  }

  // Layer 6: Secondary ripple
  if (waveCount >= 6) {
    value += Math.cos(dist * resonance * 2 + time * 1.5) * 0.3;
  }

  // Layer 7: Chaos pattern for pressure mode
  if (waveCount >= 7) {
    value += Math.tan(nx * 0.1 + time) * 0.15;
    value += Math.sin(ny * dist * resonance + time * 3) * 0.4;
  }

  // Add entropy (controlled randomness for texture)
  if (entropy > 0) {
    // Use position-seeded pseudo-random for consistent noise
    const seed = Math.sin(x * 12.9898 + y * 78.233 + time * 0.1) * 43758.5453;
    const noise = (seed - Math.floor(seed)) * 2 - 1;
    value += noise * entropy;
  }

  return value;
}

/**
 * Map a wave value to a character from the palette
 */
function valueToChar(value: number, palette: string): string {
  // Normalize value to [0, 1] range (assuming typical output is roughly -3 to 3)
  const normalized = (value + 3) / 6;
  const clamped = Math.max(0, Math.min(1, normalized));
  const index = Math.floor(clamped * (palette.length - 1));
  return palette[index];
}

// =============================================================================
// GRID RENDERING
// =============================================================================

/**
 * Generate the full mesmeric grid
 */
function generateGrid(mode: MesmericMode, time: number): string[][] {
  const params = MODE_CONFIGS[mode];
  const grid: string[][] = [];

  for (let y = 0; y < HEIGHT; y++) {
    const row: string[] = [];
    for (let x = 0; x < WIDTH; x++) {
      const value = computeWaveValue(x, y, time, params);
      const char = valueToChar(value, params.palette);
      row.push(char);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Overlay the character face onto the grid
 */
function overlayFace(grid: string[][], mode: MesmericMode, time: number): void {
  const face = FACES[mode];
  const centerX = Math.floor(WIDTH / 2);
  const centerY = Math.floor(HEIGHT / 2);

  // Determine if blinking
  const blink = Math.sin(time * 0.5) > (1 - face.blinkChance * 20);
  const eyes = blink ? ['－', '－'] : face.eyes;

  // Build face lines
  // Line -2: Top of head
  const topLine = '╭───────╮';
  // Line -1: Eyes
  const eyesLine = `│ ${eyes[0]}   ${eyes[1]} │`;
  // Line 0: Mouth
  const mouthLine = `│   ${face.mouth[0]}   │`;
  // Line 1: Bottom of head
  const bottomLine = '╰───────╯';

  const faceLines = [topLine, eyesLine, mouthLine, bottomLine];
  const startY = centerY - 2;

  // Clear space for face and overlay
  for (let i = 0; i < faceLines.length; i++) {
    const y = startY + i;
    if (y >= 0 && y < HEIGHT) {
      const line = faceLines[i];
      const startX = centerX - Math.floor(line.length / 2);
      for (let j = 0; j < line.length; j++) {
        const x = startX + j;
        if (x >= 0 && x < WIDTH) {
          grid[y][x] = line[j];
        }
      }
    }
  }
}

/**
 * Add a status bar at the bottom
 */
function addStatusBar(grid: string[][], mode: MesmericMode, detail: string): void {
  const lastRow = HEIGHT - 1;
  const status = ` ${mode} │ ${detail} `;
  const padding = Math.max(0, WIDTH - status.length);
  const paddedStatus = status + '─'.repeat(padding);

  for (let x = 0; x < WIDTH && x < paddedStatus.length; x++) {
    grid[lastRow][x] = paddedStatus[x];
  }
}

// =============================================================================
// ACTIVITY STATE DETECTION (mirrors animation-line.ts)
// =============================================================================

function getContextPercent(ctx: RenderContext): number {
  const usage = ctx.stdin.context_window?.current_usage;
  const size = ctx.stdin.context_window?.context_window_size;

  if (!usage || !size) return 0;

  const totalTokens =
    (usage.input_tokens ?? 0) +
    (usage.cache_creation_input_tokens ?? 0) +
    (usage.cache_read_input_tokens ?? 0);

  return Math.round((totalTokens / size) * 100);
}

function getToolMode(tool: ToolEntry): MesmericMode {
  const name = tool.name.toLowerCase();

  if (name.includes('read') || name.includes('glob') || name === 'ls') {
    return 'SCAN';
  }
  if (name.includes('write') || name.includes('edit') || name.includes('multiedit') || name.includes('notebook')) {
    return 'BUILD';
  }
  if (name.includes('grep') || name.includes('search') || name.includes('find')) {
    return 'SCAN';
  }
  if (name.includes('bash') || name.includes('shell') || name.includes('exec')) {
    return 'CRUNCH';
  }
  if (name.includes('fetch') || name.includes('web') || name.includes('http')) {
    return 'SCAN';
  }
  if (name.includes('task') || name.includes('agent')) {
    return 'CRUNCH';
  }

  return 'BUILD';
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

function detectMesmericMode(ctx: RenderContext): { mode: MesmericMode; detail: string } {
  const { tools, agents, todos } = ctx.transcript;
  const contextPercent = getContextPercent(ctx);

  // High context pressure
  if (contextPercent >= 90) {
    return { mode: 'PRESSURE', detail: `${contextPercent}% context` };
  }

  // Running agents
  const runningAgent = agents.find((a) => a.status === 'running');
  if (runningAgent) {
    const desc = runningAgent.description || runningAgent.type;
    return { mode: 'CRUNCH', detail: truncate(desc, 25) };
  }

  // Running tools
  const runningTools = tools.filter((t) => t.status === 'running');
  if (runningTools.length > 0) {
    const tool = runningTools[runningTools.length - 1];
    return {
      mode: getToolMode(tool),
      detail: tool.target ? truncate(tool.target, 25) : tool.name
    };
  }

  // Recent completion
  const completedTools = tools.filter((t) => t.status === 'completed');
  if (completedTools.length > 0) {
    const mostRecent = completedTools[completedTools.length - 1];
    if (mostRecent.endTime) {
      const elapsed = Date.now() - mostRecent.endTime.getTime();
      if (elapsed < 3000) {
        return { mode: 'SUCCESS', detail: 'Complete!' };
      }
    }
  }

  // All todos done
  if (todos.length > 0 && todos.every((t) => t.status === 'completed')) {
    return { mode: 'SUCCESS', detail: 'All tasks done!' };
  }

  // In-progress todo
  const inProgressTodo = todos.find((t) => t.status === 'in_progress');
  if (inProgressTodo) {
    return { mode: 'BUILD', detail: truncate(inProgressTodo.content, 25) };
  }

  // Recent activity
  if (tools.length > 0 || agents.length > 0) {
    const lastTool = tools[tools.length - 1];
    if (lastTool?.endTime) {
      const elapsed = Date.now() - lastTool.endTime.getTime();
      if (elapsed < 10000) {
        return { mode: 'IDLE', detail: 'Thinking...' };
      }
    }
    return { mode: 'IDLE', detail: 'Ready' };
  }

  // No activity
  return { mode: 'SLEEP', detail: 'Waiting for input' };
}

// =============================================================================
// MAIN RENDER FUNCTIONS
// =============================================================================

/**
 * Render the full mesmeric visualization
 * Returns multiple lines of colored ASCII art
 */
export function renderMesmericFull(ctx: RenderContext): string | null {
  const { mode, detail } = detectMesmericMode(ctx);
  const params = MODE_CONFIGS[mode];

  // Time-based animation (stateless - uses current time)
  const time = Date.now() * params.velocity * 0.001;

  // Generate wave grid
  const grid = generateGrid(mode, time);

  // Overlay character face
  overlayFace(grid, mode, time);

  // Convert grid to colored lines
  const lines: string[] = [];
  for (let y = 0; y < HEIGHT - 1; y++) {
    const line = grid[y].join('');
    lines.push(params.colorFn(line));
  }

  // Add status line at bottom
  const statusLine = dim(`─ ${mode} │ ${detail}`);
  lines.push(statusLine);

  return lines.join('\n');
}

/**
 * Render compact mesmeric visualization
 * Single line with animated pattern
 */
export function renderMesmericCompact(ctx: RenderContext): string | null {
  const { mode, detail } = detectMesmericMode(ctx);
  const params = MODE_CONFIGS[mode];
  const time = Date.now() * params.velocity * 0.001;

  // Generate a single-line wave pattern
  const compactWidth = 30;
  let pattern = '';

  for (let x = 0; x < compactWidth; x++) {
    const value = computeWaveValue(x, 0, time, params);
    pattern += valueToChar(value, params.palette);
  }

  // Get face for mode
  const face = FACES[mode];
  const blink = Math.sin(time * 0.5) > 0.95;
  const eyes = blink ? '－－' : face.eyes.join('');
  const faceStr = `(${eyes})`;

  return `${params.colorFn(pattern)} ${faceStr} ${dim(detail)}`;
}

/**
 * Main mesmeric render function
 * Chooses display mode based on environment
 */
export function renderMesmericLine(ctx: RenderContext): string | null {
  const compactMode = process.env.CLAUDE_HUD_COMPACT?.toLowerCase();
  const useCompact = compactMode === '1' || compactMode === 'true' || compactMode === 'on';

  if (useCompact) {
    return renderMesmericCompact(ctx);
  }

  return renderMesmericFull(ctx);
}

// =============================================================================
// DEMO MODE - For testing without live context
// =============================================================================

/**
 * Generate a demo frame for a specific mode
 * Useful for testing the visualizer standalone
 */
export function renderMesmericDemo(mode: MesmericMode): string {
  const params = MODE_CONFIGS[mode];
  const time = Date.now() * params.velocity * 0.001;

  const grid = generateGrid(mode, time);
  overlayFace(grid, mode, time);

  const lines: string[] = [];
  for (let y = 0; y < HEIGHT; y++) {
    lines.push(params.colorFn(grid[y].join('')));
  }

  return lines.join('\n');
}
