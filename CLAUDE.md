# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Claude HUD is a Claude Code plugin that displays a real-time multi-line statusline. It shows context health, tool activity, agent status, and todo progress.

## Build Commands

```bash
npm ci               # Install dependencies
npm run build        # Build TypeScript to dist/

# Test with sample stdin data
echo '{"model":{"display_name":"Opus"},"context_window":{"current_usage":{"input_tokens":45000},"context_window_size":200000}}' | node dist/index.js
```

## Architecture

### Data Flow

```
Claude Code → stdin JSON → parse → render lines → stdout → Claude Code displays
           ↘ transcript_path → parse JSONL → tools/agents/todos
```

**Key insight**: The statusline is invoked every ~300ms by Claude Code. Each invocation:
1. Receives JSON via stdin (model, context, tokens - native accurate data)
2. Parses the transcript JSONL file for tools, agents, and todos
3. Renders multi-line output to stdout
4. Claude Code displays all lines

### Data Sources

**Native from stdin JSON** (accurate, no estimation):
- `model.display_name` - Current model
- `context_window.current_usage` - Token counts
- `context_window.context_window_size` - Max context
- `transcript_path` - Path to session transcript

**From transcript JSONL parsing**:
- `tool_use` blocks → tool name, input, start time
- `tool_result` blocks → completion, duration
- Running tools = `tool_use` without matching `tool_result`
- `TodoWrite` calls → todo list
- `Task` calls → agent info

**From config files**:
- MCP count from `~/.claude/settings.json` (mcpServers)
- Hooks count from `~/.claude/settings.json` (hooks)
- Rules count from CLAUDE.md files

### File Structure

```
src/
├── index.ts           # Entry point
├── stdin.ts           # Parse Claude's JSON input
├── transcript.ts      # Parse transcript JSONL
├── config-reader.ts   # Read MCP/rules configs
├── types.ts           # TypeScript interfaces
└── render/
    ├── index.ts          # Main render coordinator
    ├── session-line.ts   # Line 1: model, context, rules, MCPs
    ├── animation-line.ts # Line 2 (opt): Tamagotchi animation
    ├── animations.ts     # Tamagotchi frames and utilities
    ├── mesmeric.ts       # Wave interference visualizer
    ├── tools-line.ts     # Tool activity
    ├── agents-line.ts    # Agent status
    ├── todos-line.ts     # Todo progress
    └── colors.ts         # ANSI color helpers
```

### Output Format

```
[Opus] ████████░░ 45% | 📋 3 rules | 🔌 5 MCPs | ⏱️ 12m
◐ Edit: auth.ts | ✓ Read ×3 | ✓ Grep ×2
◐ explore [haiku]: Finding auth code (2m 15s)
▸ Fix authentication bug (2/5)
```

Lines are conditionally shown:
- Line 1 (session): Always shown
- Line 2 (tools): Shown if any tools used
- Line 3 (agents): Shown only if agents active
- Line 4 (todos): Shown only if todos exist

### Context Thresholds

| Threshold | Color | Action |
|-----------|-------|--------|
| <70% | Green | Normal |
| 70-85% | Yellow | Warning |
| >85% | Red | Show token breakdown |
| >95% | Red | Show ⚠️ COMPACT |

## Animation Mode

Enable entertaining animations that change based on Claude's activity:

```bash
# Enable via environment variable in settings.json statusLine config
CLAUDE_HUD_ANIMATE=1

# Optional: Use compact single-line mode instead of full multi-line
CLAUDE_HUD_COMPACT=1
```

### Tamagotchi Display (Full Mode)

The full animation mode displays a 4-line ASCII character scene that changes based on activity:

```
    ☾   ⭐
   (－‿－) zzz
    /|__|\\
   ～～～～～
─ Waiting for input
```

### Animation States

| State | Character | Trigger |
|-------|-----------|---------|
| 😴 Sleeping | `(－‿－) zzz` | Waiting for input |
| ☁️ Idle | `(◠‿◠) ♪` | Ready, no activity |
| 💭 Thinking | `(°ー°) ???` | Processing between tools |
| 📖 Reading | `◉_◉` scanning | Read, Glob, ls |
| ✍️ Writing | `(•̀ᴗ•́)` at screen | Write, Edit, MultiEdit |
| 🔍 Searching | Moving magnifier | Grep, search operations |
| 🤖 Agent | Robot spawning | Task subagent running |
| ▶ Bash | Terminal progress | Shell command executing |
| 🌐 Fetch | Data flowing | Web requests |
| 🔥 Pressure | `(×_×) 💦` stressed | Context usage >90% |
| 🎉 Success | `\\(★‿★)/` celebrating | Task completion |

Animations are time-based (derived from `Date.now()`) to work with the stateless ~300ms invocation cycle.

## Mesmeric Wave Mode

An alternative visualization mode that creates mesmerizing wave interference patterns, inspired by Winamp visualizers and fire simulations.

```bash
# Enable via environment variable in settings.json statusLine config
CLAUDE_HUD_MESMERIC=1

# Combine with compact mode for single-line wave display
CLAUDE_HUD_MESMERIC=1 CLAUDE_HUD_COMPACT=1
```

### Full Mesmeric Display

The wave interference creates hypnotic ASCII patterns that respond to Claude's activity:

```
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~≈≈≈≈≈≈≈≈≈≈≈≈
~~~~~~~~~~~~~~~~~~~~~~~~~~╭───────╮~~~~~~~~~~~~~≈≈≈≈≈≈≈≈≈≈≈≈
~~~~~~~~~~~~~~~~~~~~~~≈≈≈≈│ －   － │≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≋≋
~~~~~~~~~~~~~~≈≈≈≈≈≈≈≈≈≈≈≈│   z   │≋≋≋≋≋≋≋≋≋≈≈≈≈≈≈≈≈≋≋≋≋≋≋≋≋
≈≈~~~~~~~~~~~~~~≈≈≈≈≈≈≈≈≈≈╰───────╯≈≈≋≈≈≋≈≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋≋
─ SLEEP │ Waiting for input
```

### Mesmeric Modes

| Mode | Visual | Trigger |
|------|--------|---------|
| SLEEP | Gentle water waves (~≈≋) | Waiting for input |
| IDLE | Soft flowing patterns | Ready, no activity |
| SCAN | Matrix-like ripples | Read, Grep, search |
| BUILD | Rising constructive waves | Write, Edit operations |
| CRUNCH | Intense fire patterns (░▒▓█) | Bash, Agent, heavy processing |
| PRESSURE | Chaotic flames | Context >90% |
| SUCCESS | Calm expanding patterns | Task completion |

### Technical Details

The mesmeric visualizer uses mathematical wave interference:
- Multi-layered sine waves with configurable resonance
- Radial ripples from center point
- Entropy (controlled noise) for texture
- Character palette mapping for ASCII gradients
- Time-based animation that's stateless (works with 300ms invocation cycle)

Each mode has parameters: `entropy`, `gravity`, `velocity`, `resonance`, `zoom`, `waveCount` that create distinct visual behaviors.

## Plugin Configuration

The plugin manifest is in `.claude-plugin/plugin.json` (metadata only - name, description, version, author).

**StatusLine configuration** must be added to the user's `~/.claude/settings.json` via `/claude-hud:setup`.

The setup command adds an auto-updating command that finds the latest installed version at runtime.

Note: `statusLine` is NOT a valid plugin.json field. It must be configured in settings.json after plugin installation. Updates are automatic - no need to re-run setup.

## Dependencies

- **Runtime**: Node.js 18+ or Bun
- **Build**: TypeScript 5, ES2022 target, NodeNext modules
