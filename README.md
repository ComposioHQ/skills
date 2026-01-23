# @composiohq/skills

Distributable agent skills for Composio developers. This repository contains comprehensive guides and best practices for building AI agents with Composio's Tool Router and Triggers.

## Quick Start

Add Composio skills to your AI assistant:

```bash
npx skills add composiohq/skills
```

This command installs the Composio agent skills, giving your AI assistant access to:
- **Tool Router best practices** - Session management, authentication, and framework integration
- **Triggers & Events** - Real-time webhooks and event handling
- **Production patterns** - Security, error handling, and deployment guides

Your AI assistant can now reference these skills when helping you build with Composio!

## Overview

This skills repository follows a **simple markdown-only approach** inspired by [Remotion Skills](https://github.com/remotion-dev/skills). No build tooling, no TypeScript compilation—just pure markdown files that AI assistants can read directly.

## Structure

```
skills/
└── composio/
    ├── SKILL.md           # Main skill overview with rule references
    ├── AGENTS.md          # Consolidated single-file version (auto-generated)
    └── rules/             # Individual rule files
        ├── tr-*.md        # Tool Router rules
        └── triggers-*.md  # Trigger rules
```

## Available Skills

### 1. Tool Router (Building Agents)
- User ID best practices for security
- Creating and managing sessions
- Session lifecycle patterns
- Native tools vs MCP integration
- Framework integration (Vercel, OpenAI Agents, LangChain, Claude, CrewAI)

### 2. Authentication
- Auto authentication in chat
- Manual authorization flows
- Connection management

### 3. Toolkits & Connection Status
- Querying toolkit availability
- Building connection UIs

### 4. Advanced Features (Triggers & Events)
- Creating triggers for real-time events
- Subscribing to events (development only)
- Webhook verification (production recommended)
- Managing trigger lifecycle

## Usage

### For AI Assistants

Read either:
- **SKILL.md** - Main file with links to individual rules (faster to navigate)
- **AGENTS.md** - Single consolidated file with all content (easier to consume)

### For Developers

#### Build AGENTS.md

Automatically generate the consolidated AGENTS.md file from all rule files:

```bash
npm run build:agents
```

This script:
- Reads SKILL.md for structure
- Extracts all rule references
- Combines individual rule files
- Generates table of contents
- Outputs AGENTS.md with proper formatting

#### Watch Mode

Auto-rebuild AGENTS.md when any file changes:

```bash
npm run watch:agents
```

This watches:
- `SKILL.md` for structure changes
- `rules/*.md` for content changes
- Auto-rebuilds on any modification

## Contributing

### Adding a New Rule

1. Create a new markdown file in `skills/composio/rules/`
2. Use the naming convention:
   - `tr-*.md` for Tool Router rules
   - `triggers-*.md` for Trigger rules
3. Include frontmatter:

```markdown
---
title: Your Rule Title
impact: CRITICAL|HIGH|MEDIUM|LOW
description: Brief description of what this rule covers
tags: [tool-router, triggers, etc]
---

# Your Rule Title

Content with ❌ Incorrect and ✅ Correct examples...
```

4. Add reference to `SKILL.md` in the appropriate section
5. Run `npm run build:agents` to regenerate AGENTS.md
6. Commit all changes (rule file, SKILL.md, and AGENTS.md)

### Rule Format

Each rule should include:
- **Frontmatter** with metadata
- **❌ Incorrect examples** showing what not to do
- **✅ Correct examples** showing best practices
- **Explanations** of why each approach is better
- **Code examples** in both TypeScript and Python (when applicable)
- **References** to official documentation

## Build Scripts

The repository includes two scripts in `scripts/`:

### build-agents.cjs

Generates the consolidated AGENTS.md file:
- Parses SKILL.md for structure
- Reads all rule files
- Combines content with proper formatting
- Generates table of contents
- Adds impact badges and descriptions

### watch-agents.cjs

Watches for file changes and auto-rebuilds:
- Monitors SKILL.md and rules/ directory
- Triggers rebuild on any .md file change
- Shows real-time build status

## File Statistics

Current repository stats:
- **14+ rules** covering Tool Router and Triggers
- **150+ KB** of consolidated documentation
- **Both TypeScript and Python** examples throughout
- **Production-ready** patterns and best practices

## Key Features

### Tool Router Coverage
- Session management and lifecycle
- User isolation patterns
- Native tools vs MCP comparison
- Framework integration guides
- Connection management
- Authentication flows

### Triggers Coverage
- Creating trigger instances
- Real-time event subscription
- Webhook verification and security
- Trigger lifecycle management
- Production deployment patterns

## License

MIT

## Links

- [Composio Documentation](https://docs.composio.dev)
- [Tool Router API](https://docs.composio.dev/sdk/typescript/api/tool-router)
- [Triggers API](https://docs.composio.dev/sdk/typescript/api/triggers)
- [GitHub Repository](https://github.com/composiohq/skills)
