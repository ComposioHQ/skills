---
name: composio-tool-router
description: Build AI agents with Composio Tool Router - the fastest way to add tools to your agents
tags: [composio, tool-router, agents, mcp]
---

# Composio Tool Router

Comprehensive guide to building AI agents with Composio Tool Router - create isolated, secure tool sessions for your users with seamless authentication and toolkit management.

## When to use

Use this skill when:

- Building AI agents that need access to external tools (Gmail, Slack, GitHub, etc.)
- Creating multi-user applications with isolated tool access
- Implementing authentication flows for external services
- Managing toolkit connections and permissions
- Integrating with AI frameworks (Vercel AI SDK, LangChain, OpenAI Agents, Claude)
- Using MCP (Model Context Protocol) for tool discovery
- Building UI for connection management

## Core Concepts

**Tool Router** creates isolated MCP sessions for users with scoped access to toolkits and tools. It handles:
- Session-based isolation per user
- Dynamic toolkit and tool configuration
- Automatic authentication management
- MCP-compatible server URLs for any AI framework
- Connection state querying for UI building

## Rules

### 1. Building Agents with Tool Router

Essential patterns for creating agent sessions and configuring tools:

- [User ID Best Practices](rules/tr-userid-best-practices.md) - Choose user IDs for security and isolation
- [Creating Basic Sessions](rules/tr-session-basic.md) - Initialize Tool Router sessions
- [Session Lifecycle Best Practices](rules/tr-session-lifecycle.md) - When to create new sessions vs reuse
- [Session Configuration](rules/tr-session-config.md) - Configure toolkits, tools, and filters
- [Using Native Tools](rules/tr-mcp-vs-native.md) - Prefer native tools for performance and control
- [Framework Integration](rules/tr-framework-integration.md) - Connect with Vercel AI, LangChain, OpenAI Agents

### 2. Authenticating Users

Authentication patterns for seamless user experiences:

- [Auto Authentication in Chat](rules/tr-auth-auto.md) - Enable in-chat authentication flows
- [Manual Authorization](rules/tr-auth-manual.md) - Use session.authorize() for explicit flows
- [Connection Management](rules/tr-auth-connections.md) - Configure manageConnections options
- [Wait for Connections](rules/tr-auth-wait.md) - Block until authentication completes
- [Custom Callback URLs](rules/tr-auth-callbacks.md) - Handle OAuth redirects

### 3. Fetching Toolkits and Connection Status

Build connection UIs and check toolkit states:

- [Query Toolkit States](rules/tr-toolkit-query.md) - Use session.toolkits() to check connections
- [Build Connection UI](rules/tr-toolkit-ui.md) - Display connection status and auth buttons
- [Filter Toolkits](rules/tr-toolkit-filter.md) - Query specific toolkits
- [Pagination](rules/tr-toolkit-pagination.md) - Handle large toolkit lists
- [Connection Details](rules/tr-toolkit-details.md) - Access auth configs and account info

### Advanced (Coming Soon)

- Session modifiers and middleware
- Custom tool configuration
- Workbench integration
- Experimental features

## Quick Start

```typescript
import { Composio } from '@composio/core';

// Create a session with Gmail tools
const composio = new Composio();
const session = await composio.create('user_123', {
  toolkits: ['gmail'],
  manageConnections: true
});

// Use with any MCP-compatible framework
console.log('MCP URL:', session.mcp.url);
```

### 4. Advanced Features (Triggers & Events)

Real-time event handling and webhook integration patterns:

- [Creating Triggers](rules/triggers-create.md) - Set up trigger instances for real-time events
- [Subscribing to Events](rules/triggers-subscribe.md) - Listen to trigger events in real-time
- [Webhook Verification](rules/triggers-webhook.md) - Verify and process incoming webhook payloads
- [Managing Triggers](rules/triggers-manage.md) - Enable, disable, update, and list triggers

## References

- [Tool Router Docs](https://docs.composio.dev/sdk/typescript/api/tool-router)
- [Triggers API](https://docs.composio.dev/sdk/typescript/api/triggers)
- [Webhook Verification](https://docs.composio.dev/sdk/typescript/advanced/webhook-verification)
- [MCP Protocol](https://modelcontextprotocol.io)
- [TypeScript Examples](https://github.com/composiohq/composio/tree/main/ts/examples/tool-router)
