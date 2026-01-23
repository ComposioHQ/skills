# Contributing to Composio Skills

Thanks for contributing! This is kept intentionally simple.

## Adding a Rule

1. Create a new `.md` file in `skills/composio/rules/`
2. Follow the naming: `{prefix}-{descriptive-name}.md`
3. Use the structure below

## Rule Template

```markdown
---
title: Clear, Action-Oriented Title
impact: CRITICAL | HIGH | MEDIUM | LOW
description: One sentence describing the impact
tags: [relevant, tags]
---

# Rule Title

1-2 sentences explaining why this matters.

## ❌ Incorrect

\`\`\`typescript
// Show the wrong way with explanatory comments
const bad = 'example';
\`\`\`

\`\`\`python
# Show the wrong way with explanatory comments
bad = "example"
\`\`\`

## ✅ Correct

\`\`\`typescript
// Show the right way with explanatory comments
const good = 'example';
\`\`\`

\`\`\`python
# Show the right way with explanatory comments
good = "example"
\`\`\`

## Reference

- [Relevant docs](https://docs.composio.dev)
```

## Guidelines

- **One rule per file**: Keep it focused
- **Real examples**: Use actual code, not pseudocode
- **Both languages**: Include TypeScript and Python examples
- **Explain why**: Use comments to explain reasoning
- **Be actionable**: Developers should know exactly what to do

## Impact Levels

- **CRITICAL**: Security, data loss, breaking bugs
- **HIGH**: Major performance or UX issues
- **MEDIUM**: Maintainability, code quality
- **LOW**: Style, minor optimizations

## Prefixes

- `auth-` - Authentication & Security
- `exec-` - Tool Execution
- `conn-` - Connected Accounts
- `custom-` - Custom Tools
- `provider-` - Provider Integration
- `error-` - Error Handling
- `perf-` - Performance
- `dev-` - Development

That's it! Keep it simple.
