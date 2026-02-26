---
name: composio
description: Build AI agents and apps with Composio - access 200+ external tools with Tool Router or direct execution
tags: [composio, tool-router, agents, mcp, tools, api, automation]
---


## When to use
Use this skill when:
- Building chat-based or autonomous agents that need access to external apps (Gmail, Slack, GitHub, etc.)
- Creating multi-user applications which integrates to external apps
- Building personal automations that connect with user's account in differnt apps
- Integrating with AI frameworks (Vercel AI SDK, LangChain, OpenAI Agents, Claude)
- Using MCP (Model Context Protocol) for dynamic tool discovery
- Building event-driven agents with triggers

## Getting Started

1. Check if `composio` cli exists, if not install it using the below command
```bash
curl -fsSL https://composio.dev/install | bash
```
Once installed make sure the command is available, srouce the new config or restart the terminal to start using the command.

2. If the user is using the composio cli for the first time, ask the user to login to their account via
```bash
composio login
```

3. If the current project you are working on does not have composio API key in the env as `COMPOSIO_API_KEY`. Execute the below command to initalize the current project. 
```bash
# -y uses the default project, to change the project ask the user to execute `composio init` to pick or create project
composio init -y
```
Or, users can manually login to the composio dashboard at `https://platform.composio.dev` to obtain the API keys. [Read more about API Keys](rules/setup-api-keys.md).

> 📖 **CLI Reference:** For a comprehensive guide to all Composio CLI commands including toolkit management, connected accounts, auth configs, and code generation, see [Composio CLI Reference](rules/composio-cli.md).

## Installing required dependencies

Always install the latest version of composio SDKs to get started with using composio.

For Typescript projects
```bash
pnpm install @composio/core@latest
```
If the project requires using Agentic features and libraries, install the additional provider packages.
**Agentic frameworks**
- `@composio/vercel` for working with Vercel AI SDK (recommended)
- `@composio/openai-agents` for working with OpenAI Agents
- `@composio/langchain` for working with LangChain
- `@composio/mastra` for working with Mastra
- `@composio/claude-agent-sdk` for working with Claude Agent SDK
**Non agentic frameworks**
- `@composio/openai` for working with OpenAI (chat completion and responses APIs)
- `@composio/anthropic` for working with Anthropic
- `@composio/llamaindex` for working with LlamaIndex
- `@composio/google` for working with Google AI / Gemini APIs
- `@composio/cloudflare` for working with Cloudflare Workers AI

For Python projects
```bash
pip install composio
```
**Agentic frameworks**
- `composio-openai-agents` for working with OpenAI Agents
- `composio-langchain` for working with LangChain
- `composio-langgraph` for working with LangGraph
- `composio-crewai` for working with CrewAI
- `composio-claude-agent-sdk` for working with Claude Agent SDK
- `composio-google-adk` for working with Google ADK
**Non agentic frameworks**
- `composio-openai` for working with OpenAI
- `composio-anthropic` for working with Anthropic
- `composio-llamaindex` for working with LlamaIndex
- `composio-autogen` for working with AutoGen
- `composio-gemini` for working with Google Gemini
- `composio-google` for working with Google AI

To use the provider packages, pass them into the constructor when initialization of Composio.
```typescript
import { Composio } from '@composio/core'
import { VercelProvider } from '@composio/vercel'

const composio = new Composio({
  provider: new VercelProvider();
})
```
```python
from composio import Composio
from composio_langchain import LangchainProvider

composio = Composio(provider=LangchainProvider())
```


## ⚠️ Critical: Always Verify Slugs Before Use

**NEVER make up or guess toolkit, tool, or trigger names.** Always verify slugs using the CLI or SDK before writing code:

### Discovery Methods

**Using CLI (Recommended for quick discovery):**
```bash
# Discover and view toolkit details make sure the CLI installed
composio toolkits list
composio toolkits info "gmail"

# Discover and view tool schemas
composio tools list --toolkits "gmail"
composio tools info "GMAIL_SEND_EMAIL"

# Discover and view trigger schemas
composio triggers list
composio triggers info "GMAIL_NEW_GMAIL_MESSAGE"
```

**Using SDK (For programmatic discovery):**
```typescript
// Discover toolkits
const toolkits = await composio.toolkits.get();

// Discover tools
const tools = await composio.tools.get('default', { toolkits: ['gmail'] });

// Discover triggers
const triggers = await composio.triggers.list({ toolkit: 'gmail' });
```

**Why this matters:**
- Using incorrect slugs causes runtime errors
- Tool/trigger schemas and names change between versions
- SDK/CLI provide accurate, up-to-date information

📖 **See [Composio CLI Reference](rules/composio-cli.md) for all discovery commands.**

### 1. Using the CLI
The Composio CLI will help you discover and execute availble toolkits(apps)/tools(actions) composio offers to build apps/agents with. To get the raw response from the CLI, pipe the results to `jq`

