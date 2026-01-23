---
title: Subscribe to Trigger Events (Development Only)
impact: MEDIUM
description: Use real-time subscription for local development and testing, not production
tags: [triggers, subscribe, events, development, testing, websocket]
---

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
