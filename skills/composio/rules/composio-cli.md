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
- **Debugging & Monitoring** - View tool execution logs, inspect trigger events, and troubleshoot failures
- **Quick Operations** - Link accounts, manage auth configs, and perform one-off tasks without writing code
- **Code Generation** - Generate TypeScript/Python type stubs for better IDE support and type safety
- **CI/CD & Automation** - Script toolkit setup, connection verification, and project initialization
- **Agent Integration** - Use CLI tools to extend agent capabilities and connect to external applications

## Installation

```bash
# Install Composio CLI
curl -fsSL https://composio.dev/install | bash

# Verify installation
composio version
```

After installation, restart your terminal or source your shell config.

## Usage within a project
To use composio CLI within an existing project initialize the project for the CLI.
This command will store the API keys in `.env.local`
```bash
# interactive mode
composio init

# Pick the default project and settings
composio init -y
```

## Command Discovery

Use `--help` flag to discover commands and options:

```bash
# See all available commands
composio --help

# Get help for specific command group
composio login --help
composio init --help
composio toolkits --help
composio tools --help
composio triggers --help
composio logs --help
composio connected-accounts --help
composio auth-configs --help
composio generate --help

# Get help for subcommands
composio toolkits list --help
composio tools search --help
composio tools execute --help
composio connected-accounts link --help
composio triggers listen --help
```

## Quick Command Reference

### Authentication

- **`composio login`** - Authenticate with Composio account (opens browser or use `--no-browser`)
- **`composio logout`** - Log out from your account
- **`composio whoami`** - Display your account information and API key

### Project Setup

- **`composio init`** - Initialize a Composio project in the current directory

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
- **`composio tools search <query>`** - Search tools by use case.
- **`composio tools execute <slug>`** - Execute a tool by slug with JSON arguments

Use `composio tools --help` for all available commands and options.

### Connected Accounts

Manage authentication connections for external services (Gmail, Slack, GitHub, etc.).

- **`composio connected-accounts list`** - List connected accounts with optional filters (toolkit, user-id, status)
- **`composio connected-accounts link [toolkit]`** - Create new connection for a user for an app
- **`composio connected-accounts info <id>`** - Get details about a specific connected account
- **`composio connected-accounts delete <id>`** - Delete a connected account
- **`composio connected-accounts whoami`** - Show current connection information

Use `composio connected-accounts --help` for all available commands and options.

### Auth Configs
> **Important** In most cases you might not need to do this unless you are building apps which are non-agentic. For agentic apps, only use `session.toolkits()` and `session.authorize()` which will automatically create auth configs for you.

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

### Debugging & Logs

Monitor and debug tool and trigger executions with detailed logs.

- **`composio logs tools`** - List recent tool execution logs with status and timestamps
- **`composio logs tools <log_id>`** - View detailed logs for a specific tool execution (parameters, response, errors)
- **`composio logs triggers`** - List recent trigger event logs with payload and delivery status

Use `composio logs --help` for all available commands and filtering options.

### Triggers

Inspect, create, and manage trigger subscriptions for real-time events.

- **`composio triggers list`** - List available trigger types
- **`composio triggers info <slug>`** - View details for a specific trigger type
- **`composio triggers listen`** - Listen to realtime trigger events
- **`composio triggers status`** - Show active trigger instances with filters
- **`composio triggers create <trigger-name>`** - Create a trigger instance
- **`composio triggers enable <id>`** - Enable a trigger instance
- **`composio triggers disable <id>`** - Disable a trigger instance
- **`composio triggers delete <id>`** - Delete a trigger instance

Use `composio triggers --help` for all available commands and options.

### Utility

- **`composio version`** - Show CLI version
- **`composio upgrade`** - Upgrade CLI to latest version

## Common Usage Patterns

### Initial Setup

```bash
composio login
composio whoami  # Verify authentication
composio init # inside the project directory to retrieve project level API key
```

### Usage pattern for direct tool usage
- For usecases where you need directly execute the tool from CLI and not for building apps, use the CLI directly.
- For answering user's question. First search the tools required for the usecase using `composio tools search "use case"`. This response will also include the connection status. If not availble you can use `composio toolkits list --toolkits "..."` or `composio toolkits info` command to see if the user is connected.
- If user is not authenticated, authenticate toolkits using `composio connected-accounts link "github"`. You need to do it only if the user does not have active connection.
- If you need to identify a tool's input parameters, use `composio tools info "GMAIL_SEND_EMAIL"`.
- Once you have identified and authenticated the tools, you can proceed to executing the tool using `composio tools execute` command. 
- For complex tasks, you can execute the commands in parallel using `&` and `wait` or write quick bash scripts to execute composio commands directly.

### Discover Tools

```bash
# List toolkits
composio toolkits list

# Get toolkit details
composio toolkits info "gmail"

# search for specific toolkit
composio toolkits list --query "email"
# or
composio toolkits search "email"

# List tools in toolkit
composio tools list --toolkits "gmail"

# Get tool schema
composio tools info "GMAIL_SEND_EMAIL"

# Execute a tool directly
composio tools execute "GMAIL_SEND_EMAIL" --help # to see tool schema 
composio tools execute "GMAIL_SEND_EMAIL" --data '{"to":"you@example.com","subject":"Test"}'
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

### Debug Tool Execution

```bash
# View recent tool executions
composio logs tools

# Get detailed logs for specific execution
composio logs tools "log_abc123"

# Monitor trigger events
composio logs triggers

# List trigger types
composio triggers list

# Show active trigger instances
composio triggers status
```

## Tips

### User Context for Action Commands

For action-oriented commands (for example `tools execute`, `connected-accounts link`, and `triggers create`), the CLI uses your project's `test_user_id` by default if `--user-id` is not provided.

Use this default for local testing only. If you want to take action on behalf of a specific user in your system, always pass that user's ID explicitly with `--user-id`.

```bash
# Uses project test_user_id implicitly
composio tools execute "GMAIL_SEND_EMAIL" --data '{"to":"you@example.com","subject":"Test"}'

# Uses an explicit application user ID
composio tools execute "GMAIL_SEND_EMAIL" --user-id "user_123" --data '{"to":"you@example.com","subject":"Test"}'
```

### JSON Output & jq Integration

**All commands output JSON to stdout** for agent-friendly, machine-readable responses. Pipe output to `jq` for processing:

```bash
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
