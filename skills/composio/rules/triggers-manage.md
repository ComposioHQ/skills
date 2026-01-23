---
title: Manage Trigger Lifecycle (Enable, Disable, Update)
impact: HIGH
description: Control trigger states, update configurations, and manage trigger instances
tags: [triggers, lifecycle, enable, disable, update, management]
---

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