```bash
# explore all the commands available to list and view details of tools
composio tools --help

**Important** Before writing code to use any tools or toolkits using composio, verify it exists using the following commands
```bash
# find all the toolkits composio offers
composio toolkits list --limit 20 | jq
# find versions of a toolkit
composio toolkits info "gmail" | jq
# find all the tools within gmail toolkit
composio tools list --toolkits "gmail" --limit 100 | jq
# get details of a tool, it's input and it's output
composio tools info "GMAIL_SEND_EMAIL" | jq
```

### 1. Building Agents

Use Composio to build interactive chat-based agents or autonomous long-running task agents. Tool Router creates isolated MCP sessions for users with scoped access to toolkits and tools.

**Key Features:**
- Session-based isolation per user
- Dynamic toolkit and tool configuration
- Automatic authentication management
- MCP-compatible server URLs for any AI framework
- Connection state querying for UI building
- Real-time event handling with triggers

#### 1.1 Session Management & Configuration

Essential patterns for creating agent sessions and configuring tools:

- [User ID Best Practices](rules/tr-userid-best-practices.md) - Choose user IDs for security and isolation
- [Creating Basic Sessions](rules/tr-session-basic.md) - Initialize Tool Router sessions
- [Session Lifecycle Best Practices](rules/tr-session-lifecycle.md) - When to create new sessions vs reuse
- [Session Configuration](rules/tr-session-config.md) - Configure toolkits, tools, and filters
- [Using Native Tools](rules/tr-mcp-vs-native.md) - Prefer native tools for performance and control
- [Framework Integration](rules/tr-framework-integration.md) - Connect with Vercel AI, LangChain, OpenAI Agents

#### 1.2 Authentication Flows

Authentication patterns for seamless user experiences:

- [Auto Authentication in Chat](rules/tr-auth-auto.md) - Enable in-chat authentication flows
- [Manual Authorization](rules/tr-auth-manual.md) - Use session.authorize() for explicit flows
- [Connection Management](rules/tr-auth-connections.md) - Configure manageConnections, waitForConnections, and custom callback URLs

#### 1.3 Toolkit Querying & UI Building

Build connection UIs and check toolkit states:

- [Building Chat UIs](rules/tr-building-chat-ui.md) - Build chat applications with toolkit selection, connection management, and session handling
- [Query Toolkit States](rules/tr-toolkit-query.md) - Use session.toolkits() to check connections, filter toolkits, and build connection UIs

#### 1.4 Framework-Specific Guides

**When to use:** Use these guides when you're certain about the framework the user is working with, or when the user explicitly mentions the framework name.

Detailed integration guides for specific AI frameworks:

- [Vercel AI SDK Integration](rules/tr-framework-ai-sdk.md) - Complete guide for Vercel AI SDK with native tools, MCP, and React
- [Mastra Integration](rules/tr-framework-mastra.md) - Complete guide for Mastra agents with native tools and MCP

> **Note:** For general framework integration patterns (LangChain, OpenAI Agents), see [Framework Integration](rules/tr-framework-integration.md). Use framework-specific guides only when the framework is explicitly mentioned or clearly identified.

#### 1.5 Event-Driven Agents (Triggers)

Real-time event handling and webhook integration patterns:

- [Creating Triggers](rules/triggers-create.md) - Set up trigger instances for real-time events
- [Subscribing to Events](rules/triggers-subscribe.md) - Listen to trigger events in real-time
- [Webhook Verification](rules/triggers-webhook.md) - Verify and process incoming webhook payloads
- [Managing Triggers](rules/triggers-manage.md) - Enable, disable, update, and list triggers

### 2. Building Apps with Composio Tools

Use Composio to build applications where tools are executed manually without agent frameworks. This approach gives you full control over tool execution, authentication, and resource management.

**Key Capabilities:**
- Direct tool execution with manual control
- CRUD operations on connected accounts, auth configs, and toolkits
- Custom tool creation with authentication
- Session isolation for multi-tenant apps
- Pre/post-execution hooks and modifiers
- Event-driven workflows with triggers

#### 2.1 Core Operations

Fundamental patterns for fetching and executing tools:

- [Fetching Tools](rules/app-fetch-tools.md) - Get tools with filters and search
- [Direct Tool Execution](rules/app-execute-tools.md) - Execute tools manually with parameters
- [Tool Version Management](rules/app-tool-versions.md) - Version pinning strategies for stability

#### 2.2 Resource Management (CRUD Patterns)

Manage authentication and connections programmatically:

- [Connected Accounts CRUD](rules/app-connected-accounts.md) - Create, read, update, delete connected accounts
- [Auth Config Management](rules/app-auth-configs.md) - Manage authentication configurations
- [Toolkit Management](rules/app-toolkits.md) - Query toolkits, categories, and auth requirements

#### 2.3 Extensibility & Customization

Extend Composio with custom tools and behavior:

- [Creating Custom Tools](rules/app-custom-tools.md) - Build standalone and toolkit-based tools
- [Tool Modifiers](rules/app-modifiers.md) - Schema modification and execution hooks

#### 2.4 Event-Driven Applications

Build reactive applications with triggers (shared with agents):

- [Creating Triggers](rules/triggers-create.md) - Set up trigger instances for real-time events
- [Subscribing to Events](rules/triggers-subscribe.md) - Listen to trigger events in real-time
- [Webhook Verification](rules/triggers-webhook.md) - Verify and process incoming webhooks
- [Managing Triggers](rules/triggers-manage.md) - Enable, disable, update, and list triggers

#### 2.5 User Context & Multi-Tenancy

Manage user context and multi-tenant isolation:

- [User ID Patterns](rules/app-user-context.md) - User vs organization IDs, shared vs isolated connections

## References
**Shared:**
- [Triggers API](https://docs.composio.dev/sdk/typescript/api/triggers)
- [Webhook Verification](https://docs.composio.dev/sdk/typescript/advanced/webhook-verification)
