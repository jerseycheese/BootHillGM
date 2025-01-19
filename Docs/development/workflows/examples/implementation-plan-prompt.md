---
title: Implementation Planning Prompt
aliases: [Planning Phase]
tags: [planning, implementation, workflow, prompt]
created: 2025-01-13
updated: 2025-01-13
---

# Implementation Planning Prompt

## Quick Use Prompt
```markdown
Help me create a detailed technical specification for implementing this task. Here's the task analysis:

[PASTE TASK ANALYSIS HERE]

Please create a complete technical specification that includes:
1. Detailed technical design and data flow
2. Specific files to modify with exact changes
3. Complete interface definitions
4. Comprehensive test plan
5. Step-by-step migration plan with rollback procedures

Use this format:

IMPLEMENTATION SPECIFICATION
Component: [name]
Issue: [reference]

TECHNICAL DESIGN
Data Flow:
- [Data flow point 1]
- [Data flow point 2]

Core Changes:
1. [Change Area 1]
   - Location: [file]
   - Details: [specifics]
   
INTERFACES
[Interface definitions]

TEST PLAN
1. Unit Tests
```

## Purpose
Transform high-level task analysis into concrete, actionable technical specifications that can be handed off for implementation.

## Input Requirements
1. Completed task analysis document
2. Project technical standards
3. Current codebase architecture
4. Coding patterns and practices

## Planning Process

### 1. Technical Design
- Map complete data flow
- Identify all affected components
- Define interface changes
- Plan state management

### 2. Interface Definition
- Create/update TypeScript interfaces
- Define function signatures
- Document type constraints
- Specify error types

### 3. Test Strategy
- Define unit test scenarios
- Plan integration tests
- Identify edge cases
- Error condition testing

### 4. Migration Planning
- Break down implementation steps
- Define rollback procedures
- Consider data migration
- Plan feature flags

## Output Format

```markdown
IMPLEMENTATION SPECIFICATION
Component: [Component Name]
Issue: [Issue Reference]

TECHNICAL DESIGN
Data Flow:
- [Data flow point 1]
- [Data flow point 2]
- [Data flow point n]

Core Changes:
1. [Major Change Area 1]
   - Location: [file path]
   - New Constants: [list]
   - New Types: [list]
   - Changes: [specific changes]
   
2. [Major Change Area 2]
   - Location: [file path]
   - Props/Interface changes
   - State changes
   
3. [Major Change Area n]
   - Location: [file path]
   - Integration points
   - State management

INTERFACES
```typescript
// New or modified interfaces
interface Example {
  property: type;
}
```

TEST PLAN
1. Unit Tests:
   - [Test scenario 1]
   - [Test scenario 2]

```

## Guidelines

### Technical Precision
- Use exact file paths
- Define complete interfaces
- Specify exact function signatures
- Include type definitions

### Completeness
- Cover all affected components
- Define all new interfaces
- Include error handling
- Specify state management

### Testing Coverage
- Define unit test scenarios
- Specify integration points
- Error condition testing

## Example

```markdown
IMPLEMENTATION SPECIFICATION
Component: AuthenticationManager
Issue: #45 Add User Authentication

TECHNICAL DESIGN
Data Flow:
- User initiates OAuth flow
- System redirects to provider
- Provider returns auth token
- System validates token
- User session created
- State persisted

Core Changes:
1. Authentication Service
   - Location: src/services/auth.ts
   - New Constants:
     OAUTH_ENDPOINTS
     TOKEN_STORAGE_KEY
   - New Types:
     OAuthConfig
     TokenResponse
     UserSession
   - Changes:
     - Add OAuth initialization
     - Add token management
     - Add session handling
   
2. User Context
   - Location: src/contexts/UserContext.tsx
   - Add auth state
   - Add login/logout actions
   - Update provider wrapper

INTERFACES
```typescript
interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface UserSession {
  user: User;
  token: TokenResponse;
  lastActive: Date;
}
```

TEST PLAN
1. Unit Tests:
   - OAuth configuration validation
   - Token parsing and validation
   - Session management
   - Error handling
```