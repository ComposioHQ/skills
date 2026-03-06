---
name: composio
description: Use 1000+ external apps via Composio - either directly through the CLI or by building AI agents and apps with the SDK
tags: [composio, tool-router, agents, mcp, tools, api, automation, cli]
---

# composio

Use 1000+ external apps via Composio - either directly through the CLI or by building AI agents and apps with the SDK

## When to Apply
- User wants to access or interact with external apps (Gmail, Slack, GitHub, Notion, etc.)
- User wants to automate a task using an external service (send email, create issue, post message)
- Building an AI agent or app that integrates with external tools
- Multi-user apps that need per-user connections to external services

## Table of Contents

1. [Use Apps via Composio CLI](#use-apps-via-composio-cli)
   1.1. [Composio CLI Guide](#composio-cli-guide)

2. [Building Apps and Agents with Composio](#building-apps-and-agents-with-composio)
   2.1. [Building with Composio](#building-with-composio)

---

## 1. Use Apps via Composio CLI

<a name="use-apps-via-composio-cli"></a>

### 1.1. Composio CLI Guide

<a name="composio-cli-guide"></a>

**Impact:** 🟠 HIGH

> Use the Composio CLI to take actions on external apps directly - no code needed

# Composio CLI Guide

Use the Composio CLI to search, connect, and execute tools directly — no code writing required. Ideal for agents taking actions on behalf of the user.

## Primary Workflow: search → link → execute

### Step 1 — Find the right tool

```bash
composio search "send an email"
composio search "create github issue"
composio search "post slack message"
```

The search results include connection status, so you can see immediately if the user is already connected to the required app.

### Step 2 — Connect an account (if needed)

If the user is not connected to the app, link their account:

```bash
composio link gmail
composio link github
composio link slack
```

This opens an OAuth flow or prompts for credentials. Only needed once per app.

### Step 3 — Execute the tool

```bash
composio execute GMAIL_SEND_EMAIL --data '{"recipient_email":"you@example.com","subject":"Hello","body":"Test"}'
composio execute GITHUB_CREATE_AN_ISSUE --data '{"owner":"acme","repo":"my-repo","title":"Bug report"}'
```

To see a tool's input parameters before executing:
```bash
composio execute GMAIL_SEND_EMAIL --help
```

### Step 4 — Listen for events (optional)

```bash
composio listen
```

Streams real-time trigger events to the terminal.

---

## Tips for Agents

- **All commands output JSON** — pipe to `jq` for filtering and extraction
- **Parallel execution** — use `&` and `wait` or shell scripts for complex multi-step tasks
- The default user context is the project's `test_user_id`. Pass `--user-id <id>` to act on behalf of a specific user.

```bash
composio execute GMAIL_SEND_EMAIL --user-id "user_123" --data '{"recipient_email":"them@example.com","subject":"Hi"}'
```

---

## Advanced Commands

### Discover Tools (when search isn't enough)

```bash
# List all toolkits
composio toolkits list

# Get details about a specific toolkit
composio toolkits info "gmail"

# List tools in a toolkit
composio tools list --toolkits "gmail"

# Get a tool's full schema
composio tools info "GMAIL_SEND_EMAIL"
```

### Connected Accounts

```bash
# List active connections
composio connected-accounts list --status ACTIVE

# Link an account (full form with options)
composio connected-accounts link --auth-config "ac_..." --user-id "user_123"

# Delete a connection
composio connected-accounts delete <id>
```

### Auth Configs

> Only needed when building apps with custom OAuth credentials. For personal use and agents, `composio link` handles this automatically.

```bash
composio auth-configs list --toolkits "gmail"
composio auth-configs create
composio auth-configs info <id>
composio auth-configs delete <id>
```

### Triggers

```bash
# List available trigger types
composio triggers list
composio triggers info "GMAIL_NEW_GMAIL_MESSAGE"

# Manage trigger instances
composio triggers create <trigger-name>
composio triggers enable <id>
composio triggers disable <id>
composio triggers status
```

### Debugging & Logs

```bash
# View recent tool executions
composio logs tools

# Get detailed logs for a specific execution
composio logs tools "log_abc123"

# Monitor trigger events
composio logs triggers
```
---

## jq Examples

```bash
# Extract toolkit slugs
composio toolkits list | jq -r '.[].slug'

# Get tool names from a toolkit
composio tools list --toolkits "gmail" | jq -r '.[].name'

# Filter active connections
composio connected-accounts list --status ACTIVE | jq -r '.[].id'
```

---

## Environment Variables

```bash
export COMPOSIO_API_KEY="your_api_key"      # alternative to composio login
export COMPOSIO_BASE_URL="https://..."       # for self-hosted instances
export COMPOSIO_LOG_LEVEL="debug"            # enable debug logging
```

---

## Command Help

Every command supports `--help` for detailed options:

```bash
composio --help
composio search --help
composio execute --help
composio link --help
composio listen --help
composio tools --help
composio toolkits --help
composio triggers --help
```

---

## 2. Building Apps and Agents with Composio

<a name="building-apps-and-agents-with-composio"></a>

### 2.1. Building with Composio

<a name="building-with-composio"></a>

**Impact:** 🟠 HIGH

> SDK-based guide for building AI agents and applications that integrate with external tools via Composio

# Building Apps and Agents with Composio

Use the Composio SDK to build AI agents, chat apps, and backend services that integrate with 200+ external tools.

## Project Setup

Run inside your project directory to initialize and store the API key:
```bash
composio init
```

## Install the SDK

**TypeScript**
```bash
pnpm install @composio/core@latest
```

Provider packages for agentic frameworks:
- `@composio/vercel` — Vercel AI SDK
- `@composio/openai-agents` — OpenAI Agents
- `@composio/langchain` — LangChain
- `@composio/mastra` — Mastra
- `@composio/claude-agent-sdk` — Claude Agent SDK

**Python**
```bash
pip install composio
```

Provider packages for agentic frameworks:
- `composio-openai-agents` — OpenAI Agents
- `composio-langchain` — LangChain
- `composio-langgraph` — LangGraph
- `composio-crewai` — CrewAI
- `composio-claude-agent-sdk` — Claude Agent SDK
- `composio-google-adk` — Google ADK

Pass the provider into the Composio constructor:
```typescript
import { Composio } from '@composio/core'
import { VercelProvider } from '@composio/vercel'

const composio = new Composio({ provider: new VercelProvider() })
```
```python
from composio import Composio
from composio_langchain import LangchainProvider

composio = Composio(provider=LangchainProvider())
```

---

## Building Agents

Use Tool Router to create isolated MCP sessions per user with scoped tool access and automatic auth management. Compatible with any AI framework.

### Session Management
- [User ID Best Practices](tr-userid-best-practices.md) — choose user IDs for security and isolation
- [Creating Basic Sessions](tr-session-basic.md) — initialize Tool Router sessions
- [Session Lifecycle](tr-session-lifecycle.md) — when to create vs reuse sessions
- [Session Configuration](tr-session-config.md) — configure toolkits, tools, and filters
- [Using Native Tools](tr-mcp-vs-native.md) — prefer native tools for performance and control

### Authentication Flows
- [Auto Authentication in Chat](tr-auth-auto.md) — enable in-chat auth flows
- [Manual Authorization](tr-auth-manual.md) — use `session.authorize()` for explicit flows
- [Connection Management](tr-auth-connections.md) — configure `manageConnections`, `waitForConnections`, and callback URLs

### Toolkit Querying & UI Building
- [Building Chat UIs](tr-building-chat-ui.md) — toolkit selection, connection management, and session handling
- [Query Toolkit States](tr-toolkit-query.md) — use `session.toolkits()` to check connections and build connection UIs

### Framework Integrations
- [Framework Integration](tr-framework-integration.md) — LangChain, OpenAI Agents, general patterns
- [Vercel AI SDK](tr-framework-ai-sdk.md) — native tools, MCP, and React
- [Mastra](tr-framework-mastra.md) — Mastra agents with native tools and MCP

### Event-Driven Agents (Triggers)
- [Creating Triggers](triggers-create.md) — set up trigger instances for real-time events
- [Subscribing to Events](triggers-subscribe.md) — listen to trigger events in real-time
- [Webhook Verification](triggers-webhook.md) — verify and process incoming webhook payloads
- [Managing Triggers](triggers-manage.md) — enable, disable, update, and list triggers

---

## Building Apps

Direct tool execution without agent frameworks — full control over auth, execution, and resource management. If building apps with agentic abilities, make sure the auth configs match the session's auth configs.

### Core Operations
- [Fetching Tools](app-fetch-tools.md) — get tools with filters and search
- [Direct Tool Execution](app-execute-tools.md) — execute tools manually with parameters
- [Tool Version Management](app-tool-versions.md) — version pinning strategies for stability

### Resource Management
- [Connected Accounts CRUD](app-connected-accounts.md) — create, read, update, delete connected accounts
- [Auth Config Management](app-auth-configs.md) — manage authentication configurations
- [Toolkit Management](app-toolkits.md) — query toolkits, categories, and auth requirements
- [Auth Popup UI](app-auth-popup-ui.md) — build popup-based OAuth flows

### Extensibility
- [Tool Modifiers](app-modifiers.md) — schema modification and execution hooks for logging and modifications

### User Context & Multi-Tenancy
- [User ID Patterns](app-user-context.md) — user vs organization IDs, shared vs isolated connections

### Event-Driven Applications
- [Creating Triggers](triggers-create.md) — set up trigger instances
- [Subscribing to Events](triggers-subscribe.md) — listen to events in real-time
- [Webhook Verification](triggers-webhook.md) — verify incoming webhooks
- [Managing Triggers](triggers-manage.md) — enable, disable, update triggers

---

## Verify Tool Slugs Before Use

Never guess toolkit, tool, or trigger names. Always verify:

```bash
composio search "send email"
composio tools info "GMAIL_SEND_EMAIL"
composio toolkits info "gmail"
```

Using incorrect slugs causes runtime errors.

---


---

_This file was automatically generated from individual rule files on 2026-03-06T04:15:36.818Z_
_To update, run: `npm run build:agents`_
