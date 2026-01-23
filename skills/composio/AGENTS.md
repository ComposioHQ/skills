---
name: composio-tool-router
description: Build AI agents with Composio Tool Router - the fastest way to add tools to your agents
tags: [composio, tool-router, agents, mcp]
---

# composio-tool-router

Build AI agents with Composio Tool Router - the fastest way to add tools to your agents

## Table of Contents

1. [Building Agents with Tool Router](#building-agents-with-tool-router)
   1.1. [User ID Best Practices](#user-id-best-practices)
   1.2. [Creating Basic Sessions](#creating-basic-sessions)
   1.3. [Session Lifecycle Best Practices](#session-lifecycle-best-practices)
   1.4. [Session Configuration](#session-configuration)
   1.5. [Using Native Tools](#using-native-tools)
   1.6. [Framework Integration](#framework-integration)

2. [Authenticating Users](#authenticating-users)
   2.1. [Auto Authentication in Chat](#auto-authentication-in-chat)
   2.2. [Manual Authorization](#manual-authorization)
   2.3. [Connection Management](#connection-management)
   2.4. [Wait for Connections](#wait-for-connections)
   2.5. [Custom Callback URLs](#custom-callback-urls)

3. [Fetching Toolkits and Connection Status](#fetching-toolkits-and-connection-status)
   3.1. [Query Toolkit States](#query-toolkit-states)
   3.2. [Build Connection UI](#build-connection-ui)
   3.3. [Filter Toolkits](#filter-toolkits)
   3.4. [Pagination](#pagination)
   3.5. [Connection Details](#connection-details)

4. [Advanced Features (Triggers & Events)](#advanced-features-triggers-events)
   4.1. [Creating Triggers](#creating-triggers)
   4.2. [Subscribing to Events](#subscribing-to-events)
   4.3. [Webhook Verification](#webhook-verification)
   4.4. [Managing Triggers](#managing-triggers)

---

## 1. Building Agents with Tool Router

<a name="building-agents-with-tool-router"></a>

### 1.1. User ID Best Practices

<a name="user-id-best-practices"></a>

**Impact:** 🔴 CRITICAL

> Use proper user IDs to ensure data isolation, security, and correct session management

# Choose User IDs Carefully for Security and Isolation

User IDs are the **foundation of Tool Router isolation**. They determine which user's connections, data, and permissions are used for tool execution. Choose them carefully to ensure security and proper data isolation.

## ❌ Incorrect

```typescript
// DON'T: Use 'default' in production multi-user apps
async function handleUserRequest(req: Request) {
  const session = await composio.create('default', {
    toolkits: ['gmail', 'slack']
  });

  // ❌ All users share the same session
  // ❌ No data isolation
  // ❌ Security nightmare
  // ❌ User A can access User B's emails!
}
```

```python
# DON'T: Use 'default' in production multi-user apps
async def handle_user_request(req):
    session = composio.tool_router.create(
        user_id="default",
        toolkits=["gmail", "slack"]
    )

    # ❌ All users share the same session
    # ❌ No data isolation
    # ❌ Security nightmare
    # ❌ User A can access User B's emails!
```

```typescript
// DON'T: Use email addresses as user IDs
async function handleUserRequest(req: Request) {
  const session = await composio.create(req.user.email, {
    toolkits: ['github']
  });

  // ❌ Emails can change
  // ❌ Breaks session continuity
  // ❌ Historical data loss
}
```

## ✅ Correct - Use Database User IDs

```typescript
// DO: Use your database user ID (UUID, primary key, etc.)
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

const composio = new Composio({
  provider: new VercelProvider()
});

async function handleUserRequest(req: Request) {
  // Get user ID from your auth system
  const userId = req.user.id; // e.g., "550e8400-e29b-41d4-a716-446655440000"

  // Create isolated session for this user
  const session = await composio.create(userId, {
    toolkits: ['gmail', 'slack']
  });

  const tools = await session.tools();

  // ✅ Each user gets their own session
  // ✅ Complete data isolation
  // ✅ User A cannot access User B's data
  // ✅ Connections tied to correct user
  return await agent.run(req.message, tools);
}
```

```python
# DO: Use your database user ID (UUID, primary key, etc.)
from composio import Composio
from composio_openai import OpenAIProvider

composio = Composio(provider=OpenAIProvider())

async def handle_user_request(req):
    # Get user ID from your auth system
    user_id = req.user.id  # e.g., "550e8400-e29b-41d4-a716-446655440000"

    # Create isolated session for this user
    session = composio.tool_router.create(
        user_id=user_id,
        toolkits=["gmail", "slack"]
    )

    tools = session.tools()

    # ✅ Each user gets their own session
    # ✅ Complete data isolation
    # ✅ User A cannot access User B's data
    # ✅ Connections tied to correct user
    return await agent.run(req.message, tools)
```

## ✅ Correct - Use Auth Provider IDs

```typescript
// DO: Use IDs from your auth provider
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

const composio = new Composio({
  provider: new VercelProvider()
});

async function handleClerkUser(userId: string) {
  // Using Clerk user ID
  // e.g., "user_2abc123def456"
  const session = await composio.create(userId, {
    toolkits: ['github']
  });

  return session;
}

async function handleAuth0User(userId: string) {
  // Using Auth0 user ID
  // e.g., "auth0|507f1f77bcf86cd799439011"
  const session = await composio.create(userId, {
    toolkits: ['gmail']
  });

  return session;
}

async function handleSupabaseUser(userId: string) {
  // Using Supabase user UUID
  // e.g., "d7f8b0c1-1234-5678-9abc-def012345678"
  const session = await composio.create(userId, {
    toolkits: ['slack']
  });

  return session;
}
```

```python
# DO: Use IDs from your auth provider
from composio import Composio
from composio_openai import OpenAIProvider

composio = Composio(provider=OpenAIProvider())

async def handle_clerk_user(user_id: str):
    # Using Clerk user ID
    # e.g., "user_2abc123def456"
    session = composio.tool_router.create(
        user_id=user_id,
        toolkits=["github"]
    )
    return session

async def handle_auth0_user(user_id: str):
    # Using Auth0 user ID
    # e.g., "auth0|507f1f77bcf86cd799439011"
    session = composio.tool_router.create(
        user_id=user_id,
        toolkits=["gmail"]
    )
    return session

async def handle_supabase_user(user_id: str):
    # Using Supabase user UUID
    # e.g., "d7f8b0c1-1234-5678-9abc-def012345678"
    session = composio.tool_router.create(
        user_id=user_id,
        toolkits=["slack"]
    )
    return session
```

## ✅ Correct - Organization-Level Applications

```typescript
// DO: Use organization ID for org-level apps
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

const composio = new Composio({
  provider: new VercelProvider()
});

// When apps are connected at organization level (not individual users)
async function handleOrgLevelApp(req: Request) {
  // Use organization ID, NOT individual user ID
  const organizationId = req.user.organizationId;

  const session = await composio.create(organizationId, {
    toolkits: ['slack', 'github'], // Org-wide tools
    manageConnections: true
  });

  // All users in the organization share these connections
  // Perfect for team collaboration tools
  const tools = await session.tools();
  return await agent.run(req.message, tools);
}

// Example: Slack workspace integration
async function createWorkspaceSession(workspaceId: string) {
  // Workspace ID as user ID
  const session = await composio.create(`workspace_${workspaceId}`, {
    toolkits: ['slack', 'notion', 'linear']
  });

  return session;
}
```

```python
# DO: Use organization ID for org-level apps
from composio import Composio
from composio_openai import OpenAIProvider

composio = Composio(provider=OpenAIProvider())

# When apps are connected at organization level (not individual users)
async def handle_org_level_app(req):
    # Use organization ID, NOT individual user ID
    organization_id = req.user.organization_id

    session = composio.tool_router.create(
        user_id=organization_id,
        toolkits=["slack", "github"],  # Org-wide tools
        manage_connections=True
    )

    # All users in the organization share these connections
    # Perfect for team collaboration tools
    tools = session.tools()
    return await agent.run(req.message, tools)

# Example: Slack workspace integration
async def create_workspace_session(workspace_id: str):
    # Workspace ID as user ID
    session = composio.tool_router.create(
        user_id=f"workspace_{workspace_id}",
        toolkits=["slack", "notion", "linear"]
    )
    return session
```

## When to Use 'default'

The `'default'` user ID should **ONLY** be used in these scenarios:

### ✅ Development and Testing
```typescript
// Testing locally
const session = await composio.create('default', {
  toolkits: ['gmail']
});
```

### ✅ Single-User Applications
```typescript
// Personal automation script
// Only YOU use this app
const session = await composio.create('default', {
  toolkits: ['github', 'notion']
});
```

### ✅ Demos and Prototypes
```typescript
// Quick demo for investors
const session = await composio.create('default', {
  toolkits: ['hackernews']
});
```

### ❌ NEVER in Production Multi-User Apps
```typescript
// Production API serving multiple users
// ❌ DON'T DO THIS
const session = await composio.create('default', {
  toolkits: ['gmail']
});
```

## User ID Best Practices

### 1. **Use Stable, Immutable Identifiers**

✅ **Good:**
- Database primary keys (UUIDs)
- Auth provider user IDs
- Immutable user identifiers

❌ **Bad:**
- Email addresses (can change)
- Usernames (can be modified)
- Phone numbers (can change)

```typescript
// ✅ Good: Stable UUID
const userId = user.id; // "550e8400-e29b-41d4-a716-446655440000"

// ❌ Bad: Email (mutable)
const userId = user.email; // "john@example.com" -> changes to "john@newdomain.com"

// ❌ Bad: Username (mutable)
const userId = user.username; // "john_doe" -> changes to "john_smith"
```

### 2. **Ensure Uniqueness**

```typescript
// ✅ Good: Guaranteed unique
const userId = database.users.findById(id).id;

// ✅ Good: Auth provider guarantees uniqueness
const userId = auth0.user.sub; // "auth0|507f1f77bcf86cd799439011"

// ❌ Bad: Not guaranteed unique
const userId = user.firstName; // Multiple "John"s exist
```

### 3. **Match Your Authentication System**

```typescript
// Express.js with Passport
app.post('/api/agent', authenticateUser, async (req, res) => {
  const userId = req.user.id; // From Passport
  const session = await composio.create(userId, config);
});

// Next.js with Clerk
export async function POST(req: NextRequest) {
  const { userId } = auth(); // From Clerk
  const session = await composio.create(userId!, config);
}

// FastAPI with Auth0
@app.post("/api/agent")
async def agent_endpoint(user: User = Depends(get_current_user)):
    user_id = user.id  # From Auth0
    session = composio.tool_router.create(user_id=user_id, **config)
```

### 4. **Namespace for Multi-Tenancy**

```typescript
// When you have multiple applications/workspaces per user
const userId = `app_${appId}_user_${user.id}`;
// e.g., "app_saas123_user_550e8400"

const session = await composio.create(userId, {
  toolkits: ['gmail']
});

// Each app instance gets isolated connections
```

### 5. **Be Consistent Across Your Application**

```typescript
// ✅ Good: Same user ID everywhere
async function handleRequest(req: Request) {
  const userId = req.user.id;

  // Use same ID for Tool Router
  const session = await composio.create(userId, config);

  // Use same ID for direct tool execution
  await composio.tools.execute('GMAIL_SEND_EMAIL', {
    userId: userId,
    arguments: { to: 'user@example.com', subject: 'Test' }
  });

  // Use same ID for connected accounts
  await composio.connectedAccounts.get(userId, 'gmail');
}
```

## Security Implications

### ⚠️ User ID Leakage
```typescript
// ❌ DON'T: Expose user IDs to client
app.get('/api/session', (req, res) => {
  res.json({
    sessionId: session.sessionId,
    userId: req.user.id // ❌ Sensitive information
  });
});

// ✅ DO: Keep user IDs server-side only
app.get('/api/session', (req, res) => {
  res.json({
    sessionId: session.sessionId
    // Don't send userId to client
  });
});
```

### ⚠️ User ID Validation
```typescript
// ✅ Always validate user IDs match authenticated user
app.post('/api/agent/:userId', authenticateUser, async (req, res) => {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = req.user.id;

  // Validate user can only access their own data
  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const session = await composio.create(authenticatedUserId, config);
});
```

## Common Patterns

### Pattern 1: User-Level Isolation (Most Common)
```typescript
// Each user has their own connections
// Use user ID from your database/auth system
const session = await composio.create(req.user.id, {
  toolkits: ['gmail', 'github']
});
```

### Pattern 2: Organization-Level Sharing
```typescript
// All org members share connections
// Use organization ID
const session = await composio.create(req.user.organizationId, {
  toolkits: ['slack', 'notion']
});
```

### Pattern 3: Hybrid (User + Org)
```typescript
// Personal tools use user ID
const personalSession = await composio.create(req.user.id, {
  toolkits: ['gmail'] // Personal Gmail
});

// Team tools use org ID
const teamSession = await composio.create(req.user.organizationId, {
  toolkits: ['slack', 'jira'] // Team Slack/Jira
});
```

## Key Principles

1. **Never use 'default' in production multi-user apps**
2. **Use stable, immutable identifiers** (UUIDs, not emails)
3. **Match your authentication system's user IDs**
4. **Validate user IDs server-side** for security
5. **Be consistent** across Tool Router and direct tool usage
6. **Use org IDs** for organization-level applications
7. **Namespace when needed** for multi-tenancy

## Reference

- [Tool Router Sessions](https://docs.composio.dev/sdk/typescript/api/tool-router#creating-sessions)
- [User ID Security](https://docs.composio.dev/sdk/typescript/core-concepts#user-ids)
- [Connected Accounts](https://docs.composio.dev/sdk/typescript/api/connected-accounts)

---

### 1.2. Creating Basic Sessions

<a name="creating-basic-sessions"></a>

**Impact:** 🟠 HIGH

> Essential pattern for initializing Tool Router sessions with proper user isolation

# Create Basic Tool Router Sessions

Always create isolated Tool Router sessions per user to ensure proper data isolation and scoped tool access.

## ❌ Incorrect

```typescript
// DON'T: Using shared session for multiple users
const sharedSession = await composio.create('default', {
  toolkits: ['gmail']
});
// All users share the same session - security risk!
```

```python
# DON'T: Using shared session for multiple users
shared_session = composio.tool_router.create(
    user_id="default",
    toolkits=["gmail"]
)
# All users share the same session - security risk!
```

## ✅ Correct

```typescript
// DO: Create per-user sessions for isolation
import { Composio } from '@composio/core';

const composio = new Composio();

// Each user gets their own isolated session
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack']
});

console.log('Session ID:', session.sessionId);
console.log('MCP URL:', session.mcp.url);
```

```python
# DO: Create per-user sessions for isolation
from composio import Composio

composio = Composio()

# Each user gets their own isolated session
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack"]
)

print(f"Session ID: {session.session_id}")
print(f"MCP URL: {session.mcp.url}")
```

## Key Points

- **User Isolation**: Each user must have their own session
- **Toolkit Scoping**: Specify which toolkits the session can access
- **Session ID**: Store the session ID to retrieve it later
- **MCP URL**: Use this URL with any MCP-compatible AI framework

## Reference

- [Tool Router API Docs](https://docs.composio.dev/sdk/typescript/api/tool-router)
- [Creating Sessions](https://docs.composio.dev/sdk/typescript/api/tool-router#creating-sessions)

---

### 1.3. Session Lifecycle Best Practices

<a name="session-lifecycle-best-practices"></a>

**Impact:** 🔴 CRITICAL

> Create new sessions frequently for better logging, debugging, and configuration management

# Treat Sessions as Short-Lived and Disposable

Tool Router sessions should be **short-lived and disposable**. Create new sessions frequently rather than caching or reusing them across different contexts.

## ❌ Incorrect

```typescript
// DON'T: Cache and reuse sessions across messages
class AgentService {
  private sessionCache = new Map<string, ToolRouterSession>();

  async handleMessage(userId: string, message: string) {
    // BAD: Reusing cached session
    let session = this.sessionCache.get(userId);

    if (!session) {
      session = await composio.create(userId, {
        toolkits: ['gmail', 'slack']
      });
      this.sessionCache.set(userId, session);
    }

    // ❌ Configuration changes won't be reflected
    // ❌ Logs mixed across different conversations
    // ❌ Stale toolkit connections
    const tools = await session.tools();
  }
}
```

```python
# DON'T: Cache and reuse sessions across messages
class AgentService:
    def __init__(self):
        self.session_cache = {}

    async def handle_message(self, user_id: str, message: str):
        # BAD: Reusing cached session
        if user_id not in self.session_cache:
            session = composio.tool_router.create(
                user_id=user_id,
                toolkits=["gmail", "slack"]
            )
            self.session_cache[user_id] = session

        session = self.session_cache[user_id]

        # ❌ Configuration changes won't be reflected
        # ❌ Logs mixed across different conversations
        # ❌ Stale toolkit connections
        tools = session.tools()
```

## ✅ Correct - Create New Session Per Message

```typescript
// DO: Create fresh session for each message
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

const composio = new Composio({
  provider: new VercelProvider()
});

async function handleUserMessage(
  userId: string,
  message: string,
  config: { toolkits: string[] }
) {
  // Create new session for this message
  const session = await composio.create(userId, {
    toolkits: config.toolkits,
    manageConnections: true
  });

  const tools = await session.tools();

  // Use tools with agent...
  const response = await runAgent(message, tools);

  // ✅ Fresh configuration
  // ✅ Clean logs grouped by session
  // ✅ Latest connection states
  return response;
}

// Each message gets a new session
await handleUserMessage('user_123', 'Check my emails', { toolkits: ['gmail'] });
await handleUserMessage('user_123', 'Send a slack message', { toolkits: ['slack'] });
```

```python
# DO: Create fresh session for each message
from composio import Composio
from composio_openai import OpenAIProvider

composio = Composio(provider=OpenAIProvider())

async def handle_user_message(
    user_id: str,
    message: str,
    config: dict
):
    # Create new session for this message
    session = composio.tool_router.create(
        user_id=user_id,
        toolkits=config["toolkits"],
        manage_connections=True
    )

    tools = session.tools()

    # Use tools with agent...
    response = await run_agent(message, tools)

    # ✅ Fresh configuration
    # ✅ Clean logs grouped by session
    # ✅ Latest connection states
    return response

# Each message gets a new session
await handle_user_message("user_123", "Check my emails", {"toolkits": ["gmail"]})
await handle_user_message("user_123", "Send a slack message", {"toolkits": ["slack"]})
```

## ✅ Correct - Single Session Per Conversation (When Config Stable)

```typescript
// DO: Use one session for entire conversation if config doesn't change
async function handleConversation(
  userId: string,
  conversationId: string,
  config: { toolkits: string[] }
) {
  // Create ONE session for this conversation/thread
  const session = await composio.create(userId, {
    toolkits: config.toolkits,
    manageConnections: true
  });

  const tools = await session.tools();

  console.log(`Session ${session.sessionId} for conversation ${conversationId}`);

  // Use the same session for all messages in this conversation
  for await (const message of conversationStream) {
    const response = await runAgent(message, tools);

    // ✅ All tool executions logged under same session
    // ✅ Easy to debug entire conversation flow
    // ✅ Grouped logs in monitoring tools
  }
}
```

```python
# DO: Use one session for entire conversation if config doesn't change
async def handle_conversation(
    user_id: str,
    conversation_id: str,
    config: dict
):
    # Create ONE session for this conversation/thread
    session = composio.tool_router.create(
        user_id=user_id,
        toolkits=config["toolkits"],
        manage_connections=True
    )

    tools = session.tools()

    print(f"Session {session.session_id} for conversation {conversation_id}")

    # Use the same session for all messages in this conversation
    async for message in conversation_stream:
        response = await run_agent(message, tools)

        # ✅ All tool executions logged under same session
        # ✅ Easy to debug entire conversation flow
        # ✅ Grouped logs in monitoring tools
```

## When to Create New Sessions

### ✅ Always Create New Session When:

1. **Configuration Changes**
   ```typescript
   // User connects new toolkit
   if (userConnectedSlack) {
     // Create new session with updated toolkits
     const session = await composio.create(userId, {
       toolkits: ['gmail', 'slack'] // Added slack
     });
   }
   ```

2. **Connected Accounts Change**
   ```typescript
   // User disconnected and reconnected Gmail
   const session = await composio.create(userId, {
     toolkits: ['gmail'],
     // Will use latest connection
   });
   ```

3. **Different Toolkit Requirements**
   ```typescript
   // Message needs different toolkits
   const emailSession = await composio.create(userId, {
     toolkits: ['gmail']
   });

   const codeSession = await composio.create(userId, {
     toolkits: ['github', 'linear']
   });
   ```

4. **New Conversation/Thread**
   ```typescript
   // Starting a new conversation thread
   const session = await composio.create(userId, {
     toolkits: config.toolkits,
     // Fresh session for clean log grouping
   });
   ```

### ✅ Can Reuse Session When:

1. **Same conversation/thread**
2. **Configuration unchanged**
3. **No toolkit connections changed**
4. **Actively ongoing interaction**

## Benefits of Short-Lived Sessions

### 1. **Clean Log Grouping**
```typescript
// All tool executions in one session are grouped together
const session = await composio.create(userId, {
  toolkits: ['gmail', 'slack']
});

// These executions are grouped under session.sessionId
await agent.run('Check emails'); // Logs: session_abc123
await agent.run('Send slack message'); // Logs: session_abc123

// Easy to trace entire conversation flow in monitoring
console.log(`View logs: /sessions/${session.sessionId}`);
```

### 2. **Fresh Configuration**
```typescript
// Always get latest toolkit connections and auth states
const session = await composio.create(userId, {
  toolkits: ['gmail']
});

// ✅ Uses current connected account
// ✅ Reflects any new connections user made
// ✅ Picks up toolkit updates
```

### 3. **Easier Debugging**
```typescript
// Session ID becomes your debug trace ID
console.log(`Processing message in session ${session.sessionId}`);

// All logs tagged with session ID:
// [session_abc123] Executing GMAIL_FETCH_EMAILS
// [session_abc123] Executed GMAIL_FETCH_EMAILS
// [session_abc123] Executing SLACK_SEND_MESSAGE

// Filter all logs for this specific interaction
```

### 4. **Simplified Error Tracking**
```typescript
try {
  const session = await composio.create(userId, config);
  const result = await runAgent(message, session);
} catch (error) {
  // Session ID in error context
  logger.error('Agent failed', {
    sessionId: session.sessionId,
    userId,
    error
  });
}
```

## Pattern: Per-Message Sessions

```typescript
// Recommended pattern for most applications
export async function handleAgentRequest(
  userId: string,
  message: string,
  toolkits: string[]
) {
  // 1. Create fresh session
  const session = await composio.create(userId, {
    toolkits,
    manageConnections: true
  });

  // 2. Log session start
  logger.info('Session started', {
    sessionId: session.sessionId,
    userId,
    toolkits
  });

  try {
    // 3. Get tools and run agent
    const tools = await session.tools();
    const response = await agent.run(message, tools);

    // 4. Log session completion
    logger.info('Session completed', {
      sessionId: session.sessionId
    });

    return response;
  } catch (error) {
    // 5. Log session error
    logger.error('Session failed', {
      sessionId: session.sessionId,
      error
    });
    throw error;
  }
}
```

## Pattern: Per-Conversation Sessions

```typescript
// For long-running conversations with stable config
export class ConversationSession {
  private session: ToolRouterSession;

  async start(userId: string, config: SessionConfig) {
    // Create session once for conversation
    this.session = await composio.create(userId, config);

    logger.info('Conversation session started', {
      sessionId: this.session.sessionId
    });
  }

  async handleMessage(message: string) {
    // Reuse session for all messages
    const tools = await this.session.tools();
    return await agent.run(message, tools);
  }

  async end() {
    logger.info('Conversation session ended', {
      sessionId: this.session.sessionId
    });
  }
}
```

## Key Principles

1. **Don't cache sessions** - Create new ones as needed
2. **Session = Unit of work** - One session per task or conversation
3. **Short-lived is better** - Fresh state, clean logs, easier debugging
4. **Session ID = Trace ID** - Use for log correlation and debugging
5. **Create on demand** - No need to pre-create or warm up sessions

## Reference

- [Tool Router Sessions](https://docs.composio.dev/sdk/typescript/api/tool-router#creating-sessions)
- [Session Properties](https://docs.composio.dev/sdk/typescript/api/tool-router#session-properties)
- [Best Practices](https://docs.composio.dev/sdk/typescript/api/tool-router#best-practices)

---

### 1.4. Session Configuration

<a name="session-configuration"></a>

**Impact:** 🟡 MEDIUM

> Use session configuration options to control toolkit access, tools, and behavior

# Configure Tool Router Sessions Properly

Tool Router sessions support rich configuration for fine-grained control over toolkit and tool access.

## ❌ Incorrect

```typescript
// DON'T: Enable all toolkits without restrictions
const session = await composio.create('user_123', {
  // No toolkit restrictions - exposes everything!
});

// DON'T: Mix incompatible configuration patterns
const session = await composio.create('user_123', {
  toolkits: { enable: ['gmail'] },
  toolkits: ['slack']  // This will override the first one!
});
```

```python
# DON'T: Enable all toolkits without restrictions
session = composio.tool_router.create(
    user_id="user_123"
    # No toolkit restrictions - exposes everything!
)
```

## ✅ Correct - Basic Configuration

```typescript
// DO: Explicitly specify toolkits
import { Composio } from '@composio/core';

const composio = new Composio();

// Simple toolkit list
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack', 'github']
});

// Explicit enable
const session2 = await composio.create('user_123', {
  toolkits: { enable: ['gmail', 'slack'] }
});

// Disable specific toolkits (enable all others)
const session3 = await composio.create('user_123', {
  toolkits: { disable: ['calendar'] }
});
```

```python
# DO: Explicitly specify toolkits
from composio import Composio

composio = Composio()

# Simple toolkit list
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack", "github"]
)

# Explicit enable
session2 = composio.tool_router.create(
    user_id="user_123",
    toolkits={"enable": ["gmail", "slack"]}
)
```

## ✅ Correct - Fine-Grained Tool Control

```typescript
// DO: Control specific tools per toolkit
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack'],
  tools: {
    // Only allow reading emails, not sending
    gmail: ['GMAIL_FETCH_EMAILS', 'GMAIL_SEARCH_EMAILS'],

    // Or use enable/disable
    slack: {
      disable: ['SLACK_DELETE_MESSAGE'] // Safety: prevent deletions
    }
  }
});
```

```python
# DO: Control specific tools per toolkit
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack"],
    tools={
        # Only allow reading emails, not sending
        "gmail": ["GMAIL_FETCH_EMAILS", "GMAIL_SEARCH_EMAILS"],

        # Or use enable/disable
        "slack": {
            "disable": ["SLACK_DELETE_MESSAGE"]  # Safety: prevent deletions
        }
    }
)
```

## ✅ Correct - Tag-Based Filtering

```typescript
// DO: Use tags to filter by behavior
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'github'],
  // Global tags: only read-only tools
  tags: ['readOnlyHint'],

  // Override tags per toolkit
  tools: {
    github: {
      tags: ['readOnlyHint', 'idempotentHint']
    }
  }
});
```

```python
# DO: Use tags to filter by behavior
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "github"],
    # Global tags: only read-only tools
    tags=["readOnlyHint"],

    # Override tags per toolkit
    tools={
        "github": {
            "tags": ["readOnlyHint", "idempotentHint"]
        }
    }
)
```

## Available Tags

- `readOnlyHint` - Tools that only read data
- `destructiveHint` - Tools that modify or delete data
- `idempotentHint` - Tools safe to retry
- `openWorldHint` - Tools operating in open contexts

## Configuration Best Practices

1. **Least Privilege**: Only enable toolkits/tools needed
2. **Tag Filtering**: Use tags to restrict dangerous operations
3. **Per-Toolkit Tools**: Fine-tune access per toolkit
4. **Auth Configs**: Map toolkits to specific auth configurations

## Reference

- [Configuration Options](https://docs.composio.dev/sdk/typescript/api/tool-router#configuration-options)
- [Tool Tags](https://docs.composio.dev/sdk/typescript/api/tool-router#tags)

---

### 1.5. Using Native Tools

<a name="using-native-tools"></a>

**Impact:** 🟠 HIGH

> Prefer native tools over MCP for faster execution, full control, and modifier support

# Use Native Tools for Performance and Control

Tool Router supports two approaches: **Native tools (recommended)** for performance and control, or MCP clients for framework independence.

## ❌ Incorrect

```typescript
// DON'T: Use MCP when you need logging, modifiers, or performance
const composio = new Composio(); // No provider
const { mcp } = await composio.create('user_123', {
  toolkits: ['gmail']
});

const client = await createMCPClient({
  transport: { type: 'http', url: mcp.url }
});

// ❌ No control over tool execution
// ❌ No modifier support
// ❌ Extra API calls via MCP server
// ❌ Slower execution
const tools = await client.tools();
```

```python
# DON'T: Use MCP when you need logging, modifiers, or performance
composio = Composio()  # No provider
session = composio.tool_router.create(user_id="user_123")

# ❌ No control over tool execution
# ❌ No modifier support
# ❌ Extra API calls via MCP server
# ❌ Slower execution
```

## ✅ Correct - Use Native Tools (Recommended)

```typescript
// DO: Use native tools for performance and control
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

// Add provider for native tools
const composio = new Composio({
  provider: new VercelProvider()
});

const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack']
});

// ✅ Direct tool execution (no MCP overhead)
// ✅ Full modifier support
// ✅ Logging and telemetry
// ✅ Faster performance
const tools = await session.tools();
```

```python
# DO: Use native tools for performance and control
from composio import Composio
from composio_openai import OpenAIProvider

# Add provider for native tools
composio = Composio(provider=OpenAIProvider())

session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack"]
)

# ✅ Direct tool execution (no MCP overhead)
# ✅ Full modifier support
# ✅ Logging and telemetry
# ✅ Faster performance
tools = session.tools()
```

## ✅ Correct - Native Tools with Modifiers

```typescript
// DO: Use modifiers for logging and control
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { SessionExecuteMetaModifiers } from '@composio/core';

const composio = new Composio({
  provider: new VercelProvider()
});

const session = await composio.create('user_123', {
  toolkits: ['gmail']
});

// Add modifiers for logging during execution
const modifiers: SessionExecuteMetaModifiers = {
  beforeExecute: ({ toolSlug, sessionId, params }) => {
    console.log(`[${sessionId}] Executing ${toolSlug}`);
    console.log('Parameters:', JSON.stringify(params, null, 2));
    return params;
  },
  afterExecute: ({ toolSlug, sessionId, result }) => {
    console.log(`[${sessionId}] Completed ${toolSlug}`);
    console.log('Success:', result.successful);
    return result;
  }
};

const tools = await session.tools(modifiers);

// Now when agent executes tools, you see:
// [session_abc123] Executing GMAIL_FETCH_EMAILS
// Parameters: { "maxResults": 10, "query": "from:user@example.com" }
// [session_abc123] Completed GMAIL_FETCH_EMAILS
// Success: true
```

```typescript
// Advanced: Add telemetry and schema customization
const advancedModifiers: SessionExecuteMetaModifiers = {
  beforeExecute: ({ toolSlug, sessionId, params }) => {
    // Send to analytics
    analytics.track('tool_execution_started', {
      tool: toolSlug,
      session: sessionId,
      params
    });

    // Validate parameters
    if (!params) {
      throw new Error(`Missing parameters for ${toolSlug}`);
    }

    return params;
  },
  afterExecute: ({ toolSlug, sessionId, result }) => {
    // Track completion and duration
    analytics.track('tool_execution_completed', {
      tool: toolSlug,
      session: sessionId,
      success: result.successful
    });

    // Handle errors
    if (!result.successful) {
      console.error(`Tool ${toolSlug} failed:`, result.error);
    }

    return result;
  },
  modifySchema: ({ toolSlug, schema }) => {
    // Simplify schemas for better AI understanding
    if (toolSlug === 'GMAIL_SEND_EMAIL') {
      // Remove optional fields for simpler usage
      delete schema.parameters.properties.cc;
      delete schema.parameters.properties.bcc;
    }
    return schema;
  }
};
```

```python
# DO: Use modifiers for logging, validation, and telemetry
from composio import Composio
from composio_openai import OpenAIProvider

composio = Composio(provider=OpenAIProvider())

session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail"]
)

# Add modifiers for full control over tool execution
def before_execute(context):
    print(f"[{context['session_id']}] Executing {context['tool_slug']}")
    print(f"Parameters: {context['params']}")
    # Add custom validation, logging, telemetry
    return context['params']

def after_execute(context):
    print(f"[{context['session_id']}] Completed {context['tool_slug']}")
    print(f"Result: {context['result']}")
    # Transform results, handle errors, track metrics
    return context['result']

tools = session.tools(
    modifiers={
        "before_execute": before_execute,
        "after_execute": after_execute
    }
)
```

## Performance Comparison

| Feature | Native Tools | MCP |
|---------|-------------|-----|
| Execution Speed | **Fast** (direct) | Slower (extra HTTP calls) |
| API Overhead | **Minimal** | Additional MCP server roundtrips |
| Modifier Support | **✅ Full support** | ❌ Not available |
| Logging & Telemetry | **✅ beforeExecute/afterExecute** | ❌ Limited visibility |
| Schema Customization | **✅ modifySchema** | ❌ Not available |
| Framework Lock-in | Yes (provider-specific) | No (universal) |

## When to Use Each

### ✅ Use Native Tools (Recommended) When:
- **Performance matters**: Direct execution, no MCP overhead
- **Need logging**: Track tool execution, parameters, results
- **Need control**: Validate inputs, transform outputs, handle errors
- **Production apps**: Telemetry, monitoring, debugging
- **Single framework**: You're committed to one AI framework

### Use MCP Only When:
- **Multiple frameworks**: Switching between Claude, Vercel AI, LangChain
- **Framework flexibility**: Not committed to one provider yet
- **Prototyping**: Quick testing across different AI tools

## Modifier Use Cases

With native tools, modifiers enable:

1. **Logging**: Track every tool execution with parameters and results
2. **Telemetry**: Send metrics to Datadog, New Relic, etc.
3. **Validation**: Check parameters before execution
4. **Error Handling**: Catch and transform errors
5. **Rate Limiting**: Control tool execution frequency
6. **Caching**: Cache results for repeated calls
7. **Schema Customization**: Simplify schemas for specific AI models

## Key Insight

**Native tools eliminate the MCP server middleman**, resulting in faster execution and giving you full control over the tool execution lifecycle. The only trade-off is framework lock-in, which is acceptable in production applications where you've already chosen your AI framework.

## Reference

- [Session Modifiers](https://docs.composio.dev/sdk/typescript/api/tool-router#using-modifiers)
- [SessionExecuteMetaModifiers](https://docs.composio.dev/sdk/typescript/api/tool-router#sessionexecutemetamodifiers-v040)
- [Tool Router Performance](https://docs.composio.dev/sdk/typescript/api/tool-router#best-practices)

---

### 1.6. Framework Integration

<a name="framework-integration"></a>

**Impact:** 🟠 HIGH

> Connect Tool Router sessions with popular AI frameworks using MCP or native tools

# Integrate Tool Router with AI Frameworks

Tool Router works with any AI framework through two methods: **Native Tools** (recommended for speed) or **MCP** (for framework flexibility). Choose native tools when available for better performance and control.

## Integration Methods

| Method | Pros | Cons | When to Use |
|--------|------|------|-------------|
| **Native Tools** | ✅ Faster execution<br>✅ Full control with modifiers<br>✅ No MCP overhead | ❌ Framework lock-in | Single framework, production apps |
| **MCP** | ✅ Framework independent<br>✅ Works with any MCP client<br>✅ Easy framework switching | ⚠️ Slower (extra API roundtrip)<br>⚠️ Less control | Multi-framework, prototyping |

## MCP Headers Configuration

When using MCP, the `session.mcp.headers` object contains the authentication headers required to connect to the Composio MCP server:

```typescript
{
  "x-api-key": "your_composio_api_key"
}
```

### Using with MCP Clients

When configuring MCP clients (like Claude Desktop), you need to provide the Composio API key in the headers:

```json
{
  "mcpServers": {
    "composio": {
      "type": "http",
      "url": "https://mcp.composio.dev/session/your_session_id",
      "headers": {
        "x-api-key": "your_composio_api_key"
      }
    }
  }
}
```

**Where to find your Composio API key:**
- Login to [Composio Platform](https://platform.composio.dev)
- Select your project
- Navigate to Settings to find your API keys
- Or set it via environment variable: `COMPOSIO_API_KEY`

When using Tool Router sessions programmatically, the headers are automatically included in `session.mcp.headers`.

## ❌ Incorrect - Using Tools Without Tool Router

```typescript
// DON'T: Use tools directly without session isolation
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

const composio = new Composio({ provider: new VercelProvider() });

// ❌ No user isolation
// ❌ Tools not scoped per user
// ❌ All users share same tools
const tools = await composio.tools.get('default', {
  toolkits: ['gmail']
});
```

```python
# DON'T: Use tools directly without session isolation
from composio import Composio
from composio_openai_agents import OpenAIAgentsProvider

composio = Composio(provider=OpenAIAgentsProvider())

# ❌ No user isolation
# ❌ Tools not scoped per user
# ❌ All users share same tools
tools = composio.tools.get(
    user_id="default",
    toolkits=["gmail"]
)
```

## ✅ Correct - Vercel AI SDK (Native Tools)

```typescript
// DO: Use Tool Router with native tools for best performance
import { openai } from '@ai-sdk/openai';
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { streamText } from 'ai';

// Initialize Composio with Vercel provider
const composio = new Composio({
  provider: new VercelProvider()
});

async function runAgent(userId: string, prompt: string) {
  // Create isolated session for user
  const session = await composio.create(userId, {
    toolkits: ['gmail'],
    manageConnections: true
  });

  // Get native Vercel-formatted tools
  const tools = await session.tools();

  // Stream response with tools
  const stream = await streamText({
    model: openai('gpt-4o'),
    prompt,
    tools,
    maxSteps: 10
  });

  // ✅ Fast execution (no MCP overhead)
  // ✅ User-isolated tools
  // ✅ Native Vercel format

  for await (const textPart of stream.textStream) {
    process.stdout.write(textPart);
  }
}

await runAgent('user_123', 'Fetch my last email from Gmail');
```

```python
# DO: Use Tool Router with native tools for best performance
from composio import Composio
from composio_vercel import VercelProvider
from ai import streamText, openai

# Initialize Composio with Vercel provider
composio = Composio(provider=VercelProvider())

async def run_agent(user_id: str, prompt: str):
    # Create isolated session for user
    session = composio.create(
        user_id=user_id,
        toolkits=["gmail"],
        manage_connections=True
    )

    # Get native Vercel-formatted tools
    tools = session.tools()

    # Stream response with tools
    stream = streamText(
        model=openai("gpt-4o"),
        prompt=prompt,
        tools=tools,
        max_steps=10
    )

    # ✅ Fast execution (no MCP overhead)
    # ✅ User-isolated tools
    # ✅ Native Vercel format

    async for text_part in stream.text_stream:
        print(text_part, end="")

await run_agent("user_123", "Fetch my last email from Gmail")
```

## ✅ Correct - Vercel AI SDK (MCP)

```typescript
// DO: Use MCP when framework flexibility is needed
import { openai } from '@ai-sdk/openai';
import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';
import { Composio } from '@composio/core';
import { streamText } from 'ai';

const composio = new Composio();

async function runAgentMCP(userId: string, prompt: string) {
  // Create session (MCP URL only, no provider needed)
  const session = await composio.create(userId, {
    toolkits: ['gmail'],
    manageConnections: true
  });

  // Create MCP client
  const client = await createMCPClient({
    transport: {
      type: 'http',
      url: session.mcp.url,
      headers: session.mcp.headers
    }
  });

  // Get tools from MCP server
  const tools = await client.tools();

  // Stream response
  const stream = await streamText({
    model: openai('gpt-4o'),
    prompt,
    tools,
    maxSteps: 10
  });

  // ✅ Framework independent
  // ✅ User-isolated tools
  // ⚠️ Slower (MCP overhead)

  for await (const textPart of stream.textStream) {
    process.stdout.write(textPart);
  }
}

await runAgentMCP('user_123', 'Fetch my last email');
```

## ✅ Correct - OpenAI Agents SDK (Native Tools)

```typescript
// DO: Use native tools with OpenAI Agents
import { Composio } from '@composio/core';
import { OpenAIAgentsProvider } from '@composio/openai-agents';
import { Agent, run } from '@openai/agents';

const composio = new Composio({
  provider: new OpenAIAgentsProvider()
});

async function createAssistant(userId: string) {
  // Create session with native tools
  const session = await composio.create(userId, {
    toolkits: ['gmail', 'slack']
  });

  // Get native OpenAI Agents formatted tools
  const tools = await session.tools();

  // Create agent with tools
  const agent = new Agent({
    name: 'Personal Assistant',
    model: 'gpt-4o',
    instructions: 'You are a helpful assistant. Use tools to help users.',
    tools
  });

  // ✅ Fast execution
  // ✅ Native OpenAI Agents format
  // ✅ Full control

  return agent;
}

const agent = await createAssistant('user_123');
const result = await run(agent, 'Check my emails and send a summary to Slack');
console.log(result.finalOutput);
```

```python
# DO: Use native tools with OpenAI Agents
from composio import Composio
from composio_openai_agents import OpenAIAgentsProvider
from agents import Agent, Runner

composio = Composio(provider=OpenAIAgentsProvider())

async def create_assistant(user_id: str):
    # Create session with native tools
    session = composio.create(
        user_id=user_id,
        toolkits=["gmail", "slack"]
    )

    # Get native OpenAI Agents formatted tools
    tools = session.tools()

    # Create agent with tools
    agent = Agent(
        name="Personal Assistant",
        model="gpt-4o",
        instructions="You are a helpful assistant. Use tools to help users.",
        tools=tools
    )

    # ✅ Fast execution
    # ✅ Native OpenAI Agents format
    # ✅ Full control

    return agent

agent = await create_assistant("user_123")
result = await Runner.run(
    starting_agent=agent,
    input="Check my emails and send a summary to Slack"
)
print(result.final_output)
```

## ✅ Correct - OpenAI Agents SDK (MCP)

```typescript
// DO: Use MCP with OpenAI Agents for flexibility
import { Composio } from '@composio/core';
import { Agent, run, hostedMcpTool } from '@openai/agents';

const composio = new Composio();

async function createAssistantMCP(userId: string) {
  // Create session
  const { mcp } = await composio.create(userId, {
    toolkits: ['gmail']
  });

  // Create agent with MCP tool
  const agent = new Agent({
    name: 'Gmail Assistant',
    model: 'gpt-4o',
    instructions: 'Help users manage their Gmail.',
    tools: [
      hostedMcpTool({
        serverLabel: 'composio',
        serverUrl: mcp.url,
        headers: mcp.headers
      })
    ]
  });

  // ✅ Framework independent
  // ⚠️ Slower execution

  return agent;
}

const agent = await createAssistantMCP('user_123');
const result = await run(agent, 'Fetch my last email');
```

```python
# DO: Use MCP with OpenAI Agents for flexibility
from composio import Composio
from agents import Agent, Runner, HostedMCPTool

composio = Composio()

def create_assistant_mcp(user_id: str):
    # Create session
    session = composio.create(user_id=user_id, toolkits=["gmail"])

    # Create agent with MCP tool
    composio_mcp = HostedMCPTool(
        tool_config={
            "type": "mcp",
            "server_label": "composio",
            "server_url": session.mcp.url,
            "require_approval": "never",
            "headers": session.mcp.headers
        }
    )

    agent = Agent(
        name="Gmail Assistant",
        instructions="Help users manage their Gmail.",
        tools=[composio_mcp]
    )

    # ✅ Framework independent
    # ⚠️ Slower execution

    return agent

agent = create_assistant_mcp("user_123")
result = Runner.run_sync(starting_agent=agent, input="Fetch my last email")
print(result.final_output)
```

## ✅ Correct - LangChain (MCP)

```typescript
// DO: Use LangChain with MCP
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';
import { Composio } from '@composio/core';

const composio = new Composio();

async function createLangChainAgent(userId: string) {
  // Create session
  const session = await composio.create(userId, {
    toolkits: ['gmail']
  });

  // Create MCP client
  const client = new MultiServerMCPClient({
    composio: {
      transport: 'http',
      url: session.mcp.url,
      headers: session.mcp.headers
    }
  });

  // Get tools
  const tools = await client.getTools();

  // Create agent
  const llm = new ChatOpenAI({ model: 'gpt-4o' });

  const agent = createAgent({
    name: 'Gmail Assistant',
    systemPrompt: 'You help users manage their Gmail.',
    model: llm,
    tools
  });

  return agent;
}

const agent = await createLangChainAgent('user_123');
const result = await agent.invoke({
  messages: [{ role: 'user', content: 'Fetch my last email' }]
});
console.log(result);
```

```python
# DO: Use LangChain with MCP
from composio import Composio
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langchain_openai.chat_models import ChatOpenAI

composio = Composio()

async def create_langchain_agent(user_id: str):
    # Create session
    session = composio.create(user_id=user_id, toolkits=["gmail"])

    # Create MCP client
    mcp_client = MultiServerMCPClient({
        "composio": {
            "transport": "streamable_http",
            "url": session.mcp.url,
            "headers": session.mcp.headers
        }
    })

    # Get tools
    tools = await mcp_client.get_tools()

    # Create agent
    agent = create_agent(
        tools=tools,
        model=ChatOpenAI(model="gpt-4o")
    )

    return agent

agent = await create_langchain_agent("user_123")
result = await agent.ainvoke({
    "messages": [
        {"role": "user", "content": "Fetch my last email"}
    ]
})
print(result)
```

## ✅ Correct - Claude Agent SDK (Native Tools)

```typescript
// DO: Use Claude Agent SDK with native tools
import { query } from '@anthropic-ai/claude-agent-sdk';
import { Composio } from '@composio/core';
import { ClaudeAgentSDKProvider } from '@composio/claude-agent-sdk';

const composio = new Composio({
  provider: new ClaudeAgentSDKProvider()
});

async function runClaudeAgent(userId: string, prompt: string) {
  // Create session with native tools
  const session = await composio.create(userId, {
    toolkits: ['gmail']
  });

  // Get native Claude tools format
  const tools = await session.tools();

  // Query with tools
  const stream = await query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5-20250929',
      permissionMode: 'bypassPermissions',
      tools
    }
  });

  for await (const event of stream) {
    if (event.type === 'result' && event.subtype === 'success') {
      process.stdout.write(event.result);
    }
  }
}

await runClaudeAgent('user_123', 'Fetch my last email');
```

```python
# DO: Use Claude Agent SDK with native tools
from composio import Composio
from composio_claude_agent_sdk import ClaudeAgentSDKProvider
from claude_agent_sdk import query, ClaudeAgentOptions

composio = Composio(provider=ClaudeAgentSDKProvider())

async def run_claude_agent(user_id: str, prompt: str):
    # Create session with native tools
    session = composio.create(user_id=user_id, toolkits=["gmail"])

    # Get native Claude tools format
    tools = session.tools()

    # Query with tools
    options = ClaudeAgentOptions(
        model="claude-sonnet-4-5-20250929",
        permission_mode="bypassPermissions",
        tools=tools
    )

    async for message in query(prompt=prompt, options=options):
        print(message, end="")

await run_claude_agent("user_123", "Fetch my last email")
```

## ✅ Correct - Claude Agent SDK (MCP)

```typescript
// DO: Use Claude Agent SDK with MCP
import { query } from '@anthropic-ai/claude-agent-sdk';
import { Composio } from '@composio/core';

const composio = new Composio();

async function runClaudeAgentMCP(userId: string, prompt: string) {
  // Create session
  const session = await composio.create(userId, {
    toolkits: ['gmail']
  });

  // Query with MCP server
  const stream = await query({
    prompt,
    options: {
      model: 'claude-sonnet-4-5-20250929',
      permissionMode: 'bypassPermissions',
      mcpServers: {
        composio: {
          type: 'http',
          url: session.mcp.url,
          headers: session.mcp.headers
        }
      }
    }
  });

  for await (const event of stream) {
    if (event.type === 'result' && event.subtype === 'success') {
      process.stdout.write(event.result);
    }
  }
}

await runClaudeAgentMCP('user_123', 'Fetch my last email');
```

```python
# DO: Use Claude Agent SDK with MCP
from composio import Composio
from claude_agent_sdk import query, ClaudeAgentOptions

composio = Composio()

async def run_claude_agent_mcp(user_id: str, prompt: str):
    # Create session
    session = composio.create(user_id=user_id, toolkits=["gmail"])

    # Query with MCP server
    options = ClaudeAgentOptions(
        model="claude-sonnet-4-5-20250929",
        permission_mode="bypassPermissions",
        mcp_servers={
            "composio": {
                "type": session.mcp.type,
                "url": session.mcp.url,
                "headers": session.mcp.headers
            }
        }
    )

    async for message in query(prompt=prompt, options=options):
        print(message, end="")

await run_claude_agent_mcp("user_123", "Fetch my last email")
```

## ✅ Correct - CrewAI (MCP)

```python
# DO: Use CrewAI with MCP
from crewai import Agent, Task, Crew
from crewai.mcp import MCPServerHTTP
from composio import Composio

composio = Composio()

def create_crewai_agent(user_id: str):
    # Create session
    session = composio.create(user_id=user_id, toolkits=["gmail"])

    # Create agent with MCP server
    agent = Agent(
        role="Gmail Assistant",
        goal="Help with Gmail related queries",
        backstory="You are a helpful assistant.",
        mcps=[
            MCPServerHTTP(
                url=session.mcp.url,
                headers=session.mcp.headers
            )
        ]
    )

    return agent

# Create agent
agent = create_crewai_agent("user_123")

# Define task
task = Task(
    description="Find the last email and summarize it.",
    expected_output="A summary including sender, subject, and key points.",
    agent=agent
)

# Execute
crew = Crew(agents=[agent], tasks=[task])
result = crew.kickoff()
print(result)
```

## Using Modifiers with Native Tools

```typescript
// Add logging and telemetry with modifiers
import { Composio } from '@composio/core';
import { VercelProvider } from '@composio/vercel';
import { SessionExecuteMetaModifiers } from '@composio/core';

const composio = new Composio({
  provider: new VercelProvider()
});

async function getToolsWithLogging(userId: string) {
  const session = await composio.create(userId, {
    toolkits: ['gmail']
  });

  // Add modifiers for logging
  const modifiers: SessionExecuteMetaModifiers = {
    beforeExecute: ({ toolSlug, sessionId, params }) => {
      console.log(`[${sessionId}] Executing ${toolSlug}`);
      console.log('Parameters:', JSON.stringify(params, null, 2));
      return params;
    },
    afterExecute: ({ toolSlug, sessionId, result }) => {
      console.log(`[${sessionId}] Completed ${toolSlug}`);
      console.log('Success:', result.successful);
      return result;
    }
  };

  // Get tools with modifiers
  const tools = await session.tools(modifiers);

  return tools;
}
```

```python
# Add logging and telemetry with modifiers
from composio import Composio, before_execute, after_execute
from composio_openai_agents import OpenAIAgentsProvider
from composio.types import ToolExecuteParams, ToolExecutionResponse

composio = Composio(provider=OpenAIAgentsProvider())

async def get_tools_with_logging(user_id: str):
    session = composio.create(user_id=user_id, toolkits=["gmail"])

    # Define logging modifiers
    @before_execute(tools=[])
    def log_before(
        tool: str,
        toolkit: str,
        params: ToolExecuteParams
    ) -> ToolExecuteParams:
        print(f"🔧 Executing {toolkit}.{tool}")
        print(f"   Arguments: {params.get('arguments', {})}")
        return params

    @after_execute(tools=[])
    def log_after(
        tool: str,
        toolkit: str,
        response: ToolExecutionResponse
    ) -> ToolExecutionResponse:
        print(f"✅ Completed {toolkit}.{tool}")
        if "data" in response:
            print(f"   Response: {response['data']}")
        return response

    # Get tools with modifiers
    tools = session.tools(modifiers=[log_before, log_after])

    return tools
```

## Framework Comparison

| Framework | Native Tools | MCP | Provider Package | Best For |
|-----------|--------------|-----|------------------|----------|
| **Vercel AI SDK** | ✅ | ✅ | `@composio/vercel` | Modern web apps, streaming |
| **OpenAI Agents SDK** | ✅ | ✅ | `@composio/openai-agents` | Production agents |
| **LangChain** | ❌ | ✅ | N/A (MCP only) | Complex chains, memory |
| **Claude Agent SDK** | ✅ | ✅ | `@composio/claude-agent-sdk` | Claude-specific features |
| **CrewAI** | ❌ | ✅ | N/A (MCP only) | Multi-agent teams |

## Pattern: Framework Switching

```typescript
// Same session, different frameworks
const composio = new Composio();
const session = await composio.create('user_123', { toolkits: ['gmail'] });

// Use with Vercel AI SDK
const client1 = await createMCPClient({
  transport: { type: 'http', url: session.mcp.url, headers: session.mcp.headers }
});

// Use with LangChain
const client2 = new MultiServerMCPClient({
  composio: { transport: 'http', url: session.mcp.url, headers: session.mcp.headers }
});

// Use with OpenAI Agents
const client3 = hostedMcpTool({
  serverUrl: session.mcp.url,
  headers: session.mcp.headers
});

// ✅ Same tools, different frameworks
// ✅ Framework flexibility with MCP
```

## Best Practices

### 1. **Choose Native Tools When Available**
- Faster execution (no MCP overhead)
- Better performance for production
- Full control with modifiers

### 2. **Use MCP for Flexibility**
- When using multiple frameworks
- During prototyping phase
- When native tools unavailable

### 3. **Always Create User Sessions**
- Never share sessions across users
- Use proper user IDs (not 'default')
- Isolate tools per user

### 4. **Enable Connection Management**
- Set `manageConnections: true`
- Let agent handle authentication
- Better user experience

### 5. **Add Logging with Modifiers**
- Use beforeExecute/afterExecute
- Track tool execution
- Debug agent behavior

### 6. **Handle Streaming Properly**
- Use framework's streaming APIs
- Process events as they arrive
- Better UX for long operations

## Key Principles

1. **Native tools recommended** - Faster and more control
2. **MCP for flexibility** - Framework independent
3. **User isolation** - Create sessions per user
4. **Connection management** - Enable auto-authentication
5. **Logging and monitoring** - Use modifiers for observability
6. **Framework agnostic** - Same session works with any framework

## Reference

- [Tool Router Documentation](https://docs.composio.dev/sdk/typescript/api/tool-router)
- [Vercel AI SDK](https://sdk.vercel.ai)
- [OpenAI Agents SDK](https://github.com/openai/agents)
- [LangChain](https://langchain.com)
- [Claude Agent SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [CrewAI](https://www.crewai.com)

---

## 2. Authenticating Users

<a name="authenticating-users"></a>

### 2.1. Auto Authentication in Chat

<a name="auto-authentication-in-chat"></a>

**Impact:** 🟠 HIGH

> Allow users to authenticate toolkits directly within chat conversations

# Enable Auto Authentication in Chat

Enable `manageConnections` to allow users to authenticate toolkits on-demand during agent conversations.

## ❌ Incorrect

```typescript
// DON'T: Disable connection management for interactive apps
const session = await composio.create('user_123', {
  toolkits: ['gmail'],
  manageConnections: false // User can't authenticate!
});

// Agent tries to use Gmail but user isn't connected
// Tool execution will fail with no way to fix it
```

```python
# DON'T: Disable connection management for interactive apps
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail"],
    manage_connections=False  # User can't authenticate!
)

# Agent tries to use Gmail but user isn't connected
# Tool execution will fail with no way to fix it
```

## ✅ Correct

```typescript
// DO: Enable connection management for interactive apps
import { Composio } from '@composio/core';

const composio = new Composio();
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack'],
  manageConnections: true // Users can authenticate in chat
});

// When agent needs Gmail and user isn't connected:
// 1. Agent calls COMPOSIO_MANAGE_CONNECTIONS tool
// 2. User receives auth link in chat
// 3. User authenticates via OAuth
// 4. Agent continues with Gmail access
```

```python
# DO: Enable connection management for interactive apps
from composio import Composio

composio = Composio()
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack"],
    manage_connections=True  # Users can authenticate in chat
)

# When agent needs Gmail and user isn't connected:
# 1. Agent calls COMPOSIO_MANAGE_CONNECTIONS tool
# 2. User receives auth link in chat
# 3. User authenticates via OAuth
# 4. Agent continues with Gmail access
```

## Advanced: Custom Callback URL

```typescript
// Configure custom callback for OAuth flow
const session = await composio.create('user_123', {
  toolkits: ['gmail'],
  manageConnections: {
    enable: true,
    callbackUrl: 'https://your-app.com/auth/callback'
  }
});
```

```python
# Configure custom callback for OAuth flow
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail"],
    manage_connections={
        "enable": True,
        "callback_url": "https://your-app.com/auth/callback"
    }
)
```

## How It Works

1. Agent detects missing connection for a toolkit
2. Agent automatically calls meta tool `COMPOSIO_MANAGE_CONNECTIONS`
3. Tool returns OAuth redirect URL
4. User authenticates via the URL
5. Agent resumes with access granted

## Reference

- [Connection Management](https://docs.composio.dev/sdk/typescript/api/tool-router#manageconnections)
- [Authorization Flow](https://docs.composio.dev/sdk/typescript/api/tool-router#authorization-flow)

---

### 2.2. Manual Authorization

<a name="manual-authorization"></a>

**Impact:** 🟡 MEDIUM

> Control authentication flows explicitly using session.authorize() for onboarding and settings pages

# Use Manual Authorization for Explicit Control

Use `session.authorize()` to explicitly control when users authenticate toolkits - perfect for onboarding flows, settings pages, or when you want authentication before starting agent workflows.

## ❌ Incorrect

```typescript
// DON'T: Mix auto and manual auth without clear purpose
const session = await composio.create('user_123', {
  toolkits: ['gmail'],
  manageConnections: true // Agent handles auth
});

// Then immediately force manual auth (redundant)
await session.authorize('gmail');
// Agent could have handled this automatically
```

```python
# DON'T: Mix auto and manual auth without clear purpose
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail"],
    manage_connections=True  # Agent handles auth
)

# Then immediately force manual auth (redundant)
session.authorize("gmail")
# Agent could have handled this automatically
```

## ✅ Correct - Onboarding Flow

```typescript
// DO: Use manual auth for onboarding before agent starts
import { Composio } from '@composio/core';

const composio = new Composio();

// Step 1: Create session for onboarding
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack']
});

// Step 2: Explicitly connect required toolkits during onboarding
async function onboardUser() {
  const requiredToolkits = ['gmail', 'slack'];

  for (const toolkit of requiredToolkits) {
    const connectionRequest = await session.authorize(toolkit, {
      callbackUrl: 'https://your-app.com/onboarding/callback'
    });

    console.log(`Connect ${toolkit}:`, connectionRequest.redirectUrl);

    // Wait for user to complete each connection
    await connectionRequest.waitForConnection();
    console.log(`✓ ${toolkit} connected`);
  }

  console.log('Onboarding complete! All toolkits connected.');
}
```

```python
# DO: Use manual auth for onboarding before agent starts
from composio import Composio

composio = Composio()

# Step 1: Create session for onboarding
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack"]
)

# Step 2: Explicitly connect required toolkits during onboarding
async def onboard_user():
    required_toolkits = ["gmail", "slack"]

    for toolkit in required_toolkits:
        connection_request = session.authorize(
            toolkit,
            callback_url="https://your-app.com/onboarding/callback"
        )

        print(f"Connect {toolkit}: {connection_request.redirect_url}")

        # Wait for user to complete each connection
        connection_request.wait_for_connection()
        print(f"✓ {toolkit} connected")

    print("Onboarding complete! All toolkits connected.")
```

## ✅ Correct - Settings Page

```typescript
// DO: Manual auth for connection management in settings
async function settingsPageHandler(userId: string, toolkit: string) {
  const session = await composio.create(userId, {
    toolkits: [toolkit]
  });

  // User clicked "Connect" button in settings
  const connectionRequest = await session.authorize(toolkit, {
    callbackUrl: 'https://your-app.com/settings/callback'
  });

  // Redirect user to OAuth flow
  return { redirectUrl: connectionRequest.redirectUrl };
}
```

```python
# DO: Manual auth for connection management in settings
async def settings_page_handler(user_id: str, toolkit: str):
    session = composio.tool_router.create(
        user_id=user_id,
        toolkits=[toolkit]
    )

    # User clicked "Connect" button in settings
    connection_request = session.authorize(
        toolkit,
        callback_url="https://your-app.com/settings/callback"
    )

    # Redirect user to OAuth flow
    return {"redirect_url": connection_request.redirect_url}
```

## When to Use Manual Authorization

**Use `session.authorize()` for:**
- **Onboarding flows**: Connect required toolkits before user can proceed
- **Settings pages**: User explicitly manages connections via UI
- **Pre-authentication**: Ensure critical connections exist before starting workflows
- **Re-authorization**: Handle expired or revoked connections

**Use `manageConnections: true` (auto) for:**
- **Interactive agents**: Let agent prompt for auth when needed
- **Flexible workflows**: User may or may not have connections
- **Just-in-time auth**: Only authenticate when toolkit is actually used

## Key Difference

- **Manual auth** = You control WHEN authentication happens
- **Auto auth** = Agent handles authentication ON-DEMAND when tools need it

## Reference

- [session.authorize()](https://docs.composio.dev/sdk/typescript/api/tool-router#authorize)
- [Authorization Flow](https://docs.composio.dev/sdk/typescript/api/tool-router#authorization-flow)

---

### 2.3. Connection Management

<a name="connection-management"></a>

**Impact:** 🔴 CRITICAL

> Understand manageConnections settings to control authentication behavior in Tool Router

# Configure Connection Management Properly

The `manageConnections` setting determines how Tool Router handles missing toolkit connections. Configure it correctly based on your application type.

## ❌ Incorrect

```typescript
// DON'T: Disable connections in interactive applications
const session = await composio.create('user_123', {
  toolkits: ['gmail'],
  manageConnections: false // Tools will FAIL if user not connected!
});

// When agent tries to use Gmail:
// ❌ Error: No connected account found for gmail
// User has no way to authenticate
```

```python
# DON'T: Disable connections in interactive applications
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail"],
    manage_connections=False  # Tools will FAIL if user not connected!
)

# When agent tries to use Gmail:
# ❌ Error: No connected account found for gmail
# User has no way to authenticate
```

## ✅ Correct - Enable Auto Authentication (Default)

```typescript
// DO: Enable connection management for interactive apps
import { Composio } from '@composio/core';

const composio = new Composio();

// Option 1: Use default (manageConnections: true)
const session1 = await composio.create('user_123', {
  toolkits: ['gmail', 'slack']
  // manageConnections defaults to true
});

// Option 2: Explicitly enable with boolean
const session2 = await composio.create('user_123', {
  toolkits: ['gmail'],
  manageConnections: true // Agent can prompt for auth
});

// How it works:
// 1. Agent tries to use Gmail tool
// 2. No connection exists
// 3. Agent calls COMPOSIO_MANAGE_CONNECTIONS meta tool
// 4. User receives auth link in chat
// 5. User authenticates
// 6. Agent continues with Gmail access
```

```python
# DO: Enable connection management for interactive apps
from composio import Composio

composio = Composio()

# Option 1: Use default (manage_connections: True)
session1 = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack"]
    # manage_connections defaults to True
)

# Option 2: Explicitly enable with boolean
session2 = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail"],
    manage_connections=True  # Agent can prompt for auth
)

# How it works:
# 1. Agent tries to use Gmail tool
# 2. No connection exists
# 3. Agent calls COMPOSIO_MANAGE_CONNECTIONS meta tool
# 4. User receives auth link in chat
# 5. User authenticates
# 6. Agent continues with Gmail access
```

## ✅ Correct - Advanced Configuration

```typescript
// DO: Configure with object for fine-grained control
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack'],
  manageConnections: {
    enable: true, // Allow in-chat authentication
    callbackUrl: 'https://your-app.com/auth/callback', // Custom OAuth callback
    waitForConnections: true // Wait for user to complete auth before proceeding
  }
});

// With waitForConnections: true
// Session creation waits until user completes authentication
// Perfect for workflows where connections are required upfront
```

```python
# DO: Configure with object for fine-grained control
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack"],
    manage_connections={
        "enable": True,  # Allow in-chat authentication
        "callback_url": "https://your-app.com/auth/callback",  # Custom OAuth callback
        "wait_for_connections": True  # Wait for user to complete auth before proceeding
    }
)

# With wait_for_connections: True
# Session creation waits until user completes authentication
# Perfect for workflows where connections are required upfront
```

## Configuration Options

```typescript
manageConnections: boolean | {
  enable?: boolean;           // Enable/disable connection management (default: true)
  callbackUrl?: string;       // Custom OAuth callback URL
  waitForConnections?: boolean; // Block until connections complete (default: false)
}
```

## When to Use Each Setting

**`manageConnections: true` (Default)**
- Interactive chat applications
- User can authenticate on-demand
- Flexible, user-friendly experience

**`manageConnections: { waitForConnections: true }`**
- Workflows requiring connections upfront
- Onboarding flows
- Critical operations needing guaranteed access

**`manageConnections: false`**
- Backend automation (no user interaction)
- Pre-connected accounts only
- System-to-system integrations
- ⚠️ Tools WILL FAIL if connections are missing

## Key Insight

With `manageConnections: true`, **you never need to check connections before agent execution**. The agent intelligently prompts users for authentication only when needed. This creates the smoothest user experience.

## Reference

- [Connection Management](https://docs.composio.dev/sdk/typescript/api/tool-router#manageconnections)
- [Wait for Connections](https://docs.composio.dev/sdk/typescript/api/tool-router#wait-for-connections)

---

### 2.4. Wait for Connections

_Rule file not found: tr-auth-wait.md_

### 2.5. Custom Callback URLs

_Rule file not found: tr-auth-callbacks.md_

## 3. Fetching Toolkits and Connection Status

<a name="fetching-toolkits-and-connection-status"></a>

### 3.1. Query Toolkit States

<a name="query-toolkit-states"></a>

**Impact:** 🟡 MEDIUM

> Use session.toolkits() to build connection management UIs showing which toolkits are connected

# Query Toolkit Connection States for UI

Use `session.toolkits()` to check connection status and build UIs showing which toolkits are connected. With `manageConnections: true`, agents handle missing connections automatically.

## ❌ Incorrect

```typescript
// DON'T: Build UI without showing connection status
async function showToolkits(session) {
  // Just show toolkit names with no status
  const toolkits = ['Gmail', 'Slack', 'GitHub'];

  return toolkits.map(name => ({
    name,
    // Missing: connection status, auth button, etc.
  }));
}
```

```python
# DON'T: Build UI without showing connection status
def show_toolkits(session):
    # Just show toolkit names with no status
    toolkits = ["Gmail", "Slack", "GitHub"]

    return [{"name": name} for name in toolkits]
    # Missing: connection status, auth button, etc.
```

## ✅ Correct

```typescript
// DO: Query connection states to build connection UI
import { Composio } from '@composio/core';

const composio = new Composio();
const session = await composio.create('user_123', {
  toolkits: ['gmail', 'slack', 'github'],
  manageConnections: true // Agent handles auth automatically
});

// Get connection states for building UI
const { items } = await session.toolkits();

// Build connection management UI
const connectionUI = items.map(toolkit => ({
  slug: toolkit.slug,
  name: toolkit.name,
  logo: toolkit.logo,
  isConnected: toolkit.connection?.isActive || false,
  status: toolkit.connection?.connectedAccount?.status,
  // Show "Connect" button if not connected
  needsAuth: !toolkit.connection?.isActive && !toolkit.isNoAuth
}));

console.log('Connection Status:', connectionUI);
// Use this to render connection cards in your UI
```

```python
# DO: Query connection states to build connection UI
from composio import Composio

composio = Composio()
session = composio.tool_router.create(
    user_id="user_123",
    toolkits=["gmail", "slack", "github"],
    manage_connections=True  # Agent handles auth automatically
)

# Get connection states for building UI
result = session.toolkits()

# Build connection management UI
connection_ui = []
for toolkit in result.items:
    connection_ui.append({
        "slug": toolkit.slug,
        "name": toolkit.name,
        "logo": toolkit.logo,
        "is_connected": toolkit.connection.is_active if toolkit.connection else False,
        "status": toolkit.connection.connected_account.status if toolkit.connection.connected_account else None,
        # Show "Connect" button if not connected
        "needs_auth": not (toolkit.connection.is_active if toolkit.connection else False) and not toolkit.is_no_auth
    })

print(f"Connection Status: {connection_ui}")
# Use this to render connection cards in your UI
```

## Response Structure

```typescript
interface ToolkitConnectionState {
  slug: string;              // 'gmail'
  name: string;              // 'Gmail'
  logo?: string;             // 'https://...'
  isNoAuth: boolean;         // true if no auth needed
  connection: {
    isActive: boolean;       // Is connection active?
    authConfig?: {
      id: string;            // Auth config ID
      mode: string;          // 'OAUTH2', 'API_KEY', etc.
      isComposioManaged: boolean;
    };
    connectedAccount?: {
      id: string;            // Connected account ID
      status: string;        // 'ACTIVE', 'INVALID', etc.
    };
  };
}
```

## Use Cases

- **Build connection UI**: Display connected/disconnected state with auth buttons
- **Settings pages**: Let users view and manage their connections
- **Onboarding flows**: Show which toolkits to connect during setup
- **Status dashboards**: Monitor connection health across toolkits

## Important Note

With `manageConnections: true` (default), you don't need to check connections before agent execution - the agent will prompt users to authenticate when needed. Use `session.toolkits()` primarily for building user-facing connection management UIs.

## Reference

- [session.toolkits()](https://docs.composio.dev/sdk/typescript/api/tool-router#toolkits)
- [Toolkit Connection State](https://docs.composio.dev/sdk/typescript/api/tool-router#toolkitconnectionstate)

---

### 3.2. Build Connection UI

_Rule file not found: tr-toolkit-ui.md_

### 3.3. Filter Toolkits

_Rule file not found: tr-toolkit-filter.md_

### 3.4. Pagination

_Rule file not found: tr-toolkit-pagination.md_

### 3.5. Connection Details

_Rule file not found: tr-toolkit-details.md_

## 4. Advanced Features (Triggers & Events)

<a name="advanced-features-triggers-events"></a>

### 4.1. Creating Triggers

<a name="creating-triggers"></a>

**Impact:** 🟠 HIGH

> Set up trigger instances to receive real-time events from connected accounts

# Create Triggers for Real-Time Events

Triggers allow you to receive real-time events from connected accounts (e.g., new Gmail messages, GitHub pushes, Slack mentions). Create trigger instances using `composio.triggers.create()` to subscribe to specific events.

## ❌ Incorrect

```typescript
// DON'T: Use 'default' user ID in production
const trigger = await composio.triggers.create('default', 'GMAIL_NEW_GMAIL_MESSAGE', {
  triggerConfig: {
    labelIds: 'INBOX',
    interval: 60
  }
});

// ❌ No user isolation
// ❌ All users share the same trigger
// ❌ Security risk
```

```python
# DON'T: Use 'default' user ID in production
trigger = composio.triggers.create(
    user_id="default",
    trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
    trigger_config={
        "labelIds": "INBOX",
        "interval": 60
    }
)

# ❌ No user isolation
# ❌ All users share the same trigger
# ❌ Security risk
```

```typescript
// DON'T: Create triggers without connected accounts
try {
  const trigger = await composio.triggers.create(userId, 'GMAIL_NEW_GMAIL_MESSAGE', {
    triggerConfig: { labelIds: 'INBOX' }
  });
} catch (error) {
  // ❌ Will fail with ComposioConnectedAccountNotFoundError
  // User must connect account first
}
```

## ✅ Correct - Create Trigger with User ID

```typescript
// DO: Use proper user ID for isolation
import { Composio } from '@composio/core';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY
});

async function createGmailTrigger(userId: string, connectedAccountId: string) {
  try {
    const trigger = await composio.triggers.create(
      userId,
      'GMAIL_NEW_GMAIL_MESSAGE',
      {
        connectedAccountId, // Specify which connected account
        triggerConfig: {
          labelIds: 'INBOX', // Trigger-specific config
          userId: 'me',
          interval: 60 // Check every 60 seconds
        }
      }
    );

    console.log('Trigger created:', trigger.triggerId);

    // ✅ User-specific trigger
    // ✅ Isolated event delivery
    // ✅ Secure and scalable
    return trigger;
  } catch (error) {
    console.error('Failed to create trigger:', error);
    throw error;
  }
}
```

```python
# DO: Use proper user ID for isolation
from composio import Composio

composio = Composio(api_key=os.environ["COMPOSIO_API_KEY"])

async def create_gmail_trigger(user_id: str, connected_account_id: str):
    try:
        trigger = composio.triggers.create(
            user_id=user_id,
            trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
            connected_account_id=connected_account_id,  # Specify which connected account
            trigger_config={
                "labelIds": "INBOX",  # Trigger-specific config
                "userId": "me",
                "interval": 60  # Check every 60 seconds
            }
        )

        print(f"Trigger created: {trigger.trigger_id}")

        # ✅ User-specific trigger
        # ✅ Isolated event delivery
        # ✅ Secure and scalable
        return trigger
    except Exception as error:
        print(f"Failed to create trigger: {error}")
        raise
```

## ✅ Correct - Let SDK Find Connected Account

```typescript
// DO: SDK automatically finds first available connected account
async function createTriggerSimple(userId: string) {
  // If user has only one Gmail account connected
  const trigger = await composio.triggers.create(
    userId,
    'GMAIL_NEW_GMAIL_MESSAGE',
    {
      // No connectedAccountId - uses first available
      triggerConfig: {
        labelIds: 'INBOX'
      }
    }
  );

  // ✅ Convenient for single-account users
  // ⚠️  SDK logs warning if multiple accounts exist
  return trigger;
}
```

```python
# DO: SDK automatically finds first available connected account
async def create_trigger_simple(user_id: str):
    # If user has only one Gmail account connected
    trigger = composio.triggers.create(
        user_id=user_id,
        trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
        trigger_config={
            "labelIds": "INBOX"
        }
    )

    # ✅ Convenient for single-account users
    # ⚠️  SDK logs warning if multiple accounts exist
    return trigger
```

## ✅ Correct - Triggers Are Automatically Reused

```typescript
// DO: Same config = same trigger (no duplicates)
async function ensureTriggerExists(userId: string, connectedAccountId: string) {
  // First call: Creates new trigger
  const trigger1 = await composio.triggers.create(
    userId,
    'GMAIL_NEW_GMAIL_MESSAGE',
    {
      connectedAccountId,
      triggerConfig: {
        labelIds: 'INBOX',
        interval: 60
      }
    }
  );

  console.log('First call:', trigger1.triggerId);

  // Second call with SAME config: Returns existing trigger
  const trigger2 = await composio.triggers.create(
    userId,
    'GMAIL_NEW_GMAIL_MESSAGE',
    {
      connectedAccountId,
      triggerConfig: {
        labelIds: 'INBOX',
        interval: 60
      }
    }
  );

  console.log('Second call:', trigger2.triggerId);
  // ✅ trigger1.triggerId === trigger2.triggerId
  // ✅ No duplicate triggers created
  // ✅ Idempotent operation
}
```

```python
# DO: Same config = same trigger (no duplicates)
async def ensure_trigger_exists(user_id: str, connected_account_id: str):
    # First call: Creates new trigger
    trigger1 = composio.triggers.create(
        user_id=user_id,
        trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
        connected_account_id=connected_account_id,
        trigger_config={
            "labelIds": "INBOX",
            "interval": 60
        }
    )

    print(f"First call: {trigger1.trigger_id}")

    # Second call with SAME config: Returns existing trigger
    trigger2 = composio.triggers.create(
        user_id=user_id,
        trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
        connected_account_id=connected_account_id,
        trigger_config={
            "labelIds": "INBOX",
            "interval": 60
        }
    )

    print(f"Second call: {trigger2.trigger_id}")
    # ✅ trigger1.trigger_id == trigger2.trigger_id
    # ✅ No duplicate triggers created
    # ✅ Idempotent operation
```

**Important:** Triggers are deduplicated based on:
- User ID
- Trigger slug
- Connected account ID
- Trigger configuration

If all these match, Composio returns the existing trigger instead of creating a duplicate.

## ✅ Correct - Pin Trigger Versions

```typescript
// DO: Pin toolkit versions for production stability
const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  toolkitVersions: {
    gmail: '12082025_00',
    github: '10082025_01',
    slack: '15082025_00'
  }
});

// Triggers created will use these specific versions
const trigger = await composio.triggers.create(
  userId,
  'GMAIL_NEW_GMAIL_MESSAGE',
  {
    connectedAccountId,
    triggerConfig: { labelIds: 'INBOX' }
  }
);

// ✅ Predictable behavior
// ✅ No breaking changes from 'latest'
// ✅ Production-ready
```

```python
# DO: Pin toolkit versions for production stability
composio = Composio(
    api_key=os.environ["COMPOSIO_API_KEY"],
    toolkit_versions={
        "gmail": "12082025_00",
        "github": "10082025_01",
        "slack": "15082025_00"
    }
)

# Triggers created will use these specific versions
trigger = composio.triggers.create(
    user_id=user_id,
    trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
    connected_account_id=connected_account_id,
    trigger_config={"labelIds": "INBOX"}
)

# ✅ Predictable behavior
# ✅ No breaking changes from 'latest'
# ✅ Production-ready
```

## Common Trigger Configurations

### GitHub Push Events
```typescript
const trigger = await composio.triggers.create(
  userId,
  'GITHUB_PUSH_EVENT',
  {
    connectedAccountId,
    triggerConfig: {
      owner: 'username',
      repo: 'repository-name',
      branch: 'main' // Optional: specific branch
    }
  }
);
```

### Slack Mentions
```typescript
const trigger = await composio.triggers.create(
  userId,
  'SLACK_RECEIVE_MESSAGE',
  {
    connectedAccountId,
    triggerConfig: {
      channel: '#general',
      keywords: ['@bot', 'help'] // Trigger on mentions
    }
  }
);
```

### Google Calendar Events
```typescript
const trigger = await composio.triggers.create(
  userId,
  'GOOGLECALENDAR_EVENT_CREATED',
  {
    connectedAccountId,
    triggerConfig: {
      calendarId: 'primary',
      interval: 300 // Check every 5 minutes
    }
  }
);
```

### Linear Issue Updates
```typescript
const trigger = await composio.triggers.create(
  userId,
  'LINEAR_ISSUE_UPDATED',
  {
    connectedAccountId,
    triggerConfig: {
      teamId: 'team-uuid',
      labelIds: ['bug', 'urgent']
    }
  }
);
```

## Error Handling

```typescript
import {
  ComposioTriggerTypeNotFoundError,
  ComposioConnectedAccountNotFoundError,
  ValidationError
} from '@composio/core';

async function createTriggerSafely(
  userId: string,
  triggerSlug: string,
  connectedAccountId: string
) {
  try {
    const trigger = await composio.triggers.create(
      userId,
      triggerSlug,
      {
        connectedAccountId,
        triggerConfig: {}
      }
    );

    return { success: true, triggerId: trigger.triggerId };
  } catch (error) {
    if (error instanceof ComposioTriggerTypeNotFoundError) {
      // Invalid trigger slug
      console.error('Trigger type not found:', triggerSlug);
      return { success: false, error: 'INVALID_TRIGGER_TYPE' };
    }

    if (error instanceof ComposioConnectedAccountNotFoundError) {
      // User hasn't connected the account
      console.error('No connected account for user:', userId);
      return { success: false, error: 'ACCOUNT_NOT_CONNECTED' };
    }

    if (error instanceof ValidationError) {
      // Invalid configuration
      console.error('Invalid trigger config:', error.message);
      return { success: false, error: 'INVALID_CONFIG' };
    }

    // Unexpected error
    console.error('Unexpected error:', error);
    return { success: false, error: 'UNKNOWN_ERROR' };
  }
}
```

## Discovering Available Triggers

### List Triggers Available in a Toolkit

```typescript
// DO: Fetch all available trigger types for a toolkit
async function getAvailableTriggers(toolkit: string) {
  const triggers = await composio.triggers.listTypes({
    toolkits: [toolkit],
    limit: 50
  });

  console.log(`Available ${toolkit} triggers:`);
  triggers.items.forEach(trigger => {
    console.log(`  ${trigger.slug}`);
    console.log(`    ${trigger.description}`);
    console.log(`    Required config: ${JSON.stringify(trigger.config)}`);
  });

  return triggers;
}

// Example: Get all Gmail triggers
await getAvailableTriggers('gmail');

// Example: Get all GitHub triggers
await getAvailableTriggers('github');
```

```python
# DO: Fetch all available trigger types for a toolkit
async def get_available_triggers(toolkit: str):
    triggers = composio.triggers.list_types(
        toolkits=[toolkit],
        limit=50
    )

    print(f"Available {toolkit} triggers:")
    for trigger in triggers.items:
        print(f"  {trigger.slug}")
        print(f"    {trigger.description}")
        print(f"    Required config: {trigger.config}")

    return triggers

# Example: Get all Gmail triggers
await get_available_triggers("gmail")

# Example: Get all GitHub triggers
await get_available_triggers("github")
```

### Get Details About Specific Trigger Type

```typescript
// Get schema and configuration requirements
const triggerType = await composio.triggers.getType('GMAIL_NEW_GMAIL_MESSAGE');

console.log('Trigger:', triggerType.slug);
console.log('Description:', triggerType.description);
console.log('Toolkit:', triggerType.toolkit.slug);
console.log('Config schema:', triggerType.config);
console.log('Required fields:', triggerType.config.required);
```

```python
# Get schema and configuration requirements
trigger_type = composio.triggers.get_type("GMAIL_NEW_GMAIL_MESSAGE")

print(f"Trigger: {trigger_type.slug}")
print(f"Description: {trigger_type.description}")
print(f"Toolkit: {trigger_type.toolkit.slug}")
print(f"Config schema: {trigger_type.config}")
print(f"Required fields: {trigger_type.config.required}")
```

## Fetching Active Triggers

### List All Active Triggers for a User

```typescript
// DO: Fetch all active triggers for a user
async function getUserActiveTriggers(userId: string) {
  const triggers = await composio.triggers.listActive({
    connectedAccountIds: [], // Leave empty to get all user triggers
    showDisabled: false, // Only active triggers
    limit: 50
  });

  // Filter by user (if needed, API may already filter)
  const userTriggers = triggers.items.filter(t => t.userId === userId);

  console.log(`Active triggers for user ${userId}:`);
  userTriggers.forEach(trigger => {
    console.log(`  Trigger ID: ${trigger.id}`);
    console.log(`  Type: ${trigger.triggerSlug}`);
    console.log(`  Toolkit: ${trigger.toolkitSlug}`);
    console.log(`  Status: ${trigger.status}`);
    console.log(`  Config: ${JSON.stringify(trigger.config)}`);
  });

  return userTriggers;
}
```

```python
# DO: Fetch all active triggers for a user
async def get_user_active_triggers(user_id: str):
    triggers = composio.triggers.list_active(
        connected_account_ids=[],  # Leave empty to get all user triggers
        show_disabled=False,  # Only active triggers
        limit=50
    )

    # Filter by user (if needed, API may already filter)
    user_triggers = [t for t in triggers.items if t.user_id == user_id]

    print(f"Active triggers for user {user_id}:")
    for trigger in user_triggers:
        print(f"  Trigger ID: {trigger.id}")
        print(f"  Type: {trigger.trigger_slug}")
        print(f"  Toolkit: {trigger.toolkit_slug}")
        print(f"  Status: {trigger.status}")
        print(f"  Config: {trigger.config}")

    return user_triggers
```

### List Active Triggers for Specific Connected Account

```typescript
// DO: Fetch triggers for a specific connected account
async function getAccountActiveTriggers(connectedAccountId: string) {
  const triggers = await composio.triggers.listActive({
    connectedAccountIds: [connectedAccountId],
    showDisabled: false,
    limit: 50
  });

  console.log(`Active triggers for account ${connectedAccountId}:`);
  triggers.items.forEach(trigger => {
    console.log(`  ${trigger.triggerSlug} (${trigger.id})`);
  });

  return triggers;
}
```

```python
# DO: Fetch triggers for a specific connected account
async def get_account_active_triggers(connected_account_id: str):
    triggers = composio.triggers.list_active(
        connected_account_ids=[connected_account_id],
        show_disabled=False,
        limit=50
    )

    print(f"Active triggers for account {connected_account_id}:")
    for trigger in triggers.items:
        print(f"  {trigger.trigger_slug} ({trigger.id})")

    return triggers
```

### Filter Active Triggers with Advanced Options

```typescript
// DO: Use advanced filtering
async function filterActiveTriggers() {
  const triggers = await composio.triggers.listActive({
    // Filter by specific auth configs
    authConfigIds: ['auth-config-id-1', 'auth-config-id-2'],

    // Filter by connected accounts
    connectedAccountIds: ['ca_account1', 'ca_account2'],

    // Filter by trigger IDs
    triggerIds: ['trigger-id-1'],

    // Filter by trigger names
    triggerNames: ['GMAIL_NEW_GMAIL_MESSAGE', 'GITHUB_PUSH_EVENT'],

    // Include disabled triggers
    showDisabled: true,

    // Pagination
    limit: 20,
    cursor: 'cursor-for-next-page'
  });

  console.log(`Found ${triggers.items.length} triggers`);
  console.log(`Next cursor: ${triggers.nextCursor}`);

  return triggers;
}
```

```python
# DO: Use advanced filtering
async def filter_active_triggers():
    triggers = composio.triggers.list_active(
        # Filter by specific auth configs
        auth_config_ids=["auth-config-id-1", "auth-config-id-2"],

        # Filter by connected accounts
        connected_account_ids=["ca_account1", "ca_account2"],

        # Filter by trigger IDs
        trigger_ids=["trigger-id-1"],

        # Filter by trigger names
        trigger_names=["GMAIL_NEW_GMAIL_MESSAGE", "GITHUB_PUSH_EVENT"],

        # Include disabled triggers
        show_disabled=True,

        # Pagination
        limit=20,
        cursor="cursor-for-next-page"
    )

    print(f"Found {len(triggers.items)} triggers")
    print(f"Next cursor: {triggers.next_cursor}")

    return triggers
```

## Best Practices

### 1. **Always Use Real User IDs**
- Never use 'default' in production multi-user apps
- Use database UUIDs or auth provider IDs
- Ensures proper event isolation

### 2. **Specify Connected Account ID**
- Recommended when users have multiple accounts
- Prevents ambiguity and unexpected behavior
- More explicit and maintainable

### 3. **Pin Toolkit Versions in Production**
- Use specific versions (e.g., '12082025_00')
- Avoid 'latest' for production triggers
- Prevents breaking changes

### 4. **Validate Trigger Configurations**
- Use getType() to understand config schema
- Validate user inputs before creating triggers
- Handle errors gracefully

### 5. **Store Trigger IDs**
- Save trigger.triggerId to your database
- Needed for updating or disabling triggers later
- Link triggers to user accounts

### 6. **Check Connected Accounts First**
- Verify user has connected account before creating trigger
- Guide users through connection flow if needed
- Better UX than showing error after creation attempt

## Pattern: Onboarding with Triggers

```typescript
async function setupUserTriggers(userId: string) {
  // 1. Check if user has connected Gmail
  const accounts = await composio.connectedAccounts.list(userId, {
    toolkit: 'gmail'
  });

  if (accounts.length === 0) {
    // Guide user to connect account first
    const authReq = await composio.connectedAccounts.initiate({
      userId,
      toolkit: 'gmail'
    });
    return { needsAuth: true, redirectUrl: authReq.redirectUrl };
  }

  // 2. Create trigger with first connected account
  // If trigger already exists with same config, returns existing one
  const trigger = await composio.triggers.create(
    userId,
    'GMAIL_NEW_GMAIL_MESSAGE',
    {
      connectedAccountId: accounts[0].id,
      triggerConfig: { labelIds: 'INBOX' }
    }
  );

  // 3. Save trigger ID to database (idempotent)
  await database.userTriggers.upsert({
    userId,
    triggerId: trigger.triggerId,
    type: 'GMAIL_NEW_GMAIL_MESSAGE',
    status: 'active'
  });

  return { needsAuth: false, triggerId: trigger.triggerId };
}
```

## Pattern: Check Existing Triggers Before Creating

```typescript
async function ensureTriggerSetup(
  userId: string,
  connectedAccountId: string,
  triggerSlug: string
) {
  // 1. Check if trigger already exists
  const existingTriggers = await composio.triggers.listActive({
    connectedAccountIds: [connectedAccountId],
    triggerNames: [triggerSlug],
    showDisabled: false
  });

  if (existingTriggers.items.length > 0) {
    console.log('Trigger already exists:', existingTriggers.items[0].id);
    return {
      created: false,
      triggerId: existingTriggers.items[0].id
    };
  }

  // 2. Create new trigger if not exists
  const trigger = await composio.triggers.create(
    userId,
    triggerSlug,
    {
      connectedAccountId,
      triggerConfig: { labelIds: 'INBOX' }
    }
  );

  console.log('New trigger created:', trigger.triggerId);
  return {
    created: true,
    triggerId: trigger.triggerId
  };
}
```

```python
async def ensure_trigger_setup(
    user_id: str,
    connected_account_id: str,
    trigger_slug: str
):
    # 1. Check if trigger already exists
    existing_triggers = composio.triggers.list_active(
        connected_account_ids=[connected_account_id],
        trigger_names=[trigger_slug],
        show_disabled=False
    )

    if len(existing_triggers.items) > 0:
        print(f"Trigger already exists: {existing_triggers.items[0].id}")
        return {
            "created": False,
            "trigger_id": existing_triggers.items[0].id
        }

    # 2. Create new trigger if not exists
    trigger = composio.triggers.create(
        user_id=user_id,
        trigger_slug=trigger_slug,
        connected_account_id=connected_account_id,
        trigger_config={"labelIds": "INBOX"}
    )

    print(f"New trigger created: {trigger.trigger_id}")
    return {
        "created": True,
        "trigger_id": trigger.trigger_id
    }
```

## Key Principles

1. **User isolation** - Use proper user IDs, never 'default' in production
2. **Explicit accounts** - Specify connectedAccountId when multiple accounts exist
3. **Version pinning** - Use specific toolkit versions for production stability
4. **Error handling** - Catch and handle specific error types gracefully
5. **Persistence** - Store trigger IDs for later management
6. **Validation** - Check connected accounts before creating triggers
7. **Idempotency** - Same config = same trigger, no duplicates created
8. **Discovery** - Use listTypes() to find available triggers, listActive() to see existing ones

## Reference

- [Triggers API Documentation](https://docs.composio.dev/sdk/typescript/api/triggers)
- [Connected Accounts](https://docs.composio.dev/sdk/typescript/api/connected-accounts)
- [Toolkit Versions](https://docs.composio.dev/sdk/typescript/getting-started#toolkit-versions)

---

### 4.2. Subscribing to Events

<a name="subscribing-to-events"></a>

**Impact:** 🟡 MEDIUM

> Use real-time subscription for local development and testing, not production

# Subscribe to Trigger Events (Development Only)

The `composio.triggers.subscribe()` method provides real-time event delivery over WebSocket connections. **Use this ONLY for local development and testing.** For production, use webhooks for reliability and scalability.

## ⚠️ Important: Development vs Production

| Feature | Subscribe (WebSocket) | Webhooks (HTTP) |
|---------|----------------------|-----------------|
| **Use Case** | Development, testing, debugging | Production applications |
| **Reliability** | ❌ Connection drops, no retry | ✅ Automatic retries, delivery guarantees |
| **Scalability** | ❌ Single connection, stateful | ✅ Horizontal scaling, stateless |
| **Persistence** | ❌ Events lost if disconnected | ✅ Events queued and delivered |
| **Deployment** | ❌ Requires long-lived process | ✅ Works with serverless, containers |
| **Debugging** | ✅ Instant feedback | ⚠️ Requires endpoint setup |
| **Recommendation** | Development only | Production required |

## ❌ Incorrect - Using Subscribe in Production

```typescript
// DON'T: Use subscribe() in production
import { Composio } from '@composio/core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// Production server
app.listen(3000, () => {
  // ❌ WebSocket connection is fragile
  // ❌ Connection drops = missed events
  // ❌ No retry mechanism
  // ❌ Doesn't scale horizontally
  // ❌ Process restart = all events lost
  composio.triggers.subscribe(triggerData => {
    console.log('Trigger received:', triggerData);
    // Process event...
  });
});
```

```python
# DON'T: Use subscribe() in production
from composio import Composio

composio = Composio(api_key=os.environ["COMPOSIO_API_KEY"])

# Production server
def start_server():
    # ❌ WebSocket connection is fragile
    # ❌ Connection drops = missed events
    # ❌ No retry mechanism
    # ❌ Doesn't scale horizontally
    # ❌ Process restart = all events lost
    composio.triggers.subscribe(
        callback=lambda trigger_data: print(f"Trigger: {trigger_data}")
    )
```

## ✅ Correct - Subscribe for Local Development

```typescript
// DO: Use subscribe() for local development and debugging
import { Composio } from '@composio/core';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY
});

async function developmentListener() {
  console.log('🔧 Starting development trigger listener...');
  console.log('⚠️  This is for local testing only!');
  console.log('📦 For production, use webhooks instead.');

  // Subscribe to all triggers
  composio.triggers.subscribe(triggerData => {
    console.log('\n🔔 Trigger received:');
    console.log('  Trigger:', triggerData.triggerSlug);
    console.log('  Toolkit:', triggerData.toolkitSlug);
    console.log('  User:', triggerData.userId);
    console.log('  Payload:', JSON.stringify(triggerData.payload, null, 2));

    // ✅ Perfect for debugging
    // ✅ Instant feedback
    // ✅ See events as they happen
  });

  console.log('✅ Listening for triggers...');
}

// Run only in development
if (process.env.NODE_ENV === 'development') {
  developmentListener();
}
```

```python
# DO: Use subscribe() for local development and debugging
from composio import Composio
import os

composio = Composio(api_key=os.environ["COMPOSIO_API_KEY"])

def development_listener():
    print("🔧 Starting development trigger listener...")
    print("⚠️  This is for local testing only!")
    print("📦 For production, use webhooks instead.")

    # Subscribe to all triggers
    def on_trigger(trigger_data):
        print("\n🔔 Trigger received:")
        print(f"  Trigger: {trigger_data.trigger_slug}")
        print(f"  Toolkit: {trigger_data.toolkit_slug}")
        print(f"  User: {trigger_data.user_id}")
        print(f"  Payload: {trigger_data.payload}")

        # ✅ Perfect for debugging
        # ✅ Instant feedback
        # ✅ See events as they happen

    composio.triggers.subscribe(callback=on_trigger)
    print("✅ Listening for triggers...")

# Run only in development
if os.environ.get("NODE_ENV") == "development":
    development_listener()
```

## ✅ Correct - Subscribe with Filters

```typescript
// DO: Filter triggers for specific testing
async function testGmailTriggers(userId: string) {
  console.log('Testing Gmail triggers for user:', userId);

  composio.triggers.subscribe(
    triggerData => {
      console.log('Gmail event:', triggerData.triggerSlug);
      console.log('Email data:', triggerData.payload);

      // Test your agent logic here
      // processEmailEvent(triggerData);
    },
    {
      // Filter options
      toolkits: ['gmail'], // Only Gmail triggers
      userId: userId, // Specific user
      triggerSlug: ['GMAIL_NEW_GMAIL_MESSAGE'] // Specific trigger type
    }
  );

  console.log('Listening for Gmail events...');
}
```

```python
# DO: Filter triggers for specific testing
def test_gmail_triggers(user_id: str):
    print(f"Testing Gmail triggers for user: {user_id}")

    def on_gmail_event(trigger_data):
        print(f"Gmail event: {trigger_data.trigger_slug}")
        print(f"Email data: {trigger_data.payload}")

        # Test your agent logic here
        # process_email_event(trigger_data)

    composio.triggers.subscribe(
        callback=on_gmail_event,
        filters={
            "toolkits": ["gmail"],  # Only Gmail triggers
            "user_id": user_id,  # Specific user
            "trigger_slug": ["GMAIL_NEW_GMAIL_MESSAGE"]  # Specific trigger type
        }
    )

    print("Listening for Gmail events...")
```

## Subscribe Filter Options

```typescript
interface SubscribeFilters {
  // Filter by toolkits
  toolkits?: string[]; // ['gmail', 'github']

  // Filter by specific trigger ID
  triggerId?: string; // 'trigger-abc123'

  // Filter by connected account
  connectedAccountId?: string; // 'ca_account123'

  // Filter by trigger types
  triggerSlug?: string[]; // ['GMAIL_NEW_GMAIL_MESSAGE']

  // Filter by custom trigger data
  triggerData?: string; // Custom metadata

  // Filter by user ID
  userId?: string; // 'user-456'
}
```

## Trigger Payload Structure

```typescript
interface IncomingTriggerPayload {
  // Trigger instance ID
  id: string; // 'trigger-nano-123'
  uuid: string; // 'trigger-uuid-456'

  // Trigger type and toolkit
  triggerSlug: string; // 'GMAIL_NEW_GMAIL_MESSAGE'
  toolkitSlug: string; // 'gmail'

  // User information
  userId: string; // 'user-789'

  // Event data
  payload: Record<string, unknown>; // Processed event data
  originalPayload: Record<string, unknown>; // Raw event data

  // Metadata
  metadata: {
    id: string;
    uuid: string;
    toolkitSlug: string;
    triggerSlug: string;
    triggerConfig: Record<string, unknown>;
    connectedAccount: {
      id: string; // Connected account nano ID
      uuid: string; // Connected account UUID
      authConfigId: string; // Auth config nano ID
      authConfigUUID: string; // Auth config UUID
      userId: string; // User ID
      status: string; // Connection status
    };
  };
}
```

## Development Patterns

### Pattern: Test Trigger Before Production

```typescript
// Test trigger locally before deploying webhook handler
async function testTriggerSetup() {
  console.log('🧪 Testing trigger configuration...\n');

  // 1. Create trigger
  const trigger = await composio.triggers.create(
    'user_123',
    'GMAIL_NEW_GMAIL_MESSAGE',
    {
      connectedAccountId: 'ca_gmail',
      triggerConfig: { labelIds: 'INBOX' }
    }
  );

  console.log('✅ Trigger created:', trigger.triggerId);

  // 2. Subscribe to test it
  console.log('👂 Listening for events...\n');

  let eventCount = 0;

  composio.triggers.subscribe(
    triggerData => {
      eventCount++;
      console.log(`\n📬 Event ${eventCount} received:`);
      console.log('  From:', triggerData.payload.from);
      console.log('  Subject:', triggerData.payload.subject);

      // Test your processing logic
      console.log('\n✅ Processing logic:');
      // processEmail(triggerData);
      console.log('  Would send notification...');
      console.log('  Would update database...');
      console.log('  Would trigger agent...');
    },
    {
      triggerId: trigger.triggerId
    }
  );

  console.log('💡 Send a test email to trigger the event');
  console.log('🛑 Press Ctrl+C to stop when done testing\n');
}
```

### Pattern: Debug Event Payload Structure

```typescript
// Understand event structure before building production handler
async function debugEventStructure() {
  composio.triggers.subscribe(triggerData => {
    console.log('\n📋 Full Event Structure:');
    console.log(JSON.stringify(triggerData, null, 2));

    console.log('\n🔍 Parsed Fields:');
    console.log('  ID:', triggerData.id);
    console.log('  Type:', triggerData.triggerSlug);
    console.log('  User:', triggerData.userId);
    console.log('  Payload Keys:', Object.keys(triggerData.payload));
    console.log('  Metadata:', triggerData.metadata);

    // ✅ Use this to understand what data you'll receive
    // ✅ Design your webhook handler based on this structure
  });
}
```

### Pattern: Test Multiple Users

```typescript
// Test multi-user trigger isolation
async function testMultiUserTriggers() {
  const users = ['user_1', 'user_2', 'user_3'];

  for (const userId of users) {
    await composio.triggers.create(userId, 'GMAIL_NEW_GMAIL_MESSAGE', {
      triggerConfig: { labelIds: 'INBOX' }
    });
  }

  composio.triggers.subscribe(triggerData => {
    console.log(`Event for ${triggerData.userId}:`, triggerData.triggerSlug);

    // ✅ Verify events are properly isolated by user
    // ✅ Test that user_1 doesn't see user_2's events
  });

  console.log('Testing multi-user isolation...');
}
```

## Unsubscribe from Triggers

```typescript
// Stop listening to triggers
async function stopListening() {
  await composio.triggers.unsubscribe();
  console.log('Stopped listening to triggers');
}

// Example: Listen for 5 minutes then stop
composio.triggers.subscribe(triggerData => {
  console.log('Event:', triggerData.triggerSlug);
});

setTimeout(async () => {
  await composio.triggers.unsubscribe();
  console.log('Test complete, stopped listening');
}, 5 * 60 * 1000);
```

```python
# Stop listening to triggers
async def stop_listening():
    await composio.triggers.unsubscribe()
    print("Stopped listening to triggers")

# Example: Listen for 5 minutes then stop
composio.triggers.subscribe(
    callback=lambda data: print(f"Event: {data.trigger_slug}")
)

# Later...
await composio.triggers.unsubscribe()
print("Test complete, stopped listening")
```

## When to Use Subscribe

### ✅ Appropriate Use Cases:

1. **Local Development**
   - Testing trigger configuration
   - Debugging event payloads
   - Developing event processing logic

2. **Testing and Debugging**
   - Verifying trigger setup
   - Understanding event structure
   - Testing multi-user isolation

3. **Quick Prototyping**
   - Building proof of concept
   - Demonstrating functionality
   - Internal testing

### ❌ Do NOT Use Subscribe For:

1. **Production Applications**
   - Use webhooks instead
   - Unreliable connection
   - No delivery guarantees

2. **Serverless Deployments**
   - Lambda, Cloud Functions, etc.
   - Cannot maintain WebSocket connection
   - Use webhooks

3. **Horizontal Scaling**
   - Multiple server instances
   - Load balancers
   - Use webhooks with queue

4. **Mission-Critical Events**
   - Payment confirmations
   - Security alerts
   - Important notifications
   - Use webhooks with retries

## Migration Path: Subscribe → Webhooks

```typescript
// Step 1: Test locally with subscribe
if (process.env.NODE_ENV === 'development') {
  composio.triggers.subscribe(triggerData => {
    console.log('Event:', triggerData);
    processEvent(triggerData);
  });
}

// Step 2: Build webhook handler for production
if (process.env.NODE_ENV === 'production') {
  app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    try {
      // Verify webhook signature
      const result = composio.triggers.verifyWebhook({
        payload: req.body.toString(),
        signature: req.headers['webhook-signature'],
        id: req.headers['webhook-id'],
        timestamp: req.headers['webhook-timestamp'],
        secret: process.env.COMPOSIO_WEBHOOK_SECRET
      });

      // Same processing logic as subscribe
      processEvent(result.payload);

      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send('Bad Request');
    }
  });
}

// Same processing function works for both
function processEvent(triggerData: IncomingTriggerPayload) {
  console.log('Processing:', triggerData.triggerSlug);
  // Your business logic here
}
```

## Best Practices

### 1. **Never Use in Production**
- Subscribe is for development only
- Use webhooks for production reliability
- WebSocket connections are unreliable

### 2. **Use Filters for Focused Testing**
- Filter by user, toolkit, or trigger type
- Reduces noise during debugging
- Faster iteration

### 3. **Log Full Payloads During Development**
- Understand event structure
- Design webhook handlers based on logs
- Document payload fields for team

### 4. **Test Multi-User Isolation**
- Verify events are properly scoped
- Ensure user A doesn't see user B's events
- Critical for security

### 5. **Set Timeouts for Testing**
- Don't leave connections open indefinitely
- Unsubscribe when testing is complete
- Clean up resources

### 6. **Environment Guards**
- Only enable subscribe in development
- Prevent accidental production use
- Use environment variables

## Key Principles

1. **Development only** - Never use subscribe() in production
2. **Webhooks for production** - Reliable, scalable, stateless
3. **Test before deploy** - Use subscribe to test, then switch to webhooks
4. **Filter appropriately** - Reduce noise with targeted filters
5. **Unsubscribe when done** - Clean up connections
6. **Migration path** - Same event processing logic for both methods

## Reference

- [Triggers API Documentation](https://docs.composio.dev/sdk/typescript/api/triggers#real-time-trigger-subscription)
- [Webhook Verification](https://docs.composio.dev/sdk/typescript/advanced/webhook-verification)
- [Production Best Practices](./triggers-webhook.md)

---

### 4.3. Webhook Verification

<a name="webhook-verification"></a>

**Impact:** 🔴 CRITICAL

> Use webhook verification for reliable, scalable event delivery in production

# Verify Webhooks for Production (Recommended)

Webhooks are the **recommended and production-ready** way to receive trigger events. Unlike WebSocket subscriptions, webhooks provide reliable delivery, automatic retries, and work with any deployment architecture including serverless.

## Why Webhooks Over Subscribe

| Feature | Webhooks (Production) | Subscribe (Development) |
|---------|----------------------|-------------------------|
| **Reliability** | ✅ Automatic retries, delivery guarantees | ❌ Connection drops, events lost |
| **Scalability** | ✅ Horizontal scaling, stateless | ❌ Single connection, stateful |
| **Serverless** | ✅ Lambda, Cloud Functions, Vercel | ❌ Requires long-lived process |
| **Persistence** | ✅ Events queued until delivered | ❌ Events lost if disconnected |
| **Security** | ✅ HMAC signature verification | ⚠️ WebSocket auth only |
| **Deployment** | ✅ Any architecture | ❌ Limited deployment options |
| **Recommendation** | ✅ Required for production | ⚠️ Development/testing only |

## ❌ Incorrect - No Webhook Verification

```typescript
// DON'T: Process webhooks without verification
app.post('/webhook', express.json(), (req, res) => {
  // ❌ No signature verification
  // ❌ Anyone can send fake events
  // ❌ Security vulnerability
  // ❌ Replay attacks possible
  const triggerData = req.body;

  processEvent(triggerData); // Dangerous!
  res.status(200).send('OK');
});
```

```python
# DON'T: Process webhooks without verification
@app.post("/webhook")
async def webhook_handler(request: Request):
    # ❌ No signature verification
    # ❌ Anyone can send fake events
    # ❌ Security vulnerability
    # ❌ Replay attacks possible
    trigger_data = await request.json()

    process_event(trigger_data)  # Dangerous!
    return {"status": "ok"}
```

## ✅ Correct - Verify Webhook Signatures

```typescript
// DO: Always verify webhook signatures in production
import express from 'express';
import {
  Composio,
  ComposioWebhookSignatureVerificationError,
  ComposioWebhookPayloadError
} from '@composio/core';

const app = express();
const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// IMPORTANT: Use express.raw() to get raw body
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    // Verify webhook signature and parse payload
    const result = composio.triggers.verifyWebhook({
      payload: req.body.toString(), // Raw string body
      signature: req.headers['webhook-signature'] as string,
      id: req.headers['webhook-id'] as string,
      timestamp: req.headers['webhook-timestamp'] as string,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!,
      tolerance: 300 // 5 minutes (default)
    });

    // ✅ Signature verified
    // ✅ Timestamp validated (prevents replay attacks)
    // ✅ Payload normalized across versions
    console.log('Verified webhook:', result.version);
    console.log('Trigger:', result.payload.triggerSlug);
    console.log('User:', result.payload.userId);

    // Process the verified event
    processEvent(result.payload);

    res.status(200).send('OK');
  } catch (error) {
    if (error instanceof ComposioWebhookSignatureVerificationError) {
      // Invalid signature or expired timestamp
      console.error('Webhook verification failed:', error.message);
      return res.status(401).send('Unauthorized');
    }

    if (error instanceof ComposioWebhookPayloadError) {
      // Invalid JSON or unrecognized format
      console.error('Invalid webhook payload:', error.message);
      return res.status(400).send('Bad Request');
    }

    // Unexpected error
    console.error('Webhook processing error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

app.listen(3000);
```

```python
# DO: Always verify webhook signatures in production
from fastapi import FastAPI, Request, Response
from composio import Composio, ComposioWebhookSignatureVerificationError

app = FastAPI()
composio = Composio(api_key=os.environ["COMPOSIO_API_KEY"])

@app.post("/webhook")
async def webhook_handler(request: Request):
    try:
        # Get raw body
        payload = await request.body()

        # Verify webhook signature and parse payload
        result = composio.triggers.verify_webhook(
            payload=payload.decode("utf-8"),  # Raw string body
            signature=request.headers.get("webhook-signature"),
            id=request.headers.get("webhook-id"),
            timestamp=request.headers.get("webhook-timestamp"),
            secret=os.environ["COMPOSIO_WEBHOOK_SECRET"],
            tolerance=300  # 5 minutes (default)
        )

        # ✅ Signature verified
        # ✅ Timestamp validated (prevents replay attacks)
        # ✅ Payload normalized across versions
        print(f"Verified webhook: {result.version}")
        print(f"Trigger: {result.payload.trigger_slug}")
        print(f"User: {result.payload.user_id}")

        # Process the verified event
        process_event(result.payload)

        return {"status": "ok"}
    except ComposioWebhookSignatureVerificationError as error:
        # Invalid signature or expired timestamp
        print(f"Webhook verification failed: {error}")
        return Response(status_code=401, content="Unauthorized")
    except Exception as error:
        # Unexpected error
        print(f"Webhook processing error: {error}")
        return Response(status_code=500, content="Internal Server Error")
```

## Webhook Headers

Composio sends these headers with every webhook:

| Header | Description | Example |
|--------|-------------|---------|
| `webhook-id` | Unique message identifier | `msg_abc123` |
| `webhook-timestamp` | Unix timestamp (seconds) | `1704067200` |
| `webhook-signature` | HMAC-SHA256 signature | `v1,K7gNU3sdo+OL0w...` |
| `x-composio-webhook-version` | Payload version (V1/V2/V3) | `V3` |

## Signature Verification Algorithm

```
signature = HMAC-SHA256(
  "${webhookId}.${webhookTimestamp}.${payload}",
  webhookSecret
)

result = "v1," + base64(signature)
```

The SDK automatically:
1. ✅ Verifies HMAC-SHA256 signature matches
2. ✅ Checks timestamp is within tolerance (default 5 minutes)
3. ✅ Normalizes payload across V1/V2/V3 formats

## Framework Examples

### Next.js (App Router)

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  Composio,
  ComposioWebhookSignatureVerificationError
} from '@composio/core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text(); // Get raw body

    const result = composio.triggers.verifyWebhook({
      payload,
      signature: request.headers.get('webhook-signature')!,
      id: request.headers.get('webhook-id')!,
      timestamp: request.headers.get('webhook-timestamp')!,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!
    });

    console.log('Trigger received:', result.payload.triggerSlug);

    // Process event
    await processEvent(result.payload);

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof ComposioWebhookSignatureVerificationError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }
}
```

### Fastify

```typescript
import Fastify from 'fastify';
import {
  Composio,
  ComposioWebhookSignatureVerificationError
} from '@composio/core';

const fastify = Fastify();
const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// Configure to get raw body
fastify.addContentTypeParser(
  'application/json',
  { parseAs: 'string' },
  (req, body, done) => done(null, body)
);

fastify.post('/webhook', async (request, reply) => {
  try {
    const result = composio.triggers.verifyWebhook({
      payload: request.body as string,
      signature: request.headers['webhook-signature'] as string,
      id: request.headers['webhook-id'] as string,
      timestamp: request.headers['webhook-timestamp'] as string,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!
    });

    await processEvent(result.payload);

    return { received: true };
  } catch (error) {
    if (error instanceof ComposioWebhookSignatureVerificationError) {
      reply.code(401);
      return { error: 'Unauthorized' };
    }
    reply.code(400);
    return { error: 'Bad Request' };
  }
});

fastify.listen({ port: 3000 });
```

### AWS Lambda (Serverless)

```typescript
import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  Composio,
  ComposioWebhookSignatureVerificationError
} from '@composio/core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const result = composio.triggers.verifyWebhook({
      payload: event.body!,
      signature: event.headers['webhook-signature']!,
      id: event.headers['webhook-id']!,
      timestamp: event.headers['webhook-timestamp']!,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!
    });

    // ✅ Works perfectly with serverless
    // ✅ No long-lived connections needed
    // ✅ Scales automatically
    await processEvent(result.payload);

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    if (error instanceof ComposioWebhookSignatureVerificationError) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request' })
    };
  }
};
```

### Vercel Edge Functions

```typescript
import { NextRequest } from 'next/server';
import {
  Composio,
  ComposioWebhookSignatureVerificationError
} from '@composio/core';

export const config = { runtime: 'edge' };

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

export default async function handler(req: NextRequest) {
  try {
    const payload = await req.text();

    const result = composio.triggers.verifyWebhook({
      payload,
      signature: req.headers.get('webhook-signature')!,
      id: req.headers.get('webhook-id')!,
      timestamp: req.headers.get('webhook-timestamp')!,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!
    });

    // ✅ Runs at the edge
    // ✅ Low latency
    // ✅ Globally distributed
    await processEvent(result.payload);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    if (error instanceof ComposioWebhookSignatureVerificationError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401
      });
    }
    return new Response(JSON.stringify({ error: 'Bad Request' }), {
      status: 400
    });
  }
}
```

## Webhook Payload Versions

Composio automatically detects and normalizes three webhook versions:

### V3 (Current Default)
```json
{
  "id": "msg_abc123",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "type": "composio.trigger.message",
  "metadata": {
    "trigger_slug": "GMAIL_NEW_GMAIL_MESSAGE",
    "user_id": "user-456"
  },
  "data": {
    "from": "sender@example.com",
    "subject": "Hello"
  }
}
```

### V2 (Legacy)
```json
{
  "type": "gmail_new_gmail_message",
  "data": {
    "user_id": "user-456",
    "from": "sender@example.com",
    "subject": "Hello"
  }
}
```

### V1 (Legacy)
```json
{
  "trigger_name": "GMAIL_NEW_GMAIL_MESSAGE",
  "trigger_id": "trigger-123",
  "payload": {
    "from": "sender@example.com",
    "subject": "Hello"
  }
}
```

**All versions are normalized to:**
```typescript
interface IncomingTriggerPayload {
  id: string;
  triggerSlug: string;
  toolkitSlug: string;
  userId: string;
  payload: Record<string, unknown>; // Actual event data
  originalPayload: Record<string, unknown>; // Raw data
  metadata: {
    connectedAccount: {
      id: string;
      userId: string;
      status: string;
    };
  };
}
```

## Timestamp Validation (Replay Attack Prevention)

```typescript
// Default: 5 minute tolerance
const result = composio.triggers.verifyWebhook({
  ...params,
  tolerance: 300 // seconds
});

// Strict: 1 minute tolerance
const result = composio.triggers.verifyWebhook({
  ...params,
  tolerance: 60
});

// Lenient: 10 minute tolerance
const result = composio.triggers.verifyWebhook({
  ...params,
  tolerance: 600
});

// Disable (NOT recommended for production)
const result = composio.triggers.verifyWebhook({
  ...params,
  tolerance: 0
});
```

**How it works:**
- Webhook includes `webhook-timestamp` header (Unix seconds)
- SDK checks: `currentTime - webhookTimestamp <= tolerance`
- Rejects webhooks older than tolerance
- Prevents replay attacks with old signatures

## Production Patterns

### Pattern: Webhook with Queue

```typescript
// Verify webhook, then queue for async processing
import { Queue } from 'bull';

const eventQueue = new Queue('trigger-events', {
  redis: { host: 'localhost', port: 6379 }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // 1. Verify signature immediately
    const result = composio.triggers.verifyWebhook({
      payload: req.body.toString(),
      signature: req.headers['webhook-signature'] as string,
      id: req.headers['webhook-id'] as string,
      timestamp: req.headers['webhook-timestamp'] as string,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!
    });

    // 2. Queue for async processing
    await eventQueue.add({
      triggerSlug: result.payload.triggerSlug,
      userId: result.payload.userId,
      payload: result.payload.payload,
      metadata: result.payload.metadata
    });

    // 3. Return 200 immediately
    // ✅ Fast response to Composio
    // ✅ Processing happens async
    // ✅ Retries handled by queue
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(401).send('Unauthorized');
  }
});

// Process events from queue
eventQueue.process(async (job) => {
  await processEvent(job.data);
});
```

### Pattern: Webhook with Database Logging

```typescript
// Log all webhooks for audit and debugging
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookId = req.headers['webhook-id'] as string;

  try {
    const result = composio.triggers.verifyWebhook({
      payload: req.body.toString(),
      signature: req.headers['webhook-signature'] as string,
      id: webhookId,
      timestamp: req.headers['webhook-timestamp'] as string,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!
    });

    // Log webhook receipt
    await db.webhooks.create({
      webhookId,
      triggerSlug: result.payload.triggerSlug,
      userId: result.payload.userId,
      payload: result.payload,
      status: 'received',
      receivedAt: new Date()
    });

    // Process event
    await processEvent(result.payload);

    // Update status
    await db.webhooks.update({ webhookId }, {
      status: 'processed',
      processedAt: new Date()
    });

    res.status(200).send('OK');
  } catch (error) {
    // Log failure
    await db.webhooks.update({ webhookId }, {
      status: 'failed',
      error: error.message
    });

    res.status(401).send('Unauthorized');
  }
});
```

### Pattern: Idempotent Webhook Processing

```typescript
// Handle duplicate webhook deliveries
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const result = composio.triggers.verifyWebhook({
      payload: req.body.toString(),
      signature: req.headers['webhook-signature'] as string,
      id: req.headers['webhook-id'] as string,
      timestamp: req.headers['webhook-timestamp'] as string,
      secret: process.env.COMPOSIO_WEBHOOK_SECRET!
    });

    const webhookId = req.headers['webhook-id'] as string;

    // Check if already processed
    const existing = await db.processedWebhooks.findOne({ webhookId });
    if (existing) {
      console.log('Webhook already processed:', webhookId);
      return res.status(200).send('OK'); // Return success, don't reprocess
    }

    // Process event
    await processEvent(result.payload);

    // Mark as processed
    await db.processedWebhooks.create({
      webhookId,
      processedAt: new Date()
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(401).send('Unauthorized');
  }
});
```

## Security Best Practices

### 1. **Always Verify Signatures**
```typescript
// ✅ ALWAYS verify
const result = composio.triggers.verifyWebhook({ ...params });

// ❌ NEVER skip verification
const payload = JSON.parse(req.body); // Dangerous!
```

### 2. **Use Raw Body**
```typescript
// ✅ Get raw body for verification
app.use(express.raw({ type: 'application/json' }));

// ❌ Don't use parsed JSON
app.use(express.json()); // Middleware may modify body
```

### 3. **Store Secret Securely**
```typescript
// ✅ Use environment variables
secret: process.env.COMPOSIO_WEBHOOK_SECRET

// ❌ Never hardcode
secret: 'whsec_abc123...' // DON'T DO THIS
```

### 4. **Use HTTPS**
- Configure HTTPS for webhook endpoint
- Prevents man-in-the-middle attacks
- Required for production

### 5. **Keep Tolerance Reasonable**
```typescript
// ✅ Default 5 minutes is good
tolerance: 300

// ❌ Don't disable
tolerance: 0 // Vulnerable to replay attacks
```

### 6. **Handle Errors Gracefully**
```typescript
// Return appropriate status codes
if (verificationError) return res.status(401); // Unauthorized
if (payloadError) return res.status(400); // Bad Request
if (processingError) return res.status(500); // Retry
```

### 7. **Log Verification Failures**
```typescript
catch (error) {
  // ✅ Log for security monitoring
  console.error('Webhook verification failed:', {
    webhookId: req.headers['webhook-id'],
    timestamp: req.headers['webhook-timestamp'],
    error: error.message,
    ip: req.ip
  });
}
```

## Finding Your Webhook Secret

1. Go to [Composio Dashboard](https://app.composio.dev)
2. Navigate to your project settings
3. Find "Webhook Secret" section
4. Copy the secret (starts with `whsec_`)
5. Store in environment variable: `COMPOSIO_WEBHOOK_SECRET`

**Never:**
- Commit secrets to git
- Expose in client-side code
- Share publicly
- Log the full secret

## Key Principles

1. **Webhooks for production** - Reliable, scalable, required
2. **Always verify signatures** - Security critical
3. **Use raw body** - Required for signature verification
4. **Validate timestamps** - Prevents replay attacks
5. **HTTPS only** - Secure transport
6. **Log failures** - Security monitoring
7. **Return fast** - Queue for async processing
8. **Idempotent handling** - Handle duplicate deliveries

## Reference

- [Webhook Verification Docs](https://docs.composio.dev/sdk/typescript/advanced/webhook-verification)
- [Triggers API](https://docs.composio.dev/sdk/typescript/api/triggers)
- [Security Best Practices](https://docs.composio.dev/security)

---

### 4.4. Managing Triggers

<a name="managing-triggers"></a>

**Impact:** 🟠 HIGH

> Control trigger states, update configurations, and manage trigger instances

# Manage Trigger Lifecycle (Enable, Disable, Update)

Once triggers are created, you can manage their lifecycle by enabling, disabling, updating configurations, and listing active triggers. Use these operations to control event delivery without recreating triggers.

## ❌ Incorrect - Deleting and Recreating Triggers

```typescript
// DON'T: Delete and recreate to change config
async function updateTriggerConfig(triggerId: string) {
  // ❌ Inefficient
  // ❌ Loses trigger history
  // ❌ May miss events during recreation
  // ❌ Changes trigger ID
  await composio.triggers.delete(triggerId);

  const newTrigger = await composio.triggers.create(
    userId,
    'GMAIL_NEW_GMAIL_MESSAGE',
    {
      connectedAccountId,
      triggerConfig: { labelIds: 'IMPORTANT' } // Changed config
    }
  );
}
```

```python
# DON'T: Delete and recreate to change config
async def update_trigger_config(trigger_id: str):
    # ❌ Inefficient
    # ❌ Loses trigger history
    # ❌ May miss events during recreation
    # ❌ Changes trigger ID
    await composio.triggers.delete(trigger_id)

    new_trigger = composio.triggers.create(
        user_id=user_id,
        trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
        connected_account_id=connected_account_id,
        trigger_config={"labelIds": "IMPORTANT"}  # Changed config
    )
```

## ✅ Correct - Update Existing Trigger

```typescript
// DO: Update trigger configuration in place
import { Composio } from '@composio/core';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY
});

async function updateTriggerConfig(triggerId: string) {
  const updatedTrigger = await composio.triggers.update(triggerId, {
    triggerConfig: {
      labelIds: 'IMPORTANT', // Updated config
      interval: 120 // Changed interval
    }
  });

  console.log('Trigger updated:', updatedTrigger.triggerId);

  // ✅ Same trigger ID maintained
  // ✅ No events lost
  // ✅ Efficient update
  // ✅ Preserves trigger history
  return updatedTrigger;
}
```

```python
# DO: Update trigger configuration in place
from composio import Composio

composio = Composio(api_key=os.environ["COMPOSIO_API_KEY"])

async def update_trigger_config(trigger_id: str):
    updated_trigger = composio.triggers.update(
        trigger_id=trigger_id,
        trigger_config={
            "labelIds": "IMPORTANT",  # Updated config
            "interval": 120  # Changed interval
        }
    )

    print(f"Trigger updated: {updated_trigger.trigger_id}")

    # ✅ Same trigger ID maintained
    # ✅ No events lost
    # ✅ Efficient update
    # ✅ Preserves trigger history
    return updated_trigger
```

## Enable and Disable Triggers

### Temporarily Disable Trigger

```typescript
// DO: Disable trigger to pause event delivery
async function pauseTrigger(triggerId: string) {
  await composio.triggers.disable(triggerId);
  console.log('Trigger disabled:', triggerId);

  // ✅ Events stop being delivered
  // ✅ Trigger configuration preserved
  // ✅ Can be re-enabled later
  // ✅ No data loss
}
```

```python
# DO: Disable trigger to pause event delivery
async def pause_trigger(trigger_id: str):
    await composio.triggers.disable(trigger_id)
    print(f"Trigger disabled: {trigger_id}")

    # ✅ Events stop being delivered
    # ✅ Trigger configuration preserved
    # ✅ Can be re-enabled later
    # ✅ No data loss
```

### Re-enable Trigger

```typescript
// DO: Enable trigger to resume event delivery
async function resumeTrigger(triggerId: string) {
  await composio.triggers.enable(triggerId);
  console.log('Trigger enabled:', triggerId);

  // ✅ Events resume being delivered
  // ✅ Same configuration
  // ✅ No reconfiguration needed
}
```

```python
# DO: Enable trigger to resume event delivery
async def resume_trigger(trigger_id: str):
    await composio.triggers.enable(trigger_id)
    print(f"Trigger enabled: {trigger_id}")

    # ✅ Events resume being delivered
    # ✅ Same configuration
    # ✅ No reconfiguration needed
```

## Listing Active Triggers

### List All User Triggers

```typescript
// DO: Fetch all triggers for a user
async function getUserTriggers(userId: string) {
  const triggers = await composio.triggers.listActive({
    showDisabled: true, // Include disabled triggers
    limit: 50
  });

  // Filter by user (API may already filter)
  const userTriggers = triggers.items.filter(t => t.userId === userId);

  console.log(`User ${userId} has ${userTriggers.length} triggers:`);

  userTriggers.forEach(trigger => {
    console.log(`  ${trigger.triggerSlug} - ${trigger.status}`);
    console.log(`    Trigger ID: ${trigger.id}`);
    console.log(`    Toolkit: ${trigger.toolkitSlug}`);
    console.log(`    Connected Account: ${trigger.connectedAccountId}`);
    console.log(`    Config: ${JSON.stringify(trigger.config)}`);
  });

  return userTriggers;
}
```

```python
# DO: Fetch all triggers for a user
async def get_user_triggers(user_id: str):
    triggers = composio.triggers.list_active(
        show_disabled=True,  # Include disabled triggers
        limit=50
    )

    # Filter by user (API may already filter)
    user_triggers = [t for t in triggers.items if t.user_id == user_id]

    print(f"User {user_id} has {len(user_triggers)} triggers:")

    for trigger in user_triggers:
        print(f"  {trigger.trigger_slug} - {trigger.status}")
        print(f"    Trigger ID: {trigger.id}")
        print(f"    Toolkit: {trigger.toolkit_slug}")
        print(f"    Connected Account: {trigger.connected_account_id}")
        print(f"    Config: {trigger.config}")

    return user_triggers
```

### List Triggers by Toolkit

```typescript
// DO: Get all triggers for a specific toolkit
async function getToolkitTriggers(userId: string, toolkit: string) {
  const triggers = await composio.triggers.listActive({
    showDisabled: false // Only active triggers
  });

  const toolkitTriggers = triggers.items.filter(
    t => t.userId === userId && t.toolkitSlug === toolkit
  );

  console.log(`${toolkit} triggers for user ${userId}:`);
  toolkitTriggers.forEach(trigger => {
    console.log(`  ${trigger.triggerSlug} (${trigger.id})`);
  });

  return toolkitTriggers;
}
```

```python
# DO: Get all triggers for a specific toolkit
async def get_toolkit_triggers(user_id: str, toolkit: str):
    triggers = composio.triggers.list_active(
        show_disabled=False  # Only active triggers
    )

    toolkit_triggers = [
        t for t in triggers.items
        if t.user_id == user_id and t.toolkit_slug == toolkit
    ]

    print(f"{toolkit} triggers for user {user_id}:")
    for trigger in toolkit_triggers:
        print(f"  {trigger.trigger_slug} ({trigger.id})")

    return toolkit_triggers
```

### List Triggers by Connected Account

```typescript
// DO: Get triggers for specific connected account
async function getAccountTriggers(connectedAccountId: string) {
  const triggers = await composio.triggers.listActive({
    connectedAccountIds: [connectedAccountId],
    showDisabled: true
  });

  console.log(`Triggers for account ${connectedAccountId}:`);

  triggers.items.forEach(trigger => {
    const status = trigger.status === 'active' ? '✅' : '⏸️';
    console.log(`  ${status} ${trigger.triggerSlug}`);
    console.log(`    ID: ${trigger.id}`);
    console.log(`    Config: ${JSON.stringify(trigger.config)}`);
  });

  return triggers.items;
}
```

```python
# DO: Get triggers for specific connected account
async def get_account_triggers(connected_account_id: str):
    triggers = composio.triggers.list_active(
        connected_account_ids=[connected_account_id],
        show_disabled=True
    )

    print(f"Triggers for account {connected_account_id}:")

    for trigger in triggers.items:
        status = "✅" if trigger.status == "active" else "⏸️"
        print(f"  {status} {trigger.trigger_slug}")
        print(f"    ID: {trigger.id}")
        print(f"    Config: {trigger.config}")

    return triggers.items
```

## Common Management Patterns

### Pattern: User Preference Toggle

```typescript
// Let users enable/disable specific trigger types
async function toggleUserTrigger(
  userId: string,
  triggerSlug: string,
  enabled: boolean
) {
  // 1. Find user's trigger of this type
  const triggers = await composio.triggers.listActive({
    triggerNames: [triggerSlug],
    showDisabled: true
  });

  const userTrigger = triggers.items.find(t => t.userId === userId);

  if (!userTrigger) {
    throw new Error(`User has no ${triggerSlug} trigger`);
  }

  // 2. Enable or disable
  if (enabled) {
    await composio.triggers.enable(userTrigger.id);
    console.log(`Enabled ${triggerSlug} for user ${userId}`);
  } else {
    await composio.triggers.disable(userTrigger.id);
    console.log(`Disabled ${triggerSlug} for user ${userId}`);
  }

  return { triggerId: userTrigger.id, enabled };
}

// Usage: User toggles email notifications
await toggleUserTrigger('user_123', 'GMAIL_NEW_GMAIL_MESSAGE', false);
```

```python
# Let users enable/disable specific trigger types
async def toggle_user_trigger(
    user_id: str,
    trigger_slug: str,
    enabled: bool
):
    # 1. Find user's trigger of this type
    triggers = composio.triggers.list_active(
        trigger_names=[trigger_slug],
        show_disabled=True
    )

    user_trigger = next(
        (t for t in triggers.items if t.user_id == user_id),
        None
    )

    if not user_trigger:
        raise Exception(f"User has no {trigger_slug} trigger")

    # 2. Enable or disable
    if enabled:
        await composio.triggers.enable(user_trigger.id)
        print(f"Enabled {trigger_slug} for user {user_id}")
    else:
        await composio.triggers.disable(user_trigger.id)
        print(f"Disabled {trigger_slug} for user {user_id}")

    return {"trigger_id": user_trigger.id, "enabled": enabled}

# Usage: User toggles email notifications
await toggle_user_trigger("user_123", "GMAIL_NEW_GMAIL_MESSAGE", False)
```

### Pattern: Bulk Enable/Disable

```typescript
// Enable or disable all triggers for a user
async function toggleAllUserTriggers(userId: string, enabled: boolean) {
  const triggers = await composio.triggers.listActive({
    showDisabled: true
  });

  const userTriggers = triggers.items.filter(t => t.userId === userId);

  console.log(`${enabled ? 'Enabling' : 'Disabling'} ${userTriggers.length} triggers...`);

  for (const trigger of userTriggers) {
    if (enabled) {
      await composio.triggers.enable(trigger.id);
    } else {
      await composio.triggers.disable(trigger.id);
    }
    console.log(`  ${enabled ? '✅' : '⏸️'} ${trigger.triggerSlug}`);
  }

  return userTriggers.length;
}

// Usage: User pauses all notifications
await toggleAllUserTriggers('user_123', false);
```

```python
# Enable or disable all triggers for a user
async def toggle_all_user_triggers(user_id: str, enabled: bool):
    triggers = composio.triggers.list_active(show_disabled=True)

    user_triggers = [t for t in triggers.items if t.user_id == user_id]

    action = "Enabling" if enabled else "Disabling"
    print(f"{action} {len(user_triggers)} triggers...")

    for trigger in user_triggers:
        if enabled:
            await composio.triggers.enable(trigger.id)
        else:
            await composio.triggers.disable(trigger.id)

        status = "✅" if enabled else "⏸️"
        print(f"  {status} {trigger.trigger_slug}")

    return len(user_triggers)

# Usage: User pauses all notifications
await toggle_all_user_triggers("user_123", False)
```

### Pattern: Update Trigger Interval

```typescript
// Adjust how frequently triggers check for events
async function updateTriggerInterval(triggerId: string, interval: number) {
  const updatedTrigger = await composio.triggers.update(triggerId, {
    triggerConfig: {
      interval // seconds between checks
    }
  });

  console.log(`Trigger interval updated to ${interval}s`);
  return updatedTrigger;
}

// Usage: Change from 60s to 300s (5 minutes)
await updateTriggerInterval('trigger_abc123', 300);
```

```python
# Adjust how frequently triggers check for events
async def update_trigger_interval(trigger_id: str, interval: int):
    updated_trigger = composio.triggers.update(
        trigger_id=trigger_id,
        trigger_config={
            "interval": interval  # seconds between checks
        }
    )

    print(f"Trigger interval updated to {interval}s")
    return updated_trigger

# Usage: Change from 60s to 300s (5 minutes)
await update_trigger_interval("trigger_abc123", 300)
```

### Pattern: Clean Up Disconnected Accounts

```typescript
// Disable triggers for disconnected accounts
async function cleanupDisconnectedTriggers(userId: string) {
  // 1. Get all user triggers
  const triggers = await composio.triggers.listActive({
    showDisabled: false // Only active triggers
  });

  const userTriggers = triggers.items.filter(t => t.userId === userId);

  // 2. Check connected accounts status
  const accounts = await composio.connectedAccounts.list(userId);
  const activeAccountIds = new Set(
    accounts.filter(a => a.status === 'ACTIVE').map(a => a.id)
  );

  // 3. Disable triggers with disconnected accounts
  let disabledCount = 0;

  for (const trigger of userTriggers) {
    if (!activeAccountIds.has(trigger.connectedAccountId)) {
      await composio.triggers.disable(trigger.id);
      console.log(`Disabled trigger for disconnected account: ${trigger.triggerSlug}`);
      disabledCount++;
    }
  }

  console.log(`Disabled ${disabledCount} triggers with disconnected accounts`);
  return disabledCount;
}
```

```python
# Disable triggers for disconnected accounts
async def cleanup_disconnected_triggers(user_id: str):
    # 1. Get all user triggers
    triggers = composio.triggers.list_active(show_disabled=False)
    user_triggers = [t for t in triggers.items if t.user_id == user_id]

    # 2. Check connected accounts status
    accounts = composio.connected_accounts.list(user_id)
    active_account_ids = set(
        a.id for a in accounts if a.status == "ACTIVE"
    )

    # 3. Disable triggers with disconnected accounts
    disabled_count = 0

    for trigger in user_triggers:
        if trigger.connected_account_id not in active_account_ids:
            await composio.triggers.disable(trigger.id)
            print(f"Disabled trigger for disconnected account: {trigger.trigger_slug}")
            disabled_count += 1

    print(f"Disabled {disabled_count} triggers with disconnected accounts")
    return disabled_count
```

### Pattern: Trigger Status Dashboard

```typescript
// Build trigger management UI
async function getTriggerDashboard(userId: string) {
  const triggers = await composio.triggers.listActive({
    showDisabled: true
  });

  const userTriggers = triggers.items.filter(t => t.userId === userId);

  // Group by status
  const active = userTriggers.filter(t => t.status === 'active');
  const disabled = userTriggers.filter(t => t.status === 'disabled');

  // Group by toolkit
  const byToolkit = userTriggers.reduce((acc, trigger) => {
    const toolkit = trigger.toolkitSlug;
    if (!acc[toolkit]) acc[toolkit] = [];
    acc[toolkit].push(trigger);
    return acc;
  }, {} as Record<string, typeof userTriggers>);

  return {
    total: userTriggers.length,
    active: active.length,
    disabled: disabled.length,
    byToolkit,
    triggers: userTriggers.map(t => ({
      id: t.id,
      slug: t.triggerSlug,
      toolkit: t.toolkitSlug,
      status: t.status,
      config: t.config,
      connectedAccountId: t.connectedAccountId
    }))
  };
}

// Usage: Display in UI
const dashboard = await getTriggerDashboard('user_123');
console.log(`Total: ${dashboard.total}`);
console.log(`Active: ${dashboard.active}`);
console.log(`Disabled: ${dashboard.disabled}`);
console.log('By toolkit:', dashboard.byToolkit);
```

```python
# Build trigger management UI
async def get_trigger_dashboard(user_id: str):
    triggers = composio.triggers.list_active(show_disabled=True)
    user_triggers = [t for t in triggers.items if t.user_id == user_id]

    # Group by status
    active = [t for t in user_triggers if t.status == "active"]
    disabled = [t for t in user_triggers if t.status == "disabled"]

    # Group by toolkit
    by_toolkit = {}
    for trigger in user_triggers:
        toolkit = trigger.toolkit_slug
        if toolkit not in by_toolkit:
            by_toolkit[toolkit] = []
        by_toolkit[toolkit].append(trigger)

    return {
        "total": len(user_triggers),
        "active": len(active),
        "disabled": len(disabled),
        "by_toolkit": by_toolkit,
        "triggers": [
            {
                "id": t.id,
                "slug": t.trigger_slug,
                "toolkit": t.toolkit_slug,
                "status": t.status,
                "config": t.config,
                "connected_account_id": t.connected_account_id
            }
            for t in user_triggers
        ]
    }

# Usage: Display in UI
dashboard = await get_trigger_dashboard("user_123")
print(f"Total: {dashboard['total']}")
print(f"Active: {dashboard['active']}")
print(f"Disabled: {dashboard['disabled']}")
print(f"By toolkit: {dashboard['by_toolkit']}")
```

## Advanced Filtering

```typescript
// List triggers with advanced filters
async function filterTriggers() {
  const triggers = await composio.triggers.listActive({
    // Filter by auth configs
    authConfigIds: ['auth-config-1', 'auth-config-2'],

    // Filter by connected accounts
    connectedAccountIds: ['ca_account1', 'ca_account2'],

    // Filter by specific trigger IDs
    triggerIds: ['trigger-id-1', 'trigger-id-2'],

    // Filter by trigger types
    triggerNames: ['GMAIL_NEW_GMAIL_MESSAGE', 'GITHUB_PUSH_EVENT'],

    // Include disabled triggers
    showDisabled: true,

    // Pagination
    limit: 20,
    cursor: 'next-page-cursor'
  });

  console.log(`Found ${triggers.items.length} triggers`);
  console.log(`Next cursor: ${triggers.nextCursor}`);

  return triggers;
}
```

```python
# List triggers with advanced filters
async def filter_triggers():
    triggers = composio.triggers.list_active(
        # Filter by auth configs
        auth_config_ids=["auth-config-1", "auth-config-2"],

        # Filter by connected accounts
        connected_account_ids=["ca_account1", "ca_account2"],

        # Filter by specific trigger IDs
        trigger_ids=["trigger-id-1", "trigger-id-2"],

        # Filter by trigger types
        trigger_names=["GMAIL_NEW_GMAIL_MESSAGE", "GITHUB_PUSH_EVENT"],

        # Include disabled triggers
        show_disabled=True,

        # Pagination
        limit=20,
        cursor="next-page-cursor"
    )

    print(f"Found {len(triggers.items)} triggers")
    print(f"Next cursor: {triggers.next_cursor}")

    return triggers
```

## Best Practices

### 1. **Use Disable Instead of Delete**
- Disable preserves trigger configuration and history
- Can be re-enabled without reconfiguration
- Safer for temporary pauses

### 2. **Update Instead of Recreate**
- Maintains trigger ID
- No events lost during update
- Preserves trigger history

### 3. **List Before Operating**
- Check trigger status before enabling/disabling
- Verify trigger exists before updating
- Avoid unnecessary API calls

### 4. **Clean Up Regularly**
- Disable triggers for disconnected accounts
- Remove unused triggers
- Keep trigger list manageable

### 5. **Provide User Controls**
- Let users enable/disable their triggers
- Show trigger status in UI
- Allow configuration updates

### 6. **Monitor Trigger Status**
- Track active vs disabled triggers
- Alert on disconnected accounts
- Log trigger state changes

### 7. **Batch Operations Carefully**
- Rate limit bulk enable/disable
- Handle errors gracefully
- Log each operation

## Key Principles

1. **Disable over delete** - Preserve configuration and history
2. **Update in place** - Don't recreate triggers
3. **List before operate** - Check current state first
4. **Clean up proactively** - Remove disconnected account triggers
5. **User control** - Let users manage their triggers
6. **Monitor status** - Track active/disabled state
7. **Handle errors** - Graceful failure handling

## Reference

- [Triggers API Documentation](https://docs.composio.dev/sdk/typescript/api/triggers)
- [Enable/Disable Methods](https://docs.composio.dev/sdk/typescript/api/triggers#enabledisable-triggers)
- [Update Trigger Instance](https://docs.composio.dev/sdk/typescript/api/triggers#update-trigger-instance)
- [List Active Triggers](https://docs.composio.dev/sdk/typescript/api/triggers#list-active-triggers)

---

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

## References

- [Tool Router Docs](https://docs.composio.dev/sdk/typescript/api/tool-router)
- [Triggers API](https://docs.composio.dev/sdk/typescript/api/triggers)
- [Webhook Verification](https://docs.composio.dev/sdk/typescript/advanced/webhook-verification)
- [MCP Protocol](https://modelcontextprotocol.io)
- [TypeScript Examples](https://github.com/composiohq/composio/tree/main/ts/examples/tool-router)


---

_This file was automatically generated from individual rule files on 2026-01-23T20:17:27.953Z_
_To update, run: `npm run build:agents`_
