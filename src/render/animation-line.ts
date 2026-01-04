import type { RenderContext, ToolEntry } from '../types.js';
import { getAnimationFrame, getSpinner, type ActivityState } from './animations.js';
import { dim, cyan, yellow, magenta, green } from './colors.js';

/**
 * Determine the current activity state based on what Claude is doing
 */
function detectActivityState(ctx: RenderContext): { state: ActivityState; detail: string; startTime?: Date } {
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

  // Check if there are in-progress todos (Claude is working on something)
  const inProgressTodo = todos.find((t) => t.status === 'in_progress');
  if (inProgressTodo) {
    const completed = todos.filter((t) => t.status === 'completed').length;
    const total = todos.length;
    return {
      state: 'progress',
      detail: `${completed}/${total} tasks`,
    };
  }

  // Check for recent completions (show success briefly)
  const recentTools = tools.filter((t) => t.status === 'completed').slice(-3);
  if (recentTools.length > 0) {
    const mostRecent = recentTools[recentTools.length - 1];
    if (mostRecent.endTime) {
      const elapsed = Date.now() - mostRecent.endTime.getTime();
      if (elapsed < 2000) {
        // Show success for 2 seconds after completion
        return { state: 'success', detail: `${mostRecent.name} done!` };
      }
    }
  }

  // All todos completed
  if (todos.length > 0 && todos.every((t) => t.status === 'completed')) {
    return { state: 'success', detail: 'All tasks complete!' };
  }

  // If there's activity history but nothing running, Claude is thinking
  if (tools.length > 0 || agents.length > 0) {
    return { state: 'thinking', detail: 'Processing...' };
  }

  // Default idle state
  return { state: 'idle', detail: 'Waiting for input' };
}

/**
 * Map tool names to activity states
 */
function getToolState(tool: ToolEntry): ActivityState {
  const name = tool.name.toLowerCase();

  if (name.includes('read') || name.includes('glob') || name.includes('ls')) {
    return 'reading';
  }
  if (name.includes('write') || name.includes('edit') || name.includes('multiedit')) {
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

/**
 * Render the animation line
 */
export function renderAnimationLine(ctx: RenderContext): string | null {
  const { state, detail, startTime } = detectActivityState(ctx);

  // Build the animation line
  const animation = getAnimationFrame(state);
  const spinner = startTime ? yellow(getSpinner(startTime)) : '';
  const elapsed = startTime ? dim(` (${formatElapsed(startTime)})`) : '';

  // Color the detail based on state
  let coloredDetail: string;
  switch (state) {
    case 'reading':
      coloredDetail = cyan(detail);
      break;
    case 'writing':
      coloredDetail = yellow(detail);
      break;
    case 'searching':
      coloredDetail = magenta(detail);
      break;
    case 'agent':
      coloredDetail = magenta(detail);
      break;
    case 'bash':
      coloredDetail = green(detail);
      break;
    case 'success':
      coloredDetail = green(detail);
      break;
    default:
      coloredDetail = dim(detail);
  }

  // Compose the line
  const parts: string[] = [animation];

  if (spinner && state !== 'idle' && state !== 'success') {
    parts.push(spinner);
  }

  if (detail) {
    parts.push(coloredDetail);
  }

  if (elapsed) {
    parts.push(elapsed);
  }

  return parts.join(' ');
}
