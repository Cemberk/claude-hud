import { renderSessionLine } from './session-line.js';
import { renderToolsLine } from './tools-line.js';
import { renderAgentsLine } from './agents-line.js';
import { renderTodosLine } from './todos-line.js';
import { renderAnimationLine } from './animation-line.js';
import { renderMesmericLine } from './mesmeric.js';
import { RESET } from './colors.js';
/**
 * Check if animation mode is enabled via environment variable
 * Set CLAUDE_HUD_ANIMATE=1 or CLAUDE_HUD_ANIMATE=true to enable
 */
function isAnimationEnabled() {
    const value = process.env.CLAUDE_HUD_ANIMATE?.toLowerCase();
    return value === '1' || value === 'true' || value === 'on';
}
/**
 * Check if mesmeric mode is enabled via environment variable
 * Set CLAUDE_HUD_MESMERIC=1 for wave interference visualizer
 * This is an alternative to the Tamagotchi animation mode
 */
function isMesmericEnabled() {
    const value = process.env.CLAUDE_HUD_MESMERIC?.toLowerCase();
    return value === '1' || value === 'true' || value === 'on';
}
export function render(ctx) {
    const lines = [];
    const animationMode = isAnimationEnabled();
    const mesmericMode = isMesmericEnabled();
    const sessionLine = renderSessionLine(ctx);
    if (sessionLine) {
        lines.push(sessionLine);
    }
    // Mesmeric mode takes priority over tamagotchi animation
    // CLAUDE_HUD_MESMERIC=1 for wave interference visualizer
    // CLAUDE_HUD_ANIMATE=1 for tamagotchi character
    if (mesmericMode) {
        const mesmericLine = renderMesmericLine(ctx);
        if (mesmericLine) {
            lines.push(mesmericLine);
        }
    }
    else if (animationMode) {
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
//# sourceMappingURL=index.js.map