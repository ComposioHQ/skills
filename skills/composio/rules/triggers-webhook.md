---
title: Verify Webhooks for Production (Recommended)
impact: CRITICAL
description: Use webhook verification for reliable, scalable event delivery in production
tags: [triggers, webhooks, production, security, verification, hmac]
---

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
