---
title: Tool Version Management
impact: HIGH
description: Critical strategies for version pinning to ensure workflow stability and prevent runtime errors in production
tags: [tools, versions, stability, production, pinning]
---

# Tool Version Management

Tool versions are critical for workflow stability. When manually executing tools, a specific version is **required** to prevent argument mismatches when tool schemas change.

## Why Version Pinning Matters

- **Tool schemas evolve**: Tool argument schemas can change between versions
- **Prevent runtime errors**: Using `'latest'` in workflows causes errors when tools update
- **Workflow stability**: Pinned versions ensure predictable behavior
- **Production safety**: Version validation prevents schema mismatch issues

## Three Version Management Strategies

### Strategy 1: Explicit Version in Execute Call (Recommended for One-off Executions)

Specify the version directly in the execute call:

```typescript
const result = await composio.tools.execute('GITHUB_GET_ISSUES', {
  userId: 'default',
  arguments: { owner: 'composio', repo: 'sdk' },
  version: '12082025_00', // Explicit version for this tool
});
```

**Pros:**
- Clear version visibility at execution point
- Different versions for different tools
- Easy to update individual tool versions

**Cons:**
- Repetitive if executing same tool multiple times
- Version scattered across codebase

**Use when:**
- One-off tool executions
- Testing different tool versions
- Tool versions need to differ within the same app

### Strategy 2: Configure Toolkit Versions at Initialization (Recommended for Production)

Configure versions once at SDK initialization:

```typescript
const composio = new Composio({
  toolkitVersions: {
    github: '12082025_00',
    slack: '10082025_01',
    gmail: '15082025_02'
  }
});

// Execute without version parameter - uses pinned version from config
const result = await composio.tools.execute('GITHUB_GET_ISSUES', {
  userId: 'default',
  arguments: { owner: 'composio', repo: 'sdk' },
  // Uses github: '12082025_00' from initialization
});
```

**Pros:**
- Centralized version management
- Clean execution calls
- Easy to update all tools from a toolkit
- Best for production environments

**Cons:**
- All tools from a toolkit use the same version
- Requires initialization configuration

**Use when:**
- Building production applications
- Managing multiple tools from the same toolkit
- Want centralized version control

### Strategy 3: dangerouslySkipVersionCheck (NOT Recommended for Production)

Bypass version validation entirely:

```typescript
const result = await composio.tools.execute('GITHUB_GET_ISSUES', {
  userId: 'default',
  arguments: { owner: 'composio', repo: 'sdk' },
  dangerouslySkipVersionCheck: true, // Uses 'latest' version
});
```

**⚠️ Warning:** This bypasses version validation and uses `'latest'` version. Can lead to:
- Unexpected behavior when tool schemas change
- Argument mismatches in production
- Runtime errors when tools are updated
- Workflow breakage without notice

**Only use for:**
- Development and testing
- Prototyping
- When you explicitly want to test latest versions

**NEVER use in:**
- Production environments
- Critical workflows
- User-facing applications

## Version Format

Versions follow the format: `DDMMYYYY_XX`

Examples:
- `12082025_00` - August 12, 2025, revision 00
- `10082025_01` - August 10, 2025, revision 01
- `15082025_02` - August 15, 2025, revision 02

## Finding Available Versions

Get toolkit metadata to find available versions:

```typescript
const toolkit = await composio.toolkits.get('github');
console.log('Available versions:', toolkit.versions);
```

Or check the Composio dashboard for version information.

## Version Migration Strategy

When updating tool versions:

1. **Test in development first**
   ```typescript
   // Dev environment
   const devComposio = new Composio({
     toolkitVersions: { github: '20082025_00' } // New version
   });
   ```

2. **Validate schema changes**
   ```typescript
   const oldTool = await composio.tools.get('default', 'GITHUB_GET_ISSUES');
   const newTool = await composio.tools.get('default', 'GITHUB_GET_ISSUES');
   // Compare schemas before migrating
   ```

3. **Update gradually**
   - Update one toolkit at a time
   - Monitor for errors
   - Roll back if issues occur

4. **Update production**
   ```typescript
   // Production environment
   const prodComposio = new Composio({
     toolkitVersions: { github: '20082025_00' } // Deploy new version
   });
   ```

## Best Practices

1. **Always pin versions in production**: Never use `'latest'` or skip version checks
2. **Use initialization-level config**: Centralize version management for maintainability
3. **Document version choices**: Comment why specific versions are used
4. **Test version updates**: Validate in dev before deploying to production
5. **Monitor after updates**: Watch for errors after version changes
6. **Keep versions consistent**: Use same version across environments when possible
7. **Version control your config**: Track toolkit versions in your repository

## Common Patterns

### Environment-based version config

```typescript
const toolkitVersions = {
  development: {
    github: '12082025_00',
    slack: '10082025_01',
  },
  production: {
    github: '10082025_00', // Older stable version
    slack: '08082025_00',
  }
};

const composio = new Composio({
  toolkitVersions: toolkitVersions[process.env.NODE_ENV]
});
```

### Override version for specific execution

```typescript
// Use global config version by default
const composio = new Composio({
  toolkitVersions: { github: '12082025_00' }
});

// Override for specific execution
const result = await composio.tools.execute('GITHUB_GET_ISSUES', {
  userId: 'default',
  arguments: { owner: 'composio', repo: 'sdk' },
  version: '15082025_00', // Override global version
});
```

### Version validation helper

```typescript
function validateToolVersion(version: string): boolean {
  // Check format: DDMMYYYY_XX
  const versionRegex = /^\d{8}_\d{2}$/;
  return versionRegex.test(version);
}

const version = '12082025_00';
if (!validateToolVersion(version)) {
  throw new Error('Invalid version format');
}
```
