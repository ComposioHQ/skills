---
title: Composio CLI Guide
impact: HIGH
description: Use the Composio CLI to take actions on external apps directly - no code needed
tags: [cli, composio, tools, toolkits, auth, connected-accounts, direct-use]
---

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
