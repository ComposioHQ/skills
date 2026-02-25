---
title: Composio CLI Reference
impact: HIGH
description: Quick reference for Composio CLI commands - use help flags for detailed options
tags: [cli, composio, tools, toolkits, auth, connected-accounts, code-generation]
---

# Composio CLI Reference

Quick reference for Composio CLI commands. Use `composio <command> --help` to see detailed options for any command.

## When to Use CLI

- **Discovery & Exploration** - Quickly find available toolkits, tools, and triggers before writing code
- **Development & Testing** - Test connections, verify auth configs, and validate tool execution locally
- **Debugging** - Inspect connected accounts, check connection status, and troubleshoot auth issues
- **Quick Operations** - Link accounts, manage auth configs, and perform one-off tasks without writing code
- **CI/CD & Automation** - Script toolkit setup, connection verification, and project initialization
- **OpenClawd or CLI based Agents** - Use composio tools to extend agent capabilities to connect to applications

## Installation

```bash
# Install Composio CLI
curl -fsSL https://composio.dev/install | bash

# Verify installation
composio version
```

After installation, restart your terminal or source your shell config.

## Command Discovery

Use `--help` flag to discover commands and options:

```bash
# See all available commands
composio --help

# Get help for specific command group
composio login --help
composio toolkits --help
composio tools --help
composio connected-accounts --help
composio auth-configs --help
composio generate --help

# Get help for subcommands
composio toolkits list --help
composio tools search --help
composio connected-accounts link --help
```

## Quick Command Reference

### Authentication

- **`composio login`** - Authenticate with Composio account (opens browser or use `--no-browser`)
- **`composio logout`** - Log out from your account
- **`composio whoami`** - Display your account information and API key

### Toolkits

List all available toolkits within Composio, search by keywords, and view detailed information about specific toolkits.

- **`composio toolkits list`** - List all available toolkits with optional search filters
- **`composio toolkits info <slug>`** - Get detailed information about a specific toolkit and it's version
- **`composio toolkits search <query>`** - Search toolkits by keyword

Use `composio toolkits --help` for all available commands and options.

### Tools

List available tools across all toolkits, filter by toolkit or tags, search by keywords, and view tool schemas and parameters.

- **`composio tools list`** - List all available tools with optional filters (toolkit, tags, search)
- **`composio tools info <slug>`** - Get detailed information and schema for a specific tool
- **`composio tools search <query>`** - Search tools by keyword

Use `composio tools --help` for all available commands and options.

### Connected Accounts

Manage authentication connections for external services (Gmail, Slack, GitHub, etc.).

- **`composio connected-accounts list`** - List connected accounts with optional filters (toolkit, user-id, status)
- **`composio connected-accounts link`** - Create new connection via OAuth (requires auth-config ID)
- **`composio connected-accounts info <id>`** - Get details about a specific connected account
- **`composio connected-accounts delete <id>`** - Delete a connected account
- **`composio connected-accounts whoami`** - Show current connection information

Use `composio connected-accounts --help` for all available commands and options.

### Auth Configs

Manage authentication configurations that define how to authenticate with external services.

- **`composio auth-configs list`** - List authentication configurations with optional filters
- **`composio auth-configs create`** - Create new authentication configuration (interactive)
- **`composio auth-configs info <id>`** - Get details about a specific auth config
- **`composio auth-configs delete <id>`** - Delete an authentication configuration

Use `composio auth-configs --help` for all available commands and options.

### Code Generation

Generate TypeScript or Python type stubs for toolkits, tools, and triggers in your project.

- **`composio generate`** - Auto-detect language and generate type stubs
- **`composio ts generate`** - Generate TypeScript types
- **`composio py generate`** - Generate Python types

Common options: `--output-dir`, `--toolkits`, `--type-tools`

Use `composio generate --help` for all available options.

### Utility

- **`composio version`** - Show CLI version
- **`composio upgrade`** - Upgrade CLI to latest version

## Common Usage Patterns

### Initial Setup

```bash
composio login
composio whoami  # Verify authentication
```

### Discover Tools

```bash
# List toolkits
composio toolkits list

# Get toolkit details
composio toolkits info "gmail"

# search for specific toolkits
composio toolkits search "email"

# List tools in toolkit
composio tools list --toolkits "gmail"

# Get tool schema
composio tools info "GMAIL_SEND_EMAIL"
```

### Connect Account

```bash
# Find auth config
composio auth-configs list --toolkits "gmail"

# Link account
composio connected-accounts link --auth-config "ac_..." --user-id "user_123"

# Verify connection
composio connected-accounts list --status ACTIVE
```

### Generate Types

```bash
# Auto-detect project language
composio generate --toolkits gmail --toolkits slack

# Or explicitly specify
composio ts generate --toolkits gmail
composio py generate --toolkits gmail
```

## Tips

### JSON Output & jq Integration

**All commands output JSON to stdout** for agent-friendly, machine-readable responses. Pipe output to `jq` for processing:

```bash
# Get API key programmatically
composio whoami | jq -r '.apiKey'

# Extract toolkit slugs
composio toolkits list | jq -r '.[].slug'

# Get tool names from a toolkit
composio tools list --toolkits "gmail" | jq -r '.[].name'

# Filter active connections
composio connected-accounts list --status ACTIVE | jq -r '.[].id'

# Get connection details for specific toolkit
composio connected-accounts list --toolkits "gmail" | jq '.[] | {id, status, toolkit: .toolkit.slug}'

# Extract trigger configuration
composio triggers info "GMAIL_NEW_GMAIL_MESSAGE" | jq '.config'
```

**Why use jq:**
- Extract specific fields for automation scripts
- Transform JSON for different tools/workflows
- Build agent-friendly responses
- Chain with other CLI tools

### Other Tips

- **Filtering**: Use `--toolkits`, `--user-id`, `--status`, `--tags`, `--query` to filter results
- **User IDs**: Use `"default"` for testing, actual user IDs for production
- **Help is Your Friend**: Every command supports `--help` for detailed options

## Environment Variables

```bash
# Set API key (alternative to login)
export COMPOSIO_API_KEY="your_api_key"

# Set base URL (for self-hosted)
export COMPOSIO_BASE_URL="https://your-instance.com"

# Enable debug logging
export COMPOSIO_LOG_LEVEL="debug"
```

## Reference

For detailed API documentation, visit:
- [Composio CLI Documentation](https://docs.composio.dev/cli)
- [Composio Platform](https://platform.composio.dev)
