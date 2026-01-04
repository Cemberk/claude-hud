import type { RenderContext, ToolEntry } from '../types.js';
import { getFullAnimation, getCompactAnimation, type ActivityState } from './animations.js';
import { dim } from './colors.js';

// =============================================================================
// TAMAGOTCHI ACTIVITY STATE DETECTION
// =============================================================================

/**
 * Determine the current activity state based on what Claude is doing
 */
function detectActivityState(ctx: RenderContext): {
  state: ActivityState;
  detail: string;
  startTime?: Date;
} {
  const { tools, agents, todos } = ctx.transcript;
  const contextPercent = getContextPercent(ctx);

  // Check for high context pressure first (overrides other states)
  if (contextPercent >= 90) {
    return { state: 'pressure', detail: `${contextPercent}% context used` };
  }

  // Check for running agents
  const runningAgent = agents.find((a) => a.status === 'running');
  if (runningAgent) {
    const desc = runningAgent.description || runningAgent.type;
    return {
      state: 'agent',
      detail: truncate(desc, 30),
      startTime: runningAgent.startTime,
    };
  }

  // Check for running tools
  const runningTools = tools.filter((t) => t.status === 'running');
  if (runningTools.length > 0) {
    const tool = runningTools[runningTools.length - 1]; // Most recent
    const toolState = getToolState(tool);
    return {
      state: toolState,
      detail: getToolDetail(tool),
      startTime: tool.startTime,
    };
  }

  // Check for recent completions (show success briefly)
  const completedTools = tools.filter((t) => t.status === 'completed');
  if (completedTools.length > 0) {
    const mostRecent = completedTools[completedTools.length - 1];
    if (mostRecent.endTime) {
      const elapsed = Date.now() - mostRecent.endTime.getTime();
      if (elapsed < 3000) {
        // Show success for 3 seconds after completion
        return { state: 'success', detail: `${mostRecent.name} complete!` };
      }
    }
  }

  // All todos completed
  if (todos.length > 0 && todos.every((t) => t.status === 'completed')) {
    return { state: 'success', detail: 'All tasks done!' };
  }

  // Check if there are in-progress todos (Claude is thinking/working)
  const inProgressTodo = todos.find((t) => t.status === 'in_progress');
  if (inProgressTodo) {
    return {
      state: 'thinking',
      detail: truncate(inProgressTodo.content, 25),
    };
  }

  // If there's recent activity history, Claude is thinking
  if (tools.length > 0 || agents.length > 0) {
    const lastTool = tools[tools.length - 1];
    if (lastTool?.endTime) {
      const elapsed = Date.now() - lastTool.endTime.getTime();
      if (elapsed < 10000) {
        // Within 10 seconds of last tool
        return { state: 'thinking', detail: 'Processing...' };
      }
    }
    return { state: 'idle', detail: 'Ready' };
  }

  // No activity at all - sleeping/waiting
  return { state: 'sleeping', detail: 'Waiting for input' };
}

/**
 * Map tool names to activity states
 */
function getToolState(tool: ToolEntry): ActivityState {
  const name = tool.name.toLowerCase();

  if (name.includes('read') || name.includes('glob') || name === 'ls') {
    return 'reading';
  }
  if (name.includes('write') || name.includes('edit') || name.includes('multiedit') || name.includes('notebook')) {
    return 'writing';
  }
  if (name.includes('grep') || name.includes('search') || name.includes('find')) {
    return 'searching';
  }
  if (name.includes('bash') || name.includes('shell') || name.includes('exec')) {
    return 'bash';
  }
  if (name.includes('fetch') || name.includes('web') || name.includes('http')) {
    return 'fetch';
  }
  if (name.includes('task') || name.includes('agent')) {
    return 'agent';
  }

  return 'thinking';
}

/**
 * Get detail text for a tool
 */
function getToolDetail(tool: ToolEntry): string {
  if (tool.target) {
    return truncate(tool.target, 25);
  }
  return tool.name;
}

/**
 * Get context percentage
 */
function getContextPercent(ctx: RenderContext): number {
  const usage = ctx.stdin.context_window?.current_usage;
  const size = ctx.stdin.context_window?.context_window_size;

  if (!usage || !size) return 0;

  const totalTokens =
    (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);

  return Math.round((totalTokens / size) * 100);
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

/**
 * Format elapsed time from a start time
 */
function formatElapsed(startTime: Date): string {
  const ms = Date.now() - startTime.getTime();
  if (ms < 1000) return '<1s';
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

// =============================================================================
// RENDERING FUNCTIONS
// =============================================================================

/**
 * Render full multi-line Tamagotchi animation
 * Returns multiple lines joined with newlines
 */
export function renderAnimationFull(ctx: RenderContext): string | null {
  const { state, detail, startTime } = detectActivityState(ctx);

  // Get the full 4-line animation
  const animationLines = getFullAnimation(state);

  // Build status line with detail info
  const elapsed = startTime ? dim(` (${formatElapsed(startTime)})`) : '';
  const statusLine = `${dim('─')} ${detail}${elapsed}`;

  // Combine animation with status
  return [...animationLines, statusLine].join('\n');
}

/**
 * Render compact single-line animation
 * (For when space is limited or user prefers minimal display)
 */
export function renderAnimationCompact(ctx: RenderContext): string | null {
  const { state, detail, startTime } = detectActivityState(ctx);

  const animation = getCompactAnimation(state);
  const elapsed = startTime ? dim(` (${formatElapsed(startTime)})`) : '';

  return `${animation} ${dim(detail)}${elapsed}`;
}

/**
 * Main render function - chooses display mode based on environment
 */
export function renderAnimationLine(ctx: RenderContext): string | null {
  // Check for compact mode preference
  const compactMode = process.env.CLAUDE_HUD_COMPACT?.toLowerCase();
  const useCompact = compactMode === '1' || compactMode === 'true' || compactMode === 'on';

  if (useCompact) {
    return renderAnimationCompact(ctx);
  }

  return renderAnimationFull(ctx);
}
