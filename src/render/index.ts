import type { RenderContext } from '../types.js';
import { renderSessionLine } from './session-line.js';
import { renderToolsLine } from './tools-line.js';
import { renderAgentsLine } from './agents-line.js';
import { renderTodosLine } from './todos-line.js';
import { renderAnimationLine } from './animation-line.js';
import { RESET } from './colors.js';

/**
 * Check if animation mode is enabled via environment variable
 * Set CLAUDE_HUD_ANIMATE=1 or CLAUDE_HUD_ANIMATE=true to enable
 */
function isAnimationEnabled(): boolean {
  const value = process.env.CLAUDE_HUD_ANIMATE?.toLowerCase();
  return value === '1' || value === 'true' || value === 'on';
}

export function render(ctx: RenderContext): void {
  const lines: string[] = [];
  const animationMode = isAnimationEnabled();

  const sessionLine = renderSessionLine(ctx);
  if (sessionLine) {
    lines.push(sessionLine);
  }

  // Animation line appears right after session line when enabled
  if (animationMode) {
    const animationLine = renderAnimationLine(ctx);
    if (animationLine) {
      lines.push(animationLine);
    }
  }

  const toolsLine = renderToolsLine(ctx);
  if (toolsLine) {
    lines.push(toolsLine);
  }

  const agentsLine = renderAgentsLine(ctx);
  if (agentsLine) {
    lines.push(agentsLine);
  }

  const todosLine = renderTodosLine(ctx);
  if (todosLine) {
    lines.push(todosLine);
  }

  for (const line of lines) {
    const outputLine = `${RESET}${line.replace(/ /g, '\u00A0')}`;
    console.log(outputLine);
  }
}
