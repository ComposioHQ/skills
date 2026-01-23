---
title: Create Triggers for Real-Time Events
impact: HIGH
description: Set up trigger instances to receive real-time events from connected accounts
tags: [triggers, events, webhooks, real-time, notifications]
---

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
